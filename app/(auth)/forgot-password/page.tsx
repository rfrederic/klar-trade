"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? "Failed to send reset link");
      return;
    }

    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="hero-glow absolute inset-0 pointer-events-none" />
      <div className="dot-grid absolute inset-0 opacity-30 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative"
      >
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 flex items-center justify-center">
            <Image src="/klar-removebg-preview.png" alt="KlarTrade logo" width={52} height={52} className="object-contain" />
          </div>
          <span className="text-lg font-bold text-[#F2F0EB] tracking-tight">
            Klar<span className="text-[#4BA3D4]">Trade</span>
          </span>
        </div>

        <div className="glass rounded-2xl p-8 shadow-glow-sm">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-[#03588C]/15 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7 text-[#4BA3D4]" strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-bold text-[#F2F0EB] mb-2">Check your email</h2>
                <p className="text-sm text-[#6B7280] mb-1">We sent a reset link to</p>
                <p className="text-sm font-medium text-[#F2F0EB] mb-6">{email}</p>
                <p className="text-xs text-[#6B7280] mb-6">Didn&apos;t receive it? Check your spam folder or try again in a few minutes.</p>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4" /> Back to login
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div key="form">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-[#F2F0EB] mb-1">Reset password</h1>
                  <p className="text-sm text-[#6B7280]">Enter your email to receive a reset link.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#F2F0EB] placeholder-[#6B7280] focus:outline-none focus:border-[#03588C]/60 transition-all"
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
                  )}

                  <Button type="submit" className="w-full h-11" disabled={loading || !email}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">Send reset link <ArrowRight className="w-4 h-4" /></span>
                    )}
                  </Button>
                </form>

                <p className="text-center text-sm text-[#6B7280] mt-6">
                  <Link href="/login" className="text-[#4BA3D4] hover:text-[#F2F0EB] font-medium transition-colors flex items-center justify-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
