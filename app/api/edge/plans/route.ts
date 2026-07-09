import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { netPnl } from "@/lib/trade-pnl";

export async function GET() {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const { data: plans, error } = await supabase
    .from("trading_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const planNames = (plans ?? []).map((p) => p.name);
  const { data: trades } = planNames.length > 0
    ? await supabase
        .from("trades")
        .select("setup, pnl, commission, swap")
        .eq("user_id", user.id)
        .in("setup", planNames)
    : { data: [] };

  const plansWithStats = (plans ?? []).map((plan) => {
    const planTrades = (trades ?? []).filter((t) => t.setup === plan.name);
    const winners = planTrades.filter((t) => netPnl(t) > 0);
    const totalPnl = planTrades.reduce((s, t) => s + netPnl(t), 0);
    const winRate = planTrades.length > 0 ? Math.round((winners.length / planTrades.length) * 100) : 0;
    return { ...plan, winRate, totalPnl, tradeCount: planTrades.length };
  });

  return NextResponse.json({ plans: plansWithStats });
}

export async function POST(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, active, tags, entry_criteria, exit_rules, invalidations, ideal_conditions } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("trading_plans")
    .insert({
      user_id: user.id,
      name: name.trim(),
      description: description ?? "",
      active: active ?? true,
      tags: tags ?? [],
      entry_criteria: entry_criteria ?? [],
      exit_rules: exit_rules ?? [],
      invalidations: invalidations ?? [],
      ideal_conditions: ideal_conditions ?? [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plan: { ...data, winRate: 0, totalPnl: 0, tradeCount: 0 } }, { status: 201 });
}
