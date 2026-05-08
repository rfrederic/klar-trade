"use client";

import { Header } from "@/components/dashboard/Header";
import { Shield, AlertTriangle, TrendingDown, Calculator, Zap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const riskMetrics = [
  { label: "Daily P&L", value: "+$1,320", limit: "Max: -$2,400", pct: 55, color: "bg-emerald-500", textColor: "text-emerald-400", safe: true },
  { label: "Daily Risk Used", value: "1.4%", limit: "Max: 3%", pct: 47, color: "bg-indigo-500", textColor: "text-indigo-400", safe: true },
  { label: "Open Drawdown", value: "0.2%", limit: "Max: 8%", pct: 3, color: "bg-emerald-500", textColor: "text-emerald-400", safe: true },
  { label: "Trades Today", value: "4", limit: "Max: 6", pct: 67, color: "bg-amber-500", textColor: "text-amber-400", safe: true },
];

export default function RiskPage() {
  const [account, setAccount] = useState("50000");
  const [riskPct, setRiskPct] = useState("1.5");
  const [stopPips, setStopPips] = useState("10");
  const [instrument, setInstrument] = useState("ES");

  const accountNum = parseFloat(account) || 0;
  const riskPctNum = parseFloat(riskPct) || 0;
  const dollarRisk = (accountNum * riskPctNum) / 100;
  const stopNum = parseFloat(stopPips) || 1;

  const tickValues: Record<string, number> = {
    ES: 12.5,
    NQ: 5,
    GC: 10,
    CL: 10,
    "EUR/USD": 10,
  };
  const tickValue = tickValues[instrument] ?? 10;
  const contracts = Math.floor(dollarRisk / (stopNum * tickValue));

  return (
    <div className="flex flex-col flex-1">
      <Header title="Risk Manager" subtitle="Protect your capital. Protect your edge." />

      <main className="flex-1 p-6 space-y-6">
        {/* Alert banner */}
        <div className="flex items-center gap-3 px-5 py-4 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-2xl">
          <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-300">Risk parameters healthy</p>
            <p className="text-xs text-slate-500">All limits within acceptable range. Daily max loss at 47% of limit.</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </div>
        </div>

        {/* Risk gauges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {riskMetrics.map((m) => (
            <div key={m.label} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{m.label}</p>
                {!m.safe && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <p className={`text-2xl font-bold font-display mb-1 ${m.textColor}`}>{m.value}</p>
              <p className="text-[11px] text-slate-600 mb-3">{m.limit}</p>

              {/* Progress bar */}
              <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${m.color}`}
                  style={{ width: `${m.pct}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-600 mt-1 text-right">{m.pct}% used</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Position size calculator */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.05]">
              <Calculator className="w-4.5 h-4.5 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Position Size Calculator</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Account Size</Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                    <Input
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      className="pl-7"
                      type="number"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Risk Per Trade</Label>
                  <div className="relative">
                    <Input
                      value={riskPct}
                      onChange={(e) => setRiskPct(e.target.value)}
                      className="pr-7"
                      type="number"
                      step="0.1"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Instrument</Label>
                  <select
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  >
                    {Object.keys(tickValues).map((k) => (
                      <option key={k} value={k} className="bg-[#0a0a12]">{k}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Stop Distance (ticks)</Label>
                  <Input
                    value={stopPips}
                    onChange={(e) => setStopPips(e.target.value)}
                    type="number"
                  />
                </div>
              </div>

              {/* Result */}
              <div className="bg-indigo-500/[0.08] border border-indigo-500/20 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-slate-400">Calculation Result</p>
                  <Zap className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[11px] text-slate-500 mb-1">Dollar Risk</p>
                    <p className="text-xl font-bold text-white">${dollarRisk.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 mb-1">Contracts</p>
                    <p className="text-xl font-bold text-indigo-400">{contracts > 0 ? contracts : "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 mb-1">Max Loss</p>
                    <p className="text-xl font-bold text-rose-400">-${(contracts * stopNum * tickValue).toFixed(0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk rules */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.05]">
              <Shield className="w-4.5 h-4.5 text-violet-400" />
              <h3 className="text-sm font-semibold text-white">Risk Guardrails</h3>
            </div>
            <div className="p-5 space-y-3">
              {[
                { rule: "Max daily loss: $1,500", active: true, icon: TrendingDown },
                { rule: "Max 3% risk per trade", active: true, icon: Shield },
                { rule: "Stop trading after 3 consecutive losses", active: true, icon: AlertTriangle },
                { rule: "No trading between 12–1:30 PM EST", active: false, icon: Info },
                { rule: "Max drawdown 8% before reset protocol", active: true, icon: AlertTriangle },
                { rule: "Always define stop before entry", active: true, icon: Shield },
              ].map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${r.active ? "bg-emerald-500/[0.04] border-emerald-500/15" : "bg-white/[0.02] border-white/[0.05] opacity-50"}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${r.active ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.05] text-slate-500"}`}>
                    <r.icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm text-slate-300 flex-1">{r.rule}</span>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.active ? "bg-emerald-400" : "bg-slate-600"}`} />
                </div>
              ))}

              <Button variant="outline" className="w-full mt-2" size="sm">
                <Shield className="w-3.5 h-3.5" />
                Manage Guardrails
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
