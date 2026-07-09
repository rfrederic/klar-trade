import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { resolveUserTimezone } from "@/lib/timezone-server";
import { getZonedParts, startOfLocalYearUtc } from "@/lib/timezone";
import { netPnl as tradeNetPnl } from "@/lib/trade-pnl";

function rangeFrom(range: string, timeZone: string): Date {
  const now = new Date();
  switch (range) {
    case "7D":  return new Date(now.getTime() - 7 * 86400000);
    case "30D": return new Date(now.getTime() - 30 * 86400000);
    case "90D": return new Date(now.getTime() - 90 * 86400000);
    case "6M":  return new Date(now.getTime() - 180 * 86400000);
    case "YTD": return startOfLocalYearUtc(timeZone, now);
    default:    return new Date(2000, 0, 1);
  }
}

export async function GET(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "30D";

  const supabase = createServiceClient();
  const timeZone = await resolveUserTimezone(supabase, user.id, searchParams.get("tz"));
  const from = rangeFrom(range, timeZone);

  const { data: trades, error } = await supabase
    .from("trades")
    .select("id, symbol, direction, pnl, commission, swap, emotion, grade, followed_plan, closed_at, volume")
    .eq("user_id", user.id)
    .gte("closed_at", from.toISOString())
    .order("closed_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!trades || trades.length === 0) {
    return NextResponse.json({ empty: true, kpis: null, timeOfDay: [], dayOfWeek: [], instruments: [], emotions: [] });
  }

  const closingTrades = trades.filter((t) => t.pnl != null);

  // ─── KPIs ─────────────────────────────────────────────────────────────────
  const wins = closingTrades.filter((t) => tradeNetPnl(t) > 0);
  const losses = closingTrades.filter((t) => tradeNetPnl(t) < 0);
  const netPnl = closingTrades.reduce((s, t) => s + tradeNetPnl(t), 0);
  const grossWin = wins.reduce((s, t) => s + tradeNetPnl(t), 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + tradeNetPnl(t), 0));
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : null;
  const avgWin = wins.length > 0 ? grossWin / wins.length : null;
  const avgLoss = losses.length > 0 ? -(grossLoss / losses.length) : null;
  const winRate = closingTrades.length > 0 ? (wins.length / closingTrades.length) * 100 : null;

  // Max drawdown (relative % of running peak)
  let peak = 0, running = 0, maxDD = 0;
  for (const t of closingTrades) {
    running += tradeNetPnl(t);
    if (running > peak) peak = running;
    if (peak > 0) maxDD = Math.max(maxDD, (peak - running) / peak);
  }

  // ─── Time of day ──────────────────────────────────────────────────────────
  const hourMap: Record<number, { wins: number; total: number; pnl: number }> = {};
  for (const t of closingTrades) {
    const h = getZonedParts(t.closed_at, timeZone).hour;
    if (!hourMap[h]) hourMap[h] = { wins: 0, total: 0, pnl: 0 };
    hourMap[h].total += 1;
    hourMap[h].pnl += tradeNetPnl(t);
    if (tradeNetPnl(t) > 0) hourMap[h].wins += 1;
  }
  const timeOfDay = Object.entries(hourMap)
    .map(([h, v]) => ({
      hour: parseInt(h),
      label: `${h.padStart(2, "0")}:00`,
      winRate: Math.round((v.wins / v.total) * 100),
      trades: v.total,
      pnl: v.pnl,
    }))
    .sort((a, b) => a.hour - b.hour);

  // ─── Day of week ──────────────────────────────────────────────────────────
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dowMap: Record<number, { wins: number; total: number; pnl: number }> = {};
  for (const t of closingTrades) {
    const d = getZonedParts(t.closed_at, timeZone).dayOfWeek;
    if (!dowMap[d]) dowMap[d] = { wins: 0, total: 0, pnl: 0 };
    dowMap[d].total += 1;
    dowMap[d].pnl += tradeNetPnl(t);
    if (tradeNetPnl(t) > 0) dowMap[d].wins += 1;
  }
  const dayOfWeek = [1, 2, 3, 4, 5] // Mon–Fri
    .filter((d) => dowMap[d])
    .map((d) => ({
      day: DOW[d],
      dayNum: d,
      winRate: Math.round((dowMap[d].wins / dowMap[d].total) * 100),
      pnl: dowMap[d].pnl,
      trades: dowMap[d].total,
    }));

  // ─── Instruments ──────────────────────────────────────────────────────────
  const symMap: Record<string, { wins: number; losses: number; pnl: number; count: number }> = {};
  for (const t of closingTrades) {
    if (!t.symbol) continue;
    if (!symMap[t.symbol]) symMap[t.symbol] = { wins: 0, losses: 0, pnl: 0, count: 0 };
    symMap[t.symbol].count += 1;
    symMap[t.symbol].pnl += tradeNetPnl(t);
    if (tradeNetPnl(t) > 0) symMap[t.symbol].wins += 1;
    else symMap[t.symbol].losses += 1;
  }
  const instruments = Object.entries(symMap)
    .map(([symbol, v]) => ({
      symbol,
      winRate: Math.round((v.wins / v.count) * 100),
      pnl: v.pnl,
      trades: v.count,
      wins: v.wins,
      losses: v.losses,
    }))
    .sort((a, b) => b.pnl - a.pnl);

  // ─── Emotions ─────────────────────────────────────────────────────────────
  const EMOTION_EMOJIS: Record<string, string> = {
    calm: "😌", focused: "😎", neutral: "😐", anxious: "😰", frustrated: "😤",
  };
  const emoMap: Record<string, { wins: number; total: number; pnl: number }> = {};
  for (const t of closingTrades) {
    if (!t.emotion) continue;
    if (!emoMap[t.emotion]) emoMap[t.emotion] = { wins: 0, total: 0, pnl: 0 };
    emoMap[t.emotion].total += 1;
    emoMap[t.emotion].pnl += tradeNetPnl(t);
    if (tradeNetPnl(t) > 0) emoMap[t.emotion].wins += 1;
  }
  const emotions = Object.entries(emoMap)
    .map(([emotion, v]) => ({
      emotion,
      state: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      emoji: EMOTION_EMOJIS[emotion] ?? "🙂",
      winRate: Math.round((v.wins / v.total) * 100),
      trades: v.total,
      pnl: v.pnl,
    }))
    .sort((a, b) => b.winRate - a.winRate);

  return NextResponse.json({
    kpis: {
      netPnl,
      winRate,
      profitFactor,
      avgWin,
      avgLoss,
      maxDrawdown: maxDD > 0 ? maxDD * 100 : null,
      totalTrades: closingTrades.length,
      wins: wins.length,
      losses: losses.length,
    },
    timeOfDay,
    dayOfWeek,
    instruments,
    emotions,
  });
}
