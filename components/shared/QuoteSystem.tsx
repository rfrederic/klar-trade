"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Quote as QuoteIcon, Sparkles } from "lucide-react";
import {
  Quote,
  QuoteContext,
  QuoteCategory,
  getContextualQuote,
  getRandomQuote,
  categoryMeta,
} from "@/lib/quotes";

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────
interface QuoteSystemState {
  triggerQuote: (context?: QuoteContext, category?: QuoteCategory) => void;
  dismissQuote: () => void;
}

const QuoteCtx = createContext<QuoteSystemState>({
  triggerQuote: () => {},
  dismissQuote: () => {},
});

export function useQuotes() {
  return useContext(QuoteCtx);
}

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────
const AUTO_DISMISS_MS = 7000;

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<Quote | null>(null);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const dismissQuote = useCallback(() => {
    clearTimers();
    setCurrent(null);
    setProgress(100);
  }, []);

  const triggerQuote = useCallback(
    (context?: QuoteContext, category?: QuoteCategory) => {
      clearTimers();
      const quote = category
        ? getRandomQuote(category)
        : getContextualQuote(context ?? "general");
      setCurrent(quote);
      setProgress(100);

      const step = 100 / (AUTO_DISMISS_MS / 100);
      intervalRef.current = setInterval(() => {
        setProgress((p) => Math.max(0, p - step));
      }, 100);

      timeoutRef.current = setTimeout(() => {
        setCurrent(null);
        setProgress(100);
      }, AUTO_DISMISS_MS);
    },
    []
  );

  // Show a quote on initial load
  useEffect(() => {
    const timer = setTimeout(() => triggerQuote("login"), 1200);
    return () => clearTimeout(timer);
  }, [triggerQuote]);

  return (
    <QuoteCtx.Provider value={{ triggerQuote, dismissQuote }}>
      {children}
      <QuoteToast quote={current} progress={progress} onDismiss={dismissQuote} />
    </QuoteCtx.Provider>
  );
}

// ─────────────────────────────────────────────
// Floating Toast
// ─────────────────────────────────────────────
interface QuoteToastProps {
  quote: Quote | null;
  progress: number;
  onDismiss: () => void;
}

function QuoteToast({ quote, progress, onDismiss }: QuoteToastProps) {
  const meta = quote ? categoryMeta[quote.category] : null;

  return (
    <AnimatePresence>
      {quote && meta && (
        <motion.div
          key={quote.id}
          initial={{ opacity: 0, x: 40, y: -10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-5 right-5 z-[9999] max-w-[340px] w-full pointer-events-auto"
        >
          {/* Card */}
          <div className="relative backdrop-blur-xl bg-[#0a0a14]/90 border border-white/[0.1] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(99,102,241,0.18),0_16px_40px_rgba(0,0,0,0.6)]">
            {/* Glow border top */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

            {/* Progress bar */}
            <div className="h-0.5 bg-white/[0.04] w-full">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>

            <div className="p-4">
              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${meta.bg} ${meta.color}`}>
                  <Sparkles className="w-2.5 h-2.5" />
                  {meta.label}
                </div>
                <button
                  onClick={onDismiss}
                  className="w-5 h-5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Quote */}
              <div className="flex gap-2.5">
                <QuoteIcon className="w-4 h-4 text-indigo-400/60 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] text-slate-200 leading-relaxed font-medium">
                    {quote.text}
                  </p>
                  {quote.author !== "Unknown" && (
                    <p className="text-[11px] text-slate-500 mt-1.5">— {quote.author}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// Dashboard Widget
// ─────────────────────────────────────────────
export function QuoteWidget() {
  const [quote, setQuote] = useState<Quote>(() => getRandomQuote());

  const rotate = () => setQuote(getRandomQuote());

  const meta = categoryMeta[quote.category];

  return (
    <div className="glass rounded-2xl p-4 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.04] to-violet-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${meta.bg} ${meta.color}`}>
            <Sparkles className="w-2.5 h-2.5" />
            {meta.label}
          </div>
          <button
            onClick={rotate}
            className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
          >
            New quote
          </button>
        </div>
        <div className="flex gap-2">
          <QuoteIcon className="w-3.5 h-3.5 text-indigo-400/50 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">{quote.text}</p>
        </div>
        {quote.author !== "Unknown" && (
          <p className="text-[10px] text-slate-600 mt-2 ml-5.5">— {quote.author}</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Focus Mode Overlay (pre-session ritual)
// ─────────────────────────────────────────────
interface FocusOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function FocusOverlay({ open, onClose }: FocusOverlayProps) {
  const [quote] = useState<Quote>(() => getContextualQuote("session_open"));
  const meta = categoryMeta[quote.category];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#050508]/95 backdrop-blur-2xl"
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative z-10 max-w-lg w-full mx-4"
          >
            <div className="glass border border-indigo-500/20 rounded-3xl p-10 text-center shadow-[0_0_100px_rgba(99,102,241,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.06] to-transparent rounded-3xl" />

              <div className="relative z-10">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-8 ${meta.bg} ${meta.color}`}>
                  <Sparkles className="w-3 h-3" />
                  Pre-Session Ritual
                </div>

                <QuoteIcon className="w-8 h-8 text-indigo-400/40 mx-auto mb-5" />

                <p className="text-2xl text-white font-medium leading-relaxed mb-6">
                  &ldquo;{quote.text}&rdquo;
                </p>

                {quote.author !== "Unknown" && (
                  <p className="text-slate-500 text-sm mb-10">— {quote.author}</p>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:from-indigo-500 hover:to-violet-500 transition-all shadow-glow-sm hover:shadow-glow-md"
                >
                  I am ready to trade
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
