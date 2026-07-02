import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { resolveUserTimezone } from "@/lib/timezone-server";
import { startOfLocalDayUtc } from "@/lib/timezone";

const MT_CLIENT    = "https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai";
const MT_PROVISION = "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";

export const dynamic = "force-dynamic";

// ── Types ────────────────────────────────────────────────────────────────────

interface Position {
  id: string; symbol: string; type: string;
  volume: number; openPrice: number; currentPrice: number;
  profit: number; swap: number; openTime: string;
}
interface Order {
  id: string; symbol: string; type: string;
  volume: number; openPrice: number; stopLoss?: number; takeProfit?: number;
}
interface AccountInfo {
  balance: number; equity: number; margin: number; freeMargin: number; currency: string;
}

// ── TradeLocker helpers ───────────────────────────────────────────────────────

function getTLBase(environment?: string | null): string {
  return environment === "demo"
    ? "https://demo.tradelocker.com/backend-api"
    : "https://live.tradelocker.com/backend-api";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTLPosition(p: Record<string, any>, idx: number): Position {
  const side   = (p.side ?? p.direction ?? p.type ?? "").toString().toLowerCase();
  const isLong = side === "buy" || side === "long";

  return {
    id:           String(p.id ?? p.positionId ?? `tl-${idx}`),
    symbol:       (p.tradingInstrumentName ?? p.symbol ?? p.instrument ?? "").toString().toUpperCase(),
    type:         isLong ? "POSITION_TYPE_BUY" : "POSITION_TYPE_SELL",
    volume:       Number(p.qty ?? p.quantity ?? p.volume ?? p.size ?? 0),
    openPrice:    Number(p.openPrice ?? p.openRate ?? p.entryPrice ?? p.price ?? 0),
    currentPrice: Number(p.currentPrice ?? p.bid ?? p.ask ?? p.price ?? 0),
    profit:       Number(p.unrealizedPnl ?? p.pnl ?? p.profit ?? p.floatingPl ?? p.pl ?? 0),
    swap:         Number(p.swap ?? p.financing ?? 0),
    openTime:     String(p.openedAt ?? p.openTime ?? p.createdAt ?? p.created_at ?? new Date().toISOString()),
  };
}

interface TLConnection {
  id: string;
  account_id:    string | null;
  account_num:   string | null;
  access_token:  string | null;
  refresh_token: string | null;
  environment:   string | null;
}

async function fetchTLPositions(conn: TLConnection): Promise<{
  positions:   Position[];
  accountInfo: AccountInfo | null;
}> {
  const BASE         = getTLBase(conn.environment);
  let   accessToken  = conn.access_token  ?? "";
  const refreshToken = conn.refresh_token ?? "";

  // 1. Refresh JWT
  if (refreshToken) {
    try {
      const r = await fetch(`${BASE}/auth/jwt/refresh`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ refreshToken }),
      });
      if (r.ok) {
        const d    = await r.json();
        accessToken = d.accessToken ?? d.access_token ?? accessToken;
      }
    } catch { /* use stored token */ }
  }

  const authHeader: Record<string, string> = { Authorization: `Bearer ${accessToken}` };

  // 2. Resolve accountId + accNum + balance
  let tlAccountId  = conn.account_id  ?? "";
  let accNum       = conn.account_num ?? tlAccountId;
  let accountInfo: AccountInfo | null = null;

  try {
    const r = await fetch(`${BASE}/auth/jwt/all-accounts`, { headers: authHeader });
    if (r.ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const b: any = await r.json();
      const accounts = Array.isArray(b) ? b : (b.accounts ?? b.d?.d ?? []);
      const first    = accounts[0];
      if (first) {
        tlAccountId = String(first.id ?? first.accountId ?? tlAccountId);
        accNum      = String(first.accNum ?? first.accountNumber ?? first.login ?? accNum);
        const bal   = Number(first.balance ?? 0);
        const eq    = Number(first.equity  ?? first.balance ?? 0);
        accountInfo = {
          balance:    bal,
          equity:     eq,
          margin:     Number(first.margin     ?? 0),
          freeMargin: Number(first.freeMargin ?? first.free_margin ?? 0),
          currency:   String(first.currency   ?? "USD"),
        };
      }
    }
  } catch { /* non-fatal */ }

  if (!tlAccountId) return { positions: [], accountInfo };

  // 3. Fetch open positions
  try {
    console.log("[trading/live] TL GET positions accountId:", tlAccountId, "accNum:", accNum);
    const r = await fetch(`${BASE}/trade/accounts/${tlAccountId}/positions`, {
      headers: { ...authHeader, accNum },
    });
    const text = await r.text();
    console.log("[trading/live] TL positions status:", r.status, text.slice(0, 500));

    if (r.ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const b: any = JSON.parse(text);
      const raw: Record<string, unknown>[] = Array.isArray(b)
        ? b
        : (b.positions ?? b.data ?? b.d?.d ?? b.items ?? b.result ?? []);

      console.log("[trading/live] TL raw positions count:", raw.length);
      if (raw.length > 0) {
        console.log("[trading/live] TL first position:", JSON.stringify(raw[0]));
      }

      const positions = raw.map((p, i) => mapTLPosition(p as Record<string, unknown>, i));
      return { positions, accountInfo };
    }
  } catch (err) {
    console.warn("[trading/live] TL positions fetch error:", err);
  }

  return { positions: [], accountInfo };
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const timeZone = await resolveUserTimezone(supabase, user.id, req.nextUrl.searchParams.get("tz"));

  // ── Today's closed trades ─────────────────────────────────────────────────
  const todayStart = startOfLocalDayUtc(timeZone);
  const { data: todayTrades } = await supabase
    .from("trades")
    .select("pnl")
    .eq("user_id", user.id)
    .gte("closed_at", todayStart.toISOString());

  const todayPnl = (todayTrades ?? []).reduce((s, t) => s + (t.pnl ?? 0), 0);

  // ── TradeLocker connections ───────────────────────────────────────────────
  const { data: tlConnections } = await supabase
    .from("broker_connections")
    .select("id, account_id, account_num, access_token, refresh_token, environment")
    .eq("user_id", user.id)
    .eq("broker", "tradelocker")
    .eq("status", "connected");

  let tlPositions:   Position[]       = [];
  let tlAccountInfo: AccountInfo | null = null;

  if (tlConnections && tlConnections.length > 0) {
    const results = await Promise.allSettled(
      (tlConnections as TLConnection[]).map(c => fetchTLPositions(c))
    );
    for (const r of results) {
      if (r.status === "fulfilled") {
        tlPositions = [...tlPositions, ...r.value.positions];
        if (!tlAccountInfo && r.value.accountInfo) tlAccountInfo = r.value.accountInfo;
      }
    }
  }

  // ── MT5 / MetaAPI ─────────────────────────────────────────────────────────
  const token = process.env.METAAPI_TOKEN;

  if (!token) {
    // No MT5 configured — return TradeLocker data only
    return NextResponse.json({
      connected:   tlPositions.length > 0 || !!tlAccountInfo,
      accountInfo: tlAccountInfo,
      positions:   tlPositions,
      orders:      [] as Order[],
      todayPnl,
      todayTrades: todayTrades?.length ?? 0,
    });
  }

  const { data: mt5Conn } = await supabase
    .from("broker_connections")
    .select("meta_account_id")
    .eq("user_id", user.id)
    .eq("broker", "mt5")
    .eq("status", "connected")
    .maybeSingle();

  if (!mt5Conn?.meta_account_id) {
    // No MT5 connection — use TradeLocker only
    return NextResponse.json({
      connected:   tlPositions.length > 0 || !!tlAccountInfo,
      accountInfo: tlAccountInfo,
      positions:   tlPositions,
      orders:      [] as Order[],
      todayPnl,
      todayTrades: todayTrades?.length ?? 0,
    });
  }

  const accountId   = mt5Conn.meta_account_id;
  const mtHeaders   = { "auth-token": token };

  // Deploy + fetch MT5 data
  try {
    await fetch(`${MT_PROVISION}/users/current/accounts/${accountId}/deploy`, { method: "POST", headers: mtHeaders });
  } catch { /* non-fatal */ }

  const [accountRes, positionsRes, ordersRes] = await Promise.allSettled([
    fetch(`${MT_CLIENT}/users/current/accounts/${accountId}/account-information`, { headers: mtHeaders }),
    fetch(`${MT_CLIENT}/users/current/accounts/${accountId}/positions`,           { headers: mtHeaders }),
    fetch(`${MT_CLIENT}/users/current/accounts/${accountId}/orders`,              { headers: mtHeaders }),
  ]);

  const mtAccountInfo: AccountInfo | null =
    accountRes.status === "fulfilled" && accountRes.value.ok
      ? await accountRes.value.json().catch(() => null)
      : null;

  const mtPositions: Position[] =
    positionsRes.status === "fulfilled" && positionsRes.value.ok
      ? await positionsRes.value.json().catch(() => [])
      : [];

  const orders: Order[] =
    ordersRes.status === "fulfilled" && ordersRes.value.ok
      ? await ordersRes.value.json().catch(() => [])
      : [];

  // Merge: MT5 positions first, then TradeLocker positions
  const allPositions = [
    ...(Array.isArray(mtPositions) ? mtPositions : []),
    ...tlPositions,
  ];

  return NextResponse.json({
    connected:   true,
    accountInfo: mtAccountInfo ?? tlAccountInfo,
    positions:   allPositions,
    orders:      Array.isArray(orders) ? orders : [],
    todayPnl,
    todayTrades: todayTrades?.length ?? 0,
  });
}
