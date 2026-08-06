"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function ComingSoonClient() {
  const router = useRouter();
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/early-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    setLoading(false);
    if (!res.ok) {
      setError("That code isn't valid. Double-check and try again.");
      return;
    }

    router.push("/register");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="hero-glow absolute inset-0 pointer-events-none" />
      <div className="dot-grid absolute inset-0 opacity-30 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative text-center"
      >
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 flex items-center justify-center">
            <Image src="/klar-removebg-preview.png" alt="KlarTrade logo" width={52} height={52} className="object-contain" />
          </div>
          <span className="text-lg font-bold text-[#F2F0EB] tracking-tight">
            Klar<span className="text-[#4BA3D4]">Trade</span>
          </span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#03588C]/15 border border-[#03588C]/30 text-[#4BA3D4] text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Coming Soon
        </div>

        <h1 className="text-4xl sm:text-5xl font-black leading-[1.1] tracking-tight mb-5 text-[#F2F0EB]">
          Trade with clarity.{" "}
          <span className="gradient-text">Execute with discipline.</span>
        </h1>

        <p className="text-base text-[#6B7280] max-w-md mx-auto mb-10 leading-relaxed">
          KlarTrade is an AI-powered trading journal that builds discipline, tracks your edge,
          and protects your mental game. We&apos;re putting the finishing touches on it —
          full public access is on the way.
        </p>

        <div className="glass rounded-2xl p-6 shadow-glow-sm max-w-sm mx-auto">
          {!showCodeInput ? (
            <button
              onClick={() => setShowCodeInput(true)}
              className="text-sm text-[#4BA3D4] hover:text-[#F2F0EB] font-medium transition-colors"
            >
              Have an access code?
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="block text-xs font-medium text-[#6B7280] text-left mb-1.5">
                Access code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your code"
                autoFocus
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#F2F0EB] placeholder-[#6B7280] text-center tracking-wide focus:outline-none focus:border-[#03588C]/60 transition-all"
              />

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !code}
                className="w-full h-11 flex items-center justify-center gap-2 bg-[#03588C] text-white rounded-xl text-sm font-semibold hover:bg-[#024a77] transition-all shadow-glow-xs disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Unlock access <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
