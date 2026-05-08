"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Plus, RefreshCw, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Sparkles, Smile, Meh, Frown, Check, AlertTriangle, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const calendarData: Record<number, { pnl: number; trades: number }> = {
  1: { pnl: 480, trades: 2 }, 2: { pnl: -180, trades: 1 }, 3: { pnl: 840, trades: 3 },
  6: { pnl: 0, trades: 0 }, 7: { pnl: 1240, trades: 4 }, 8: { pnl: -340, trades: 2 },
  9: { pnl: 620, trades: 3 }, 10: { pnl: 380, trades: 2 }, 13: { pnl: 920, trades: 3 },
  14: { pnl: -80, trades: 1 }, 15: { pnl: 1480, trades: 5 }, 16: { pnl: 240, trades: 2 },
  17: { pnl: 680, trades: 3 }, 20: { pnl: -420, trades: 2 }, 21: { pnl: 560, trades: 2 },
  22: { pnl: 1020, trades: 4 }, 23: { pnl: 480, trades: 2 }, 24: { pnl: -120, trades: 1 },
};

const trades = [
  { id: "1", symbol: "EURUSD", dir: "Long", pnl: "+$480", r: "+2.4R", emotion: "calm", grade: "A", time: "09:42", plan: true, aiNote: "Textbook entry. Entry timing was precise — within 2 bars of optimal. Full R2 captured." },
  { id: "2", symbol: "ES", dir: "Long", pnl: "+$840", r: "+1.8R", emotion: "focused", grade: "A+", time: "10:15", plan: true, aiNote: "Excellent execution. Waited for the retest. Scaled out at T1 and moved stop to breakeven." },
  { id: "3", symbol: "NQ", dir: "Short", pnl: "-$180", r: "-0.9R", emotion: "frustrated", grade: "C", time: "11:30", plan: false, aiNote: "Entered 3 bars early. Setup was not fully confirmed. Rule violation detected: entered before 15m confirmation." },
];

const emotions = [
  { icon: Smile, label: "Calm", color: "#22C55E" },
  { icon: Smile, label: "Focused", color: "#4BA3D4" },
  { icon: Meh, label: "Neutral", color: "#6B7280" },
  { icon: Frown, label: "Anxious", color: "#F59E0B" },
  { icon: Frown, label: "Frustrated", color: "#EF4444" },
];

function CalendarDay({ day, data, selected, onClick }: { day: number; data?: { pnl: number; trades: number }; selected: boolean; onClick: () => void }) {
  if (!data) return <div className="aspect-square rounded-xl bg-white/[0.02] opacity-30" />;
  const hasData = data.trades > 0;
  return (
    <button
      onClick={onClick}
      className={cn("aspect-square rounded-xl p-1.5 flex flex-col justify-between transition-all border text-left",
        selected ? "border-[#03588C]/50 bg-[#03588C]/15" : "border-transparent hover:border-white/[0.08] hover:bg-white/[0.03]",
        !hasData && "opacity-40"
      )}
    >
      <span className="text-[11px] text-[#6B7280]">{day}</span>
      {hasData && (
        <>
          <span className={cn("text-[10px] font-bold font-mono-nums block", data.pnl >= 0 ? "text-[#22C55E]" : "text-red-400")}>
            {data.pnl >= 0 ? "+" : ""}${Math.abs(data.pnl)}
          </span>
          <div className={cn("h-1 rounded-full mt-0.5", data.pnl >= 0 ? "bg-[#22C55E]" : "bg-red-500")} style={{ width: `${Math.min(100, Math.abs(data.pnl) / 15)}%` }} />
        </>
      )}
    </button>
  );
}

export default function JournalPage() {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [selectedDay, setSelectedDay] = useState(7);
  const [month, setMonth] = useState(4); // May (0-indexed)
  const [year] = useState(2025);
  const [expandedTrade, setExpandedTrade] = useState<string | null>(null);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayData = calendarData[selectedDay];
  const totalPnL = Object.values(calendarData).reduce((a, d) => a + d.pnl, 0);
  const winDays = Object.values(calendarData).filter((d) => d.pnl > 0).length;
  const totalDays = Object.values(calendarData).filter((d) => d.trades > 0).length;

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Journal"
        subtitle="Automated · Every trade logged the moment it closes."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Now
            </Button>
            <span className="text-[11px] text-[#6B7280]">Synced 3m ago</span>
            <Button size="sm">
              <Plus className="w-3.5 h-3.5" />
              Add Manual
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-2 px-6 py-3 border-b border-white/[0.05] bg-[#06080f]">
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
          {(["calendar", "list"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={cn("px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all",
                view === v ? "bg-[#03588C] text-white" : "text-[#6B7280] hover:text-[#F2F0EB]")}>
              {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          {["$", "%", "R"].map((t) => (
            <button key={t} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B7280] hover:text-[#F2F0EB] hover:bg-white/[0.04] transition-all">{t}</button>
          ))}
        </div>
      </div>

      <main className="flex-1 p-6 flex gap-6">
        {view === "calendar" && (
          <>
            {/* Calendar */}
            <div className="flex-1 space-y-5">
              {/* Month nav */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#F2F0EB]">{MONTHS[month]} {year}</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setMonth(m => Math.max(0, m - 1))} className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-[#6B7280] hover:text-[#F2F0EB] transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setMonth(m => Math.min(11, m + 1))} className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-[#6B7280] hover:text-[#F2F0EB] transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="glass rounded-2xl p-4">
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {DAYS.map((d) => <div key={d} className="text-center text-[10px] text-[#6B7280] font-medium py-1">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                    <CalendarDay
                      key={day}
                      day={day}
                      data={calendarData[day]}
                      selected={selectedDay === day}
                      onClick={() => setSelectedDay(day)}
                    />
                  ))}
                </div>
              </div>

              {/* Monthly summary */}
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-[#F2F0EB] mb-4">Monthly Summary — {MONTHS[month]}</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {[
                    { l: "Net PnL", v: `+$${totalPnL.toLocaleString()}`, c: "text-[#22C55E]" },
                    { l: "Win Days", v: `${winDays}/${totalDays}`, c: "text-[#4BA3D4]" },
                    { l: "Best Day", v: "+$1,480", c: "text-[#22C55E]" },
                    { l: "Worst Day", v: "-$420", c: "text-red-400" },
                    { l: "Avg R", v: "+1.8R", c: "text-[#F2F0EB]" },
                    { l: "Expectancy", v: "+0.9R", c: "text-[#D9CA82]" },
                  ].map((s) => (
                    <div key={s.l}>
                      <p className="text-[10px] text-[#6B7280] mb-1">{s.l}</p>
                      <p className={cn("text-sm font-bold font-mono-nums", s.c)}>{s.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Day detail panel */}
            <div className="w-72 flex-shrink-0 space-y-4">
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#F2F0EB]">
                    {MONTHS[month]} {selectedDay}
                    {selectedDay === new Date().getDate() && <span className="ml-2 text-[10px] px-2 py-0.5 bg-[#03588C]/20 text-[#4BA3D4] rounded-full">Today</span>}
                  </h3>
                </div>

                {dayData && dayData.trades > 0 ? (
                  <div className="space-y-3">
                    <p className={cn("text-3xl font-black font-mono-nums", dayData.pnl >= 0 ? "text-[#22C55E]" : "text-red-400")}>
                      {dayData.pnl >= 0 ? "+" : ""}${dayData.pnl}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div><p className="text-[#6B7280]">Trades</p><p className="text-[#F2F0EB] font-bold">{dayData.trades}</p></div>
                      <div><p className="text-[#6B7280]">Win Rate</p><p className="text-[#22C55E] font-bold">67%</p></div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#22C55E] bg-[#22C55E]/08 border border-[#22C55E]/15 rounded-xl px-3 py-2">
                      <Check className="w-3 h-3" /> Plan followed
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-[#6B7280]">No trades on this day</p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-white/[0.05]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Mic className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span className="text-[10px] text-[#6B7280] font-medium uppercase tracking-wide">Notes</span>
                  </div>
                  <textarea
                    placeholder="Add session notes..."
                    rows={3}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-[#F2F0EB] placeholder-[#6B7280] resize-none focus:outline-none focus:border-[#03588C]/50"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {view === "list" && (
          <div className="flex-1 space-y-4 max-w-3xl">
            {trades.map((trade) => (
              <div key={trade.id} className="glass rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedTrade(expandedTrade === trade.id ? null : trade.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-2 h-2 rounded-full flex-shrink-0", trade.pnl.startsWith("+") ? "bg-[#22C55E]" : "bg-red-500")} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#F2F0EB] font-mono-nums">{trade.symbol}</span>
                        <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-lg",
                          trade.dir === "Long" ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-red-500/10 text-red-400")}>
                          {trade.dir}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#03588C]/15 text-[#4BA3D4] font-medium">{trade.grade}</span>
                      </div>
                      <p className="text-[11px] text-[#6B7280] mt-0.5">{trade.time} · {trade.plan ? "Plan followed" : "Rule violation"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={cn("text-sm font-bold font-mono-nums", trade.pnl.startsWith("+") ? "text-[#22C55E]" : "text-red-400")}>{trade.pnl}</p>
                      <p className="text-[11px] text-[#6B7280] font-mono-nums">{trade.r}</p>
                    </div>
                    {!trade.plan && <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                  </div>
                </button>

                {expandedTrade === trade.id && (
                  <div className="px-5 pb-5 border-t border-white/[0.05] pt-4 space-y-4">
                    {/* Emotion tags */}
                    <div>
                      <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-2">Emotion</p>
                      <div className="flex gap-2">
                        {emotions.map((e) => (
                          <button
                            key={e.label}
                            className={cn("flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-[10px] transition-all",
                              trade.emotion === e.label.toLowerCase()
                                ? "border-[#03588C]/40 bg-[#03588C]/12 text-[#F2F0EB]"
                                : "border-white/[0.07] text-[#6B7280] hover:border-white/[0.15]")}
                          >
                            <e.icon className="w-4 h-4" style={{ color: trade.emotion === e.label.toLowerCase() ? e.color : undefined }} />
                            {e.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* KlarAI analysis */}
                    <div className="border-l-2 border-[#03588C] pl-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3 h-3 text-[#4BA3D4]" />
                        <span className="text-[10px] text-[#4BA3D4] font-semibold">KlarAI Analysis</span>
                      </div>
                      <p className="text-xs text-[#6B7280] leading-relaxed">{trade.aiNote}</p>
                    </div>

                    {/* Notes */}
                    <textarea
                      placeholder="Add your notes, observations, or lessons..."
                      rows={2}
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs text-[#F2F0EB] placeholder-[#6B7280] resize-none focus:outline-none focus:border-[#03588C]/50"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
