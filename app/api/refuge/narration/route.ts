import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MOOD_CONTEXT: Record<string, string> = {
  Rattled:  "the trader is reactive — still inside the last trade. Bring them back to their baseline.",
  Charged:  "the trader is energized and confident, but that edge can tip into overtrading. Channel it with precision.",
  Heavy:    "the trader is carrying a loss. They are inside the weight of it. Help them release it without bypassing it.",
  Numb:     "the trader feels disconnected and mechanical. Reconnect presence to intention.",
  Clear:    "the trader is grounded and patient. Reinforce this state so it holds through the session.",
};

function buildPrompt(exercise: string, type: string, mood: string): string {
  const ctx = MOOD_CONTEXT[mood] ?? "the trader is preparing their mind.";
  const tone = type === "REBOOT"
    ? "Fast re-centering. Short, sharp sentences. Get them back to baseline in under 2 minutes."
    : type === "REWIRE"
    ? "Steady, deliberate. Shift mental models. Build new patterns over 5-8 minutes."
    : "Deep, slow, compassionate. Full release after difficulty. 8-15 minutes of sustained presence.";

  return `Write a spoken meditation script for a trader. Exercise: "${exercise}" (${type}). Right now, ${ctx}

Tone: ${tone}

Rules:
- Second person ("you", "your") throughout
- Slow, measured sentences ending with periods — natural TTS pauses
- Trading language woven in naturally. Examples:
    "The last trade is already closed."
    "Your edge works across hundreds of trades, not this one."
    "The chart will be there. Right now you are here."
    "Risk is defined. Position is sized. Your only job is to wait."
    "Release what happened at the open. The afternoon session is clean."
- No "Welcome", no "[pause]", no headers, no music cues
- Pure spoken prose, 350–480 words
- Final sentence: one quiet, grounding statement that returns them to the present moment

Output the script only. No titles, no quotes around it, no commentary.`;
}

export async function GET(req: NextRequest) {
  try {
    const authClient = await createServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const exercise = searchParams.get("exercise");
    const type     = searchParams.get("type");
    const mood     = searchParams.get("mood") ?? "Clear";

    if (!exercise || !type) {
      return NextResponse.json({ error: "exercise and type are required" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "KlarAI not configured" }, { status: 503 });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: buildPrompt(exercise, type, mood) }],
    });
    const script = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!script) return NextResponse.json({ error: "Script generation failed" }, { status: 500 });

    return NextResponse.json({ script, cached: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    console.error("[narration] unhandled error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
