"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, LayoutDashboard, TrendingUp, Layers, BookOpen, StickyNote,
  Leaf, Sparkles, BarChart2, Settings,
  Trophy, Plus, LogOut, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const commands = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", group: "Navigate" },
  { label: "Trading", icon: TrendingUp, href: "/trading", group: "Navigate" },
  { label: "Edge — Strategy Playbook", icon: Layers, href: "/edge", group: "Navigate" },
  { label: "Journal", icon: BookOpen, href: "/journal", group: "Navigate" },
  { label: "Analytics", icon: BarChart2, href: "/analytics", group: "Navigate" },
  { label: "KlarAI", icon: Sparkles, href: "/klar-ai", group: "Navigate" },
  { label: "Achievements", icon: Trophy, href: "/achievements", group: "Navigate" },
  { label: "Notebook", icon: StickyNote, href: "/notebook", group: "Navigate" },
  { label: "Refuge", icon: Leaf, href: "/refuge", group: "Navigate" },
  { label: "Settings", icon: Settings, href: "/settings", group: "Navigate" },
  { label: "New Trade", icon: Plus, href: "/journal", group: "Actions" },
  { label: "New Note", icon: Plus, href: "/notebook", group: "Actions" },
  { label: "New Edge Plan", icon: Plus, href: "/edge", group: "Actions" },
  { label: "Sign Out", icon: LogOut, href: "/", group: "Account", signOut: true },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const groups = Array.from(new Set(filtered.map((c) => c.group)));

  const runCommand = async (cmd: (typeof commands)[number]) => {
    if (cmd.signOut) {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push(cmd.href);
      router.refresh();
      return;
    }
    router.push(cmd.href);
  };

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") setSelected((s) => Math.min(s + 1, filtered.length - 1));
      if (e.key === "ArrowUp") setSelected((s) => Math.max(s - 1, 0));
      if (e.key === "Enter" && filtered[selected]) {
        runCommand(filtered[selected]);
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, selected, onClose, runCommand]);

  let itemIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-start justify-center pt-[15vh]"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: -8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#06080f] border border-white/[0.1] rounded-2xl overflow-hidden shadow-glow-sm">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
                <Search className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                  placeholder="Search pages, actions..."
                  className="flex-1 bg-transparent text-[#F2F0EB] text-sm placeholder-[#6B7280] focus:outline-none"
                />
                <button onClick={onClose} className="text-[#6B7280] hover:text-[#F2F0EB] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[#6B7280]">No results</div>
                ) : (
                  groups.map((group) => (
                    <div key={group}>
                      <p className="px-4 py-1.5 text-[10px] font-semibold text-[#6B7280] uppercase tracking-widest">{group}</p>
                      {filtered
                        .filter((c) => c.group === group)
                        .map((cmd) => {
                          itemIndex++;
                          const idx = itemIndex;
                          return (
                            <button
                              key={cmd.href + cmd.label}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                                selected === idx ? "bg-[#03588C]/20 text-[#F2F0EB]" : "text-[#6B7280] hover:text-[#F2F0EB] hover:bg-white/[0.03]"
                              )}
                              onMouseEnter={() => setSelected(idx)}
                              onClick={() => { runCommand(cmd); onClose(); }}
                            >
                              <cmd.icon className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm font-medium">{cmd.label}</span>
                              {selected === idx && (
                                <span className="ml-auto text-[10px] text-[#6B7280]">↵ Enter</span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-white/[0.05] flex items-center gap-4 text-[10px] text-[#6B7280]">
                <span><kbd className="font-mono bg-white/[0.05] px-1.5 py-0.5 rounded">↑↓</kbd> navigate</span>
                <span><kbd className="font-mono bg-white/[0.05] px-1.5 py-0.5 rounded">↵</kbd> open</span>
                <span><kbd className="font-mono bg-white/[0.05] px-1.5 py-0.5 rounded">Esc</kbd> close</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
