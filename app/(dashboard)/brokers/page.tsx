"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/dashboard/Header";
import { BrokerConnectModal } from "@/components/dashboard/BrokerConnectModal";
import {
  Link2, RefreshCw, CheckCircle2, AlertCircle, Clock,
  Wifi, WifiOff, ChevronRight, Plus, Trash2, BarChart2, ArrowDownToLine, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BrokerConnection {
  id: string;
  broker: "tradelocker" | "mt5";
  display_name: string;
  account_id: string;
  balance: string;
  server: string;
  environment?: string;
  status: "connected" | "error" | "disconnected";
  last_sync: string | null;
  trades_count: number;
}

const brokerMeta: Record<string, { logo: string; color: string; description: string }> = {
  tradelocker: { logo: "TL", color: "violet", description: "Prop Firm Integration · All instruments" },
  mt5: { logo: "MT", color: "amber", description: "MetaQuotes · FX & Futures" },
};

const statusConfig = {
  connected: { label: "Connected", icon: Wifi, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  error: { label: "Error", icon: AlertCircle, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
  disconnected: { label: "Disconnected", icon: WifiOff, color: "text-slate-500", bg: "bg-white/[0.04] border-white/[0.08]" },
};

function timeAgo(iso: string | null) {
  if (!iso) return "Never";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function BrokersPage() {
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{ id: string; msg: string; ok: boolean } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBroker, setModalBroker] = useState<"tradelocker" | "mt5">("tradelocker");

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/brokers/list");
      const json = await res.json();
      if (res.ok) setConnections(json.connections ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConnections(); }, [fetchConnections]);

  const openModal = (broker: "tradelocker" | "mt5") => {
    setModalBroker(broker);
    setModalOpen(true);
  };

  const handleDisconnect = async (id: string) => {
    setDeleting(id);
    await fetch(`/api/brokers/${id}`, { method: "DELETE" });
    setConnections((prev) => prev.filter((c) => c.id !== id));
    setDeleting(null);
  };

  const triggerSync = async (conn: BrokerConnection) => {
    setSyncing(conn.id);
    setSyncResult(null);
    try {
      if (conn.broker === "mt5") {
        const res  = await fetch("/api/brokers/mt5/sync", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ connectionId: conn.id }),
        });
        const json = await res.json();
        if (res.ok) {
          setSyncResult({
            id:  conn.id,
            msg: `${json.tradesImported} trade${json.tradesImported !== 1 ? "s" : ""} imported · Balance: ${json.balance ?? "—"}`,
            ok:  true,
          });
        } else {
          setSyncResult({ id: conn.id, msg: json.error ?? "Sync failed", ok: false });
        }
      } else {
        // TradeLocker sync not yet implemented
        setSyncResult({ id: conn.id, msg: "TradeLocker auto-sync coming soon", ok: true });
      }
      await fetchConnections();
    } catch (err) {
      setSyncResult({ id: conn.id, msg: String(err), ok: false });
    } finally {
      setSyncing(null);
    }
  };

  const connected = connections.filter((c) => c.status === "connected");
  const totalTrades = connections.reduce((a, c) => a + (c.trades_count ?? 0), 0);

  // Available brokers not yet connected
  const availableBrokers: Array<{ id: "tradelocker" | "mt5"; name: string; logo: string; color: string; description: string }> = [
    { id: "tradelocker", name: "TradeLocker", logo: "TL", color: "violet", description: "Prop Firm Integration · All instruments" },
    { id: "mt5", name: "MetaTrader 5", logo: "MT", color: "amber", description: "MetaQuotes · FX & Futures" },
  ].filter((b) => !connections.find((c) => c.broker === b.id));

  return (
    <div className="flex flex-col flex-1">
      <Header title="Broker Connections" subtitle="Sync your trades automatically. One source of truth." />

      <main className="flex-1 p-6 space-y-6">

        {/* Summary row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Connected", value: connected.length.toString(), sub: "of 2 brokers", color: "text-emerald-400", icon: CheckCircle2 },
            { label: "Total Trades Synced", value: totalTrades.toString(), sub: "all time", color: "text-white", icon: ArrowDownToLine },
            { label: "Live Accounts", value: connected.length > 0 ? connected.map(c => c.balance).filter(b => b !== "—").join(" + ") || "—" : "—", sub: "combined balance", color: "text-indigo-400", icon: BarChart2 },
            { label: "Last Sync", value: connected.length > 0 ? timeAgo(connected[0]?.last_sync) : "—", sub: connected[0]?.display_name ?? "No connections", color: "text-slate-300", icon: RefreshCw },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="w-3.5 h-3.5 text-slate-500" />
                <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">{s.label}</p>
              </div>
              <p className={cn("text-xl font-bold font-display truncate", s.color)}>{s.value}</p>
              <p className="text-[11px] text-slate-600 mt-0.5 truncate">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Connected accounts */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        ) : (
          <>
            {connections.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {connections.map((conn) => {
                  const meta = brokerMeta[conn.broker];
                  const st = statusConfig[conn.status];
                  const isSyncing = syncing === conn.id;
                  const isDeleting = deleting === conn.id;

                  return (
                    <div key={conn.id} className="glass rounded-2xl p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-${meta.color}-500/15 flex items-center justify-center text-sm font-bold text-${meta.color}-400`}>
                            {meta.logo}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{conn.display_name}</p>
                            <p className="text-[11px] text-slate-500">{meta.description}</p>
                          </div>
                        </div>
                        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border", st.bg, st.color)}>
                          <st.icon className="w-3 h-3" />
                          {st.label}
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Account</span>
                          <span className="text-slate-300 font-medium">{conn.account_id || "—"}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Balance</span>
                          <span className="text-white font-semibold">{conn.balance || "—"}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Server</span>
                          <span className="text-slate-400 font-medium truncate max-w-[140px]">{conn.server}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Last Sync</span>
                          <span className="text-slate-400">{timeAgo(conn.last_sync)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => triggerSync(conn)}
                          disabled={isSyncing}
                        >
                          <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
                          {isSyncing ? "Syncing…" : "Sync Now"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-9 h-9 p-0 text-rose-400 hover:text-rose-300"
                          onClick={() => handleDisconnect(conn.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </Button>
                      </div>

                      {syncResult?.id === conn.id && (
                        <p className={cn(
                          "text-[10px] mt-2 px-1",
                          syncResult.ok ? "text-emerald-400" : "text-rose-400"
                        )}>
                          {syncResult.ok ? "✓ " : "✗ "}{syncResult.msg}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.04]">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] text-slate-600">Auto-sync active · Every 5 min</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Available to connect */}
            {availableBrokers.length > 0 && (
              <div className="space-y-3">
                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Available to Connect</p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {availableBrokers.map((b) => (
                    <div key={b.id} className="glass rounded-2xl p-5 opacity-70 hover:opacity-100 transition-opacity">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-${b.color}-500/15 flex items-center justify-center text-sm font-bold text-${b.color}-400`}>
                            {b.logo}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{b.name}</p>
                            <p className="text-[11px] text-slate-500">{b.description}</p>
                          </div>
                        </div>
                        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border", statusConfig.disconnected.bg, statusConfig.disconnected.color)}>
                          <WifiOff className="w-3 h-3" />
                          Not connected
                        </div>
                      </div>
                      <Button size="sm" className="w-full text-xs" onClick={() => openModal(b.id)}>
                        <Plus className="w-3.5 h-3.5" />
                        Connect {b.name}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {connections.length === 0 && availableBrokers.length === 0 && (
              <div className="text-center py-16 text-slate-500 text-sm">All brokers connected.</div>
            )}
          </>
        )}

        {/* Security note */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-500/[0.04] border border-indigo-500/15">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-0.5">Bank-grade security</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Klartrade uses read-only API tokens. We never store your broker password or place trades on your behalf. All tokens are encrypted at rest.
            </p>
          </div>
        </div>

        {/* Sync log placeholder */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-white">Sync Activity Log</h3>
            </div>
            <span className="text-xs text-slate-500">Real-time</span>
          </div>
          {connections.length === 0 ? (
            <div className="px-5 py-8 text-center text-[12px] text-slate-600">
              Connect a broker to start seeing sync activity here.
            </div>
          ) : (
            <div className="px-5 py-4 text-[12px] text-slate-500">
              Sync logs will appear here once trades are imported.
            </div>
          )}
          <div className="px-5 py-3 border-t border-white/[0.04]">
            <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
              View full log <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </main>

      <BrokerConnectModal
        open={modalOpen}
        defaultBroker={modalBroker}
        onClose={() => setModalOpen(false)}
        onConnected={fetchConnections}
      />
    </div>
  );
}
