"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Eye, EyeOff, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
  ];
  const strength = checks.filter((c) => c.pass).length;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn("flex-1 h-1 rounded-full transition-all duration-300",
            i < strength ? (strength === 3 ? "bg-[#22C55E]" : strength === 2 ? "bg-[#F59E0B]" : "bg-red-500") : "bg-white/[0.08]")} />
        ))}
      </div>
      <div className="flex gap-3">
        {checks.map((c) => (
          <span key={c.label} className={cn("text-[10px] flex items-center gap-1", c.pass ? "text-[#22C55E]" : "text-[#6B7280]")}>
            <Check className="w-2.5 h-2.5" /> {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, password: form.password }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? "Registration failed");
      return;
    }

    setSuccess(true);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center px-4 py-12 relative overflow-hidden">
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
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-14 h-14 rounded-full bg-[#22C55E]/15 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7 text-[#22C55E]" strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-bold text-[#F2F0EB] mb-2">Welcome to KlarTrade!</h2>
                <p className="text-sm text-[#6B7280] mb-6">Your account is ready. Let&apos;s build your edge.</p>
                <Link href="/dashboard">
                  <Button className="w-full">Go to Dashboard <ArrowRight className="w-4 h-4" /></Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div key="form">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-[#F2F0EB] mb-1">Create your account</h1>
                  <p className="text-sm text-[#6B7280]">Free forever. No card needed.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { k: "name", label: "Full name", type: "text", placeholder: "John Smith" },
                    { k: "email", label: "Email", type: "email", placeholder: "you@example.com" },
                  ].map((f) => (
                    <div key={f.k}>
                      <label className="block text-xs font-medium text-[#6B7280] mb-1.5">{f.label}</label>
                      <input
                        type={f.type}
                        value={form[f.k as keyof typeof form]}
                        onChange={set(f.k)}
                        placeholder={f.placeholder}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#F2F0EB] placeholder-[#6B7280] focus:outline-none focus:border-[#03588C]/60 transition-all"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={form.password}
                        onChange={set("password")}
                        placeholder="Create a strong password"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 pr-11 text-sm text-[#F2F0EB] placeholder-[#6B7280] focus:outline-none focus:border-[#03588C]/60 transition-all"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.password && <PasswordStrength password={form.password} />}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Confirm password</label>
                    <input
                      type="password"
                      value={form.confirm}
                      onChange={set("confirm")}
                      placeholder="Repeat your password"
                      className={cn("w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-sm text-[#F2F0EB] placeholder-[#6B7280] focus:outline-none transition-all",
                        form.confirm && form.confirm !== form.password ? "border-red-500/50" : "border-white/[0.08] focus:border-[#03588C]/60")}
                    />
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <div
                      onClick={() => setAgreed(!agreed)}
                      className={cn("w-4 h-4 mt-0.5 rounded border flex items-center justify-center flex-shrink-0 transition-all cursor-pointer",
                        agreed ? "bg-[#03588C] border-[#03588C]" : "border-white/[0.2] bg-white/[0.04]")}
                    >
                      {agreed && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-xs text-[#6B7280] leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms" className="text-[#4BA3D4] hover:underline">Terms of Service</Link> and{" "}
                      <a href="#" className="text-[#4BA3D4] hover:underline">Privacy Policy</a>
                    </span>
                  </label>

                  {error && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
                  )}

                  <Button type="submit" className="w-full h-11" disabled={loading || !agreed}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">Create account <ArrowRight className="w-4 h-4" /></span>
                    )}
                  </Button>
                </form>

                <p className="text-center text-sm text-[#6B7280] mt-6">
                  Already have an account?{" "}
                  <Link href="/login" className="text-[#4BA3D4] hover:text-[#F2F0EB] font-medium transition-colors">Sign in</Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
