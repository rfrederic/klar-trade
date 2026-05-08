"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Users, Trophy, Shield, TrendingUp, Star, MessageSquare, Heart, Zap, Crown, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const leaderboard = [
  { rank: 1, name: "Marcus Chen", avatar: "MC", badge: "Elite", discipline: 98, pnl: "+$48,240", winRate: "74%", streak: 14, verified: true },
  { rank: 2, name: "Sarah Okonkwo", avatar: "SO", badge: "Pro", discipline: 96, pnl: "+$38,480", winRate: "71%", streak: 9, verified: true },
  { rank: 3, name: "James Whitfield", avatar: "JW", badge: "Elite", discipline: 94, pnl: "+$31,200", winRate: "68%", streak: 7, verified: true },
  { rank: 4, name: "Ava Rodriguez", avatar: "AR", badge: "Pro", discipline: 92, pnl: "+$24,840", winRate: "67%", streak: 5, verified: false },
  { rank: 5, name: "Liam Thompson", avatar: "LT", badge: "Advanced", discipline: 89, pnl: "+$19,120", winRate: "64%", streak: 4, verified: false },
  { rank: 6, name: "Elena Petrov", avatar: "EP", badge: "Advanced", discipline: 87, pnl: "+$14,480", winRate: "63%", streak: 3, verified: false },
  { rank: 7, name: "You", avatar: "T", badge: "Pro", discipline: 94, pnl: "+$28,480", winRate: "68%", streak: 6, verified: false, isYou: true },
];

const groups = [
  { id: "1", name: "ES Day Traders", members: 28, activity: "High", focus: "Futures · NY Session", leader: "Marcus C." },
  { id: "2", name: "Disciplined FX Traders", members: 14, activity: "Medium", focus: "Forex · Psychology", leader: "Sarah O." },
  { id: "3", name: "Risk-First Collective", members: 19, activity: "High", focus: "All instruments · Risk management", leader: "James W." },
];

const trades = [
  { trader: "Marcus Chen", avatar: "MC", symbol: "ES", type: "Long", pnl: "+$680", setup: "Trend Continuation", note: "Textbook breakout and retest. Waited for second candle confirmation — patience paid off.", likes: 24, comments: 7, discipline: 98 },
  { trader: "Sarah Okonkwo", avatar: "SO", symbol: "GC", type: "Long", pnl: "+$420", setup: "Support Bounce", note: "Perfectly defined support at 2680. Three touches prior. Bounced exactly as planned.", likes: 18, comments: 4, discipline: 96 },
  { trader: "James Whitfield", avatar: "JW", symbol: "NQ", type: "Short", pnl: "+$840", setup: "Breakout Retest", note: "Patient for 40 minutes. Setup finally aligned at 11:15. This is why we wait.", likes: 31, comments: 9, discipline: 97 },
];

const badgeConfig: Record<string, { color: string; icon: React.ElementType }> = {
  Elite: { color: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: Crown },
  Pro: { color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30", icon: Star },
  Advanced: { color: "text-violet-400 bg-violet-500/10 border-violet-500/30", icon: Medal },
};

const rankIcons: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"leaderboard" | "feed" | "groups">("leaderboard");

  return (
    <div className="flex flex-col flex-1">
      <Header title="Community" subtitle="Elite traders. Shared discipline. Collective growth." />

      <main className="flex-1 p-6 space-y-6">

        {/* Tab bar */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl w-fit">
          {(["leaderboard", "feed", "groups"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                activeTab === tab ? "bg-indigo-500/20 text-indigo-400" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        {activeTab === "leaderboard" && (
          <div className="space-y-4">
            {/* Top 3 podium */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {leaderboard.slice(0, 3).map((t, i) => {
                const rankOrder = [1, 0, 2];
                const trader = leaderboard[rankOrder[i]];
                return (
                  <div
                    key={trader.rank}
                    className={cn(
                      "glass rounded-2xl p-5 text-center border",
                      trader.rank === 1 ? "border-amber-500/30 bg-amber-500/[0.04] -translate-y-2" : "border-white/[0.07]"
                    )}
                  >
                    <div className="text-2xl mb-2">{rankIcons[trader.rank] || `#${trader.rank}`}</div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold mx-auto mb-3">
                      {trader.avatar}
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">{trader.name}</p>
                    <p className="text-xs text-emerald-400 font-bold">{trader.pnl}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{trader.winRate} WR · {trader.discipline} disc.</p>
                    {trader.verified && (
                      <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] border border-indigo-500/20">
                        <Shield className="w-2.5 h-2.5" />
                        Verified
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Full leaderboard table */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Global Leaderboard</h3>
                <span className="text-xs text-slate-500">Monthly · Ranked by Discipline Score</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {leaderboard.map((trader) => {
                  const bg = trader.badge ? badgeConfig[trader.badge] : badgeConfig.Advanced;
                  return (
                    <div
                      key={trader.rank}
                      className={cn(
                        "flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors",
                        trader.isYou ? "bg-indigo-500/[0.04] border-l-2 border-l-indigo-500" : ""
                      )}
                    >
                      <span className="text-base w-8 text-center">{rankIcons[trader.rank] ?? `#${trader.rank}`}</span>

                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {trader.avatar}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">{trader.name}</p>
                          {trader.isYou && <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full">You</span>}
                          {trader.verified && <Shield className="w-3 h-3 text-indigo-400" />}
                        </div>
                        <div className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] border mt-0.5", bg.color)}>
                          <bg.icon className="w-2.5 h-2.5" />
                          {trader.badge}
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-[10px] text-slate-600 mb-0.5">DISC.</p>
                          <p className="font-bold text-white">{trader.discipline}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-600 mb-0.5">WIN RATE</p>
                          <p className="font-bold text-indigo-400">{trader.winRate}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-600 mb-0.5">PnL</p>
                          <p className="font-bold text-emerald-400">{trader.pnl}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-600 mb-0.5">STREAK</p>
                          <p className="font-bold text-amber-400">{trader.streak}🔥</p>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="text-xs hidden sm:flex">View</Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Trade feed */}
        {activeTab === "feed" && (
          <div className="max-w-2xl space-y-4">
            {trades.map((t, i) => (
              <div key={i} className="glass rounded-2xl p-5">
                {/* Trader header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.trader}</p>
                    <p className="text-[11px] text-slate-500">{t.setup}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className={cn("text-sm font-bold", t.pnl.startsWith("+") ? "text-emerald-400" : "text-rose-400")}>{t.pnl}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{t.symbol} {t.type}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed mb-4">&ldquo;{t.note}&rdquo;</p>

                {/* Discipline bar */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] text-slate-500">Discipline:</span>
                  <div className="flex-1 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${t.discipline}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-400">{t.discipline}/100</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-white/[0.05]">
                  <button className="flex items-center gap-1.5 text-slate-500 hover:text-rose-400 transition-colors text-xs">
                    <Heart className="w-3.5 h-3.5" />
                    {t.likes}
                  </button>
                  <button className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-400 transition-colors text-xs">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {t.comments}
                  </button>
                  <button className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Share trade</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Groups */}
        {activeTab === "groups" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {groups.map((g) => (
              <div key={g.id} className="glass rounded-2xl p-5 hover:bg-white/[0.05] transition-colors cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", g.activity === "High" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20")}>
                    {g.activity} Activity
                  </span>
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-1">{g.name}</h3>
                <p className="text-xs text-slate-500 mb-3">{g.focus}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4">
                  <span>{g.members} members</span>
                  <span>Led by {g.leader}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs">Join Group</Button>
              </div>
            ))}
            <div className="glass rounded-2xl p-5 border-dashed border-white/[0.1] flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:bg-white/[0.03] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                <Zap className="w-5 h-5 text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-400">Create Accountability Group</p>
              <p className="text-xs text-slate-600">Invite traders. Set goals. Grow together.</p>
              <Button size="sm" className="mt-1">Create Group</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
