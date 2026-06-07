import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

const CT_BASE    = "https://openapi.ctrader.com";
const CT_TOKEN   = `${CT_BASE}/apps/token`;
const CT_ACCOUNTS = `${CT_BASE}/trading/accounts`;

export const maxDuration = 30;

// ── Types ─────────────────────────────────────────────────────────────────

interface CTDeal {
  dealId?:              string | number;
  positionId?:          string | number;
  symbolId?:            number;
  symbolName?:          string;
  symbol?:              string;
  tradeSide?:           string;
  filledVolume?:        number;
  volume?:              number;
  executionPrice?:      number;
  price?:               number;
  createTimestamp?:     number;
  closeTimestamp?:      number;
  timestamp?:           number;
  closePositionDetail?: {
    entryPrice?:       number;
    grossProfit?:      number;
    profit?:           number;
    commission?:       number;
    swap?:             number;
    balance?:          number;
    closedVolume?:     number;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────

function extractError(raw: string): string {
  try {
    const p = JSON.parse(raw);
    return p.message ?? p.error ?? p.errorMessage ?? p.description ?? raw;
  } catch { return raw; }
}

function mapDeal(deal: CTDeal, userId: string): Record<string, unknown> | null {
  const close = deal.closePositionDetail;
  if (!close) return null;

  const symbol = (deal.symbolName ?? deal.symbol ?? String(deal.symbolId ?? "")).toUpperCase();
  if (!symbol) return null;

  const side      = (deal.tradeSide ?? "").toUpperCase();
  const direction = side === "SELL" ? "long" : "short";

  const grossProfit = close.grossProfit ?? close.profit ?? 0;
  const commission  = close.commission  ?? 0;
  const swap        = close.swap        ?? 0;
  const pnl         = Math.round((grossProfit + commission + swap) * 100) / 100;

  const rawVolume = deal.filledVolume ?? deal.volume ?? close.closedVolume ?? null;
  const volume    = rawVolume != null ? rawVolume / 100 : null;

  const tsMs     = deal.closeTimestamp ?? deal.createTimestamp ?? deal.timestamp ?? null;
  const closedAt = tsMs ? new Date(tsMs).toISOString() : null;
  if (!closedAt) return null;

  return {
    user_id:       userId,
    symbol,
    direction,
    entry_price:   close.entryPrice            ?? null,
    exit_price:    deal.executionPrice ?? deal.price ?? null,
    pnl,
    volume,
    closed_at:     closedAt,
    source:        "ctrader",
    followed_plan: true,
  };
}

// ── Route ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const connectionId: string | undefined = body.connectionId;
  if (!connectionId) return NextResponse.json({ error: "connectionId is required" }, { status: 400 });

  const supabase = createServiceClient();

  // ── 1. Load connection ────────────────────────────────────────────────────
  const { data: conn, error: connErr } = await supabase
    .from("broker_connections")
    .select("id, user_id, account_id, access_token, refresh_token, meta_account_id")
    .eq("id", connectionId)
    .eq("user_id", user.id)
    .eq("broker", "ctrader")
    .single();

  if (connErr || !conn) {
    return NextResponse.json({ error: "cTrader connection not found" }, { status: 404 });
  }

  // Decode stored client credentials
  let clientId     = "";
  let clientSecret = "";
  try {
    const creds  = JSON.parse(conn.meta_account_id as string ?? "{}");
    clientId     = creds.clientId     ?? "";
    clientSecret = creds.clientSecret ?? "";
  } catch { /* credentials unavailable */ }

  // ── 2. Refresh access token ───────────────────────────────────────────────
  let accessToken  = conn.access_token  as string ?? "";
  let refreshToken = conn.refresh_token as string ?? "";

  if (refreshToken && clientId && clientSecret) {
    console.log("[ctrader/sync] refreshing token");
    try {
      const refreshRes = await fetch(CT_TOKEN, {
        method:  "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:    new URLSearchParams({
          refresh_token:  refreshToken,
          client_id:      clientId,
          client_secret:  clientSecret,
          grant_type:     "refresh_token",
        }),
      });
      const refreshText = await refreshRes.text();
      console.log("[ctrader/sync] refresh:", refreshRes.status, refreshText.slice(0, 200));

      if (refreshRes.ok) {
        const parsed = JSON.parse(refreshText);
        accessToken  = parsed.accessToken  ?? parsed.access_token  ?? accessToken;
        refreshToken = parsed.refreshToken ?? parsed.refresh_token ?? refreshToken;
      } else {
        console.warn("[ctrader/sync] token refresh failed:", extractError(refreshText));
      }
    } catch (err) {
      console.warn("[ctrader/sync] token refresh error (using stored token):", err);
    }
  }

  const authHeader = { Authorization: `Bearer ${accessToken}` };

  // ── 3. Fetch accounts → latest balance ───────────────────────────────────
  let balance     = "";
  let ctAccountId = conn.account_id as string ?? "";

  console.log("[ctrader/sync] GET", CT_ACCOUNTS);
  try {
    const accRes  = await fetch(CT_ACCOUNTS, { headers: authHeader });
    const accText = await accRes.text();
    console.log("[ctrader/sync] accounts:", accRes.status, accText.slice(0, 400));

    if (accRes.ok) {
      const b        = JSON.parse(accText);
      const accounts = Array.isArray(b)
        ? b
        : (b.ctidTraderAccounts ?? b.accounts ?? b.data ?? []);
      const first = accounts[0];
      if (first) {
        ctAccountId = String(first.ctidTraderAccountId ?? first.id ?? first.accountId ?? ctAccountId);
        if (first.balance != null) {
          balance = `$${Number(first.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
        }
      }
    } else if (accRes.status === 401) {
      return NextResponse.json(
        { error: "Session expired — please reconnect your cTrader account" },
        { status: 401 }
      );
    }
  } catch (err) {
    console.warn("[ctrader/sync] accounts fetch failed (non-fatal):", err);
  }

  // ── 4. Determine sync window (watermark) ──────────────────────────────────
  const { data: latestTrade } = await supabase
    .from("trades")
    .select("closed_at")
    .eq("user_id", user.id)
    .eq("source", "ctrader")
    .order("closed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const syncFromMs = latestTrade?.closed_at
    ? new Date(latestTrade.closed_at).getTime() - 5 * 60 * 1000
    : Date.now() - 90 * 24 * 60 * 60 * 1000;

  const syncToMs = Date.now();

  // ── 5. Fetch deals ────────────────────────────────────────────────────────
  let inserted = 0;

  if (ctAccountId) {
    const dealsUrl = `${CT_BASE}/trading/accounts/${ctAccountId}/deals?from=${syncFromMs}&to=${syncToMs}`;
    console.log("[ctrader/sync] GET", dealsUrl);

    try {
      const dealsRes  = await fetch(dealsUrl, { headers: authHeader });
      const dealsText = await dealsRes.text();
      console.log("[ctrader/sync] deals:", dealsRes.status, dealsText.slice(0, 400));

      if (dealsRes.ok) {
        const b     = JSON.parse(dealsText);
        const deals: CTDeal[] = Array.isArray(b)
          ? b
          : (b.deal ?? b.deals ?? b.data ?? []);

        const tradeRecords = deals
          .map(d => mapDeal(d, user.id))
          .filter((r): r is Record<string, unknown> => r !== null);

        console.log("[ctrader/sync] mapping", tradeRecords.length, "closed deals");

        if (tradeRecords.length > 0) {
          const windowStart = new Date(syncFromMs).toISOString();
          const windowEnd   = new Date(syncToMs).toISOString();

          await supabase
            .from("trades")
            .delete()
            .eq("user_id", user.id)
            .eq("source", "ctrader")
            .gte("closed_at", windowStart)
            .lte("closed_at", windowEnd)
            .is("notes", null)
            .is("emotion", null)
            .is("grade", null);

          const { error: insertErr } = await supabase.from("trades").insert(tradeRecords);
          if (insertErr) {
            console.error("[ctrader/sync] insert error:", insertErr.message);
            return NextResponse.json({ error: insertErr.message }, { status: 500 });
          }
          inserted = tradeRecords.length;
        }
      } else {
        console.warn("[ctrader/sync] deals fetch failed:", extractError(dealsText));
      }
    } catch (err) {
      console.warn("[ctrader/sync] deals fetch error:", err);
    }
  }

  // ── 6. Count total cTrader trades ─────────────────────────────────────────
  const { count: tradesCount } = await supabase
    .from("trades")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("source", "ctrader");

  // ── 7. Update connection ──────────────────────────────────────────────────
  const updatePayload: Record<string, unknown> = {
    last_sync:     new Date().toISOString(),
    status:        "connected",
    trades_count:  tradesCount ?? 0,
    access_token:  accessToken,
    refresh_token: refreshToken,
  };
  if (ctAccountId) updatePayload.account_id = ctAccountId;
  if (balance)     updatePayload.balance     = balance;

  await supabase.from("broker_connections").update(updatePayload).eq("id", connectionId);

  console.log(`[ctrader/sync] done — balance: ${balance}, imported: ${inserted}`);
  return NextResponse.json({
    success:        true,
    balance:        balance || null,
    tradesImported: inserted,
    tradesTotal:    tradesCount ?? 0,
  });
}
