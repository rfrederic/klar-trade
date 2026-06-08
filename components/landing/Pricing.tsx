"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const plans = [
  {
    id: "basic",
    name: "Basic",
    description: "For traders just starting to build discipline.",
    price: { monthly: 0, yearly: 0 },
    badge: null,
    features: [
      "Trading journal (up to 50 trades/mo)",
      "Basic analytics dashboard",
      "Position size calculator",
      "Economic calendar",
      "1 active trading plan",
      "Mobile app access",
    ],
    cta: "Get Started Free",
    ctaVariant: "outline" as const,
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For serious traders who want an unfair edge.",
    price: { monthly: 49, yearly: 39 },
    badge: "Most Popular",
    features: [
      "Unlimited trade logging",
      "AI trading coach & analysis",
      "Discipline score & tracking",
      "Emotional state analytics",
      "Unlimited trading plans",
      "Risk guardrails & alerts",
      "Weekly AI performance reports",
      "Pattern recognition engine",
      "Session performance tracking",
      "Psychology reset protocols",
    ],
    cta: "Start 14-Day Free Trial",
    ctaVariant: "default" as const,
    highlighted: true,
  },
  {
    id: "elite",
    name: "Elite",
    description: "For professionals who demand the absolute best.",
    price: { monthly: 99, yearly: 79 },
    badge: null,
    features: [
      "Everything in Pro",
      "Priority AI insights (real-time)",
      "Advanced backtesting integration",
      "Team & prop firm access",
      "Custom rule builder",
      "API access",
      "White-glove onboarding",
      "1-on-1 trading coach session/mo",
      "Early access to new features",
      "Dedicated account manager",
    ],
    cta: "Start Elite Trial",
    ctaVariant: "gold" as const,
    highlighted: false,
  },
];

export function Pricing() {
  const [yearly, setYearly] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="pricing" ref={ref} className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/[0.07] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-sm text-indigo-400 font-semibold tracking-wider uppercase mb-3">Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-bold font-display text-white mb-5">
            Invest in your discipline
          </h2>
          <p className="max-w-lg mx-auto text-slate-400 text-lg mb-8">
            One bad trade costs more than a year of Klartrade. Choose the plan that protects your edge.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${!yearly ? "bg-white/[0.08] text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${yearly ? "bg-white/[0.08] text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              Yearly
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">-20%</span>
            </button>
          </div>
        </motion.div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className={`relative rounded-2xl p-7 flex flex-col transition-all duration-300 ${
                plan.highlighted
                  ? "bg-gradient-to-b from-indigo-500/[0.12] to-violet-500/[0.06] border border-indigo-500/40 shadow-[0_0_60px_rgba(99,102,241,0.18)] hover:shadow-[0_0_80px_rgba(99,102,241,0.25)] -translate-y-2 glow-border"
                  : "glass hover:bg-white/[0.05] hover:-translate-y-1"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold shadow-glow-sm">
                    <Star className="w-3 h-3 fill-white" />
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h3 className="text-lg font-bold font-display text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-slate-500">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-7">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold font-display text-white">
                    ${yearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-slate-500 text-sm mb-1.5">/month</span>
                  )}
                  {plan.price.monthly === 0 && (
                    <span className="text-slate-500 text-sm mb-1.5">forever</span>
                  )}
                </div>
                {yearly && plan.price.monthly > 0 && (
                  <p className="text-xs text-emerald-400 mt-1">
                    Billed annually · Save ${(plan.price.monthly - plan.price.yearly) * 12}/year
                  </p>
                )}
              </div>

              {/* CTA */}
              <Link href="/register" className="mb-7">
                <Button variant={plan.ctaVariant} className="w-full">
                  {plan.ctaVariant === "default" && <Zap className="w-4 h-4" />}
                  {plan.cta}
                </Button>
              </Link>

              {/* Features */}
              <ul className="space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${plan.highlighted ? "bg-indigo-500/20 text-indigo-400" : "bg-white/[0.06] text-slate-400"}`}>
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-sm text-slate-400">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center text-sm text-slate-600 mt-10"
        >
          No credit card required for free trial · Cancel anytime · 30-day money-back guarantee
        </motion.p>
      </div>
    </section>
  );
}
