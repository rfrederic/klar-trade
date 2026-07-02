"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { Shield, AlertTriangle, TrendingDown, Calculator, Zap, Info, Loader2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBrowserTimezone } from "@/lib/timezone";

// ─── Instrument registry ────────────────────────────────────────────────────
type CalcMode = "ticks" | "price";

interface Instrument {
  label: string;
  mode: CalcMode;
  tickValue?: number;       // per tick (futures)
  pipValue?: number;        // per pip per lot (forex, 10 USD standard)
  pipSize?: number;         // e.g. 0.0001 for EUR/USD
  pointValue?: number;      // per point (indices / metals)
}

const INSTRUMENTS: Record<string, Instrument> = {
  ES:        { label: "ES (S&P 500)",       mode: "ticks", tickValue: 12.5 },
  NQ:        { label: "NQ (Nasdaq)",         mode: "ticks", tickValue: 5 },
  RTY:       { label: "RTY (Russell 2000)",  mode: "ticks", tickValue: 5 },
  YM:        { label: "YM (Dow Jones)",      mode: "ticks", tickValue: 5 },
  GC:        { label: "GC (Gold)",           mode: "ticks", tickValue: 10 },
  SI:        { label: "SI (Silver)",         mode: "ticks", tickValue: 25 },
  CL:        { label: "CL (Crude Oil)",      mode: "ticks", tickValue: 10 },
  "EUR/USD": { label: "EUR/USD",             mode: "price", pipValue: 10, pipSize: 0.0001 },
  "GBP/USD": { label: "GBP/USD",            mode: "price", pipValue: 10, pipSize: 0.0001 },
  "USD/JPY": { label: "USD/JPY",            mode: "price", pipValue: 9.1, pipSize: 0.01 },
  "AUD/USD": { label: "AUD/USD",            mode: "price", pipValue: 10, pipSize: 0.0001 },
  "USD/CAD": { label: "USD/CAD",            mode: "price", pipValue: 7.5, pipSize: 0.0001 },
  "XAU/USD": { label: "XAU/USD (Spot Gold)", mode: "price", pipValue: 10, pipSize: 0.1 },
};

// ─── Position size calculation ───────────────────────────────────────────────
interface CalcResult {
  dollarRisk: number;
  size: number;           // contracts or lots
  sizeLabel: string;      // "contracts" | "lots"
  maxLoss: number;
  rr: number | null;
  reward: number | null;
}

function calcPositionSize(
  instrument: string,
  accountBalance: number,
  riskPct: number,
  entry: number,
  stop: number,
  target: number | null,
  stopTicks: number,      // only used when entry/stop = 0
): CalcResult {
  const inst = INSTRUMENTS[instrument];
  const dollarRisk = accountBalance * (riskPct / 100);

  if (inst.mode === "ticks") {
    // Futures: use ticks
    const ticks = entry > 0 && stop > 0
      ? Math.abs(entry - stop) / 0.25  // ES tick = 0.25
      : stopTicks;
    const tv = inst.tickValue ?? 10;
    const contracts = ticks > 0 ? dollarRisk / (ticks * tv) : 0;
    const maxLoss = Math.round(contracts * ticks * tv);
    let rr: number | null = null;
    let reward: number | null = null;
    if (entry > 0 && stop > 0 && target != null && target > 0) {
      const stopDist = Math.abs(entry - stop);
      const targetDist = Math.abs(target - entry);
      rr = stopDist > 0 ? Math.round((targetDist / stopDist) * 10) / 10 : null;
      const targetTicks = targetDist / 0.25;
      reward = Math.round(contracts * targetTicks * tv);
    }
    return { dollarRisk, size: Math.floor(contracts * 10) / 10, sizeLabel: "contracts", maxLoss, rr, reward };
  } else {
    // Forex/metals: use price distance → pips → lots
    const ps = inst.pipSize ?? 0.0001;
    const pv = inst.pipValue ?? 10;
    const pipsFromPrice = entry > 0 && stop > 0 ? Math.abs(entry - stop) / ps : stopTicks;
    const lots = pipsFromPrice > 0 ? dollarRisk / (pipsFromPrice * pv) : 0;
    const maxLoss = Math.round(lots * pipsFromPrice * pv);
    let rr: number | null = null;
    let reward: number | null = null;
    if (entry > 0 && stop > 0 && target != null && target > 0) {
      const stopPips = Math.abs(entry - stop) / ps;
      const targetPips = Math.abs(target - entry) / ps;
      rr = stopPips > 0 ? Math.round((targetPips / stopPips) * 10) / 10 : null;
      reward = Math.round(lots * targetPips * pv);
    }
    return { dollarRisk, size: Math.round(lots * 100) / 100, sizeLabel: "lots", maxLoss, rr, reward };
  }
}

// ─── Gauge component ────────────────────────────────────────────────────────
function Gauge({ label, value, sub, pct, ok }: { label: string; value: string; sub: string; pct: number; ok: boolean }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-[#6B7280] font-medium uppercase tracking-wide">{label}</p>
        {!ok && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
      </div>
      <p className={cn("text-2xl font-bold font-mono-nums mb-1", ok ? "text-[#F2F0EB]" : "text-amber-400")}>{value}</p>
      <p className="text-[11px] text-[#6B7280] mb-3">{sub}</p>
      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", ok ? "bg-[#22C55E]" : "bg-amber-500")}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <p className="text-[10px] text-[#6B7280] mt-1 text-right">{Math.round(pct)}% used</p>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
interface RiskStats {
  brokerConnected: boolean;
  accountBalance: number | null;
  today: { pnl: number; trades: number; grossLoss: number; winRate: number | null };
  open: { positions: number; floatingPnl: number };
}

const DAILY_LOSS_LIMIT = 500;
const MAX_TRADES = 6;

export default function RiskPage() {
  const router = useRouter();
  const [riskStats, setRiskStats] = useState<RiskStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Calculator state
  const [instrument, setInstrument] = useState("ES");
  const [riskPct, setRiskPct] = useState("1.5");
  const [entry, setEntry] = useState("");
  const [stop, setStop] = useState("");
  const [target, setTarget] = useState("");
  const [stopTicks, setStopTicks] = useState("10");

  useEffect(() => {
    fetch(`/api/risk/stats?tz=${encodeURIComponent(getBrowserTimezone())}`)
      .then((r) => r.json())
      .then((d) => setRiskStats(d))
      .finally(() => setStatsLoading(false));
  }, []);

  const accountBalance = riskStats?.accountBalance ?? 50000;
  const inst = INSTRUMENTS[instrument];
  const isFutures = inst.mode === "ticks";

  const entryN = parseFloat(entry) || 0;
  const stopN = parseFloat(stop) || 0;
  const targetN = parseFloat(target) || 0;
  const stopTicksN = parseFloat(stopTicks) || 1;
  const riskPctN = parseFloat(riskPct) || 0;

  const result = calcPositionSize(instrument, accountBalance, riskPctN, entryN, stopN, targetN || null, stopTicksN);

  const todayPnl = riskStats?.today.pnl ?? 0;
  const todayTrades = riskStats?.today.trades ?? 0;
  const todayGrossLoss = riskStats?.today.grossLoss ?? 0;
  const todayWinRate = riskStats?.today.winRate;
  const openFloat = riskStats?.open.floatingPnl ?? 0;

  const lossLimitPct = DAILY_LOSS_LIMIT > 0 ? (todayGrossLoss / DAILY_LOSS_LIMIT) * 100 : 0;
  const tradesPct = (todayTrades / MAX_TRADES) * 100;
  const floatPct = accountBalance > 0 ? (Math.abs(openFloat) / accountBalance) * 100 : 0;

  const allHealthy = todayGrossLoss < DAILY_LOSS_LIMIT && todayTrades < MAX_TRADES && openFloat > -DAILY_LOSS_LIMIT;

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Risk Manager"
        subtitle="Protect your capital. Size positions with precision."
      />

      <main className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Status banner */}
        {statsLoading ? (
          <div className="flex items-center gap-3 px-5 py-4 glass rounded-2xl">
            <Loader2 className="w-4 h-4 animate-spin text-[#6B7280]" />
            <p className="text-xs text-[#6B7280]">Loading risk data…</p>
          </div>
        ) : allHealthy ? (
          <div className="flex items-center gap-3 px-5 py-4 bg-[#22C55E]/[0.06] border border-[#22C55E]/20 rounded-2xl">
            <Shield className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#22C55E]">Risk parameters healthy</p>
              <p className="text-xs text-[#6B7280]">
                {todayTrades === 0
                  ? "No trades taken today. Daily limits fully available."
                  : `${todayTrades} trade${todayTrades > 1 ? "s" : ""} today · ${todayPnl >= 0 ? "+" : ""}$${todayPnl.toFixed(2)} P&L · ${MAX_TRADES - todayTrades} slots remaining`}
              </p>
            </div>
            {riskStats?.brokerConnected && (
              <div className="ml-auto flex items-center gap-1.5 text-xs text-[#22C55E]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                Live
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 px-5 py-4 bg-amber-500/[0.06] border border-amber-500/20 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-400">Risk limit approached</p>
              <p className="text-xs text-[#6B7280]">Review your exposure before taking new positions.</p>
            </div>
          </div>
        )}

        {/* Gauges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl p-5 flex items-center justify-center h-32">
                <Loader2 className="w-4 h-4 animate-spin text-[#6B7280]" />
              </div>
            ))
          ) : (
            <>
              <Gauge
                label="Today's P&L"
                value={todayTrades > 0 ? `${todayPnl >= 0 ? "+" : ""}$${todayPnl.toFixed(0)}` : "—"}
                sub={`Daily limit: -$${DAILY_LOSS_LIMIT}`}
                pct={lossLimitPct}
                ok={todayGrossLoss < DAILY_LOSS_LIMIT}
              />
              <Gauge
                label="Trades Today"
                value={String(todayTrades)}
                sub={`Max: ${MAX_TRADES} trades`}
                pct={tradesPct}
                ok={todayTrades < MAX_TRADES}
              />
              <Gauge
                label="Today's Win Rate"
                value={todayWinRate != null ? `${todayWinRate}%` : "—"}
                sub={`${todayTrades} closed trade${todayTrades !== 1 ? "s" : ""}`}
                pct={todayWinRate ?? 0}
                ok={(todayWinRate ?? 100) >= 40}
              />
              <Gauge
                label="Open Floating"
                value={riskStats?.brokerConnected ? `${openFloat >= 0 ? "+" : ""}$${openFloat.toFixed(0)}` : "—"}
                sub={riskStats?.brokerConnected ? `${riskStats.open.positions} open position${riskStats.open.positions !== 1 ? "s" : ""}` : "No broker connected"}
                pct={floatPct}
                ok={openFloat > -DAILY_LOSS_LIMIT}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Position Size Calculator */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.05]">
              <Calculator className="w-4 h-4 text-[#4BA3D4]" />
              <h3 className="text-sm font-semibold text-[#F2F0EB]">Position Size Calculator</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Account balance */}
                <div>
                  <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Account Balance</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm">$</span>
                    <input
                      type="number"
                      value={accountBalance}
                      readOnly
                      className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl pl-7 pr-3 py-2.5 text-sm text-[#6B7280] cursor-not-allowed"
                    />
                  </div>
                  {riskStats?.brokerConnected && (
                    <p className="text-[10px] text-[#22C55E] mt-1">Live from MT5</p>
                  )}
                </div>

                {/* Risk % */}
                <div>
                  <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Risk Per Trade</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={riskPct}
                      onChange={(e) => setRiskPct(e.target.value)}
                      step="0.1"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-3 pr-7 py-2.5 text-sm text-[#F2F0EB] focus:outline-none focus:border-[#03588C]/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm">%</span>
                  </div>
                  <p className="text-[10px] text-[#6B7280] mt-1">${result.dollarRisk.toFixed(0)} at risk</p>
                </div>

                {/* Instrument */}
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Instrument</label>
                  <select
                    value={instrument}
                    onChange={(e) => { setInstrument(e.target.value); setEntry(""); setStop(""); setTarget(""); }}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] focus:outline-none"
                  >
                    <optgroup label="Futures">
                      {Object.entries(INSTRUMENTS).filter(([, v]) => v.mode === "ticks").map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Forex / Metals">
                      {Object.entries(INSTRUMENTS).filter(([, v]) => v.mode === "price").map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Entry / Stop / Target */}
                <div>
                  <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Entry Price</label>
                  <input
                    type="number"
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder={isFutures ? "e.g. 5250.50" : "e.g. 1.0850"}
                    step="any"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] placeholder-[#6B7280]/50 focus:outline-none focus:border-[#03588C]/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Stop Loss</label>
                  <input
                    type="number"
                    value={stop}
                    onChange={(e) => setStop(e.target.value)}
                    placeholder={isFutures ? "e.g. 5240.00" : "e.g. 1.0820"}
                    step="any"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] placeholder-[#6B7280]/50 focus:outline-none focus:border-[#03588C]/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Take Profit <span className="text-[#6B7280]/50 normal-case font-normal">(optional)</span></label>
                  <input
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder={isFutures ? "e.g. 5280.00" : "e.g. 1.0920"}
                    step="any"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] placeholder-[#6B7280]/50 focus:outline-none focus:border-[#03588C]/50"
                  />
                </div>
                {(!entry || !stop) && (
                  <div>
                    <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">
                      {isFutures ? "Stop (ticks)" : "Stop (pips)"}
                    </label>
                    <input
                      type="number"
                      value={stopTicks}
                      onChange={(e) => setStopTicks(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] focus:outline-none focus:border-[#03588C]/50"
                    />
                  </div>
                )}
              </div>

              {/* Result */}
              <div className="bg-[#03588C]/08 border border-[#03588C]/20 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-[#6B7280]">Calculation</p>
                  <Zap className="w-4 h-4 text-[#4BA3D4]" />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-1">$ Risk</p>
                    <p className="text-lg font-bold text-[#F2F0EB] font-mono-nums">${result.dollarRisk.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-1">{result.sizeLabel}</p>
                    <p className="text-lg font-bold text-[#4BA3D4] font-mono-nums">
                      {result.size > 0 ? result.size : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-1">Max Loss</p>
                    <p className="text-lg font-bold text-red-400 font-mono-nums">
                      {result.size > 0 ? `-$${result.maxLoss}` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-1">R:R</p>
                    <p className={cn("text-lg font-bold font-mono-nums",
                      result.rr != null
                        ? result.rr >= 2 ? "text-[#22C55E]" : result.rr >= 1 ? "text-[#D9CA82]" : "text-red-400"
                        : "text-[#6B7280]")}>
                      {result.rr != null ? `${result.rr}R` : "—"}
                    </p>
                  </div>
                </div>
                {result.reward != null && result.size > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center gap-2 text-xs text-[#22C55E]">
                    <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
                    Potential reward: +${result.reward} at target ({result.rr}R)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Risk guardrails */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.05]">
              <Shield className="w-4 h-4 text-[#D9CA82]" />
              <h3 className="text-sm font-semibold text-[#F2F0EB]">Risk Guardrails</h3>
            </div>
            <div className="p-5 space-y-2.5">
              {[
                { rule: `Daily loss limit: $${DAILY_LOSS_LIMIT}`, active: true, icon: TrendingDown, triggered: todayGrossLoss >= DAILY_LOSS_LIMIT },
                { rule: `Max ${MAX_TRADES} trades per day`, active: true, icon: Shield, triggered: todayTrades >= MAX_TRADES },
                { rule: "Max 3% risk per trade", active: true, icon: Shield, triggered: riskPctN > 3 },
                { rule: "Always define stop before entry", active: true, icon: Info, triggered: false },
                { rule: "No revenge trading after 3 consecutive losses", active: true, icon: AlertTriangle, triggered: false },
                { rule: "Review P&L before adding positions", active: true, icon: Info, triggered: false },
              ].map((r, i) => (
                <div
                  key={i}
                  className={cn("flex items-center gap-3 p-3 rounded-xl border transition-colors",
                    r.triggered
                      ? "bg-red-500/[0.06] border-red-500/20"
                      : r.active
                        ? "bg-[#22C55E]/[0.04] border-[#22C55E]/15"
                        : "bg-white/[0.02] border-white/[0.05] opacity-50"
                  )}
                >
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                    r.triggered ? "bg-red-500/15 text-red-400" : r.active ? "bg-[#22C55E]/15 text-[#22C55E]" : "bg-white/[0.05] text-[#6B7280]")}>
                    <r.icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={cn("text-sm flex-1", r.triggered ? "text-red-400" : "text-[#F2F0EB]")}>{r.rule}</span>
                  {r.triggered && <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                  {!r.triggered && r.active && <div className="w-2 h-2 rounded-full bg-[#22C55E] flex-shrink-0" />}
                </div>
              ))}

              <button
                onClick={() => router.push("/settings")}
                className="w-full mt-1 py-2 rounded-xl bg-white/[0.03] border border-white/[0.07] text-xs text-[#6B7280] hover:text-[#F2F0EB] hover:bg-white/[0.05] transition-all flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                Manage in Settings
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
