import { Header } from "@/components/dashboard/Header";
import { Calendar, Clock, AlertTriangle } from "lucide-react";

const events = [
  { time: "08:30", currency: "USD", event: "CPI m/m", impact: "high", forecast: "0.3%", previous: "0.4%", actual: "0.2%" },
  { time: "08:30", currency: "USD", event: "Core CPI m/m", impact: "high", forecast: "0.3%", previous: "0.3%", actual: "0.3%" },
  { time: "09:45", currency: "USD", event: "Flash Manufacturing PMI", impact: "medium", forecast: "48.5", previous: "47.9", actual: null },
  { time: "10:00", currency: "USD", event: "Consumer Confidence", impact: "medium", forecast: "98.5", previous: "97.8", actual: null },
  { time: "14:00", currency: "USD", event: "FOMC Meeting Minutes", impact: "high", forecast: "—", previous: "—", actual: null },
  { time: "15:30", currency: "USD", event: "Crude Oil Inventories", impact: "medium", forecast: "-1.2M", previous: "-2.5M", actual: null },
  { time: "20:00", currency: "JPY", event: "BoJ Monetary Policy Statement", impact: "high", forecast: "—", previous: "—", actual: null },
];

const impactConfig = {
  high: { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", dot: "bg-rose-500" },
  medium: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-500" },
  low: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-500" },
};

export default function CalendarPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Economic Calendar" subtitle="Know what moves the market before it moves." />

      <main className="flex-1 p-6 space-y-6">
        {/* High impact warning */}
        <div className="flex items-center gap-3 px-5 py-4 bg-rose-500/[0.06] border border-rose-500/20 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-300">2 high-impact events remaining today</p>
            <p className="text-xs text-slate-500">FOMC Minutes at 14:00 and BoJ Statement at 20:00. Consider reducing position size around these events.</p>
          </div>
        </div>

        {/* Calendar table */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Wednesday, January 15, 2024</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              All times EST
            </div>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {/* Header row */}
            <div className="grid grid-cols-7 gap-4 px-5 py-2.5 bg-white/[0.02]">
              {["Time", "Currency", "Event", "Impact", "Forecast", "Previous", "Actual"].map((h) => (
                <p key={h} className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{h}</p>
              ))}
            </div>

            {events.map((event, i) => {
              const cfg = impactConfig[event.impact as keyof typeof impactConfig];
              const isPast = event.actual !== null;
              return (
                <div
                  key={i}
                  className={`grid grid-cols-7 gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors ${isPast ? "opacity-60" : ""}`}
                >
                  <span className="text-sm text-slate-400 font-mono">{event.time}</span>
                  <span className="text-xs font-bold text-slate-300 bg-white/[0.05] px-1.5 py-0.5 rounded self-start h-fit">{event.currency}</span>
                  <span className="text-sm text-white col-span-1">{event.event}</span>
                  <div className={`flex items-center gap-1.5 self-start`}>
                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className={`text-xs font-medium capitalize ${cfg.color}`}>{event.impact}</span>
                  </div>
                  <span className="text-sm text-slate-400">{event.forecast}</span>
                  <span className="text-sm text-slate-500">{event.previous}</span>
                  <span className={`text-sm font-semibold ${event.actual ? "text-emerald-400" : "text-slate-600"}`}>
                    {event.actual ?? "Pending"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
