"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { Plus, Send, Sparkles, MessageSquare } from "lucide-react";
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

interface Message {
  role: "user" | "ai";
  content: string;
  time: string;
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function KlarAIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [chatActive, setChatActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || typing) return;

    const userMsg: Message = { role: "user", content: text, time: now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setTyping(true);
    setChatActive(true);

    try {
      const res = await fetch("/api/klar-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((m) => [...m, { role: "ai", content: data.content, time: now() }]);
      } else {
        const errText = data.error === "KlarAI is not configured yet"
          ? "KlarAI requires an ANTHROPIC_API_KEY environment variable. Add it to .env.local to enable real responses."
          : (data.error ?? "Something went wrong. Please try again.");
        setMessages((m) => [...m, { role: "ai", content: errText, time: now() }]);
      }
    } catch {
      setMessages((m) => [...m, {
        role: "ai",
        content: "Connection error. Please check your internet connection and try again.",
        time: now(),
      }]);
    } finally {
      setTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const startNewChat = () => {
    setMessages([]);
    setChatActive(false);
    setInput("");
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header
        title="KlarAI"
        subtitle="Your AI trading coach — aware of your journal, edge, and patterns."
        action={
          <Button size="sm" onClick={startNewChat}>
            <Plus className="w-3.5 h-3.5" />
            New Chat
          </Button>
        }
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {!chatActive ? (
          // Welcome state
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#03588C]/20 border border-[#03588C]/30 flex items-center justify-center mx-auto mb-5 shadow-glow-sm">
                <Sparkles className="w-8 h-8 text-[#4BA3D4]" />
              </div>
              <h2 className="text-2xl font-bold text-[#F2F0EB] mb-2">Welcome to KlarAI</h2>
              <p className="text-sm text-[#6B7280] max-w-sm mx-auto mb-8">
                I know your trade history, emotional patterns, and edge. Ask me anything about your performance, psychology, or strategy.
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

              <div className="flex items-center gap-2 text-[11px] text-[#6B7280]/50">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Conversations are not saved between sessions</span>
              </div>
            </motion.div>
          </div>
        ) : (
          // Messages
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="max-w-2xl mx-auto space-y-4">
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
                  <div className={cn("max-w-[80%]",
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
          </div>
        )}

        {/* Input bar */}
        <div className="p-4 border-t border-white/[0.05]">
          <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-2">
            <div className="flex-1 glass rounded-2xl px-4 py-3 flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your performance, psychology, or strategy..."
                rows={1}
                disabled={typing}
                className="flex-1 bg-transparent text-sm text-[#F2F0EB] placeholder-[#6B7280] resize-none focus:outline-none leading-relaxed disabled:opacity-60"
                style={{ maxHeight: "120px" }}
              />
            </div>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || typing}
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
