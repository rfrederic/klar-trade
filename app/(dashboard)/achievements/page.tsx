"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { Loader2, Trophy, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { Achievement } from "@/app/api/achievements/route";

type Category = "all" | "volume" | "performance" | "discipline" | "journaling";
type Filter = "all" | "unlocked" | "locked";

interface Stats {
  totalXp: number;
  unlocked: number;
  total: number;
  level: string;
  levelProgress: number;
  nextLevel: string | null;
  nextLevelXp: number | null;
}

const TIER_STYLES: Record<string, string> = {
  bronze:   "border-[#CD7F32]/30 bg-[#CD7F32]/08 text-[#CD7F32]",
  silver:   "border-white/20 bg-white/[0.06] text-[#C0C0C0]",
  gold:     "border-[#D9CA82]/30 bg-[#D9CA82]/08 text-[#D9CA82]",
  platinum: "border-[#4BA3D4]/30 bg-[#4BA3D4]/08 text-[#4BA3D4]",
};

const TIER_GLOW: Record<string, string> = {
  bronze:   "shadow-[0_0_20px_rgba(205,127,50,0.15)]",
  silver:   "shadow-[0_0_20px_rgba(192,192,192,0.1)]",
  gold:     "shadow-[0_0_20px_rgba(217,202,130,0.2)]",
  platinum: "shadow-[0_0_20px_rgba(75,163,212,0.2)]",
};

const CAT_LABELS: Record<Category, string> = {
  all: "All",
  volume: "Volume",
  performance: "Performance",
  discipline: "Discipline",
  journaling: "Journaling",
};

const LEVEL_COLORS: Record<string, string> = {
  Novice:     "text-[#6B7280]",
  Apprentice: "text-[#CD7F32]",
  Trader:     "text-[#C0C0C0]",
  Skilled:    "text-[#D9CA82]",
  Expert:     "text-[#4BA3D4]",
  Master:     "text-[#22C55E]",
  Elite:      "text-[#D9CA82]",
};

function AchievementCard({ a, index }: { a: Achievement; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
      className={cn(
        "glass rounded-2xl p-4 border transition-all",
        a.unlocked
          ? cn("border border-opacity-100", TIER_STYLES[a.tier].split(" ")[0], TIER_GLOW[a.tier])
          : "border-white/[0.06] opacity-60"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("text-2xl w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          a.unlocked ? TIER_STYLES[a.tier] : "bg-white/[0.04] grayscale")}>
          {a.unlocked ? a.icon : <Lock className="w-4 h-4 text-[#6B7280]" />}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={cn("text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border",
            TIER_STYLES[a.tier])}>
            {a.tier}
          </span>
          <span className="text-[10px] text-[#6B7280] font-mono-nums">+{a.xp} XP</span>
        </div>
      </div>

      <h3 className={cn("text-sm font-semibold mb-0.5", a.unlocked ? "text-[#F2F0EB]" : "text-[#6B7280]")}>
        {a.title}
      </h3>
      <p className="text-[11px] text-[#6B7280] mb-3 leading-relaxed">{a.description}</p>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700",
              a.unlocked
                ? a.tier === "bronze" ? "bg-[#CD7F32]"
                  : a.tier === "silver" ? "bg-[#C0C0C0]"
                  : a.tier === "gold" ? "bg-[#D9CA82]"
                  : "bg-[#4BA3D4]"
                : "bg-white/20"
            )}
            style={{ width: `${a.progress * 100}%` }}
          />
        </div>
        <p className={cn("text-[10px] text-right", a.unlocked ? "text-[#22C55E]" : "text-[#6B7280]")}>
          {a.progressLabel}
        </p>
      </div>
    </motion.div>
  );
}

export default function AchievementsPage() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>("all");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    fetch("/api/achievements")
      .then((r) => r.json())
      .then((d) => {
        setAchievements(d.achievements ?? []);
        setStats(d.stats ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = achievements
    .filter((a) => category === "all" || a.category === category)
    .filter((a) => filter === "all" || (filter === "unlocked" ? a.unlocked : !a.unlocked))
    .sort((a, b) => {
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      return b.progress - a.progress;
    });

  const unlockedInView = filtered.filter((a) => a.unlocked).length;
  const totalInView = filtered.length;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header
        title="Achievements"
        subtitle="Track your progress. Earn XP. Level up your trading."
      />

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-[#6B7280]" />
          </div>
        ) : (
          <>
            {/* Level card */}
            {stats && (
              <div className="p-6 pb-0">
                <div className="glass rounded-2xl p-5 border border-[#03588C]/20 bg-[#03588C]/[0.04]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#03588C]/20 border border-[#03588C]/30 flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-[#4BA3D4]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-[#6B7280] uppercase tracking-wide font-semibold mb-0.5">Current Level</p>
                        <h2 className={cn("text-2xl font-bold", LEVEL_COLORS[stats.level] ?? "text-[#F2F0EB]")}>
                          {stats.level}
                        </h2>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#F2F0EB] font-mono-nums">{stats.totalXp} <span className="text-sm text-[#6B7280] font-normal">XP</span></p>
                      <p className="text-[11px] text-[#6B7280]">{stats.unlocked}/{stats.total} unlocked</p>
                    </div>
                  </div>

                  {/* XP progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                      <span>{stats.level}</span>
                      {stats.nextLevel && <span>{stats.nextLevel} ({stats.nextLevelXp} XP)</span>}
                    </div>
                    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.levelProgress * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-[#03588C] to-[#4BA3D4]"
                      />
                    </div>
                    {stats.nextLevel && (
                      <p className="text-[10px] text-[#6B7280]">
                        {stats.nextLevelXp! - stats.totalXp} XP to {stats.nextLevel}
                      </p>
                    )}
                    {!stats.nextLevel && (
                      <p className="text-[10px] text-[#D9CA82]">Maximum level reached</p>
                    )}
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/[0.05]">
                    {[
                      { label: "Unlocked", value: stats.unlocked },
                      { label: "Locked", value: stats.total - stats.unlocked },
                      { label: "Total XP", value: stats.totalXp },
                      { label: "Completion", value: `${Math.round((stats.unlocked / stats.total) * 100)}%` },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-0.5">{s.label}</p>
                        <p className="text-base font-bold text-[#F2F0EB] font-mono-nums">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* No trades empty state */}
            {stats && stats.unlocked === 0 && achievements.filter(a => a.progress > 0).length === 0 && (
              <div className="px-6 pt-4">
                <div className="glass rounded-2xl p-5 text-center border border-[#03588C]/15">
                  <p className="text-sm text-[#6B7280] mb-3">Start trading to unlock achievements</p>
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => router.push("/journal")} className="text-xs text-[#4BA3D4] hover:text-white transition-colors flex items-center gap-1">
                      Open Journal <ArrowRight className="w-3 h-3" />
                    </button>
                    <span className="text-[#6B7280]">·</span>
                    <button onClick={() => router.push("/brokers")} className="text-xs text-[#4BA3D4] hover:text-white transition-colors flex items-center gap-1">
                      Connect Broker <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="px-6 pt-4 pb-2 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                {(Object.keys(CAT_LABELS) as Category[]).map((c) => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
                      category === c ? "bg-[#03588C] text-white" : "text-[#6B7280] hover:text-[#F2F0EB]")}>
                    {CAT_LABELS[c]}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {(["all", "unlocked", "locked"] as Filter[]).map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={cn("px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all border",
                      filter === f
                        ? "bg-white/[0.08] border-white/[0.15] text-[#F2F0EB]"
                        : "border-white/[0.06] text-[#6B7280] hover:text-[#F2F0EB]")}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <p className="px-6 pb-3 text-[11px] text-[#6B7280]">{unlockedInView}/{totalInView} shown</p>

            {/* Achievement grid */}
            <div className="px-6 pb-6">
              <AnimatePresence mode="wait">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filtered.map((a, i) => (
                    <AchievementCard key={a.id} a={a} index={i} />
                  ))}
                </div>
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
