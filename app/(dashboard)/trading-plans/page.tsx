"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Plus, Map, Check, X, ChevronRight, Edit2, Star, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "1",
    name: "A-Game Trend Trader",
    description: "High-probability trend continuation setups on ES and NQ during NY session",
    active: true,
    riskPerTrade: 1.5,
    maxDailyLoss: 3,
    maxDrawdown: 8,
    rules: [
      "Only trade in the direction of the 4H trend",
      "Wait for price to break and retest a key level",
      "Enter only on second confirmation candle",
      "Stop loss must be behind structure — no tight stops",
      "Take partial profits at 1R, let remainder run to 2R",
      "No more than 3 trades per session",
      "Stop trading after hitting daily max loss",
      "No trading between 12:00–1:30 PM EST (lunch chop)",
    ],
    setupTypes: ["Trend Continuation", "Breakout & Retest", "EMA Confluence"],
    sessionTimes: ["9:30 AM – 11:30 AM EST", "2:00 PM – 4:00 PM EST"],
    stats: { adherence: 87, trades: 98, winRate: 72, pnl: "+$18,240" },
  },
  {
    id: "2",
    name: "Scalper — Morning Momentum",
    description: "Quick scalps on ES during the first 30 minutes of NY open",
    active: false,
    riskPerTrade: 0.5,
    maxDailyLoss: 1.5,
    maxDrawdown: 4,
    rules: [
      "Only trade during 9:30–10:00 AM EST",
      "Maximum 5 scalp trades per session",
      "Risk max 0.5% per trade",
      "Target 1× R per trade — no holding",
      "No trading against gap direction",
    ],
    setupTypes: ["Opening Range Breakout", "Gap Fill", "Momentum Scalp"],
    sessionTimes: ["9:30 AM – 10:00 AM EST"],
    stats: { adherence: 65, trades: 44, winRate: 58, pnl: "+$2,480" },
  },
];

export default function TradingPlansPage() {
  const [selectedId, setSelectedId] = useState(plans[0].id);
  const selected = plans.find((p) => p.id === selectedId)!;

  return (
    <div className="flex flex-col flex-1">
      <Header title="Trading Plans" subtitle="Define your rules. Follow them ruthlessly." />

      <main className="flex-1 p-6">
        <div className="flex gap-6">
          {/* Plan list */}
          <div className="w-64 flex-shrink-0 flex flex-col gap-3">
            <Button className="w-full" size="sm">
              <Plus className="w-4 h-4" />
              New Plan
            </Button>

            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedId(plan.id)}
                className={cn(
                  "w-full text-left rounded-2xl p-4 border transition-all duration-200",
                  selectedId === plan.id
                    ? "bg-indigo-500/10 border-indigo-500/30"
                    : "glass hover:bg-white/[0.05]"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium border", plan.active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/[0.04] text-slate-500 border-white/[0.08]")}>
                    {plan.active ? "Active" : "Inactive"}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <p className="text-sm font-semibold text-white mb-1">{plan.name}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{plan.description}</p>
              </button>
            ))}
          </div>

          {/* Plan detail */}
          <div className="flex-1 glass rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                  <Map className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-white">{selected.name}</h2>
                  <p className="text-xs text-slate-500">{selected.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant={selected.active ? "outline" : "default"}
                  className={selected.active ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10" : ""}
                >
                  {selected.active ? (
                    <><ToggleRight className="w-4 h-4" /> Active</>
                  ) : (
                    <><ToggleLeft className="w-4 h-4" /> Activate</>
                  )}
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Rule Adherence", value: `${selected.stats.adherence}%`, color: selected.stats.adherence >= 80 ? "text-emerald-400" : "text-amber-400" },
                  { label: "Total Trades", value: selected.stats.trades.toString(), color: "text-white" },
                  { label: "Win Rate", value: `${selected.stats.winRate}%`, color: "text-indigo-400" },
                  { label: "Total PnL", value: selected.stats.pnl, color: "text-emerald-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3.5">
                    <p className="text-[11px] text-slate-500 mb-1">{s.label}</p>
                    <p className={cn("text-lg font-bold font-display", s.color)}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Risk parameters */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Risk Parameters</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Risk Per Trade", value: `${selected.riskPerTrade}%`, desc: "of account" },
                    { label: "Max Daily Loss", value: `${selected.maxDailyLoss}%`, desc: "hard stop" },
                    { label: "Max Drawdown", value: `${selected.maxDrawdown}%`, desc: "reset trigger" },
                  ].map((r) => (
                    <div key={r.label} className="bg-rose-500/[0.04] border border-rose-500/15 rounded-xl p-3.5">
                      <p className="text-[11px] text-slate-500 mb-1">{r.label}</p>
                      <p className="text-lg font-bold text-rose-400">{r.value}</p>
                      <p className="text-[10px] text-slate-600">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  Trading Rules ({selected.rules.length})
                </h3>
                <div className="space-y-2">
                  {selected.rules.map((rule, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] transition-colors">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-indigo-400" />
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Setup types + sessions */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Allowed Setups</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.setupTypes.map((s) => (
                      <span key={s} className="px-3 py-1 rounded-full text-xs border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Trading Sessions</h3>
                  <div className="space-y-2">
                    {selected.sessionTimes.map((s) => (
                      <div key={s} className="flex items-center gap-2 text-sm text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
