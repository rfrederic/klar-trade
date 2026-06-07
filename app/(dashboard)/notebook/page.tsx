"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/dashboard/Header";
import { Plus, Search, Folder, FolderOpen, Clock, Trash2, Loader2, X, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Templates ────────────────────────────────────────────────────────────────

const TEMPLATES = [
  {
    category: "Playbook", icon: "📋", color: "#03588C",
    items: [
      {
        name: "Trade Plan",
        preview: "HTF Bias · LTF Execution · Entry Checklist · Risk Rules",
        time: "~15 min",
        content: `# Trade Plan

## HTF Bias
Direction:
Key levels:
Reasoning:

## LTF Execution
Setup:
Entry trigger:
Entry zone:

## Risk Management
Stop loss:
Target 1:
Target 2:
R:R ratio:
Position size:

## Entry Checklist
- [ ] HTF bias confirmed
- [ ] Key level identified
- [ ] LTF trigger confirmed
- [ ] Risk defined
- [ ] No news in next hour

## Notes
`,
      },
      {
        name: "Entry Model",
        preview: "Entry Criteria · Setup Diagram · Grade",
        time: "~10 min",
        content: `# Entry Model

## Setup Name
Name:
Market:
Timeframe:

## Entry Criteria
1.
2.
3.

## Invalidation
If this happens, I am wrong:

## Risk / Reward
Minimum R:R to take:
Typical hold time:

## Notes & Refinements
`,
      },
    ],
  },
  {
    category: "Mindset", icon: "🧠", color: "#4BA3D4",
    items: [
      {
        name: "Pre-Market Mental Prep",
        preview: "State check · Intention · Focus word · Energy level",
        time: "~5 min",
        content: `# Pre-Market Mental Prep

Date:

## How I feel right now (1–10)
Energy:
Focus:
Confidence:

## Intention for today
I want to focus on:
I will avoid:

## Market bias
Overall bias:
Key levels to watch:

## Focus word for today
`,
      },
      {
        name: "Post-Trade Reflection",
        preview: "What happened · What I felt · What I learned · Score",
        time: "~10 min",
        content: `# Post-Trade Reflection

Date:
Trade:
Result:

## What happened
(Describe the trade setup and execution objectively)

## What I felt
(Before, during, and after the trade)

## Did I follow my plan?
Yes / No — Why:

## What I learned
1.
2.

## Grade
A+ / A / B / C / D — Because:

## One thing I will do differently next time
`,
      },
    ],
  },
  {
    category: "Performance Review", icon: "📊", color: "#D9CA82",
    items: [
      {
        name: "Weekly Review",
        preview: "Week stats · What worked · What didn't · Next week focus",
        time: "~20 min",
        content: `# Weekly Review

Week of:

## Stats
Net PnL:
Win rate:
Best trade:
Worst trade:
Discipline score (1–10):

## What worked this week
1.
2.
3.

## What didn't work
1.
2.

## Rule violations
-

## Focus for next week
1.
2.

## Overall reflection
`,
      },
      {
        name: "Monthly Review",
        preview: "Monthly PnL · Habits · Improvements",
        time: "~30 min",
        content: `# Monthly Review

Month:

## Performance Summary
Net PnL:
Win rate:
Total trades:
Profit factor:

## Top 3 best trades
1.
2.
3.

## Top 3 lessons
1.
2.
3.

## Habits audit
Were morning routines consistent?
Did I review trades daily?
Did I follow position sizing rules?

## Adjustments for next month
`,
      },
    ],
  },
  {
    category: "Productivity", icon: "🧘", color: "#22C55E",
    items: [
      {
        name: "Daily Routine Checklist",
        preview: "Morning · Pre-market · Post-market · Evening",
        time: "~5 min",
        content: `# Daily Routine Checklist

Date:

## Morning (before market)
- [ ] Wake up at set time
- [ ] Exercise / movement
- [ ] Review HTF charts
- [ ] Read news briefly
- [ ] Write today's bias

## Pre-Market
- [ ] Mark key levels
- [ ] Set alerts
- [ ] Review trade plan
- [ ] Mental prep done

## During Market
- [ ] Follow plan only
- [ ] No revenge trades
- [ ] Log every trade

## Post-Market
- [ ] Review all trades
- [ ] Update journal
- [ ] Note lessons

## Evening
- [ ] No screens 1h before sleep
- [ ] Reflect on day
`,
      },
    ],
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface NoteMeta {
  id: string;
  title: string;
  category: string;
  folder_id: string | null;
  updated_at: string;
}

interface NoteFolder {
  id: string;
  name: string;
}

interface FullNote extends NoteMeta {
  content: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotebookPage() {
  const [notes, setNotes] = useState<NoteMeta[]>([]);
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [activeNote, setActiveNote] = useState<FullNote | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  // Folder creation
  const [newFolderInput, setNewFolderInput] = useState("");
  const [showFolderInput, setShowFolderInput] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load notes + folders
  const loadAll = useCallback(async () => {
    const res = await fetch("/api/notes");
    if (res.ok) {
      const d = await res.json();
      setNotes(d.notes ?? []);
      setFolders(d.folders ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Create a new blank note or from template
  const createNote = async (title = "Untitled", content = "", category = "") => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, category, folder_id: activeFolder }),
    });
    if (!res.ok) return;
    const { note } = await res.json();

    // Fetch full note
    const fullRes = await fetch(`/api/notes/${note.id}`);
    if (!fullRes.ok) return;
    const { note: full } = await fullRes.json();

    setNotes((prev) => [note, ...prev]);
    setActiveNote(full);
    setTimeout(() => titleRef.current?.select(), 50);
  };

  // Open an existing note
  const openNote = async (id: string) => {
    if (activeNote?.id === id) return;
    const res = await fetch(`/api/notes/${id}`);
    if (!res.ok) return;
    const { note } = await res.json();
    setActiveNote(note);
  };

  // Auto-save on title/content change
  const scheduleAutoSave = (updates: Partial<FullNote>) => {
    if (!activeNote) return;
    const updated = { ...activeNote, ...updates };
    setActiveNote(updated);
    setNotes((prev) =>
      prev.map((n) =>
        n.id === updated.id ? { ...n, title: updated.title, updated_at: new Date().toISOString() } : n
      )
    );
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      await fetch(`/api/notes/${updated.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      setSaving(false);
      setSavedAt(new Date());
    }, 800);
  };

  // Delete note
  const deleteNote = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNote?.id === id) setActiveNote(null);
  };

  // Create folder
  const createFolder = async () => {
    if (!newFolderInput.trim()) return;
    const res = await fetch("/api/notes/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderInput.trim() }),
    });
    if (!res.ok) return;
    const { folder } = await res.json();
    setFolders((prev) => [...prev, folder]);
    setNewFolderInput("");
    setShowFolderInput(false);
  };

  // Delete folder
  const deleteFolder = async (id: string) => {
    await fetch(`/api/notes/folders/${id}`, { method: "DELETE" });
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setNotes((prev) => prev.map((n) => n.folder_id === id ? { ...n, folder_id: null } : n));
    if (activeFolder === id) setActiveFolder(null);
  };

  // Filtered notes
  const filteredNotes = notes.filter((n) => {
    const matchesSearch = !search ||
      n.title.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = activeFolder === null || n.folder_id === activeFolder;
    return matchesSearch && matchesFolder;
  });

  const saveLabel = saving ? "Saving..." : savedAt ? `Saved ${relativeTime(savedAt.toISOString())}` : null;

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Notebook"
        subtitle="Think before you trade. Review before you repeat."
        action={
          <div className="flex items-center gap-2">
            {saveLabel && (
              <span className="text-[11px] text-[#6B7280] flex items-center gap-1">
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 text-[#22C55E]" />}
                {saveLabel}
              </span>
            )}
            <Button size="sm" onClick={() => createNote()}>
              <Plus className="w-3.5 h-3.5" />
              New Note
            </Button>
          </div>
        }
      />

      <main className="flex-1 flex overflow-hidden">

        {/* ── Left sidebar ── */}
        <div className="w-60 flex-shrink-0 border-r border-white/[0.05] flex flex-col bg-[#06080f]">

          {/* Search */}
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

            {/* All notes header */}
            <button
              onClick={() => setActiveFolder(null)}
              className={cn("w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-all",
                activeFolder === null ? "bg-white/[0.05]" : "hover:bg-white/[0.03]")}
            >
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide">
                ALL NOTES ({notes.length})
              </span>
            </button>

            {/* Note list */}
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-4 h-4 animate-spin text-[#6B7280]" />
              </div>
            ) : filteredNotes.length === 0 ? (
              <p className="text-[11px] text-[#6B7280] text-center py-4 px-2">
                {search ? "No results" : "No notes yet"}
              </p>
            ) : (
              filteredNotes.map((note) => (
                <div key={note.id}
                  className={cn("group relative w-full text-left px-3 py-2.5 rounded-xl transition-all cursor-pointer",
                    activeNote?.id === note.id
                      ? "bg-[#03588C]/15 border border-[#03588C]/25"
                      : "hover:bg-white/[0.04]")}
                  onClick={() => openNote(note.id)}
                >
                  <p className="text-xs font-semibold text-[#F2F0EB] mb-0.5 truncate pr-5">{note.title}</p>
                  {note.category && (
                    <p className="text-[10px] text-[#4BA3D4] mb-0.5 truncate">{note.category}</p>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-[#6B7280]" />
                    <span className="text-[10px] text-[#6B7280]">{relativeTime(note.updated_at)}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[#6B7280] hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}

            {/* Folders section */}
            <div className="px-2 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide">
                  FOLDERS ({folders.length})
                </span>
                <button
                  onClick={() => setShowFolderInput(true)}
                  className="text-[#6B7280] hover:text-[#F2F0EB] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {showFolderInput && (
                <div className="flex items-center gap-1.5 mb-2">
                  <input
                    autoFocus
                    value={newFolderInput}
                    onChange={(e) => setNewFolderInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") createFolder(); if (e.key === "Escape") setShowFolderInput(false); }}
                    placeholder="Folder name"
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1.5 text-[11px] text-[#F2F0EB] placeholder-[#6B7280] focus:outline-none focus:border-[#03588C]/50"
                  />
                  <button onClick={createFolder} className="text-[#22C55E] hover:text-white transition-colors">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setShowFolderInput(false)} className="text-[#6B7280] hover:text-white transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {folders.length === 0 && !showFolderInput ? (
                <div className="text-center py-3">
                  <Folder className="w-4 h-4 text-[#6B7280] mx-auto mb-1" />
                  <p className="text-[10px] text-[#6B7280]">No folders yet</p>
                </div>
              ) : (
                folders.map((f) => (
                  <div key={f.id}
                    className={cn("group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all",
                      activeFolder === f.id ? "bg-white/[0.05] text-[#F2F0EB]" : "text-[#6B7280] hover:bg-white/[0.03] hover:text-[#F2F0EB]")}
                    onClick={() => setActiveFolder(activeFolder === f.id ? null : f.id)}
                  >
                    {activeFolder === f.id
                      ? <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" />
                      : <Folder className="w-3.5 h-3.5 flex-shrink-0" />}
                    <span className="text-xs flex-1 truncate">{f.name}</span>
                    <span className="text-[10px] text-[#6B7280]">
                      {notes.filter((n) => n.folder_id === f.id).length}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteFolder(f.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[#6B7280] hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Main area ── */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeNote ? (
            /* Note editor */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-6 py-2 border-b border-white/[0.05] bg-[#06080f]">
                <div className="flex items-center gap-2">
                  {folders.length > 0 && (
                    <select
                      value={activeNote.folder_id ?? ""}
                      onChange={(e) => {
                        const fid = e.target.value || null;
                        scheduleAutoSave({ folder_id: fid });
                        setNotes((prev) => prev.map((n) => n.id === activeNote.id ? { ...n, folder_id: fid } : n));
                      }}
                      className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1 text-xs text-[#6B7280] focus:outline-none"
                    >
                      <option value="">No folder</option>
                      {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  )}
                  <span className="text-[11px] text-[#6B7280]">
                    {new Date(activeNote.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <button
                  onClick={() => deleteNote(activeNote.id)}
                  className="text-[#6B7280] hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/[0.06]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Editor */}
              <div className="flex-1 overflow-y-auto px-10 py-8 max-w-3xl mx-auto w-full">
                <input
                  ref={titleRef}
                  value={activeNote.title}
                  onChange={(e) => scheduleAutoSave({ title: e.target.value })}
                  placeholder="Untitled"
                  className="w-full bg-transparent text-2xl font-bold text-[#F2F0EB] focus:outline-none mb-6 placeholder-[#6B7280]/40"
                />
                <textarea
                  value={activeNote.content}
                  onChange={(e) => scheduleAutoSave({ content: e.target.value })}
                  placeholder="Start writing..."
                  className="w-full bg-transparent text-sm text-[#A0A8B8] placeholder-[#6B7280]/40 focus:outline-none leading-relaxed resize-none"
                  style={{ minHeight: "calc(100vh - 280px)" }}
                />
              </div>
            </div>
          ) : (
            /* Template gallery */
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-[#F2F0EB] mb-1">Templates</h2>
                  <p className="text-sm text-[#6B7280]">Start from a proven structure, or create a blank note.</p>
                </div>

                <div className="space-y-8">
                  {TEMPLATES.map((group) => (
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
                            onClick={() => createNote(item.name, item.content, group.category)}
                            className="glass rounded-2xl p-4 cursor-pointer hover:bg-white/[0.05] hover:-translate-y-0.5 transition-all group"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm font-semibold text-[#F2F0EB]">{item.name}</h4>
                              <ChevronRight className="w-4 h-4 text-[#6B7280] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-[11px] text-[#6B7280] leading-relaxed mb-3">{item.preview}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-[#6B7280]" />
                                <span className="text-[10px] text-[#6B7280]">{item.time}</span>
                              </div>
                              <span
                                className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-[#03588C]/15 text-[#4BA3D4] group-hover:bg-[#03588C]/25 transition-all"
                              >
                                Use Template
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
