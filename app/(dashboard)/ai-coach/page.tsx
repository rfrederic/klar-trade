"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { Brain, Send, Sparkles, BarChart2, Shield, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  { icon: BarChart2, text: "Analyze my last 10 trades" },
  { icon: Brain, text: "What is my biggest psychological weakness?" },
  { icon: Shield, text: "Review my risk management this week" },
  { icon: TrendingUp, text: "When do I perform best?" },
];

const initialMessages: Message[] = [
  {
    role: "assistant",
    content: "Hello, trader. I've analyzed your last 30 days of trading activity.\n\nHere's what stands out: **Your win rate is 68%** — which is strong. But your average loss is 1.8× your average win, which is dragging down your profit factor to 2.4×.\n\nThe data shows you're **cutting winners too early** and letting losers run slightly past your initial stop. This single behavioral pattern is costing you approximately $800–$1,200 per month.\n\nWhat would you like to dig into today?",
    timestamp: new Date(),
  },
];

export default function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content, timestamp: new Date() },
    ]);
    setLoading(true);

    // Simulated AI response — replace with actual Anthropic API call
    setTimeout(() => {
      const responses: Record<string, string> = {
        "Analyze my last 10 trades": "Looking at your last 10 trades:\n\n**Wins (7):** ES trend continuation ×3, GC support bounce ×2, CL momentum ×2\n**Losses (3):** NQ reversal ×2, ES overtraded entry ×1\n\nPattern detected: **100% of your losses** came from two setups — NQ reversals and overtraded entries. Your trend continuation win rate is 87%. My recommendation: **eliminate NQ reversals entirely** from your playbook for the next 30 days and focus exclusively on what's working.",
        default: "Based on your trading data, I can see some interesting patterns. Your discipline score dropped 12 points on Mondays compared to other days — this suggests you may be entering the week with unprocessed stress from the weekend. Try a pre-session checklist every Monday morning to reset your mental state. Would you like me to create one for you?",
      };

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: responses[content] ?? responses.default,
          timestamp: new Date(),
        },
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col flex-1">
      <Header title="AI Coach" subtitle="Your personal trading intelligence" />

      <main className="flex-1 flex p-6 gap-6 min-h-0">
        {/* Chat area */}
        <div className="flex-1 flex flex-col glass rounded-2xl overflow-hidden min-h-0">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-white">Klartrade AI Coach</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-emerald-400">Online · Analyzing your data</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
                  msg.role === "assistant"
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold"
                )}>
                  {msg.role === "assistant" ? <Brain className="w-4 h-4" /> : "T"}
                </div>

                {/* Bubble */}
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "assistant"
                    ? "bg-white/[0.04] border border-white/[0.06] text-slate-300 whitespace-pre-line"
                    : "bg-indigo-600 text-white"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl px-4 py-3 flex items-center gap-1.5">
                  {[0, 0.15, 0.3].map((delay) => (
                    <div
                      key={delay}
                      className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="px-5 py-4 border-t border-white/[0.05]">
            {/* Quick prompts */}
            <div className="flex flex-wrap gap-2 mb-3">
              {quickPrompts.map((p) => (
                <button
                  key={p.text}
                  onClick={() => sendMessage(p.text)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] hover:text-slate-200 hover:border-indigo-500/30 transition-all"
                >
                  <p.icon className="w-3 h-3" />
                  {p.text}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask about your trades, psychology, patterns, or plan..."
                rows={2}
                className="flex-1 resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                size="icon"
                className="flex-shrink-0 h-11 w-11"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right sidebar — context panel */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-4 hidden xl:flex">
          {/* Current context */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Coach Context</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Trades analyzed", value: "142" },
                { label: "Data period", value: "90 days" },
                { label: "Discipline score", value: "94/100" },
                { label: "Primary issue", value: "Early exits" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{item.label}</span>
                  <span className="text-xs font-medium text-slate-300">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key findings */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Key Findings</h3>
            <div className="space-y-3">
              {[
                { text: "Monday sessions 28% worse than average", type: "warning" },
                { text: "ES trend setups: 87% win rate", type: "success" },
                { text: "Overtrading after 3 PM detected", type: "warning" },
                { text: "Best performance: 9:30–11 AM", type: "success" },
              ].map((f, i) => (
                <div key={i} className="flex gap-2">
                  <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", f.type === "success" ? "bg-emerald-400" : "bg-amber-400")} />
                  <p className="text-xs text-slate-400 leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly report */}
          <div className="glass rounded-2xl p-5 border border-indigo-500/20 bg-indigo-500/[0.04]">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Weekly Report Ready</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Your AI-generated weekly performance report is ready. Includes discipline analysis and improvement priorities.
            </p>
            <Button variant="default" size="sm" className="w-full">
              View Report
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
