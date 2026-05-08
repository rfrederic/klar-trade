"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Brain, Shield, TrendingUp, Calendar, BookOpen, Zap, BarChart2 } from "lucide-react";

const metrics = [
  { label: "Total PnL", value: "+$28,480", change: "+12.4%", positive: true },
  { label: "Win Rate", value: "68%", change: "+5% WoW", positive: true },
  { label: "Discipline Score", value: "94/100", change: "Elite", positive: true },
  { label: "Risk Used", value: "1.4%", change: "of 2% max", positive: true },
  { label: "Profit Factor", value: "2.4x", change: "Strong", positive: true },
  { label: "Max Drawdown", value: "3.2%", change: "-1.1% MoM", positive: true },
];

const recentTrades = [
  { symbol: "ES", type: "Long", entry: "5,842", exit: "5,867", pnl: "+$480", win: true, rules: true },
  { symbol: "NQ", type: "Short", entry: "21,340", exit: "21,420", pnl: "-$180", win: false, rules: false },
  { symbol: "GC", type: "Long", entry: "2,680", exit: "2,712", pnl: "+$680", win: true, rules: true },
  { symbol: "CL", type: "Long", entry: "78.40", exit: "79.20", pnl: "+$340", win: true, rules: true },
];

const insights = [
  { icon: Brain, color: "text-indigo-400", bg: "bg-indigo-500/15", text: "Your win rate is 23% higher on trend continuation setups. Focus there today." },
  { icon: Shield, color: "text-emerald-400", bg: "bg-emerald-500/15", text: "Excellent risk management this week. 6 consecutive sessions under 1.5% risk." },
  { icon: Zap, color: "text-amber-400", bg: "bg-amber-500/15", text: "Pattern detected: You overtrade between 2-3 PM EST. Consider stopping at 1 PM." },
];

export function DashboardPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="dashboard" ref={ref} className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/[0.08] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-sm text-indigo-400 font-semibold tracking-wider uppercase mb-3">
            The Dashboard
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold font-display text-white mb-5">
            Your command center for clarity
          </h2>
          <p className="max-w-xl mx-auto text-slate-400 text-lg">
            Every metric that matters. Every insight you need. All in one futuristic dashboard built for serious traders.
          </p>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="glass rounded-3xl overflow-hidden shadow-[0_0_120px_rgba(99,102,241,0.1),0_32px_80px_rgba(0,0,0,0.7)]"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold text-white font-display">Klartrade</span>
              <div className="w-px h-4 bg-white/10" />
              <span className="text-xs text-slate-500">Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">Live Session</span>
              </div>
            </div>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-16 border-r border-white/[0.05] bg-black/20 flex flex-col items-center py-6 gap-4">
              {[
                { Icon: TrendingUp, active: true },
                { Icon: BookOpen, active: false },
                { Icon: Brain, active: false },
                { Icon: BarChart2, active: false },
                { Icon: Calendar, active: false },
                { Icon: Shield, active: false },
              ].map(({ Icon, active }, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    active
                      ? "bg-indigo-500/20 text-indigo-400 shadow-glow-xs"
                      : "text-slate-700 hover:text-slate-500 hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-5 min-h-[560px] overflow-hidden">
              {/* Metrics grid */}
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
                {metrics.map((m, i) => (
                  <div key={i} className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-3">
                    <p className="text-[10px] text-slate-600 mb-1 font-medium uppercase tracking-wide">{m.label}</p>
                    <p className={`text-sm sm:text-base font-bold ${m.positive ? "text-white" : "text-rose-400"}`}>{m.value}</p>
                    <p className={`text-[10px] mt-0.5 ${m.positive ? "text-emerald-400" : "text-rose-400"}`}>{m.change}</p>
                  </div>
                ))}
              </div>

              {/* Main content area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Equity chart */}
                <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Equity Curve</p>
                    <div className="flex gap-1">
                      {["1W", "1M", "3M", "YTD"].map((t, i) => (
                        <button key={t} className={`text-[10px] px-2 py-0.5 rounded ${i === 1 ? "bg-indigo-500/20 text-indigo-400" : "text-slate-600 hover:text-slate-400"}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <svg viewBox="0 0 500 160" className="w-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[0, 40, 80, 120, 160].map((y) => (
                      <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    ))}
                    <path
                      d="M0 155 L40 148 L80 138 L120 145 L160 128 L200 110 L240 98 L280 84 L320 72 L360 55 L400 44 L440 34 L500 20"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0 155 L40 148 L80 138 L120 145 L160 128 L200 110 L240 98 L280 84 L320 72 L360 55 L400 44 L440 34 L500 20 L500 160 L0 160Z"
                      fill="url(#grad2)"
                    />
                  </svg>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-4">
                  {/* Discipline score */}
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Discipline Score</p>
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                          <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                          <circle
                            cx="32" cy="32" r="26"
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="6"
                            strokeDasharray={`${2 * Math.PI * 26 * 0.94} ${2 * Math.PI * 26 * 0.06}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">94</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">Elite</p>
                        <p className="text-xs text-slate-500">Top 8% of traders</p>
                        <p className="text-xs text-emerald-400 mt-1">↑ +3 this week</p>
                      </div>
                    </div>
                  </div>

                  {/* AI insights */}
                  <div className="flex-1 bg-indigo-500/[0.06] border border-indigo-500/15 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-4 h-4 text-indigo-400" />
                      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">AI Insights</p>
                    </div>
                    <div className="space-y-2">
                      {insights.map((ins, i) => (
                        <div key={i} className="flex gap-2">
                          <div className={`w-5 h-5 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5 ${ins.bg}`}>
                            <ins.icon className={`w-3 h-3 ${ins.color}`} />
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{ins.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent trades */}
              <div className="mt-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Recent Trades</p>
                <div className="space-y-2">
                  {recentTrades.map((trade, i) => (
                    <div key={i} className="flex items-center gap-4 py-2 border-b border-white/[0.04] last:border-0">
                      <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${trade.win ? "bg-emerald-500" : "bg-rose-500"}`} />
                      <div className="w-10">
                        <p className="text-xs font-bold text-white">{trade.symbol}</p>
                        <p className="text-[10px] text-slate-500">{trade.type}</p>
                      </div>
                      <div className="flex-1 hidden sm:flex gap-4">
                        <div>
                          <p className="text-[10px] text-slate-600">Entry</p>
                          <p className="text-xs text-slate-400">{trade.entry}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-600">Exit</p>
                          <p className="text-xs text-slate-400">{trade.exit}</p>
                        </div>
                      </div>
                      <div className={`text-xs font-bold ml-auto ${trade.win ? "text-emerald-400" : "text-rose-400"}`}>
                        {trade.pnl}
                      </div>
                      <div className={`text-[10px] px-2 py-0.5 rounded-full ${trade.rules ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                        {trade.rules ? "Rules ✓" : "Rule Break"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
