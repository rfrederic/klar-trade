"use client";

import { cn } from "@/lib/utils";
import { Trade } from "@/types";
import { TrendingUp, TrendingDown } from "lucide-react";

const mockTrades: Trade[] = [
  {
    id: "1", userId: "u1", symbol: "ES", type: "long", entryPrice: 5842, exitPrice: 5874,
    size: 2, pnl: 480, pnlPercent: 0.82, status: "closed", entryTime: "2024-01-15T09:30:00Z",
    exitTime: "2024-01-15T10:45:00Z", setup: "Trend Continuation", notes: "Clean breakout",
    ruleFollowed: true, emotionalState: "calm", disciplineScore: 96, tags: ["breakout", "ES"],
  },
  {
    id: "2", userId: "u1", symbol: "NQ", type: "short", entryPrice: 21340, exitPrice: 21420,
    size: 1, pnl: -180, pnlPercent: -0.37, status: "closed", entryTime: "2024-01-15T11:00:00Z",
    exitTime: "2024-01-15T11:30:00Z", setup: "Reversal", notes: "Stopped out",
    ruleFollowed: false, emotionalState: "anxious", disciplineScore: 54, tags: ["NQ"],
  },
  {
    id: "3", userId: "u1", symbol: "GC", type: "long", entryPrice: 2680, exitPrice: 2712,
    size: 3, pnl: 680, pnlPercent: 1.19, status: "closed", entryTime: "2024-01-15T13:15:00Z",
    exitTime: "2024-01-15T14:00:00Z", setup: "Support Bounce", notes: "Perfect entry",
    ruleFollowed: true, emotionalState: "confident", disciplineScore: 98, tags: ["gold"],
  },
  {
    id: "4", userId: "u1", symbol: "CL", type: "long", entryPrice: 78.40, exitPrice: 79.20,
    size: 4, pnl: 340, pnlPercent: 1.02, status: "closed", entryTime: "2024-01-15T14:30:00Z",
    exitTime: "2024-01-15T15:15:00Z", setup: "Trend Continuation", notes: "Strong momentum",
    ruleFollowed: true, emotionalState: "calm", disciplineScore: 92, tags: ["oil"],
  },
  {
    id: "5", userId: "u1", symbol: "ES", type: "long", entryPrice: 5890, exitPrice: null,
    size: 1, pnl: null, pnlPercent: null, status: "open", entryTime: "2024-01-15T15:30:00Z",
    exitTime: null, setup: "End of Day Trend", notes: "Watching for HOD break",
    ruleFollowed: true, emotionalState: "calm", disciplineScore: 90, tags: ["ES"],
  },
];

export function RecentTrades() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
        <h3 className="text-sm font-semibold text-white">Recent Trades</h3>
        <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View all</button>
      </div>

      {/* Trades */}
      <div className="divide-y divide-white/[0.04]">
        {mockTrades.map((trade) => {
          const win = (trade.pnl ?? 0) > 0;
          const open = trade.status === "open";
          return (
            <div
              key={trade.id}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition-colors"
            >
              {/* Direction indicator */}
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  trade.type === "long"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-rose-500/10 text-rose-400"
                )}
              >
                {trade.type === "long" ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>

              {/* Symbol + setup */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{trade.symbol}</span>
                  {open && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Live
                    </span>
                  )}
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full border",
                      trade.ruleFollowed
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    )}
                  >
                    {trade.ruleFollowed ? "Rules ✓" : "Rule Break"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{trade.setup}</p>
              </div>

              {/* Discipline */}
              <div className="hidden sm:flex flex-col items-center gap-0.5">
                <span className="text-[10px] text-slate-600">Discipline</span>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    trade.disciplineScore >= 80 ? "text-emerald-400" :
                    trade.disciplineScore >= 60 ? "text-amber-400" : "text-rose-400"
                  )}
                >
                  {trade.disciplineScore}
                </span>
              </div>

              {/* PnL */}
              <div className="text-right flex-shrink-0">
                {open ? (
                  <span className="text-sm text-slate-400">—</span>
                ) : (
                  <>
                    <p
                      className={cn(
                        "text-sm font-bold",
                        win ? "text-emerald-400" : "text-rose-400"
                      )}
                    >
                      {win ? "+" : ""}${Math.abs(trade.pnl ?? 0).toLocaleString()}
                    </p>
                    <p
                      className={cn(
                        "text-[10px]",
                        win ? "text-emerald-500/70" : "text-rose-500/70"
                      )}
                    >
                      {win ? "+" : ""}
                      {(trade.pnlPercent ?? 0).toFixed(2)}%
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
