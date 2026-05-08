"use client";

import { Brain, AlertTriangle, CheckCircle, Lightbulb, BarChart2, ArrowRight } from "lucide-react";
import { AIInsight } from "@/types";
import { cn } from "@/lib/utils";

const mockInsights: AIInsight[] = [
  {
    id: "1",
    type: "success",
    title: "Exceptional risk management today",
    description: "You stayed within your 1.5% daily risk limit across all 4 trades. This is consistent with your top 10% sessions.",
    timestamp: "2024-01-15T15:30:00Z",
  },
  {
    id: "2",
    type: "warning",
    title: "Overtrading pattern detected",
    description: "You've taken 4 trades in 3 hours. Your historical data shows your win rate drops 18% after the 3rd trade. Consider calling it a day.",
    timestamp: "2024-01-15T14:00:00Z",
    action: "Review trading plan",
  },
  {
    id: "3",
    type: "suggestion",
    title: "Best performance window: 9:30–11 AM",
    description: "Analysis of 142 trades shows you win 74% in the first 90 minutes vs 52% in the afternoon. Front-load your sessions.",
    timestamp: "2024-01-15T08:00:00Z",
  },
  {
    id: "4",
    type: "analysis",
    title: "Rule break correlation found",
    description: "The NQ trade today matched a pattern: you break rules 3× more often after a winning streak of 3+. Stay disciplined after wins.",
    timestamp: "2024-01-15T12:00:00Z",
  },
];

const iconMap = {
  success: { Icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/15" },
  warning: { Icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/15" },
  suggestion: { Icon: Lightbulb, color: "text-indigo-400", bg: "bg-indigo-500/15" },
  analysis: { Icon: BarChart2, color: "text-violet-400", bg: "bg-violet-500/15" },
};

export function AIInsightsPanel() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">AI Coach Insights</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Active</span>
        </div>
      </div>

      {/* Insights */}
      <div className="divide-y divide-white/[0.04]">
        {mockInsights.map((insight) => {
          const { Icon, color, bg } = iconMap[insight.type];
          return (
            <div key={insight.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex gap-3">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", bg)}>
                  <Icon className={cn("w-3.5 h-3.5", color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-white mb-1">{insight.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{insight.description}</p>
                  {insight.action && (
                    <button className="mt-2 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                      {insight.action}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ask coach */}
      <div className="px-5 py-4 border-t border-white/[0.05] bg-white/[0.01]">
        <button className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all group">
          <Brain className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
          <span className="text-sm text-slate-600 group-hover:text-slate-400 transition-colors">Ask your AI coach anything...</span>
        </button>
      </div>
    </div>
  );
}
