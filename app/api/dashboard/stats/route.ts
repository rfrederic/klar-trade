import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

const MT_CLIENT = "https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai";
const MT_PROVISION = "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";

function rangeFrom(timeframe: string): Date {
  const d = new Date();
  switch (timeframe) {
    case "Today": d.setHours(0, 0, 0, 0); break;
    case "7D":    d.setDate(d.getDate() - 7); break;
    case "30D":   d.setDate(d.getDate() - 30); break;
    case "90D":   d.setDate(d.getDate() - 90); break;
    case "YTD":   d.setMonth(0, 1); d.setHours(0, 0, 0, 0); break;
    case "ALL":   d.setFullYear(2000); break;
    default:      d.setDate(d.getDate() - 30);
  }
  return d;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const timeframe = searchParams.get("timeframe") ?? "30D";

  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const from = rangeFrom(timeframe);

  // Always compute stats from trades table (works with or without MT5)
  const { data: dbTrades } = await supabase
    .from("trades")
    .select("pnl, closed_at, symbol, direction, setup, emotion, grade, followed_plan")
    .eq("user_id", user.id)
    .gte("closed_at", from.toISOString())
    .order("closed_at", { ascending: true });

  const trades = dbTrades ?? [];
  const wins = trades.filter((t) => (t.pnl ?? 0) > 0);
  const losses = trades.filter((t) => (t.pnl ?? 0) < 0);
  const totalTrades = trades.length;
  const totalPnl = trades.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const winRate = totalTrades > 0 ? ((wins.length / totalTrades) * 100).toFixed(1) : null;
  const grossWin = wins.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0));
  const profitFactor = grossLoss > 0 ? (grossWin / grossLoss).toFixed(2) : null;

  // Today's trades
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { data: todayDbTrades } = await supabase
    .from("trades")
    .select("pnl")
    .eq("user_id", user.id)
    .gte("closed_at", todayStart.toISOString());
  const todayPnl = (todayDbTrades ?? []).reduce((s, t) => s + (t.pnl ?? 0), 0);
  const todayCount = todayDbTrades?.length ?? 0;

  // Equity curve from trades table
  let running = 0;
  const equityCurve: number[] = [];
  for (const t of trades) {
    running += t.pnl ?? 0;
    equityCurve.push(Math.round(running * 100) / 100);
  }

  // Recent trades for table
  const recentTrades = [...trades]
    .reverse()
    .slice(0, 10)
    .map((t) => ({
      instrument: t.symbol ?? "—",
      direction: t.direction === "long" ? "Long" : "Short",
      pnl: (t.pnl ?? 0) >= 0 ? `+$${(t.pnl ?? 0).toFixed(2)}` : `-$${Math.abs(t.pnl ?? 0).toFixed(2)}`,
      outcome: (t.pnl ?? 0) >= 0 ? "Win" : "Loss",
      setup: t.setup ?? "",
      emotion: t.emotion ?? "",
      grade: t.grade ?? "",
      closedAt: new Date(t.closed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    }));

  // Try MetaApi for live balance/equity (non-blocking — graceful failure)
  let liveBalance: number | null = null;
  let liveEquity: number | null = null;
  let liveOpenPositions = 0;
  let brokerConnected = false;

  const token = process.env.METAAPI_TOKEN;
  if (token) {
    const { data: connection } = await supabase
      .from("broker_connections")
      .select("meta_account_id, balance")
      .eq("user_id", user.id)
      .eq("broker", "mt5")
      .eq("status", "connected")
      .maybeSingle();

    if (connection?.meta_account_id) {
      brokerConnected = true;
      const accountId = connection.meta_account_id;
      const headers = { "auth-token": token };

      try {
        await fetch(`${MT_PROVISION}/users/current/accounts/${accountId}/deploy`, { method: "POST", headers });
      } catch { /* non-fatal */ }

      const [infoRes, posRes] = await Promise.allSettled([
        fetch(`${MT_CLIENT}/users/current/accounts/${accountId}/account-information`, { headers }),
        fetch(`${MT_CLIENT}/users/current/accounts/${accountId}/positions`, { headers }),
      ]);

      if (infoRes.status === "fulfilled" && infoRes.value.ok) {
        const info = await infoRes.value.json().catch(() => null);
        if (info) {
          liveBalance = info.balance ?? null;
          liveEquity  = info.equity  ?? null;
          // Rebuild equity curve anchored to live balance
          if (liveBalance != null && equityCurve.length > 0) {
            const startingBalance = liveBalance - totalPnl;
            let rb = startingBalance;
            for (let i = 0; i < equityCurve.length; i++) {
              rb += trades[i].pnl ?? 0;
              equityCurve[i] = Math.round(rb * 100) / 100;
            }
          }
          // Keep broker_connections in sync
          await supabase
            .from("broker_connections")
            .update({
              balance:   `$${(liveBalance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
              last_sync: new Date().toISOString(),
            })
            .eq("meta_account_id", accountId);
        }
      } else if (connection.balance) {
        // MetaApi unreachable — fall back to the balance cached by the last sync
        const cached = parseFloat(String(connection.balance).replace(/[$,]/g, ""));
        if (!isNaN(cached)) liveBalance = cached;
      }

      if (posRes.status === "fulfilled" && posRes.value.ok) {
        const positions = await posRes.value.json().catch(() => []);
        liveOpenPositions = Array.isArray(positions) ? positions.length : 0;
      }
    }
  }

  return NextResponse.json({
    brokerConnected,
    stats: {
      balance: liveBalance,
      equity: liveEquity,
      totalPnl,
      winRate,
      totalTrades,
      profitFactor,
    },
    today: {
      pnl: todayPnl,
      trades: todayCount,
      openPositions: liveOpenPositions,
    },
    equityCurve,
    recentTrades,
  });
}
