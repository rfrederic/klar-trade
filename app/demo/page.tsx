"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard, BookOpen, BarChart2, Leaf, Settings, Sparkles,
  TrendingUp, TrendingDown, Check, X, ArrowRight, Flame, Eye,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEMO_TRADES, DEMO_STATS, DEMO_EQUITY, DEMO_REFUGE,
  DEMO_ANALYTICS, DEMO_JOURNAL_NOTES,
} from "@/lib/demo-data";

// ─── Types ───────────────────────────────────────────────────────────────────

type DemoTab = "dashboard" | "journal" | "analytics" | "refuge";

// ─── Equity SVG ──────────────────────────────────────────────────────────────

function EquitySVG({ data }: { data: { label: string; value: number }[] }) {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 800, h: 160 });

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => {
      setSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.12;
  const lo = min - pad;
  const hi = max + pad;

  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * w,
    y: h - ((v - lo) / (hi - lo)) * h,
  }));

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L ${w} ${h} L 0 ${h} Z`;
  const id = "demo-equity-grad";

  return (
    <svg ref={ref} className="w-full h-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke="#22C55E" strokeWidth="2" />
    </svg>
  );
}

// ─── Bar chart helper ────────────────────────────────────────────────────────

function HBar({ label, value, max, color, suffix = "" }: { label: string; value: number; max: number; color: string; suffix?: string }) {
  const pct = Math.max(0, Math.round((Math.abs(value) / max) * 100));
  const negative = value < 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#6B7280] w-28 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: negative ? "#EF4444" : color }}
        />
      </div>
      <span className={cn("text-xs font-semibold font-mono-nums w-16 text-right flex-shrink-0",
        negative ? "text-red-400" : "text-[#F2F0EB]"
      )}>
        {negative ? "" : "+"}{value}{suffix}
      </span>
    </div>
  );
}

// ─── Demo Toast ───────────────────────────────────────────────────────────────

function DemoToast({ visible }: { visible: boolean }) {
  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-[100] flex items-center gap-3 bg-[#0A0E1A] border border-[#03588C]/40 rounded-2xl px-4 py-3 shadow-2xl transition-all duration-300",
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
    )}>
      <Eye className="w-4 h-4 text-[#4BA3D4] flex-shrink-0" />
      <div>
        <p className="text-xs font-semibold text-[#F2F0EB]">Demo mode</p>
        <p className="text-[11px] text-[#6B7280]">Create an account to save your data.</p>
      </div>
      <Link href="/register" className="ml-2 text-[11px] font-semibold text-[#4BA3D4] hover:text-white whitespace-nowrap">
        Sign up →
      </Link>
    </div>
  );
}

// ─── Demo Sidebar ─────────────────────────────────────────────────────────────

const SIDEBAR_ITEMS: { id: DemoTab | "other"; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "journal",   label: "Journal",   icon: BookOpen },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "refuge",    label: "Refuge",    icon: Leaf },
  { id: "other",     label: "KlarAI",    icon: Sparkles },
  { id: "other",     label: "Settings",  icon: Settings },
];

function DemoSidebar({ active, onTabChange, onOther }: {
  active: DemoTab;
  onTabChange: (t: DemoTab) => void;
  onOther: () => void;
}) {
  return (
    <aside className="hidden md:flex w-[220px] flex-shrink-0 flex-col border-r border-white/[0.05] bg-[#06080f] h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-white/[0.05]">
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <Image src="/klar-removebg-preview.png" alt="KlarTrade" width={32} height={32} className="object-contain" />
        </div>
        <span className="text-[15px] font-bold text-[#F2F0EB] tracking-tight">
          Klar<span className="text-[#4BA3D4]">Trade</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = id !== "other" && id === active;
          return (
            <button
              key={label}
              onClick={() => id === "other" ? onOther() : onTabChange(id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left",
                isActive
                  ? "bg-[#03588C] text-white"
                  : "text-[#6B7280] hover:text-[#F2F0EB] hover:bg-white/[0.04]"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[13px] font-medium">{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────

const ROUTINE = [
  "Check economic calendar",
  "Review HTF bias (Weekly/Daily)",
  "Log pre-market mental state",
  "Set daily risk limit",
  "Write trading intention",
  "Review yesterday's trades",
];

function DashboardView({ onAction }: { onAction: () => void }) {
  const recent = DEMO_TRADES.slice(0, 8);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F2F0EB]">Good morning, Alex</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Saturday, June 7, 2026 · London session</p>
        </div>
        <button onClick={onAction} className="px-4 py-2 rounded-xl bg-[#03588C]/20 border border-[#03588C]/30 text-xs font-semibold text-[#4BA3D4] hover:bg-[#03588C]/30 transition-all">
          + Add Trade
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Account Balance", value: "$12,840", sub: "+$2,840 this month", color: "text-[#F2F0EB]", accent: "text-emerald-400" },
          { label: "Net P&L",         value: "+$2,840", sub: "+28.4% return",      color: "text-emerald-400", accent: "text-emerald-400" },
          { label: "Win Rate",        value: "64%",     sub: "29 wins / 16 losses", color: "text-[#4BA3D4]", accent: "text-[#6B7280]" },
          { label: "Discipline",      value: "78/100",  sub: "↑ 6pts this week",   color: "text-[#D9CA82]", accent: "text-[#D9CA82]" },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <p className="text-[11px] text-[#6B7280] mb-2">{s.label}</p>
            <p className={cn("text-2xl font-bold font-mono-nums", s.color)}>{s.value}</p>
            <p className={cn("text-[11px] mt-1", s.accent)}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Equity chart */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-[#F2F0EB]">Equity Curve — Last 30 Days</p>
          <span className="text-xs text-emerald-400 font-semibold">+28.4%</span>
        </div>
        <div className="h-40">
          <EquitySVG data={DEMO_EQUITY} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-[#6B7280]">May 8</span>
          <span className="text-[10px] text-[#6B7280]">Jun 6</span>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-5 gap-4">
        {/* Recent trades */}
        <div className="col-span-3 glass rounded-2xl p-4">
          <p className="text-sm font-semibold text-[#F2F0EB] mb-3">Recent Trades</p>
          <div className="space-y-2">
            {recent.map(t => (
              <div key={t.id} className="flex items-center gap-3 py-1.5 border-b border-white/[0.03] last:border-0">
                <div className="flex items-center gap-2 w-24 flex-shrink-0">
                  <span className="text-xs font-bold text-[#F2F0EB]">{t.symbol}</span>
                  <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded",
                    t.direction === "BUY" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                  )}>{t.direction}</span>
                </div>
                <span className="text-[11px] text-[#6B7280] flex-1">{t.setup}</span>
                <span className={cn("text-xs font-semibold font-mono-nums w-16 text-right",
                  t.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  {t.pnl >= 0 ? "+" : ""}${t.pnl}
                </span>
                <span className="text-[10px] text-[#6B7280] w-12 text-right">{t.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pre-market routine */}
        <div className="col-span-2 glass rounded-2xl p-4">
          <p className="text-sm font-semibold text-[#F2F0EB] mb-3">Pre-Market Routine</p>
          <div className="space-y-2">
            {ROUTINE.map((step, i) => (
              <button key={step} onClick={onAction} className="w-full flex items-center gap-2.5 group">
                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                  i < 4 ? "bg-[#03588C]" : "border border-white/[0.15]"
                )}>
                  {i < 4 && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={cn("text-[12px]", i < 4 ? "text-[#6B7280] line-through" : "text-[#F2F0EB]")}>{step}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 text-[11px] text-[#6B7280]">4 / 6 complete</div>
        </div>
      </div>
    </div>
  );
}

// ─── Journal View ─────────────────────────────────────────────────────────────

function JournalView({ onAction }: { onAction: () => void }) {
  const [filter, setFilter] = useState<"all" | "wins" | "losses">("all");
  const [selected, setSelected] = useState<string | null>("t01");

  const filtered = DEMO_TRADES.filter(t =>
    filter === "all" || (filter === "wins" && t.outcome === "Win") || (filter === "losses" && t.outcome === "Loss")
  );

  const sel = DEMO_TRADES.find(t => t.id === selected);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Trade list */}
      <div className="w-80 flex-shrink-0 border-r border-white/[0.05] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/[0.05]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#F2F0EB]">Trade Log</h2>
            <button onClick={onAction} className="text-[11px] text-[#4BA3D4] hover:text-white">+ Add</button>
          </div>
          <div className="flex gap-1">
            {(["all", "wins", "losses"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn("flex-1 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all",
                  filter === f ? "bg-[#03588C] text-white" : "bg-white/[0.04] text-[#6B7280] hover:text-[#F2F0EB]"
                )}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(t => (
            <button key={t.id} onClick={() => setSelected(t.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 border-b border-white/[0.03] text-left transition-all",
                selected === t.id ? "bg-[#03588C]/10 border-l-2 border-l-[#03588C]" : "hover:bg-white/[0.02]"
              )}>
              <div className={cn("w-2 h-2 rounded-full flex-shrink-0",
                t.pnl >= 0 ? "bg-emerald-400" : "bg-red-400"
              )} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F2F0EB]">{t.symbol}</span>
                  <span className={cn("text-xs font-semibold font-mono-nums",
                    t.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                  )}>
                    {t.pnl >= 0 ? "+" : ""}${t.pnl}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-[#6B7280]">{t.date}</span>
                  <span className="text-[10px] text-[#6B7280]">{t.setup}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail pane */}
      <div className="flex-1 overflow-y-auto p-6">
        {sel ? (
          <div className="max-w-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-[#F2F0EB]">{sel.symbol}</h2>
                  <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded",
                    sel.direction === "BUY" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                  )}>{sel.direction}</span>
                  <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded",
                    sel.outcome === "Win" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                  )}>{sel.outcome}</span>
                </div>
                <p className="text-sm text-[#6B7280] mt-0.5">{sel.date} · {sel.setup}</p>
              </div>
              <span className={cn("text-2xl font-bold font-mono-nums",
                sel.pnl >= 0 ? "text-emerald-400" : "text-red-400"
              )}>
                {sel.pnl >= 0 ? "+" : ""}${sel.pnl}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Setup",        value: sel.setup },
                { label: "Emotion",      value: sel.emotion },
                { label: "Followed Plan",value: sel.followed_plan ? "Yes" : "No" },
              ].map(m => (
                <div key={m.label} className="glass rounded-xl p-3">
                  <p className="text-[10px] text-[#6B7280] mb-1">{m.label}</p>
                  <p className="text-sm font-semibold text-[#F2F0EB]">{m.value}</p>
                </div>
              ))}
            </div>

            <div className="glass rounded-xl p-4">
              <p className="text-[11px] text-[#6B7280] mb-2 font-semibold uppercase tracking-wide">Notes</p>
              <p className="text-sm text-[#9CA3AF] leading-relaxed">{sel.notes}</p>
            </div>

            {DEMO_JOURNAL_NOTES[sel.date] && (
              <div className="glass rounded-xl p-4 border border-[#03588C]/20">
                <p className="text-[11px] text-[#4BA3D4] mb-2 font-semibold uppercase tracking-wide">Daily Journal</p>
                <p className="text-sm text-[#9CA3AF] leading-relaxed">{DEMO_JOURNAL_NOTES[sel.date]}</p>
              </div>
            )}

            <button onClick={onAction}
              className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-[#6B7280] hover:text-[#F2F0EB] transition-all">
              Edit trade
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-[#6B7280] text-sm">
            Select a trade to view details
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Analytics View ───────────────────────────────────────────────────────────

function AnalyticsView() {
  const { by_setup, by_symbol, by_emotion, daily_pnl } = DEMO_ANALYTICS;
  const maxPnl = Math.max(...by_setup.map(s => Math.abs(s.pnl)));
  const maxSymPnl = Math.max(...by_symbol.map(s => Math.abs(s.pnl)));
  const maxDailyPnl = Math.max(...daily_pnl.map(d => Math.abs(d.pnl)));

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-xl font-bold text-[#F2F0EB]">Analytics — Last 30 Days</h1>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Trades",   value: "45" },
          { label: "Avg Win",        value: `+$${DEMO_STATS.avg_win}` },
          { label: "Avg Loss",       value: `-$${DEMO_STATS.avg_loss}` },
          { label: "Best Trade",     value: `+$${DEMO_STATS.best_trade}` },
          { label: "Worst Trade",    value: `-$${Math.abs(DEMO_STATS.worst_trade)}` },
          { label: "Plan Adherence", value: "73%" },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl p-3 text-center">
            <p className="text-[10px] text-[#6B7280] mb-1">{s.label}</p>
            <p className="text-base font-bold font-mono-nums text-[#F2F0EB]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* By setup */}
        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-semibold text-[#F2F0EB] mb-4">P&L by Setup</p>
          <div className="space-y-3">
            {by_setup.map(s => (
              <HBar key={s.name} label={s.name} value={s.pnl} max={maxPnl} color="#22C55E" suffix="" />
            ))}
          </div>
        </div>

        {/* By symbol */}
        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-semibold text-[#F2F0EB] mb-4">P&L by Symbol</p>
          <div className="space-y-3">
            {by_symbol.map(s => (
              <HBar key={s.symbol} label={s.symbol} value={s.pnl} max={maxSymPnl} color="#4BA3D4" />
            ))}
          </div>
        </div>

        {/* By emotion */}
        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-semibold text-[#F2F0EB] mb-4">Avg P&L by Emotion</p>
          <div className="space-y-3">
            {by_emotion.map(e => (
              <HBar key={e.emotion} label={e.emotion} value={e.avg_pnl} max={100} color="#D9CA82" />
            ))}
          </div>
          <p className="text-[11px] text-[#6B7280] mt-4 pt-3 border-t border-white/[0.05]">
            Rattled trades cost you an average of $58 — your worst emotional state to trade in.
          </p>
        </div>

        {/* Win rate by setup */}
        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-semibold text-[#F2F0EB] mb-4">Win Rate by Setup</p>
          <div className="space-y-3">
            {by_setup.map(s => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-xs text-[#6B7280] w-28 flex-shrink-0">{s.name}</span>
                <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.win_rate}%`, background: "#03588C" }} />
                </div>
                <span className="text-xs font-semibold text-[#F2F0EB] w-10 text-right">{s.win_rate}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily P&L bar chart */}
      <div className="glass rounded-2xl p-4">
        <p className="text-sm font-semibold text-[#F2F0EB] mb-4">Daily P&L</p>
        <div className="flex items-end gap-1 h-28">
          {daily_pnl.map(d => {
            const pct = (Math.abs(d.pnl) / maxDailyPnl) * 100;
            const pos = d.pnl >= 0;
            return (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-0.5" title={`${d.label}: ${d.pnl >= 0 ? "+" : ""}$${d.pnl}`}>
                <div className="w-full rounded-sm" style={{ height: `${pct}%`, background: pos ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.6)" }} />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-[#6B7280]">{daily_pnl[0].label}</span>
          <span className="text-[10px] text-[#6B7280]">{daily_pnl[daily_pnl.length - 1].label}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Refuge View ──────────────────────────────────────────────────────────────

const BIOME_COLORS: Record<string, string> = {
  Ocean: "#0EA5E9", Forest: "#22C55E", Mountain: "#8B5CF6", Desert: "#F59E0B",
};

function RefugeView({ onAction }: { onAction: () => void }) {
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#F2F0EB]">Refuge</h1>
        <button onClick={onAction}
          className="px-4 py-2 rounded-xl bg-[#03588C]/20 border border-[#03588C]/30 text-xs font-semibold text-[#4BA3D4] hover:bg-[#03588C]/30 transition-all">
          Start Session
        </button>
      </div>

      {/* Streak + stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-4 col-span-1 border border-[#D9CA82]/20 flex items-center gap-3">
          <Flame className="w-8 h-8 text-[#D9CA82]" />
          <div>
            <p className="text-2xl font-bold text-[#D9CA82] font-mono-nums">{DEMO_STATS.refuge_streak}</p>
            <p className="text-[11px] text-[#6B7280]">Day streak</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-[#F2F0EB] font-mono-nums">{DEMO_STATS.refuge_sessions}</p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">Sessions (30d)</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-[#4BA3D4] font-mono-nums">8.6</p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">Avg duration (min)</p>
        </div>
      </div>

      {/* Sessions */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.05]">
          <p className="text-sm font-semibold text-[#F2F0EB]">Session History</p>
        </div>
        {DEMO_REFUGE.map((s, i) => (
          <div key={s.id} className={cn("flex items-center gap-4 px-5 py-3.5", i > 0 && "border-t border-white/[0.04]")}>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
              style={{ background: `${BIOME_COLORS[s.biome]}25`, color: BIOME_COLORS[s.biome] }}
            >
              {s.biome[0]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#F2F0EB]">{s.biome}</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5">{s.date} · {s.duration} min</p>
            </div>
            <div className="text-right text-[11px]">
              <span className="text-[#6B7280]">{s.mood_before}</span>
              <span className="text-[#6B7280] mx-1">→</span>
              <span className="text-emerald-400">{s.mood_after}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<DemoTab>("dashboard");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(() => {
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 3500);
  }, []);

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#050508]">
      {/* Demo Banner */}
      <div className="flex-shrink-0 flex items-center justify-between gap-4 px-5 py-2.5 bg-[#03588C]/15 border-b border-[#03588C]/25">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-[#4BA3D4]" />
          <span className="text-xs font-medium text-[#4BA3D4]">
            You&apos;re exploring KlarTrade in <strong>demo mode</strong> — data is simulated
          </span>
        </div>
        <Link
          href="/register"
          className="flex items-center gap-1.5 text-[11px] font-semibold text-white bg-[#03588C] hover:bg-[#024a77] px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
        >
          Start Free Trial <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* App shell */}
      <div className="flex flex-1 overflow-hidden">
        <DemoSidebar active={activeTab} onTabChange={setActiveTab} onOther={showToast} />

        {/* Mobile tab bar */}
        <div className="md:hidden flex border-b border-white/[0.05] bg-[#06080f] fixed bottom-0 left-0 right-0 z-40">
          {(["dashboard", "journal", "analytics", "refuge"] as DemoTab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("flex-1 py-3 text-[10px] font-semibold uppercase tracking-wide transition-all",
                activeTab === tab ? "text-[#4BA3D4]" : "text-[#6B7280]"
              )}>
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "dashboard" && <DashboardView onAction={showToast} />}
          {activeTab === "journal"   && <JournalView   onAction={showToast} />}
          {activeTab === "analytics" && <AnalyticsView />}
          {activeTab === "refuge"    && <RefugeView    onAction={showToast} />}
        </main>
      </div>

      <DemoToast visible={toastVisible} />
    </div>
  );
}
