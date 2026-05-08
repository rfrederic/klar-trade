"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Plus, Search, Folder, MoreHorizontal, Clock, Brain, BarChart2, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const templates = [
  {
    category: "Playbook",
    icon: "📋",
    color: "#03588C",
    items: [
      { name: "Trade Plan", preview: "HTF Bias · LTF Execution · Entry Checklist · Risk Rules", time: "~15 min" },
      { name: "Entry Model", preview: "Entry Criteria · Setup Diagram · Image Upload · Grade", time: "~10 min" },
    ],
  },
  {
    category: "Mindset",
    icon: "🧠",
    color: "#4BA3D4",
    items: [
      { name: "Macro Trade Journal", preview: "Market context · Bias · Conviction level · Outcome review", time: "~20 min" },
      { name: "Pre-Market Mental Prep", preview: "State check · Intention · Focus word · Energy level", time: "~5 min" },
      { name: "Post-Trade Reflection", preview: "What happened · What I felt · What I learned · Score", time: "~10 min" },
      { name: "Emotional Mapping", preview: "Emotion timeline · Trigger identification · Pattern analysis", time: "~15 min" },
    ],
  },
  {
    category: "Productivity",
    icon: "🧘",
    color: "#22C55E",
    items: [
      { name: "Habit Tracker", preview: "Daily habits grid · Streaks · Weekly review", time: "~5 min" },
      { name: "Daily Planner", preview: "Time-blocked schedule · Priorities · Evening review", time: "~10 min" },
      { name: "Goal Tracker", preview: "Goal · Why it matters · Progress · Milestones", time: "~15 min" },
      { name: "Daily Routine Checklist", preview: "Morning routine · Pre-market · Post-market · Evening", time: "~5 min" },
    ],
  },
  {
    category: "Performance Review",
    icon: "📊",
    color: "#D9CA82",
    items: [
      { name: "Annual Review", preview: "Year summary · Best trades · Lessons · Goals for next year", time: "~45 min" },
      { name: "Weekly Review", preview: "Week stats · What worked · What didn't · Next week focus", time: "~20 min" },
      { name: "Monthly Review", preview: "Monthly PnL · Discipline score · Habits · Improvements", time: "~30 min" },
      { name: "Quarterly Review", preview: "Q1/Q2/Q3/Q4 analysis · Trend · Plan adjustment", time: "~35 min" },
    ],
  },
];

const recentNotes = [
  { title: "Weekly Review — May 5", preview: "Strong week. 4 green days, 1 red. Best trade was...", category: "Performance Review", edited: "2h ago" },
  { title: "Pre-Market — May 7", preview: "Feeling focused today. London bias is long. Key levels...", category: "Mindset", edited: "Today" },
  { title: "ES Trend Continuation Plan", preview: "Entry criteria: Break and retest of major resistance...", category: "Playbook", edited: "Yesterday" },
];

export default function NotebookPage() {
  const [search, setSearch] = useState("");
  const [activeNote, setActiveNote] = useState<string | null>(null);

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Notebook"
        subtitle="Think before you trade. Review before you repeat."
        action={
          <Button size="sm">
            <Plus className="w-3.5 h-3.5" />
            New Note
          </Button>
        }
      />

      <main className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <div className="w-60 flex-shrink-0 border-r border-white/[0.05] flex flex-col bg-[#06080f]">
          <div className="p-3 border-b border-white/[0.05]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-8 pr-3 py-2 text-xs text-[#F2F0EB] placeholder-[#6B7280] focus:outline-none focus:border-[#03588C]/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide">ALL NOTES (3)</span>
            </div>

            {recentNotes.map((note) => (
              <button
                key={note.title}
                onClick={() => setActiveNote(note.title)}
                className={cn("w-full text-left px-3 py-2.5 rounded-xl transition-all",
                  activeNote === note.title ? "bg-[#03588C]/15 border border-[#03588C]/25" : "hover:bg-white/[0.04]")}
              >
                <p className="text-xs font-semibold text-[#F2F0EB] mb-0.5 truncate">{note.title}</p>
                <p className="text-[11px] text-[#6B7280] truncate">{note.preview}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock className="w-2.5 h-2.5 text-[#6B7280]" />
                  <span className="text-[10px] text-[#6B7280]">{note.edited}</span>
                </div>
              </button>
            ))}

            <div className="px-2 pt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide">FOLDERS (0)</span>
                <button className="text-[#6B7280] hover:text-[#F2F0EB] transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-center py-4">
                <Folder className="w-5 h-5 text-[#6B7280] mx-auto mb-1.5" />
                <p className="text-[11px] text-[#6B7280]">No folders yet</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeNote ? (
            <div className="max-w-3xl">
              <input
                defaultValue={activeNote}
                className="w-full bg-transparent text-2xl font-bold text-[#F2F0EB] focus:outline-none mb-4 border-b border-white/[0.05] pb-3"
              />
              <textarea
                placeholder="Start writing..."
                rows={20}
                className="w-full bg-transparent text-sm text-[#6B7280] placeholder-[#6B7280]/50 focus:outline-none leading-relaxed resize-none"
              />
            </div>
          ) : (
            <div>
              <div className="mb-8">
                <h2 className="text-lg font-bold text-[#F2F0EB] mb-1">Templates</h2>
                <p className="text-sm text-[#6B7280]">Start from a proven structure. Customise it for your style.</p>
              </div>

              <div className="space-y-8">
                {templates.map((group) => (
                  <div key={group.category}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">{group.icon}</span>
                      <h3 className="text-sm font-semibold text-[#F2F0EB]">{group.category}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full text-[#6B7280] bg-white/[0.04] border border-white/[0.06]">
                        {group.items.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {group.items.map((item) => (
                        <div
                          key={item.name}
                          className="glass rounded-2xl p-4 cursor-pointer hover:bg-white/[0.05] hover:-translate-y-0.5 transition-all group"
                          onClick={() => setActiveNote(item.name)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-semibold text-[#F2F0EB]">{item.name}</h4>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[#6B7280] hover:text-[#F2F0EB]">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-[11px] text-[#6B7280] leading-relaxed mb-3">{item.preview}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-[#6B7280]" />
                              <span className="text-[10px] text-[#6B7280]">{item.time}</span>
                            </div>
                            <button
                              className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-[#03588C]/15 text-[#4BA3D4] hover:bg-[#03588C]/25 transition-all"
                              onClick={() => setActiveNote(item.name)}
                            >
                              Use Template
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
