"use client";

import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="h-14 border-b border-white/[0.05] bg-[#050508]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h1 className="text-[15px] font-semibold text-[#F2F0EB]">{title}</h1>
        {subtitle && <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[#6B7280] hover:text-[#F2F0EB] hover:bg-white/[0.06] transition-all text-sm">
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:block text-xs">Search...</span>
          <kbd className="hidden sm:block text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-[#6B7280]">⌘K</kbd>
        </button>

        <button className="relative w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[#6B7280] hover:text-[#F2F0EB] hover:bg-white/[0.06] transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#03588C] border-2 border-[#050508]" />
        </button>

        {action ?? (
          <Button size="sm">
            <Plus className="w-3.5 h-3.5" />
            Log Trade
          </Button>
        )}

        <div className="w-8 h-8 rounded-xl bg-[#03588C] flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:shadow-glow-xs transition-shadow">
          T
        </div>
      </div>
    </header>
  );
}
