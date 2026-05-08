"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Sparkles, AlertTriangle, Check, ArrowRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const timeframes = ["Today", "7D", "30D", "90D", "YTD", "ALL"];

const equityData = [
  92800, 93200, 91800, 93600, 94100, 93400, 92900, 93800, 94500, 93900,
  94200, 95100, 94800, 95400, 96200, 95800, 96500, 97100, 96800, 97400,
  96900, 97600, 98200, 97800, 98500, 99100, 98700, 99400, 100200, 99800,
  100500, 101200, 100800, 101500, 102100, 101700, 102400, 103000, 102600, 92182,
];

const recentTrades = [
  { instrument: "EURUSD", direction: "Long", pnl: "+$480", outcome: "Win", closedAt: "09:42", adherence: true },
  { instrument: "ES", direction: "Long", pnl: "+$840", outcome: "Win", closedAt: "10:15", adherence: true },
  { instrument: "NQ", direction: "Short", pnl: "-$180", outcome: "Loss", closedAt: "11:30", adherence: false },
  { instrument: "GC", direction: "Long", pnl: "+$420", outcome: "Win", closedAt: "13:05", adherence: true },
  { instrument: "CL", direction: "Short", pnl: "-$240", outcome: "Loss", closedAt: "14:22", adherence: true },
];

function EquityChart() {
  const min = Math.min(...equityData);
  const max = Math.max(...equityData);
  const range = max - min;
  const W = 600;
  const H = 160;

  const points = equityData.map((v, i) => ({
    x: (i / (equityData.length - 1)) * W,
    y: H - ((v - min) / range) * H * 0.85 - H * 0.05,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${W} ${H} L 0 ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#03588C" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#03588C" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#equityGrad)" />
      <path d={pathD} stroke="#03588C" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {points[points.length - 1] && (
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill="#03588C" />
      )}
    </svg>
  );
}

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState("30D");
  const [preMarketStep, setPreMarketStep] = useState(1);

  const stats = [
    { label: "Account Balance", value: "$92,182.34", change: null, color: "text-[#F2F0EB]" },
    { label: "Total Closed PnL", value: "-$7,817.66", change: "-7.8%", color: "text-red-400" },
    { label: "Win Rate", value: "68.4%", change: "+4.2%", color: "text-[#4BA3D4]" },
    { label: "Avg R Per Trade", value: "2.3R", change: null, color: "text-[#F2F0EB]" },
    { label: "Profit Factor", value: "2.14", change: null, color: "text-[#22C55E]" },
  ];

  return (
    <div className="flex flex-col flex-1">
      {/* Pre-Market Banner */}
      <div className="border-b border-[#03588C]/20 bg-[#03588C]/08 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#4BA3D4]">Pre-Market Routine</span>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn("w-2 h-2 rounded-full cursor-pointer transition-all",
                  i < preMarketStep ? "bg-[#03588C]" : "bg-white/[0.1]")}
                onClick={() => setPreMarketStep(Math.min(i + 1, 3))}
              />
            ))}
          </div>
          <span className="text-xs text-[#6B7280]">{preMarketStep}/3 complete</span>
        </div>
        <button className="text-xs text-[#6B7280] hover:text-[#F2F0EB] transition-colors">
          {preMarketStep < 3 ? "Continue →" : "Dismiss"}
        </button>
      </div>

      <Header title="Dashboard" subtitle="Trade with clarity. Execute with discipline." />

      <main className="flex-1 p-6 space-y-5">
        {/* Time filter */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl w-fit">
          {timeframes.map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={cn("px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                timeframe === t ? "bg-[#03588C] text-white" : "text-[#6B7280] hover:text-[#F2F0EB]")}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          {stats.map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-4"
            >
              <p className="text-[10px] text-[#6B7280] uppercase tracking-wide font-medium mb-2">{s.label}</p>
              <p className={cn("text-xl font-bold font-mono-nums", s.color)}>{s.value}</p>
              {s.change && (
                <p className={cn("text-[11px] mt-1 flex items-center gap-1",
                  s.change.startsWith("+") ? "text-[#22C55E]" : "text-red-400")}>
                  {s.change.startsWith("+") ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {s.change}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

          {/* LEFT — Equity Curve */}
          <div className="xl:col-span-3 glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[14px] font-semibold text-[#F2F0EB]">Account Balance</h2>
                <p className="text-[11px] text-[#6B7280] mt-0.5">Equity curve · {timeframe}</p>
              </div>
              <p className="text-2xl font-bold font-mono-nums text-[#F2F0EB]">$92,182</p>
            </div>
            <div className="h-[160px]">
              <EquityChart />
            </div>
            <div className="flex items-center justify-between mt-3 text-[11px] text-[#6B7280]">
              <span>High: $103,000</span>
              <span className="text-red-400">Low: $91,800</span>
              <span>DD: -10.9%</span>
            </div>
          </div>

          {/* RIGHT — Discipline & Edge */}
          <div className="xl:col-span-2 space-y-4">

            {/* Edge Score */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-semibold text-[#F2F0EB]">Edge Score</h3>
                <span className="text-[10px] text-[#6B7280]">Requires 30 trades</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                    <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
                    <circle cx="32" cy="32" r="26" stroke="#03588C" strokeWidth="6" fill="none"
                      strokeDasharray={`${(45 / 100) * 163} 163`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#F2F0EB]">45</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280]">45 / 100 trades logged</p>
                  <p className="text-[11px] text-[#6B7280] mt-1">Log 55 more to unlock your Edge Score</p>
                  <div className="h-1 bg-white/[0.05] rounded-full mt-2 overflow-hidden w-28">
                    <div className="h-full bg-[#03588C] rounded-full" style={{ width: "45%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Discipline Summary */}
            <div className="glass rounded-2xl p-5 space-y-3">
              <h3 className="text-[13px] font-semibold text-[#F2F0EB]">Today&apos;s Discipline</h3>

              {/* Trades */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6B7280]">Trades taken</span>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Circle key={i} className={cn("w-3 h-3", i < 2 ? "text-[#03588C] fill-[#03588C]" : "text-white/[0.08]")} />
                  ))}
                  <span className="text-[11px] text-[#6B7280] ml-1">2/5</span>
                </div>
              </div>

              {/* Trading Window */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6B7280]">Trading Window</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#6B7280]">08:00–17:00 EDT</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 font-semibold">Open</span>
                </div>
              </div>

              {/* PnL bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-[#6B7280]">Today&apos;s PnL</span>
                  <span className="text-[#22C55E] font-semibold">+$720</span>
                </div>
                <div className="relative h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/[0.15]" />
                  <div className="h-full bg-[#22C55E] rounded-full" style={{ width: "57%", marginLeft: "50%" }} />
                </div>
                <div className="flex justify-between text-[10px] text-[#6B7280] mt-1">
                  <span>-$100 limit</span>
                  <span>$1K target</span>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 text-xs text-[#22C55E] bg-[#22C55E]/08 border border-[#22C55E]/15 rounded-xl px-3 py-2">
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                No rule violations today
              </div>

              {/* KlarAI tip */}
              <div className="border-l-2 border-[#03588C] pl-3">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Sparkles className="w-3 h-3 text-[#4BA3D4]" />
                  <span className="text-[10px] text-[#4BA3D4] font-semibold">KlarAI</span>
                </div>
                <p className="text-[11px] text-[#6B7280]">Your afternoon trades underperform by 38%. Consider closing by 13:00 today.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
            <h3 className="text-[14px] font-semibold text-[#F2F0EB]">Recent Trades</h3>
            <button className="text-xs text-[#4BA3D4] hover:text-[#F2F0EB] transition-colors flex items-center gap-1">
              All Trades <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {["Instrument", "Direction", "PnL", "Outcome", "Closed At", "Rule Adherence"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] text-[#6B7280] uppercase tracking-wide font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {recentTrades.map((t, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-sm font-semibold text-[#F2F0EB] font-mono-nums">{t.instrument}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn("text-[11px] font-semibold px-2 py-1 rounded-lg",
                        t.direction === "Long"
                          ? "bg-[#22C55E]/10 text-[#22C55E]"
                          : "bg-red-500/10 text-red-400")}>
                        {t.direction}
                      </span>
                    </td>
                    <td className={cn("px-5 py-3.5 text-sm font-bold font-mono-nums", t.pnl.startsWith("+") ? "text-[#22C55E]" : "text-red-400")}>
                      {t.pnl}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("text-[11px] font-medium px-2 py-1 rounded-lg",
                        t.outcome === "Win" ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-red-500/10 text-red-400")}>
                        {t.outcome}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#6B7280] font-mono-nums">{t.closedAt}</td>
                    <td className="px-5 py-3.5">
                      {t.adherence ? (
                        <span className="flex items-center gap-1 text-[#22C55E] text-xs"><Check className="w-3.5 h-3.5" /> Followed</span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400 text-xs"><AlertTriangle className="w-3.5 h-3.5" /> Violated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
