"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Sparkles, Check, ArrowRight, Circle,
  Loader2, RefreshCw, Plug, Activity, Leaf, X, ChevronRight, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QuoteWidget } from "@/components/ui/QuoteSystem";
import { BIOMES } from "@/lib/biomes";
import { getBrowserTimezone, getLocalDateString } from "@/lib/timezone";

const timeframes = ["Today", "7D", "30D", "90D", "YTD", "ALL"];

// ─── RefugeNudge ──────────────────────────────────────────────────────────────

function RefugeNudge() {
  const router          = useRouter();
  const [show,   setShow]   = useState(false);
  const [accent, setAccent] = useState("#4A9B6F");

  useEffect(() => {
    const tz         = getBrowserTimezone();
    const today      = getLocalDateString(new Date(), tz);
    const dismissKey = `refuge_nudge_dismissed_${today}`;
    if (localStorage.getItem(dismissKey)) return;

    Promise.all([
      fetch(`/api/dashboard/stats?timeframe=7D&tz=${encodeURIComponent(tz)}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/refuge/session?tz=${encodeURIComponent(tz)}`).then(r => r.ok ? r.json() : null),
    ]).then(([dashData, refugeData]) => {
      // Bail out if either fetch failed
      if (!dashData || !refugeData) return;

      // Condition 1: 2+ consecutive losses at the head of the last 5 trades
      const trades = ((dashData.recentTrades ?? []) as { outcome: string }[]).slice(0, 5);
      let lossStreak = 0;
      for (const t of trades) {
        if (t.outcome === "Loss") lossStreak++;
        else break;
      }
      if (lossStreak < 2) return;

      // Condition 2: no Refuge session in the last 24 hours
      const recent = (refugeData.recent ?? []) as { created_at: string }[];
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      if (recent.some(s => new Date(s.created_at).getTime() > cutoff)) return;

      // Most-visited biome accent — falls back to #4A9B6F if no session history
      const calendar = (refugeData.calendar ?? []) as { biome: string | null }[];
      const counts: Record<string, number> = {};
      for (const d of calendar) {
        if (d.biome) counts[d.biome] = (counts[d.biome] ?? 0) + 1;
      }
      const topName     = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
      const biomeAccent = topName
        ? (Object.values(BIOMES).find(b => b.name === topName)?.accent ?? "#4A9B6F")
        : "#4A9B6F";
      setAccent(biomeAccent);

      setShow(true);
    }).catch(() => {});
  }, []);

  const dismiss = () => {
    localStorage.setItem(`refuge_nudge_dismissed_${getLocalDateString(new Date(), getBrowserTimezone())}`, "1");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="refuge-nudge"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="flex items-center justify-between gap-4 px-5 py-3 rounded-2xl"
          style={{ background: `${accent}10`, border: `1px solid ${accent}28` }}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Leaf className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} />
            <span className="text-[13px] text-[#F2F0EB]/70">
              Tough stretch. Refuge is here when you need it.
            </span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => router.push("/refuge")}
              className="flex items-center gap-1 text-[12px] font-semibold hover:opacity-75 transition-opacity"
              style={{ color: accent }}
            >
              Go to Refuge <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={dismiss}
              className="text-[#6B7280] hover:text-[#F2F0EB] transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface DashboardStats {
  balance: number | null;
  equity: number | null;
  totalPnl: number;
  winRate: string | null;
  totalTrades: number;
  profitFactor: string | null;
}

interface TodayStats {
  pnl: number;
  trades: number;
  openPositions: number;
}

interface Trade {
  instrument: string;
  direction: string;
  pnl: string;
  outcome: string;
  setup: string;
  emotion: string;
  grade: string;
  closedAt: string;
}

function EquityChart({ data }: { data: number[] }) {
  if (data.length < 2) return (
    <div className="w-full h-full flex items-center justify-center text-[12px] text-[#6B7280]">
      No trade data yet
    </div>
  );

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 600;
  const H = 160;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * H * 0.85 - H * 0.05,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${W} ${H} L 0 ${H} Z`;
  const isProfit = data[data.length - 1] >= data[0];
  const color = isProfit ? "#22C55E" : "#EF4444";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#equityGrad)" />
      <path d={pathD} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {points[points.length - 1] && (
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill={color} />
      )}
    </svg>
  );
}

function fmt(n: number | null, prefix = "$") {
  if (n == null) return "—";
  return `${prefix}${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function pnlStr(n: number) {
  return `${n >= 0 ? "+" : "-"}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

const PRE_MARKET_ITEMS = [
  "Review your Edge plan",
  "Check economic calendar",
  "Set daily risk limits",
  "Set trading intention for today",
  "Visit Refuge for mental prep",
];

interface CustomItem { label: string; checked: boolean; }
interface PreMarketStore { checks: boolean[]; custom: CustomItem[]; }

function todayKey() {
  return `premarket_${getLocalDateString(new Date(), getBrowserTimezone())}`;
}

function loadStore(): PreMarketStore {
  try {
    const raw = localStorage.getItem(todayKey());
    if (!raw) return { checks: [false, false, false, false, false], custom: [] };
    const parsed = JSON.parse(raw);
    // migrate old boolean[] format
    if (Array.isArray(parsed)) return { checks: parsed, custom: [] };
    return parsed as PreMarketStore;
  } catch { return { checks: [false, false, false, false, false], custom: [] }; }
}

function saveStore(store: PreMarketStore) {
  try { localStorage.setItem(todayKey(), JSON.stringify(store)); } catch { /* ignore */ }
}

export default function DashboardPage() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState("30D");
  const [showPreMarket, setShowPreMarket] = useState(false);
  const [preMarketChecks, setPreMarketChecks] = useState<boolean[]>([false, false, false, false, false]);
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [addingCustom, setAddingCustom] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const customInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [today, setToday] = useState<TodayStats | null>(null);
  const [equityCurve, setEquityCurve] = useState<number[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [brokerConnected, setBrokerConnected] = useState(false);
  const [usingManualBalance, setUsingManualBalance] = useState(false);

  const fetchStats = useCallback(async (tf: string, showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/dashboard/stats?timeframe=${tf}&tz=${encodeURIComponent(getBrowserTimezone())}`);
      const json = await res.json();
      if (res.ok) {
        setStats(json.stats);
        setToday(json.today ?? null);
        setEquityCurve(json.equityCurve ?? []);
        setRecentTrades(json.recentTrades ?? []);
        setBrokerConnected(json.brokerConnected ?? false);
        setUsingManualBalance(json.usingManualBalance ?? false);
      }
    } catch { /* ignore */ }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStats(timeframe); }, [timeframe, fetchStats]);

  useEffect(() => {
    const store = loadStore();
    setPreMarketChecks(store.checks);
    setCustomItems(store.custom);
  }, []);

  // focus input when adding custom step
  useEffect(() => {
    if (addingCustom) customInputRef.current?.focus();
  }, [addingCustom]);

  function toggleCheck(i: number) {
    const next = preMarketChecks.map((v, idx) => (idx === i ? !v : v));
    setPreMarketChecks(next);
    saveStore({ checks: next, custom: customItems });
  }

  function toggleCustom(i: number) {
    const next = customItems.map((item, idx) => idx === i ? { ...item, checked: !item.checked } : item);
    setCustomItems(next);
    saveStore({ checks: preMarketChecks, custom: next });
  }

  function commitCustomItem() {
    const label = newItemText.trim();
    if (!label) { setAddingCustom(false); setNewItemText(""); return; }
    const next = [...customItems, { label, checked: false }];
    setCustomItems(next);
    saveStore({ checks: preMarketChecks, custom: next });
    setNewItemText("");
    setAddingCustom(false);
  }

  function removeCustomItem(i: number) {
    const next = customItems.filter((_, idx) => idx !== i);
    setCustomItems(next);
    saveStore({ checks: preMarketChecks, custom: next });
  }

  const totalPnl = stats?.totalPnl ?? 0;
  const pnlPositive = totalPnl >= 0;

  const statCards = [
    { label: "Account Balance", value: stats?.balance != null ? fmt(stats.balance) : "—", sub: brokerConnected ? "Live" : usingManualBalance ? "Manual" : "Not connected", color: "text-[#F2F0EB]" },
    { label: "Closed PnL", value: stats?.totalTrades ? pnlStr(totalPnl) : "—", sub: `${timeframe} period`, color: pnlPositive ? "text-emerald-400" : "text-red-400" },
    { label: "Win Rate", value: stats?.winRate ? `${stats.winRate}%` : "—", sub: `${stats?.totalTrades ?? 0} trades`, color: "text-[#4BA3D4]" },
    { label: "Profit Factor", value: stats?.profitFactor ?? "—", sub: "Gross win / loss", color: "text-[#22C55E]" },
  ];

  return (
    <div className="flex flex-col flex-1">
      {/* Pre-Market Banner */}
      {(() => {
        const defaultDone = preMarketChecks.filter(Boolean).length;
        const customDone  = customItems.filter(c => c.checked).length;
        const total       = PRE_MARKET_ITEMS.length + customItems.length;
        const done        = defaultDone + customDone;
        const allDone     = total > 0 && done === total;
        return (
          <div className="border-b border-[#03588C]/20 bg-[#03588C]/08 px-6 py-2.5 flex items-center justify-between">
            <button onClick={() => setShowPreMarket(true)} className="flex items-center gap-3 group">
              <span className="text-xs font-semibold text-[#4BA3D4] group-hover:text-[#F2F0EB] transition-colors">
                Pre-Market Routine
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: total || PRE_MARKET_ITEMS.length }).map((_, i) => (
                  <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-all",
                    i < done ? "bg-[#4BA3D4]" : "bg-white/[0.12]")} />
                ))}
              </div>
              <span className="text-xs text-[#6B7280]">{done}/{total || PRE_MARKET_ITEMS.length} complete</span>
              <ChevronRight className="w-3 h-3 text-[#6B7280] group-hover:text-[#F2F0EB] transition-colors" />
            </button>
            {allDone && <span className="text-xs text-emerald-400 font-medium">Ready to trade</span>}
          </div>
        );
      })()}

      {/* Pre-Market Checklist Modal */}
      <AnimatePresence>
        {showPreMarket && (() => {
          const defaultDone = preMarketChecks.filter(Boolean).length;
          const customDone  = customItems.filter(c => c.checked).length;
          const total       = PRE_MARKET_ITEMS.length + customItems.length;
          const done        = defaultDone + customDone;
          return (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => { setShowPreMarket(false); setAddingCustom(false); setNewItemText(""); }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={e => e.stopPropagation()}
                className="bg-[#0A0E1A] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-sm font-semibold text-[#F2F0EB]">Pre-Market Routine</h2>
                    <p className="text-xs text-[#6B7280] mt-0.5">{done}/{total} complete</p>
                  </div>
                  <button
                    onClick={() => { setShowPreMarket(false); setAddingCustom(false); setNewItemText(""); }}
                    className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-[#6B7280]" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-white/[0.06] rounded-full mb-5 overflow-hidden">
                  <div
                    className="h-full bg-[#4BA3D4] rounded-full transition-all duration-300"
                    style={{ width: total > 0 ? `${(done / total) * 100}%` : "0%" }}
                  />
                </div>

                <div className="space-y-2">
                  {/* Default items — no remove button */}
                  {PRE_MARKET_ITEMS.map((item, i) => {
                    const checked = preMarketChecks[i];
                    const isRefuge = item.toLowerCase().includes("refuge");
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          toggleCheck(i);
                          if (isRefuge && !checked) {
                            setTimeout(() => { setShowPreMarket(false); router.push("/refuge"); }, 300);
                          }
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all text-left",
                          checked ? "border-[#4BA3D4]/30 bg-[#4BA3D4]/08" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]",
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-all",
                          checked ? "bg-[#4BA3D4] border-[#4BA3D4]" : "border-white/[0.2] bg-transparent",
                        )}>
                          {checked && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={cn("text-xs font-medium transition-colors flex-1",
                          checked ? "text-[#6B7280] line-through" : "text-[#F2F0EB]")}>
                          {item}
                        </span>
                        {isRefuge && !checked && (
                          <ArrowRight className="w-3 h-3 text-[#6B7280] flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}

                  {/* Custom items — with remove button */}
                  {customItems.map((item, i) => (
                    <div
                      key={`custom-${i}`}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl border transition-all",
                        item.checked ? "border-[#4BA3D4]/30 bg-[#4BA3D4]/08" : "border-white/[0.06] bg-white/[0.02]",
                      )}
                    >
                      <button
                        onClick={() => toggleCustom(i)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-all",
                          item.checked ? "bg-[#4BA3D4] border-[#4BA3D4]" : "border-white/[0.2] bg-transparent",
                        )}>
                          {item.checked && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={cn("text-xs font-medium transition-colors",
                          item.checked ? "text-[#6B7280] line-through" : "text-[#F2F0EB]")}>
                          {item.label}
                        </span>
                      </button>
                      <button
                        onClick={() => removeCustomItem(i)}
                        className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-[#6B7280] hover:text-red-400 transition-colors"
                        aria-label="Remove step"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Inline add input */}
                  {addingCustom ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#4BA3D4]/40 bg-white/[0.02]">
                      <input
                        ref={customInputRef}
                        value={newItemText}
                        onChange={e => setNewItemText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") commitCustomItem();
                          if (e.key === "Escape") { setAddingCustom(false); setNewItemText(""); }
                        }}
                        placeholder="Step name…"
                        className="flex-1 bg-transparent text-xs text-[#F2F0EB] placeholder-[#6B7280] outline-none"
                      />
                      <button
                        onClick={commitCustomItem}
                        className="text-[10px] font-semibold text-[#4BA3D4] hover:text-[#F2F0EB] transition-colors flex-shrink-0"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setAddingCustom(false); setNewItemText(""); }}
                        className="text-[#6B7280] hover:text-[#F2F0EB] transition-colors flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingCustom(true)}
                      className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#4BA3D4] transition-colors pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add custom step
                    </button>
                  )}
                </div>

                {done === total && total > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <p className="text-xs text-emerald-400 font-medium">All done — you&apos;re ready to trade.</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <Header title="Dashboard" subtitle="Trade with clarity. Execute with discipline." />

      <main className="flex-1 p-6 space-y-5 overflow-y-auto">

        <RefugeNudge />

        {/* Timeframe + refresh */}
        <div className="flex items-center justify-between">
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
          <button
            onClick={() => fetchStats(timeframe, true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-white transition-colors"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
            {refreshing ? "Syncing…" : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#6B7280]" />
          </div>
        ) : (
          <>
            {/* Today's quick stats strip */}
            {today && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Today's P&L",
                    value: today.trades > 0 ? pnlStr(today.pnl) : "—",
                    color: today.pnl >= 0 ? "text-emerald-400" : "text-red-400",
                    icon: today.pnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />,
                  },
                  {
                    label: "Trades Today",
                    value: String(today.trades),
                    color: "text-[#F2F0EB]",
                    icon: <Activity className="w-4 h-4" />,
                  },
                  {
                    label: "Open Positions",
                    value: brokerConnected ? String(today.openPositions) : "—",
                    color: today.openPositions > 0 ? "text-[#4BA3D4]" : "text-[#F2F0EB]",
                    icon: <Circle className="w-4 h-4" />,
                  },
                ].map((s) => (
                  <div key={s.label} className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
                    <div className={cn("flex-shrink-0", s.color)}>{s.icon}</div>
                    <div>
                      <p className="text-[10px] text-[#6B7280] uppercase tracking-wide font-medium">{s.label}</p>
                      <p className={cn("text-lg font-bold font-mono-nums mt-0.5", s.color)}>{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {statCards.map((s) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-4"
                >
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wide font-medium mb-2">{s.label}</p>
                  <p className={cn("text-xl font-bold font-mono-nums", s.color)}>{s.value}</p>
                  <p className="text-[10px] text-[#6B7280]/60 mt-1">{s.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
              {/* Equity Curve */}
              <div className="xl:col-span-3 glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-[14px] font-semibold text-[#F2F0EB]">Equity Curve</h2>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">Cumulative closed PnL · {timeframe}</p>
                  </div>
                  {stats?.balance != null && (
                    <p className="text-2xl font-bold font-mono-nums text-[#F2F0EB]">{fmt(stats.balance)}</p>
                  )}
                </div>
                <div className="h-[160px]">
                  <EquityChart data={equityCurve} />
                </div>
                {equityCurve.length >= 2 && (
                  <div className="flex items-center justify-between mt-3 text-[11px] text-[#6B7280]">
                    <span>High: {fmt(Math.max(...equityCurve))}</span>
                    <span className="text-red-400">Low: {fmt(Math.min(...equityCurve))}</span>
                    <span className={pnlPositive ? "text-emerald-400" : "text-red-400"}>
                      Net: {pnlStr(totalPnl)}
                    </span>
                  </div>
                )}
              </div>

              {/* Right panel */}
              <div className="xl:col-span-2 space-y-4">
                {/* Account Summary */}
                <div className="glass rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[13px] font-semibold text-[#F2F0EB]">Account Summary</h3>
                    <div className={cn("flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full",
                      brokerConnected ? "bg-[#22C55E]/10 text-[#22C55E]" : usingManualBalance ? "bg-[#D9CA82]/10 text-[#D9CA82]" : "bg-white/[0.05] text-[#6B7280]")}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", brokerConnected ? "bg-[#22C55E]" : usingManualBalance ? "bg-[#D9CA82]" : "bg-[#6B7280]")} />
                      {brokerConnected ? "MT5 Live" : usingManualBalance ? "Manual" : "No broker"}
                    </div>
                  </div>
                  {[
                    { label: "Balance", value: fmt(stats?.balance ?? null) },
                    { label: "Equity", value: fmt(stats?.equity ?? null) },
                    { label: "Floating PnL", value: stats?.balance != null && stats?.equity != null ? pnlStr(stats.equity - stats.balance) : "—" },
                    { label: `Trades (${timeframe})`, value: `${stats?.totalTrades ?? 0} trades` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs text-[#6B7280]">{label}</span>
                      <span className="text-[12px] font-semibold text-[#F2F0EB] font-mono-nums">{value}</span>
                    </div>
                  ))}
                  {!brokerConnected && (
                    <button
                      onClick={() => router.push("/brokers")}
                      className="w-full mt-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-[#03588C]/15 border border-[#03588C]/25 text-xs font-semibold text-[#4BA3D4] hover:bg-[#03588C]/25 transition-all"
                    >
                      <Plug className="w-3.5 h-3.5" /> Connect Broker
                    </button>
                  )}
                </div>

                {/* Discipline */}
                <div className="glass rounded-2xl p-5 space-y-3">
                  <h3 className="text-[13px] font-semibold text-[#F2F0EB]">Today&apos;s Session</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B7280]">Trades taken</span>
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Circle key={i} className={cn("w-3 h-3",
                          i < Math.min(today?.trades ?? 0, 5)
                            ? "text-[#03588C] fill-[#03588C]" : "text-white/[0.08]")} />
                      ))}
                    </div>
                  </div>
                  {today && today.trades > 0 ? (
                    <div className={cn("flex items-center gap-2 text-xs rounded-xl px-3 py-2",
                      today.pnl >= 0
                        ? "text-[#22C55E] bg-[#22C55E]/08 border border-[#22C55E]/15"
                        : "text-red-400 bg-red-500/08 border border-red-500/15")}>
                      {today.pnl >= 0 ? <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" /> : <TrendingDown className="w-3.5 h-3.5 flex-shrink-0" />}
                      {today.trades} trade{today.trades > 1 ? "s" : ""} · {pnlStr(today.pnl)} today
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-[#6B7280] bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2">
                      <Check className="w-3.5 h-3.5 flex-shrink-0" />
                      No trades yet today
                    </div>
                  )}
                  <div className="border-l-2 border-[#03588C] pl-3">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Sparkles className="w-3 h-3 text-[#4BA3D4]" />
                      <span className="text-[10px] text-[#4BA3D4] font-semibold">KlarAI</span>
                    </div>
                    <p className="text-[11px] text-[#6B7280]">
                      {stats?.winRate
                        ? `${stats.winRate}% win rate across ${stats.totalTrades} trades this ${timeframe} period.`
                        : "No trades recorded yet. Connect a broker or sync your journal."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote */}
            <QuoteWidget />

            {/* Recent Trades */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                <h3 className="text-[14px] font-semibold text-[#F2F0EB]">Recent Trades</h3>
                <button
                  onClick={() => router.push("/journal")}
                  className="text-xs text-[#4BA3D4] hover:text-[#F2F0EB] transition-colors flex items-center gap-1"
                >
                  All Trades <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              {recentTrades.length === 0 ? (
                <div className="px-5 py-10 text-center space-y-3">
                  <p className="text-sm text-[#6B7280]">No trades in this period</p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => router.push("/brokers")}
                      className="text-xs text-[#4BA3D4] hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Plug className="w-3 h-3" /> Connect broker
                    </button>
                    <span className="text-[#6B7280]">·</span>
                    <button
                      onClick={() => router.push("/journal")}
                      className="text-xs text-[#4BA3D4] hover:text-white transition-colors flex items-center gap-1"
                    >
                      Open journal <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.04]">
                        {["Instrument", "Direction", "P&L", "Outcome", "Setup", "Closed At"].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-[10px] text-[#6B7280] uppercase tracking-wide font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {recentTrades.map((t, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => router.push("/journal")}>
                          <td className="px-5 py-3.5 text-sm font-semibold text-[#F2F0EB] font-mono-nums">{t.instrument}</td>
                          <td className="px-5 py-3.5">
                            <span className={cn("text-[11px] font-semibold px-2 py-1 rounded-lg",
                              t.direction === "Long" ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-red-500/10 text-red-400")}>
                              {t.direction}
                            </span>
                          </td>
                          <td className={cn("px-5 py-3.5 text-sm font-bold font-mono-nums",
                            t.pnl.startsWith("+") ? "text-[#22C55E]" : "text-red-400")}>
                            {t.pnl}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={cn("text-[11px] font-medium px-2 py-1 rounded-lg",
                              t.outcome === "Win" ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-red-500/10 text-red-400")}>
                              {t.outcome}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-[#6B7280]">{t.setup || "—"}</td>
                          <td className="px-5 py-3.5 text-xs text-[#6B7280] font-mono-nums">{t.closedAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
