"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

async function loadProfile(
  setAvatarUrl: (u: string | null) => void,
  setInitials: (s: string) => void,
) {
  try {
    const res = await fetch("/api/settings/profile", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setAvatarUrl(data.avatar_url ?? null);
    const name: string = data.user_metadata?.full_name ?? "";
    if (name) {
      setInitials(
        name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
      );
    } else if (data.email) {
      setInitials((data.email as string).slice(0, 1).toUpperCase());
    }
  } catch {
    // silently ignore — avatar just stays as initials
  }
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState("?");

  useEffect(() => {
    loadProfile(setAvatarUrl, setInitials);

    // Listen for avatar uploads that happen on the same page (e.g. Settings)
    const handleAvatarUpdated = (e: Event) => {
      const url = (e as CustomEvent<{ avatar_url: string }>).detail?.avatar_url;
      if (url) setAvatarUrl(url);
    };
    window.addEventListener("avatar-updated", handleAvatarUpdated);
    return () => window.removeEventListener("avatar-updated", handleAvatarUpdated);
  }, []);

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
          <Button size="sm" onClick={() => router.push("/journal?new=true")}>
            <Plus className="w-3.5 h-3.5" />
            Log Trade
          </Button>
        )}

        <button
          onClick={() => router.push("/settings")}
          className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-[#03588C]/50 transition-all focus:outline-none"
          aria-label="Profile settings"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#03588C] flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
          )}
        </button>
      </div>
    </header>
  );
}
