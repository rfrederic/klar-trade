"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import {
  BarChart2, TrendingUp, Filter, Download, Calendar, Clock, Globe, Heart,
  Target, AlertTriangle, Zap, RefreshCw, ChevronDown, Brain, Sparkles, Loader2, Leaf,
} from "lucide-react";
import { getBiome } from "@/lib/biomes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Kpis {
  netPnl: number; winRate: number | null; profitFactor: number | null;
  avgWin: number | null; avgLoss: number | null; maxDrawdown: number | null;
  totalTrades: number; wins: number; losses: number;
}

interface HourStat { hour: number; label: string; winRate: number; trades: number; pnl: number; }
interface DowStat   { day: string; winRate: number; pnl: number; trades: number; }
interface SymStat   { symbol: string; winRate: number; pnl: number; trades: number; wins: number; losses: number; }
interface EmoStat   { emotion: string; state: string; emoji: string; winRate: number; trades: number; pnl: number; }
interface RefugeCalDay { date: string; mood: string | null; biome: string | null; duration_min: number | null; }

interface AnalyticsData {
  empty?: boolean;
  kpis: Kpis | null;
  timeOfDay: HourStat[];
  dayOfWeek: DowStat[];
  instruments: SymStat[];
  emotions: EmoStat[];
}

// ─── Static sample data (sections not yet computable from trades) ─────────────

const sampleSetups = [
  { name: "Trend Continuation", winRate: 72, trades: 45, rr: 2.1, pnl: 8240, grade: "A+" },
  { name: "Breakout & Retest",  winRate: 68, trades: 28, rr: 1.9, pnl: 5480, grade: "A"  },
  { name: "Support Bounce",     winRate: 65, trades: 31, rr: 1.7, pnl: 4120, grade: "A"  },
  { name: "EMA Confluence",     winRate: 61, trades: 19, rr: 1.5, pnl: 2840, grade: "B+" },
  { name: "Momentum Scalp",     winRate: 58, trades: 22, rr: 1.2, pnl: 1680, grade: "B"  },
  { name: "Reversal",           winRate: 44, trades: 18, rr: 1.8, pnl: -480, grade: "C"  },
];

const sampleMistakes = [
  { name: "Overtrading (>3 trades/session)",             count: 28, impact: -3840, pct: 100 },
  { name: "Moving stop to breakeven too early",          count: 21, impact: -2180, pct: 75  },
  { name: "Reversal setups in trending market",          count: 18, impact: -1920, pct: 64  },
  { name: "Trading during lunch hours (12–1:30 PM)",     count: 14, impact: -1340, pct: 50  },
  { name: "Revenge trading after a loss",                count: 11, impact: -2640, pct: 39  },
  { name: "Sizing up after winning streak",              count: 8,  impact: -1180, pct: 29  },
];

const disciplineTrend = [82, 78, 85, 88, 84, 91, 89, 94, 90, 96, 93, 97, 94, 91, 95, 98, 96, 99, 94, 96, 97, 93, 95, 94, 96, 97, 94, 95, 96, 94];
const dateRanges = ["7D", "30D", "90D", "6M", "YTD", "All"];

const gradeColors: Record<string, string> = {
  "A+": "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20",
  A:   "text-[#4BA3D4] bg-[#03588C]/15 border-[#03588C]/25",
  "B+":"text-[#D9CA82] bg-[#D9CA82]/10 border-[#D9CA82]/20",
  B:   "text-[#6B7280] bg-white/[0.05] border-white/[0.08]",
  C:   "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20",
  D:   "text-red-400 bg-red-500/10 border-red-500/20",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function WinRateBar({ value, max = 80 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = value >= 65 ? "bg-[#22C55E]" : value >= 50 ? "bg-[#03588C]" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
      </div>
      <span className={cn("text-xs font-bold w-10 text-right",
        value >= 65 ? "text-[#22C55E]" : value >= 50 ? "text-[#4BA3D4]" : "text-red-400")}>
        {value}%
      </span>
    </div>
  );
}

function formatDayLabel(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function SectionCard({ title, icon: Icon, iconColor = "text-[#4BA3D4]", iconBg = "bg-[#03588C]/15", children, action, sample, noClip }: {
  title: string; icon: React.ElementType; iconColor?: string; iconBg?: string;
  children: React.ReactNode; action?: React.ReactNode; sample?: boolean; noClip?: boolean;
}) {
  return (
    <div className={cn("glass rounded-2xl", noClip ? "" : "overflow-hidden")}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", iconBg)}>
            <Icon className={cn("w-3.5 h-3.5", iconColor)} />
          </div>
          <h3 className="text-sm font-semibold text-[#F2F0EB]">{title}</h3>
          {sample && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-[#6B7280] border border-white/[0.07] uppercase tracking-wide">
              sample
            </span>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function fmt(n: number | null | undefined, decimals = 2, prefix = "$"): string {
  if (n == null) return "—";
  return `${prefix}${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

function EmptyState({ message = "Log more trades to unlock" }: { message?: string }) {
  return (
    <div className="p-10 text-center">
      <p className="text-xs text-[#6B7280]">{message}</p>
    </div>
  );
}

// ─── Analytics Page ───────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30D");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const [refugeCalendar,    setRefugeCalendar]    = useState<RefugeCalDay[]>([]);
  const [dailyPnL,          setDailyPnL]          = useState<Record<string, number>>({});
  const [showRefugeMarkers, setShowRefugeMarkers] = useState(false);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics/stats?range=${dateRange}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dateRange]);

  // Fetch Refuge sessions + daily P&L once on mount (28-day window)
  useEffect(() => {
    fetch("/api/refuge/session")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.calendar) setRefugeCalendar(d.calendar); })
      .catch(() => {});

    const now  = new Date();
    const y    = now.getFullYear();
    const m    = now.getMonth();
    const pY   = m === 0 ? y - 1 : y;
    const pM   = m === 0 ? 11 : m - 1;

    Promise.all([
      fetch(`/api/journal/trades?year=${y}&month=${m}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/journal/trades?year=${pY}&month=${pM}`).then(r => r.ok ? r.json() : null),
    ]).then(([curr, prev]) => {
      const byDate: Record<string, number> = {};
      for (const d of [curr, prev]) {
        if (!d?.trades) continue;
        for (const t of d.trades as { closed_at: string; pnl: number | null }[]) {
          const date = t.closed_at.slice(0, 10);
          byDate[date] = (byDate[date] ?? 0) + (t.pnl ?? 0);
        }
      }
      setDailyPnL(byDate);
    }).catch(() => {});
  }, []);

  const kpis = data?.kpis;
  const timeOfDay = data?.timeOfDay ?? [];
  const dayOfWeek = data?.dayOfWeek ?? [];
  const instruments = data?.instruments ?? [];
  const emotions = data?.emotions ?? [];
  const isEmpty = data?.empty || (!loading && !kpis);

  const maxTodHours = Math.max(...timeOfDay.map((t) => t.trades), 1);

  return (
    <div className="flex flex-col flex-1">
      <Header title="Analytics" subtitle="Performance intelligence · Data-driven clarity" />

      <main ref={ref} className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl">
            {dateRanges.map((r) => (
              <button key={r} onClick={() => setDateRange(r)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  dateRange === r ? "bg-[#03588C] text-white" : "text-[#6B7280] hover:text-[#F2F0EB]")}>
                {r}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[#6B7280] border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] transition-all">
            <Filter className="w-3.5 h-3.5" /> Instrument: All <ChevronDown className="w-3 h-3" />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5" /> Export</Button>
            <Button variant="ghost" size="sm" onClick={() => setDateRange(dateRange)}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* KPI cards */}
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-[#6B7280]" />
          </div>
        ) : isEmpty ? (
          <div className="glass rounded-2xl p-10 text-center">
            <p className="text-[#F2F0EB] font-medium mb-2">No trade data yet</p>
            <p className="text-sm text-[#6B7280]">Sync your MT5 account from the Journal page to populate analytics.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
              {[
                { label: "Net PnL",       value: `${(kpis?.netPnl ?? 0) >= 0 ? "+" : ""}${fmt(kpis?.netPnl)}`,  color: (kpis?.netPnl ?? 0) >= 0 ? "text-[#22C55E]" : "text-red-400", sub: `${kpis?.totalTrades ?? 0} trades` },
                { label: "Win Rate",      value: kpis?.winRate != null ? `${kpis.winRate.toFixed(1)}%` : "—",     color: "text-[#4BA3D4]", sub: `${kpis?.wins ?? 0}W / ${kpis?.losses ?? 0}L` },
                { label: "Profit Factor", value: kpis?.profitFactor != null ? `${kpis.profitFactor.toFixed(2)}×` : "—", color: "text-[#4BA3D4]", sub: kpis?.profitFactor != null && kpis.profitFactor >= 1.5 ? "Strong edge" : "Below target" },
                { label: "Avg Win",       value: kpis?.avgWin != null ? `+${fmt(kpis.avgWin)}` : "—",             color: "text-[#22C55E]", sub: "per trade" },
                { label: "Avg Loss",      value: kpis?.avgLoss != null ? `-${fmt(Math.abs(kpis.avgLoss))}` : "—", color: "text-red-400",    sub: "per trade" },
                { label: "Expectancy",    value: (kpis?.avgWin != null && kpis?.avgLoss != null && kpis?.winRate != null)
                    ? `${((kpis.winRate / 100) * kpis.avgWin + (1 - kpis.winRate / 100) * kpis.avgLoss) >= 0 ? "+" : ""}${fmt((kpis.winRate / 100) * kpis.avgWin + (1 - kpis.winRate / 100) * kpis.avgLoss)}`
                    : "—",
                  color: "text-[#D9CA82]", sub: "per trade" },
                { label: "Max Drawdown",  value: kpis?.maxDrawdown != null ? `${kpis.maxDrawdown.toFixed(1)}%` : "—", color: "text-[#F2F0EB]", sub: "peak-to-trough" },
                { label: "Total Trades",  value: String(kpis?.totalTrades ?? 0), color: "text-[#F2F0EB]", sub: `${dateRange} period` },
              ].map((kpi, i) => (
                <motion.div key={kpi.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="glass rounded-xl p-3 hover:bg-white/[0.05] transition-colors"
                >
                  <p className="text-[10px] text-[#6B7280] mb-1 uppercase tracking-wide font-medium">{kpi.label}</p>
                  <p className={cn("text-base font-bold", kpi.color)}>{kpi.value}</p>
                  <p className="text-[10px] text-[#6B7280]/60 mt-0.5">{kpi.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* P&L Timeline with Refuge session markers */}
            {(() => {
              const maxAbs = Math.max(
                ...refugeCalendar.map(d => Math.abs(dailyPnL[d.date] ?? 0)),
                1,
              );
              return (
                <SectionCard
                  title="28-Day P&L Timeline"
                  icon={TrendingUp}
                  iconColor="text-[#22C55E]"
                  iconBg="bg-[#22C55E]/10"
                  noClip
                  action={
                    <button
                      onClick={() => setShowRefugeMarkers(v => !v)}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all",
                        showRefugeMarkers
                          ? "bg-[#22C55E]/10 border-[#22C55E]/25 text-[#22C55E]"
                          : "bg-white/[0.04] border-white/[0.08] text-[#6B7280] hover:text-[#F2F0EB]",
                      )}
                    >
                      <Leaf className="w-3 h-3" />
                      Refuge markers
                    </button>
                  }
                >
                  <div className="px-5 py-4">
                    {refugeCalendar.length === 0 ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-4 h-4 animate-spin text-[#6B7280]" />
                      </div>
                    ) : (
                      <>
                        {/* Bar chart */}
                        <div className="flex gap-px" style={{ height: "120px" }}>
                          {refugeCalendar.map((day, i) => {
                            const pnl       = dailyPnL[day.date] ?? 0;
                            const hasTrades = day.date in dailyPnL;
                            const barH      = Math.min((Math.abs(pnl) / maxAbs) * 56, 56);
                            const accent    = day.mood ? getBiome(day.mood).accent : null;
                            // pin tooltip to left/right for edge columns
                            const tipAlign  = i < 5
                              ? "left-0"
                              : i > refugeCalendar.length - 6
                              ? "right-0 left-auto"
                              : "left-1/2 -translate-x-1/2";

                            return (
                              <div
                                key={day.date}
                                className="flex-1 flex flex-col relative group cursor-default"
                              >
                                {/* Tooltip */}
                                <div className={cn(
                                  "absolute bottom-full mb-1 hidden group-hover:block z-20 pointer-events-none",
                                  tipAlign,
                                )}>
                                  <div className="bg-[#0d0f1a] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-[10px] whitespace-nowrap shadow-xl">
                                    <p className="text-[#6B7280] mb-0.5">{formatDayLabel(day.date)}</p>
                                    {hasTrades && (
                                      <p className={cn("font-semibold", pnl >= 0 ? "text-[#22C55E]" : "text-red-400")}>
                                        {pnl >= 0 ? "+" : ""}${Math.abs(pnl).toFixed(2)}
                                      </p>
                                    )}
                                    {day.mood && (
                                      <p className="mt-0.5" style={{ color: accent ?? "#6B7280" }}>
                                        {day.mood} · {day.biome}{day.duration_min ? ` · ${day.duration_min}min` : ""}
                                      </p>
                                    )}
                                    {!hasTrades && !day.mood && (
                                      <p className="text-[#6B7280]/40">No activity</p>
                                    )}
                                  </div>
                                </div>

                                {/* Positive bar — grows up from center */}
                                <div className="flex flex-col justify-end flex-1 pb-px">
                                  {pnl > 0 && (
                                    <div
                                      className="w-full rounded-t-[2px]"
                                      style={{ height: `${barH}px`, background: "rgba(34,197,94,0.55)" }}
                                    />
                                  )}
                                </div>

                                {/* Zero line */}
                                <div className="h-px w-full bg-white/[0.1] flex-shrink-0" />

                                {/* Negative bar — grows down from center */}
                                <div className="flex flex-col justify-start flex-1 pt-px">
                                  {pnl < 0 && (
                                    <div
                                      className="w-full rounded-b-[2px]"
                                      style={{ height: `${barH}px`, background: "rgba(239,68,68,0.55)" }}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Date labels — every 7th */}
                        <div className="flex gap-px mt-1.5">
                          {refugeCalendar.map((day, i) => (
                            <div key={day.date} className="flex-1 text-center overflow-hidden">
                              {i % 7 === 0 && (
                                <span className="text-[8px] text-[#6B7280]/50 whitespace-nowrap">
                                  {day.date.slice(8)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Refuge session markers */}
                        {showRefugeMarkers && (
                          <div className="flex gap-px mt-2">
                            {refugeCalendar.map((day, i) => {
                              const accent = day.mood ? getBiome(day.mood).accent : null;
                              const tipAlign = i < 5
                                ? "left-0"
                                : i > refugeCalendar.length - 6
                                ? "right-0 left-auto"
                                : "left-1/2 -translate-x-1/2";
                              return (
                                <div key={day.date} className="flex-1 flex justify-center relative group cursor-default h-3">
                                  {accent && (
                                    <>
                                      <div className="w-[2px] h-3 rounded-full" style={{ background: accent }} />
                                      <div className={cn(
                                        "absolute top-full mt-1 hidden group-hover:block z-20 pointer-events-none",
                                        tipAlign,
                                      )}>
                                        <div className="bg-[#0d0f1a] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-[10px] whitespace-nowrap shadow-xl">
                                          <span style={{ color: accent }}>{day.mood}</span>
                                          {" · "}{day.biome}
                                          {day.duration_min ? ` · ${day.duration_min}min` : ""}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </SectionCard>
              );
            })()}

            {/* Row 1: Setup Performance (sample) + Time of Day (real) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              <SectionCard title="Setup Performance" icon={Target} sample
                action={<span className="text-xs text-[#6B7280]">Tag trades with setups to unlock</span>}>
                <div className="p-5 space-y-3">
                  {sampleSetups.map((s, i) => (
                    <motion.div key={s.name}
                      initial={{ opacity: 0, x: -16 }} animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", gradeColors[s.grade])}>{s.grade}</span>
                          <span className="text-[13px] text-[#F2F0EB] font-medium">{s.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-[#6B7280]">
                          <span>{s.trades} trades</span>
                          <span className={cn("font-semibold", s.pnl >= 0 ? "text-[#22C55E]" : "text-red-400")}>
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
                {timeOfDay.length === 0 ? <EmptyState /> : (
                  <div className="p-5">
                    <p className="text-xs text-[#6B7280] mb-4">Win rate by hour (UTC) · hover for details</p>
                    <div className="flex items-end gap-1 h-36">
                      {timeOfDay.map((t, i) => {
                        const maxWR = Math.max(...timeOfDay.map((x) => x.winRate), 1);
                        const h = Math.max(6, (t.winRate / maxWR) * 100);
                        const color = t.winRate >= 65 ? "bg-[#22C55E]" : t.winRate >= 50 ? "bg-[#03588C]" : "bg-red-600";
                        return (
                          <div key={t.hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                              <div className="bg-[#0d0f1a] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-[10px] whitespace-nowrap shadow-xl">
                                <p className="text-[#F2F0EB] font-semibold">{t.winRate}% WR</p>
                                <p className="text-[#6B7280]">{t.trades} trades</p>
                                <p className={cn("font-semibold", t.pnl >= 0 ? "text-[#22C55E]" : "text-red-400")}>
                                  {t.pnl >= 0 ? "+" : ""}${Math.abs(t.pnl).toFixed(0)}
                                </p>
                              </div>
                            </div>
                            <motion.div className={cn("w-full rounded-t-sm", color)} style={{ height: `${h}%` }}
                              initial={{ height: 0 }} animate={isInView ? { height: `${h}%` } : {}}
                              transition={{ duration: 0.6, delay: 0.2 + i * 0.04 }} />
                            <span className="text-[8px] text-[#6B7280] rotate-[-45deg] whitespace-nowrap origin-center">{t.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </SectionCard>
            </div>

            {/* Row 2: Day of Week (real) + Emotional (real) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              <SectionCard title="Day of Week Performance" icon={Calendar} iconColor="text-[#4BA3D4]" iconBg="bg-[#03588C]/15">
                {dayOfWeek.length === 0 ? <EmptyState /> : (
                  <div className="p-5">
                    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${dayOfWeek.length}, 1fr)` }}>
                      {dayOfWeek.map((d, i) => (
                        <motion.div key={d.day}
                          initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
                          transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                          className="text-center"
                        >
                          <div className={cn("rounded-xl p-3 mb-2 border",
                            d.pnl >= 0 ? "bg-[#22C55E]/[0.07] border-[#22C55E]/20" : "bg-red-500/[0.07] border-red-500/20")}>
                            <p className="text-lg font-bold text-[#F2F0EB]">{d.winRate}%</p>
                            <p className={cn("text-[10px] font-semibold mt-0.5", d.pnl >= 0 ? "text-[#22C55E]" : "text-red-400")}>
                              {d.pnl >= 0 ? "+" : ""}{(d.pnl / 1000).toFixed(1)}k
                            </p>
                          </div>
                          <p className="text-xs font-semibold text-[#6B7280]">{d.day}</p>
                          <p className="text-[10px] text-[#6B7280]">{d.trades}T</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Emotional State vs Performance" icon={Heart} iconColor="text-red-400" iconBg="bg-red-500/15">
                {emotions.length === 0 ? (
                  <EmptyState message="Tag your emotions in the Journal to unlock this analysis" />
                ) : (
                  <div className="p-5 space-y-3">
                    <p className="text-xs text-[#6B7280] mb-4">Win rate by emotional state at trade entry</p>
                    {emotions.map((e, i) => (
                      <motion.div key={e.emotion}
                        initial={{ opacity: 0, x: -12 }} animate={isInView ? { opacity: 1, x: 0 } : {}}
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
                    {emotions.length >= 2 && (() => {
                      const best = emotions[0];
                      const worst = emotions[emotions.length - 1];
                      const gap = best.winRate - worst.winRate;
                      if (gap < 5) return null;
                      return (
                        <div className="mt-3 p-3 bg-[#03588C]/[0.06] border border-[#03588C]/15 rounded-xl">
                          <p className="text-[11px] text-[#6B7280]">
                            <span className="text-[#4BA3D4] font-semibold">{gap}% win rate gap</span> between your {best.state.toLowerCase()} and {worst.state.toLowerCase()} states. Log your emotion before every trade.
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </SectionCard>
            </div>

            {/* Instrument performance (real) */}
            <SectionCard title="Instrument Performance" icon={BarChart2}
              action={<span className="text-xs text-[#6B7280]">{instruments.length} instrument{instruments.length !== 1 ? "s" : ""}</span>}>
              {instruments.length === 0 ? <EmptyState /> : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.04]">
                        {["Instrument", "Win Rate", "Net P&L", "Trades", "W / L", ""].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {instruments.map((inst, i) => {
                        const isBest = i === 0;
                        return (
                          <tr key={inst.symbol} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[#03588C]/20 flex items-center justify-center text-xs font-bold text-[#4BA3D4]">
                                  {inst.symbol.slice(0, 3)}
                                </div>
                                <span className="text-sm font-medium text-[#F2F0EB]">{inst.symbol}</span>
                                {isBest && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">Best</span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                                  <div className={cn("h-full rounded-full", inst.winRate >= 65 ? "bg-[#22C55E]" : inst.winRate >= 50 ? "bg-[#03588C]" : "bg-red-500")}
                                    style={{ width: `${Math.min((inst.winRate / 80) * 100, 100)}%` }} />
                                </div>
                                <span className={cn("text-xs font-semibold",
                                  inst.winRate >= 65 ? "text-[#22C55E]" : inst.winRate >= 50 ? "text-[#4BA3D4]" : "text-red-400")}>
                                  {inst.winRate}%
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={cn("text-sm font-bold", inst.pnl >= 0 ? "text-[#22C55E]" : "text-red-400")}>
                                {inst.pnl >= 0 ? "+" : ""}${Math.abs(inst.pnl).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-[#6B7280]">{inst.trades}</td>
                            <td className="px-5 py-3.5 text-sm text-[#6B7280]">{inst.wins}W / {inst.losses}L</td>
                            <td className="px-5 py-3.5">
                              <TrendingUp className="w-3.5 h-3.5 text-[#6B7280]" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>

            {/* Row 3: Mistake Tracker (sample) + Discipline Score (sample) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <SectionCard title="Discipline Score — 30 Day Trend" icon={Zap} iconColor="text-[#D9CA82]" iconBg="bg-[#D9CA82]/10" sample>
                  <div className="p-5">
                    <div className="flex items-center gap-6 mb-4">
                      <div>
                        <p className="text-3xl font-bold text-[#F2F0EB]">94<span className="text-[#6B7280] text-lg">/100</span></p>
                        <p className="text-xs text-[#22C55E] font-medium">↑ +12 this month</p>
                      </div>
                      <div className="text-xs text-[#6B7280] space-y-1">
                        <p>Peak: <span className="text-[#F2F0EB]">99</span></p>
                        <p>Low: <span className="text-[#F2F0EB]">78</span></p>
                        <p>Avg: <span className="text-[#F2F0EB]">91</span></p>
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
                              if (i !== 0 && i !== disciplineTrend.length - 1 &&
                                v !== Math.max(...disciplineTrend) && v !== Math.min(...disciplineTrend)) return null;
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

              <SectionCard title="Mistake Tracker" icon={AlertTriangle} iconColor="text-[#F59E0B]" iconBg="bg-[#F59E0B]/10" sample>
                <div className="p-4 space-y-2.5">
                  {sampleMistakes.map((m, i) => (
                    <motion.div key={m.name}
                      initial={{ opacity: 0, x: 12 }} animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                      className="space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#6B7280]">{m.name}</p>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                          <span className="text-[10px] text-[#6B7280]">{m.count}×</span>
                          <span className="text-[10px] text-red-400 font-semibold">-${Math.abs(m.impact).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                        <motion.div className="h-full bg-red-500/60 rounded-full"
                          initial={{ width: 0 }} animate={isInView ? { width: `${m.pct}%` } : {}}
                          transition={{ duration: 0.7, delay: 0.2 + i * 0.06 }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </SectionCard>
            </div>

            {/* KlarAI summary (static placeholder) */}
            <div className="glass rounded-2xl overflow-hidden border border-[#03588C]/15 bg-[#03588C]/[0.03]">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#03588C]/10">
                <div className="w-8 h-8 rounded-xl bg-[#03588C]/15 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#4BA3D4]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F2F0EB]">KlarAI Performance Summary</h3>
                  <p className="text-xs text-[#6B7280]">AI analysis · coming soon</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6B7280]" />
                  <span className="text-xs text-[#6B7280]">Requires KlarAI</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-[#6B7280] text-center">
                  KlarAI will automatically analyse your trade patterns and generate personalised insights once it is activated.
                </p>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
