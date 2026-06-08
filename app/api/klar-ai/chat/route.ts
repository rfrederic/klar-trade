import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

let anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!anthropic) anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropic;
}

export async function POST(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "KlarAI is not configured yet" }, { status: 503 });
  }

  const body = await req.json();
  const { messages, systemOverride } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 });
  }

  // Support / lightweight callers can pass a custom system prompt, skipping trader data.
  if (systemOverride) {
    const apiMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
    try {
      const response = await getAnthropic().messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemOverride,
        messages: apiMessages,
      });
      const content = response.content[0];
      if (content.type !== "text") return NextResponse.json({ error: "Unexpected response type" }, { status: 500 });
      return NextResponse.json({ content: content.text });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get AI response";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const supabase = createServiceClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [{ data: trades }, { data: plans }] = await Promise.all([
    supabase
      .from("trades")
      .select("setup, direction, pnl, emotion, grade, followed_plan, closed_at")
      .eq("user_id", user.id)
      .gte("closed_at", thirtyDaysAgo.toISOString())
      .order("closed_at", { ascending: false })
      .limit(100),
    supabase
      .from("trading_plans")
      .select("name, description, entry_criteria, exit_rules, active")
      .eq("user_id", user.id)
      .eq("active", true),
  ]);

  const totalTrades = (trades ?? []).length;
  const winners = (trades ?? []).filter((t) => (t.pnl ?? 0) > 0);
  const winRate = totalTrades > 0 ? Math.round((winners.length / totalTrades) * 100) : 0;
  const totalPnl = (trades ?? []).reduce((s, t) => s + (t.pnl ?? 0), 0);
  const followedPlanCount = (trades ?? []).filter((t) => t.followed_plan).length;
  const disciplineRate = totalTrades > 0 ? Math.round((followedPlanCount / totalTrades) * 100) : 0;

  const setupMap: Record<string, { wins: number; total: number; pnl: number }> = {};
  for (const t of trades ?? []) {
    const k = t.setup ?? "Unknown";
    if (!setupMap[k]) setupMap[k] = { wins: 0, total: 0, pnl: 0 };
    setupMap[k].total++;
    if ((t.pnl ?? 0) > 0) setupMap[k].wins++;
    setupMap[k].pnl += t.pnl ?? 0;
  }

  const emotionMap: Record<string, { wins: number; total: number }> = {};
  for (const t of trades ?? []) {
    if (!t.emotion) continue;
    if (!emotionMap[t.emotion]) emotionMap[t.emotion] = { wins: 0, total: 0 };
    emotionMap[t.emotion].total++;
    if ((t.pnl ?? 0) > 0) emotionMap[t.emotion].wins++;
  }

  const setupLines = Object.entries(setupMap)
    .map(([setup, s]) => `  - ${setup}: ${s.total} trades, ${Math.round((s.wins / s.total) * 100)}% WR, $${s.pnl.toFixed(0)} PnL`)
    .join("\n") || "  - No setup data yet";

  const emotionLines = Object.entries(emotionMap)
    .map(([emotion, e]) => `  - ${emotion}: ${e.total} trades, ${Math.round((e.wins / e.total) * 100)}% WR`)
    .join("\n") || "  - No emotion data yet";

  const planLines = (plans ?? [])
    .map((p) => `  - ${p.name}: ${p.description ?? ""}`)
    .join("\n") || "  - No active plans defined yet";

  const systemPrompt = `You are KlarAI, an expert trading coach and analyst built into KlarTrade. You are direct, evidence-based, and focused on helping traders improve through data, psychology, and process — not predictions.

TRADER DATA (last 30 days):
- Trades taken: ${totalTrades}
- Win rate: ${winRate}%
- Net P&L: ${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}
- Plan discipline: ${disciplineRate}% of trades followed the plan

SETUP BREAKDOWN:
${setupLines}

EMOTIONAL PATTERNS:
${emotionLines}

ACTIVE TRADING PLANS:
${planLines}

RULES:
- Reference the trader's real data when relevant — be specific, not generic
- Be concise: 2-4 paragraphs max unless the topic demands more detail
- Never give specific trade recommendations or financial advice
- Focus on process, psychology, and pattern recognition
- If asked something unrelated to trading, briefly redirect to the trading context`;

  const apiMessages = messages.map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  try {
    const response = await getAnthropic().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: apiMessages,
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response type" }, { status: 500 });
    }

    return NextResponse.json({ content: content.text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get AI response";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
