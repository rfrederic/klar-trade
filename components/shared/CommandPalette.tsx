"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutDashboard, BookOpen, BarChart2, Brain, Shield, Map, Calendar, Trophy, Users, GraduationCap, Layers, Play, Link, StickyNote, ArrowRight, Hash, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  href?: string;
  action?: () => void;
  category: string;
  shortcut?: string;
}

const commands: Command[] = [
  // Navigation
  { id: "dashboard", label: "Dashboard", description: "Overview & metrics", icon: LayoutDashboard, href: "/dashboard", category: "Navigate" },
  { id: "journal", label: "Journal", description: "Trade journal entries", icon: BookOpen, href: "/journal", category: "Navigate" },
  { id: "analytics", label: "Analytics", description: "Performance analysis", icon: BarChart2, href: "/analytics", category: "Navigate" },
  { id: "strategies", label: "Strategies", description: "Playbook & setups", icon: Layers, href: "/strategies", category: "Navigate" },
  { id: "replay", label: "Trade Replay", description: "Replay & backtest", icon: Play, href: "/replay", category: "Navigate" },
  { id: "ai-coach", label: "AI Coach", description: "Chat with your coach", icon: Brain, href: "/ai-coach", category: "Navigate" },
  { id: "risk", label: "Risk Manager", description: "Risk guardrails", icon: Shield, href: "/risk", category: "Navigate" },
  { id: "plans", label: "Trading Plans", description: "Your rule systems", icon: Map, href: "/trading-plans", category: "Navigate" },
  { id: "community", label: "Community", description: "Leaderboards & mentors", icon: Users, href: "/community", category: "Navigate" },
  { id: "academy", label: "Academy", description: "Courses & modules", icon: GraduationCap, href: "/academy", category: "Navigate" },
  { id: "brokers", label: "Brokers", description: "Connected accounts", icon: Link, href: "/brokers", category: "Navigate" },
  { id: "calendar", label: "Calendar", description: "Economic events", icon: Calendar, href: "/calendar", category: "Navigate" },
  { id: "achievements", label: "Achievements", description: "Badges & streaks", icon: Trophy, href: "/achievements", category: "Navigate" },
  { id: "notes", label: "Notes", description: "Trading notebook", icon: StickyNote, href: "/notes", category: "Navigate" },
  // Actions
  { id: "log-trade", label: "Log a Trade", description: "Record a new trade", icon: Zap, category: "Actions", shortcut: "⌘L" },
  { id: "new-journal", label: "New Journal Entry", description: "Write today's entry", icon: Hash, category: "Actions" },
  { id: "calculator", label: "Position Calculator", description: "Calculate size fast", icon: Shield, category: "Actions" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const router = useRouter();

  const filtered = query
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const grouped = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  const flatFiltered = Object.values(grouped).flat();

  const handleOpen = useCallback(() => {
    setOpen(true);
    setQuery("");
    setSelected(0);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const handleSelect = useCallback(
    (cmd: Command) => {
      handleClose();
      if (cmd.href) router.push(cmd.href);
      if (cmd.action) cmd.action();
    },
    [handleClose, router]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        open ? handleClose() : handleOpen();
      }
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleOpen, handleClose]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, flatFiltered.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    }
    if (e.key === "Enter" && flatFiltered[selected]) {
      handleSelect(flatFiltered[selected]);
    }
  };

  return (
    <>
      {/* Trigger button (shown in Header) */}
      <button
        onClick={handleOpen}
        className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-500 hover:text-slate-300 hover:bg-white/[0.07] transition-all text-sm"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="text-xs">Search...</span>
        <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-600">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99998] flex items-start justify-center pt-[15vh] px-4"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="relative z-10 w-full max-w-xl"
              onKeyDown={handleKeyDown}
            >
              <div className="bg-[#0c0c16] border border-white/[0.1] rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(99,102,241,0.2),0_24px_60px_rgba(0,0,0,0.8)]">
                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
                  <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search pages, features, actions..."
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                  <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-600 flex-shrink-0">ESC</kbd>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto py-2">
                  {Object.entries(grouped).map(([category, cmds]) => (
                    <div key={category}>
                      <p className="px-4 py-1.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                        {category}
                      </p>
                      {cmds.map((cmd) => {
                        const globalIdx = flatFiltered.indexOf(cmd);
                        const isSelected = globalIdx === selected;
                        return (
                          <button
                            key={cmd.id}
                            onClick={() => handleSelect(cmd)}
                            onMouseEnter={() => setSelected(globalIdx)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isSelected ? "bg-indigo-500/15" : "hover:bg-white/[0.04]"}`}
                          >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-indigo-500/20 text-indigo-400" : "bg-white/[0.05] text-slate-500"}`}>
                              <cmd.icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${isSelected ? "text-white" : "text-slate-300"}`}>{cmd.label}</p>
                              {cmd.description && (
                                <p className="text-xs text-slate-500 truncate">{cmd.description}</p>
                              )}
                            </div>
                            {cmd.shortcut && (
                              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-600">{cmd.shortcut}</kbd>
                            )}
                            {isSelected && <ArrowRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  ))}

                  {filtered.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-slate-500">
                      No results for &ldquo;{query}&rdquo;
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/[0.04] text-[10px] text-slate-600">
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white/[0.05]">↑↓</kbd> navigate</span>
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white/[0.05]">↵</kbd> select</span>
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white/[0.05]">esc</kbd> close</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
