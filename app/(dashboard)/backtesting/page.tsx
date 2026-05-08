"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import {
  Plus, Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight,
  Rewind, FastForward, TrendingUp, TrendingDown, BarChart2, Calendar,
  BookOpen, Settings, Target, Clock, Zap, CheckCircle, AlertTriangle,
  Download, Trash2, X, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const sessions = [
  { id: "1", name: "ES Trend Continuation", instrument: "ES", timeframe: "15m", period: "Jan–Mar 2025", trades: 42, winRate: 64, netPnl: 8420, status: "complete" },
  { id: "2", name: "GC Breakout Strategy", instrument: "GC", timeframe: "1H", period: "Q4 2024", trades: 28, winRate: 57, netPnl: 3100, status: "complete" },
  { id: "3", name: "NQ VWAP Reversion", instrument: "NQ", timeframe: "5m", period: "Feb 2025", trades: 61, winRate: 48, netPnl: -1240, status: "complete" },
  { id: "4", name: "CL Session Open", instrument: "CL", timeframe: "1m", period: "Mar 2025", trades: 0, winRate: 0, netPnl: 0, status: "draft" },
];

const speeds = ["0.5×", "1×", "2×", "5×", "Max"];

const drawingTools = [
  { label: "Cursor", icon: "⬆" },
  { label: "Trend Line", icon: "╱" },
  { label: "Horizontal", icon: "—" },
  { label: "Rectangle", icon: "□" },
  { label: "Fib", icon: "≡" },
  { label: "Text", icon: "T" },
];

const positionRows = [
  { symbol: "ES", side: "Long", qty: 1, entry: "5248.50", current: "5261.00", pnl: "+$625", status: "open" },
  { symbol: "ES", side: "Short", qty: 2, entry: "5270.00", current: "5261.00", pnl: "+$900", status: "closed" },
];

const sessionStats = {
  netPnl: "+$8,420",
  winRate: "64%",
  profitFactor: "2.31",
  maxDrawdown: "-$1,840",
  avgWin: "$480",
  avgLoss: "$210",
  totalTrades: 42,
  bestTrade: "+$1,240",
};

interface NewSessionState {
  name: string;
  instrument: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  startCapital: string;
}

export default function BacktestingPage() {
  const [activeSession, setActiveSession] = useState(sessions[0]);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState("1×");
  const [showNewModal, setShowNewModal] = useState(false);
  const [activeTool, setActiveTool] = useState("Cursor");
  const [rightTab, setRightTab] = useState<"stats" | "order" | "positions" | "calendar" | "journal" | "settings">("stats");
  const [orderSide, setOrderSide] = useState<"long" | "short">("long");
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop">("market");
  const [qty, setQty] = useState("1");
  const [entry, setEntry] = useState("");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [newSession, setNewSession] = useState<NewSessionState>({
    name: "", instrument: "ES", timeframe: "15m", startDate: "2025-01-01", endDate: "2025-03-31", startCapital: "50000",
  });

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header
        title="Backtesting"
        subtitle="Validate your edge before risking real capital."
        action={
          <Button size="sm" onClick={() => setShowNewModal(true)}>
            <Plus className="w-3.5 h-3.5" />
            New Session
          </Button>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left — session list */}
        <div className="w-56 flex-shrink-0 border-r border-white/[0.05] flex flex-col bg-[#06080f]">
          <div className="p-3 border-b border-white/[0.05]">
            <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide">Sessions ({sessions.length})</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSession(s)}
                className={cn("w-full text-left px-3 py-2.5 rounded-xl transition-all",
                  activeSession.id === s.id ? "bg-[#03588C]/15 border border-[#03588C]/25" : "hover:bg-white/[0.04]")}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-semibold text-[#F2F0EB] truncate">{s.name}</p>
                  {s.status === "draft" && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#6B7280]/20 text-[#6B7280] ml-1 flex-shrink-0">Draft</span>
                  )}
                </div>
                <p className="text-[10px] text-[#6B7280]">{s.instrument} · {s.timeframe}</p>
                {s.status === "complete" && (
                  <p className={cn("text-[11px] font-semibold mt-0.5", s.netPnl >= 0 ? "text-[#22C55E]" : "text-red-400")}>
                    {s.netPnl >= 0 ? "+" : ""}${Math.abs(s.netPnl).toLocaleString()}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Center — chart + controls */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.05] bg-[#06080f] flex-shrink-0">
            <span className="text-xs font-semibold text-[#F2F0EB]">{activeSession.instrument}</span>
            <span className="text-[11px] text-[#6B7280]">{activeSession.timeframe}</span>
            <div className="w-px h-4 bg-white/[0.08] mx-1" />
            {drawingTools.map((tool) => (
              <button
                key={tool.label}
                onClick={() => setActiveTool(tool.label)}
                title={tool.label}
                className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono transition-all",
                  activeTool === tool.label
                    ? "bg-[#03588C] text-white"
                    : "text-[#6B7280] hover:text-[#F2F0EB] hover:bg-white/[0.06]")}
              >
                {tool.icon}
              </button>
            ))}
            <div className="flex-1" />
            <span className="text-[11px] text-[#6B7280]">{activeSession.period}</span>
          </div>

          {/* Chart area */}
          <div className="flex-1 relative bg-[#050508] overflow-hidden">
            {/* Fake chart background */}
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.03) 40px), repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(255,255,255,0.03) 60px)" }} />

            {/* Candles placeholder */}
            <div className="absolute inset-0 flex items-end px-4 pb-12 gap-[3px] overflow-hidden">
              {Array.from({ length: 80 }).map((_, i) => {
                const h = 40 + Math.sin(i * 0.3) * 30 + Math.random() * 20;
                const isGreen = Math.random() > 0.45;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-px">
                    <div className="w-px flex-1" style={{ background: isGreen ? "#22C55E40" : "#EF444440" }} />
                    <div
                      className="w-full rounded-sm"
                      style={{ height: `${h}px`, background: isGreen ? "#22C55E80" : "#EF444480" }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Current price line */}
            <div className="absolute right-0 left-0" style={{ top: "38%" }}>
              <div className="border-t border-dashed border-[#03588C]/60" />
              <div className="absolute right-0 bg-[#03588C] text-white text-[10px] font-mono-nums px-2 py-0.5">
                5261.00
              </div>
            </div>

            {/* Long trade marker */}
            <div className="absolute left-[35%]" style={{ bottom: "45%" }}>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#22C55E] flex-shrink-0" />
                <span className="text-[9px] text-[#22C55E] font-semibold">LONG 5248.50</span>
              </div>
            </div>

            {/* Date axis */}
            <div className="absolute bottom-0 left-0 right-0 h-10 border-t border-white/[0.05] flex items-center px-4 gap-8">
              {["Jan 15", "Feb 1", "Feb 15", "Mar 1", "Mar 15"].map((d) => (
                <span key={d} className="text-[9px] text-[#6B7280]">{d}</span>
              ))}
            </div>
          </div>

          {/* Playback bar */}
          <div className="flex-shrink-0 border-t border-white/[0.05] bg-[#06080f] px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center text-[#6B7280] hover:text-[#F2F0EB] transition-colors">
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center text-[#6B7280] hover:text-[#F2F0EB] transition-colors">
                  <Rewind className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPlaying(!playing)}
                  className="w-9 h-9 rounded-xl bg-[#03588C] flex items-center justify-center text-white hover:bg-[#024a77] transition-colors shadow-glow-xs"
                >
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center text-[#6B7280] hover:text-[#F2F0EB] transition-colors">
                  <FastForward className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center text-[#6B7280] hover:text-[#F2F0EB] transition-colors">
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 flex items-center gap-2">
                <span className="text-[10px] text-[#6B7280] flex-shrink-0">Jan 15</span>
                <div className="flex-1 relative h-1.5 rounded-full bg-white/[0.08]">
                  <div className="absolute left-0 top-0 bottom-0 w-[40%] bg-[#03588C] rounded-full" />
                  <div className="absolute w-3 h-3 bg-white rounded-full border-2 border-[#03588C] -translate-y-[3px] cursor-pointer" style={{ left: "40%" }} />
                </div>
                <span className="text-[10px] text-[#6B7280] flex-shrink-0">Mar 31</span>
              </div>

              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
                {speeds.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={cn("px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all",
                      speed === s ? "bg-[#03588C] text-white" : "text-[#6B7280] hover:text-[#F2F0EB]")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-64 flex-shrink-0 border-l border-white/[0.05] flex flex-col bg-[#06080f]">
          <div className="flex border-b border-white/[0.05] overflow-x-auto">
            {(["stats", "order", "positions", "calendar", "journal", "settings"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={cn("px-3 py-2.5 text-[10px] font-semibold capitalize flex-shrink-0 border-b-2 transition-all",
                  rightTab === tab
                    ? "border-[#03588C] text-[#4BA3D4]"
                    : "border-transparent text-[#6B7280] hover:text-[#F2F0EB]")}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {rightTab === "stats" && (
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Session Results</p>
                  <div className="text-2xl font-bold text-[#22C55E] font-mono-nums">{sessionStats.netPnl}</div>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">{activeSession.trades} trades · {activeSession.period}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Win Rate", value: sessionStats.winRate },
                    { label: "Profit Factor", value: sessionStats.profitFactor },
                    { label: "Max DD", value: sessionStats.maxDrawdown, red: true },
                    { label: "Avg Win", value: sessionStats.avgWin },
                    { label: "Avg Loss", value: sessionStats.avgLoss, red: true },
                    { label: "Best Trade", value: sessionStats.bestTrade },
                  ].map((stat) => (
                    <div key={stat.label} className="glass rounded-xl p-2.5">
                      <p className="text-[9px] text-[#6B7280] uppercase tracking-wide mb-0.5">{stat.label}</p>
                      <p className={cn("text-sm font-bold font-mono-nums", stat.red ? "text-red-400" : "text-[#F2F0EB]")}>{stat.value}</p>
                    </div>
                  ))}
                </div>
                <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-[#6B7280] hover:text-[#F2F0EB] transition-all">
                  <Download className="w-3.5 h-3.5" /> Export Report
                </button>
              </div>
            )}

            {rightTab === "order" && (
              <div className="p-4 space-y-3">
                <div className="flex rounded-xl overflow-hidden border border-white/[0.08]">
                  <button
                    onClick={() => setOrderSide("long")}
                    className={cn("flex-1 py-2.5 text-xs font-bold transition-all",
                      orderSide === "long" ? "bg-[#22C55E] text-white" : "text-[#6B7280] hover:text-[#F2F0EB]")}
                  >
                    LONG
                  </button>
                  <button
                    onClick={() => setOrderSide("short")}
                    className={cn("flex-1 py-2.5 text-xs font-bold transition-all",
                      orderSide === "short" ? "bg-red-500 text-white" : "text-[#6B7280] hover:text-[#F2F0EB]")}
                  >
                    SHORT
                  </button>
                </div>

                <div className="flex gap-1">
                  {(["market", "limit", "stop"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setOrderType(t)}
                      className={cn("flex-1 py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all",
                        orderType === t ? "bg-[#03588C]/30 text-[#4BA3D4]" : "text-[#6B7280] hover:text-[#F2F0EB]")}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  {[
                    { label: "Qty (Contracts)", value: qty, setter: setQty },
                    ...(orderType !== "market" ? [{ label: "Entry Price", value: entry, setter: setEntry }] : []),
                    { label: "Stop Loss", value: sl, setter: setSl },
                    { label: "Take Profit", value: tp, setter: setTp },
                  ].map(({ label, value, setter }) => (
                    <div key={label}>
                      <label className="text-[10px] text-[#6B7280] uppercase tracking-wide block mb-1">{label}</label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-[#F2F0EB] font-mono-nums focus:outline-none focus:border-[#03588C]/50"
                        placeholder="0.00"
                      />
                    </div>
                  ))}
                </div>

                <button
                  className={cn("w-full py-3 rounded-xl text-sm font-bold transition-all",
                    orderSide === "long"
                      ? "bg-[#22C55E] text-white hover:bg-green-600"
                      : "bg-red-500 text-white hover:bg-red-600")}
                >
                  {orderSide === "long" ? "Place Long" : "Place Short"}
                </button>
              </div>
            )}

            {rightTab === "positions" && (
              <div className="p-3 space-y-2">
                {positionRows.map((pos, i) => (
                  <div key={i} className="glass rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#F2F0EB]">{pos.symbol}</span>
                      <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
                        pos.status === "open" ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-white/[0.06] text-[#6B7280]")}>
                        {pos.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn("text-[10px] font-bold", pos.side === "Long" ? "text-[#22C55E]" : "text-red-400")}>{pos.side}</span>
                      <span className="text-[10px] text-[#6B7280]">×{pos.qty} @ {pos.entry}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#6B7280]">P&amp;L</span>
                      <span className="text-sm font-bold text-[#22C55E] font-mono-nums">{pos.pnl}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {rightTab === "journal" && (
              <div className="p-4 space-y-3">
                <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide">Auto-Journaled Trades</p>
                <div className="space-y-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="glass rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[#F2F0EB]">Trade #{n}</span>
                        <span className="text-[10px] text-[#22C55E] font-mono-nums">+${(n * 240).toLocaleString()}</span>
                      </div>
                      <textarea
                        placeholder="Add notes about this trade..."
                        rows={2}
                        className="w-full bg-transparent text-[11px] text-[#6B7280] placeholder-[#6B7280]/50 focus:outline-none resize-none"
                      />
                    </div>
                  ))}
                </div>
                <button className="w-full py-2 rounded-xl bg-[#03588C]/10 border border-[#03588C]/20 text-xs text-[#4BA3D4] hover:bg-[#03588C]/20 transition-all">
                  <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />
                  Export to Journal
                </button>
              </div>
            )}

            {rightTab === "calendar" && (
              <div className="p-3 space-y-2">
                <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Session Calendar</p>
                <div className="grid grid-cols-7 gap-1">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={i} className="text-center text-[9px] text-[#6B7280]">{d}</div>
                  ))}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                    const isGreen = [3, 7, 9, 14, 16, 21, 24, 28].includes(day);
                    const isRed = [2, 5, 11, 18, 22, 27].includes(day);
                    return (
                      <div key={day}
                        className={cn("aspect-square rounded-lg flex items-center justify-center text-[9px] font-medium",
                          isGreen ? "bg-[#22C55E]/20 text-[#22C55E]" :
                          isRed ? "bg-red-500/20 text-red-400" :
                          "text-[#6B7280]/40")}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#22C55E]" /><span className="text-[10px] text-[#6B7280]">Profit</span></div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[10px] text-[#6B7280]">Loss</span></div>
                </div>
              </div>
            )}

            {rightTab === "settings" && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase tracking-wide block mb-1">Session Name</label>
                  <input
                    defaultValue={activeSession.name}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-[#F2F0EB] focus:outline-none focus:border-[#03588C]/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase tracking-wide block mb-1">Commission per Trade</label>
                  <input defaultValue="$4.80" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-[#F2F0EB] focus:outline-none focus:border-[#03588C]/50" />
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase tracking-wide block mb-1">Slippage (ticks)</label>
                  <input defaultValue="1" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-[#F2F0EB] focus:outline-none focus:border-[#03588C]/50" />
                </div>
                <button className="w-full py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Delete Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Session Modal */}
      <AnimatePresence>
        {showNewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-full max-w-md border border-[#03588C]/20"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#F2F0EB]">New Backtest Session</h2>
                <button onClick={() => setShowNewModal(false)} className="text-[#6B7280] hover:text-[#F2F0EB] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Session Name", key: "name", placeholder: "e.g. ES Trend Continuation" },
                  { label: "Start Date", key: "startDate", type: "date" },
                  { label: "End Date", key: "endDate", type: "date" },
                  { label: "Starting Capital ($)", key: "startCapital", type: "number" },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key}>
                    <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">{label}</label>
                    <input
                      type={type || "text"}
                      value={newSession[key as keyof NewSessionState]}
                      onChange={(e) => setNewSession((s) => ({ ...s, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] focus:outline-none focus:border-[#03588C]/50 placeholder-[#6B7280]/50"
                    />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Instrument</label>
                    <select
                      value={newSession.instrument}
                      onChange={(e) => setNewSession((s) => ({ ...s, instrument: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] focus:outline-none"
                    >
                      {["ES", "NQ", "GC", "CL", "EUR/USD", "GBP/USD", "NAS100", "SPX"].map((i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Timeframe</label>
                    <select
                      value={newSession.timeframe}
                      onChange={(e) => setNewSession((s) => ({ ...s, timeframe: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] focus:outline-none"
                    >
                      {["1m", "5m", "15m", "1H", "4H", "1D"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="ghost" className="flex-1" onClick={() => setShowNewModal(false)}>Cancel</Button>
                <Button className="flex-1" onClick={() => setShowNewModal(false)}>
                  <Play className="w-3.5 h-3.5" /> Start Session
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
