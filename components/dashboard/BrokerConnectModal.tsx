"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Broker = "tradelocker" | "mt5";

interface Props {
  open: boolean;
  defaultBroker?: Broker;
  onClose: () => void;
  onConnected: () => void;
}

export function BrokerConnectModal({ open, defaultBroker = "tradelocker", onClose, onConnected }: Props) {
  const [broker, setBroker] = useState<Broker>(defaultBroker);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  // TradeLocker fields
  const [tlEmail, setTlEmail] = useState("");
  const [tlPassword, setTlPassword] = useState("");
  const [tlServer, setTlServer] = useState("");
  const [tlEnv, setTlEnv] = useState<"live" | "demo">("live");

  // MT5 fields
  const [mt5Login, setMt5Login] = useState("");
  const [mt5Password, setMt5Password] = useState("");
  const [mt5Server, setMt5Server] = useState("");
  const [mt5Name, setMt5Name] = useState("");

  const reset = () => {
    setResult(null);
    setShowPassword(false);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const endpoint =
        broker === "tradelocker"
          ? "/api/brokers/tradelocker/connect"
          : "/api/brokers/mt5/connect";

      const body =
        broker === "tradelocker"
          ? { email: tlEmail, password: tlPassword, server: tlServer, environment: tlEnv }
          : { login: mt5Login, password: mt5Password, server: mt5Server, accountName: mt5Name };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        setResult({ ok: false, message: json.error ?? "Connection failed" });
      } else {
        setResult({ ok: true, message: "Account connected successfully!" });
        setTimeout(() => {
          onConnected();
          handleClose();
        }, 1200);
      }
    } catch {
      setResult({ ok: false, message: "Network error — please try again" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
          <div className="glass rounded-2xl p-6 shadow-2xl border border-white/[0.08]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-base font-bold text-white">Connect Broker</Dialog.Title>
              <Dialog.Close asChild>
                <button onClick={handleClose} className="w-7 h-7 rounded-lg hover:bg-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* Broker tabs */}
            <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              {(["tradelocker", "mt5"] as Broker[]).map((b) => (
                <button
                  key={b}
                  onClick={() => { setBroker(b); setResult(null); }}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all",
                    broker === b
                      ? "bg-[#03588C] text-white shadow"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {b === "tradelocker" ? "TradeLocker" : "MetaTrader 5"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {broker === "tradelocker" ? (
                <>
                  {/* Environment toggle */}
                  <div className="flex gap-2">
                    {(["live", "demo"] as const).map((env) => (
                      <button
                        key={env}
                        type="button"
                        onClick={() => setTlEnv(env)}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-[12px] font-semibold border transition-all capitalize",
                          tlEnv === env
                            ? "border-[#03588C] bg-[#03588C]/20 text-[#4BA3D4]"
                            : "border-white/[0.08] text-slate-500 hover:text-white"
                        )}
                      >
                        {env}
                      </button>
                    ))}
                  </div>

                  <Field label="Email">
                    <input
                      type="email"
                      required
                      value={tlEmail}
                      onChange={(e) => setTlEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="input-field"
                    />
                  </Field>

                  <Field label="Password">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={tlPassword}
                        onChange={(e) => setTlPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-field pr-10"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </Field>

                  <Field label="Server" hint="e.g. FTMO-Server3, TheFundedTrader-Live">
                    <input
                      type="text"
                      required
                      value={tlServer}
                      onChange={(e) => setTlServer(e.target.value)}
                      placeholder="FTMO-Server3"
                      className="input-field"
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Account Login (number)">
                    <input
                      type="text"
                      required
                      value={mt5Login}
                      onChange={(e) => setMt5Login(e.target.value)}
                      placeholder="12345678"
                      className="input-field"
                    />
                  </Field>

                  <Field label="Password">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={mt5Password}
                        onChange={(e) => setMt5Password(e.target.value)}
                        placeholder="••••••••"
                        className="input-field pr-10"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </Field>

                  <Field label="Server" hint="e.g. ICMarkets-Live, Pepperstone-MT5">
                    <input
                      type="text"
                      required
                      value={mt5Server}
                      onChange={(e) => setMt5Server(e.target.value)}
                      placeholder="ICMarkets-Live04"
                      className="input-field"
                    />
                  </Field>

                  <Field label="Account name (optional)">
                    <input
                      type="text"
                      value={mt5Name}
                      onChange={(e) => setMt5Name(e.target.value)}
                      placeholder="My Live Account"
                      className="input-field"
                    />
                  </Field>
                </>
              )}

              {/* Result */}
              {result && (
                <div className={cn(
                  "flex items-center gap-2 p-3 rounded-xl text-[13px] font-medium",
                  result.ok ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                )}>
                  {result.ok ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  {result.message}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Connecting…</>
                ) : (
                  "Connect Account"
                )}
              </Button>

              <p className="text-[11px] text-slate-600 text-center">
                Your credentials are sent over HTTPS and never logged. Only tokens are stored.
              </p>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-slate-300">{label}</label>
      {hint && <p className="text-[11px] text-slate-600 -mt-1">{hint}</p>}
      {children}
    </div>
  );
}
