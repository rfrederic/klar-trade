import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { resolveUserTimezone } from "@/lib/timezone-server";
import { startOfLocalDayUtc, startOfLocalYearUtc } from "@/lib/timezone";
import { netPnl } from "@/lib/trade-pnl";

const MT_CLIENT = "https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai";
const MT_PROVISION = "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";

function rangeFrom(timeframe: string, timeZone: string): Date {
  const d = new Date();
  switch (timeframe) {
    case "Today": return startOfLocalDayUtc(timeZone, d);
    case "7D":    d.setDate(d.getDate() - 7); return d;
    case "30D":   d.setDate(d.getDate() - 30); return d;
    case "90D":   d.setDate(d.getDate() - 90); return d;
    case "YTD":   return startOfLocalYearUtc(timeZone, d);
    case "ALL":   d.setFullYear(2000); return d;
    default:      d.setDate(d.getDate() - 30); return d;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const timeframe = searchParams.get("timeframe") ?? "30D";

  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const timeZone = await resolveUserTimezone(supabase, user.id, searchParams.get("tz"));
  const from = rangeFrom(timeframe, timeZone);

  // Always compute stats from trades table (works with or without MT5)
  const { data: dbTrades } = await supabase
    .from("trades")
    .select("pnl, commission, swap, closed_at, symbol, direction, setup, emotion, grade, followed_plan")
    .eq("user_id", user.id)
    .gte("closed_at", from.toISOString())
    .order("closed_at", { ascending: true });

  const trades = dbTrades ?? [];
  const wins = trades.filter((t) => netPnl(t) > 0);
  const losses = trades.filter((t) => netPnl(t) < 0);
  const totalTrades = trades.length;
  const totalPnl = trades.reduce((s, t) => s + netPnl(t), 0);
  const winRate = totalTrades > 0 ? ((wins.length / totalTrades) * 100).toFixed(1) : null;
  const grossWin = wins.reduce((s, t) => s + netPnl(t), 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + netPnl(t), 0));
  const profitFactor = grossLoss > 0 ? (grossWin / grossLoss).toFixed(2) : null;

  // Today's trades
  const todayStart = startOfLocalDayUtc(timeZone);
  const { data: todayDbTrades } = await supabase
    .from("trades")
    .select("pnl, commission, swap")
    .eq("user_id", user.id)
    .gte("closed_at", todayStart.toISOString());
  const todayPnl = (todayDbTrades ?? []).reduce((s, t) => s + netPnl(t), 0);
  const todayCount = todayDbTrades?.length ?? 0;

  // Equity curve from trades table
  let running = 0;
  const equityCurve: number[] = [];
  for (const t of trades) {
    running += netPnl(t);
    equityCurve.push(Math.round(running * 100) / 100);
  }

  // Recent trades for table
  const recentTrades = [...trades]
    .reverse()
    .slice(0, 10)
    .map((t) => {
      const net = netPnl(t);
      return {
        instrument: t.symbol ?? "—",
        direction: t.direction === "long" ? "Long" : "Short",
        pnl: net >= 0 ? `+$${net.toFixed(2)}` : `-$${Math.abs(net).toFixed(2)}`,
        outcome: net >= 0 ? "Win" : "Loss",
        setup: t.setup ?? "",
        emotion: t.emotion ?? "",
        grade: t.grade ?? "",
        closedAt: new Date(t.closed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      };
    });

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
              rb += netPnl(trades[i]);
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

  // No broker connected — fall back to the user's manually-entered account
  // size (profiles.account_size) so balance/equity and the equity curve
  // still work before a real broker is linked.
  let usingManualBalance = false;
  if (liveBalance == null) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_size")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.account_size != null) {
      const { data: priorTrades } = await supabase
        .from("trades")
        .select("pnl, commission, swap")
        .eq("user_id", user.id)
        .lt("closed_at", from.toISOString());
      const pnlBeforeRange = (priorTrades ?? []).reduce((s, t) => s + netPnl(t), 0);

      const startingBalance = Number(profile.account_size) + pnlBeforeRange;
      liveBalance = startingBalance + totalPnl;
      liveEquity = liveBalance;
      usingManualBalance = true;

      let rb = startingBalance;
      for (let i = 0; i < equityCurve.length; i++) {
        rb += netPnl(trades[i]);
        equityCurve[i] = Math.round(rb * 100) / 100;
      }
    }
  }

  return NextResponse.json({
    brokerConnected,
    usingManualBalance,
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
