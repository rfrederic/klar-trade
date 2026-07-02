import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const maxDuration = 60;

function getTLBase(environment?: string | null): string {
  return environment === "demo"
    ? "https://demo.tradelocker.com/backend-api"
    : "https://live.tradelocker.com/backend-api";
}

interface TLOrder {
  id?:           string;
  symbol?:       string;
  instrument?:   string;
  side?:         string;
  qty?:          number;
  quantity?:     number;
  openPrice?:    number;
  entryPrice?:   number;
  price?:        number;
  filledPrice?:  number;
  closePrice?:   number;
  exitPrice?:    number;
  profitLoss?:   number;
  profit?:       number;
  pnl?:          number;
  commission?:   number;
  swap?:         number;
  closedAt?:     string;
  closeTime?:    string;
  doneTime?:     string;
}

function mapOrder(o: TLOrder, userId: string): Record<string, unknown> | null {
  const closedAt = o.closedAt ?? o.closeTime ?? o.doneTime ?? null;
  if (!closedAt) return null;
  const symbol = (o.symbol ?? o.instrument ?? "").toUpperCase();
  if (!symbol) return null;
  const direction = (o.side ?? "").toLowerCase() === "sell" ? "short" : "long";
  const rawPnl    = o.profitLoss ?? o.profit ?? o.pnl ?? null;
  const pnl       = rawPnl != null
    ? Math.round((rawPnl + (o.commission ?? 0) + (o.swap ?? 0)) * 100) / 100
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

async function syncConnection(
  supabase: ReturnType<typeof createServiceClient>,
  conn: Record<string, unknown>
): Promise<{ connectionId: string; imported: number; error?: string }> {
  const connectionId = conn.id as string;
  const BASE         = getTLBase(conn.environment as string | null);
  const userId       = conn.user_id as string;

  let accessToken  = conn.access_token  as string;
  let refreshToken = conn.refresh_token as string;
  let accNum       = (conn.account_num  as string) ?? (conn.account_id as string);
  let tlAccountId  = conn.account_id    as string;

  // ── 1. Refresh token ────────────────────────────────────────────────────────
  try {
    const refreshRes  = await fetch(`${BASE}/auth/jwt/refresh`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refreshToken }),
    });
    if (refreshRes.ok) {
      const data   = await refreshRes.json();
      accessToken  = data.accessToken  ?? data.access_token  ?? accessToken;
      refreshToken = data.refreshToken ?? data.refresh_token ?? refreshToken;
    }
  } catch {
    // Continue with stored access token
  }

  const authHeader = { Authorization: `Bearer ${accessToken}` };

  // ── 2. Refresh account info + balance ───────────────────────────────────────
  try {
    const accRes = await fetch(`${BASE}/auth/jwt/all-accounts`, { headers: authHeader });
    if (accRes.ok) {
      const body     = await accRes.json();
      const accounts = Array.isArray(body) ? body : (body.accounts ?? body.d?.d ?? []);
      const first    = accounts[0];
      if (first) {
        tlAccountId = String(first.id ?? first.accountId ?? tlAccountId);
        accNum      = String(first.accNum ?? first.accountNumber ?? first.login ?? accNum);
        const bal   = first.balance != null
          ? `$${Number(first.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
          : null;
        if (bal) {
          await supabase
            .from("broker_connections")
            .update({ balance: bal, account_id: tlAccountId, account_num: accNum })
            .eq("id", connectionId);
        }
      }
    } else if (accRes.status === 401) {
      await supabase
        .from("broker_connections")
        .update({ status: "error" })
        .eq("id", connectionId);
      return { connectionId, imported: 0, error: "Token expired" };
    }
  } catch (err) {
    return { connectionId, imported: 0, error: String(err) };
  }

  // ── 3. Determine watermark ──────────────────────────────────────────────────
  const { data: latestTrade } = await supabase
    .from("trades")
    .select("closed_at")
    .eq("user_id", userId)
    .eq("source", "tradelocker")
    .order("closed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const syncFrom = latestTrade?.closed_at
    ? new Date(new Date(latestTrade.closed_at).getTime() - 5 * 60 * 1000)
    : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  // ── 4. Fetch ordersHistory ──────────────────────────────────────────────────
  let imported = 0;
  try {
    const histRes = await fetch(`${BASE}/trade/accounts/${tlAccountId}/ordersHistory`, {
      headers: { ...authHeader, accNum },
    });

    if (histRes.ok) {
      const body = await histRes.json();
      const raw: TLOrder[] = Array.isArray(body)
        ? body
        : (body.orders ?? body.data ?? body.d?.d ?? body.history ?? []);

      const tradeRecords = raw
        .filter(o => {
          const t = o.closedAt ?? o.closeTime ?? o.doneTime;
          return t ? new Date(t) >= syncFrom : false;
        })
        .map(o => mapOrder(o, userId))
        .filter((r): r is Record<string, unknown> => r !== null);

      if (tradeRecords.length > 0) {
        const windowStart = syncFrom.toISOString();
        const windowEnd   = new Date().toISOString();
        await supabase
          .from("trades")
          .delete()
          .eq("user_id", userId)
          .eq("source", "tradelocker")
          .gte("closed_at", windowStart)
          .lte("closed_at", windowEnd)
          .is("notes", null)
          .is("emotion", null)
          .is("grade", null);

        const { error: insertErr } = await supabase.from("trades").insert(tradeRecords);
        if (!insertErr) imported = tradeRecords.length;
      }
    }
  } catch (err) {
    return { connectionId, imported: 0, error: String(err) };
  }

  // ── 5. Update connection metadata ───────────────────────────────────────────
  const { count } = await supabase
    .from("trades")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("source", "tradelocker");

  await supabase
    .from("broker_connections")
    .update({
      last_sync:     new Date().toISOString(),
      status:        "connected",
      trades_count:  count ?? 0,
      access_token:  accessToken,
      refresh_token: refreshToken,
    })
    .eq("id", connectionId);

  return { connectionId, imported };
}

// ── Cron handler ─────────────────────────────────────────────────────────────
// Secured by CRON_SECRET — set this in Vercel env vars and add to vercel.json

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: connections, error } = await supabase
    .from("broker_connections")
    .select("id, user_id, account_id, account_num, access_token, refresh_token, server, environment")
    .eq("broker", "tradelocker")
    .eq("status", "connected");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!connections || connections.length === 0) {
    return NextResponse.json({ synced: 0, results: [] });
  }

  console.log(`[tradelocker/cron] syncing ${connections.length} connections`);

  const results = await Promise.allSettled(
    connections.map(conn => syncConnection(supabase, conn as Record<string, unknown>))
  );

  const summary = results.map(r =>
    r.status === "fulfilled" ? r.value : { error: String(r.reason) }
  );

  const totalImported = summary.reduce(
    (acc, r) => acc + ((r as { imported?: number }).imported ?? 0),
    0
  );

  console.log(`[tradelocker/cron] done — ${totalImported} trades imported across ${connections.length} connections`);

  return NextResponse.json({ synced: connections.length, imported: totalImported, results: summary });
}
