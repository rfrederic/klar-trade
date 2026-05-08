"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Plus, Layers, Star, Copy, TrendingUp, TrendingDown, Check, ChevronRight, Zap, Target, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const strategies = [
  {
    id: "1",
    name: "ES Trend Continuation",
    description: "High-probability long/short setups on ES during NY session using 4H trend + 15m entry confluence.",
    grade: "A+",
    winRate: 72,
    trades: 45,
    avgRR: 2.1,
    pnl: 8240,
    tags: ["ES", "Trend", "NY Session", "Momentum"],
    idealConditions: ["Strong 4H trend direction", "Volume expanding on breakout", "Macro tailwind aligned"],
    entries: [
      "Price breaks key resistance/support with conviction candle",
      "Wait for a 15m retest of the broken level",
      "Confirmation: second candle closes in breakout direction",
      "Entry on the third candle open or limit at retest level",
    ],
    exits: [
      "Stop: below/above the structure that was broken (max 8 ticks)",
      "Target 1: 1.5R — take 50% off",
      "Target 2: 3R — close remainder",
      "Trail stop to breakeven after T1 hit",
    ],
    invalidations: [
      "Price immediately reverses back through breakout level",
      "Volume dries up significantly on breakout bar",
      "Macro news imminent within 30 mins",
    ],
    active: true,
    color: "indigo",
  },
  {
    id: "2",
    name: "GC Support Bounce",
    description: "Gold bounces off major support with volume confirmation. Best in trending markets with clear structure.",
    grade: "A",
    winRate: 68,
    trades: 28,
    avgRR: 1.9,
    pnl: 5480,
    tags: ["GC", "Support", "Bounce", "Structure"],
    idealConditions: ["Clear horizontal support with 2+ prior touches", "Daily trend aligned with trade direction", "Low volatility environment"],
    entries: [
      "Price reaches tested support zone",
      "Wait for rejection wick or reversal candle on 5m",
      "Enter on close of reversal candle",
    ],
    exits: [
      "Stop: below the wick low of the reversal candle",
      "Target: next resistance level or 2R",
      "Scale out 50% at 1R",
    ],
    invalidations: [
      "Support breaks with a strong close below",
      "Price consolidates at support without a clear bounce signal",
    ],
    active: true,
    color: "amber",
  },
  {
    id: "3",
    name: "NQ Opening Range Breakout",
    description: "Trade the first 30-minute range breakout on NQ with momentum confirmation. High win rate on trend days.",
    grade: "B+",
    winRate: 61,
    trades: 19,
    avgRR: 1.5,
    pnl: 2840,
    tags: ["NQ", "ORB", "Morning", "Breakout"],
    idealConditions: ["Pre-market shows directional bias", "Gap in direction of trade", "No major news in first hour"],
    entries: [
      "Define the 9:30–10:00 AM opening range high and low",
      "Enter on first 5m close beyond the range",
      "Volume must be above average on the breakout candle",
    ],
    exits: [
      "Stop: opposite side of the opening range",
      "Target: 2× the opening range size",
    ],
    invalidations: [
      "Multiple failed breakout attempts",
      "Volume below average on breakout",
    ],
    active: false,
    color: "cyan",
  },
];

const gradeColors: Record<string, { card: string; badge: string; dot: string }> = {
  "A+": { card: "border-emerald-500/20 bg-emerald-500/[0.04]", badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-400" },
  A: { card: "border-indigo-500/20 bg-indigo-500/[0.04]", badge: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30", dot: "bg-indigo-400" },
  "B+": { card: "border-violet-500/20 bg-violet-500/[0.04]", badge: "text-violet-400 bg-violet-500/10 border-violet-500/30", dot: "bg-violet-400" },
};

export default function StrategiesPage() {
  const [selected, setSelected] = useState(strategies[0].id);
  const selectedStrategy = strategies.find((s) => s.id === selected)!;
  const gc = gradeColors[selectedStrategy.grade] ?? gradeColors["B+"];

  return (
    <div className="flex flex-col flex-1">
      <Header title="Strategy Playbook" subtitle="Define your setups. Know your edge. Execute with precision." />

      <main className="flex-1 p-6">
        <div className="flex gap-6 h-full">

          {/* Strategy list */}
          <div className="w-72 flex-shrink-0 flex flex-col gap-3">
            <Button className="w-full" size="sm">
              <Plus className="w-4 h-4" />
              New Strategy
            </Button>

            <div className="space-y-2">
              {strategies.map((s) => {
                const g = gradeColors[s.grade] ?? gradeColors["B+"];
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s.id)}
                    className={cn(
                      "w-full text-left rounded-2xl p-4 border transition-all duration-200",
                      selected === s.id ? "bg-indigo-500/10 border-indigo-500/30" : "glass hover:bg-white/[0.05]"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", g.badge)}>{s.grade}</span>
                      <div className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium border", s.active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/[0.04] text-slate-500 border-white/[0.08]")}>
                        {s.active ? "Active" : "Inactive"}
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">{s.name}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="text-emerald-400 font-semibold">{s.winRate}% WR</span>
                      <span>·</span>
                      <span>{s.trades} trades</span>
                      <span>·</span>
                      <span>{s.avgRR}R</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* AI Suggestions */}
            <div className="glass rounded-2xl p-4 mt-2 border border-indigo-500/15 bg-indigo-500/[0.04]">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <p className="text-xs font-semibold text-indigo-400">AI Suggestion</p>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                Based on your data, you have an untapped edge in <span className="text-white">EMA pullback setups</span> during the first 2 hours. Win rate estimated at 69%.
              </p>
              <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                Create strategy <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Strategy detail */}
          <div className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedStrategy.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className={cn("glass rounded-2xl overflow-hidden border", gc.card)}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
                      <Layers className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[15px] font-semibold text-white">{selectedStrategy.name}</h2>
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", gc.badge)}>{selectedStrategy.grade}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{selectedStrategy.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Copy className="w-3.5 h-3.5" />
                      Clone
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: "Win Rate", value: `${selectedStrategy.winRate}%`, color: "text-emerald-400", icon: Target },
                      { label: "Total PnL", value: `+$${selectedStrategy.pnl.toLocaleString()}`, color: "text-emerald-400", icon: TrendingUp },
                      { label: "Avg RR", value: `${selectedStrategy.avgRR}×`, color: "text-indigo-400", icon: Star },
                      { label: "Total Trades", value: selectedStrategy.trades.toString(), color: "text-white", icon: Layers },
                    ].map((s) => (
                      <div key={s.label} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <s.icon className="w-3.5 h-3.5 text-slate-500" />
                          <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">{s.label}</p>
                        </div>
                        <p className={cn("text-xl font-bold font-display", s.color)}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {selectedStrategy.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full text-xs border border-indigo-500/20 bg-indigo-500/8 text-indigo-300">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 3-column rules */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Entry criteria */}
                    <div>
                      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Entry Criteria
                      </h3>
                      <div className="space-y-2">
                        {selectedStrategy.entries.map((e, i) => (
                          <div key={i} className="flex gap-2 text-xs text-slate-400 bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5">
                            <div className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                            </div>
                            {e}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Exit rules */}
                    <div>
                      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        Exit Rules
                      </h3>
                      <div className="space-y-2">
                        {selectedStrategy.exits.map((e, i) => (
                          <div key={i} className="flex gap-2 text-xs text-slate-400 bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5">
                            <div className="w-4 h-4 rounded-full bg-indigo-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <ChevronRight className="w-2.5 h-2.5 text-indigo-400" />
                            </div>
                            {e}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Invalidations */}
                    <div>
                      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        Invalidations
                      </h3>
                      <div className="space-y-2">
                        {selectedStrategy.invalidations.map((e, i) => (
                          <div key={i} className="flex gap-2 text-xs text-slate-400 bg-rose-500/[0.04] border border-rose-500/15 rounded-lg p-2.5">
                            <div className="w-4 h-4 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <TrendingDown className="w-2.5 h-2.5 text-rose-400" />
                            </div>
                            {e}
                          </div>
                        ))}
                      </div>

                      {/* Ideal conditions */}
                      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mt-5 mb-3 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Ideal Conditions
                      </h3>
                      <div className="space-y-2">
                        {selectedStrategy.idealConditions.map((c, i) => (
                          <div key={i} className="flex gap-2 text-xs text-slate-400 bg-amber-500/[0.04] border border-amber-500/15 rounded-lg p-2.5">
                            <Star className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
