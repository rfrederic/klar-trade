"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Star, TrendingUp, Shield, Users } from "lucide-react";

const stats = [
  { value: "12,400+", label: "Active Traders", icon: Users, color: "text-indigo-400" },
  { value: "94%", label: "Avg Discipline Score", icon: Shield, color: "text-violet-400" },
  { value: "$2.8M", label: "Saved in Bad Trades", icon: TrendingUp, color: "text-emerald-400" },
  { value: "4.9/5", label: "Trader Rating", icon: Star, color: "text-amber-400" },
];

const testimonials = [
  {
    name: "Marcus Chen",
    role: "Futures Trader · 6 years",
    avatar: "MC",
    content:
      "Klartrade completely changed how I approach the market. The AI coach caught that I was revenge trading after losses — something I didn't even admit to myself. Win rate up 14% in 60 days.",
    rating: 5,
    metric: "+14% Win Rate",
  },
  {
    name: "Sarah Okonkwo",
    role: "Forex Trader · 4 years",
    avatar: "SO",
    content:
      "I finally have a system that holds me accountable. The discipline score feels like having a coach looking over my shoulder — but without the judgment. Pure clarity.",
    rating: 5,
    metric: "94 Discipline Score",
  },
  {
    name: "James Whitfield",
    role: "Equities Trader · 9 years",
    avatar: "JW",
    content:
      "The weekly AI reports are insane. It identified a pattern where I overtrade on Mondays after bad Fridays. Fixed that one thing and my drawdown dropped 40%.",
    rating: 5,
    metric: "-40% Max Drawdown",
  },
];

export function TrustSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 section-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-6 text-center hover:bg-white/[0.05] transition-colors duration-300"
            >
              <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center bg-white/[0.04] ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className={`text-3xl font-bold font-display mb-1 ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mb-12"
        >
          <p className="text-sm text-indigo-400 font-semibold tracking-wider uppercase mb-3">
            Trader Stories
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white">
            What clarity feels like
          </h2>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
              className="glass rounded-2xl p-6 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-1 group"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-6">&ldquo;{t.content}&rdquo;</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400 font-semibold">{t.metric}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
