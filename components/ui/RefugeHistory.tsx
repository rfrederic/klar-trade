"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, TrendingUp, CalendarDays } from "lucide-react";
import { BIOMES, getBiome } from "@/lib/biomes";
import type { Biome } from "@/lib/biomes";
import { BiomeCanvas } from "@/components/ui/BiomeCanvas";
import { getBrowserTimezone } from "@/lib/timezone";

type InsightType = "pattern" | "streak" | "recommendation";

type Insight = {
  type:   InsightType;
  title:  string;
  body:   string;
  accent: string;
  meta?: {
    flow?: {
      from:       string;
      to:         string;
      fromAccent: string;
      toAccent:   string;
    };
    streakDays?: number;
  };
};

type Session = {
  mood: string;
  biome: string;
  duration_min: number;
  completed: boolean;
  created_at: string;
};

type CalendarDay = { date: string; mood: string | null; biome: string | null; duration_min: number | null };

type HistoryData = {
  stats: { sessions30d: number; minutes30d: number; streak: number };
  calendar: CalendarDay[];
  heatmap: Record<string, number[]>;
  insights: Insight[];
  recent: Session[];
};

const INSIGHT_BADGE: Record<InsightType, string> = {
  pattern:        "bg-[#03588C]/25 text-[#38BDF8] border border-[#03588C]/25",
  recommendation: "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/15",
  streak:         "bg-[#D9CA82]/10 text-[#D9CA82] border border-[#D9CA82]/20",
};

// ─── Insight card variants ────────────────────────────────────────────────

function FlowPill({ label, accent }: { label: string; accent: string }) {
  return (
    <span
      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
      style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}33` }}
    >
      {label}
    </span>
  );
}

function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  const badgeClass = INSIGHT_BADGE[insight.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className="glass rounded-xl overflow-hidden flex"
    >
      {/* Accent left bar */}
      <div className="w-[3px] flex-shrink-0" style={{ background: insight.accent }} />

      <div className="flex-1 p-4 flex flex-col gap-2.5">
        {/* Type badge */}
        <span className={`self-start text-[9px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full ${badgeClass}`}>
          {insight.type}
        </span>

        {/* ── Pattern with flow arrow ── */}
        {insight.type === "pattern" && insight.meta?.flow && (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <FlowPill label={insight.meta.flow.from} accent={insight.meta.flow.fromAccent} />
              <span className="text-[13px] text-white/30 select-none">→</span>
              <FlowPill label={insight.meta.flow.to}   accent={insight.meta.flow.toAccent} />
            </div>
            <p className="text-[11px] text-[#F2F0EB]/50 leading-relaxed">{insight.body}</p>
          </>
        )}

        {/* ── Pattern without flow (home biome etc.) ── */}
        {insight.type === "pattern" && !insight.meta?.flow && (
          <>
            <p className="text-[13px] font-semibold text-[#F2F0EB] leading-tight">{insight.title}</p>
            <p className="text-[11px] text-[#F2F0EB]/50 leading-relaxed">{insight.body}</p>
          </>
        )}

        {/* ── Streak — big number ── */}
        {insight.type === "streak" && (
          <>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-[42px] font-bold leading-none tabular-nums"
                style={{ color: insight.accent }}
              >
                {insight.meta?.streakDays ?? insight.title.replace(/\D/g, "")}
              </span>
              <span className="text-[13px] text-white/40 mb-0.5">days</span>
            </div>
            <p className="text-[11px] text-[#F2F0EB]/50 leading-relaxed">{insight.body}</p>
          </>
        )}

        {/* ── Recommendation — single actionable line ── */}
        {insight.type === "recommendation" && (
          <div className="flex items-start gap-2.5">
            <span className="text-[18px] leading-none mt-0.5 select-none" style={{ color: insight.accent }}>→</span>
            <p className="text-[13px] font-medium text-[#F2F0EB]/85 leading-snug">{insight.body}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

const MOOD_ORDER = ["Clear", "Charged", "Heavy", "Numb", "Rattled"];
const DAY_LABELS  = ["S", "M", "T", "W", "T", "F", "S"];

function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

// ─── Stat card ────────────────────────────────────────────────────────────

function StatCard({ label, value, unit, icon, highlight = false }: {
  label: string; value: number; unit: string; icon: ReactNode; highlight?: boolean;
}) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between text-[#6B7280]">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{label}</span>
        {icon}
      </div>
      <p className={`text-2xl font-bold tabular-nums ${highlight && value > 0 ? "text-[#F59E0B]" : "text-[#F2F0EB]"}`}>
        {value}
      </p>
      <p className="text-[10px] text-[#6B7280]">{unit}</p>
    </div>
  );
}

// ─── Streak milestone overlay ─────────────────────────────────────────────

const MILESTONES = [3, 7, 14, 30] as const;
type Milestone = typeof MILESTONES[number];

const MILESTONE_COPY: Record<Milestone, string> = {
  3:  "Three sessions in. The pattern is starting.",
  7:  "One week. Most traders never build this habit.",
  14: "Two weeks straight. This is the edge most skip.",
  30: "Thirty days. You've changed how you trade.",
};

function mostVisitedBiome(calendar: CalendarDay[]): Biome {
  const counts: Record<string, number> = {};
  for (const day of calendar) {
    if (day.biome) counts[day.biome] = (counts[day.biome] ?? 0) + 1;
  }
  const topName = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (topName) {
    const found = Object.values(BIOMES).find(b => b.name === topName);
    if (found) return found;
  }
  return getBiome("Clear");
}

function StreakMilestoneOverlay({
  streak, biome, onDismiss,
}: {
  streak: number; biome: Biome; onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center cursor-pointer"
      style={{ background: biome.gradient }}
      onClick={onDismiss}
    >
      {/* Biome canvas */}
      <BiomeCanvas
        biomeKey={biome.animation.key}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Veil */}
      <div className="absolute inset-0 bg-black/45 pointer-events-none" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ delay: 0.12, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center gap-5 text-center select-none px-8"
      >
        {/* Number */}
        <div className="flex items-baseline gap-3">
          <span
            className="font-bold leading-none tabular-nums"
            style={{
              fontSize: "clamp(72px, 18vw, 108px)",
              color: "#D9CA82",
              textShadow: "0 0 60px rgba(217,202,130,0.45), 0 0 120px rgba(217,202,130,0.2)",
            }}
          >
            {streak}
          </span>
          <span className="text-[22px] font-light text-white/50 mb-1">days</span>
        </div>

        {/* Copy */}
        <p className="text-[15px] text-white/72 tracking-wide leading-relaxed max-w-[280px]">
          {MILESTONE_COPY[streak as Milestone] ?? "Keep going."}
        </p>
      </motion.div>

      {/* Burn bar — depletes over 4 s */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] origin-left"
        style={{ background: biome.accent }}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 4, ease: "linear" }}
      />

      {/* Dismiss hint */}
      <p className="absolute bottom-5 text-[10px] uppercase tracking-[0.2em] text-white/22 select-none">
        Tap to dismiss
      </p>
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export function RefugeHistory() {
  const [data,          setData]          = useState<HistoryData | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneBiome, setMilestoneBiome] = useState<Biome | null>(null);

  useEffect(() => {
    fetch(`/api/refuge/session?tz=${encodeURIComponent(getBrowserTimezone())}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data) return;
    const { streak } = data.stats;
    if (![3, 7, 14, 30].includes(streak)) return;
    const key = `refuge_streak_milestone_seen_${streak}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
    setMilestoneBiome(mostVisitedBiome(data.calendar));
    setShowMilestone(true);
  }, [data]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-5 w-44 rounded-lg bg-white/[0.05]" />
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-white/[0.05]" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-52 rounded-2xl bg-white/[0.05]" />
          <div className="h-52 rounded-2xl bg-white/[0.05]" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, calendar, heatmap, insights, recent } = data;

  // Compute max count for heatmap intensity
  const maxHeat = Math.max(1, ...Object.values(heatmap).flatMap(v => v));

  // Compute calendar offset so days align with S M T W T F S
  const firstDow = calendar.length > 0
    ? new Date(calendar[0].date + "T00:00:00").getDay()
    : 0;

  return (
    <>
      <AnimatePresence>
        {showMilestone && milestoneBiome && (
          <StreakMilestoneOverlay
            streak={data.stats.streak}
            biome={milestoneBiome}
            onDismiss={() => setShowMilestone(false)}
          />
        )}
      </AnimatePresence>
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[#F2F0EB]">Practice History</h2>
        <p className="text-sm text-[#6B7280] mt-0.5">Your refuge sessions over the last 30 days.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Sessions"
          value={stats.sessions30d}
          unit="this month"
          icon={<CalendarDays className="w-4 h-4" />}
        />
        <StatCard
          label="Minutes"
          value={stats.minutes30d}
          unit="total practice"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <StatCard
          label="Streak"
          value={stats.streak}
          unit={stats.streak === 1 ? "day" : "days"}
          icon={<Flame className="w-4 h-4 text-[#F59E0B]" />}
          highlight={stats.streak >= 3}
        />
      </div>

      {/* Calendar + Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* 28-day mood calendar */}
        <div className="glass rounded-2xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280] mb-4">
            28-Day Practice Log
          </p>

          {calendar.length > 0 ? (
            <>
              <div className="grid grid-cols-7 gap-1.5 mb-1">
                {DAY_LABELS.map((d, i) => (
                  <div key={i} className="text-center text-[9px] text-[#6B7280]/50">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {/* Padding cells to align first day */}
                {Array.from({ length: firstDow }).map((_, i) => (
                  <div key={`pad-${i}`} className="aspect-square" />
                ))}
                {calendar.map(({ date, mood }) => {
                  const biomeObj = mood ? getBiome(mood) : null;
                  return (
                    <div
                      key={date}
                      title={mood ? `${fmtDate(date)}: ${mood}` : fmtDate(date)}
                      className="aspect-square rounded-md"
                      style={{
                        background: biomeObj
                          ? `rgba(${biomeObj.accentRgb}, 0.22)`
                          : "rgba(255,255,255,0.04)",
                        border: `1px solid ${biomeObj
                          ? `rgba(${biomeObj.accentRgb}, 0.35)`
                          : "rgba(255,255,255,0.07)"}`,
                      }}
                    />
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-4">
                {MOOD_ORDER.map(m => {
                  const b = getBiome(m);
                  return (
                    <div key={m} className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: b.accent }} />
                      <span className="text-[9px] text-[#6B7280]">{m}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-[13px] text-[#6B7280] text-center py-8">No sessions yet.</p>
          )}
        </div>

        {/* Mood × day-of-week heatmap */}
        <div className="glass rounded-2xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280] mb-4">
            Mood by Day of Week
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 pl-[84px] mb-1">
              {DAY_LABELS.map((d, i) => (
                <div key={i} className="w-7 text-center text-[9px] text-[#6B7280]/50">{d}</div>
              ))}
            </div>
            {MOOD_ORDER.map(mood => {
              const b      = getBiome(mood);
              const counts = heatmap[mood] ?? [0, 0, 0, 0, 0, 0, 0];
              return (
                <div key={mood} className="flex items-center gap-1.5">
                  <div className="w-[84px] flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: b.accent }} />
                    <span className="text-[10px] text-[#6B7280] truncate">{mood}</span>
                  </div>
                  {counts.map((count, dow) => {
                    const intensity = count / maxHeat;
                    return (
                      <div
                        key={dow}
                        title={`${mood} · ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dow]}: ${count} session${count !== 1 ? "s" : ""}`}
                        className="w-7 h-7 rounded-md"
                        style={{
                          background: count > 0
                            ? `rgba(${b.accentRgb}, ${0.14 + intensity * 0.66})`
                            : "rgba(255,255,255,0.04)",
                          border: `1px solid ${count > 0
                            ? `rgba(${b.accentRgb}, 0.22)`
                            : "rgba(255,255,255,0.06)"}`,
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">Insights</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      {recent.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">Recent Sessions</p>
          <div className="glass rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
            {recent.map((s, i) => {
              const b = getBiome(s.mood);
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{
                      background: `rgba(${b.accentRgb}, 0.14)`,
                      border:     `1px solid rgba(${b.accentRgb}, 0.24)`,
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: b.accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#F2F0EB] truncate">{s.biome}</p>
                    <p className="text-[11px] text-[#6B7280]">{s.mood} · {fmtRelative(s.created_at)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[13px] font-semibold text-[#F2F0EB]">{s.duration_min}m</p>
                    <p className="text-[10px]" style={{ color: s.completed ? "#22C55E" : "#6B7280" }}>
                      {s.completed ? "complete" : "partial"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-[13px] text-[#6B7280]">
            No sessions yet — begin your first practice above.
          </p>
        </div>
      )}
    </div>
    </>
  );
}
