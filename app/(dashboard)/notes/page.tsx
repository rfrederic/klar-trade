"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Plus, StickyNote, Tag, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const notes = [
  {
    id: "1",
    title: "ES Support Levels to Watch",
    content: "Key levels for this week:\n- 5,820 (major support, 3 touches)\n- 5,860 (pivot from last week's high)\n- 5,900 (psychological round number)\n\nIf we lose 5,820, next stop is 5,780.",
    tags: ["ES", "Levels", "This Week"],
    color: "indigo",
    date: "Jan 15",
  },
  {
    id: "2",
    title: "Psychology Note — Monday Mindset",
    content: "I notice I come into Mondays with leftover anxiety from the weekend. Things that help:\n1. Morning workout before market open\n2. Review previous week's wins (not losses)\n3. Set ONE clear intention for the session\n\nDon't force trades on Monday mornings.",
    tags: ["Psychology", "Process"],
    color: "violet",
    date: "Jan 13",
  },
  {
    id: "3",
    title: "FOMC Reaction Playbook",
    content: "After FOMC announcements:\n- First 5 minutes: DO NOT TRADE (chop)\n- Wait for 15-min candle close to show direction\n- If clear breakout: enter trend continuation\n- If whipsaw: stay out entirely\n\nBest moves happen 20–40 mins after initial reaction.",
    tags: ["FOMC", "Events", "Playbook"],
    color: "cyan",
    date: "Jan 10",
  },
];

const colorMap = {
  indigo: "border-indigo-500/20 bg-indigo-500/[0.04]",
  violet: "border-violet-500/20 bg-violet-500/[0.04]",
  cyan: "border-cyan-500/20 bg-cyan-500/[0.04]",
  amber: "border-amber-500/20 bg-amber-500/[0.04]",
};

const tagColorMap = {
  indigo: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  violet: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
};

export default function NotesPage() {
  const [selected, setSelected] = useState(notes[0].id);
  const [editing, setEditing] = useState(false);
  const selectedNote = notes.find((n) => n.id === selected)!;

  return (
    <div className="flex flex-col flex-1">
      <Header title="Trading Notebook" subtitle="Capture ideas, levels, and market observations." />

      <main className="flex-1 p-6">
        <div className="flex gap-6 h-full">
          {/* Notes list */}
          <div className="w-72 flex-shrink-0 flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <Input placeholder="Search notes..." className="pl-9 h-9 text-xs" />
              </div>
              <Button size="icon-sm">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="space-y-2">
              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => setSelected(note.id)}
                  className={cn(
                    "w-full text-left rounded-2xl p-4 border transition-all duration-200",
                    selected === note.id
                      ? "bg-indigo-500/10 border-indigo-500/30"
                      : `glass hover:bg-white/[0.05]`
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold text-white line-clamp-1">{note.title}</p>
                    <span className="text-[10px] text-slate-600 flex-shrink-0 mt-0.5">{note.date}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{note.content.split("\n")[0]}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full border border-white/[0.08] text-slate-500">{tag}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Note editor */}
          <div className="flex-1 glass rounded-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-indigo-400" />
                <div className="flex flex-wrap gap-1.5">
                  {selectedNote.tags.map((tag) => (
                    <span
                      key={tag}
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full border",
                        tagColorMap[selectedNote.color as keyof typeof tagColorMap] ?? "bg-white/[0.05] text-slate-400 border-white/[0.08]"
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                  {editing ? "Save" : "Edit"}
                </Button>
              </div>
            </div>

            <div className="p-6 flex-1">
              {editing ? (
                <div className="space-y-4">
                  <Input
                    defaultValue={selectedNote.title}
                    className="text-lg font-semibold h-12 text-white bg-transparent border-transparent focus:border-indigo-500/40 px-0"
                    placeholder="Note title..."
                  />
                  <textarea
                    defaultValue={selectedNote.content}
                    className="w-full h-80 resize-none bg-transparent border-0 text-slate-300 text-sm leading-relaxed focus:outline-none placeholder:text-slate-600"
                    placeholder="Start writing..."
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">{selectedNote.title}</h2>
                  <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedNote.content}
                  </div>
                </div>
              )}
            </div>

            {/* Tags input */}
            <div className="px-6 py-4 border-t border-white/[0.05] flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-600">Tags:</span>
              {selectedNote.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full border border-white/[0.07] text-slate-500">{tag}</span>
              ))}
              <button className="text-xs text-slate-600 hover:text-slate-400 transition-colors ml-1">+ Add tag</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
