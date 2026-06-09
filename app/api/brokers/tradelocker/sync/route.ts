import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

function getTLBase(environment?: string | null): string {
  return environment === "demo"
    ? "https://demo.tradelocker.com/backend-api"
    : "https://live.tradelocker.com/backend-api";
}

export const maxDuration = 30;

// ── Types ─────────────────────────────────────────────────────────────────

interface TLOrder {
  id?:           string;
  orderId?:      string;
  symbol?:       string;
  instrument?:   string;
  side?:         string;
  qty?:          number;
  quantity?:     number;
  price?:        number;
  openPrice?:    number;
  entryPrice?:   number;
  filledPrice?:  number;
  closePrice?:   number;
  exitPrice?:    number;
  profitLoss?:   number;
  profit?:       number;
  pnl?:          number;
  commission?:   number;
  swap?:         number;
  status?:       string;
  state?:        string;
  openedAt?:     string;
  closedAt?:     string;
  openTime?:     string;
  closeTime?:    string;
  doneTime?:     string;
  updatedAt?:    string;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function extractError(rawText: string): string {
  try {
    const p = JSON.parse(rawText);
    return p.message ?? p.error ?? p.detail ?? p.errorMessage ?? rawText;
  } catch {
    return rawText;
  }
}

function isClosedOrder(o: TLOrder): boolean {
  const s = (o.status ?? o.state ?? "").toLowerCase();
  return ["filled", "closed", "done", "completed"].some(k => s.includes(k));
}

function mapOrder(o: TLOrder, userId: string): Record<string, unknown> | null {
  const closedAt = o.closedAt ?? o.closeTime ?? o.doneTime ?? null;
  if (!closedAt) return null;

  const symbol = (o.symbol ?? o.instrument ?? "").toUpperCase();
  if (!symbol) return null;

  const side      = (o.side ?? "").toLowerCase();
  const direction = side === "sell" ? "short" : "long";

  const rawPnl     = o.profitLoss ?? o.profit ?? o.pnl ?? null;
  const commission = o.commission ?? 0;
  const swap       = o.swap       ?? 0;
  const pnl        = rawPnl != null
    ? Math.round((rawPnl + commission + swap) * 100) / 100
    : null;

  return {
    user_id:       userId,
    symbol,
    direction,
    entry_price:   o.openPrice  ?? o.entryPrice  ?? o.price      ?? null,
    exit_price:    o.closePrice ?? o.exitPrice   ?? o.filledPrice ?? null,
    pnl,
    volume:        o.qty        ?? o.quantity    ?? null,
    closed_at:     closedAt,
    source:        "tradelocker",
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
    console.log("[tradelocker/sync] refresh:", refreshRes.status, refreshText.slice(0, 300));

    if (refreshRes.ok) {
      const parsed = JSON.parse(refreshText);
      accessToken  = parsed.accessToken  ?? parsed.access_token  ?? accessToken;
      refreshToken = parsed.refreshToken ?? parsed.refresh_token ?? refreshToken;
    } else {
      // If refresh fails, try the stored access token as-is — it may still be valid
      console.warn("[tradelocker/sync] token refresh failed:", extractError(refreshText));
    }
  } catch (err) {
    console.warn("[tradelocker/sync] token refresh error (continuing with stored token):", err);
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
    console.log("[tradelocker/sync] all-accounts:", accRes.status, accText.slice(0, 400));

    if (accRes.ok) {
      const b        = JSON.parse(accText);
      const accounts = Array.isArray(b) ? b : (b.accounts ?? b.d?.d ?? []);
      const first    = accounts[0];
      if (first) {
        tlAccountId = String(first.id ?? first.accountId ?? tlAccountId);
        accNum      = String(first.accNum ?? first.accountNumber ?? first.login ?? accNum);
        if (first.balance != null) {
          balance = `$${Number(first.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
        }
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

  // ── 4. Determine sync window (watermark) ──────────────────────────────────
  const { data: latestTrade } = await supabase
    .from("trades")
    .select("closed_at")
    .eq("user_id", user.id)
    .eq("source", "tradelocker")
    .order("closed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const syncFrom = latestTrade?.closed_at
    ? new Date(new Date(latestTrade.closed_at).getTime() - 5 * 60 * 1000)
    : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  // ── 5. Fetch orders ───────────────────────────────────────────────────────
  let inserted = 0;

  if (tlAccountId) {
    const ordersUrl = `${TL_BASE}/trade/accounts/${tlAccountId}/ordersHistory`;
    console.log("[tradelocker/sync] GET", ordersUrl, "accNum:", accNum);
    try {
      const ordRes  = await fetch(ordersUrl, {
        headers: { ...authHeader, accNum },
      });
      const ordText = await ordRes.text();
      console.log("[tradelocker/sync] ordersHistory:", ordRes.status, ordText.slice(0, 400));

      if (ordRes.ok) {
        const b      = JSON.parse(ordText);
        const orders: TLOrder[] = Array.isArray(b) ? b : (b.orders ?? b.data ?? b.d?.d ?? b.history ?? []);

        const tradeRecords = orders
          .filter(isClosedOrder)
          .filter(o => {
            const t = o.closedAt ?? o.closeTime ?? o.doneTime;
            return t ? new Date(t) >= syncFrom : false;
          })
          .map(o => mapOrder(o, user.id))
          .filter((r): r is Record<string, unknown> => r !== null);

        console.log("[tradelocker/sync] mapping", tradeRecords.length, "closed trades");

        if (tradeRecords.length > 0) {
          const windowStart = syncFrom.toISOString();
          const windowEnd   = new Date().toISOString();

          // Delete unannotated TL trades in the sync window before re-inserting
          await supabase
            .from("trades")
            .delete()
            .eq("user_id", user.id)
            .eq("source", "tradelocker")
            .gte("closed_at", windowStart)
            .lte("closed_at", windowEnd)
            .is("notes", null)
            .is("emotion", null)
            .is("grade", null);

          const { error: insertErr } = await supabase.from("trades").insert(tradeRecords);
          if (insertErr) {
            console.error("[tradelocker/sync] insert error:", insertErr.message);
            return NextResponse.json({ error: insertErr.message }, { status: 500 });
          }
          inserted = tradeRecords.length;
        }
      } else {
        console.warn("[tradelocker/sync] orders fetch failed:", extractError(ordText));
      }
    } catch (err) {
      console.warn("[tradelocker/sync] orders fetch error:", err);
    }
  }

  // ── 6. Count total TL trades ──────────────────────────────────────────────
  const { count: tradesCount } = await supabase
    .from("trades")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("source", "tradelocker");

  // ── 7. Update broker_connections ──────────────────────────────────────────
  const updatePayload: Record<string, unknown> = {
    last_sync:     new Date().toISOString(),
    status:        "connected",
    trades_count:  tradesCount ?? 0,
    access_token:  accessToken,
    refresh_token: refreshToken,
  };
  if (balance)     updatePayload.balance      = balance;
  if (tlAccountId) updatePayload.account_id   = tlAccountId;
  if (accNum)      updatePayload.account_num  = accNum;

  await supabase
    .from("broker_connections")
    .update(updatePayload)
    .eq("id", connectionId);

  console.log(`[tradelocker/sync] done — balance: ${balance}, imported: ${inserted}`);

  return NextResponse.json({
    success:        true,
    balance:        balance ?? null,
    tradesImported: inserted,
    tradesTotal:    tradesCount ?? 0,
  });
}
