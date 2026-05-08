"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { RefreshCw, Filter, Calendar, List, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const currencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD"];

const events = [
  { time: "08:30", currency: "USD", event: "Non-Farm Payrolls", impact: "high", forecast: "185K", previous: "175K", actual: "203K" },
  { time: "08:30", currency: "USD", event: "Unemployment Rate", impact: "high", forecast: "3.9%", previous: "3.8%", actual: "3.9%" },
  { time: "10:00", currency: "USD", event: "ISM Manufacturing PMI", impact: "medium", forecast: "50.3", previous: "50.3", actual: "" },
  { time: "13:00", currency: "GBP", event: "BOE Governor Bailey Speech", impact: "high", forecast: "", previous: "", actual: "" },
  { time: "14:30", currency: "EUR", event: "ECB Monetary Policy Meeting Accounts", impact: "medium", forecast: "", previous: "", actual: "" },
  { time: "15:00", currency: "USD", event: "Consumer Confidence", impact: "medium", forecast: "99.5", previous: "97.0", actual: "" },
  { time: "20:00", currency: "USD", event: "FOMC Meeting Minutes", impact: "high", forecast: "", previous: "", actual: "" },
];

const upcomingWeek = [
  { date: "Mon May 5", dots: [{ impact: "medium" }, { impact: "low" }] },
  { date: "Tue May 6", dots: [{ impact: "high" }, { impact: "high" }, { impact: "medium" }] },
  { date: "Wed May 7", dots: [{ impact: "high" }, { impact: "medium" }, { impact: "low" }, { impact: "low" }] },
  { date: "Thu May 8", dots: [{ impact: "medium" }, { impact: "low" }] },
  { date: "Fri May 9", dots: [{ impact: "high" }, { impact: "medium" }] },
];

const impactConfig = {
  high: { color: "text-red-400", bg: "bg-red-500", dot: "bg-red-500" },
  medium: { color: "text-[#F59E0B]", bg: "bg-[#F59E0B]", dot: "bg-[#F59E0B]" },
  low: { color: "text-[#6B7280]", bg: "bg-[#6B7280]", dot: "bg-[#6B7280]" },
};

const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
const dayImpacts: Record<number, "high" | "medium" | "low" | null> = {
  1: "low", 2: "medium", 5: "high", 6: "medium", 7: "high",
  8: "medium", 9: "high", 12: "low", 13: "medium", 14: "high",
  15: "medium", 19: "low", 20: "high", 21: "medium", 22: "high",
  26: "medium", 27: "low", 28: "high",
};

export default function NewsPage() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState(7);

  const toggleCurrency = (c: string) =>
    setSelectedCurrencies((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const toggleImpact = (i: string) =>
    setSelectedImpacts((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  const filteredEvents = events.filter((e) => {
    if (selectedCurrencies.length > 0 && !selectedCurrencies.includes(e.currency)) return false;
    if (selectedImpacts.length > 0 && !selectedImpacts.includes(e.impact)) return false;
    return true;
  });

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="News"
        subtitle="Never trade into a high-impact event again."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-3.5 h-3.5" />
              Block Trading Settings
            </Button>
            <Button variant="ghost" size="sm">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-2 px-6 py-3 border-b border-white/[0.05] bg-[#06080f]">
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
          <button onClick={() => setView("list")} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            view === "list" ? "bg-[#03588C] text-white" : "text-[#6B7280] hover:text-[#F2F0EB]")}>
            <List className="w-3.5 h-3.5" /> List
          </button>
          <button onClick={() => setView("calendar")} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            view === "calendar" ? "bg-[#03588C] text-white" : "text-[#6B7280] hover:text-[#F2F0EB]")}>
            <Calendar className="w-3.5 h-3.5" /> Calendar
          </button>
        </div>
        <span className="text-[11px] text-[#6B7280] ml-1">Showing: May 7, 2025</span>
      </div>

      <main className="flex-1 flex overflow-hidden">
        {view === "list" && (
          <>
            {/* Filters */}
            <div className="w-56 flex-shrink-0 border-r border-white/[0.05] p-4 space-y-5 bg-[#06080f] overflow-y-auto">
              <div>
                <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Currencies</p>
                <div className="flex flex-wrap gap-1.5">
                  {currencies.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleCurrency(c)}
                      className={cn("text-[11px] font-medium px-2 py-1 rounded-lg border transition-all",
                        selectedCurrencies.includes(c)
                          ? "bg-[#03588C] text-white border-[#03588C]"
                          : "bg-white/[0.04] text-[#6B7280] border-white/[0.07] hover:text-[#F2F0EB]")}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Impact</p>
                <div className="space-y-1.5">
                  {(["high", "medium", "low"] as const).map((imp) => {
                    const cfg = impactConfig[imp];
                    return (
                      <button
                        key={imp}
                        onClick={() => toggleImpact(imp)}
                        className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium capitalize transition-all",
                          selectedImpacts.includes(imp)
                            ? "bg-[#03588C]/15 border-[#03588C]/30 text-[#F2F0EB]"
                            : "bg-white/[0.04] border-white/[0.07] text-[#6B7280] hover:text-[#F2F0EB]")}
                      >
                        <div className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                        {imp} Impact
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Date Range</p>
                <div className="space-y-1">
                  {["Today", "Tomorrow", "This week", "Next week", "This month"].map((d) => (
                    <button key={d} className={cn("w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all",
                      d === "Today" ? "bg-[#03588C]/15 text-[#4BA3D4]" : "text-[#6B7280] hover:text-[#F2F0EB] hover:bg-white/[0.04]")}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Event list */}
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-white/[0.04]">
                <div className="px-6 py-3 flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-[#F2F0EB]">Wednesday, May 7</h3>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  </div>
                </div>

                {filteredEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Calendar className="w-10 h-10 text-[#6B7280] mx-auto mb-3" />
                    <p className="text-sm text-[#6B7280]">No events match your filters</p>
                  </div>
                ) : filteredEvents.map((e, i) => {
                  const cfg = impactConfig[e.impact as keyof typeof impactConfig];
                  return (
                    <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                      <span className="w-12 text-xs text-[#6B7280] font-mono-nums flex-shrink-0">{e.time}</span>
                      <div className={cn("w-2 h-2 rounded-full flex-shrink-0", cfg.dot)} />
                      <div className="flex-shrink-0 w-10">
                        <span className="text-[11px] font-bold text-[#F2F0EB]">{e.currency}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#F2F0EB]">{e.event}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-6 text-xs text-[#6B7280] flex-shrink-0">
                        <div className="text-center w-16">
                          <p className="text-[10px] mb-0.5">Forecast</p>
                          <p className="font-mono-nums text-[#F2F0EB]">{e.forecast || "—"}</p>
                        </div>
                        <div className="text-center w-16">
                          <p className="text-[10px] mb-0.5">Previous</p>
                          <p className="font-mono-nums">{e.previous || "—"}</p>
                        </div>
                        <div className="text-center w-16">
                          <p className="text-[10px] mb-0.5">Actual</p>
                          <p className={cn("font-mono-nums font-bold",
                            e.actual ? (parseFloat(e.actual) > parseFloat(e.forecast || "0") ? "text-[#22C55E]" : "text-red-400") : "text-[#6B7280]")}>
                            {e.actual || "Pending"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {view === "calendar" && (
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#F2F0EB]">May 2025</h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-[#6B7280] hover:text-[#F2F0EB] transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-[#6B7280] hover:text-[#F2F0EB] transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center text-[10px] text-[#6B7280] font-medium py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 3 }).map((_, i) => <div key={`e${i}`} />)}
                {calendarDays.map((day) => {
                  const impact = dayImpacts[day];
                  const cfg = impact ? impactConfig[impact] : null;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={cn("aspect-square rounded-xl p-1.5 flex flex-col items-center justify-between transition-all border",
                        selectedDay === day ? "border-[#03588C]/40 bg-[#03588C]/15" : "border-transparent hover:border-white/[0.08] hover:bg-white/[0.03]"
                      )}
                    >
                      <span className={cn("text-[11px]", day === 7 ? "font-bold text-[#4BA3D4]" : "text-[#6B7280]")}>{day}</span>
                      {cfg && <div className={cn("w-2 h-2 rounded-full", cfg.dot)} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upcoming high impact */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-[#F2F0EB] mb-3">Upcoming This Week</h3>
              <div className="space-y-2">
                {upcomingWeek.map((day) => (
                  <div key={day.date} className="glass rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-[#F2F0EB] font-medium">{day.date}</span>
                    <div className="flex gap-1.5">
                      {day.dots.map((dot, i) => {
                        const cfg = impactConfig[dot.impact as keyof typeof impactConfig];
                        return <div key={i} className={cn("w-2 h-2 rounded-full", cfg.dot)} />;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
