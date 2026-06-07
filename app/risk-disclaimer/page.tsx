import Link from "next/link";
import Image from "next/image";
import { AlertTriangle } from "lucide-react";

export const metadata = { title: "Risk Disclaimer — KlarTrade" };

const sections = [
  {
    title: "No Financial Advice",
    body: "KlarTrade and its team do not provide investment, financial, legal, or tax advice. Any information shown in the app, on our website, or in our content is for educational and informational purposes only and should not be interpreted as a recommendation to buy, sell, or hold any financial product.",
  },
  {
    title: "Past Performance",
    body: "Past performance, statistics, or results shown in KlarTrade do not guarantee future results. Market conditions change, and outcomes vary.",
  },
  {
    title: "Execution and Broker Risk",
    body: "KlarTrade is not a broker and does not hold client funds. Trades may be routed through third-party brokers and integrations. Execution, pricing, spreads, slippage, latency, outages, and broker restrictions can affect outcomes. You are responsible for verifying all orders, position sizes, and risk settings before placing a trade.",
  },
  {
    title: "Technology Risk",
    body: "Software and integrations can fail. KlarTrade may experience errors, delays, data gaps, or downtime. We do not guarantee that the platform will be uninterrupted, accurate, or free of defects.",
  },
  {
    title: "User Responsibility",
    body: "You are solely responsible for your trading decisions, risk management, and compliance with applicable laws and broker terms. Do not trade money you cannot afford to lose. If you are unsure, seek independent professional advice.",
  },
];

export default function RiskDisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-[#F2F0EB]">
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="dot-grid absolute inset-0 opacity-10" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-5 border-b border-white/[0.05]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
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
          <Link href="/" className="text-sm text-[#6B7280] hover:text-[#F2F0EB] transition-colors">
            ← Back
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-16">

        {/* Title */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            </div>
            <h1 className="text-4xl font-black">Risk Disclaimer</h1>
          </div>
          <p className="text-[#6B7280] text-sm mb-6">Last updated: 05 June 2026</p>

          {/* Lead statement */}
          <div className="glass rounded-2xl p-6 border-l-2 border-yellow-500/40">
            <p className="text-[#F2F0EB] text-base leading-relaxed">
              KlarTrade is trading software designed to help you plan, execute, journal, and review
              your trades. Trading foreign exchange and leveraged products involves{" "}
              <strong className="text-[#F2F0EB]">significant risk</strong> and may not be suitable
              for all investors. <strong className="text-yellow-400">You can lose some or all of your capital.</strong>
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-bold text-[#F2F0EB] mb-3 pb-3 border-b border-white/[0.06]">
                {s.title}
              </h2>
              <p className="text-[#6B7280] text-sm leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>

        {/* Acknowledgement */}
        <div className="mt-12 glass rounded-2xl p-6 border border-yellow-500/15 bg-yellow-500/[0.03]">
          <p className="text-sm text-[#F2F0EB]/80 leading-relaxed text-center">
            By using KlarTrade, you acknowledge and accept these risks.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 px-6 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/klar-removebg-preview.png" alt="KlarTrade" width={28} height={28} className="object-contain" />
            <span className="text-sm font-bold">Klar<span className="text-[#4BA3D4]">Trade</span></span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-[#6B7280]">
            <Link href="/privacy"          className="hover:text-[#F2F0EB] transition-colors">Privacy Policy</Link>
            <Link href="/terms"            className="hover:text-[#F2F0EB] transition-colors">Terms of Service</Link>
            <Link href="/risk-disclaimer"  className="text-[#F2F0EB]">Risk Disclaimer</Link>
          </div>
          <p className="text-xs text-[#6B7280]">© {new Date().getFullYear()} KlarTrade. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
