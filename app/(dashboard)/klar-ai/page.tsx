"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { Plus, Send, Mic, Sparkles, MessageSquare, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const suggestions = [
  "I'm feeling emotional after my last loss",
  "Review my last 5 trades",
  "Help me build a trading plan",
  "What's my best setup?",
  "Analyze my win rate this week",
];

const sampleChats = [
  { title: "Trade plan review — ES", preview: "Your setup criteria needs one more...", time: "Today" },
  { title: "FOMO trade analysis", preview: "Based on your patterns, I noticed...", time: "Yesterday" },
  { title: "Weekly performance recap", preview: "This was a strong week. Key takeaway...", time: "May 5" },
];

interface Message {
  role: "user" | "ai";
  content: string;
  time: string;
}

const demoResponses: Record<string, string> = {
  "I'm feeling emotional after my last loss": "That's completely normal — every serious trader has been here. Before you do anything else, step away from the charts for 15 minutes.\n\nHere's what I see in your data: after a losing trade, you've entered a new position within 5 minutes 68% of the time. Of those revenge trades, 71% were losers.\n\nThe pattern is clear. The cost of your emotional response is higher than the loss itself.\n\nTry this: write down exactly what you're feeling right now in your journal. Name the emotion. Then ask: 'Would my best self take this next trade?' If the answer is no — close the platform.",
  "Review my last 5 trades": "Here's a breakdown of your last 5 trades:\n\n✅ EURUSD Long — +$480 (A grade, plan followed)\n✅ ES Long — +$840 (A+ grade, excellent timing)\n❌ NQ Short — -$180 (C grade, entered 3 bars early)\n✅ GC Long — +$420 (A grade, clean support bounce)\n❌ CL Short — -$240 (B grade, slight hesitation on entry)\n\nKey insight: Your winning trades had 2.2R average. Your losing trades had 0.9R average. The math is working in your favor.\n\nOne concern: the NQ trade on May 7 — you entered before 15m confirmation. That's a recurring pattern. You've done this 4 times in the past 2 weeks.",
  "default": "I'm analyzing your trading data now...\n\nBased on your recent performance, I can see some strong patterns emerging. Your London session win rate is significantly higher than your NY afternoon trades.\n\nWould you like me to dig deeper into any specific area? I can analyze your setups, emotional patterns, risk management, or time-of-day performance.",
};

export default function KlarAIPage() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    setActiveChat("active");

    setTimeout(() => {
      const aiContent = demoResponses[text] ?? demoResponses["default"];
      setMessages((m) => [...m, { role: "ai", content: aiContent, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
      setTyping(false);
    }, 1800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header
        title="KlarAI"
        subtitle="Ask about your playbook, market regime, risk, or journaling."
        action={
          <Button size="sm" onClick={() => { setActiveChat(null); setMessages([]); }}>
            <Plus className="w-3.5 h-3.5" />
            New Chat
          </Button>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel */}
        <div className="w-60 flex-shrink-0 border-r border-white/[0.05] flex flex-col bg-[#06080f]">
          <div className="p-3 border-b border-white/[0.05]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">CHATS</span>
              <button className="text-[#6B7280] hover:text-[#F2F0EB] transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sampleChats.map((chat) => (
              <button
                key={chat.title}
                onClick={() => { setActiveChat(chat.title); setMessages([]); }}
                className={cn("w-full text-left px-3 py-2.5 rounded-xl transition-all",
                  activeChat === chat.title ? "bg-[#03588C]/15 border border-[#03588C]/25" : "hover:bg-white/[0.04]")}
              >
                <p className="text-xs font-medium text-[#F2F0EB] mb-0.5 truncate">{chat.title}</p>
                <p className="text-[11px] text-[#6B7280] truncate">{chat.preview}</p>
                <p className="text-[10px] text-[#6B7280] mt-1">{chat.time}</p>
              </button>
            ))}

            {sampleChats.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <MessageSquare className="w-6 h-6 text-[#6B7280] mb-2" />
                <p className="text-[11px] text-[#6B7280]">No chats yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!activeChat && messages.length === 0 ? (
            // Welcome state
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-[#03588C]/20 border border-[#03588C]/30 flex items-center justify-center mx-auto mb-5 shadow-glow-sm">
                  <Sparkles className="w-8 h-8 text-[#4BA3D4]" />
                </div>
                <h2 className="text-2xl font-bold text-[#F2F0EB] mb-2">Welcome to KlarAI!</h2>
                <p className="text-sm text-[#6B7280] max-w-sm mx-auto mb-8">
                  Ask me to turn ideas into clear trading rules, checklists, and metrics.
                  I&apos;m aware of your journal, Edge plans, and trading patterns.
                </p>

                <div className="flex flex-wrap gap-2 justify-center mb-8">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-[#6B7280] hover:text-[#F2F0EB] hover:border-[#03588C]/30 hover:bg-[#03588C]/08 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            // Messages
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {msg.role === "ai" && (
                      <div className="w-7 h-7 rounded-xl bg-[#03588C]/20 border border-[#03588C]/30 flex items-center justify-center flex-shrink-0 mr-2.5 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#4BA3D4]" />
                      </div>
                    )}
                    <div className={cn("max-w-[70%]",
                      msg.role === "user"
                        ? "bg-[#03588C] text-white rounded-2xl rounded-tr-sm px-4 py-3"
                        : "glass border-l-2 border-[#03588C] rounded-2xl rounded-tl-sm px-4 py-3"
                    )}>
                      <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                      <p className={cn("text-[10px] mt-1.5", msg.role === "user" ? "text-white/50 text-right" : "text-[#6B7280]")}>{msg.time}</p>
                    </div>
                  </motion.div>
                ))}

                {typing && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-[#03588C]/20 border border-[#03588C]/30 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-[#4BA3D4]" />
                    </div>
                    <div className="glass border-l-2 border-[#03588C] rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1 items-center h-4">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            className="w-1.5 h-1.5 rounded-full bg-[#4BA3D4]"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input bar */}
          <div className="p-4 border-t border-white/[0.05]">
            <div className="flex items-end gap-2">
              <div className="flex-1 glass rounded-2xl px-4 py-3 flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your playbook, market regime, risk, or journaling..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-[#F2F0EB] placeholder-[#6B7280] resize-none focus:outline-none leading-relaxed"
                  style={{ maxHeight: "120px" }}
                />
                <button className="text-[#6B7280] hover:text-[#F2F0EB] transition-colors flex-shrink-0">
                  <Mic className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-xl bg-[#03588C] flex items-center justify-center text-white hover:bg-[#024a77] transition-all shadow-glow-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-[#6B7280] text-center mt-2">
              For education only — not financial advice. Markets involve risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
