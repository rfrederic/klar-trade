import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { resolveUserTimezone } from "@/lib/timezone-server";
import { startOfLocalDayUtc } from "@/lib/timezone";

const MT_CLIENT = "https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai";
const MT_PROVISION = "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";

export async function GET(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const timeZone = await resolveUserTimezone(supabase, user.id, req.nextUrl.searchParams.get("tz"));
  const todayStart = startOfLocalDayUtc(timeZone);

  const { data: todayTrades } = await supabase
    .from("trades")
    .select("pnl")
    .eq("user_id", user.id)
    .gte("closed_at", todayStart.toISOString());

  const trades = todayTrades ?? [];
  const todayPnl = trades.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const todayCount = trades.length;
  const todayLosses = trades.filter((t) => (t.pnl ?? 0) < 0);
  const todayGrossLoss = Math.abs(todayLosses.reduce((s, t) => s + (t.pnl ?? 0), 0));
  const todayWins = trades.filter((t) => (t.pnl ?? 0) > 0).length;
  const todayWinRate = todayCount > 0 ? Math.round((todayWins / todayCount) * 100) : null;

  // Get broker balance
  const { data: connection } = await supabase
    .from("broker_connections")
    .select("meta_account_id, balance")
    .eq("user_id", user.id)
    .eq("broker", "mt5")
    .eq("status", "connected")
    .maybeSingle();

  const rawBalance = connection?.balance as string | null;
  let accountBalance = rawBalance
    ? parseFloat(rawBalance.replace(/[$,]/g, "")) || null
    : null;

  // No broker balance — fall back to the user's manually-entered account
  // size plus all-time realized P&L, so position sizing works before a
  // real broker is connected.
  let usingManualBalance = false;
  if (accountBalance == null) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_size")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.account_size != null) {
      const { data: allTrades } = await supabase
        .from("trades")
        .select("pnl")
        .eq("user_id", user.id);
      const allTimePnl = (allTrades ?? []).reduce((s, t) => s + (t.pnl ?? 0), 0);
      accountBalance = Number(profile.account_size) + allTimePnl;
      usingManualBalance = true;
    }
  }

  // Try MetaApi for open floating PnL
  let openFloatingPnl = 0;
  let openPositionCount = 0;
  let brokerConnected = false;

  const token = process.env.METAAPI_TOKEN;
  if (token && connection?.meta_account_id) {
    const accountId = connection.meta_account_id;
    const headers = { "auth-token": token };
    brokerConnected = true;

    try {
      await fetch(`${MT_PROVISION}/users/current/accounts/${accountId}/deploy`, { method: "POST", headers });
    } catch { /* non-fatal */ }

    try {
      const res = await fetch(`${MT_CLIENT}/users/current/accounts/${accountId}/positions`, { headers });
      if (res.ok) {
        const positions = await res.json().catch(() => []);
        if (Array.isArray(positions)) {
          openPositionCount = positions.length;
          openFloatingPnl = positions.reduce((s: number, p: { profit?: number }) => s + (p.profit ?? 0), 0);
        }
      }
    } catch { /* non-fatal */ }
  }

  return NextResponse.json({
    brokerConnected,
    usingManualBalance,
    accountBalance,
    today: {
      pnl: todayPnl,
      trades: todayCount,
      grossLoss: todayGrossLoss,
      winRate: todayWinRate,
    },
    open: {
      positions: openPositionCount,
      floatingPnl: openFloatingPnl,
    },
  });
}
