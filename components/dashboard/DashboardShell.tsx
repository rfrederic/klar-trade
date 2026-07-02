"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { QuoteToast } from "@/components/ui/QuoteSystem";
import { cn } from "@/lib/utils";
import { getBrowserTimezone } from "@/lib/timezone";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Detect and persist the user's timezone once per session so server-side
  // aggregation (journal calendar, analytics, "today" stats) can bucket by
  // the user's actual local day instead of the server's clock.
  useEffect(() => {
    fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timezone: getBrowserTimezone() }),
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#050508] flex">
      <Sidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        onCommandPalette={() => setCmdOpen(true)}
      />
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          collapsed ? "md:pl-16" : "md:pl-[220px]"
        )}
      >
        {children}
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <QuoteToast context="dashboard" delay={2000} />
    </div>
  );
}
