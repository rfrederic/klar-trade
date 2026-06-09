import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";

export const dynamic = "force-dynamic";

let groq: Groq | null = null;
function getGroq() {
  if (!groq) groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
}

const MODEL = "llama-3.3-70b-versatile";

const BASE_SYSTEM = `You are KlarAI, an elite trading psychology coach and performance analyst for KlarTrade. You help traders improve discipline, manage emotions, analyze their trading patterns, and build better trading habits. You have access to the user's trading context. Be direct, specific, and actionable. Reference trading concepts naturally. Never give financial advice.`;

export async function POST(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "KlarAI is not configured yet" }, { status: 503 });
  }

  const body = await req.json();
  const { messages, systemOverride } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 });
  }

  const apiMessages = messages.map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Lightweight callers can pass a custom system prompt, skipping trader data
  if (systemOverride) {
    try {
      const response = await getGroq().chat.completions.create({
        model: MODEL,
        max_tokens: 1024,
        messages: [{ role: "system", content: systemOverride }, ...apiMessages],
      });
      const text = response.choices[0]?.message?.content ?? "";
      return NextResponse.json({ content: text });
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

  const systemPrompt = `${BASE_SYSTEM}

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

  try {
    const response = await getGroq().chat.completions.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "system", content: systemPrompt }, ...apiMessages],
    });

    const text = response.choices[0]?.message?.content ?? "";
    return NextResponse.json({ content: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get AI response";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
