"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Plus, Layers, Check, ChevronRight, TrendingDown, Star, Edit2, Copy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const plans = [
  {
    id: "1",
    name: "ES Trend Continuation",
    description: "High-probability long/short setups on ES during NY session using 4H trend + 15m entry confluence.",
    grade: "A+",
    winRate: 72,
    trades: 45,
    avgRR: 2.1,
    pnl: 8240,
    active: true,
    tags: ["ES", "Trend", "NY Session"],
    entries: [
      "Price breaks key resistance/support with conviction candle",
      "Wait for 15m retest of broken level",
      "Confirmation: second candle closes in breakout direction",
    ],
    exits: [
      "Stop: below/above the broken structure (max 8 ticks)",
      "Target 1: 1.5R — take 50% off",
      "Target 2: 3R — close remainder, trail to BE after T1",
    ],
    invalidations: [
      "Price immediately reverses back through breakout level",
      "Volume dries up on breakout bar",
      "Macro news imminent within 30 mins",
    ],
    conditions: [
      "Strong 4H trend direction confirmed",
      "Volume expanding on breakout",
      "No major news in the next 30 min",
    ],
  },
  {
    id: "2",
    name: "GC Support Bounce",
    description: "Gold bounces off major support with volume confirmation.",
    grade: "A",
    winRate: 68,
    trades: 28,
    avgRR: 1.9,
    pnl: 5480,
    active: true,
    tags: ["GC", "Support", "Bounce"],
    entries: ["Price reaches tested support zone", "Wait for rejection wick on 5m", "Enter on close of reversal candle"],
    exits: ["Stop: below wick low", "Target: next resistance or 2R", "Scale out 50% at 1R"],
    invalidations: ["Support breaks with strong close below", "No clear bounce signal"],
    conditions: ["Clear horizontal support with 2+ touches", "Daily trend aligned"],
  },
  {
    id: "3",
    name: "London Checklist",
    description: "London session open plays with market structure alignment.",
    grade: "B+",
    winRate: 61,
    trades: 19,
    avgRR: 1.5,
    pnl: 2840,
    active: false,
    tags: ["FX", "London", "Morning"],
    entries: ["Mark Asian range high/low", "Wait for London breakout at open", "Enter on retrace to breakout level"],
    exits: ["Stop: opposite side of Asian range", "Target: 1.5× Asian range size"],
    invalidations: ["Fake breakout — price returns inside range within 15m"],
    conditions: ["Clear Asian range defined", "No high-impact news at open"],
  },
];

const gradeColors: Record<string, string> = {
  "A+": "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/25",
  "A": "text-[#4BA3D4] bg-[#4BA3D4]/10 border-[#4BA3D4]/25",
  "B+": "text-[#D9CA82] bg-[#D9CA82]/10 border-[#D9CA82]/25",
  "B": "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25",
  "C": "text-[#6B7280] bg-white/[0.04] border-white/[0.08]",
};

export default function EdgePage() {
  const [selected, setSelected] = useState(plans[0].id);
  const [showNew, setShowNew] = useState(false);
  const selectedPlan = plans.find((p) => p.id === selected)!;

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Edge"
        subtitle="Build and refine your trading playbooks — your rules, biases, and edge in one place."
        action={
          <Button size="sm" onClick={() => setShowNew(true)}>
            <Plus className="w-3.5 h-3.5" />
            New Plan
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        }
      />

      <main className="flex-1 p-6 flex gap-6 overflow-hidden">
        {/* Left panel */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-2">
          <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-widest px-1 mb-1">MY PLANS</p>

          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={cn(
                "w-full text-left rounded-2xl p-4 border transition-all duration-200",
                selected === plan.id
                  ? "bg-[#03588C]/12 border-[#03588C]/30"
                  : "glass hover:bg-white/[0.04]"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", gradeColors[plan.grade] ?? gradeColors["C"])}>{plan.grade}</span>
                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border",
                  plan.active ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-white/[0.04] text-[#6B7280] border-white/[0.07]")}>
                  {plan.active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm font-semibold text-[#F2F0EB] mb-1">{plan.name}</p>
              <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
                <span className="text-[#22C55E] font-semibold">{plan.winRate}% WR</span>
                <span>·</span>
                <span>{plan.trades} trades</span>
                <span>·</span>
                <span>{plan.avgRR}R</span>
              </div>
            </button>
          ))}

          {/* AI suggestion */}
          <div className="glass rounded-2xl p-4 mt-2 border border-[#03588C]/15 bg-[#03588C]/[0.03]">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-[#4BA3D4]" />
              <p className="text-xs font-semibold text-[#4BA3D4]">AI Suggestion</p>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-relaxed mb-2">
              Based on your data, you have an untapped edge in <span className="text-[#F2F0EB]">EMA pullback setups</span> during the first 2 hours. Estimated 69% win rate.
            </p>
            <button className="text-xs text-[#4BA3D4] hover:text-[#F2F0EB] transition-colors flex items-center gap-1">
              Create strategy <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPlan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="glass rounded-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#03588C]/15 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-[#4BA3D4]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[15px] font-semibold text-[#F2F0EB]">{selectedPlan.name}</h2>
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", gradeColors[selectedPlan.grade])}>{selectedPlan.grade}</span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5">{selectedPlan.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm"><Copy className="w-3.5 h-3.5" /> Clone</Button>
                  <Button variant="outline" size="sm"><Edit2 className="w-3.5 h-3.5" /> Edit</Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Win Rate", value: `${selectedPlan.winRate}%`, color: "text-[#22C55E]" },
                    { label: "Total PnL", value: `+$${selectedPlan.pnl.toLocaleString()}`, color: "text-[#22C55E]" },
                    { label: "Avg RR", value: `${selectedPlan.avgRR}×`, color: "text-[#4BA3D4]" },
                    { label: "Total Trades", value: `${selectedPlan.trades}`, color: "text-[#F2F0EB]" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3.5">
                      <p className="text-[10px] text-[#6B7280] uppercase tracking-wide font-medium mb-1.5">{s.label}</p>
                      <p className={cn("text-xl font-bold font-mono-nums", s.color)}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {selectedPlan.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs border border-[#03588C]/25 bg-[#03588C]/08 text-[#4BA3D4]">{tag}</span>
                  ))}
                </div>

                {/* 3-col rules */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /> Entry Criteria
                    </h3>
                    <div className="space-y-2">
                      {selectedPlan.entries.map((e, i) => (
                        <div key={i} className="flex gap-2 text-xs text-[#6B7280] bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5">
                          <div className="w-4 h-4 rounded-full bg-[#22C55E]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-[#22C55E]" />
                          </div>
                          {e}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4BA3D4]" /> Exit Rules
                    </h3>
                    <div className="space-y-2">
                      {selectedPlan.exits.map((e, i) => (
                        <div key={i} className="flex gap-2 text-xs text-[#6B7280] bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5">
                          <div className="w-4 h-4 rounded-full bg-[#03588C]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <ChevronRight className="w-2.5 h-2.5 text-[#4BA3D4]" />
                          </div>
                          {e}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Invalidations
                    </h3>
                    <div className="space-y-2">
                      {selectedPlan.invalidations.map((e, i) => (
                        <div key={i} className="flex gap-2 text-xs text-[#6B7280] bg-red-500/[0.04] border border-red-500/15 rounded-xl p-2.5">
                          <TrendingDown className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                          {e}
                        </div>
                      ))}
                    </div>

                    <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mt-5 mb-3 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D9CA82]" /> Ideal Conditions
                    </h3>
                    <div className="space-y-2">
                      {selectedPlan.conditions.map((c, i) => (
                        <div key={i} className="flex gap-2 text-xs text-[#6B7280] bg-[#D9CA82]/[0.04] border border-[#D9CA82]/15 rounded-xl p-2.5">
                          <Star className="w-3 h-3 text-[#D9CA82] flex-shrink-0 mt-0.5" />
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
      </main>
    </div>
  );
}
