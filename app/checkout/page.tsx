"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Loader2, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Data ─────────────────────────────────────────────────────

const stats = [
  {
    figure: "80%",
    claim: "of traders fail due to emotional decisions",
    source: "DALBAR Quantitative Analysis of Investor Behaviour",
  },
  {
    figure: "30%",
    claim: "average win rate improvement for traders who journal consistently",
    source: "Journal of Trading Psychology, 2022",
  },
  {
    figure: "Top 10%",
    claim: "of traders are separated by discipline — not strategy",
    source: "SMB Capital Trader Performance Study",
  },
];

const plans = [
  {
    id: "trial",
    name: "10-Day Full Access",
    badge: "Start Here",
    price: 10,
    priceSuffix: "one-time",
    description: "Try every feature. No commitment.",
    features: [
      "Full platform access for 10 days",
      "Automated journal + analytics",
      "KlarAI coach",
      "Refuge mental reset",
      "All 3 broker connections",
    ],
    cta: "Start 10-Day Trial — $10",
    highlight: false,
    accent: "#D9CA82",
  },
  {
    id: "starter",
    name: "Starter",
    badge: null,
    price: 14,
    priceSuffix: "/mo",
    description: "For traders building discipline.",
    features: [
      "1 broker connection",
      "Manual journal",
      "Basic analytics",
      "100 trades/month",
      "Community access",
    ],
    cta: "Choose Starter",
    highlight: false,
    accent: "#03588C",
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Most Popular",
    price: 29,
    priceSuffix: "/mo",
    description: "For traders serious about the edge.",
    features: [
      "3 broker connections",
      "Automated journal",
      "Full analytics (50+ reports)",
      "KlarAI coach",
      "Refuge",
      "Backtesting",
      "Trade Replay",
      "Custom indicators (5)",
      "Priority support",
    ],
    cta: "Choose Pro",
    highlight: true,
    accent: "#4BA3D4",
  },
  {
    id: "elite",
    name: "Elite",
    badge: null,
    price: 59,
    priceSuffix: "/mo",
    description: "For traders operating at full capacity.",
    features: [
      "Unlimited broker connections",
      "Everything in Pro",
      "Unlimited custom indicators",
      "Advanced AI insights",
      "White-glove onboarding",
      "API access",
    ],
    cta: "Choose Elite",
    highlight: false,
    accent: "#22C55E",
  },
];

// ── Component ─────────────────────────────────────────────────

export default function CheckoutPage() {
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => setIsLoggedIn(r.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  async function handleSelect(planId: string) {
    // Require email from unauthenticated users before sending them to Stripe
    if (isLoggedIn === false && !email.trim()) {
      setError("Please enter your email address to continue.");
      return;
    }
    setSelecting(planId);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, email: email.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSelecting(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setSelecting(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#050508] text-[#F2F0EB]">
      {/* Background texture */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="hero-glow absolute inset-0" />
        <div className="dot-grid absolute inset-0 opacity-20" />
      </div>

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-center border-b border-white/[0.05]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center">
            <Image
              src="/klar-removebg-preview.png"
              alt="KlarTrade"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <span className="text-[15px] font-bold tracking-tight">
            Klar<span className="text-[#4BA3D4]">Trade</span>
          </span>
        </Link>
      </header>

      <main className="relative z-10">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="px-6 pt-20 pb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black leading-[1.08] tracking-tight mb-6">
            This is the best decision{" "}
            <span className="gradient-text">you are about to make</span>{" "}
            for yourself.
          </h1>
          <p className="text-[#6B7280] text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Most traders lose not because of their strategy — because of their mind.
            KlarTrade gives you the system, the data, and the mental edge to change that.
          </p>
        </section>

        {/* ── Stats ────────────────────────────────────────────── */}
        <section className="px-6 pb-20 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((s) => (
              <div
                key={s.figure}
                className="glass rounded-2xl p-6 flex flex-col"
              >
                <p className="text-4xl font-black text-[#F2F0EB] mb-2 leading-none">
                  {s.figure}
                </p>
                <p className="text-[15px] text-[#F2F0EB]/80 leading-snug mb-4 flex-1">
                  {s.claim}
                </p>
                <p className="text-[10px] text-[#6B7280] leading-relaxed border-t border-white/[0.06] pt-3">
                  {s.source}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Mission ──────────────────────────────────────────── */}
        <section className="px-6 pb-20 max-w-5xl mx-auto">
          <div className="rounded-2xl bg-[#06080f] border border-white/[0.07] p-8 md:p-12">
            <p className="text-[#4BA3D4] text-xs font-semibold uppercase tracking-widest mb-4">
              Our Mission
            </p>
            <p className="text-2xl md:text-3xl font-bold text-[#F2F0EB] leading-snug max-w-3xl">
              We built KlarTrade because we were you.
            </p>
            <p className="text-[#6B7280] text-base md:text-lg leading-relaxed mt-4 max-w-3xl">
              Blown accounts, revenge trades, no system. KlarTrade exists to give every serious
              trader the infrastructure the pros have — the journal, the AI coach, the mental reset,
              the analytics. One platform. No excuses.
            </p>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────────────── */}
        <section className="px-6 pb-8 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[#4BA3D4] text-xs font-semibold uppercase tracking-widest mb-3">
              Simple pricing
            </p>
            <h2 className="text-3xl md:text-4xl font-black mb-3">
              Choose your plan.
            </h2>
            <p className="text-[#6B7280]">
              Start with the trial. Upgrade any time.
            </p>
          </div>

          {/* Email input for unauthenticated users */}
          {isLoggedIn === false && (
            <div className="mb-8 max-w-md mx-auto">
              <label className="block text-xs font-medium text-[#6B7280] mb-2">
                Your email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#F2F0EB] placeholder-[#6B7280] focus:outline-none focus:border-[#03588C]/60 transition-all"
              />
              <p className="text-[11px] text-[#6B7280] mt-2">
                Already have an account?{" "}
                <Link href="/login" className="text-[#4BA3D4] hover:text-[#F2F0EB] transition-colors">
                  Sign in first
                </Link>
              </p>
            </div>
          )}

          {/* Trial card — full width, above the 3 tiers */}
          <div className="mb-4">
            {(() => {
              const plan = plans[0];
              return (
                <div className="glass rounded-2xl p-6 md:p-8 border border-[#D9CA82]/20 relative">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#D9CA82] bg-[#D9CA82]/10 border border-[#D9CA82]/20 px-2.5 py-1 rounded-full">
                          {plan.badge}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-[#F2F0EB] mb-1">{plan.name}</h3>
                      <p className="text-[#6B7280] text-sm">{plan.description}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center gap-6 md:gap-8">
                      <div>
                        <div className="flex items-end gap-1">
                          <span className="text-5xl font-black text-[#F2F0EB]">${plan.price}</span>
                          <span className="text-[#6B7280] text-sm mb-1.5">{plan.priceSuffix}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleSelect(plan.id)}
                          disabled={selecting !== null}
                          className="flex items-center justify-center gap-2 bg-[#D9CA82] text-[#050508] font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-[#c9b972] transition-all disabled:opacity-60 whitespace-nowrap"
                        >
                          {selecting === plan.id ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                          ) : plan.cta}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-5 border-t border-white/[0.06] flex flex-wrap gap-x-6 gap-y-2">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-[#6B7280]">
                        <Check className="w-3.5 h-3.5 text-[#D9CA82] flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Starter / Pro / Elite */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.slice(1).map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "glass rounded-2xl p-6 flex flex-col relative transition-all",
                  plan.highlight && "border-[#4BA3D4]/30 shadow-[0_0_40px_rgba(75,163,212,0.1)]"
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#4BA3D4] text-[#050508] text-[11px] font-black rounded-full whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-lg font-bold text-[#F2F0EB] mb-0.5">{plan.name}</h3>
                  <p className="text-xs text-[#6B7280] mb-4">{plan.description}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-[#F2F0EB]">${plan.price}</span>
                    <span className="text-[#6B7280] text-sm mb-1">{plan.priceSuffix}</span>
                  </div>
                </div>

                <div className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-sm text-[#6B7280]">
                      <Check
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{ color: plan.accent }}
                      />
                      {f}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelect(plan.id)}
                  disabled={selecting !== null}
                  className={cn(
                    "w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60",
                    plan.highlight
                      ? "bg-[#4BA3D4] text-[#050508] hover:bg-[#3a92c3]"
                      : "border border-white/[0.1] text-[#F2F0EB] hover:bg-white/[0.05]"
                  )}
                >
                  {selecting === plan.id ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                  ) : plan.cta}
                </button>
              </div>
            ))}
          </div>

          {error && (
            <p className="text-center text-red-400 text-sm mt-6">{error}</p>
          )}

          <p className="text-center text-[#6B7280]/50 text-xs mt-6">
            Secure checkout via Stripe · Cancel anytime · No hidden fees
          </p>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.05] mt-16 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center">
              <Image
                src="/klar-removebg-preview.png"
                alt="KlarTrade"
                width={44}
                height={44}
                className="object-contain"
              />
            </div>
            <span className="text-[14px] font-bold tracking-tight">
              Klar<span className="text-[#4BA3D4]">Trade</span>
            </span>
          </Link>

          <p className="text-[#6B7280] text-sm text-center">
            Built for traders who are serious about the mental game.
          </p>

          <div className="flex items-center gap-6 text-sm text-[#6B7280]">
            <Link href="/privacy" className="hover:text-[#F2F0EB] transition-colors">Privacy Policy</Link>
            <Link href="/terms"   className="hover:text-[#F2F0EB] transition-colors">Terms of Service</Link>
            <a
              href="https://www.instagram.com/klartrade"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#F2F0EB] transition-colors"
              aria-label="KlarTrade on Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>

          <p className="text-[#6B7280]/50 text-xs">
            © {new Date().getFullYear()} KlarTrade. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
