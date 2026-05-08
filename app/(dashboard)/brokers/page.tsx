"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Link2, RefreshCw, CheckCircle2, AlertCircle, Clock, Wifi, WifiOff, ChevronRight, Plus, Settings, Trash2, BarChart2, ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const brokers = [
  {
    id: "ctrader",
    name: "cTrader",
    logo: "CT",
    color: "indigo",
    status: "connected",
    account: "Live · #3847291",
    balance: "$28,480.00",
    lastSync: "2 min ago",
    trades: 142,
    description: "Spotware Systems · FX & CFDs",
    syncEnabled: true,
  },
  {
    id: "tradelocker",
    name: "TradeLocker",
    logo: "TL",
    color: "violet",
    status: "connected",
    account: "Prop · FTMO-98124",
    balance: "$98,000.00",
    lastSync: "5 min ago",
    trades: 87,
    description: "Prop Firm Integration · All instruments",
    syncEnabled: true,
  },
  {
    id: "tradovate",
    name: "Tradovate",
    logo: "TV",
    color: "cyan",
    status: "error",
    account: "Live · #TV-44821",
    balance: "$12,400.00",
    lastSync: "Failed · 1h ago",
    trades: 0,
    description: "Futures · CME Group",
    syncEnabled: false,
  },
  {
    id: "mt5",
    name: "MetaTrader 5",
    logo: "MT",
    color: "amber",
    status: "disconnected",
    account: "—",
    balance: "—",
    lastSync: "Never",
    trades: 0,
    description: "MetaQuotes · FX & Futures",
    syncEnabled: false,
  },
  {
    id: "ibkr",
    name: "Interactive Brokers",
    logo: "IB",
    color: "emerald",
    status: "disconnected",
    account: "—",
    balance: "—",
    lastSync: "Never",
    trades: 0,
    description: "Stocks, Options, Futures, FX",
    syncEnabled: false,
  },
  {
    id: "ninjatrader",
    name: "NinjaTrader",
    logo: "NT",
    color: "rose",
    status: "disconnected",
    account: "—",
    balance: "—",
    lastSync: "Never",
    trades: 0,
    description: "Futures & FX · Advanced charting",
    syncEnabled: false,
  },
];

const syncLogs = [
  { time: "09:42:18", broker: "cTrader", event: "Trade imported", detail: "ES Long +$480 — matched to journal", type: "success" },
  { time: "09:41:55", broker: "cTrader", event: "Sync completed", detail: "3 new trades · 0 errors", type: "success" },
  { time: "09:38:01", broker: "TradeLocker", event: "Trade imported", detail: "NQ Short +$840 — matched to journal", type: "success" },
  { time: "09:30:00", broker: "Tradovate", event: "Connection failed", detail: "Token expired — re-authentication required", type: "error" },
  { time: "09:29:58", broker: "cTrader", event: "Session opened", detail: "New trading session detected · NY Open", type: "info" },
  { time: "08:01:12", broker: "TradeLocker", event: "Daily sync", detail: "Yesterday's 4 trades imported successfully", type: "success" },
];

const statusConfig = {
  connected: { label: "Connected", icon: Wifi, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  error: { label: "Error", icon: AlertCircle, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
  disconnected: { label: "Disconnected", icon: WifiOff, color: "text-slate-500", bg: "bg-white/[0.04] border-white/[0.08]" },
};

const logTypeConfig = {
  success: { color: "text-emerald-400", dot: "bg-emerald-400" },
  error: { color: "text-rose-400", dot: "bg-rose-400" },
  info: { color: "text-indigo-400", dot: "bg-indigo-400" },
};

export default function BrokersPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const connected = brokers.filter((b) => b.status === "connected");

  const triggerSync = (id: string) => {
    setSyncing(id);
    setTimeout(() => setSyncing(null), 2200);
  };

  return (
    <div className="flex flex-col flex-1">
      <Header title="Broker Connections" subtitle="Sync your trades automatically. One source of truth." />

      <main className="flex-1 p-6 space-y-6">

        {/* Summary row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Connected", value: connected.length.toString(), sub: "of " + brokers.length + " brokers", color: "text-emerald-400", icon: CheckCircle2 },
            { label: "Total Trades Synced", value: brokers.reduce((a, b) => a + b.trades, 0).toString(), sub: "all time", color: "text-white", icon: ArrowDownToLine },
            { label: "Live Accounts", value: "$126,880", sub: "combined balance", color: "text-indigo-400", icon: BarChart2 },
            { label: "Last Sync", value: "2 min ago", sub: "cTrader", color: "text-slate-300", icon: RefreshCw },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="w-3.5 h-3.5 text-slate-500" />
                <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">{s.label}</p>
              </div>
              <p className={cn("text-xl font-bold font-display", s.color)}>{s.value}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Broker grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {brokers.map((broker) => {
            const st = statusConfig[broker.status as keyof typeof statusConfig];
            const isSyncing = syncing === broker.id;
            return (
              <div
                key={broker.id}
                className={cn(
                  "glass rounded-2xl p-5 transition-all duration-200 cursor-pointer hover:bg-white/[0.05]",
                  selected === broker.id ? "border-indigo-500/30 bg-indigo-500/[0.04]" : ""
                )}
                onClick={() => setSelected(broker.id === selected ? null : broker.id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-${broker.color}-500/15 flex items-center justify-center text-sm font-bold text-${broker.color}-400`}>
                      {broker.logo}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{broker.name}</p>
                      <p className="text-[11px] text-slate-500">{broker.description}</p>
                    </div>
                  </div>
                  <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border", st.bg, st.color)}>
                    <st.icon className="w-3 h-3" />
                    {st.label}
                  </div>
                </div>

                {broker.status !== "disconnected" && (
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Account</span>
                      <span className="text-slate-300 font-medium">{broker.account}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Balance</span>
                      <span className="text-white font-semibold">{broker.balance}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Last Sync</span>
                      <span className={cn("font-medium", broker.status === "error" ? "text-rose-400" : "text-slate-400")}>{broker.lastSync}</span>
                    </div>
                    {broker.trades > 0 && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Trades Synced</span>
                        <span className="text-indigo-400 font-semibold">{broker.trades}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {broker.status === "connected" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => triggerSync(broker.id)}
                        disabled={isSyncing}
                      >
                        <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
                        {isSyncing ? "Syncing..." : "Sync Now"}
                      </Button>
                      <Button size="sm" variant="ghost" className="w-9 h-9 p-0">
                        <Settings className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="w-9 h-9 p-0 text-rose-400 hover:text-rose-300">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                  {broker.status === "error" && (
                    <Button size="sm" className="flex-1 text-xs">
                      <Link2 className="w-3.5 h-3.5" />
                      Reconnect
                    </Button>
                  )}
                  {broker.status === "disconnected" && (
                    <Button size="sm" className="flex-1 text-xs">
                      <Plus className="w-3.5 h-3.5" />
                      Connect
                    </Button>
                  )}
                </div>

                {/* Sync status indicator */}
                {broker.syncEnabled && (
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.04]">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-slate-600">Auto-sync active · Every 5 min</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sync Log */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-white">Sync Activity Log</h3>
            </div>
            <span className="text-xs text-slate-500">Today · Real-time</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {syncLogs.map((log, i) => {
              const lc = logTypeConfig[log.type as keyof typeof logTypeConfig];
              return (
                <div key={i} className="flex items-start gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2 flex-shrink-0 w-20">
                    <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", lc.dot)} />
                    <span className="text-[11px] text-slate-600 font-mono">{log.time}</span>
                  </div>
                  <div className="flex-shrink-0 w-28">
                    <span className="text-[11px] text-slate-400 font-medium">{log.broker}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={cn("text-[11px] font-semibold", lc.color)}>{log.event}</span>
                    <span className="text-[11px] text-slate-600 ml-2">— {log.detail}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-3 border-t border-white/[0.04]">
            <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
              View full log <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-500/[0.04] border border-indigo-500/15">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-0.5">Bank-grade security</p>
            <p className="text-xs text-slate-500 leading-relaxed">Klartrade uses read-only API tokens. We never store your broker password or have the ability to place trades on your behalf. All tokens are encrypted at rest with AES-256.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
