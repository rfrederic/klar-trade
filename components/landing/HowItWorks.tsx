"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Target, Crosshair, BarChart2 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Target,
    title: "Prepare",
    subtitle: "Build your edge before the market opens",
    description:
      "Define your trading plan, review economic events, set your risk parameters, and enter your mental state — all in one focused pre-session flow.",
    items: [
      "Review your active trading plan and rules",
      "Check the economic calendar for high-impact events",
      "Set daily max loss and position size limits",
      "Log your emotional state and readiness",
    ],
    color: "indigo",
    iconBg: "bg-indigo-500/15 text-indigo-400",
    border: "border-indigo-500/20",
    glow: "shadow-[0_0_40px_rgba(99,102,241,0.12)]",
  },
  {
    number: "02",
    icon: Crosshair,
    title: "Execute",
    subtitle: "Trade your plan, not your emotions",
    description:
      "Execute trades with AI-enforced discipline. Every entry is logged, every rule violation flagged, and your emotional state tracked in real time.",
    items: [
      "Use the position calculator for precise sizing",
      "Log each trade with setup and emotional state",
      "Get real-time warnings when rules are broken",
      "Track your discipline score live during the session",
    ],
    color: "violet",
    iconBg: "bg-violet-500/15 text-violet-400",
    border: "border-violet-500/20",
    glow: "shadow-[0_0_40px_rgba(139,92,246,0.12)]",
  },
  {
    number: "03",
    icon: BarChart2,
    title: "Review",
    subtitle: "Turn every session into a competitive advantage",
    description:
      "After each session, your AI coach delivers a full breakdown: what worked, what didn't, and one clear action to improve tomorrow.",
    items: [
      "AI-generated session summary and insights",
      "Pattern recognition across emotional states",
      "Rule adherence report and discipline score",
      "Weekly AI report with improvement priorities",
    ],
    color: "cyan",
    iconBg: "bg-cyan-500/15 text-cyan-400",
    border: "border-cyan-500/20",
    glow: "shadow-[0_0_40px_rgba(34,211,238,0.1)]",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" ref={ref} className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/[0.06] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <p className="text-sm text-indigo-400 font-semibold tracking-wider uppercase mb-3">
            The System
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold font-display text-white mb-5">
            Three steps to unbreakable discipline
          </h2>
          <p className="max-w-xl mx-auto text-slate-400 text-lg">
            Elite traders don't wing it. They have a system. Klartrade is that system.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[calc(33.33%-32px)] right-[calc(33.33%-32px)] h-[1px]">
            <div className="h-full bg-gradient-to-r from-indigo-500/40 via-violet-500/40 to-cyan-500/40" />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative"
            >
              {/* Step card */}
              <div className={`glass ${step.border} rounded-2xl p-7 h-full ${step.glow} hover:bg-white/[0.05] transition-all duration-300`}>
                {/* Step number + icon */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center ${step.iconBg} flex-shrink-0`}>
                    <step.icon className="w-6 h-6" />
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#050508] border border-white/[0.08] flex items-center justify-center">
                      <span className="text-[9px] font-bold text-slate-400">{i + 1}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">Step {step.number}</p>
                    <h3 className="text-2xl font-bold font-display text-white">{step.title}</h3>
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-300 mb-3">{step.subtitle}</p>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">{step.description}</p>

                {/* Checklist */}
                <ul className="space-y-2.5">
                  {step.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${step.iconBg}`}>
                        <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-sm text-slate-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
