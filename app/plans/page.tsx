"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "trial",
    name: "10-Day Trial",
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
    cta: "Start Trial — $10",
    highlight: false,
    accent: "#D9CA82",
    border: "border-[#D9CA82]/20",
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
    border: "",
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
    border: "border-[#4BA3D4]/30",
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
    border: "",
  },
];

export default function PlansPage() {
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => setIsLoggedIn(r.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  async function handleSelect(planId: string) {
    if (isLoggedIn === false) {
      window.location.href = "/register";
      return;
    }
    setSelecting(planId);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
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
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="hero-glow absolute inset-0" />
        <div className="dot-grid absolute inset-0 opacity-20" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-center border-b border-white/[0.05]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center">
            <Image src="/klar-removebg-preview.png" alt="KlarTrade" width={48} height={48} className="object-contain" />
          </div>
          <span className="text-[15px] font-bold tracking-tight">
            Klar<span className="text-[#4BA3D4]">Trade</span>
          </span>
        </Link>
      </header>

      <main className="relative z-10 px-6 pt-16 pb-24 max-w-5xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-14">
          <p className="text-[#4BA3D4] text-xs font-semibold uppercase tracking-widest mb-3">
            Simple pricing
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Choose your plan.
          </h1>
          <p className="text-[#6B7280] text-lg max-w-xl mx-auto">
            Start with the trial. Upgrade any time. Cancel any time.
          </p>
        </div>

        {/* Not logged in prompt */}
        {isLoggedIn === false && (
          <div className="mb-10 max-w-md mx-auto glass rounded-2xl p-6 text-center border border-white/[0.08]">
            <p className="text-sm font-medium text-[#F2F0EB] mb-1">Create your account first</p>
            <p className="text-xs text-[#6B7280] mb-4">Takes 30 seconds. Then complete checkout.</p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-[#03588C] hover:bg-[#4BA3D4] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all"
            >
              Create Account — Free
            </Link>
            <p className="text-[11px] text-[#6B7280] mt-3">
              Already have an account?{" "}
              <Link href="/login" className="text-[#4BA3D4] hover:text-[#F2F0EB] transition-colors">Sign in</Link>
            </p>
          </div>
        )}

        {/* Trial card — full width */}
        {(() => {
          const plan = plans[0];
          return (
            <div className={cn("glass rounded-2xl p-6 md:p-8 mb-4 border", plan.border)}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-3 inline-block"
                    style={{ color: plan.accent, background: `${plan.accent}18`, borderColor: `${plan.accent}33` }}>
                    {plan.badge}
                  </span>
                  <h2 className="text-2xl font-black text-[#F2F0EB] mb-1">{plan.name}</h2>
                  <p className="text-[#6B7280] text-sm">{plan.description}</p>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center gap-6 md:gap-8">
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-black text-[#F2F0EB]">${plan.price}</span>
                    <span className="text-[#6B7280] text-sm mb-1.5">{plan.priceSuffix}</span>
                  </div>
                  <button
                    onClick={() => handleSelect(plan.id)}
                    disabled={selecting !== null || isLoggedIn === null}
                    className="flex-shrink-0 flex items-center justify-center gap-2 font-bold text-sm px-8 py-3.5 rounded-xl transition-all disabled:opacity-60 whitespace-nowrap"
                    style={{ background: plan.accent, color: "#050508" }}
                  >
                    {selecting === plan.id
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                      : plan.cta}
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-white/[0.06] flex flex-wrap gap-x-6 gap-y-2">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: plan.accent }} />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Starter / Pro / Elite */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.slice(1).map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "glass rounded-2xl p-6 flex flex-col relative transition-all border",
                plan.highlight
                  ? `${plan.border} shadow-[0_0_40px_rgba(75,163,212,0.08)]`
                  : "border-transparent"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[11px] font-black rounded-full whitespace-nowrap"
                  style={{ background: plan.accent, color: "#050508" }}>
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
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: plan.accent }} />
                    {f}
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSelect(plan.id)}
                disabled={selecting !== null || isLoggedIn === null}
                className={cn(
                  "w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60",
                  plan.highlight
                    ? "text-[#050508]"
                    : "border border-white/[0.1] text-[#F2F0EB] hover:bg-white/[0.05]"
                )}
                style={plan.highlight ? { background: plan.accent } : undefined}
              >
                {selecting === plan.id
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                  : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-center text-red-400 text-sm mt-6">{error}</p>
        )}

        <p className="text-center text-[#6B7280]/50 text-xs mt-8">
          Secure checkout via Stripe · Cancel anytime · No hidden fees
        </p>
      </main>
    </div>
  );
}
