"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Eye, EyeOff, ArrowRight, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [message, setMessage]   = useState("");
  const [ready, setReady]       = useState(false);
  const [checking, setChecking] = useState(true);
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const supabase     = createClient();
  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("error")) {
      setChecking(false);
      return;
    }

    // Implicit flow: Supabase sends #access_token=...&type=recovery
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash.includes("access_token")) {
      const params = new URLSearchParams(hash.slice(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token") ?? "";
      if (accessToken) {
        supabase.auth
          .setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ error }) => {
            if (!error) setReady(true);
            setChecking(false);
          });
        return;
      }
    }

    // PKCE flow: Supabase sends ?code=...
    const code = searchParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!error) setReady(true);
        setChecking(false);
      });
      return;
    }

    // Already has a session (PASSWORD_RECOVERY fired before subscription)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
        setChecking(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    if (!ready) {
      setMessage("Invalid or expired reset link. Please request a new one.");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated! Redirecting...");
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  const done = message === "Password updated! Redirecting...";

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
          {done ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[#22C55E]/15 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-[#22C55E]" strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-[#F2F0EB] mb-2">Password updated</h2>
              <p className="text-sm text-[#6B7280]">Redirecting you to login...</p>
            </div>
          ) : !checking && !ready ? (
            <div className="text-center py-4">
              <h2 className="text-xl font-bold text-[#F2F0EB] mb-2">Link expired</h2>
              <p className="text-sm text-[#6B7280] mb-6">This reset link is invalid or has already been used. Request a new one.</p>
              <Link href="/forgot-password">
                <Button className="w-full h-11">
                  <span className="flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Request new link</span>
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#F2F0EB] mb-1">Set new password</h1>
                <p className="text-sm text-[#6B7280]">Choose a strong password for your account.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1.5">New password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 pr-11 text-sm text-[#F2F0EB] placeholder-[#6B7280] focus:outline-none focus:border-[#03588C]/60 transition-all"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#F2F0EB] transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Confirm password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#F2F0EB] placeholder-[#6B7280] focus:outline-none focus:border-[#03588C]/60 transition-all"
                  />
                </div>

                {message && !done && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{message}</p>
                )}

                <Button
                  onClick={handleReset}
                  className="w-full h-11"
                  disabled={loading || checking || !password || !confirm}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Update password <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
