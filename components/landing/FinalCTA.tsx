"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/[0.12] rounded-full blur-[130px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-violet-600/[0.08] rounded-full blur-[90px]" />
        <div className="grid-bg absolute inset-0 opacity-50" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/[0.08] text-indigo-400 text-sm font-medium mb-10">
            <TrendingUp className="w-3.5 h-3.5" />
            Join 12,400+ disciplined traders
          </div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display text-white leading-[1.08] mb-8 text-balance">
            You don&apos;t need another strategy.
            <br />
            <span className="gradient-text">
              You need a system that protects you from yourself.
            </span>
          </h2>

          {/* Body */}
          <p className="text-lg sm:text-xl text-slate-400 leading-relaxed mb-4 max-w-2xl mx-auto">
            The market doesn&apos;t take your money. Your emotions do. Klartrade gives you the clarity,
            structure, and accountability to finally trade the way you know you should.
          </p>
          <p className="text-base text-slate-500 mb-12 max-w-xl mx-auto">
            Every day you trade without a system is another day your edge leaks. Start building discipline today.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link href="/register">
              <Button size="xl" className="shadow-glow-lg min-w-[220px]">
                Start Free — No Card Required
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="xl" className="min-w-[180px]">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Social proof micro */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Free 14-day Pro trial
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              No credit card needed
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Cancel any time
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
