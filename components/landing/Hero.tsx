"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Brain, Shield, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const floatingStats = [
  { label: "Discipline Score", value: "94", sub: "+12 this month", color: "text-indigo-400", pos: "top-12 -left-8 lg:-left-20" },
  { label: "Today's PnL", value: "+$1,840", sub: "4 trades closed", color: "text-emerald-400", pos: "top-8 -right-8 lg:-right-20" },
  { label: "Rule Adherence", value: "97%", sub: "vs 68% avg trader", color: "text-violet-400", pos: "bottom-24 -left-6 lg:-left-16" },
  { label: "Win Rate", value: "68%", sub: "+5% this week", color: "text-cyan-400", pos: "bottom-16 -right-6 lg:-right-16" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="hero-glow absolute inset-0" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-indigo-600/[0.12] rounded-full blur-[130px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-violet-600/[0.07] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-cyan-600/[0.06] rounded-full blur-[80px]" />
        <div className="grid-bg absolute inset-0 opacity-100" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/[0.08] text-indigo-400 text-sm font-medium mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            AI-Powered Trading Intelligence
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-bold font-display tracking-tight leading-[1.04] mb-6"
          >
            <span className="text-white">Trade with</span>
            <br />
            <span className="gradient-text">clarity,</span>
            <br />
            <span className="text-white">not emotion.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="max-w-xl mx-auto text-lg sm:text-xl text-slate-400 leading-relaxed mb-10"
          >
            The AI companion that builds unbreakable discipline, protects you from emotional decisions, and turns every trade into a lesson — not a regret.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
          >
            <Link href="/register">
              <Button size="xl" className="shadow-glow-md">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/demo" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
              <div className="w-11 h-11 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center group-hover:border-white/20 group-hover:bg-white/[0.08] group-hover:shadow-glow-xs transition-all duration-300">
                <Play className="w-4 h-4 ml-0.5" />
              </div>
              <span className="text-sm font-medium">Watch 90-sec Demo</span>
            </Link>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 64 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-5xl mx-auto"
          >
            {/* Floating cards */}
            {floatingStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className={`absolute ${stat.pos} z-20 hidden lg:block`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.12 }}
                style={{ animation: `float ${5 + i * 0.8}s ease-in-out ${i * 0.4}s infinite` }}
              >
                <div className="glass rounded-2xl p-3.5 min-w-[148px] shadow-card">
                  <p className="text-[11px] text-slate-500 mb-1">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{stat.sub}</p>
                </div>
              </motion.div>
            ))}

            {/* Main dashboard mockup */}
            <div className="relative glass rounded-2xl overflow-hidden shadow-[0_0_120px_rgba(99,102,241,0.12),0_24px_64px_rgba(0,0,0,0.6)]">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/70" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                </div>
                <div className="flex-1 mx-4 h-6 rounded-lg bg-white/[0.04] flex items-center px-3 gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400/60" />
                  <span className="text-[11px] text-slate-500">app.klartrade.com/dashboard</span>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="flex h-[440px] sm:h-[520px]">
                {/* Sidebar */}
                <div className="w-14 border-r border-white/[0.05] bg-black/20 flex flex-col items-center py-4 gap-3">
                  {[
                    { Icon: TrendingUp, active: true },
                    { Icon: Brain, active: false },
                    { Icon: Shield, active: false },
                    { Icon: Zap, active: false },
                  ].map(({ Icon, active }, i) => (
                    <div
                      key={i}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        active
                          ? "bg-indigo-500/20 text-indigo-400 shadow-glow-xs"
                          : "text-slate-700 hover:text-slate-500"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 p-4 overflow-hidden">
                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "Total PnL", value: "+$14,280", color: "text-emerald-400" },
                      { label: "Win Rate", value: "68%", color: "text-indigo-400" },
                      { label: "Discipline", value: "94/100", color: "text-violet-400" },
                      { label: "Trades", value: "142", color: "text-slate-300" },
                    ].map((s, i) => (
                      <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
                        <p className="text-[10px] text-slate-600 mb-1">{s.label}</p>
                        <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Charts area */}
                  <div className="flex gap-3 flex-1" style={{ height: "calc(100% - 80px)" }}>
                    {/* Equity chart */}
                    <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                      <p className="text-[10px] text-slate-500 mb-2 font-medium">EQUITY CURVE</p>
                      <svg viewBox="0 0 320 180" className="w-full h-[85%]" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0 170 L30 155 L60 140 L90 125 L110 135 L130 115 L160 90 L190 72 L220 58 L250 44 L280 32 L320 18"
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M0 170 L30 155 L60 140 L90 125 L110 135 L130 115 L160 90 L190 72 L220 58 L250 44 L280 32 L320 18 L320 180 L0 180Z"
                          fill="url(#equityGrad)"
                        />
                        {/* Grid lines */}
                        {[0, 60, 120, 180].map((y) => (
                          <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                        ))}
                      </svg>
                    </div>

                    {/* Right panels */}
                    <div className="w-44 flex flex-col gap-3">
                      {/* AI insight */}
                      <div className="flex-1 bg-indigo-500/[0.07] border border-indigo-500/20 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="w-5 h-5 rounded-lg bg-indigo-500/25 flex items-center justify-center">
                            <Brain className="w-3 h-3 text-indigo-400" />
                          </div>
                          <p className="text-[10px] text-indigo-400 font-semibold">AI INSIGHT</p>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-[1.5]">
                          Your win rate improves 23% when you wait for the second confirmation signal. Follow your plan today.
                        </p>
                      </div>
                      {/* Recent trades */}
                      <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                        <p className="text-[10px] text-slate-600 mb-2 font-medium">RECENT TRADES</p>
                        {[
                          { symbol: "ES", pnl: "+$480", win: true },
                          { symbol: "NQ", pnl: "-$120", win: false },
                          { symbol: "GC", pnl: "+$680", win: true },
                          { symbol: "CL", pnl: "+$230", win: true },
                        ].map((t, i) => (
                          <div key={i} className="flex items-center justify-between py-1 border-b border-white/[0.04] last:border-0">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${t.win ? "bg-emerald-400" : "bg-rose-400"}`} />
                              <span className="text-[10px] text-slate-400">{t.symbol}</span>
                            </div>
                            <span className={`text-[10px] font-semibold ${t.win ? "text-emerald-400" : "text-rose-400"}`}>
                              {t.pnl}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow under dashboard */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[70%] h-[100px] bg-indigo-600/[0.12] rounded-full blur-[60px] pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
