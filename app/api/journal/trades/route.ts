import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { resolveUserTimezone } from "@/lib/timezone-server";
import { getZonedParts, localMonthRangeUtc } from "@/lib/timezone";

export async function GET(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth()));

  const supabase = createServiceClient();
  const timeZone = await resolveUserTimezone(supabase, user.id, searchParams.get("tz"));

  // [start, end) — end is the start of the next local month (exclusive).
  const { start, end } = localMonthRangeUtc(year, month, timeZone);

  const { data: trades, error } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id)
    .gte("closed_at", start.toISOString())
    .lt("closed_at", end.toISOString())
    .order("closed_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Build daily calendar aggregates, keyed by the trade's local day-of-month
  // in the user's timezone (not the server's clock or raw UTC).
  const calendar: Record<number, { pnl: number; trades: number }> = {};
  for (const trade of trades ?? []) {
    const day = getZonedParts(trade.closed_at, timeZone).day;
    if (!calendar[day]) calendar[day] = { pnl: 0, trades: 0 };
    calendar[day].pnl += trade.pnl ?? 0;
    calendar[day].trades += 1;
  }

  return NextResponse.json({ trades: trades ?? [], calendar });
}

export async function POST(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { symbol, direction, entry_price, exit_price, pnl, volume, closed_at, notes, emotion, grade, followed_plan } = body;

  if (!symbol || !direction || !closed_at) {
    return NextResponse.json({ error: "symbol, direction and closed_at are required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("trades")
    .insert({
      user_id: user.id,
      symbol: symbol.toUpperCase(),
      direction,
      entry_price: entry_price ?? null,
      exit_price: exit_price ?? null,
      pnl: pnl ?? null,
      volume: volume ?? null,
      closed_at,
      notes: notes ?? null,
      emotion: emotion ?? null,
      grade: grade ?? null,
      followed_plan: followed_plan ?? true,
      source: "manual",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ trade: data }, { status: 201 });
}
