"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  LayoutDashboard, TrendingUp, Layers, BookOpen, StickyNote,
  Leaf, Sparkles, BarChart2, Trophy, Shield,
  Settings, ChevronLeft, ChevronRight, LogOut,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/trading", icon: TrendingUp, label: "Trading" },
  { href: "/journal", icon: BookOpen, label: "Journal" },
  { href: "/analytics", icon: BarChart2, label: "Analytics" },
  { href: "/edge", icon: Layers, label: "Edge" },
  { href: "/risk", icon: Shield, label: "Risk" },
  { href: "/klar-ai", icon: Sparkles, label: "KlarAI" },
  { href: "/achievements", icon: Trophy, label: "Achievements" },
  { href: "/notebook", icon: StickyNote, label: "Notebook" },
  { href: "/refuge", icon: Leaf, label: "Refuge" },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  onCommandPalette?: () => void;
}

export function Sidebar({ collapsed, onCollapse, onCommandPalette }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="hidden md:flex flex-col fixed left-0 top-0 h-screen border-r border-white/[0.05] bg-[#06080f] z-40 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-white/[0.05] flex-shrink-0">
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <Image src="/klar-removebg-preview.png" alt="KlarTrade logo" width={48} height={48} className="object-contain" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.15 }}
              className="text-[15px] font-bold text-[#F2F0EB] whitespace-nowrap tracking-tight"
            >
              Klar<span className="text-[#4BA3D4]">Trade</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Search / Command palette trigger */}
      {onCommandPalette && (
        <div className="px-2 pt-2 pb-1">
          <button
            onClick={onCommandPalette}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[#6B7280] hover:text-[#F2F0EB] hover:bg-white/[0.06] transition-all group relative",
            )}
          >
            <Search className="w-3.5 h-3.5 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="text-[12px] whitespace-nowrap flex-1 text-left"
                >
                  Search...
                </motion.span>
              )}
            </AnimatePresence>
            {!collapsed && (
              <AnimatePresence>
                <motion.kbd
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[9px] bg-white/[0.06] px-1.5 py-0.5 rounded font-mono text-[#6B7280]"
                >
                  ⌘K
                </motion.kbd>
              </AnimatePresence>
            )}
            {collapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#0d0d1e] border border-white/[0.08] rounded-lg text-xs text-[#F2F0EB] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-card z-50">
                Search (⌘K)
              </div>
            )}
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 scrollbar-none">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150 group relative",
                active
                  ? "bg-[#03588C] text-white shadow-glow-xs"
                  : "text-[#6B7280] hover:text-[#F2F0EB] hover:bg-white/[0.04]"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2.5 : 2} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="text-[13px] font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#0d0d1e] border border-white/[0.08] rounded-lg text-xs text-[#F2F0EB] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-card z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-white/[0.05] space-y-0.5 flex-shrink-0">
        {[
          { href: "/settings", icon: Settings, label: "Settings" },
        ].map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150 group relative",
                active ? "bg-[#03588C] text-white" : "text-[#6B7280] hover:text-[#F2F0EB] hover:bg-white/[0.04]"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="text-[13px] font-medium whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#0d0d1e] border border-white/[0.08] rounded-lg text-xs text-[#F2F0EB] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-card z-50">
                  {label}
                </div>
              )}
            </Link>
          );
        })}

<button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[#6B7280] hover:text-red-400 hover:bg-red-500/[0.06] transition-all group relative">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-[13px] font-medium">Sign Out</span>}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#0d0d1e] border border-white/[0.08] rounded-lg text-xs text-[#F2F0EB] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-card z-50">
              Sign Out
            </div>
          )}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => onCollapse(!collapsed)}
        className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 rounded-full bg-[#0d0d1e] border border-white/[0.1] flex items-center justify-center text-[#6B7280] hover:text-[#F2F0EB] transition-colors shadow-card z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}
