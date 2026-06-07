"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuoteContext =
  | "login"
  | "dashboard"
  | "session_open"
  | "trade_win"
  | "trade_loss"
  | "rule_break"
  | "streak"
  | "goal_hit"
  | "morning";

interface QuoteEntry {
  text: string;
  author?: string;
  category: "discipline" | "patience" | "emotion" | "consistency" | "risk" | "confidence" | "recovery" | "focus" | "execution" | "mindset";
  contexts: QuoteContext[];
}

const quotes: QuoteEntry[] = [
  { text: "The market rewards discipline, not emotion.", category: "discipline", contexts: ["dashboard", "session_open", "rule_break"] },
  { text: "One good trade is better than ten emotional trades.", category: "discipline", contexts: ["session_open", "rule_break"] },
  { text: "Protect your capital. Opportunities never stop coming.", category: "risk", contexts: ["trade_loss", "rule_break", "dashboard"] },
  { text: "Patience is a trading edge.", category: "patience", contexts: ["dashboard", "session_open", "morning"] },
  { text: "Your job is execution, not prediction.", category: "execution", contexts: ["session_open", "dashboard"] },
  { text: "Consistency beats intensity.", category: "consistency", contexts: ["dashboard", "morning"] },
  { text: "Professional traders manage risk first.", category: "risk", contexts: ["session_open", "dashboard"] },
  { text: "The best trade you make today might be the one you don't take.", category: "patience", contexts: ["session_open", "rule_break"] },
  { text: "Process over outcome. Every single time.", category: "discipline", contexts: ["trade_loss", "dashboard"] },
  { text: "A disciplined loss is not a failure. A revenge trade is.", category: "emotion", contexts: ["trade_loss", "rule_break"] },
  { text: "Your edge only works if you follow the rules.", category: "discipline", contexts: ["session_open", "rule_break"] },
  { text: "Slow down. The market will still be there.", category: "patience", contexts: ["session_open", "rule_break"] },
  { text: "Risk management is the only thing you can control.", category: "risk", contexts: ["session_open", "morning", "dashboard"] },
  { text: "One loss does not define your edge.", category: "recovery", contexts: ["trade_loss"] },
  { text: "Zoom out. A single trade is not your career.", category: "mindset", contexts: ["trade_loss", "rule_break"] },
  { text: "Confidence comes from preparation, not from the last trade.", category: "confidence", contexts: ["morning", "session_open"] },
  { text: "Trade what you see, not what you feel.", category: "emotion", contexts: ["session_open", "rule_break"] },
  { text: "The elite trader is boring. Predictable. Consistent.", category: "consistency", contexts: ["dashboard", "morning"] },
  { text: "React to the market. Don't predict it.", category: "execution", contexts: ["session_open"] },
  { text: "Every A+ setup waited for you. Give it the respect it deserves.", category: "patience", contexts: ["session_open", "morning"] },
  { text: "Stop trying to win. Start trying not to lose.", category: "risk", contexts: ["session_open", "trade_loss"] },
  { text: "Log the trade. Learn from it. Let it go.", category: "recovery", contexts: ["trade_loss", "trade_win"] },
  { text: "Mental capital is as important as financial capital.", category: "mindset", contexts: ["morning", "dashboard", "login"] },
  { text: "You don't need to be right. You need to manage risk.", category: "risk", contexts: ["dashboard", "session_open"] },
  { text: "Streaks are built one disciplined decision at a time.", category: "consistency", contexts: ["streak", "morning"] },
  { text: "Elite traders get out of losing trades fast. Always.", category: "discipline", contexts: ["session_open", "rule_break"] },
  { text: "The market humbles the arrogant. Stay grounded.", category: "mindset", contexts: ["trade_win", "streak"] },
  { text: "Focus on what you can repeat, not on what you wish had happened.", category: "focus", contexts: ["trade_loss", "dashboard"] },
  { text: "Your playbook exists for moments when your emotions don't.", category: "discipline", contexts: ["rule_break", "session_open"] },
  { text: "Great traders are made in their worst moments.", category: "recovery", contexts: ["trade_loss", "rule_break"] },
  { text: "A good execution on a bad outcome is still a good execution.", category: "execution", contexts: ["trade_loss"] },
  { text: "Size down. Slow down. Win more.", category: "risk", contexts: ["rule_break", "session_open", "trade_loss"] },
  { text: "Today's discipline is tomorrow's profit.", category: "discipline", contexts: ["morning", "dashboard"] },
  { text: "The market doesn't owe you anything.", category: "mindset", contexts: ["trade_loss", "rule_break"] },
  { text: "Every expert was once a beginner who refused to quit.", category: "confidence", contexts: ["login", "morning", "dashboard"] },
];

function getQuote(context?: QuoteContext): QuoteEntry {
  const pool = context ? quotes.filter((q) => q.contexts.includes(context)) : quotes;
  const source = pool.length > 0 ? pool : quotes;
  return source[Math.floor(Math.random() * source.length)];
}

const categoryColors: Record<string, string> = {
  discipline: "text-[#4BA3D4]",
  patience: "text-[#22C55E]",
  emotion: "text-[#F59E0B]",
  consistency: "text-[#4BA3D4]",
  risk: "text-red-400",
  confidence: "text-[#D9CA82]",
  recovery: "text-[#22C55E]",
  focus: "text-[#4BA3D4]",
  execution: "text-[#D9CA82]",
  mindset: "text-[#4BA3D4]",
};

interface QuoteToastProps {
  context?: QuoteContext;
  autoShow?: boolean;
  delay?: number;
}

export function QuoteToast({ context, autoShow = true, delay = 1200 }: QuoteToastProps) {
  const [visible, setVisible] = useState(false);
  const [quote, setQuote] = useState<QuoteEntry | null>(null);

  useEffect(() => {
    if (!autoShow) return;
    const timer = setTimeout(() => {
      setQuote(getQuote(context));
      setVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [autoShow, context, delay]);

  useEffect(() => {
    if (!visible) return;
    const dismiss = setTimeout(() => setVisible(false), 7000);
    return () => clearTimeout(dismiss);
  }, [visible]);

  if (!quote) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-4 right-4 z-[100] max-w-[320px] pointer-events-auto"
        >
          <div className="relative bg-[#06080f]/95 backdrop-blur-xl border border-[#03588C]/25 rounded-2xl px-5 py-4 shadow-glow-sm">
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#03588C]/10 rounded-full blur-2xl" />
            </div>
            <div className="relative">
              <div className="flex items-start justify-between gap-3 mb-2">
                <Quote className="w-4 h-4 text-[#03588C] flex-shrink-0 mt-0.5" />
                <button
                  onClick={() => setVisible(false)}
                  className="text-[#6B7280] hover:text-[#F2F0EB] transition-colors flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[13px] text-[#F2F0EB] leading-relaxed font-medium mb-2">
                &ldquo;{quote.text}&rdquo;
              </p>
              <span className={cn("text-[10px] font-semibold uppercase tracking-widest", categoryColors[quote.category])}>
                {quote.category}
              </span>
            </div>
            {/* Progress bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-[#03588C]/60 rounded-full"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 7, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Dashboard widget version
export function QuoteWidget() {
  const [mounted, setMounted] = useState(false);
  const [quote, setQuote] = useState<QuoteEntry | null>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setQuote(getQuote("dashboard"));
    setMounted(true);
  }, []);

  const rotate = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setQuote(getQuote("dashboard"));
      setFading(false);
    }, 300);
  }, []);

  // Render identical placeholder on server and first client render
  if (!mounted) {
    return (
      <div className="glass rounded-2xl px-5 py-4 border-l-2 border-[#03588C] h-[68px]" />
    );
  }

  return (
    <motion.div
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: 0.3 }}
      className="glass rounded-2xl px-5 py-4 border-l-2 border-[#03588C] cursor-pointer group"
      onClick={rotate}
      title="Click for a new quote"
    >
      <div className="flex items-start gap-3">
        <Quote className="w-4 h-4 text-[#4BA3D4] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] text-[#F2F0EB] leading-relaxed italic mb-1.5">
            &ldquo;{quote?.text}&rdquo;
          </p>
          <span className={cn("text-[10px] font-semibold uppercase tracking-widest", categoryColors[quote?.category ?? "discipline"])}>
            {quote?.category} · tap to refresh
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Focus mode overlay — shown before entering a session
export function QuoteFocusOverlay({ onDismiss }: { onDismiss: () => void }) {
  const quote = getQuote("session_open");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#050508]/90 backdrop-blur-md z-[200] flex items-center justify-center"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-lg text-center px-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-[#03588C]/20 border border-[#03588C]/30 flex items-center justify-center mx-auto mb-8">
          <Quote className="w-6 h-6 text-[#4BA3D4]" />
        </div>
        <p className="text-3xl font-bold text-[#F2F0EB] leading-tight mb-4">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className={cn("text-sm font-semibold uppercase tracking-widest mb-10", categoryColors[quote.category])}>
          {quote.category}
        </p>
        <button
          onClick={onDismiss}
          className="px-8 py-3 rounded-xl bg-[#03588C] text-white font-semibold hover:bg-[#024a77] transition-all shadow-glow-sm"
        >
          Enter the Market
        </button>
      </motion.div>
    </motion.div>
  );
}
