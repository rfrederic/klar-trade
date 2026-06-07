"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles, TrendingUp, BarChart2, BookOpen, Leaf, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 14,
    description: "For traders getting disciplined.",
    features: [
      "1 broker connection",
      "Manual journal",
      "Basic analytics",
      "100 trades/month",
      "Community access",
    ],
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
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
    highlight: true,
  },
  {
    id: "elite",
    name: "Elite",
    price: 59,
    description: "For traders operating at full capacity.",
    features: [
      "Unlimited broker connections",
      "Everything in Pro",
      "Unlimited custom indicators",
      "Advanced AI insights",
      "White-glove onboarding",
      "API access",
    ],
    highlight: false,
  },
];

function DashboardMockup() {
  return (
    <div className="w-full h-full bg-[#050508] flex overflow-hidden select-none pointer-events-none">
      {/* Sidebar */}
      <div className="w-52 flex-shrink-0 border-r border-white/[0.04] bg-[#06080f] p-3 space-y-1">
        <div className="px-3 py-2 mb-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#03588C]/30" />
          <div className="h-3 w-20 rounded bg-white/10" />
        </div>
        {["Dashboard", "Trading", "Journal", "Edge", "KlarAI", "Analytics", "Risk", "Refuge", "Notebook", "Settings"].map((item, i) => (
          <div key={item} className={cn(
            "px-3 py-2 rounded-lg flex items-center gap-2",
            i === 0 ? "bg-[#03588C]/20 text-[#4BA3D4]" : "text-[#6B7280]/50"
          )}>
            <div className={cn("w-3.5 h-3.5 rounded-sm flex-shrink-0", i === 0 ? "bg-[#03588C]/60" : "bg-white/[0.06]")} />
            <span className="text-xs font-medium">{item}</span>
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 p-6 overflow-hidden">
        {/* KPI row */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: "Balance", value: "$92,182", color: "#F2F0EB", icon: TrendingUp },
            { label: "Net P&L", value: "+$12,840", color: "#22C55E", icon: BarChart2 },
            { label: "Win Rate", value: "68.4%", color: "#4BA3D4", icon: BookOpen },
            { label: "Discipline", value: "94/100", color: "#D9CA82", icon: Shield },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-[#6B7280]">{s.label}</p>
                <s.icon className="w-3 h-3 text-[#6B7280]/40" />
              </div>
              <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Equity chart */}
        <div className="glass rounded-xl p-4 mb-4 h-36 flex items-end gap-0.5 overflow-hidden">
          {Array.from({ length: 48 }, (_, i) => {
            const h = 18 + Math.sin(i * 0.38) * 16 + i * 1.1;
            return (
              <div key={i} className="flex-1 rounded-sm opacity-80" style={{
                height: `${Math.min(Math.max(h, 5), 92)}%`,
                background: h > 52 ? "rgba(34,197,94,0.45)" : "rgba(3,88,140,0.3)",
              }} />
            );
          })}
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-3 gap-3">
          {/* AI insight */}
          <div className="glass rounded-xl p-3 border-l-2 border-[#03588C]">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3 h-3 text-[#4BA3D4]" />
              <span className="text-[9px] text-[#4BA3D4] font-semibold">KlarAI Insight</span>
            </div>
            <p className="text-[9px] text-[#6B7280] leading-relaxed">Your London session win rate is 43% higher than NY. Focus your trading hours for maximum edge.</p>
          </div>

          {/* Recent trades */}
          <div className="glass rounded-xl p-3">
            <p className="text-[9px] text-[#6B7280] font-semibold mb-2">Recent Trades</p>
            {[["EURUSD", "+$342", "#22C55E"], ["NQ", "-$128", "#EF4444"], ["AAPL", "+$89", "#22C55E"]].map(([sym, pnl, col]) => (
              <div key={sym} className="flex items-center justify-between py-1 border-b border-white/[0.04] last:border-0">
                <span className="text-[9px] text-[#6B7280]">{sym}</span>
                <span className="text-[9px] font-mono" style={{ color: col }}>{pnl}</span>
              </div>
            ))}
          </div>

          {/* Refuge */}
          <div className="glass rounded-xl p-3 border-l-2 border-[#4A9B6F]">
            <div className="flex items-center gap-1.5 mb-2">
              <Leaf className="w-3 h-3 text-[#4A9B6F]" />
              <span className="text-[9px] text-[#4A9B6F] font-semibold">Refuge</span>
            </div>
            <p className="text-[9px] text-[#6B7280] leading-relaxed">3-day streak · Last session: Golden Forest · 8 min</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChoosePlanPage() {
  const router = useRouter();
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function selectPlan(planId: string) {
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
    <div className="relative min-h-screen overflow-hidden bg-[#050508]">

      {/* Blurred dashboard background */}
      <div className="absolute inset-0 scale-105" aria-hidden="true">
        <DashboardMockup />
        <div className="absolute inset-0 backdrop-blur-md bg-[#050508]/60" />
      </div>

      {/* Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-4xl">

          <div className="text-center mb-10">
            <p className="text-[#4BA3D4] text-xs font-semibold uppercase tracking-widest mb-3">
              Trial ended
            </p>
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight text-[#F2F0EB]">
              Your 10-day trial has ended.
            </h1>
            <p className="text-[#6B7280] text-base max-w-md mx-auto">
              Choose a plan to keep access to everything.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "glass rounded-2xl p-6 flex flex-col relative transition-all",
                  plan.highlight && "border-[#03588C]/50 shadow-[0_0_40px_rgba(3,88,140,0.2)]"
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#D9CA82] text-[#050508] text-[11px] font-black rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#F2F0EB] mb-0.5">{plan.name}</h2>
                  <p className="text-xs text-[#6B7280] mb-4">{plan.description}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-[#F2F0EB]">${plan.price}</span>
                    <span className="text-[#6B7280] text-sm mb-1">/mo</span>
                  </div>
                </div>

                <div className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-sm text-[#6B7280]">
                      <Check className="w-4 h-4 text-[#03588C] flex-shrink-0 mt-0.5" />
                      {f}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => selectPlan(plan.id)}
                  disabled={selecting !== null}
                  className={cn(
                    "w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
                    plan.highlight
                      ? "bg-[#03588C] text-white hover:bg-[#024a77] disabled:opacity-60"
                      : "border border-white/[0.1] text-[#F2F0EB] hover:bg-white/[0.05] disabled:opacity-60"
                  )}
                >
                  {selecting === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Activating…
                    </>
                  ) : (
                    plan.id === "trial" ? "Pay $10 & Continue" : `Choose ${plan.name}`
                  )}
                </button>
              </div>
            ))}
          </div>

          {error && (
            <p className="text-center text-red-400 text-sm mt-6">{error}</p>
          )}

          <p className="text-center text-[#6B7280]/60 text-xs mt-8">
            Secure billing · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
