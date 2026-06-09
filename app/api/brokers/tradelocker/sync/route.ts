import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

function getTLBase(environment?: string | null): string {
  return environment === "demo"
    ? "https://demo.tradelocker.com/backend-api"
    : "https://live.tradelocker.com/backend-api";
}

export const maxDuration = 30;

// ── Helpers ───────────────────────────────────────────────────────────────

function extractError(rawText: string): string {
  try {
    const p = JSON.parse(rawText);
    return p.message ?? p.error ?? p.detail ?? p.errorMessage ?? rawText;
  } catch {
    return rawText;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrder(o: Record<string, any>, userId: string): Record<string, unknown> | null {
  // Probe every plausible closed-at field
  const closedAt =
    o.closedAt   ?? o.closeTime  ?? o.doneTime   ??
    o.closed_at  ?? o.close_time ?? o.done_time  ??
    o.closeDate  ?? o.finishTime ?? o.endTime     ?? null;
  if (!closedAt) return null;

  // Probe every plausible symbol field
  const symbol = (
    o.symbol      ?? o.instrument  ?? o.tradingSymbol ??
    o.symbolName  ?? o.name        ?? o.ticker        ?? ""
  ).toString().toUpperCase();
  if (!symbol) return null;

  const side      = (o.side ?? o.direction ?? o.type ?? "").toString().toLowerCase();
  const direction = (side === "sell" || side === "short") ? "short" : "long";

  const rawPnl     = o.profitLoss ?? o.profit ?? o.pnl ?? o.pl ?? o.realizedPnl ?? o.realizedPl ?? null;
  const commission = o.commission ?? o.fee ?? o.fees ?? 0;
  const swap       = o.swap ?? o.financing ?? 0;
  const pnl        = rawPnl != null
    ? Math.round((Number(rawPnl) + Number(commission) + Number(swap)) * 100) / 100
    : null;

  return {
    user_id:       userId,
    symbol,
    direction,
    entry_price:   o.openPrice   ?? o.entryPrice  ?? o.openRate   ?? o.price       ?? null,
    exit_price:    o.closePrice  ?? o.exitPrice   ?? o.closeRate  ?? o.filledPrice  ?? null,
    pnl,
    volume:        o.qty         ?? o.quantity    ?? o.volume     ?? o.size         ?? null,
    closed_at:     closedAt,
    source:        "tradelocker",
    followed_plan: true,
  };
}

// ── Route ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const debugMode = req.nextUrl.searchParams.get("debug") === "true";
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const connectionId: string | undefined = body.connectionId;
  if (!connectionId) {
    return NextResponse.json({ error: "connectionId is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // ── 1. Load connection ────────────────────────────────────────────────────
  const { data: conn, error: connErr } = await supabase
    .from("broker_connections")
    .select("id, account_id, account_num, access_token, refresh_token, server, environment")
    .eq("id", connectionId)
    .eq("user_id", user.id)
    .eq("broker", "tradelocker")
    .single();

  if (connErr || !conn) {
    return NextResponse.json({ error: "TradeLocker connection not found" }, { status: 404 });
  }

  if (!conn.refresh_token) {
    return NextResponse.json(
      { error: "No refresh token stored — please reconnect your TradeLocker account" },
      { status: 400 }
    );
  }

  console.log("[tradelocker/sync] conn:", {
    id:          conn.id,
    account_id:  conn.account_id,
    account_num: conn.account_num,
    server:      conn.server,
    environment: conn.environment,
  });

  // ── 2. Refresh JWT token ──────────────────────────────────────────────────
  const TL_BASE    = getTLBase(conn.environment as string | null);
  let accessToken  = conn.access_token  as string;
  let refreshToken = conn.refresh_token as string;

  const refreshUrl = `${TL_BASE}/auth/jwt/refresh`;
  console.log("[tradelocker/sync] POST", refreshUrl);
  try {
    const refreshRes = await fetch(refreshUrl, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refreshToken }),
    });
    const refreshText = await refreshRes.text();
    console.log("[tradelocker/sync] refresh status:", refreshRes.status, refreshText.slice(0, 300));

    if (refreshRes.ok) {
      const parsed = JSON.parse(refreshText);
      accessToken  = parsed.accessToken  ?? parsed.access_token  ?? accessToken;
      refreshToken = parsed.refreshToken ?? parsed.refresh_token ?? refreshToken;
      console.log("[tradelocker/sync] token refreshed OK");
    } else {
      console.warn("[tradelocker/sync] token refresh failed — continuing with stored token:", extractError(refreshText));
    }
  } catch (err) {
    console.warn("[tradelocker/sync] token refresh error (continuing):", err);
  }

  const authHeader = { Authorization: `Bearer ${accessToken}` };

  // ── 3. Fetch accounts → latest balance + accNum ──────────────────────────
  let balance:     string | null = null;
  let tlAccountId: string        = (conn.account_id  as string) ?? "";
  let accNum:      string        = (conn.account_num  as string) ?? tlAccountId;

  const accountsUrl = `${TL_BASE}/auth/jwt/all-accounts`;
  console.log("[tradelocker/sync] GET", accountsUrl);
  try {
    const accRes  = await fetch(accountsUrl, { headers: authHeader });
    const accText = await accRes.text();
    console.log("[tradelocker/sync] all-accounts status:", accRes.status);
    console.log("[tradelocker/sync] all-accounts body:", accText.slice(0, 800));

    if (accRes.ok) {
      const b        = JSON.parse(accText);
      const accounts = Array.isArray(b) ? b : (b.accounts ?? b.d?.d ?? []);
      console.log("[tradelocker/sync] accounts found:", accounts.length);
      const first    = accounts[0];
      if (first) {
        console.log("[tradelocker/sync] first account keys:", Object.keys(first));
        console.log("[tradelocker/sync] first account:", JSON.stringify(first));
        tlAccountId = String(first.id ?? first.accountId ?? tlAccountId);
        accNum      = String(first.accNum ?? first.accountNumber ?? first.login ?? accNum);
        if (first.balance != null) {
          balance = `$${Number(first.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
        }
        console.log("[tradelocker/sync] resolved accountId:", tlAccountId, "accNum:", accNum, "balance:", balance);
      }
    } else if (accRes.status === 401) {
      return NextResponse.json(
        { error: "Session expired — please reconnect your TradeLocker account" },
        { status: 401 }
      );
    }
  } catch (err) {
    console.warn("[tradelocker/sync] all-accounts fetch failed (non-fatal):", err);
  }

  // ── 4. Determine sync window ──────────────────────────────────────────────
  const { data: latestTrade } = await supabase
    .from("trades")
    .select("closed_at")
    .eq("user_id", user.id)
    .eq("source", "tradelocker")
    .order("closed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // In debug mode fetch ALL history; otherwise watermark from last trade
  const syncFrom = (debugMode || !latestTrade?.closed_at)
    ? new Date(0)
    : new Date(new Date(latestTrade.closed_at).getTime() - 5 * 60 * 1000);

  console.log("[tradelocker/sync] syncFrom:", syncFrom.toISOString(), debugMode ? "(debug — all history)" : "");

  // ── 5. Fetch ordersHistory ────────────────────────────────────────────────
  let inserted = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debugInfo: Record<string, any> = {};

  if (!tlAccountId) {
    console.warn("[tradelocker/sync] no accountId resolved — skipping orders fetch");
  } else {
    const ordersUrl = `${TL_BASE}/trade/accounts/${tlAccountId}/ordersHistory`;
    console.log("[tradelocker/sync] GET", ordersUrl);
    console.log("[tradelocker/sync] headers: Authorization=Bearer [token], accNum=", accNum);

    try {
      const ordRes  = await fetch(ordersUrl, {
        headers: { ...authHeader, accNum },
      });
      const ordText = await ordRes.text();

      console.log("[tradelocker/sync] ordersHistory status:", ordRes.status);
      // Log the FULL response (up to 3000 chars) so we can see the shape
      console.log("[tradelocker/sync] ordersHistory raw (3000 chars):", ordText.slice(0, 3000));

      if (debugMode) {
        debugInfo.ordersHistoryStatus  = ordRes.status;
        debugInfo.ordersHistoryRaw     = ordText.slice(0, 5000);
      }

      if (ordRes.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const b: any = JSON.parse(ordText);

        // Log top-level shape
        console.log("[tradelocker/sync] response typeof:", typeof b, Array.isArray(b) ? "(array)" : "(object)");
        if (!Array.isArray(b)) {
          console.log("[tradelocker/sync] top-level keys:", Object.keys(b));
          // Log nested keys one level deep
          for (const k of Object.keys(b)) {
            const v = b[k];
            if (Array.isArray(v)) console.log(`[tradelocker/sync]   b.${k} is array[${v.length}]`);
            else if (v && typeof v === "object") console.log(`[tradelocker/sync]   b.${k} keys:`, Object.keys(v));
          }
        }

        // Try every plausible wrapper path
        const rawOrders =
          Array.isArray(b)             ? b                    :
          Array.isArray(b.d?.d)        ? b.d.d                :
          Array.isArray(b.orders)      ? b.orders             :
          Array.isArray(b.data)        ? b.data               :
          Array.isArray(b.history)     ? b.history            :
          Array.isArray(b.items)       ? b.items              :
          Array.isArray(b.trades)      ? b.trades             :
          Array.isArray(b.result)      ? b.result             :
          Array.isArray(b.results)     ? b.results            :
          Array.isArray(b.d)           ? b.d                  : [];

        console.log("[tradelocker/sync] raw orders array length:", rawOrders.length);

        if (rawOrders.length > 0) {
          console.log("[tradelocker/sync] FIRST ORDER (full):", JSON.stringify(rawOrders[0], null, 2));
          console.log("[tradelocker/sync] first order keys:", Object.keys(rawOrders[0]));

          if (rawOrders.length > 1) {
            console.log("[tradelocker/sync] SECOND ORDER (full):", JSON.stringify(rawOrders[1], null, 2));
          }

          if (debugMode) {
            debugInfo.rawOrdersLength = rawOrders.length;
            debugInfo.firstOrderKeys  = Object.keys(rawOrders[0]);
            debugInfo.firstOrder      = rawOrders[0];
            debugInfo.secondOrder     = rawOrders[1] ?? null;
          }

          // Log status/state values to check the closed-order field
          const statusSample = rawOrders.slice(0, 5).map((o: Record<string, unknown>) => ({
            status:   o.status,
            state:    o.state,
            type:     o.type,
            side:     o.side,
            closedAt: o.closedAt ?? o.closeTime ?? o.doneTime ?? o.closed_at ?? o.close_time,
            symbol:   o.symbol   ?? o.instrument ?? o.tradingSymbol,
          }));
          console.log("[tradelocker/sync] status/field sample (first 5):", JSON.stringify(statusSample, null, 2));
          if (debugMode) debugInfo.statusSample = statusSample;
        } else {
          console.warn("[tradelocker/sync] ordersHistory returned 0 orders — array is empty");
          if (debugMode) debugInfo.rawOrdersLength = 0;
        }

        // Filter: only orders with a resolvable closedAt (ordersHistory = already closed, but be safe)
        const withCloseDate = rawOrders.filter((o: Record<string, unknown>) =>
          o.closedAt   ?? o.closeTime  ?? o.doneTime   ??
          o.closed_at  ?? o.close_time ?? o.done_time  ??
          o.closeDate  ?? o.finishTime ?? o.endTime
        );
        console.log("[tradelocker/sync] orders with close date:", withCloseDate.length, "of", rawOrders.length);

        const afterWatermark = withCloseDate.filter((o: Record<string, unknown>) => {
          const t =
            o.closedAt   ?? o.closeTime  ?? o.doneTime   ??
            o.closed_at  ?? o.close_time ?? o.done_time  ??
            o.closeDate  ?? o.finishTime ?? o.endTime;
          return t ? new Date(t as string) >= syncFrom : false;
        });
        console.log("[tradelocker/sync] after watermark filter:", afterWatermark.length, "(syncFrom:", syncFrom.toISOString(), ")");

        const tradeRecords = afterWatermark
          .map((o: Record<string, unknown>) => mapOrder(o as Record<string, unknown>, user.id))
          .filter((r: Record<string, unknown> | null): r is Record<string, unknown> => r !== null);

        console.log("[tradelocker/sync] mappable trade records:", tradeRecords.length);
        if (tradeRecords.length > 0) {
          console.log("[tradelocker/sync] sample mapped record:", JSON.stringify(tradeRecords[0]));
        }

        if (debugMode) {
          debugInfo.withCloseDate    = withCloseDate.length;
          debugInfo.afterWatermark   = afterWatermark.length;
          debugInfo.mappableRecords  = tradeRecords.length;
          debugInfo.sampleMapped     = tradeRecords[0] ?? null;
        }

        // Only persist when not in debug mode (debug is read-only)
        if (!debugMode && tradeRecords.length > 0) {
          const windowStart = syncFrom.toISOString();
          const windowEnd   = new Date().toISOString();

          await supabase
            .from("trades")
            .delete()
            .eq("user_id", user.id)
            .eq("source", "tradelocker")
            .gte("closed_at", windowStart)
            .lte("closed_at", windowEnd)
            .is("notes",   null)
            .is("emotion", null)
            .is("grade",   null);

          const { error: insertErr } = await supabase.from("trades").insert(tradeRecords);
          if (insertErr) {
            console.error("[tradelocker/sync] insert error:", insertErr.message);
            return NextResponse.json({ error: insertErr.message }, { status: 500 });
          }
          inserted = tradeRecords.length;
        }
      } else {
        const errMsg = extractError(ordText);
        console.warn("[tradelocker/sync] ordersHistory failed:", ordRes.status, errMsg);
        if (debugMode) debugInfo.ordersHistoryError = errMsg;
      }
    } catch (err) {
      console.warn("[tradelocker/sync] ordersHistory fetch error:", err);
      if (debugMode) debugInfo.ordersHistoryException = String(err);
    }
  }

  // ── 6. Count total TL trades ──────────────────────────────────────────────
  const { count: tradesCount } = await supabase
    .from("trades")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("source", "tradelocker");

  // ── 7. Update broker_connections (skip in debug mode) ────────────────────
  if (!debugMode) {
    const updatePayload: Record<string, unknown> = {
      last_sync:     new Date().toISOString(),
      status:        "connected",
      trades_count:  tradesCount ?? 0,
      access_token:  accessToken,
      refresh_token: refreshToken,
    };
    if (balance)     updatePayload.balance     = balance;
    if (tlAccountId) updatePayload.account_id  = tlAccountId;
    if (accNum)      updatePayload.account_num = accNum;

    await supabase
      .from("broker_connections")
      .update(updatePayload)
      .eq("id", connectionId);
  }

  console.log(`[tradelocker/sync] done — balance: ${balance}, imported: ${inserted}`);

  return NextResponse.json({
    success:        true,
    balance:        balance ?? null,
    tradesImported: inserted,
    tradesTotal:    tradesCount ?? 0,
    ...(debugMode ? { debug: debugInfo } : {}),
  });
}
