"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import {
  Search, AlertTriangle, RefreshCw, Loader2, X, Plus,
  FileText, TrendingUp, TrendingDown, CheckCircle,
  MousePointer2, Crosshair, Minus, ArrowUpRight, Square,
  Circle, Type, Percent, Ruler, Eraser,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getBrowserTimezone } from "@/lib/timezone";

// ─── Symbol map ───────────────────────────────────────────────────────────────

function tvSymbol(symbol: string): string {
  const MAP: Record<string, string> = {
    EURUSD: "FX:EURUSD", GBPUSD: "FX:GBPUSD", USDJPY: "FX:USDJPY",
    USDCHF: "FX:USDCHF", AUDUSD: "FX:AUDUSD", NZDUSD: "FX:NZDUSD",
    USDCAD: "FX:USDCAD", EURGBP: "FX:EURGBP", EURJPY: "FX:EURJPY",
    GBPJPY: "FX:GBPJPY", XAUUSD: "OANDA:XAUUSD", XAGUSD: "OANDA:XAGUSD",
    ES: "CME_MINI:ES1!", NQ: "CME_MINI:NQ1!", YM: "CBOT_MINI:YM1!",
    RTY: "CME_MINI:RTY1!", GC: "COMEX:GC1!", SI: "COMEX:SI1!",
    CL: "NYMEX:CL1!", NG: "NYMEX:NG1!",
    BTCUSD: "BITSTAMP:BTCUSD", ETHUSD: "BITSTAMP:ETHUSD",
    SPX500: "OANDA:SPX500USD", NAS100: "OANDA:NAS100USD", US30: "OANDA:US30USD",
  };
  return MAP[symbol.toUpperCase()] ?? `FX:${symbol.toUpperCase()}`;
}

// ─── Instrument names ─────────────────────────────────────────────────────────

const INSTRUMENT_NAME: Record<string, string> = {
  EURUSD: "Euro / US Dollar",       GBPUSD: "British Pound / US Dollar",
  USDJPY: "US Dollar / Japanese Yen", USDCHF: "US Dollar / Swiss Franc",
  AUDUSD: "Australian Dollar / USD", NZDUSD: "New Zealand Dollar / USD",
  USDCAD: "US Dollar / Canadian Dollar", EURGBP: "Euro / British Pound",
  EURJPY: "Euro / Japanese Yen",    GBPJPY: "British Pound / Japanese Yen",
  XAUUSD: "Gold / US Dollar",       XAGUSD: "Silver / US Dollar",
  ES: "E-mini S&P 500",             NQ: "E-mini Nasdaq-100",
  YM: "E-mini Dow Jones",           RTY: "E-mini Russell 2000",
  GC: "Gold Futures",               SI: "Silver Futures",
  CL: "Crude Oil Futures",          NG: "Natural Gas Futures",
  BTCUSD: "Bitcoin / US Dollar",    ETHUSD: "Ethereum / US Dollar",
  SPX500: "S&P 500 Index CFD",      NAS100: "Nasdaq 100 CFD",
  US30: "Dow Jones 30 CFD",
};

// ─── TradingView widget ───────────────────────────────────────────────────────

function TradingViewWidget({ symbol, interval }: { symbol: string; interval: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol(symbol),
      interval,
      timezone: "America/New_York",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      save_image: false,
      backgroundColor: "rgba(15, 15, 15, 1)",
      gridColor: "rgba(255, 255, 255, 0.04)",
      hide_top_toolbar: true,
      hide_side_toolbar: true,
      withdateranges: false,
    });

    containerRef.current.appendChild(widgetDiv);
    containerRef.current.appendChild(script);
    return () => { if (containerRef.current) containerRef.current.innerHTML = ""; };
  }, [symbol, interval]);

  return <div ref={containerRef} className="tradingview-widget-container w-full h-full" />;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Position {
  id: string; symbol: string; type: string;
  volume: number; openPrice: number; currentPrice: number;
  profit: number; swap: number; openTime: string;
}
interface Order {
  id: string; symbol: string; type: string;
  volume: number; openPrice: number; stopLoss?: number; takeProfit?: number;
}
interface AccountInfo {
  balance: number; equity: number; margin: number; freeMargin: number; currency: string;
}
interface LiveData {
  connected: boolean; accountInfo: AccountInfo | null;
  positions: Position[]; orders: Order[];
  todayPnl: number; todayTrades: number;
}
interface WatchlistItem {
  id: string;
  symbol: string;
  display_name: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIMEFRAMES = [
  { label: "1m",  value: "1"   },
  { label: "5m",  value: "5"   },
  { label: "15m", value: "15"  },
  { label: "30m", value: "30"  },
  { label: "1h",  value: "60"  },
  { label: "4h",  value: "240" },
  { label: "D",   value: "D"   },
  { label: "W",   value: "W"   },
];

const DRAWING_TOOLS = [
  { id: "pointer",   icon: MousePointer2, label: "Pointer" },
  { id: "crosshair", icon: Crosshair,     label: "Crosshair" },
  { id: "trend",     icon: TrendingUp,    label: "Trend Line",       divider: true },
  { id: "hline",     icon: Minus,         label: "Horizontal Line" },
  { id: "ray",       icon: ArrowUpRight,  label: "Ray" },
  { id: "rect",      icon: Square,        label: "Rectangle",        divider: true },
  { id: "ellipse",   icon: Circle,        label: "Ellipse" },
  { id: "text",      icon: Type,          label: "Text",             divider: true },
  { id: "fib",       icon: Percent,       label: "Fibonacci",        divider: true },
  { id: "measure",   icon: Ruler,         label: "Measure" },
  { id: "eraser",    icon: Eraser,        label: "Remove Drawing",   divider: true },
];


const EMOTIONS = [
  { id: "Rattled", color: "#8B5CF6" },
  { id: "Charged", color: "#38BDF8" },
  { id: "Heavy",   color: "#06B6D4" },
  { id: "Numb",    color: "#67E8F9" },
  { id: "Clear",   color: "#F59E0B" },
] as const;

function positionDuration(openTime: string): string {
  const ms = Date.now() - new Date(openTime).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  return `${Math.floor(h / 24)}d`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TradingPage() {
  const [activeWatchlistTab, setActiveWatchlistTab] = useState<"watchlist" | "plan" | "alerts">("watchlist");
  const [bottomTab, setBottomTab]       = useState<"open" | "pending" | "closed" | "history">("open");
  const [selectedSymbol, setSelectedSymbol] = useState("EURUSD");
  const [chartInterval, setChartInterval]   = useState("15");
  const [activeTool, setActiveTool]         = useState("pointer");
  const [search, setSearch]                 = useState("");
  const [direction, setDirection]           = useState<"LONG" | "SHORT">("LONG");
  const [orderType, setOrderType]           = useState<"Market" | "Limit" | "Stop">("Market");
  const [entryPrice, setEntryPrice]         = useState("");
  const [stopLoss, setStopLoss]             = useState("");
  const [takeProfit, setTakeProfit]         = useState("");
  const [showJournalFloat, setShowJournalFloat] = useState(true);
  const [showJournalForm, setShowJournalForm]   = useState(false);
  const [journalDirection, setJournalDirection] = useState<"BUY" | "SELL">("BUY");
  const [journalEntry, setJournalEntry]         = useState("");
  const [journalExit, setJournalExit]           = useState("");
  const [journalNotes, setJournalNotes]         = useState("");
  const [journalEmotion, setJournalEmotion]     = useState("");
  const [journalLotSize, setJournalLotSize]     = useState("");
  const [journalPnlOverride, setJournalPnlOverride] = useState("");
  const [journalSaving, setJournalSaving]       = useState(false);
  const [toast, setToast]                       = useState<string | null>(null);
  const [panelHeight, setPanelHeight]       = useState(180);

  const [live, setLive]           = useState<LiveData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [watchlistItems, setWatchlistItems]   = useState<WatchlistItem[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);

  const pollTimer  = useRef<ReturnType<typeof setInterval> | null>(null);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartH = useRef(0);

  // Panel resize
  const onPanelDragStart = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartH.current = panelHeight;
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = dragStartY.current - e.clientY;
      setPanelHeight(Math.max(100, Math.min(450, dragStartH.current + delta)));
    };
    const onMouseUp = () => { isDragging.current = false; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Watchlist — load
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setWatchlistLoading(false); return; }
      supabase
        .from("watchlist")
        .select("id, symbol, display_name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .then(({ data }) => {
          setWatchlistItems(data ?? []);
          setWatchlistLoading(false);
        });
    });
  }, []);

  const addSymbol = async (raw: string) => {
    const sym = raw.trim().toUpperCase();
    if (!sym) return;
    if (watchlistItems.some((w) => w.symbol === sym)) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("watchlist")
      .insert({ user_id: user.id, symbol: sym, display_name: INSTRUMENT_NAME[sym] ?? null })
      .select("id, symbol, display_name")
      .single();

    if (data) setWatchlistItems((prev) => [...prev, data]);
  };

  const removeSymbol = async (id: string) => {
    setWatchlistItems((prev) => prev.filter((w) => w.id !== id));
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("watchlist").delete().eq("id", id).eq("user_id", user.id);
  };

  const openJournalForm = () => {
    setJournalDirection("BUY");
    setJournalEntry("");
    setJournalExit("");
    setJournalNotes("");
    setJournalEmotion("");
    setJournalLotSize("");
    setJournalPnlOverride("");
    setShowJournalForm(true);
  };

  const saveJournalEntry = async () => {
    setJournalSaving(true);
    try {
      const ep = parseFloat(journalEntry);
      const xp = parseFloat(journalExit);
      const hasNumbers = !isNaN(ep) && !isNaN(xp);
      const autoPnl = hasNumbers
        ? (journalDirection === "BUY" ? xp - ep : ep - xp)
        : null;
      const pnl = journalPnlOverride !== ""
        ? (parseFloat(journalPnlOverride) || null)
        : autoPnl;

      const res = await fetch("/api/journal/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol:      selectedSymbol,
          direction:   journalDirection,
          entry_price: !isNaN(ep) ? ep : null,
          exit_price:  !isNaN(xp) ? xp : null,
          pnl,
          volume:      journalLotSize ? parseFloat(journalLotSize) || null : null,
          notes:       journalNotes || null,
          emotion:     journalEmotion || null,
          closed_at:   new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setShowJournalForm(false);
        setToast("Trade logged to journal ✓");
        setTimeout(() => setToast(null), 3000);
      } else {
        const { error } = await res.json().catch(() => ({ error: "Save failed" }));
        setToast(`Error: ${error}`);
        setTimeout(() => setToast(null), 4000);
      }
    } finally {
      setJournalSaving(false);
    }
  };

  // Live data
  const fetchLive = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await fetch(`/api/trading/live?tz=${encodeURIComponent(getBrowserTimezone())}`);
      if (res.ok) {
        const data = await res.json();
        setLive(data);
        setLastUpdated(new Date());
        if (data.positions?.length > 0 && selectedSymbol === "EURUSD")
          setSelectedSymbol(data.positions[0].symbol);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedSymbol]);

  useEffect(() => {
    fetchLive();
    pollTimer.current = setInterval(() => fetchLive(true), 10000);
    return () => { if (pollTimer.current) clearInterval(pollTimer.current); };
  }, [fetchLive]);

  const account   = live?.accountInfo;
  const positions = live?.positions ?? [];
  const orders    = live?.orders ?? [];
  const openPnl   = positions.reduce((s, p) => s + (p.profit ?? 0), 0);
  const filtered  = watchlistItems.filter((w) => w.symbol.toLowerCase().includes(search.toLowerCase()));

  const journalPnl = (() => {
    const ep = parseFloat(journalEntry);
    const xp = parseFloat(journalExit);
    if (isNaN(ep) || isNaN(xp)) return null;
    return journalDirection === "BUY" ? xp - ep : ep - xp;
  })();

  const bottomTabs = [
    { id: "open"    as const, label: `Open (${positions.length})`       },
    { id: "pending" as const, label: `Pending (${orders.length})`        },
    { id: "closed"  as const, label: `Closed (${live?.todayTrades ?? 0})` },
    { id: "history" as const, label: "History"                           },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#0F0F0F]">

      {/* ── Header ── */}
      <Header
        title="Trading"
        subtitle={live?.connected === false ? "No broker connected" : "Live session"}
        action={
          <div className="flex items-center gap-3">
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#6B7280]" /> : (
              <>
                {account && (
                  <>
                    {[
                      { label: "Balance", value: account.balance, colored: false },
                      { label: "Equity",  value: account.equity,  colored: false },
                      { label: "Open P&L", value: openPnl,        colored: true  },
                      { label: "Today",    value: live?.todayPnl ?? 0, colored: true },
                    ].map(({ label, value, colored }, i) => (
                      <div key={label} className="flex items-center gap-3">
                        {i > 0 && <div className="w-px h-8 bg-white/[0.06]" />}
                        <div className="text-right">
                          <p className="text-[10px] text-[#6B7280]">{label}</p>
                          <p className={cn("text-sm font-bold",
                            colored ? (value >= 0 ? "text-[#22C55E]" : "text-red-400") : "text-[#F2F0EB]"
                          )}>
                            {colored && value >= 0 ? "+" : ""}{account.currency}{" "}
                            {Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                <button onClick={() => fetchLive(true)} disabled={refreshing}
                  className="text-[#6B7280] hover:text-[#F2F0EB] transition-colors p-1.5">
                  <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
                </button>
              </>
            )}
            <Button size="sm" onClick={openJournalForm}>
              <FileText className="w-3.5 h-3.5" />
              Log Trade
            </Button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ── Drawing toolbar ── */}
        <div className="w-10 flex-shrink-0 flex flex-col items-center pt-2 pb-2 gap-0.5 bg-[#0F0F0F] border-r border-white/[0.06]">
          {DRAWING_TOOLS.map((tool) => (
            <div key={tool.id} className="flex flex-col items-center w-full">
              {tool.divider && <div className="w-5 h-px bg-white/[0.07] my-1.5" />}
              <div className="relative group w-full flex justify-center">
                <button
                  onClick={() => setActiveTool(tool.id)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-md transition-all",
                    activeTool === tool.id
                      ? "bg-[#03588C]/30 text-[#4BA3D4]"
                      : "text-[#6B7280] hover:text-[#F2F0EB] hover:bg-white/[0.06]"
                  )}
                >
                  <tool.icon className="w-[14px] h-[14px]" />
                </button>
                {/* Tooltip */}
                <div className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50
                                opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-[#1C1C1C] border border-white/[0.1] text-[#F2F0EB] text-[11px]
                                  font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                    {tool.label}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Chart column ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">

          {/* Timeframe bar */}
          <div className="flex items-center h-9 px-3 gap-0.5 bg-[#0F0F0F] flex-shrink-0">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setChartInterval(tf.value)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all",
                  chartInterval === tf.value
                    ? "bg-[#03588C]/30 text-[#4BA3D4]"
                    : "text-[#6B7280] hover:text-[#F2F0EB] hover:bg-white/[0.05]"
                )}
              >
                {tf.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              {lastUpdated && (
                <span className="flex items-center gap-1.5 text-[10px] text-[#6B7280]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                  {lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
                </span>
              )}
            </div>
          </div>
          <div className="h-px bg-white/[0.06] flex-shrink-0" />

          {/* Chart */}
          <div className="flex-1 relative min-h-0">
            <TradingViewWidget symbol={selectedSymbol} interval={chartInterval} />
          </div>

          {/* ── Bottom panel (resizable) ── */}
          <div className="flex-shrink-0 flex flex-col bg-[#0A0A0A] border-t border-white/[0.06]"
               style={{ height: panelHeight }}>

            {/* Drag handle */}
            <div
              className="h-1.5 flex-shrink-0 cursor-row-resize flex items-center justify-center group"
              onMouseDown={onPanelDragStart}
            >
              <div className="w-8 h-0.5 rounded-full bg-white/[0.1] group-hover:bg-[#4BA3D4]/50 transition-colors" />
            </div>

            {/* Tabs */}
            <div className="flex items-center px-4 border-b border-white/[0.05] flex-shrink-0 h-8">
              {bottomTabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setBottomTab(t.id)}
                  className={cn(
                    "px-4 h-full text-[11px] font-medium transition-all border-b-2 -mb-px",
                    bottomTab === t.id
                      ? "border-[#03588C] text-[#4BA3D4]"
                      : "border-transparent text-[#6B7280] hover:text-[#F2F0EB]"
                  )}
                >
                  {t.label}
                </button>
              ))}
              {positions.length > 0 && bottomTab === "open" && (
                <Button size="sm" variant="destructive" className="ml-auto h-6 text-[10px]">
                  Exit All
                </Button>
              )}
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto px-4 py-2 min-h-0">

              {/* Open positions */}
              {bottomTab === "open" && (
                loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-4 h-4 animate-spin text-[#6B7280]" />
                  </div>
                ) : positions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <p className="text-xs text-[#6B7280]">
                      {live?.connected === false ? "No broker connected" : "No open positions"}
                    </p>
                    {live?.connected === false && (
                      <a href="/brokers" className="text-[11px] text-[#4BA3D4] hover:underline">
                        Connect your broker →
                      </a>
                    )}
                  </div>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        {["Symbol", "Direction", "Size", "Entry", "Current", "P&L", "Duration", ""].map((h) => (
                          <th key={h} className="text-left pb-2 pr-4 text-[10px] font-medium uppercase tracking-wide text-[#6B7280]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {positions.map((p) => {
                        const isLong = p.type === "POSITION_TYPE_BUY";
                        const pnl = p.profit ?? 0;
                        return (
                          <tr key={p.id}
                            className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                            onClick={() => setSelectedSymbol(p.symbol)}>
                            <td className="py-1.5 pr-4 font-semibold text-[#F2F0EB]">{p.symbol}</td>
                            <td className="pr-4">
                              <span className={cn(
                                "inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border",
                                isLong
                                  ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                                  : "bg-red-500/10 text-red-400 border-red-500/20"
                              )}>
                                {isLong ? "BUY" : "SELL"}
                              </span>
                            </td>
                            <td className="pr-4 text-[#6B7280]">{p.volume}</td>
                            <td className="pr-4 text-[#6B7280] font-mono">{p.openPrice}</td>
                            <td className="pr-4 text-[#F2F0EB] font-mono">{p.currentPrice}</td>
                            <td className={cn("pr-4 font-bold", pnl >= 0 ? "text-[#22C55E]" : "text-red-400")}>
                              {pnl >= 0 ? "+" : ""}${Math.abs(pnl).toFixed(2)}
                            </td>
                            <td className="pr-4 text-[#6B7280]">
                              {p.openTime ? positionDuration(p.openTime) : "—"}
                            </td>
                            <td>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="w-6 h-6 rounded flex items-center justify-center text-[#6B7280] hover:text-red-400 hover:bg-red-500/10 transition-all"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )
              )}

              {/* Pending orders */}
              {bottomTab === "pending" && (
                orders.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-xs text-[#6B7280]">
                    No pending orders
                  </div>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        {["Symbol", "Type", "Size", "Price", "SL", "TP", ""].map((h) => (
                          <th key={h} className="text-left pb-2 pr-4 text-[10px] font-medium uppercase tracking-wide text-[#6B7280]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-1.5 pr-4 font-semibold text-[#F2F0EB]">{o.symbol}</td>
                          <td className="pr-4 text-[#6B7280]">{o.type?.replace("ORDER_TYPE_", "")}</td>
                          <td className="pr-4 text-[#6B7280]">{o.volume}</td>
                          <td className="pr-4 font-mono text-[#F2F0EB]">{o.openPrice}</td>
                          <td className="pr-4 font-mono text-red-400">{o.stopLoss ?? "—"}</td>
                          <td className="pr-4 font-mono text-[#22C55E]">{o.takeProfit ?? "—"}</td>
                          <td>
                            <button
                              onClick={() => {}}
                              className="w-6 h-6 rounded flex items-center justify-center text-[#6B7280] hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}

              {/* Closed today */}
              {bottomTab === "closed" && (
                (live?.todayTrades ?? 0) === 0 ? (
                  <div className="flex items-center justify-center h-full text-xs text-[#6B7280]">
                    No closed trades today
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-xs text-[#6B7280]">
                      {live?.todayTrades} trade{live?.todayTrades !== 1 ? "s" : ""} closed ·{" "}
                      <span className={cn("font-semibold", (live?.todayPnl ?? 0) >= 0 ? "text-[#22C55E]" : "text-red-400")}>
                        {(live?.todayPnl ?? 0) >= 0 ? "+" : ""}${Math.abs(live?.todayPnl ?? 0).toFixed(2)}
                      </span>
                      {" "}— <a href="/journal" className="text-[#4BA3D4] hover:underline">view in Journal</a>
                    </p>
                  </div>
                )
              )}

              {/* History */}
              {bottomTab === "history" && (
                <div className="flex flex-col items-center justify-center h-full gap-1.5">
                  <p className="text-xs text-[#6B7280]">Full trade history available in</p>
                  <a href="/journal" className="text-[11px] text-[#4BA3D4] hover:underline">
                    Journal & Analytics →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="w-[260px] flex-shrink-0 flex flex-col border-l border-white/[0.06] bg-[#0A0A0A]">

          {/* Account summary */}
          {account && (
            <div className="px-4 py-3 border-b border-white/[0.05] space-y-2 flex-shrink-0">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-semibold border",
                  live?.connected !== false
                    ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                )}>
                  {live?.connected !== false ? "● Live" : "○ Disconnected"}
                </span>
                <span className="text-[10px] text-[#6B7280]">
                  {live?.todayTrades ?? 0} trade{(live?.todayTrades ?? 0) !== 1 ? "s" : ""} today
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/[0.03] rounded-lg px-2.5 py-1.5">
                  <p className="text-[9px] text-[#6B7280] uppercase tracking-wide">Balance</p>
                  <p className="text-[12px] font-bold text-[#F2F0EB] font-mono">
                    {account.balance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-white/[0.03] rounded-lg px-2.5 py-1.5">
                  <p className="text-[9px] text-[#6B7280] uppercase tracking-wide">Open P&L</p>
                  <p className={cn("text-[12px] font-bold font-mono", openPnl >= 0 ? "text-[#22C55E]" : "text-red-400")}>
                    {openPnl >= 0 ? "+" : ""}${Math.abs(openPnl).toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pill tabs */}
          <div className="flex gap-1 px-3 py-2 border-b border-white/[0.05] flex-shrink-0">
            {(["watchlist", "plan", "alerts"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveWatchlistTab(t)}
                className={cn(
                  "flex-1 py-1 rounded-full text-[11px] font-medium capitalize transition-all",
                  activeWatchlistTab === t
                    ? "bg-[#03588C]/40 text-[#4BA3D4]"
                    : "text-[#6B7280] hover:text-[#F2F0EB]"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Watchlist tab */}
          {activeWatchlistTab === "watchlist" && (
            <>
              <div className="px-3 py-2 border-b border-white/[0.05] flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;
                      const sym = e.currentTarget.value.trim().toUpperCase();
                      if (sym) {
                        addSymbol(sym);
                        setSearch("");
                      }
                    }}
                    placeholder="Type symbol + Enter to add…"
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F2F0EB] font-mono uppercase placeholder-[#6B7280] placeholder:normal-case focus:outline-none focus:border-[#03588C]/50"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
                {/* Live positions */}
                {positions.length > 0 && (
                  <>
                    <p className="text-[9px] text-[#6B7280] uppercase tracking-wider px-4 pt-3 pb-1">Open Positions</p>
                    {positions.map((p) => {
                      const isLong = p.type === "POSITION_TYPE_BUY";
                      const pnl = p.profit ?? 0;
                      return (
                        <button key={p.id} onClick={() => setSelectedSymbol(p.symbol)}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-2 transition-all text-left hover:bg-white/[0.04]",
                            selectedSymbol === p.symbol && "bg-[#03588C]/10 border-l-2 border-[#03588C]"
                          )}>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0", isLong ? "bg-[#22C55E]" : "bg-red-500")} />
                              <span className="text-[12px] font-bold text-[#F2F0EB]">{p.symbol}</span>
                            </div>
                            <p className="text-[10px] text-[#6B7280] mt-0.5 pl-3">{isLong ? "Long" : "Short"} · {p.volume}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] font-mono text-[#F2F0EB]">{p.currentPrice}</p>
                            <p className={cn("text-[10px] font-semibold", pnl >= 0 ? "text-[#22C55E]" : "text-red-400")}>
                              {pnl >= 0 ? "+" : ""}${Math.abs(pnl).toFixed(2)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                    <div className="h-px bg-white/[0.05] mx-4 my-1" />
                  </>
                )}

                {/* Watchlist items */}
                {watchlistLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-4 h-4 animate-spin text-[#6B7280]" />
                  </div>
                ) : filtered.length === 0 && !search ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-1.5 px-4 text-center">
                    <p className="text-xs text-[#6B7280]">Your watchlist is empty.</p>
                    <p className="text-[11px] text-[#6B7280]/60">Type a symbol above and press Enter.</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-1.5 px-4 text-center">
                    <p className="text-xs text-[#F2F0EB] font-mono font-bold">{search}</p>
                    <p className="text-[11px] text-[#6B7280]">Press Enter to add to watchlist</p>
                  </div>
                ) : (
                  filtered.map((w) => (
                    <div
                      key={w.id}
                      className={cn(
                        "group flex items-center justify-between px-4 py-2.5 transition-all hover:bg-white/[0.04]",
                        selectedSymbol === w.symbol && "bg-[#03588C]/10 border-l-2 border-[#03588C]"
                      )}
                    >
                      <button
                        onClick={() => setSelectedSymbol(w.symbol)}
                        className="flex-1 text-left min-w-0"
                      >
                        <p className="text-[12px] font-bold text-[#F2F0EB] leading-tight">{w.symbol}</p>
                        <p className="text-[10px] text-[#6B7280] mt-0.5 truncate">
                          {w.display_name ?? INSTRUMENT_NAME[w.symbol] ?? w.symbol}
                        </p>
                      </button>
                      <button
                        onClick={() => removeSymbol(w.id)}
                        className="ml-2 w-5 h-5 flex items-center justify-center rounded text-[#6B7280]/0 group-hover:text-[#6B7280] hover:!text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add hint */}
              <div className="px-4 py-2 border-t border-white/[0.05] flex-shrink-0 flex items-center gap-1.5">
                <Plus className="w-3 h-3 text-[#6B7280]/50" />
                <p className="text-[10px] text-[#6B7280]/50">Type symbol above, press Enter to add</p>
              </div>
            </>
          )}

          {/* Plan tab */}
          {activeWatchlistTab === "plan" && (
            <div className="flex-1 p-3 overflow-y-auto min-h-0 space-y-3">
              <div>
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-1.5">Direction</p>
                <div className="grid grid-cols-2 gap-1">
                  {(["LONG", "SHORT"] as const).map((d) => (
                    <button key={d} onClick={() => setDirection(d)}
                      className={cn("py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5",
                        direction === d
                          ? d === "LONG" ? "bg-[#22C55E] text-white" : "bg-red-500 text-white"
                          : "bg-white/[0.04] text-[#6B7280] hover:text-[#F2F0EB]")}>
                      {d === "LONG" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-1.5">Order Type</p>
                <div className="grid grid-cols-3 gap-1">
                  {(["Market", "Limit", "Stop"] as const).map((t) => (
                    <button key={t} onClick={() => setOrderType(t)}
                      className={cn("py-1.5 rounded-lg text-[11px] font-medium transition-all",
                        orderType === t ? "bg-[#03588C] text-white" : "bg-white/[0.04] text-[#6B7280] hover:text-[#F2F0EB]")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {[
                { label: "Entry Price", value: entryPrice, set: setEntryPrice },
                { label: "Stop Loss",   value: stopLoss,   set: setStopLoss   },
                { label: "Take Profit", value: takeProfit, set: setTakeProfit },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-1">{f.label}</p>
                  <input value={f.value} onChange={(e) => f.set(e.target.value)}
                    placeholder="0.00000"
                    className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 text-xs text-[#F2F0EB] font-mono focus:outline-none focus:border-[#03588C]/50" />
                </div>
              ))}

              {account && entryPrice && stopLoss && (() => {
                const risk = account.balance * 0.01;
                return (
                  <div className="glass rounded-xl p-2.5 text-[11px] space-y-0.5">
                    <p className="text-[#6B7280]">Risking <span className="text-red-400 font-bold">${risk.toFixed(0)}</span> (1%)</p>
                    {takeProfit && <p className="text-[#6B7280]">Potential: <span className="text-[#22C55E] font-bold">+${(risk * 2).toFixed(0)} (2R)</span></p>}
                  </div>
                );
              })()}

              <Button className="w-full" disabled>Place Order</Button>
              <p className="text-[10px] text-[#6B7280] text-center">Order execution coming soon</p>
            </div>
          )}

          {/* Alerts tab */}
          {activeWatchlistTab === "alerts" && (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-[#6B7280] mx-auto mb-2" />
                <p className="text-xs text-[#6B7280]">No alerts set</p>
                <Button size="sm" variant="navy" className="mt-3" disabled>Add Alert</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Journal FAB ── */}
      {showJournalFloat && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
          <button
            onClick={openJournalForm}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl glass border border-[#03588C]/30 text-[#4BA3D4] hover:text-white hover:border-[#03588C]/60 transition-all shadow-lg text-sm font-medium"
          >
            <FileText className="w-4 h-4" />
            Log trade
          </button>
          <button
            onClick={() => setShowJournalFloat(false)}
            className="w-7 h-7 rounded-full bg-black/40 border border-white/[0.08] flex items-center justify-center text-[#6B7280] hover:text-[#F2F0EB] transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ── Quick journal modal ── */}
      <AnimatePresence>
        {showJournalForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowJournalForm(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 6 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-[400px] bg-[#0F0F0F] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <div>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-[0.16em]">Quick Entry</p>
                  <p className="text-[15px] font-bold text-[#F2F0EB]">{selectedSymbol}</p>
                </div>
                <button
                  onClick={() => setShowJournalForm(false)}
                  className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-[#6B7280] hover:text-[#F2F0EB] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="px-5 py-4 space-y-4">
                {/* Direction */}
                <div className="grid grid-cols-2 gap-2">
                  {(["BUY", "SELL"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setJournalDirection(d)}
                      className={cn(
                        "py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                        journalDirection === d
                          ? d === "BUY"
                            ? "bg-[#22C55E] text-white"
                            : "bg-red-500 text-white"
                          : "bg-white/[0.04] text-[#6B7280] hover:text-[#F2F0EB] border border-white/[0.06]"
                      )}
                    >
                      {d === "BUY"
                        ? <TrendingUp className="w-3.5 h-3.5" />
                        : <TrendingDown className="w-3.5 h-3.5" />}
                      {d}
                    </button>
                  ))}
                </div>

                {/* Entry / Exit */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Entry Price", value: journalEntry, set: setJournalEntry },
                    { label: "Exit Price",  value: journalExit,  set: setJournalExit  },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-1">{f.label}</p>
                      <input
                        value={f.value}
                        onChange={(e) => f.set(e.target.value)}
                        placeholder="0.00000"
                        className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 text-xs text-[#F2F0EB] font-mono focus:outline-none focus:border-[#03588C]/50"
                      />
                    </div>
                  ))}
                </div>

                {/* Lot Size + P&L */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-1">Lot Size</p>
                    <input
                      type="number"
                      value={journalLotSize}
                      onChange={(e) => setJournalLotSize(e.target.value)}
                      placeholder="0.01"
                      min="0"
                      step="0.01"
                      className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 text-xs text-[#F2F0EB] font-mono focus:outline-none focus:border-[#03588C]/50"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-1">
                      P&L {journalPnlOverride === "" && journalPnl !== null && (
                        <span className="text-[#6B7280]/50 normal-case tracking-normal">(auto)</span>
                      )}
                    </p>
                    <input
                      type="number"
                      value={journalPnlOverride !== "" ? journalPnlOverride : (journalPnl !== null ? String(journalPnl.toFixed(5)) : "")}
                      onChange={(e) => setJournalPnlOverride(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className={cn(
                        "w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#03588C]/50",
                        journalPnlOverride === "" && journalPnl !== null
                          ? journalPnl >= 0 ? "text-[#22C55E]" : "text-red-400"
                          : "text-[#F2F0EB]"
                      )}
                    />
                  </div>
                </div>

                {/* Emotion */}
                <div>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-2">Emotion</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {EMOTIONS.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setJournalEmotion(journalEmotion === e.id ? "" : e.id)}
                        className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all"
                        style={journalEmotion === e.id
                          ? { background: `${e.color}22`, borderColor: `${e.color}55`, color: e.color }
                          : { borderColor: "rgba(255,255,255,0.08)", color: "#6B7280" }}
                      >
                        {e.id}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-1">Notes</p>
                  <textarea
                    value={journalNotes}
                    onChange={(e) => setJournalNotes(e.target.value)}
                    placeholder="What happened? What did you follow or break?"
                    rows={3}
                    className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 text-xs text-[#F2F0EB] placeholder-[#6B7280] resize-none focus:outline-none focus:border-[#03588C]/50"
                  />
                </div>

                {/* Save */}
                <button
                  onClick={saveJournalEntry}
                  disabled={journalSaving}
                  className="w-full py-2.5 rounded-xl bg-[#03588C] hover:bg-[#4BA3D4] text-white text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {journalSaving
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><CheckCircle className="w-4 h-4" /> Save to Journal</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] px-4 py-2.5 rounded-xl bg-[#1A1A1A] border border-white/[0.1] text-sm text-[#F2F0EB] shadow-xl flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-[#22C55E]" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
