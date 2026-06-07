"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import {
  User, Bell, Shield, CreditCard, HelpCircle, Info, Plug, SlidersHorizontal,
  Camera, Eye, EyeOff, Check, ChevronRight, Zap, Globe, Download, Trash2,
  RefreshCw, Plus, AlertTriangle, Lock, Smartphone, Key,
  CheckCircle, Loader2, X, Upload, Send, MessageSquare, BookOpen,
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

const HELP_ARTICLES: { title: string; body: string }[] = [
  {
    title: "How to log a trade manually",
    body: "Navigate to the Journal page from the sidebar and click the 'Add Manual' button in the top-right corner. Fill in your symbol, direction (BUY/SELL), entry and exit prices, lot size, and notes. Set your emotion for the trade to build emotional-awareness data over time. Click Save — your trade will appear in the calendar and be included in all analytics.",
  },
  {
    title: "How to connect your broker",
    body: "Go to Settings → Integrations and find your broker in the list. Click Connect and enter your account credentials or API key as prompted. Once connected, KlarTrade will automatically sync your closed trades in the background. You can manually refresh the sync at any time from the Journal page using the Sync Now button.",
  },
  {
    title: "How to use Refuge",
    body: "Refuge is KlarTrade's mental wellness module built for traders. Navigate to Refuge from the sidebar and choose a biome that matches your current emotional state. Follow the guided session — it typically takes 5–10 minutes. Use Refuge before your trading session to clear your mind, or after a tough loss to reset before continuing.",
  },
  {
    title: "How to import trades via CSV",
    body: "On the Journal page, click the Import button in the top-right area. Drag and drop your CSV or PDF broker statement into the drop zone, or click to browse your files. KlarTrade supports MT4/MT5, cTrader, TradeLocker, and most standard broker CSV formats. If your import fails, try exporting a 'closed positions' or 'trade history' report from your broker's platform.",
  },
  {
    title: "How to read your analytics",
    body: "The Analytics page shows performance metrics for the selected time period — choose from Today, 7D, 30D, 90D, YTD, or ALL. Use the tabs to switch between Overview, Win Rate, Drawdown, and Emotion breakdowns. Each chart is interactive; hover for exact values. The Emotion vs Performance chart reveals which emotional states correlate with your best and worst trades.",
  },
];

const SUPPORT_SYSTEM_PROMPT = "You are KlarTrade support. Help the user with questions about the KlarTrade app. Be concise and friendly.";

const PRIVACY_ITEMS: { key: "analytics_consent" | "ai_training_consent" | "email_notifications" | "public_profile"; label: string; desc: string }[] = [
  { key: "analytics_consent",   label: "Analytics & Performance Tracking", desc: "Help us improve KlarTrade with anonymized usage data" },
  { key: "ai_training_consent", label: "AI Training Consent",              desc: "Allow your anonymized journal data to improve KlarAI recommendations" },
  { key: "email_notifications", label: "Email Notifications",              desc: "Receive summaries, tips, and product updates" },
  { key: "public_profile",      label: "Public Profile",                   desc: "Allow your username and stats to appear on leaderboards" },
];

type LegalSection = { heading: string; body: string };
const LEGAL_CONTENT: Record<string, { title: string; effectiveDate?: string; sections: LegalSection[] }> = {
  "Terms of Service": {
    title: "Terms of Service",
    effectiveDate: "June 2026",
    sections: [
      { heading: "1. Service Description", body: "KlarTrade is a trading journal and analytics platform designed to help traders track their performance, review their habits, and improve their discipline. The service is provided on a subscription basis." },
      { heading: "2. User Responsibilities", body: "You are responsible for maintaining the security of your account credentials, providing accurate information, and using the platform in compliance with applicable laws. You must not share your account or use the service for any unlawful purpose." },
      { heading: "3. No Financial Advice", body: "KlarTrade provides tools for self-analysis and journaling only. Nothing on this platform constitutes financial advice, investment recommendations, or trading signals. All trading decisions are solely your own responsibility." },
      { heading: "4. Subscription Terms", body: "Access to KlarTrade is billed monthly. Your subscription renews automatically each billing cycle until cancelled. You may cancel at any time; cancellation takes effect at the end of the current billing period." },
      { heading: "5. Cancellation Policy", body: "You may cancel your subscription at any time from the Billing settings page. Upon cancellation, you retain access to the platform until the end of your paid period. After that, your account will be downgraded to a free tier or deactivated." },
      { heading: "6. Changes to Terms", body: "We may update these terms from time to time. Continued use of KlarTrade after changes constitutes acceptance of the new terms. We will notify users of material changes via email." },
    ],
  },
  "Privacy Policy": {
    title: "Privacy Policy",
    effectiveDate: "June 2026",
    sections: [
      { heading: "1. Data We Collect", body: "We collect your email address, trade data you manually log or import, journal entries, Refuge session data, usage analytics, and any other information you voluntarily provide through the platform." },
      { heading: "2. How We Use Your Data", body: "Your data is used to provide and improve the KlarTrade service, generate personalised analytics and AI coaching insights, and send relevant product updates if you have opted in to email notifications." },
      { heading: "3. We Never Sell Your Data", body: "We do not sell, rent, or share your personal data with third parties for advertising or commercial purposes. Your trading data is yours and is never disclosed to external parties without your explicit consent." },
      { heading: "4. Data Storage & Security", body: "All data is stored securely on Supabase, which uses industry-standard encryption at rest and in transit. Access is restricted by row-level security policies that ensure users can only access their own data." },
      { heading: "5. GDPR & Your Rights", body: "If you are located in the European Economic Area, you have the right to access, correct, or delete your data at any time. You can download a full copy of your data from Settings → Data & Privacy, or contact support to request deletion of your account and all associated data." },
    ],
  },
  "Refund Policy": {
    title: "Refund Policy",
    effectiveDate: "June 2026",
    sections: [
      { heading: "All Sales Are Final", body: "All subscription payments are non-refundable. Once a billing cycle has been charged, that payment will not be refunded under any circumstances except as required by applicable law." },
      { heading: "No Refunds on Monthly Subscriptions", body: "Monthly subscription fees are charged at the start of each billing cycle and cover access for that full period. Partial-month refunds are not available, regardless of how much of the period you used." },
      { heading: "Free Trial Available", body: "We offer a 10-day free trial before any payment is required. We strongly encourage you to evaluate all features during the trial period to ensure KlarTrade meets your needs before committing to a subscription." },
      { heading: "Cancel Anytime", body: "You may cancel your subscription at any time. Cancellation stops all future charges immediately, but you will retain access to the platform for the remainder of your current paid billing period." },
      { heading: "Exceptional Circumstances", body: "In exceptional circumstances — such as a billing error, duplicate charge, or platform unavailability exceeding 72 hours — please contact support and we will review your case on an individual basis." },
    ],
  },
  "Open Source Licenses": {
    title: "Open Source Licenses",
    sections: [
      { heading: "Next.js — MIT License", body: "Copyright (c) Vercel, Inc. Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the software without restriction." },
      { heading: "React — MIT License", body: "Copyright (c) Meta Platforms, Inc. and affiliates. Permission is hereby granted, free of charge, to any person obtaining a copy of this software." },
      { heading: "Supabase — Apache License 2.0", body: "Copyright (c) Supabase, Inc. Licensed under the Apache License, Version 2.0. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0." },
      { heading: "Tailwind CSS — MIT License", body: "Copyright (c) Tailwind Labs, Inc. Permission is hereby granted, free of charge, to any person obtaining a copy of this software." },
      { heading: "Framer Motion — MIT License", body: "Copyright (c) Framer B.V. Permission is hereby granted, free of charge, to any person obtaining a copy of this software." },
      { heading: "Recharts — MIT License", body: "Copyright (c) Recharts Group. Permission is hereby granted, free of charge, to any person obtaining a copy of this software." },
      { heading: "Lucide — ISC License", body: "Copyright (c) Lucide Contributors. Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies." },
    ],
  },
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [addingRoutineStep, setAddingRoutineStep] = useState(false);
  const [newRoutineStepText, setNewRoutineStepText] = useState("");
  const routineInputRef = useRef<HTMLInputElement>(null);

  // Integrations — import drop zone
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importDragging, setImportDragging] = useState(false);
  const [importUploading, setImportUploading] = useState(false);
  const [importResult, setImportResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Support modals
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [helpArticle, setHelpArticle] = useState<number | null>(null);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Support form
  const [supportType, setSupportType] = useState("General Question");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportResult, setSupportResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const supportFormRef = useRef<HTMLDivElement>(null);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  // Privacy state
  const [privacySettings, setPrivacySettings] = useState({
    analytics_consent:   true,
    ai_training_consent: false,
    email_notifications: true,
    public_profile:      false,
  });
  const [privacySavedKey, setPrivacySavedKey] = useState<string | null>(null);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [dataDownloading, setDataDownloading] = useState(false);
  const [legalModal, setLegalModal] = useState<string | null>(null);

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
          if (data.avatar_url) setAvatarUrl(data.avatar_url);
        }
      })
      .finally(() => setProfileLoading(false));
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setAvatarError(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/settings/avatar", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok) {
        setAvatarUrl(data.avatar_url);
        // Notify the Header (same page, same window) to update immediately
        window.dispatchEvent(
          new CustomEvent("avatar-updated", { detail: { avatar_url: data.avatar_url } })
        );
      } else {
        setAvatarError(data.error ?? "Upload failed");
      }
    } catch {
      setAvatarError("Upload failed — please try again");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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

  const toggleRoutineStep = (id: number) => {
    setRoutineItems((items) => items.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item));
  };

  useEffect(() => {
    if (addingRoutineStep) routineInputRef.current?.focus();
  }, [addingRoutineStep]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (activeTab !== "privacy") return;
    setPrivacyLoading(true);
    fetch("/api/settings/privacy")
      .then(r => r.json())
      .then(data => { if (!data.error) setPrivacySettings(data); })
      .finally(() => setPrivacyLoading(false));
  }, [activeTab]);

  const commitRoutineStep = () => {
    const label = newRoutineStepText.trim();
    if (!label) { setAddingRoutineStep(false); setNewRoutineStepText(""); return; }
    const newId = Date.now();
    setRoutineItems(items => [...items, { id: newId, label, enabled: true }]);
    setNewRoutineStepText("");
    setAddingRoutineStep(false);
  };

  const removeRoutineStep = (id: number) => {
    setRoutineItems(items => items.filter(item => item.id !== id));
  };

  const openSupportForm = (type: string) => {
    setSupportType(type);
    setTimeout(() => supportFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const submitSupportTicket = async () => {
    if (!supportMessage.trim()) return;
    setSupportSubmitting(true);
    setSupportResult(null);
    try {
      const res = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: supportType, message: supportMessage }),
      });
      if (res.ok) {
        setSupportResult({ ok: true, msg: "Message sent — we'll get back to you soon." });
        setSupportMessage("");
      } else {
        const data = await res.json();
        setSupportResult({ ok: false, msg: data.error ?? "Failed to send message" });
      }
    } catch {
      setSupportResult({ ok: false, msg: "Failed to send — please try again" });
    } finally {
      setSupportSubmitting(false);
    }
  };

  const openLiveChat = () => {
    if (chatMessages.length === 0) {
      setChatMessages([{ role: "assistant", content: "Hi! I'm KlarTrade Support. How can I help you today?" }]);
    }
    setShowLiveChat(true);
  };

  const sendChatMessage = async () => {
    const content = chatInput.trim();
    if (!content || chatLoading) return;
    const next = [...chatMessages, { role: "user" as const, content }];
    setChatMessages(next);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/klar-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, systemOverride: SUPPORT_SYSTEM_PROMPT }),
      });
      const data = await res.json();
      const reply = res.ok ? data.content : (data.error ?? "Failed to get response");
      setChatMessages(m => [...m, { role: "assistant", content: reply }]);
    } catch {
      setChatMessages(m => [...m, { role: "assistant", content: "Sorry, I couldn't connect. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const acceptImportFile = async (f: File) => {
    const n = f.name.toLowerCase();
    if (!n.endsWith(".csv") && !n.endsWith(".pdf")) {
      setImportResult({ ok: false, msg: "Only .csv and .pdf files are supported" });
      return;
    }
    setImportFile(f);
    setImportResult(null);
    setImportUploading(true);
    const form = new FormData();
    form.append("file", f);
    try {
      const res  = await fetch("/api/journal/import", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok) {
        const count = data.imported as number;
        setImportResult({ ok: true, msg: `${count} trade${count !== 1 ? "s" : ""} imported` });
      } else {
        setImportResult({ ok: false, msg: data.error ?? "Import failed" });
      }
    } catch {
      setImportResult({ ok: false, msg: "Upload failed — please try again" });
    } finally {
      setImportUploading(false);
    }
  };

  const toggleGuardrail = (id: string) => {
    setGuardrailItems((items) => items.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item));
  };

  const togglePrivacy = async (key: keyof typeof privacySettings) => {
    const newVal = !privacySettings[key];
    setPrivacySettings(s => ({ ...s, [key]: newVal }));
    const res = await fetch("/api/settings/privacy", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: newVal }),
    });
    if (res.ok) {
      setPrivacySavedKey(key);
      setTimeout(() => setPrivacySavedKey(null), 2000);
    }
  };

  const downloadData = async () => {
    setDataDownloading(true);
    try {
      const res = await fetch("/api/settings/data-export");
      if (!res.ok) return;
      const data = await res.json();
      const date = new Date().toISOString().split("T")[0];
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `klartrade-data-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDataDownloading(false);
    }
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
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#03588C]/30 flex items-center justify-center text-xl font-bold text-white">
                          {profileLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-[#6B7280]" />
                          ) : avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            initials
                          )}
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={avatarUploading}
                          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#03588C] flex items-center justify-center disabled:opacity-50 hover:bg-[#4BA3D4] transition-colors"
                        >
                          {avatarUploading
                            ? <Loader2 className="w-3 h-3 text-white animate-spin" />
                            : <Camera className="w-3 h-3 text-white" />}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-[#F2F0EB]">{profile.full_name || profile.email}</p>
                        <p className="text-sm text-[#6B7280]">{profile.email}</p>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D9CA82]/10 text-[#D9CA82] border border-[#D9CA82]/20">Pro Plan</span>
                        {avatarError && (
                          <p className="text-[11px] text-red-400 mt-1">{avatarError}</p>
                        )}
                        <p className="text-[10px] text-[#6B7280]/50 mt-1">Click the camera to upload a photo · max 2 MB</p>
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
                    {routineItems.map((item, idx) => {
                      const isCustom = item.id > 7;
                      return (
                        <div key={item.id} className={cn("flex items-center gap-4 px-5 py-4", idx > 0 && "border-t border-white/[0.04]")}>
                          <div className="w-6 h-6 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[10px] text-[#6B7280] flex-shrink-0">
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
                          {isCustom && (
                            <button
                              onClick={() => removeRoutineStep(item.id)}
                              className="w-5 h-5 flex items-center justify-center text-[#6B7280] hover:text-red-400 transition-colors flex-shrink-0"
                              aria-label="Remove step"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Inline add input */}
                    {addingRoutineStep && (
                      <div className="flex items-center gap-3 px-5 py-4 border-t border-white/[0.04]">
                        <div className="w-6 h-6 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[10px] text-[#6B7280] flex-shrink-0">
                          {routineItems.length + 1}
                        </div>
                        <input
                          ref={routineInputRef}
                          value={newRoutineStepText}
                          onChange={e => setNewRoutineStepText(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") commitRoutineStep();
                            if (e.key === "Escape") { setAddingRoutineStep(false); setNewRoutineStepText(""); }
                          }}
                          placeholder="Step name…"
                          className="flex-1 bg-transparent text-sm text-[#F2F0EB] placeholder-[#6B7280] outline-none"
                        />
                        <button
                          onClick={commitRoutineStep}
                          className="text-xs font-semibold text-[#4BA3D4] hover:text-white transition-colors flex-shrink-0"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => { setAddingRoutineStep(false); setNewRoutineStepText(""); }}
                          className="text-[#6B7280] hover:text-[#F2F0EB] transition-colors flex-shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {!addingRoutineStep && (
                    <button
                      onClick={() => setAddingRoutineStep(true)}
                      className="mt-3 flex items-center gap-1.5 text-xs text-[#4BA3D4] hover:text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Custom Step
                    </button>
                  )}
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
                  <p className="text-[11px] text-[#6B7280] mb-4">Manually import your trade history from a CSV or PDF file.</p>

                  {/* Hidden file input — outside the drop zone to prevent click-bubble loop */}
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".csv,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) acceptImportFile(f);
                      e.target.value = "";
                    }}
                  />

                  <div
                    onDragOver={(e) => { e.preventDefault(); setImportDragging(true); }}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) setImportDragging(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setImportDragging(false);
                      const f = e.dataTransfer.files[0];
                      if (f) acceptImportFile(f);
                    }}
                    onClick={() => { if (!importUploading) importInputRef.current?.click(); }}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-6 text-center transition-all",
                      importUploading
                        ? "border-[#03588C]/40 bg-[#03588C]/5 cursor-wait"
                        : importDragging
                        ? "border-[#03588C] bg-[#03588C]/10 cursor-copy"
                        : importFile
                        ? "border-[#03588C]/40 bg-[#03588C]/5 cursor-pointer"
                        : "border-white/[0.08] hover:border-[#03588C]/40 cursor-pointer",
                    )}
                  >
                    {importUploading ? (
                      <div className="flex items-center justify-center gap-2 py-1">
                        <Loader2 className="w-5 h-5 text-[#4BA3D4] animate-spin" />
                        <span className="text-sm text-[#6B7280]">Processing…</span>
                      </div>
                    ) : importFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <span className={cn(
                          "text-[11px] font-bold px-2 py-0.5 rounded-md flex-shrink-0",
                          importFile.name.toLowerCase().endsWith(".pdf")
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
                        )}>
                          {importFile.name.toLowerCase().endsWith(".pdf") ? "PDF" : "CSV"}
                        </span>
                        <span className="text-sm text-[#F2F0EB] truncate max-w-[200px]">{importFile.name}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setImportFile(null); setImportResult(null); }}
                          className="text-[#6B7280] hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-7 h-7 text-[#6B7280] mx-auto mb-2" />
                        <p className="text-sm text-[#6B7280] mb-1">Drop your file here or click to browse</p>
                        <p className="text-[11px] text-[#6B7280]/60">Supports .csv and .pdf — MT4/5, cTrader, TradeLocker, Tradovate</p>
                      </>
                    )}
                  </div>

                  {importResult && (
                    <div className={cn(
                      "flex items-center gap-2 mt-3 px-3 py-2.5 rounded-xl text-xs border",
                      importResult.ok
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400",
                    )}>
                      {importResult.ok
                        ? <Check className="w-3.5 h-3.5 flex-shrink-0" />
                        : <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />}
                      <span>{importResult.msg}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* PRIVACY */}
            {activeTab === "privacy" && (
              <>
                <div>
                  <h2 className="text-base font-bold text-[#F2F0EB] mb-1">Data &amp; Privacy</h2>
                  <p className="text-sm text-[#6B7280] mb-4">Control how your data is used and stored.</p>
                  {privacyLoading ? (
                    <div className="flex items-center justify-center h-24">
                      <Loader2 className="w-5 h-5 animate-spin text-[#6B7280]" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {PRIVACY_ITEMS.map((item) => {
                        const enabled = privacySettings[item.key];
                        const saved = privacySavedKey === item.key;
                        return (
                          <div key={item.key} className="glass rounded-2xl p-4 flex items-center gap-4">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-[#F2F0EB]">{item.label}</p>
                              <p className="text-[11px] text-[#6B7280] mt-0.5">{item.desc}</p>
                            </div>
                            {saved && (
                              <span className="text-[10px] font-semibold text-emerald-400 flex-shrink-0">Saved</span>
                            )}
                            <button
                              onClick={() => togglePrivacy(item.key)}
                              className={cn("w-10 h-5 rounded-full relative flex-shrink-0 transition-all",
                                enabled ? "bg-[#03588C]" : "bg-white/[0.08]")}
                            >
                              <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                                enabled ? "left-[22px]" : "left-0.5")} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
                  <button
                    onClick={downloadData}
                    disabled={dataDownloading}
                    className="mt-4 flex items-center gap-1.5 text-xs text-[#4BA3D4] hover:text-white transition-colors disabled:opacity-50"
                  >
                    {dataDownloading
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Download className="w-3.5 h-3.5" />}
                    {dataDownloading ? "Preparing…" : "Download All My Data"}
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
                      { icon: <BookOpen className="w-5 h-5" />, label: "Help Center",      desc: "Browse articles and guides",  action: () => setShowHelpCenter(true) },
                      { icon: <MessageSquare className="w-5 h-5" />, label: "Live Chat",   desc: "Chat with our team",          action: openLiveChat },
                      { icon: <AlertTriangle className="w-5 h-5" />, label: "Report a Bug",desc: "Something not working?",      action: () => openSupportForm("Bug Report") },
                      { icon: <Zap className="w-5 h-5" />, label: "Feature Request",       desc: "Suggest an improvement",      action: () => openSupportForm("Feature Request") },
                    ].map(({ icon, label, desc, action }) => (
                      <button key={label} onClick={action} className="glass rounded-2xl p-4 text-left hover:bg-white/[0.05] transition-all">
                        <div className="w-9 h-9 rounded-xl bg-[#03588C]/15 flex items-center justify-center text-[#4BA3D4] mb-3">
                          {icon}
                        </div>
                        <p className="text-sm font-semibold text-[#F2F0EB] mb-0.5">{label}</p>
                        <p className="text-[11px] text-[#6B7280]">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div ref={supportFormRef} className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-[#F2F0EB] mb-3">Send us a message</h3>
                  <div className="space-y-3">
                    <select
                      value={supportType}
                      onChange={e => setSupportType(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] focus:outline-none"
                    >
                      <option>General Question</option>
                      <option>Billing Issue</option>
                      <option>Bug Report</option>
                      <option>Feature Request</option>
                    </select>
                    <textarea
                      value={supportMessage}
                      onChange={e => setSupportMessage(e.target.value)}
                      placeholder="Describe your issue or question..."
                      rows={4}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] placeholder-[#6B7280]/60 focus:outline-none focus:border-[#03588C]/50 resize-none"
                    />
                    {supportResult && (
                      <div className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs border",
                        supportResult.ok
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-400",
                      )}>
                        {supportResult.ok
                          ? <Check className="w-3.5 h-3.5 flex-shrink-0" />
                          : <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />}
                        <span>{supportResult.msg}</span>
                      </div>
                    )}
                    <button
                      onClick={submitSupportTicket}
                      disabled={supportSubmitting || !supportMessage.trim()}
                      className="px-5 py-2.5 rounded-xl bg-[#03588C] text-white text-sm font-semibold hover:bg-[#024a77] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {supportSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/klar-removebg-preview.png" alt="KlarTrade" className="w-16 h-16 object-contain mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-[#F2F0EB] mb-0.5">KlarTrade</h3>
                    <p className="text-sm text-[#6B7280] mb-1">Trade with clarity. Execute with discipline.</p>
                    <p className="text-[11px] text-[#6B7280]/60">Version 1.0.0 · Build 2026.06.05</p>
                  </div>
                  <div className="space-y-2">
                    {["Terms of Service", "Privacy Policy", "Refund Policy", "Open Source Licenses"].map((label) => (
                      <button key={label} onClick={() => setLegalModal(label)} className="w-full flex items-center justify-between px-4 py-3 glass rounded-xl hover:bg-white/[0.05] transition-all">
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

      {/* ── Legal Modals ──────────────────────────────────────────────── */}
      {legalModal && LEGAL_CONTENT[legalModal] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setLegalModal(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-[#0A0E1A] border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-[#F2F0EB]">{LEGAL_CONTENT[legalModal].title}</h2>
                {LEGAL_CONTENT[legalModal].effectiveDate && (
                  <p className="text-[11px] text-[#6B7280] mt-0.5">Effective {LEGAL_CONTENT[legalModal].effectiveDate}</p>
                )}
              </div>
              <button
                onClick={() => setLegalModal(null)}
                className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-[#6B7280]" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
              {LEGAL_CONTENT[legalModal].sections.map((section) => (
                <div key={section.heading}>
                  <h3 className="text-xs font-semibold text-[#F2F0EB] mb-1.5">{section.heading}</h3>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">{section.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Help Center Modal ─────────────────────────────────────────── */}
      {showHelpCenter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => { setShowHelpCenter(false); setHelpArticle(null); }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-[#0A0E1A] border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                {helpArticle !== null && (
                  <button
                    onClick={() => setHelpArticle(null)}
                    className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center mr-1 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#6B7280] rotate-180" />
                  </button>
                )}
                <BookOpen className="w-4 h-4 text-[#4BA3D4]" />
                <h2 className="text-sm font-semibold text-[#F2F0EB]">
                  {helpArticle !== null ? HELP_ARTICLES[helpArticle].title : "Help Center"}
                </h2>
              </div>
              <button
                onClick={() => { setShowHelpCenter(false); setHelpArticle(null); }}
                className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-[#6B7280]" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              {helpArticle === null ? (
                <div className="space-y-2">
                  {HELP_ARTICLES.map((article, i) => (
                    <button
                      key={i}
                      onClick={() => setHelpArticle(i)}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-all text-left"
                    >
                      <span className="text-sm text-[#F2F0EB]">{article.title}</span>
                      <ChevronRight className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-2">
                  <h3 className="text-sm font-semibold text-[#F2F0EB] mb-3">{HELP_ARTICLES[helpArticle].title}</h3>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed">{HELP_ARTICLES[helpArticle].body}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Live Chat Modal ───────────────────────────────────────────── */}
      {showLiveChat && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 backdrop-blur-sm p-4 sm:p-6"
          onClick={() => setShowLiveChat(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-[#0A0E1A] border border-white/[0.08] rounded-2xl w-full max-w-sm shadow-2xl flex flex-col"
            style={{ height: "480px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#03588C]/20 flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5 text-[#4BA3D4]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#F2F0EB]">KlarTrade Support</p>
                  <p className="text-[10px] text-emerald-400">Online</p>
                </div>
              </div>
              <button
                onClick={() => setShowLiveChat(false)}
                className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-[#6B7280]" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed",
                    msg.role === "user"
                      ? "bg-[#03588C] text-white rounded-br-sm"
                      : "bg-white/[0.06] text-[#E5E7EB] rounded-bl-sm",
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.06] px-3 py-2 rounded-2xl rounded-bl-sm">
                    <Loader2 className="w-3.5 h-3.5 text-[#6B7280] animate-spin" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-3 border-t border-white/[0.06] flex-shrink-0">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                placeholder="Type a message…"
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#F2F0EB] placeholder-[#6B7280] focus:outline-none focus:border-[#03588C]/50"
              />
              <button
                onClick={sendChatMessage}
                disabled={!chatInput.trim() || chatLoading}
                className="w-8 h-8 rounded-xl bg-[#03588C] hover:bg-[#024a77] flex items-center justify-center transition-all disabled:opacity-40 flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
