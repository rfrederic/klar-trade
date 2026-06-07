"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import {
  User, Bell, Shield, CreditCard, HelpCircle, Info, Plug, SlidersHorizontal,
  Camera, Eye, EyeOff, Check, ChevronRight, Zap, Globe, Download, Trash2,
  LogOut, RefreshCw, Plus, AlertTriangle, Lock, Smartphone, Key,
  CheckCircle, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "account", label: "Account", icon: User },
  { id: "routine", label: "Pre-Market Routine", icon: Bell },
  { id: "trading", label: "Trading Preferences", icon: SlidersHorizontal },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "privacy", label: "Data & Privacy", icon: Shield },
  { id: "security", label: "Security", icon: Lock },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "support", label: "Support", icon: HelpCircle },
  { id: "about", label: "About", icon: Info },
] as const;

type TabId = (typeof tabs)[number]["id"];

const BROKER_REGISTRY: Record<string, { name: string; logo: string; color: string }> = {
  mt5: { name: "MetaTrader 5", logo: "MT", color: "#0099CC" },
  tradelocker: { name: "TradeLocker", logo: "TL", color: "#22C55E" },
  ctrader: { name: "cTrader", logo: "CT", color: "#03588C" },
  tradovate: { name: "Tradovate", logo: "TV", color: "#9B59B6" },
  interactive_brokers: { name: "Interactive Brokers", logo: "IB", color: "#E74C3C" },
  ninjatrader: { name: "NinjaTrader", logo: "NT", color: "#F39C12" },
  alpaca: { name: "Alpaca", logo: "AL", color: "#27AE60" },
};

const routineSteps = [
  { id: 1, label: "Check economic calendar", enabled: true },
  { id: 2, label: "Review HTF bias (Weekly/Daily)", enabled: true },
  { id: 3, label: "Log pre-market mental state", enabled: true },
  { id: 4, label: "Set daily risk limit", enabled: true },
  { id: 5, label: "Write trading intention", enabled: false },
  { id: 6, label: "Review yesterday's trades", enabled: true },
  { id: 7, label: "Run Refuge session", enabled: false },
];

const guardrails = [
  { id: "daily_loss", label: "Daily Loss Limit", desc: "Stop trading after losing this amount", value: "500", unit: "$", enabled: true },
  { id: "max_trades", label: "Max Trades per Day", desc: "Prevent overtrading", value: "5", unit: "trades", enabled: true },
  { id: "news_block", label: "News Event Block", desc: "Block trading 15min before/after high-impact events", value: "", unit: "", enabled: true },
  { id: "revenge_timer", label: "Revenge Trade Cooldown", desc: "Mandatory pause after a losing trade", value: "15", unit: "min", enabled: false },
  { id: "profit_protect", label: "Profit Protection", desc: "Stop trading after hitting daily profit target", value: "1000", unit: "$", enabled: false },
];

interface BrokerConnection {
  id: string;
  broker: string;
  display_name?: string;
  account_id?: string;
  server?: string;
  status: string;
  last_sync?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("account");

  // Profile state
  const [profile, setProfile] = useState({ email: "", full_name: "", username: "", timezone: "(GMT+0) London", experience: "Intermediate" });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);

  // Security state
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Integrations state
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);

  // UI state
  const [routineItems, setRoutineItems] = useState(routineSteps);
  const [guardrailItems, setGuardrailItems] = useState(guardrails);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/settings/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.email) {
          setProfile({
            email: data.email,
            full_name: data.user_metadata?.full_name ?? "",
            username: data.user_metadata?.username ?? "",
            timezone: data.user_metadata?.timezone ?? "(GMT+0) London",
            experience: data.user_metadata?.experience ?? "Intermediate",
          });
        }
      })
      .finally(() => setProfileLoading(false));
  }, []);

  const loadConnections = useCallback(() => {
    setConnectionsLoading(true);
    fetch("/api/brokers/list")
      .then((r) => r.json())
      .then((data) => setConnections(data.connections ?? []))
      .finally(() => setConnectionsLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "integrations") loadConnections();
  }, [activeTab, loadConnections]);

  const initials = profile.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : profile.email?.slice(0, 2).toUpperCase() ?? "?";

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    const res = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: profile.full_name,
        username: profile.username,
        timezone: profile.timezone,
        experience: profile.experience,
      }),
    });
    setProfileSaving(false);
    if (res.ok) {
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 2000);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwordForm.new.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    setPasswordLoading(true);
    const res = await fetch("/api/settings/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_password: passwordForm.current, new_password: passwordForm.new }),
    });
    const data = await res.json();
    setPasswordLoading(false);
    if (res.ok) {
      setPasswordSuccess(true);
      setPasswordForm({ current: "", new: "", confirm: "" });
    } else {
      setPasswordError(data.error ?? "Failed to update password");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const toggleRoutineStep = (id: number) => {
    setRoutineItems((items) => items.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item));
  };

  const toggleGuardrail = (id: string) => {
    setGuardrailItems((items) => items.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item));
  };

  const allBrokers = Object.entries(BROKER_REGISTRY).map(([id, info]) => {
    const conn = connections.find((c) => c.broker === id);
    return {
      id,
      ...info,
      status: conn?.status ?? "disconnected",
      account: conn?.account_id ?? "—",
      sync: conn?.last_sync ? new Date(conn.last_sync).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
      connectionId: conn?.id,
    };
  });

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header
        title="Settings"
        subtitle="Manage your account, integrations, and trading preferences."
        action={
          activeTab === "account" ? (
            <Button size="sm" onClick={handleSaveProfile} disabled={profileSaving}>
              {profileSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : savedIndicator ? <><CheckCircle className="w-3.5 h-3.5" /> Saved!</> : "Save Changes"}
            </Button>
          ) : undefined
        }
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left nav */}
        <div className="w-52 flex-shrink-0 border-r border-white/[0.05] flex flex-col bg-[#06080f] p-3 space-y-0.5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left",
                activeTab === id
                  ? "bg-[#03588C] text-white"
                  : "text-[#6B7280] hover:text-[#F2F0EB] hover:bg-white/[0.04]")}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl space-y-6">

            {/* ACCOUNT */}
            {activeTab === "account" && (
              <>
                <div>
                  <h2 className="text-base font-bold text-[#F2F0EB] mb-4">Account</h2>
                  <div className="glass rounded-2xl p-6 space-y-5">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-[#03588C]/30 flex items-center justify-center text-xl font-bold text-white">
                          {profileLoading ? <Loader2 className="w-5 h-5 animate-spin text-[#6B7280]" /> : initials}
                        </div>
                        <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#03588C] flex items-center justify-center">
                          <Camera className="w-3 h-3 text-white" />
                        </button>
                      </div>
                      <div>
                        <p className="font-semibold text-[#F2F0EB]">{profile.full_name || profile.email}</p>
                        <p className="text-sm text-[#6B7280]">{profile.email}</p>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D9CA82]/10 text-[#D9CA82] border border-[#D9CA82]/20">Pro Plan</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Full Name</label>
                        <input
                          value={profile.full_name}
                          onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                          placeholder="Your full name"
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] focus:outline-none focus:border-[#03588C]/50"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Username</label>
                        <input
                          value={profile.username}
                          onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
                          placeholder="@username"
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] focus:outline-none focus:border-[#03588C]/50"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Email</label>
                        <input
                          value={profile.email}
                          readOnly
                          className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-2.5 text-sm text-[#6B7280] cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Timezone</label>
                      <select
                        value={profile.timezone}
                        onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] focus:outline-none"
                      >
                        {["(GMT-5) Eastern Time", "(GMT-6) Central Time", "(GMT-8) Pacific Time", "(GMT+0) London", "(GMT+1) Paris", "(GMT+2) Cairo", "(GMT+8) Singapore", "(GMT+9) Tokyo"].map((tz) => (
                          <option key={tz}>{tz}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Trading Experience</label>
                      <div className="flex gap-2">
                        {["Beginner", "Intermediate", "Advanced", "Professional"].map((level) => (
                          <button
                            key={level}
                            onClick={() => setProfile((p) => ({ ...p, experience: level }))}
                            className={cn("px-3 py-2 rounded-xl text-xs font-medium border transition-all",
                              profile.experience === level
                                ? "bg-[#03588C] text-white border-[#03588C]"
                                : "bg-white/[0.04] border-white/[0.08] text-[#6B7280] hover:text-[#F2F0EB]")}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-5 border border-red-500/10">
                  <h3 className="text-sm font-bold text-red-400 mb-1">Danger Zone</h3>
                  <p className="text-[11px] text-[#6B7280] mb-3">These actions are irreversible. Please be certain before proceeding.</p>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-[#6B7280] hover:text-[#F2F0EB] transition-all flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" /> Export My Data
                    </button>
                    <button className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5" /> Delete Account
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* PRE-MARKET ROUTINE */}
            {activeTab === "routine" && (
              <>
                <div>
                  <h2 className="text-base font-bold text-[#F2F0EB] mb-1">Pre-Market Routine</h2>
                  <p className="text-sm text-[#6B7280] mb-4">Configure the steps shown in your dashboard before each session.</p>
                  <div className="glass rounded-2xl overflow-hidden">
                    {routineItems.map((item, idx) => (
                      <div key={item.id} className={cn("flex items-center gap-4 px-5 py-4", idx > 0 && "border-t border-white/[0.04]")}>
                        <div className="w-6 h-6 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[10px] text-[#6B7280]">
                          {idx + 1}
                        </div>
                        <span className="flex-1 text-sm text-[#F2F0EB]">{item.label}</span>
                        <button
                          onClick={() => toggleRoutineStep(item.id)}
                          className={cn("w-10 h-5 rounded-full transition-all relative flex-shrink-0",
                            item.enabled ? "bg-[#03588C]" : "bg-white/[0.08]")}
                        >
                          <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                            item.enabled ? "left-[22px]" : "left-0.5")} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className="mt-3 flex items-center gap-1.5 text-xs text-[#4BA3D4] hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Custom Step
                  </button>
                </div>

                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-[#F2F0EB] mb-4">Routine Timing</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Start Reminder</label>
                      <input type="time" defaultValue="08:00" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Trading Start</label>
                      <input type="time" defaultValue="09:30" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] focus:outline-none" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TRADING PREFERENCES */}
            {activeTab === "trading" && (
              <>
                <div>
                  <h2 className="text-base font-bold text-[#F2F0EB] mb-1">Trading Guardrails</h2>
                  <p className="text-sm text-[#6B7280] mb-4">Automated rules that protect your account from emotional decisions.</p>
                  <div className="space-y-3">
                    {guardrailItems.map((g) => (
                      <div key={g.id} className="glass rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[#F2F0EB]">{g.label}</p>
                            <p className="text-[11px] text-[#6B7280] mt-0.5">{g.desc}</p>
                          </div>
                          <button
                            onClick={() => toggleGuardrail(g.id)}
                            className={cn("w-10 h-5 rounded-full transition-all relative flex-shrink-0 ml-4",
                              g.enabled ? "bg-[#03588C]" : "bg-white/[0.08]")}
                          >
                            <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                              g.enabled ? "left-[22px]" : "left-0.5")} />
                          </button>
                        </div>
                        {g.value && g.enabled && (
                          <div className="mt-3 flex items-center gap-2">
                            <input
                              defaultValue={g.value}
                              type="number"
                              className="w-28 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-[#F2F0EB] font-mono-nums focus:outline-none focus:border-[#03588C]/50"
                            />
                            <span className="text-sm text-[#6B7280]">{g.unit}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-[#F2F0EB] mb-4">Default Risk Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Default Risk per Trade (%)", value: "1.0" },
                      { label: "Max Risk per Trade (%)", value: "2.0" },
                      { label: "Default R:R Ratio", value: "2.0" },
                      { label: "Account Size ($)", value: "50,000" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">{label}</label>
                        <input
                          defaultValue={value}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] font-mono-nums focus:outline-none focus:border-[#03588C]/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* INTEGRATIONS */}
            {activeTab === "integrations" && (
              <>
                <div>
                  <h2 className="text-base font-bold text-[#F2F0EB] mb-1">Connected Brokers</h2>
                  <p className="text-sm text-[#6B7280] mb-4">Link your broker accounts to auto-import trades and sync data.</p>
                  {connectionsLoading ? (
                    <div className="flex items-center justify-center h-24">
                      <Loader2 className="w-5 h-5 animate-spin text-[#6B7280]" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {allBrokers.map((broker) => (
                        <div key={broker.id} className="glass rounded-2xl px-4 py-3 flex items-center gap-4">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: broker.status === "connected" ? broker.color : "#1a1d26" }}
                          >
                            {broker.logo}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#F2F0EB]">{broker.name}</p>
                            {broker.status === "connected" && (
                              <p className="text-[10px] text-[#6B7280]">{broker.account} · Last sync: {broker.sync}</p>
                            )}
                            {broker.status === "error" && (
                              <p className="text-[10px] text-red-400">Connection error</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={cn("flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full",
                              broker.status === "connected" ? "bg-[#22C55E]/10 text-[#22C55E]" :
                              broker.status === "error" ? "bg-red-500/10 text-red-400" :
                              "bg-white/[0.05] text-[#6B7280]")}>
                              <div className={cn("w-1.5 h-1.5 rounded-full",
                                broker.status === "connected" ? "bg-[#22C55E]" :
                                broker.status === "error" ? "bg-red-500" :
                                "bg-[#6B7280]")} />
                              {broker.status === "connected" ? "Connected" : broker.status === "error" ? "Error" : "Disconnected"}
                            </div>
                            {broker.status === "connected" ? (
                              <button onClick={loadConnections} className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-[#6B7280] hover:text-[#F2F0EB] transition-all">
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => router.push("/brokers")}
                                className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-[#03588C]/15 text-[#4BA3D4] border border-[#03588C]/25 hover:bg-[#03588C]/25 transition-all"
                              >
                                Connect
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-[#F2F0EB] mb-1">Import Trades</h3>
                  <p className="text-[11px] text-[#6B7280] mb-4">Manually import your trade history from a CSV file.</p>
                  <div className="border-2 border-dashed border-white/[0.08] rounded-xl p-6 text-center hover:border-[#03588C]/40 transition-all cursor-pointer">
                    <Download className="w-8 h-8 text-[#6B7280] mx-auto mb-2" />
                    <p className="text-sm text-[#6B7280] mb-1">Drop your CSV here or click to browse</p>
                    <p className="text-[11px] text-[#6B7280]/60">Supports cTrader, MT4/5, Tradovate, TDA formats</p>
                  </div>
                </div>
              </>
            )}

            {/* PRIVACY */}
            {activeTab === "privacy" && (
              <>
                <div>
                  <h2 className="text-base font-bold text-[#F2F0EB] mb-1">Data &amp; Privacy</h2>
                  <p className="text-sm text-[#6B7280] mb-4">Control how your data is used and stored.</p>
                  <div className="space-y-3">
                    {[
                      { label: "Analytics & Performance Tracking", desc: "Help us improve KlarTrade with anonymized usage data", enabled: true },
                      { label: "AI Training Consent", desc: "Allow your anonymized journal data to improve KlarAI recommendations", enabled: false },
                      { label: "Email Notifications", desc: "Receive summaries, tips, and product updates", enabled: true },
                      { label: "Public Profile", desc: "Allow your username and stats to appear on leaderboards", enabled: false },
                    ].map((item) => (
                      <div key={item.label} className="glass rounded-2xl p-4 flex items-center gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#F2F0EB]">{item.label}</p>
                          <p className="text-[11px] text-[#6B7280] mt-0.5">{item.desc}</p>
                        </div>
                        <div className={cn("w-10 h-5 rounded-full relative flex-shrink-0 cursor-pointer transition-all",
                          item.enabled ? "bg-[#03588C]" : "bg-white/[0.08]")}>
                          <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                            item.enabled ? "left-[22px]" : "left-0.5")} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-[#F2F0EB] mb-3">Data Retention</h3>
                  <div className="space-y-2 text-sm text-[#6B7280]">
                    {[
                      { label: "Journal entries", value: "Kept indefinitely" },
                      { label: "Trade data", value: "7 years (regulatory)" },
                      { label: "Session recordings", value: "90 days" },
                    ].map((r) => (
                      <div key={r.label} className="flex justify-between">
                        <span>{r.label}</span>
                        <span className="text-[#F2F0EB]">{r.value}</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 flex items-center gap-1.5 text-xs text-[#4BA3D4] hover:text-white transition-colors">
                    <Download className="w-3.5 h-3.5" /> Download All My Data
                  </button>
                </div>
              </>
            )}

            {/* SECURITY */}
            {activeTab === "security" && (
              <>
                <div>
                  <h2 className="text-base font-bold text-[#F2F0EB] mb-4">Security</h2>
                  <div className="glass rounded-2xl p-5 space-y-4">
                    <div>
                      <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))}
                          placeholder="••••••••••••"
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] focus:outline-none focus:border-[#03588C]/50 pr-10"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#F2F0EB] transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm((f) => ({ ...f, new: e.target.value }))}
                        placeholder="••••••••••••"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] focus:outline-none focus:border-[#03588C]/50"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-1.5">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))}
                        placeholder="••••••••••••"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] focus:outline-none focus:border-[#03588C]/50"
                      />
                    </div>
                    {passwordError && (
                      <p className="text-xs text-red-400">{passwordError}</p>
                    )}
                    {passwordSuccess && (
                      <div className="flex items-center gap-2 text-xs text-[#22C55E]">
                        <CheckCircle className="w-3.5 h-3.5" /> Password updated successfully
                      </div>
                    )}
                    <button
                      onClick={handleChangePassword}
                      disabled={passwordLoading || !passwordForm.current || !passwordForm.new}
                      className="px-4 py-2 rounded-xl bg-[#03588C] text-white text-xs font-semibold hover:bg-[#024a77] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {passwordLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-[#F2F0EB]">Two-Factor Authentication</h3>
                      <p className="text-[11px] text-[#6B7280] mt-0.5">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      onClick={() => setTwoFAEnabled(!twoFAEnabled)}
                      className={cn("w-10 h-5 rounded-full relative transition-all",
                        twoFAEnabled ? "bg-[#22C55E]" : "bg-white/[0.08]")}
                    >
                      <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                        twoFAEnabled ? "left-[22px]" : "left-0.5")} />
                    </button>
                  </div>
                  {twoFAEnabled && (
                    <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                      <p className="text-[11px] text-[#22C55E]">2FA is active. Your account is protected.</p>
                    </div>
                  )}
                </div>

                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-[#F2F0EB] mb-3">Active Sessions</h3>
                  <div className="space-y-2">
                    {[
                      { device: "MacBook Pro — Chrome", location: "Paris, FR", time: "Now (current)", current: true },
                    ].map((session) => (
                      <div key={session.device} className="flex items-center gap-3 py-2">
                        <Smartphone className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#F2F0EB] truncate">{session.device}</p>
                          <p className="text-[10px] text-[#6B7280]">{session.location} · {session.time}</p>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E]">Current</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* BILLING */}
            {activeTab === "billing" && (
              <>
                <div>
                  <h2 className="text-base font-bold text-[#F2F0EB] mb-4">Billing</h2>
                  <div className="glass rounded-2xl p-5 border border-[#D9CA82]/20">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[10px] font-semibold text-[#D9CA82] uppercase tracking-wide mb-0.5">Current Plan</p>
                        <p className="text-xl font-bold text-[#F2F0EB]">KlarTrade Pro</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#F2F0EB] font-mono-nums">$49<span className="text-sm text-[#6B7280]">/mo</span></p>
                        <p className="text-[11px] text-[#6B7280]">Renews June 7, 2026</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 py-2 rounded-xl bg-[#03588C]/15 border border-[#03588C]/25 text-xs font-semibold text-[#4BA3D4] hover:bg-[#03588C]/25 transition-all">
                        Upgrade to Elite
                      </button>
                      <button className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-[#6B7280] hover:text-[#F2F0EB] transition-all">
                        Cancel Plan
                      </button>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-[#F2F0EB] mb-3">Billing History</h3>
                  <div className="space-y-2">
                    {[
                      { date: "May 7, 2026", amount: "$49.00" },
                      { date: "Apr 7, 2026", amount: "$49.00" },
                      { date: "Mar 7, 2026", amount: "$49.00" },
                    ].map((inv) => (
                      <div key={inv.date} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                          <div>
                            <p className="text-xs text-[#F2F0EB]">KlarTrade Pro</p>
                            <p className="text-[10px] text-[#6B7280]">{inv.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-[#F2F0EB] font-mono-nums">{inv.amount}</span>
                          <button className="text-[11px] text-[#4BA3D4] hover:text-white transition-colors">PDF</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* SUPPORT */}
            {activeTab === "support" && (
              <>
                <div>
                  <h2 className="text-base font-bold text-[#F2F0EB] mb-4">Support</h2>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { icon: <Globe className="w-5 h-5" />, label: "Help Center", desc: "Browse articles and guides" },
                      { icon: <Zap className="w-5 h-5" />, label: "Live Chat", desc: "Chat with our team" },
                      { icon: <AlertTriangle className="w-5 h-5" />, label: "Report a Bug", desc: "Something not working?" },
                      { icon: <Key className="w-5 h-5" />, label: "Feature Request", desc: "Suggest an improvement" },
                    ].map(({ icon, label, desc }) => (
                      <button key={label} className="glass rounded-2xl p-4 text-left hover:bg-white/[0.05] transition-all">
                        <div className="w-9 h-9 rounded-xl bg-[#03588C]/15 flex items-center justify-center text-[#4BA3D4] mb-3">
                          {icon}
                        </div>
                        <p className="text-sm font-semibold text-[#F2F0EB] mb-0.5">{label}</p>
                        <p className="text-[11px] text-[#6B7280]">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-[#F2F0EB] mb-3">Send us a message</h3>
                  <div className="space-y-3">
                    <select className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] focus:outline-none">
                      <option>General Question</option>
                      <option>Billing Issue</option>
                      <option>Technical Bug</option>
                      <option>Feature Request</option>
                    </select>
                    <textarea
                      placeholder="Describe your issue or question..."
                      rows={4}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] placeholder-[#6B7280]/60 focus:outline-none focus:border-[#03588C]/50 resize-none"
                    />
                    <button className="px-5 py-2.5 rounded-xl bg-[#03588C] text-white text-sm font-semibold hover:bg-[#024a77] transition-all">
                      Submit
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ABOUT */}
            {activeTab === "about" && (
              <>
                <div>
                  <h2 className="text-base font-bold text-[#F2F0EB] mb-4">About KlarTrade</h2>
                  <div className="glass rounded-2xl p-6 text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#03588C]/20 border border-[#03588C]/30 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-[#4BA3D4]">K</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#F2F0EB] mb-0.5">KlarTrade</h3>
                    <p className="text-sm text-[#6B7280] mb-1">Trade with clarity. Execute with discipline.</p>
                    <p className="text-[11px] text-[#6B7280]/60">Version 1.0.0 · Build 2026.06.05</p>
                  </div>
                  <div className="space-y-2">
                    {["Terms of Service", "Privacy Policy", "Refund Policy", "Open Source Licenses"].map((label) => (
                      <button key={label} className="w-full flex items-center justify-between px-4 py-3 glass rounded-xl hover:bg-white/[0.05] transition-all">
                        <span className="text-sm text-[#F2F0EB]">{label}</span>
                        <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-center text-[11px] text-[#6B7280]">© 2026 KlarTrade. All rights reserved. Not financial advice.</p>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
