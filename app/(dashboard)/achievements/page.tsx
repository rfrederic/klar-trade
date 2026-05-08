"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Trophy, Flame, Star, Target, Shield, Zap, Brain, TrendingUp, Lock, Check, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const achievements = [
  {
    id: "first_win",
    label: "First Blood",
    description: "Log your first profitable trade",
    icon: Target,
    color: "emerald",
    earned: true,
    date: "Jan 3, 2024",
    xp: 50,
  },
  {
    id: "streak_7",
    label: "7-Day Warrior",
    description: "Maintain a 7-day green streak",
    icon: Flame,
    color: "amber",
    earned: true,
    date: "Jan 12, 2024",
    xp: 150,
  },
  {
    id: "discipline_90",
    label: "Iron Discipline",
    description: "Reach a discipline score of 90+",
    icon: Shield,
    color: "indigo",
    earned: true,
    date: "Jan 18, 2024",
    xp: 200,
  },
  {
    id: "psych_cert",
    label: "Psychology Certified",
    description: "Complete the Trading Psychology 101 course",
    icon: Brain,
    color: "violet",
    earned: true,
    date: "Jan 22, 2024",
    xp: 300,
  },
  {
    id: "streak_14",
    label: "Fortnight Focus",
    description: "Maintain a 14-day discipline streak",
    icon: Flame,
    color: "amber",
    earned: false,
    progress: 6,
    total: 14,
    xp: 400,
  },
  {
    id: "rr_100",
    label: "R-Master",
    description: "Execute 100 trades with avg RR above 2",
    icon: TrendingUp,
    color: "cyan",
    earned: false,
    progress: 45,
    total: 100,
    xp: 500,
  },
  {
    id: "no_revenge",
    label: "Ghost Mode",
    description: "30 days zero revenge trading detected",
    icon: Zap,
    color: "rose",
    earned: false,
    progress: 18,
    total: 30,
    xp: 600,
  },
  {
    id: "elite_rank",
    label: "Elite Trader",
    description: "Reach Elite rank on the global leaderboard",
    icon: Trophy,
    color: "amber",
    earned: false,
    locked: true,
    xp: 1000,
  },
  {
    id: "10k_pnl",
    label: "5-Figure Club",
    description: "Reach $10,000 cumulative profit in journal",
    icon: Star,
    color: "emerald",
    earned: false,
    progress: 8240,
    total: 10000,
    xp: 750,
  },
];

const challenges = [
  {
    id: "1",
    label: "May Consistency Challenge",
    description: "Log every trade this month. No exceptions.",
    progress: 18,
    total: 31,
    reward: "500 XP + Consistency Badge",
    daysLeft: 13,
    active: true,
  },
  {
    id: "2",
    label: "Zero Overtrading Week",
    description: "Stay within your max daily trade limit all week.",
    progress: 3,
    total: 5,
    reward: "200 XP",
    daysLeft: 2,
    active: true,
  },
  {
    id: "3",
    label: "Plan Before You Trade",
    description: "Write a trade plan before every entry this week.",
    progress: 5,
    total: 5,
    reward: "150 XP — Completed!",
    daysLeft: 0,
    active: false,
    completed: true,
  },
];

const levels = [
  { name: "Novice", minXp: 0, color: "slate" },
  { name: "Developing", minXp: 500, color: "violet" },
  { name: "Consistent", minXp: 1500, color: "indigo" },
  { name: "Advanced", minXp: 3000, color: "cyan" },
  { name: "Pro", minXp: 6000, color: "emerald" },
  { name: "Elite", minXp: 10000, color: "amber" },
];

const currentXp = 1250;
const currentLevel = levels.filter((l) => currentXp >= l.minXp).pop()!;
const nextLevel = levels[levels.indexOf(currentLevel) + 1];
const xpToNext = nextLevel ? nextLevel.minXp - currentXp : 0;
const levelProgress = nextLevel ? ((currentXp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100 : 100;

const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
const streakData = [true, true, true, true, true, false, false]; // current week
const last4Weeks = [
  [true, true, true, false, true, false, false],
  [true, true, true, true, true, false, false],
  [false, true, true, true, true, false, false],
  [true, true, true, true, true, false, false],
];

export default function AchievementsPage() {
  const [tab, setTab] = useState<"achievements" | "challenges" | "progress">("achievements");
  const earned = achievements.filter((a) => a.earned);
  const inProgress = achievements.filter((a) => !a.earned && !a.locked);
  const locked = achievements.filter((a) => a.locked);

  return (
    <div className="flex flex-col flex-1">
      <Header title="Achievements" subtitle="Every rep counts. Track your growth." />

      <main className="flex-1 p-6 space-y-6">

        {/* Level card */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow-sm">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-lg font-bold text-white">{currentLevel.name} Trader</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 font-medium">
                    {currentXp.toLocaleString()} XP
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {nextLevel ? `${xpToNext.toLocaleString()} XP to reach ${nextLevel.name}` : "Maximum rank achieved"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold font-display text-white">{earned.length}</p>
              <p className="text-xs text-slate-500">badges earned</p>
            </div>
          </div>

          {/* XP progress bar */}
          {nextLevel && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{currentLevel.name}</span>
                <span>{nextLevel.name}</span>
              </div>
              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Level markers */}
          <div className="flex items-center gap-2 mt-4">
            {levels.map((l, i) => (
              <div key={l.name} className="flex items-center gap-2">
                <div className={cn("flex flex-col items-center gap-1")}>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    currentXp >= l.minXp ? `bg-indigo-400` : "bg-white/10"
                  )} />
                  <span className={cn("text-[9px] font-medium", currentXp >= l.minXp ? "text-slate-400" : "text-slate-700")}>{l.name}</span>
                </div>
                {i < levels.length - 1 && (
                  <div className={cn("h-0.5 w-8 rounded-full mb-3", currentXp >= levels[i + 1].minXp ? "bg-indigo-400" : "bg-white/[0.06]")} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Streak + daily score row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Streak tracker */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Discipline Streak</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold font-display text-amber-400">6</span>
                <span className="text-xs text-slate-500">days</span>
              </div>
            </div>

            {/* This week */}
            <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mb-2">This week</p>
            <div className="flex gap-2 mb-4">
              {weekDays.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className={cn(
                    "w-full aspect-square rounded-lg flex items-center justify-center",
                    streakData[i] ? "bg-amber-500/20 border border-amber-500/30" : "bg-white/[0.04] border border-white/[0.06]"
                  )}>
                    {streakData[i] ? <Flame className="w-3.5 h-3.5 text-amber-400" /> : <span className="text-[10px] text-slate-700">—</span>}
                  </div>
                  <span className="text-[10px] text-slate-600">{d}</span>
                </div>
              ))}
            </div>

            {/* Past 4 weeks */}
            <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mb-2">Past 4 weeks</p>
            <div className="space-y-1.5">
              {last4Weeks.map((week, wi) => (
                <div key={wi} className="flex gap-1">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className={cn(
                        "flex-1 h-3 rounded-sm",
                        day ? "bg-amber-500/40" : "bg-white/[0.04]"
                      )}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Daily score card */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Today's Score</h3>
              </div>
              <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> May 7</span>
            </div>
            <div className="flex items-end gap-4 mb-5">
              <div>
                <p className="text-4xl font-bold font-display text-white">94</p>
                <p className="text-xs text-slate-500 mt-0.5">/ 100 Discipline</p>
              </div>
              <div className="pb-1 text-emerald-400 text-sm font-semibold">+3 vs yesterday</div>
            </div>

            <div className="space-y-2.5">
              {[
                { label: "Plan adherence", value: 100, color: "from-emerald-500 to-emerald-400" },
                { label: "Risk management", value: 95, color: "from-indigo-500 to-violet-500" },
                { label: "Emotional control", value: 88, color: "from-violet-500 to-purple-500" },
                { label: "Entry precision", value: 92, color: "from-cyan-500 to-indigo-500" },
              ].map((m) => (
                <div key={m.label} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{m.label}</span>
                    <span className="text-slate-300 font-medium">{m.value}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full bg-gradient-to-r", m.color)}
                      style={{ width: `${m.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl w-fit">
          {(["achievements", "challenges", "progress"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                tab === t ? "bg-indigo-500/20 text-indigo-400" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Achievements tab */}
        {tab === "achievements" && (
          <div className="space-y-6">
            {/* Earned */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Earned · {earned.length}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {earned.map((a) => (
                  <div key={a.id} className={cn("glass rounded-2xl p-4 border border-white/[0.07] bg-${a.color}-500/[0.03]")}>
                    <div className={`w-10 h-10 rounded-xl bg-${a.color}-500/15 flex items-center justify-center mb-3`}>
                      <a.icon className={`w-5 h-5 text-${a.color}-400`} />
                    </div>
                    <p className="text-sm font-semibold text-white mb-0.5">{a.label}</p>
                    <p className="text-[11px] text-slate-500 mb-2">{a.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-600">{a.date}</span>
                      <span className="text-[10px] font-semibold text-amber-400">+{a.xp} XP</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400 font-medium">Earned</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In Progress */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">In Progress · {inProgress.length}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {inProgress.map((a) => (
                  <div key={a.id} className="glass rounded-2xl p-4">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                      <a.icon className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-white mb-0.5">{a.label}</p>
                    <p className="text-[11px] text-slate-500 mb-3">{a.description}</p>
                    {"progress" in a && a.progress !== undefined && a.total !== undefined && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-600">{a.progress} / {a.total}</span>
                          <span className="text-indigo-400 font-semibold">{Math.round((a.progress / a.total) * 100)}%</span>
                        </div>
                        <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                            style={{ width: `${(a.progress / a.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-slate-600">Reward</span>
                      <span className="text-[10px] font-semibold text-amber-400">+{a.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Locked */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Locked · {locked.length}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {locked.map((a) => (
                  <div key={a.id} className="glass rounded-2xl p-4 opacity-40">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                      <Lock className="w-5 h-5 text-slate-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-400 mb-0.5">{a.label}</p>
                    <p className="text-[11px] text-slate-600">{a.description}</p>
                    <div className="flex items-center gap-1 mt-3">
                      <Lock className="w-3 h-3 text-slate-700" />
                      <span className="text-[10px] text-slate-700">Locked</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Challenges tab */}
        {tab === "challenges" && (
          <div className="space-y-4 max-w-2xl">
            {challenges.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "glass rounded-2xl p-5",
                  c.completed ? "opacity-60" : ""
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">{c.label}</h3>
                      {c.completed && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400 font-medium">Done</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{c.description}</p>
                  </div>
                  {!c.completed && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 flex-shrink-0 ml-4">
                      <Calendar className="w-3 h-3" />
                      {c.daysLeft}d left
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-indigo-400 font-semibold">{c.progress} / {c.total}</span>
                  </div>
                  <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        c.completed ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-500 to-violet-500"
                      )}
                      style={{ width: `${(c.progress / c.total) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                    <Trophy className="w-3 h-3" />
                    {c.reward}
                  </div>
                  {!c.completed && (
                    <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                      Details <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Upcoming challenge teaser */}
            <div className="glass rounded-2xl p-5 border-dashed border-white/[0.1] text-center">
              <p className="text-sm font-medium text-slate-400 mb-1">New challenge starts June 1</p>
              <p className="text-xs text-slate-600">The Consistency Gauntlet — 30 days, 1 rule: never break your max daily loss limit.</p>
              <div className="inline-flex items-center gap-1.5 mt-3 text-xs text-indigo-400">
                <Zap className="w-3.5 h-3.5" />
                1,000 XP reward
              </div>
            </div>
          </div>
        )}

        {/* Progress tab */}
        {tab === "progress" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Total XP Earned", value: "1,250 XP", sub: "Rank: Developing", icon: Star, color: "indigo" },
              { label: "Best Streak", value: "14 days", sub: "Jan 8 – Jan 21", icon: Flame, color: "amber" },
              { label: "Achievements Earned", value: `${earned.length} / ${achievements.length}`, sub: `${Math.round((earned.length / achievements.length) * 100)}% complete`, icon: Trophy, color: "emerald" },
              { label: "Challenges Won", value: "1 / 3", sub: "This month", icon: Target, color: "violet" },
              { label: "Avg. Daily Score", value: "91.4", sub: "Last 30 days", icon: TrendingUp, color: "cyan" },
              { label: "Discipline Tier", value: "Pro", sub: "Top 12% of users", icon: Shield, color: "rose" },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/15 flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mb-0.5">{stat.label}</p>
                  <p className="text-xl font-bold font-display text-white">{stat.value}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
