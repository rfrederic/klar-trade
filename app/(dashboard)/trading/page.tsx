"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/dashboard/Header";
import { TrendingUp, TrendingDown, Search, Pin, Circle, AlertTriangle, Check, ChevronDown, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const watchlist = [
  { symbol: "EURUSD", last: "1.08432", change: "+0.12%", up: true, pinned: true },
  { symbol: "ES", last: "5,842.25", change: "-0.34%", up: false, pinned: true },
  { symbol: "NQ", last: "20,415.50", change: "+0.21%", up: true, pinned: true },
  { symbol: "GC", last: "2,671.30", change: "+0.08%", up: true, pinned: false },
  { symbol: "CL", last: "78.42", change: "-0.92%", up: false, pinned: false },
  { symbol: "GBPUSD", last: "1.27184", change: "+0.04%", up: true, pinned: false },
  { symbol: "USDJPY", last: "149.821", change: "-0.18%", up: false, pinned: false },
];

const openPositions: { symbol: string; dir: string; entry: string; pnl: string; size: string }[] = [];
const closedPositions = [
  { symbol: "EURUSD", dir: "Long", entry: "1.08280", exit: "1.08432", pnl: "+$480", r: "+2.4R" },
  { symbol: "ES", dir: "Long", entry: "5,818.00", exit: "5,842.25", pnl: "+$840", r: "+1.8R" },
];

function TradingViewWidget({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol === "EURUSD" ? "FX:EURUSD" : symbol === "ES" ? "CME_MINI:ES1!" : symbol === "NQ" ? "CME_MINI:NQ1!" : symbol === "GC" ? "COMEX:GC1!" : `FX:${symbol}`,
      interval: "15",
      timezone: "America/New_York",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      save_image: false,
      backgroundColor: "rgba(5, 5, 8, 1)",
      gridColor: "rgba(255, 255, 255, 0.03)",
      hide_top_toolbar: false,
      hide_legend: false,
      withdateranges: true,
      hide_side_toolbar: false,
    });

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "calc(100% - 32px)";
    widgetDiv.style.width = "100%";
    containerRef.current.appendChild(widgetDiv);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [symbol]);

  return <div ref={containerRef} className="tradingview-widget-container w-full h-full" />;
}

export default function TradingPage() {
  const [activeTab, setActiveTab] = useState<"watchlist" | "alerts" | "plan">("watchlist");
  const [bottomTab, setBottomTab] = useState<"open" | "pending" | "closed">("open");
  const [selectedSymbol, setSelectedSymbol] = useState("EURUSD");
  const [search, setSearch] = useState("");
  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG");
  const [orderType, setOrderType] = useState<"Market" | "Limit" | "Stop">("Market");
  const [entryPrice, setEntryPrice] = useState("1.08432");
  const [stopLoss, setStopLoss] = useState("1.08280");
  const [takeProfit, setTakeProfit] = useState("1.08760");
  const [showJournalFloat, setShowJournalFloat] = useState(true);

  const filtered = watchlist.filter((w) => w.symbol.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header
        title="Trading"
        subtitle="Live session · NY Open"
        action={
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[10px] text-[#6B7280]">Balance</p>
              <p className="text-sm font-bold text-[#F2F0EB] font-mono-nums">$92,182</p>
            </div>
            <div className="w-px h-8 bg-white/[0.06]" />
            <div className="text-right">
              <p className="text-[10px] text-[#6B7280]">Open PnL</p>
              <p className="text-sm font-bold text-[#22C55E] font-mono-nums">+$0.00</p>
            </div>
            <div className="w-px h-8 bg-white/[0.06]" />
            <Button size="sm" variant="success">
              <TrendingUp className="w-3.5 h-3.5" />
              Trade
            </Button>
          </div>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Chart */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative">
            <TradingViewWidget symbol={selectedSymbol} />
          </div>

          {/* Bottom positions tabs */}
          <div className="border-t border-white/[0.05] bg-[#06080f]">
            <div className="flex items-center gap-1 px-4 pt-2 border-b border-white/[0.04]">
              {[
                { id: "open", label: `Open Positions (${openPositions.length})` },
                { id: "pending", label: "Pending Orders (0)" },
                { id: "closed", label: `Closed (${closedPositions.length})` },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setBottomTab(t.id as typeof bottomTab)}
                  className={cn("px-4 py-2 text-xs font-medium transition-all border-b-2 -mb-px",
                    bottomTab === t.id ? "border-[#03588C] text-[#4BA3D4]" : "border-transparent text-[#6B7280] hover:text-[#F2F0EB]")}
                >
                  {t.label}
                </button>
              ))}
              {openPositions.length > 0 && (
                <Button size="sm" variant="destructive" className="ml-auto mb-1">Exit All</Button>
              )}
            </div>

            <div className="h-[120px] overflow-y-auto px-4 py-2">
              {bottomTab === "open" && (
                openPositions.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-xs text-[#6B7280]">No open positions</div>
                ) : null
              )}
              {bottomTab === "closed" && (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[#6B7280]">
                      {["Symbol", "Dir", "Entry", "Exit", "PnL", "R"].map((h) => (
                        <th key={h} className="text-left pb-2 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {closedPositions.map((p, i) => (
                      <tr key={i} className="text-[#6B7280]">
                        <td className="py-1.5 font-semibold text-[#F2F0EB] font-mono-nums">{p.symbol}</td>
                        <td className={p.dir === "Long" ? "text-[#22C55E]" : "text-red-400"}>{p.dir}</td>
                        <td className="font-mono-nums">{p.entry}</td>
                        <td className="font-mono-nums">{p.exit}</td>
                        <td className={cn("font-bold font-mono-nums", p.pnl.startsWith("+") ? "text-[#22C55E]" : "text-red-400")}>{p.pnl}</td>
                        <td className="text-[#4BA3D4] font-mono-nums">{p.r}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {bottomTab === "pending" && (
                <div className="flex items-center justify-center h-full text-xs text-[#6B7280]">No pending orders</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Control Panel */}
        <div className="w-[280px] flex-shrink-0 border-l border-white/[0.05] flex flex-col overflow-y-auto bg-[#06080f]">
          {/* Discipline summary */}
          <div className="p-4 border-b border-white/[0.05]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-[#6B7280] uppercase tracking-wide">Trades Today</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Circle key={i} className={cn("w-2.5 h-2.5", i < 2 ? "fill-[#03588C] text-[#03588C]" : "text-white/[0.1]")} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6B7280]">Window: 08:00–17:00</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 font-semibold">Open</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-[#22C55E] bg-[#22C55E]/08 border border-[#22C55E]/15 rounded-lg px-2.5 py-1.5">
              <Check className="w-3 h-3" />
              All guardrails active
            </div>
          </div>

          {/* Right panel tabs */}
          <div className="flex border-b border-white/[0.05]">
            {(["watchlist", "alerts", "plan"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={cn("flex-1 py-2.5 text-[11px] font-medium capitalize transition-all",
                  activeTab === t ? "text-[#4BA3D4] border-b-2 border-[#03588C]" : "text-[#6B7280] hover:text-[#F2F0EB]")}
              >
                {t}
              </button>
            ))}
          </div>

          {activeTab === "watchlist" && (
            <div className="flex-1 p-3 space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search instruments..."
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-8 pr-3 py-2 text-xs text-[#F2F0EB] placeholder-[#6B7280] focus:outline-none focus:border-[#03588C]/50"
                />
              </div>

              <div className="space-y-0.5">
                {filtered.map((w) => (
                  <button
                    key={w.symbol}
                    onClick={() => setSelectedSymbol(w.symbol)}
                    className={cn("w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left",
                      selectedSymbol === w.symbol ? "bg-[#03588C]/15 border border-[#03588C]/30" : "hover:bg-white/[0.04]")}
                  >
                    <div className="flex items-center gap-2">
                      {w.pinned && <Pin className="w-2.5 h-2.5 text-[#6B7280] fill-[#6B7280]" />}
                      <span className="text-xs font-semibold text-[#F2F0EB] font-mono-nums">{w.symbol}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#F2F0EB] font-mono-nums">{w.last}</p>
                      <p className={cn("text-[10px] font-medium", w.up ? "text-[#22C55E]" : "text-red-400")}>{w.change}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Featured instrument */}
              <div className="glass rounded-xl p-3 border border-[#03588C]/15 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#F2F0EB]">{selectedSymbol}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] font-semibold">Market Open</span>
                </div>
                <p className="text-2xl font-black font-mono-nums text-[#F2F0EB] mb-1">1.08432</p>
                <div className="flex gap-3 text-[11px]">
                  <span className="text-[#22C55E]">Bid: 1.08430</span>
                  <span className="text-red-400">Ask: 1.08434</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "plan" && (
            <div className="flex-1 p-3">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-1.5">Direction</p>
                  <div className="grid grid-cols-2 gap-1">
                    {(["LONG", "SHORT"] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDirection(d)}
                        className={cn("py-2 rounded-xl text-xs font-bold transition-all",
                          direction === d
                            ? d === "LONG" ? "bg-[#22C55E] text-white" : "bg-red-500 text-white"
                            : "bg-white/[0.04] text-[#6B7280] hover:text-[#F2F0EB]")}
                      >
                        {d === "LONG" ? <TrendingUp className="w-3.5 h-3.5 mx-auto" /> : <TrendingDown className="w-3.5 h-3.5 mx-auto" />}
                        <span className="block mt-0.5">{d}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-1.5">Order Type</p>
                  <div className="grid grid-cols-3 gap-1">
                    {(["Market", "Limit", "Stop"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setOrderType(t)}
                        className={cn("py-1.5 rounded-lg text-[11px] font-medium transition-all",
                          orderType === t ? "bg-[#03588C] text-white" : "bg-white/[0.04] text-[#6B7280] hover:text-[#F2F0EB]")}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {[
                  { label: "Entry Price", value: entryPrice, set: setEntryPrice },
                  { label: "Stop Loss", value: stopLoss, set: setStopLoss },
                  { label: "Take Profit", value: takeProfit, set: setTakeProfit },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-1">{f.label}</p>
                    <input
                      value={f.value}
                      onChange={(e) => f.set(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 text-xs text-[#F2F0EB] font-mono-nums focus:outline-none focus:border-[#03588C]/50"
                    />
                  </div>
                ))}

                <div className="glass rounded-xl p-2.5 text-[11px]">
                  <p className="text-[#6B7280]">Risking <span className="text-red-400 font-bold">$920</span> (1% of balance)</p>
                  <p className="text-[#6B7280] mt-0.5">Potential gain: <span className="text-[#22C55E] font-bold">+$2,760 (3R)</span></p>
                </div>

                <Button className="w-full">Place Order</Button>
              </div>
            </div>
          )}

          {activeTab === "alerts" && (
            <div className="flex-1 p-3 flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-[#6B7280] mx-auto mb-2" />
                <p className="text-xs text-[#6B7280]">No alerts set</p>
                <Button size="sm" variant="navy" className="mt-3">Add Alert</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating journal button */}
      {showJournalFloat && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="glass rounded-2xl px-4 py-3 border border-[#03588C]/20 shadow-glow-sm flex items-center gap-3">
            <FileText className="w-4 h-4 text-[#4BA3D4]" />
            <span className="text-sm font-medium text-[#F2F0EB]">Journal your first trade</span>
            <ChevronDown className="w-4 h-4 text-[#6B7280]" />
            <button onClick={() => setShowJournalFloat(false)} className="text-[#6B7280] hover:text-[#F2F0EB] ml-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
