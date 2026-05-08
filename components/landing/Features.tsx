"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Brain,
  Shield,
  BookOpen,
  Calculator,
  BarChart2,
  Heart,
  MessageSquare,
  Map,
  Calendar,
  Clock,
  RefreshCw,
  StickyNote,
  FileBarChart,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Trading Coach",
    description:
      "Your personal AI analyses every trade, identifies destructive patterns, and coaches you toward consistent execution.",
    color: "indigo",
    gradient: "from-indigo-500/20 to-indigo-500/5",
    border: "border-indigo-500/20",
    iconBg: "bg-indigo-500/15 text-indigo-400",
  },
  {
    icon: Shield,
    title: "Risk Guardrails",
    description:
      "Hard limits that protect your account when emotions try to override your plan. Max daily loss, position sizing, and more.",
    color: "violet",
    gradient: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/20",
    iconBg: "bg-violet-500/15 text-violet-400",
  },
  {
    icon: BookOpen,
    title: "Trading Journal",
    description:
      "A structured journal that captures not just what you traded — but how you felt, what you followed, and what you learned.",
    color: "cyan",
    gradient: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/20",
    iconBg: "bg-cyan-500/15 text-cyan-400",
  },
  {
    icon: Calculator,
    title: "Position Calculator",
    description:
      "Instantly calculate precise position sizes based on your account, risk tolerance, and stop placement.",
    color: "emerald",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/15 text-emerald-400",
  },
  {
    icon: BarChart2,
    title: "Trade Analytics",
    description:
      "Deep performance analytics that reveal your real edge — by setup, time, emotional state, and market condition.",
    color: "indigo",
    gradient: "from-indigo-500/20 to-indigo-500/5",
    border: "border-indigo-500/20",
    iconBg: "bg-indigo-500/15 text-indigo-400",
  },
  {
    icon: Heart,
    title: "Emotional Tracker",
    description:
      "Log your emotional state pre-trade and post-trade. Discover when fear, greed, or overconfidence costs you money.",
    color: "rose",
    gradient: "from-rose-500/20 to-rose-500/5",
    border: "border-rose-500/20",
    iconBg: "bg-rose-500/15 text-rose-400",
  },
  {
    icon: MessageSquare,
    title: "AI Chat Coach",
    description:
      "Ask anything about your recent trades, your psychology, or your plan. Get honest, data-driven responses.",
    color: "violet",
    gradient: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/20",
    iconBg: "bg-violet-500/15 text-violet-400",
  },
  {
    icon: Map,
    title: "Trading Plan Builder",
    description:
      "Build structured, rule-based trading plans with AI assistance. Then track your adherence in real time.",
    color: "amber",
    gradient: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/15 text-amber-400",
  },
  {
    icon: Calendar,
    title: "Economic Calendar",
    description:
      "Stay ahead of high-impact events with a smart calendar that filters by your traded instruments and sessions.",
    color: "cyan",
    gradient: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/20",
    iconBg: "bg-cyan-500/15 text-cyan-400",
  },
  {
    icon: Clock,
    title: "Session Tracker",
    description:
      "Monitor your performance across sessions. Know when you trade best — and when to step away.",
    color: "emerald",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/15 text-emerald-400",
  },
  {
    icon: RefreshCw,
    title: "Psychology Reset",
    description:
      "After a losing streak or emotional spiral, use guided reset protocols to restore clarity before you trade again.",
    color: "indigo",
    gradient: "from-indigo-500/20 to-indigo-500/5",
    border: "border-indigo-500/20",
    iconBg: "bg-indigo-500/15 text-indigo-400",
  },
  {
    icon: FileBarChart,
    title: "Weekly AI Reports",
    description:
      "Receive a comprehensive weekly breakdown of your performance, psychology patterns, and actionable improvements.",
    color: "violet",
    gradient: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/20",
    iconBg: "bg-violet-500/15 text-violet-400",
  },
  {
    icon: StickyNote,
    title: "Trading Notebook",
    description:
      "Keep contextual notes on market conditions, ideas, and observations organized alongside your trades.",
    color: "amber",
    gradient: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/15 text-amber-400",
  },
  {
    icon: Zap,
    title: "Discipline Score",
    description:
      "A single score that reflects your plan adherence, emotional control, and rule-following — updated after every trade.",
    color: "emerald",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/15 text-emerald-400",
  },
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" ref={ref} className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm text-indigo-400 font-semibold tracking-wider uppercase mb-3">
            Everything You Need
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold font-display text-white mb-5">
            Your edge, protected
          </h2>
          <p className="max-w-xl mx-auto text-slate-400 text-lg">
            Every tool you need to trade with precision, discipline, and clarity — in one unified platform.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: Math.floor(i / 4) * 0.08 + (i % 4) * 0.06 }}
              className={`group relative glass ${feature.border} rounded-2xl p-5 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-0.5 cursor-default overflow-hidden`}
            >
              {/* Gradient hover overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />

              <div className="relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${feature.iconBg}`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
