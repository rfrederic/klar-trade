"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Brain, Zap, Target, TrendingUp, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const replayTrades = [
  { id: "1", date: "Jan 15, 2024", symbol: "ES", type: "Long", pnl: "+$480", win: true, setup: "Trend Continuation" },
  { id: "2", date: "Jan 14, 2024", symbol: "NQ", type: "Short", pnl: "-$180", win: false, setup: "Reversal" },
  { id: "3", date: "Jan 13, 2024", symbol: "GC", type: "Long", pnl: "+$680", win: true, setup: "Support Bounce" },
];

const speeds = ["0.5×", "1×", "2×", "4×", "8×"];

// Simulated candlestick data
const candles = Array.from({ length: 60 }, (_, i) => {
  const base = 5840 + Math.sin(i * 0.3) * 15 + i * 0.4;
  const open = base + (Math.random() - 0.5) * 8;
  const close = base + (Math.random() - 0.5) * 8;
  const high = Math.max(open, close) + Math.random() * 5;
  const low = Math.min(open, close) - Math.random() * 5;
  return { open, close, high, low, bullish: close > open };
});

function CandleChart({ currentBar }: { currentBar: number }) {
  const visible = candles.slice(0, currentBar + 1);
  const allPrices = visible.flatMap((c) => [c.high, c.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const range = maxPrice - minPrice || 1;
  const W = 700;
  const H = 260;
  const candleWidth = Math.min(10, W / visible.length - 2);

  const toY = (p: number) => H - ((p - minPrice) / range) * H * 0.85 - H * 0.05;
  const toX = (i: number) => (i / (Math.max(visible.length, 1) - 1 || 1)) * W;

  const entryBar = Math.floor(currentBar * 0.3);
  const exitBar = Math.floor(currentBar * 0.7);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="entryGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" y1={H * f} x2={W} y2={H * f} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      ))}

      {/* Entry/exit zones */}
      {currentBar > entryBar && (
        <line x1={toX(entryBar)} y1="0" x2={toX(entryBar)} y2={H} stroke="#6366f1" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
      )}
      {currentBar > exitBar && (
        <line x1={toX(exitBar)} y1="0" x2={toX(exitBar)} y2={H} stroke="#34d399" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
      )}

      {/* Candles */}
      {visible.map((c, i) => {
        const x = toX(i);
        const openY = toY(c.open);
        const closeY = toY(c.close);
        const highY = toY(c.high);
        const lowY = toY(c.low);
        const color = c.bullish ? "#34d399" : "#f43f5e";
        const halfW = candleWidth / 2;
        return (
          <g key={i}>
            <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1" opacity="0.8" />
            <rect
              x={x - halfW}
              y={Math.min(openY, closeY)}
              width={candleWidth}
              height={Math.max(Math.abs(openY - closeY), 1)}
              fill={color}
              opacity={i === currentBar ? 1 : 0.75}
            />
          </g>
        );
      })}

      {/* Entry label */}
      {currentBar > entryBar && (
        <g>
          <rect x={toX(entryBar) - 22} y={H - 20} width={44} height={16} rx="3" fill="rgba(99,102,241,0.8)" />
          <text x={toX(entryBar)} y={H - 9} textAnchor="middle" fill="white" fontSize="9" fontWeight="600">ENTRY</text>
        </g>
      )}
      {currentBar > exitBar && (
        <g>
          <rect x={toX(exitBar) - 18} y={H - 20} width={36} height={16} rx="3" fill="rgba(52,211,153,0.8)" />
          <text x={toX(exitBar)} y={H - 9} textAnchor="middle" fill="white" fontSize="9" fontWeight="600">EXIT</text>
        </g>
      )}
    </svg>
  );
}

export default function ReplayPage() {
  const [selected, setSelected] = useState(replayTrades[0].id);
  const [playing, setPlaying] = useState(false);
  const [currentBar, setCurrentBar] = useState(28);
  const [speed, setSpeed] = useState("1×");
  const [note, setNote] = useState("");
  const [showFocusOverlay, setShowFocusOverlay] = useState(false);

  const totalBars = candles.length;

  const step = (dir: 1 | -1) => {
    setCurrentBar((b) => Math.max(0, Math.min(totalBars - 1, b + dir)));
  };

  return (
    <div className="flex flex-col flex-1">
      <Header title="Trade Replay" subtitle="Replay. Analyze. Improve your execution." />

      <main className="flex-1 p-6 flex gap-6">

        {/* Left: trade list */}
        <div className="w-60 flex-shrink-0 flex flex-col gap-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">Replay Sessions</p>
          {replayTrades.map((t) => (
            <button
              key={t.id}
              onClick={() => { setSelected(t.id); setCurrentBar(0); setPlaying(false); }}
              className={cn(
                "w-full text-left rounded-2xl p-3.5 border transition-all duration-200",
                selected === t.id ? "bg-indigo-500/10 border-indigo-500/30" : "glass hover:bg-white/[0.05]"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">{t.symbol}</span>
                <span className={cn("text-xs font-bold", t.win ? "text-emerald-400" : "text-rose-400")}>{t.pnl}</span>
              </div>
              <p className="text-[11px] text-slate-500">{t.date}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">{t.setup}</p>
            </button>
          ))}

          {/* AI Analysis */}
          <div className="glass rounded-2xl p-4 mt-2 border border-indigo-500/15 bg-indigo-500/[0.03]">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-3.5 h-3.5 text-indigo-400" />
              <p className="text-xs font-semibold text-indigo-400">AI Replay Analysis</p>
            </div>
            <div className="space-y-2 text-[11px] text-slate-400">
              <div className="flex gap-1.5"><span className="text-emerald-400">✓</span>Entry timing was precise — within 2 bars of optimal</div>
              <div className="flex gap-1.5"><span className="text-amber-400">!</span>Exit was 0.4R early — could have captured $192 more</div>
              <div className="flex gap-1.5"><span className="text-emerald-400">✓</span>Risk was 1.2% — within your plan parameters</div>
              <div className="flex gap-1.5"><span className="text-rose-400">✗</span>Entry candle showed slight hesitation (2 bars late)</div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/[0.06]">
              <p className="text-[10px] text-indigo-400 font-semibold">Execution Score</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: "82%" }} />
                </div>
                <span className="text-xs font-bold text-indigo-400">82/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main replay area */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Chart */}
          <div className="glass rounded-2xl overflow-hidden flex-1">
            {/* Chart header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-semibold text-white">{replayTrades.find(t => t.id === selected)?.symbol ?? "ES"}</span>
                </div>
                <span className="text-xs text-slate-500">15m Chart</span>
                <span className="text-xs text-slate-600">Jan 15, 2024 · NY Session</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Bar {currentBar + 1} / {totalBars}</span>
                <div className="w-20 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${((currentBar + 1) / totalBars) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Chart area */}
            <div className="relative h-64 p-4">
              <CandleChart currentBar={currentBar} />
            </div>

            {/* Price labels */}
            <div className="flex items-center justify-between px-5 py-2 border-t border-white/[0.04] text-[11px] text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-400" /> Entry: 5,842.25</span>
                {currentBar > Math.floor(candles.length * 0.7) && (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold"><Target className="w-3 h-3" /> Exit: 5,870.75</span>
                )}
              </div>
              <span>PnL: <span className="text-emerald-400 font-semibold">+$480.00</span></span>
            </div>
          </div>

          {/* Playback controls */}
          <div className="glass rounded-2xl px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left: nav controls */}
              <div className="flex items-center gap-2">
                <button onClick={() => { setCurrentBar(0); setPlaying(false); }} className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button onClick={() => step(-1)} className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setPlaying(!playing)}
                  className="w-11 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-glow-sm hover:shadow-glow-md transition-shadow"
                >
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                <button onClick={() => step(1)} className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={() => { setCurrentBar(totalBars - 1); setPlaying(false); }} className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Center: progress bar */}
              <div className="flex-1 mx-6">
                <input
                  type="range"
                  min={0}
                  max={totalBars - 1}
                  value={currentBar}
                  onChange={(e) => setCurrentBar(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/[0.05] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
                />
              </div>

              {/* Right: speed */}
              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1">
                {speeds.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all",
                      speed === s ? "bg-indigo-500/20 text-indigo-400" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="w-3.5 h-3.5 text-slate-500" />
              <p className="text-xs font-semibold text-slate-400">Replay Notes</p>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What do you notice about your execution? What would you do differently?"
              rows={3}
              className="w-full resize-none bg-transparent text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none leading-relaxed"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
