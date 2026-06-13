"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  TrendingUp, ArrowRight, Play, Check, Shield, Brain, BarChart2,
  Zap, BookOpen, Calendar, RefreshCw, Code2, FlaskConical, Leaf,
  Sparkles, Sliders, Star, Menu, X, Instagram
} from "lucide-react";
import { cn } from "@/lib/utils";

function useCountUp(end: number, duration = 2.2) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, end, duration]);
  return { count, ref };
}

const features = [
  { icon: BookOpen, title: "Automated Journal", desc: "Trades auto-log the moment they close.", color: "#03588C" },
  { icon: Sparkles, title: "AI Coach — KlarAI", desc: "Your personal trading psychologist, available 24/7.", color: "#4BA3D4" },
  { icon: Shield, title: "Risk Guardrails", desc: "Hard limits that protect you from yourself.", color: "#22C55E" },
  { icon: TrendingUp, title: "Edge — Strategy Playbook", desc: "Build, test, and refine your trading rules.", color: "#D9CA82" },
  { icon: BarChart2, title: "Analytics Engine", desc: "50+ reports. Understand exactly where you win.", color: "#03588C" },
  { icon: Leaf, title: "Refuge", desc: "Where composure is rebuilt, not found.", color: "#4BA3D4" },
  { icon: Zap, title: "Position Calculator", desc: "Risk-based sizing, auto-calculated.", color: "#22C55E", soon: true },
  { icon: Calendar, title: "News Calendar", desc: "Never trade into a high-impact event again.", color: "#D9CA82", soon: true },
  { icon: FlaskConical, title: "Backtesting", desc: "Test your edge on 10+ years of real data.", color: "#03588C", soon: true },
  { icon: Play, title: "Trade Replay", desc: "Relive your real trades second by second.", color: "#4BA3D4", soon: true },
  { icon: Code2, title: "Custom Indicators", desc: "Build your own indicators with no-code or full code.", color: "#22C55E", soon: true },
  { icon: RefreshCw, title: "Broker Sync", desc: "Connect 40+ brokers. Auto-import every trade.", color: "#D9CA82" },
  { icon: Sliders, title: "Discipline Scoring", desc: "Know your score. Improve your consistency.", color: "#03588C" },
  { icon: Brain, title: "Notebook", desc: "Think before you trade. Review before you repeat.", color: "#4BA3D4" },
];

const testimonials = [
  {
    name: "Marcus C.", role: "Futures Trader · ES/NQ", stars: 5,
    quote: "KlarTrade caught 3 revenge trades in my first week. The discipline score alone paid for itself.",
    before: "38% Win Rate", after: "67% Win Rate",
  },
  {
    name: "Sarah O.", role: "Forex Trader · FTMO Funded", stars: 5,
    quote: "The automated journal is insane. The analytics showed me I only win on London session.",
    before: "-$4,200 / mo", after: "+$8,400 / mo",
  },
  {
    name: "James W.", role: "Stock Options Trader", stars: 5,
    quote: "I've tried EdgeFlo and Tradezella. KlarTrade has features they don't even have on their roadmap.",
    before: "0.8 Profit Factor", after: "2.4 Profit Factor",
  },
];

interface BrokerEntry { name: string; comingSoon?: boolean }
const brokers: BrokerEntry[] = [
  { name: "cTrader" }, { name: "TradeLocker" }, { name: "Tradovate" },
  { name: "MetaTrader 4" },
  { name: "MetaTrader 5", comingSoon: true },
  { name: "NinjaTrader" }, { name: "Interactive Brokers" }, { name: "OANDA" },
  { name: "Pepperstone" }, { name: "IC Markets" }, { name: "Robinhood" },
  { name: "Bybit" }, { name: "Binance" }, { name: "Rithmic" },
  { name: "DXtrade" }, { name: "FXCM" }, { name: "Forex.com" },
  { name: "Charles Schwab" }, { name: "E*TRADE" }, { name: "Webull" },
  { name: "Alpari" }, { name: "Axi" },
];

const pricing = [
  {
    name: "Starter", price: { monthly: 14, yearly: 12 },
    features: ["1 broker connection", "Manual journal", "Basic analytics", "100 trades/month", "Community access"],
    cta: "Start 10-Day Trial — $10", highlight: false,
  },
  {
    name: "Pro", price: { monthly: 29, yearly: 24 },
    features: ["3 broker connections", "Automated journal", "Full analytics (50+ reports)", "KlarAI coach", "Refuge", "Backtesting", "Trade Replay", "Custom indicators (5)", "Priority support"],
    cta: "Start 10-Day Trial — $10", highlight: true,
  },
  {
    name: "Elite", price: { monthly: 59, yearly: 49 },
    features: ["Unlimited broker connections", "Everything in Pro", "Unlimited custom indicators", "Advanced AI insights", "White-glove onboarding", "API access"],
    cta: "Start 10-Day Trial — $10", highlight: false,
  },
];

export default function LandingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [navOpen, setNavOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => setIsLoggedIn(r.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  const traders = useCountUp(12400);
  const trades = useCountUp(2100000);
  const improvement = useCountUp(41);
  const violations = useCountUp(890000);

  return (
    <div className="min-h-screen bg-[#050508] text-[#F2F0EB] overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="hero-glow absolute inset-0" />
        <div className="dot-grid absolute inset-0 opacity-30" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
        <div className="glass rounded-2xl px-5 py-3 flex items-center justify-between shadow-card">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center">
              <Image src="/klar-removebg-preview.png" alt="KlarTrade logo" width={48} height={48} className="object-contain" />
            </div>
            <span className="text-[15px] font-bold tracking-tight">
              Klar<span className="text-[#4BA3D4]">Trade</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-[#6B7280]">
            {["Features", "Pricing", "Brokers"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-[#F2F0EB] transition-colors">{l}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="text-sm text-[#6B7280] hover:text-[#F2F0EB] px-3 py-2 transition-colors">Dashboard</Link>
                <button onClick={handleLogout} className="text-sm text-[#6B7280] hover:text-[#F2F0EB] px-3 py-2 transition-colors">Log out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-[#6B7280] hover:text-[#F2F0EB] px-3 py-2 transition-colors">Sign In</Link>
                <Link href="/register" className="text-sm text-[#6B7280] hover:text-[#F2F0EB] px-3 py-2 transition-colors">Register</Link>
                <Link href="/register" className="bg-[#03588C] text-white text-sm px-4 py-2 rounded-xl hover:bg-[#024a77] transition-all shadow-glow-xs">Start 10-Day Trial — $10</Link>
              </>
            )}
          </div>

          <button className="md:hidden text-[#6B7280]" onClick={() => setNavOpen(!navOpen)}>
            {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {navOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass rounded-2xl mt-2 p-4 flex flex-col gap-3"
            >
              {["Features", "Pricing", "Brokers"].map((l) => (
                <a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-[#6B7280]" onClick={() => setNavOpen(false)}>{l}</a>
              ))}
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard" className="text-sm text-[#6B7280]" onClick={() => setNavOpen(false)}>Dashboard</Link>
                  <button onClick={handleLogout} className="text-sm text-[#6B7280] text-left">Log out</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-[#6B7280]" onClick={() => setNavOpen(false)}>Sign In</Link>
                  <Link href="/register" className="text-sm text-[#6B7280]" onClick={() => setNavOpen(false)}>Register</Link>
                  <Link href="/register" className="bg-[#03588C] text-white text-sm px-4 py-2 rounded-xl text-center" onClick={() => setNavOpen(false)}>Start 10-Day Trial — $10</Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO */}
      <section className="pt-40 pb-24 px-6 text-center relative">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#03588C]/15 border border-[#03588C]/30 text-[#4BA3D4] text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#03588C] animate-pulse" />
            The All-In-One AI Trading Operating System
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-[88px] font-black leading-[1.0] tracking-tight mb-6 max-w-5xl mx-auto">
            Trade with clarity.{" "}
            <span className="gradient-text">Execute with discipline.</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#6B7280] max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop overtrading. Stop revenge trading. Stop losing to your emotions.
            KlarTrade gives you the system, the data, and the AI to become the trader you know you can be.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(3,88,140,0.5)" }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 bg-[#03588C] text-white px-7 py-3.5 rounded-xl text-[15px] font-semibold shadow-glow-sm"
              >
                Start 10-Day Trial — $10
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link href="/demo">
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2.5 glass px-7 py-3.5 rounded-xl text-[15px] font-medium"
              >
                <Play className="w-4 h-4 text-[#03588C]" />
                Watch Demo
              </motion.button>
            </Link>
          </div>

          {/* Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="glass rounded-2xl overflow-hidden border border-[#03588C]/20 shadow-glow-md">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05] bg-[#06080f]">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <div className="flex-1 mx-4 h-6 bg-white/[0.04] rounded-md flex items-center px-3">
                  <span className="text-[10px] text-[#6B7280]">app.klartrade.com/dashboard</span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-0 min-h-[300px] bg-[#050508]">
                <div className="col-span-1 border-r border-white/[0.04] p-2.5 space-y-1 bg-[#06080f]">
                  {["Dashboard", "Trading", "Edge", "Journal", "KlarAI", "Analytics", "Backtesting"].map((item, i) => (
                    <div key={item} className={cn("px-2 py-1.5 rounded-lg text-[10px] font-medium",
                      i === 0 ? "bg-[#03588C] text-white" : "text-[#6B7280]")}>
                      {item}
                    </div>
                  ))}
                </div>

                <div className="col-span-4 p-4 space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { l: "Balance", v: "$92,182", c: "text-[#F2F0EB]" },
                      { l: "Net PnL", v: "+$12,840", c: "text-[#22C55E]" },
                      { l: "Win Rate", v: "68.4%", c: "text-[#4BA3D4]" },
                      { l: "Discipline", v: "94/100", c: "text-[#D9CA82]" },
                    ].map((s) => (
                      <div key={s.l} className="glass rounded-xl p-2.5">
                        <p className="text-[9px] text-[#6B7280] mb-1">{s.l}</p>
                        <p className={cn("text-sm font-bold font-mono-nums", s.c)}>{s.v}</p>
                      </div>
                    ))}
                  </div>

                  <div className="glass rounded-xl p-3 h-32 flex items-end gap-0.5 overflow-hidden">
                    {Array.from({ length: 40 }, (_, i) => {
                      const h = 20 + Math.sin(i * 0.35) * 18 + i * 1.2;
                      return (
                        <div key={i} className="flex-1 rounded-sm" style={{
                          height: `${Math.min(Math.max(h, 5), 95)}%`,
                          background: h > 55 ? "rgba(34,197,94,0.5)" : "rgba(3,88,140,0.35)"
                        }} />
                      );
                    })}
                  </div>

                  <div className="glass rounded-xl p-2.5 border-l-2 border-[#03588C]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3 h-3 text-[#4BA3D4]" />
                      <span className="text-[9px] text-[#4BA3D4] font-semibold">KlarAI Insight</span>
                    </div>
                    <p className="text-[9px] text-[#6B7280]">Your London session win rate is 43% higher than NY. Focus your trading hours for maximum edge.</p>
                  </div>
                </div>
              </div>
            </div>

            {[
              { label: "Win Rate", value: "68.4%", color: "#22C55E", borderColor: "#22C55E", pos: "-left-8 top-16", delay: 0 },
              { label: "Discipline", value: "94/100", color: "#D9CA82", borderColor: "#D9CA82", pos: "-right-8 top-24", delay: 0.5 },
              { label: "Net PnL", value: "+$12,840", color: "#4BA3D4", borderColor: "#4BA3D4", pos: "-left-4 bottom-12", delay: 1 },
            ].map((chip) => (
              <motion.div
                key={chip.label}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3 + chip.delay, repeat: Infinity, ease: "easeInOut", delay: chip.delay }}
                className={cn("absolute glass rounded-xl px-3 py-2 shadow-glow-sm hidden lg:block", chip.pos)}
                style={{ borderColor: `${chip.borderColor}30` }}
              >
                <p className="text-[10px] text-[#6B7280]">{chip.label}</p>
                <p className="text-lg font-bold font-mono-nums" style={{ color: chip.color }}>{chip.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* TRUST */}
      <section className="py-20 px-6 border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {[
              { data: traders, label: "Traders", suffix: "+" },
              { data: trades, label: "Trades Journaled", suffix: "+" },
              { data: improvement, label: "Avg Discipline Improvement", suffix: "%" },
              { data: violations, label: "Rule Violations Caught", suffix: "+" },
            ].map((s) => (
              <div key={s.label} ref={s.data.ref as React.RefObject<HTMLDivElement>} className="text-center">
                <p className="text-4xl font-black font-mono-nums text-[#F2F0EB] mb-1">
                  {s.data.count > 999999 ? `${(s.data.count / 1000000).toFixed(1)}M` :
                   s.data.count > 9999 ? `${(s.data.count / 1000).toFixed(0)}K` :
                   s.data.count}{s.suffix}
                </p>
                <p className="text-sm text-[#6B7280]">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="glass rounded-2xl p-5">
                <div className="flex mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#D9CA82] fill-[#D9CA82]" />
                  ))}
                </div>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#F2F0EB]">{t.name}</p>
                    <p className="text-[11px] text-[#6B7280]">{t.role}</p>
                  </div>
                  <div className="text-right text-[11px]">
                    <p className="text-red-400">{t.before}</p>
                    <p className="text-[#22C55E]">{t.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#4BA3D4] text-sm font-semibold uppercase tracking-widest mb-3">Everything you need</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">One platform. Every edge.</h2>
            <p className="text-[#6B7280] text-lg max-w-xl mx-auto">Stop paying for 3 separate tools. KlarTrade replaces your journal, your analytics, your AI coach, and more.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-4 cursor-default transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${f.color}18` }}>
                    <f.icon className="w-[18px] h-[18px]" style={{ color: f.color }} />
                  </div>
                  {"soon" in f && f.soon && (
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-[#6B7280] bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-[#F2F0EB] mb-1">{f.title}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 bg-[#06080f] border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#4BA3D4] text-sm font-semibold uppercase tracking-widest mb-3">The system</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Prepare. Execute. Review.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01", label: "PREPARE", color: "#03588C",
                title: "Enter with a plan or don't enter at all.",
                items: ["Review your Edge plan", "Check economic calendar", "Set daily risk limits", "Pre-market routine"],
              },
              {
                step: "02", label: "EXECUTE", color: "#4BA3D4",
                title: "Trade with guardrails. Every action recorded.",
                items: ["Live guardrail protection", "Auto-journal on close", "Real-time pattern alerts", "Emotion tracking"],
              },
              {
                step: "03", label: "REVIEW", color: "#D9CA82",
                title: "Know your edge. Then expand it.",
                items: ["50+ analytics reports", "KlarAI weekly digest", "Backtesting engine", "Replay your trades"],
              },
            ].map((s) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[11px] font-black tracking-widest" style={{ color: s.color }}>{s.step}</span>
                  <span className="text-[11px] font-bold tracking-widest text-[#6B7280]">{s.label}</span>
                </div>
                <h3 className="text-[15px] font-bold text-[#F2F0EB] mb-4 leading-snug">{s.title}</h3>
                <div className="space-y-2">
                  {s.items.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-[#6B7280]">
                      <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: s.color }} />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BROKERS */}
      <section id="brokers" className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[#4BA3D4] text-sm font-semibold uppercase tracking-widest mb-3">Integrations</p>
          <h2 className="text-4xl md:text-5xl font-black mb-4">Works with every platform you already use.</h2>
          <p className="text-[#6B7280] text-lg max-w-xl mx-auto mb-12">Auto-sync trades from 40+ brokers. Or upload a CSV. Everything imports.</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6">
            {brokers.map((b) => (
              b.comingSoon ? (
                <div key={b.name} className="relative glass rounded-xl px-3 py-2.5 text-xs font-medium text-[#4B5563] transition-all text-center opacity-60 cursor-default">
                  {b.name}
                  <span className="absolute -top-2 -right-1 bg-[#03588C]/80 text-[#93C5FD] text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full leading-none">
                    Soon
                  </span>
                </div>
              ) : (
                <div key={b.name} className="glass rounded-xl px-3 py-2.5 text-xs font-medium text-[#6B7280] hover:text-[#F2F0EB] hover:border-[#03588C]/30 transition-all text-center">
                  {b.name}
                </div>
              )
            ))}
          </div>
          <p className="text-sm text-[#6B7280]">+ CSV upload works for everything else · MT5 auto-sync coming soon</p>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6 bg-[#06080f] border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#4BA3D4] text-sm font-semibold uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-black mb-6">Simple, transparent pricing.</h2>
            <div className="inline-flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.07] rounded-xl">
              {(["monthly", "yearly"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={cn("px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                    billing === b ? "bg-[#03588C] text-white" : "text-[#6B7280] hover:text-[#F2F0EB]")}
                >
                  {b}
                  {b === "yearly" && <span className="ml-2 text-[10px] text-[#D9CA82] font-bold">2 months free</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pricing.map((plan) => (
              <motion.div
                key={plan.name}
                whileHover={{ y: -4 }}
                className={cn("glass rounded-2xl p-6 relative transition-all", plan.highlight && "border-[#03588C]/40 shadow-glow-sm")}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#D9CA82] text-[#050508] text-[11px] font-black rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-[#F2F0EB] mb-1">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-5">
                  <span className="text-4xl font-black font-mono-nums">
                    {plan.price[billing] === 0 ? "Free" : `$${plan.price[billing]}`}
                  </span>
                  {plan.price[billing] > 0 && <span className="text-[#6B7280] text-sm mb-1">/mo</span>}
                </div>
                <div className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-sm text-[#6B7280]">
                      <Check className="w-4 h-4 text-[#03588C] flex-shrink-0 mt-0.5" />
                      {f}
                    </div>
                  ))}
                </div>
                <Link href="/register">
                  <button className={cn("w-full py-3 rounded-xl text-sm font-semibold transition-all",
                    plan.highlight
                      ? "bg-[#03588C] text-white hover:bg-[#024a77] shadow-glow-xs"
                      : "border border-white/[0.1] text-[#F2F0EB] hover:bg-white/[0.05]"
                  )}>
                    {plan.cta}
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="section-glow absolute inset-0 pointer-events-none" />
        <div className="max-w-3xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <h2 className="text-4xl md:text-6xl font-black mb-5 leading-tight">
              You don&apos;t need another strategy.
              <br />
              <span className="gradient-text">You need a system that protects you from yourself.</span>
            </h2>
            <p className="text-[#6B7280] text-lg mb-10">Built for traders who are serious about the mental game.</p>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 0 50px rgba(3,88,140,0.5)" }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 bg-[#03588C] text-white px-8 py-4 rounded-xl text-base font-bold shadow-glow-md"
              >
                Start 10-Day Trial — $10
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center">
              <Image src="/klar-removebg-preview.png" alt="KlarTrade logo" width={44} height={44} className="object-contain" />
            </div>
            <span className="text-[14px] font-bold tracking-tight">Klar<span className="text-[#4BA3D4]">Trade</span></span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#6B7280]">
            {[
              { label: "Terms", href: "/terms" },
              { label: "Privacy", href: "/privacy" },
              { label: "Risk Policy", href: "/risk-disclaimer" },
              { label: "Support", href: "#" },
            ].map((l) => (
              <Link key={l.label} href={l.href} className="hover:text-[#F2F0EB] transition-colors">{l.label}</Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/klartrade?igsh=MXAwZTN4a3FlY2Zubw%3D%3D&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6B7280] hover:text-[#F2F0EB] transition-colors"
              aria-label="KlarTrade on Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <p className="text-sm text-[#6B7280]">© {new Date().getFullYear()} KlarTrade. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
