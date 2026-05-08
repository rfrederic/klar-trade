"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#050508] flex">
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          collapsed ? "md:pl-16" : "md:pl-[220px]"
        )}
      >
        {children}
      </div>
    </div>
  );
}
