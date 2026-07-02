import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { BIOMES, getBiome } from "@/lib/biomes";
import { resolveUserTimezone } from "@/lib/timezone-server";
import { getLocalDateString, getZonedParts, localDateStringDaysAgo } from "@/lib/timezone";

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

// ─── Types ─────────────────────────────────────────────────────────────────

export type InsightType = "pattern" | "streak" | "recommendation";

export interface Insight {
  type:   InsightType;
  title:  string;
  body:   string;
  accent: string;   // hex — drives the card's left border
  meta?: {
    flow?: {
      from:        string;
      to:          string;
      fromAccent:  string;
      toAccent:    string;
    };
    streakDays?: number;
  };
}

// ─── POST ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mood, biome, duration_min, completed } = await req.json();
  if (!mood || !biome || duration_min == null) {
    return NextResponse.json({ error: "mood, biome, and duration_min required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("sanctuary_sessions")
    .insert({ user_id: user.id, mood, biome, duration_min, completed: completed ?? false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// ─── Helpers ───────────────────────────────────────────────────────────────

type Row = {
  mood: string;
  biome: string;
  duration_min: number;
  completed: boolean;
  created_at: string;
};

// Reverse-lookup biome accent by display name (e.g. "Golden Forest" → "#F59E0B")
function accentByName(biomeName: string): string {
  for (const b of Object.values(BIOMES)) {
    if (b.name === biomeName) return b.accent;
  }
  return "#03588C";
}

function buildInsights(rows: Row[], streak: number, timeZone: string): Insight[] {
  if (rows.length === 0) return [];
  const insights: Insight[] = [];

  // ── Precompute tallies ──────────────────────────────────────────────────

  const moodCounts: Record<string, number> = {};
  for (const r of rows) moodCounts[r.mood] = (moodCounts[r.mood] ?? 0) + 1;

  const biomeCounts: Record<string, number> = {};
  for (const r of rows) biomeCounts[r.biome] = (biomeCounts[r.biome] ?? 0) + 1;

  // mood → dow → count
  const moods   = ["Clear", "Charged", "Heavy", "Numb", "Rattled"];
  const moodDow: Record<string, number[]> = {};
  for (const m of moods) moodDow[m] = [0, 0, 0, 0, 0, 0, 0];
  for (const r of rows) {
    const dow = getZonedParts(r.created_at, timeZone).dayOfWeek;
    if (moodDow[r.mood]) moodDow[r.mood][dow]++;
  }

  // (mood, biome) → { total, completed }
  const pairStats: Record<string, { total: number; completed: number }> = {};
  for (const r of rows) {
    const key = `${r.mood}||${r.biome}`;
    if (!pairStats[key]) pairStats[key] = { total: 0, completed: 0 };
    pairStats[key].total++;
    if (r.completed) pairStats[key].completed++;
  }

  const topMoodEntry       = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  const overallCompletion  = rows.filter(r => r.completed).length / rows.length;

  // ── 1. Day-of-week mood peak (pattern) ──────────────────────────────────
  let peakCount = 0, peakMood = "", peakDow = 0;
  for (const [mood, counts] of Object.entries(moodDow)) {
    counts.forEach((c, dow) => {
      if (c > peakCount) { peakCount = c; peakMood = mood; peakDow = dow; }
    });
  }
  if (peakCount >= 2) {
    const moodAccent = getBiome(peakMood).accent;
    insights.push({
      type:   "pattern",
      title:  `${DAY_NAMES[peakDow]} pattern`,
      body:   `You arrive ${peakMood} most on ${DAY_NAMES[peakDow]}s (${peakCount}× this month). Consider a longer anchor practice before you trade that day.`,
      accent: moodAccent,
      meta: {
        flow: {
          from:       peakMood,
          to:         `${DAY_NAMES[peakDow]}s`,
          fromAccent: moodAccent,
          toAccent:   "rgba(255,255,255,0.38)",
        },
      },
    });
  }

  // ── 2. Mood/biome mismatch — rebalancing (pattern) ──────────────────────
  const mismatches = rows.filter(r => getBiome(r.mood).name !== r.biome);
  if (mismatches.length >= 2) {
    const pairFreq: Record<string, number> = {};
    for (const r of mismatches) {
      const key = `${r.mood}→${r.biome}`;
      pairFreq[key] = (pairFreq[key] ?? 0) + 1;
    }
    const topPair        = Object.entries(pairFreq).sort((a, b) => b[1] - a[1])[0];
    const [fromMood, toBiome] = topPair[0].split("→");
    const toAccent       = accentByName(toBiome);
    insights.push({
      type:   "pattern",
      title:  "Rebalancing pattern",
      body:   `You check in as ${fromMood} but most often choose ${toBiome} — you're using practice to counterbalance your state, not just reflect it.`,
      accent: toAccent,
      meta: {
        flow: {
          from:       fromMood,
          to:         toBiome,
          fromAccent: getBiome(fromMood).accent,
          toAccent,
        },
      },
    });
  }

  // ── 3. Best completion biome for top mood (recommendation) ──────────────
  if (topMoodEntry && rows.length >= 4) {
    const [topMood] = topMoodEntry;
    const candidates: { biome: string; rate: number }[] = [];
    for (const [key, stats] of Object.entries(pairStats)) {
      const [rowMood, rowBiome] = key.split("||");
      if (rowMood === topMood && stats.total >= 2) {
        candidates.push({ biome: rowBiome, rate: stats.completed / stats.total });
      }
    }
    if (candidates.length >= 2) {
      const sorted  = candidates.sort((a, b) => b.rate - a.rate);
      const best    = sorted[0];
      const worst   = sorted[sorted.length - 1];
      const pctDiff = Math.round((best.rate - worst.rate) * 100);
      if (pctDiff >= 30) {
        const accent = accentByName(best.biome);
        insights.push({
          type:   "recommendation",
          title:  `Best biome when ${topMood}`,
          body:   `Try ${best.biome} when you're ${topMood} — your completion rate is ${pctDiff}% higher there than in ${worst.biome}.`,
          accent,
        });
      }
    }
  }

  // ── 4. Low completion rate (recommendation) ──────────────────────────────
  if (rows.length >= 5 && overallCompletion < 0.4) {
    insights.push({
      type:   "recommendation",
      title:  "Shorter sessions finish",
      body:   `Only ${Math.round(overallCompletion * 100)}% of sessions run to completion. Switch to 2-minute practices to build the habit before extending duration.`,
      accent: "#22C55E",
    });
  }

  // ── 5. Home biome — dominant environment (pattern) ───────────────────────
  if (rows.length >= 4) {
    const topBiome   = Object.entries(biomeCounts).sort((a, b) => b[1] - a[1])[0];
    const dominance  = topBiome[1] / rows.length;
    if (dominance >= 0.55) {
      insights.push({
        type:   "pattern",
        title:  "Home biome",
        body:   `${topBiome[0]} is your most returned-to environment — ${topBiome[1]} of ${rows.length} sessions. Comfort or habit?`,
        accent: accentByName(topBiome[0]),
      });
    }
  }

  // ── 6. Streak (streak) ───────────────────────────────────────────────────
  if (streak >= 3) {
    insights.push({
      type:       "streak",
      title:      `${streak}-day streak`,
      body:       "Most traders skip the mental edge — you're not.",
      accent:     "#D9CA82",
      meta:       { streakDays: streak },
    });
  }

  return insights;
}

// ─── GET ───────────────────────────────────────────────────────────────────

const EMPTY_RESPONSE = {
  stats:    { sessions30d: 0, minutes30d: 0, streak: 0 },
  calendar: [] as { date: string; mood: string | null; biome: string | null; duration_min: number | null }[],
  heatmap:  {} as Record<string, number[]>,
  insights: [] as Insight[],
  recent:   [] as unknown[],
};

export async function GET(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const timeZone = await resolveUserTimezone(supabase, user.id, req.nextUrl.searchParams.get("tz"));
  const since30  = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const since365 = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: sessions, error }, { data: streakSessions }] = await Promise.all([
    supabase
      .from("sanctuary_sessions")
      .select("mood, biome, duration_min, completed, created_at")
      .eq("user_id", user.id)
      .gte("created_at", since30)
      .order("created_at", { ascending: false }),
    supabase
      .from("sanctuary_sessions")
      .select("created_at")
      .eq("user_id", user.id)
      .gte("created_at", since365),
  ]);

  if (error) return NextResponse.json(EMPTY_RESPONSE);

  const rows = (sessions ?? []) as Row[];

  // ── Stats ──
  const sessions30d = rows.length;
  const minutes30d  = rows.reduce((s, r) => s + (r.duration_min ?? 0), 0);

  // Streak can span further back than the 30-day window used for stats/insights above
  const daySet = new Set((streakSessions ?? []).map(r => getLocalDateString(r.created_at, timeZone)));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    if (daySet.has(localDateStringDaysAgo(i, timeZone))) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  // ── 28-day calendar ──
  const calendar: { date: string; mood: string | null; biome: string | null; duration_min: number | null }[] = [];
  for (let i = 27; i >= 0; i--) {
    const dateStr = localDateStringDaysAgo(i, timeZone);
    const hit     = rows.find(r => getLocalDateString(r.created_at, timeZone) === dateStr);
    calendar.push({
      date: dateStr,
      mood: hit?.mood ?? null,
      biome: hit?.biome ?? null,
      duration_min: hit?.duration_min ?? null,
    });
  }

  // ── Mood × day-of-week heatmap ──
  const moods   = ["Clear", "Charged", "Heavy", "Numb", "Rattled"];
  const heatmap: Record<string, number[]> = {};
  for (const m of moods) heatmap[m] = [0, 0, 0, 0, 0, 0, 0];
  for (const r of rows) {
    const dow = getZonedParts(r.created_at, timeZone).dayOfWeek;
    if (heatmap[r.mood]) heatmap[r.mood][dow]++;
  }

  return NextResponse.json({
    stats: { sessions30d, minutes30d, streak },
    calendar,
    heatmap,
    insights: buildInsights(rows, streak, timeZone),
    recent:   rows.slice(0, 8),
  });
}
