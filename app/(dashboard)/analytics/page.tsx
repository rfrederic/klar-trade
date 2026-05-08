"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import {
  BarChart2, TrendingUp, Filter, Download, Calendar, Clock, Globe, Heart,
  Target, AlertTriangle, Zap, RefreshCw, ChevronDown, Brain, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const setupPerformance = [
  { name: "Trend Continuation", winRate: 72, trades: 45, rr: 2.1, pnl: 8240, grade: "A+" },
  { name: "Breakout & Retest", winRate: 68, trades: 28, rr: 1.9, pnl: 5480, grade: "A" },
  { name: "Support Bounce", winRate: 65, trades: 31, rr: 1.7, pnl: 4120, grade: "A" },
  { name: "EMA Confluence", winRate: 61, trades: 19, rr: 1.5, pnl: 2840, grade: "B+" },
  { name: "Momentum Scalp", winRate: 58, trades: 22, rr: 1.2, pnl: 1680, grade: "B" },
  { name: "Reversal", winRate: 44, trades: 18, rr: 1.8, pnl: -480, grade: "C" },
  { name: "Counter-Trend Fade", winRate: 38, trades: 13, rr: 2.4, pnl: -920, grade: "D" },
];

const timeOfDay = [
  { hour: "9:30", winRate: 71, trades: 18, label: "9:30" },
  { hour: "10:00", winRate: 74, trades: 22, label: "10:00" },
  { hour: "10:30", winRate: 69, trades: 16, label: "10:30" },
  { hour: "11:00", winRate: 66, trades: 14, label: "11:00" },
  { hour: "11:30", winRate: 58, trades: 9, label: "11:30" },
  { hour: "12:00", winRate: 42, trades: 7, label: "12:00" },
  { hour: "12:30", winRate: 38, trades: 5, label: "12:30" },
  { hour: "13:00", winRate: 44, trades: 6, label: "1:00" },
  { hour: "13:30", winRate: 50, trades: 8, label: "1:30" },
  { hour: "14:00", winRate: 64, trades: 14, label: "2:00" },
  { hour: "14:30", winRate: 67, trades: 18, label: "2:30" },
  { hour: "15:00", winRate: 62, trades: 13, label: "3:00" },
  { hour: "15:30", winRate: 55, trades: 10, label: "3:30" },
  { hour: "16:00", winRate: 48, trades: 6, label: "4:00" },
];

const dayOfWeek = [
  { day: "Mon", winRate: 56, pnl: -240, trades: 18, delta: -12 },
  { day: "Tue", winRate: 70, pnl: 3480, trades: 26, delta: +6 },
  { day: "Wed", winRate: 76, pnl: 5840, trades: 31, delta: +12 },
  { day: "Thu", winRate: 68, pnl: 2960, trades: 28, delta: +4 },
  { day: "Fri", winRate: 62, pnl: 1040, trades: 20, delta: -2 },
];

const sessionData = [
  { name: "London", flag: "🇬🇧", winRate: 71, pnl: 8240, trades: 38, avgRR: 1.9 },
  { name: "New York", flag: "🇺🇸", winRate: 68, pnl: 18480, trades: 82, avgRR: 1.8 },
  { name: "London/NY", flag: "⚡", winRate: 74, pnl: 4840, trades: 24, avgRR: 2.1 },
  { name: "Asia", flag: "🇯🇵", winRate: 54, pnl: 1760, trades: 18, avgRR: 1.4 },
];

const emotionalData = [
  { state: "Calm", winRate: 74, trades: 68, emoji: "😌" },
  { state: "Confident", winRate: 69, trades: 42, emoji: "😎" },
  { state: "Excited", winRate: 58, trades: 22, emoji: "🤩" },
  { state: "Anxious", winRate: 48, trades: 18, emoji: "😰" },
  { state: "Fearful", winRate: 38, trades: 12, emoji: "😨" },
  { state: "Greedy", winRate: 31, trades: 8, emoji: "🤑" },
];

const mistakes = [
  { name: "Overtrading (>3 trades/session)", count: 28, impact: -3840, pct: 100 },
  { name: "Moving stop loss to breakeven too early", count: 21, impact: -2180, pct: 75 },
  { name: "Taking reversal setups in trending market", count: 18, impact: -1920, pct: 64 },
  { name: "Trading during lunch hours (12–1:30 PM)", count: 14, impact: -1340, pct: 50 },
  { name: "Revenge trading after a loss", count: 11, impact: -2640, pct: 39 },
  { name: "Sizing up after winning streak", count: 8, impact: -1180, pct: 29 },
  { name: "Missing entry due to hesitation", count: 22, impact: -4200, pct: 79 },
];

const instrumentPerf = [
  { symbol: "ES", name: "E-mini S&P 500", winRate: 70, pnl: 14480, trades: 68, rr: 1.92, best: true },
  { symbol: "NQ", name: "Nasdaq 100", winRate: 62, pnl: 8240, trades: 44, rr: 1.84, best: false },
  { symbol: "GC", name: "Gold", winRate: 68, pnl: 6840, trades: 28, rr: 1.88, best: false },
  { symbol: "CL", name: "Crude Oil", winRate: 58, pnl: 2480, trades: 22, rr: 1.75, best: false },
  { symbol: "6E", name: "EUR/USD Futures", winRate: 52, pnl: -840, trades: 14, rr: 1.61, best: false },
];

const disciplineTrend = [82, 78, 85, 88, 84, 91, 89, 94, 90, 96, 93, 97, 94, 91, 95, 98, 96, 99, 94, 96, 97, 93, 95, 94, 96, 97, 94, 95, 96, 94];
const dateRanges = ["7D", "30D", "90D", "6M", "YTD", "All"];

const gradeColors: Record<string, string> = {
  "A+": "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20",
  A: "text-[#4BA3D4] bg-[#03588C]/15 border-[#03588C]/25",
  "B+": "text-[#D9CA82] bg-[#D9CA82]/10 border-[#D9CA82]/20",
  B: "text-[#6B7280] bg-white/[0.05] border-white/[0.08]",
  C: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20",
  D: "text-red-400 bg-red-500/10 border-red-500/20",
};

function WinRateBar({ value, max = 80 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = value >= 65 ? "bg-[#22C55E]" : value >= 50 ? "bg-[#03588C]" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className={cn("text-xs font-bold font-mono-nums w-10 text-right",
        value >= 65 ? "text-[#22C55E]" : value >= 50 ? "text-[#4BA3D4]" : "text-red-400")}>
        {value}%
      </span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, iconColor = "text-[#4BA3D4]", iconBg = "bg-[#03588C]/15", children, action }: {
  title: string;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", iconBg)}>
            <Icon className={cn("w-3.5 h-3.5", iconColor)} />
          </div>
          <h3 className="text-sm font-semibold text-[#F2F0EB]">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30D");
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div className="flex flex-col flex-1">
      <Header title="Analytics" subtitle="Performance intelligence · Data-driven clarity" />

      <main ref={ref} className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl">
            {dateRanges.map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  dateRange === r ? "bg-[#03588C] text-white" : "text-[#6B7280] hover:text-[#F2F0EB]")}
              >
                {r}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[#6B7280] border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] transition-all">
            <Filter className="w-3.5 h-3.5" />
            Instrument: All
            <ChevronDown className="w-3 h-3" />
          </button>

          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[#6B7280] border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] transition-all">
            <Globe className="w-3.5 h-3.5" />
            Session: All
            <ChevronDown className="w-3 h-3" />
          </button>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-3.5 h-3.5" /> Export
            </Button>
            <Button variant="ghost" size="sm">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Overview KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          {[
            { label: "Net PnL", value: "+$28,480", color: "text-[#22C55E]", sub: "+12.4% ROI" },
            { label: "Win Rate", value: "68%", color: "text-[#4BA3D4]", sub: "+5% vs prev" },
            { label: "Profit Factor", value: "2.4×", color: "text-[#4BA3D4]", sub: "Strong edge" },
            { label: "Avg Win", value: "+$380", color: "text-[#22C55E]", sub: "per trade" },
            { label: "Avg Loss", value: "-$178", color: "text-red-400", sub: "per trade" },
            { label: "Avg RR", value: "1.84×", color: "text-[#D9CA82]", sub: "realized" },
            { label: "Consistency", value: "87%", color: "text-[#D9CA82]", sub: "score" },
            { label: "Max DD", value: "3.2%", color: "text-[#F2F0EB]", sub: "controlled" },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="glass rounded-xl p-3 hover:bg-white/[0.05] transition-colors"
            >
              <p className="text-[10px] text-[#6B7280] mb-1 uppercase tracking-wide font-medium">{kpi.label}</p>
              <p className={cn("text-base font-bold font-mono-nums", kpi.color)}>{kpi.value}</p>
              <p className="text-[10px] text-[#6B7280]/60 mt-0.5">{kpi.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Row 1: Setup Performance + Time of Day */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <SectionCard title="Setup Performance" icon={Target} action={
            <span className="text-xs text-[#6B7280]">{setupPerformance.length} setups</span>
          }>
            <div className="p-5 space-y-3">
              {setupPerformance.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, x: -16 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", gradeColors[s.grade])}>
                        {s.grade}
                      </span>
                      <span className="text-[13px] text-[#F2F0EB] font-medium">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-[#6B7280]">
                      <span>{s.trades} trades</span>
                      <span className={cn("font-semibold font-mono-nums", s.pnl >= 0 ? "text-[#22C55E]" : "text-red-400")}>
                        {s.pnl >= 0 ? "+" : ""}${s.pnl.toLocaleString()}
                      </span>
                      <span>{s.rr}R</span>
                    </div>
                  </div>
                  <WinRateBar value={s.winRate} />
                </motion.div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Time of Day Analysis" icon={Clock} iconColor="text-[#D9CA82]" iconBg="bg-[#D9CA82]/10">
            <div className="p-5">
              <p className="text-xs text-[#6B7280] mb-4">Win rate by 30-min window (EST)</p>
              <div className="flex items-end gap-1.5 h-36">
                {timeOfDay.map((t, i) => {
                  const h = Math.max(8, (t.winRate / 80) * 100);
                  const color = t.winRate >= 65 ? "bg-[#22C55E]" : t.winRate >= 50 ? "bg-[#03588C]" : "bg-red-600";
                  return (
                    <div key={t.hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                        <div className="bg-[#0d0f1a] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-[10px] whitespace-nowrap">
                          <p className="text-[#F2F0EB] font-semibold font-mono-nums">{t.winRate}% WR</p>
                          <p className="text-[#6B7280]">{t.trades} trades</p>
                        </div>
                      </div>
                      <motion.div
                        className={cn("w-full rounded-t-sm", color)}
                        style={{ height: `${h}%` }}
                        initial={{ height: 0 }}
                        animate={isInView ? { height: `${h}%` } : {}}
                        transition={{ duration: 0.6, delay: 0.2 + i * 0.04 }}
                      />
                      <span className="text-[8px] text-[#6B7280] rotate-[-45deg] whitespace-nowrap">{t.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-[10px] text-[#6B7280]">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#22C55E]" /> Best: 9:30–11:00 AM</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-red-500" /> Worst: 12:00–1:30 PM</span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Row 2: Day of Week + Session Analytics */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <SectionCard title="Day of Week Performance" icon={Calendar} iconColor="text-[#4BA3D4]" iconBg="bg-[#03588C]/15">
            <div className="p-5">
              <div className="grid grid-cols-5 gap-3">
                {dayOfWeek.map((d, i) => (
                  <motion.div
                    key={d.day}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                    className="text-center"
                  >
                    <div className={cn("rounded-xl p-3 mb-2 border",
                      d.pnl >= 0 ? "bg-[#22C55E]/[0.07] border-[#22C55E]/20" : "bg-red-500/[0.07] border-red-500/20")}>
                      <p className="text-lg font-bold text-[#F2F0EB] font-mono-nums">{d.winRate}%</p>
                      <p className={cn("text-[10px] font-semibold font-mono-nums mt-0.5", d.pnl >= 0 ? "text-[#22C55E]" : "text-red-400")}>
                        {d.pnl >= 0 ? "+" : ""}{(d.pnl / 1000).toFixed(1)}k
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-[#6B7280]">{d.day}</p>
                    <p className={cn("text-[10px] font-mono-nums", d.delta >= 0 ? "text-[#22C55E]" : "text-red-400")}>
                      {d.delta >= 0 ? "+" : ""}{d.delta}%
                    </p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-[#D9CA82]/[0.06] border border-[#D9CA82]/15 rounded-xl">
                <p className="text-xs text-[#D9CA82] font-semibold mb-0.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> KlarAI Insight
                </p>
                <p className="text-[11px] text-[#6B7280]">Monday win rate is 20% below your Wednesday peak. Consider reducing position size by 50% on Mondays until the pattern improves.</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Session Performance" icon={Globe} iconColor="text-[#4BA3D4]" iconBg="bg-[#03588C]/15">
            <div className="p-5 space-y-3">
              {sessionData.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, x: 16 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
                  onClick={() => setActiveSession(activeSession === s.name ? null : s.name)}
                  className={cn("rounded-xl border p-4 cursor-pointer transition-all",
                    activeSession === s.name
                      ? "bg-[#03588C]/10 border-[#03588C]/30"
                      : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{s.flag}</span>
                      <div>
                        <p className="text-sm font-semibold text-[#F2F0EB]">{s.name}</p>
                        <p className="text-[11px] text-[#6B7280]">{s.trades} trades · {s.avgRR}R avg</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#22C55E] font-mono-nums">+${s.pnl.toLocaleString()}</p>
                      <p className="text-xs text-[#4BA3D4] font-semibold font-mono-nums">{s.winRate}% WR</p>
                    </div>
                  </div>
                  {activeSession === s.name && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-3 pt-3 border-t border-white/[0.06]"
                    >
                      <WinRateBar value={s.winRate} />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Row 3: Emotional Analytics + Mistake Tracker */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <SectionCard title="Emotional State vs Performance" icon={Heart} iconColor="text-red-400" iconBg="bg-red-500/15">
            <div className="p-5 space-y-3">
              <p className="text-xs text-[#6B7280] mb-4">Win rate correlates directly with emotional state at trade entry</p>
              {emotionalData.map((e, i) => (
                <motion.div
                  key={e.state}
                  initial={{ opacity: 0, x: -12 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-lg w-8 text-center">{e.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#F2F0EB] font-medium">{e.state}</span>
                      <span className="text-xs text-[#6B7280]">{e.trades} trades</span>
                    </div>
                    <WinRateBar value={e.winRate} />
                  </div>
                </motion.div>
              ))}
              <div className="mt-4 p-3 bg-[#03588C]/[0.06] border border-[#03588C]/15 rounded-xl">
                <p className="text-[11px] text-[#6B7280]">
                  <span className="text-[#4BA3D4] font-semibold">43% win rate gap</span> between your calm and greedy states.
                  Logging your emotional state before every trade is your #1 performance lever.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Mistake Frequency Tracker" icon={AlertTriangle} iconColor="text-[#F59E0B]" iconBg="bg-[#F59E0B]/10">
            <div className="p-5 space-y-3">
              {mistakes.map((m, i) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, x: 12 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#6B7280]">{m.name}</p>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      <span className="text-[10px] text-[#6B7280]">{m.count}×</span>
                      <span className="text-[10px] text-red-400 font-semibold font-mono-nums">-${Math.abs(m.impact).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-red-500/60 rounded-full"
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${m.pct}%` } : {}}
                      transition={{ duration: 0.7, delay: 0.2 + i * 0.06 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Instrument Performance */}
        <SectionCard title="Instrument Performance" icon={BarChart2}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {["Instrument", "Win Rate", "Net PnL", "Trades", "Avg RR", "Action"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {instrumentPerf.map((inst) => (
                  <tr key={inst.symbol} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#03588C]/20 flex items-center justify-center text-xs font-bold text-[#4BA3D4]">
                          {inst.symbol}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#F2F0EB]">{inst.symbol}</p>
                          <p className="text-[10px] text-[#6B7280]">{inst.name}</p>
                        </div>
                        {inst.best && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 ml-1">Best</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", inst.winRate >= 65 ? "bg-[#22C55E]" : inst.winRate >= 55 ? "bg-[#03588C]" : "bg-red-500")}
                            style={{ width: `${(inst.winRate / 80) * 100}%` }}
                          />
                        </div>
                        <span className={cn("text-xs font-semibold font-mono-nums",
                          inst.winRate >= 65 ? "text-[#22C55E]" : inst.winRate >= 55 ? "text-[#4BA3D4]" : "text-red-400")}>
                          {inst.winRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("text-sm font-bold font-mono-nums", inst.pnl >= 0 ? "text-[#22C55E]" : "text-red-400")}>
                        {inst.pnl >= 0 ? "+" : ""}${inst.pnl.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#6B7280] font-mono-nums">{inst.trades}</td>
                    <td className="px-5 py-3.5 text-sm text-[#6B7280] font-mono-nums">{inst.rr}×</td>
                    <td className="px-5 py-3.5">
                      <button className="text-xs text-[#4BA3D4] hover:text-white transition-colors">Drill down</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Discipline Trend + Behavioral Alerts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          <div className="xl:col-span-2">
            <SectionCard title="Discipline Score — 30 Day Trend" icon={Zap} iconColor="text-[#D9CA82]" iconBg="bg-[#D9CA82]/10">
              <div className="p-5">
                <div className="flex items-center gap-6 mb-4">
                  <div>
                    <p className="text-3xl font-bold text-[#F2F0EB] font-mono-nums">94<span className="text-[#6B7280] text-lg">/100</span></p>
                    <p className="text-xs text-[#22C55E] font-medium">↑ +12 this month</p>
                  </div>
                  <div className="text-xs text-[#6B7280] space-y-1">
                    <p>Peak: <span className="text-[#F2F0EB] font-mono-nums">99</span></p>
                    <p>Low: <span className="text-[#F2F0EB] font-mono-nums">78</span></p>
                    <p>Avg: <span className="text-[#F2F0EB] font-mono-nums">91</span></p>
                  </div>
                </div>
                <svg viewBox="0 0 600 100" className="w-full" style={{ height: 120 }} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="discGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#03588C" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#03588C" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[25, 50, 75].map((y) => (
                    <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  ))}
                  {(() => {
                    const pts = disciplineTrend.map((v, i) => {
                      const x = (i / (disciplineTrend.length - 1)) * 600;
                      const y = 100 - ((v - 70) / 30) * 90;
                      return `${x},${y}`;
                    });
                    const linePath = `M ${pts.join(" L ")}`;
                    const areaPath = `${linePath} L 600,100 L 0,100 Z`;
                    return (
                      <>
                        <path d={areaPath} fill="url(#discGrad)" />
                        <path d={linePath} fill="none" stroke="#4BA3D4" strokeWidth="2" strokeLinecap="round" />
                        {disciplineTrend.map((v, i) => {
                          const isPeak = v === Math.max(...disciplineTrend);
                          const isLow = v === Math.min(...disciplineTrend);
                          const isFirst = i === 0;
                          const isLast = i === disciplineTrend.length - 1;
                          if (!isPeak && !isLow && !isFirst && !isLast) return null;
                          const x = (i / (disciplineTrend.length - 1)) * 600;
                          const y = 100 - ((v - 70) / 30) * 90;
                          return <circle key={i} cx={x} cy={y} r="4" fill="#4BA3D4" stroke="#050508" strokeWidth="2" />;
                        })}
                      </>
                    );
                  })()}
                </svg>
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Behavioral Alerts" icon={Brain} iconColor="text-red-400" iconBg="bg-red-500/15">
            <div className="p-4 space-y-2.5">
              {[
                { label: "Overtrading", detected: 8, sessions: 30, level: "high" as const, desc: "8/30 sessions exceeded limit" },
                { label: "Revenge Trading", detected: 4, sessions: 30, level: "medium" as const, desc: "4 sessions with escalating losses" },
                { label: "FOMO Entries", detected: 11, sessions: 30, level: "high" as const, desc: "Chasing price after initial move" },
                { label: "Early Profit Taking", detected: 22, sessions: 30, level: "critical" as const, desc: "Avg exit at 0.8R vs 1.8R target" },
                { label: "Hesitation Misses", detected: 14, sessions: 30, level: "medium" as const, desc: "Valid setups not taken" },
              ].map((b) => {
                const lvlColor = b.level === "critical"
                  ? "text-red-400 bg-red-500/10"
                  : b.level === "high"
                  ? "text-[#F59E0B] bg-[#F59E0B]/10"
                  : "text-[#D9CA82] bg-[#D9CA82]/10";
                return (
                  <div key={b.label} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-[#F2F0EB]">{b.label}</p>
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase", lvlColor)}>{b.level}</span>
                    </div>
                    <p className="text-[10px] text-[#6B7280]">{b.desc}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="h-1 flex-1 bg-white/[0.05] rounded-full overflow-hidden mr-2">
                        <div className="h-full bg-red-500/60 rounded-full" style={{ width: `${(b.detected / b.sessions) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-[#6B7280] font-mono-nums">{b.detected}/{b.sessions}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>

        {/* KlarAI Performance Summary */}
        <div className="glass rounded-2xl overflow-hidden border border-[#03588C]/15 bg-[#03588C]/[0.03]">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#03588C]/10">
            <div className="w-8 h-8 rounded-xl bg-[#03588C]/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#4BA3D4]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F2F0EB]">KlarAI Performance Summary</h3>
              <p className="text-xs text-[#6B7280]">Generated for {dateRange} period · Updated live</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4BA3D4] animate-pulse" />
              <span className="text-xs text-[#4BA3D4]">AI Analysis Active</span>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">✅ What is Working</p>
              <ul className="space-y-2">
                {[
                  "Trend continuation setups deliver 72% WR consistently",
                  "Morning sessions (9:30–11 AM) are significantly above average",
                  "ES is your highest-edge instrument by PnL and WR",
                  "Discipline score improved 12 points this month",
                  "Risk per trade is well-controlled below 2%",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2 text-xs text-[#6B7280]">
                    <span className="text-[#22C55E] flex-shrink-0">↑</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">⚠️ Areas of Concern</p>
              <ul className="space-y-2">
                {[
                  "Monday performance is 20% below weekly average",
                  "Afternoon sessions after 2:30 PM show declining edge",
                  "Early profit-taking is costing an estimated $4,200/month",
                  "Reversal setups have a negative expectancy — remove them",
                  "Overtrading detected in 8/30 sessions",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2 text-xs text-[#6B7280]">
                    <span className="text-[#F59E0B] flex-shrink-0">↓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">🎯 Top 3 Priorities</p>
              <div className="space-y-3">
                {[
                  { n: "1", title: "Eliminate reversal setups", desc: "Remove from your playbook for 30 days. Negative expectancy confirmed." },
                  { n: "2", title: "Stop trading after 2:30 PM", desc: "Your win rate drops 18% in afternoon sessions. The edge is not there." },
                  { n: "3", title: "Let winners run to full target", desc: "Exiting at 0.8R vs 1.8R target is costing you $4,200/month." },
                ].map((p) => (
                  <div key={p.n} className="flex gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                    <div className="w-5 h-5 rounded-full bg-[#03588C]/20 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-[#4BA3D4]">
                      {p.n}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#F2F0EB] mb-0.5">{p.title}</p>
                      <p className="text-[10px] text-[#6B7280] leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
