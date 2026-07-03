"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import {
  Plus, RefreshCw, ChevronLeft, ChevronRight,
  Check, AlertTriangle, Mic, X, Loader2, Smile, Meh, Frown, Leaf, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getBiome } from "@/lib/biomes";
import { getBrowserTimezone, getLocalDateString } from "@/lib/timezone";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const GRADES = ["A+", "A", "B", "C", "D"];
const EMOTIONS = [
  { icon: Smile, label: "Calm", value: "calm", color: "#22C55E" },
  { icon: Smile, label: "Focused", value: "focused", color: "#4BA3D4" },
  { icon: Meh, label: "Neutral", value: "neutral", color: "#6B7280" },
  { icon: Frown, label: "Anxious", value: "anxious", color: "#F59E0B" },
  { icon: Frown, label: "Frustrated", value: "frustrated", color: "#EF4444" },
];

interface Trade {
  id: string;
  symbol: string;
  direction: "long" | "short";
  pnl: number | null;
  emotion: string | null;
  grade: string | null;
  notes: string | null;
  followed_plan: boolean;
  closed_at: string;
  entry_price: number | null;
  exit_price: number | null;
  volume: number | null;
  source: string;
}

interface CalendarEntry { pnl: number; trades: number; }

// ─── CalendarDay ─────────────────────────────────────────────────────────────

function CalendarDay({ day, data, selected, onClick }: {
  day: number; data?: CalendarEntry; selected: boolean; onClick: () => void;
}) {
  const hasData = (data?.trades ?? 0) > 0;
  return (
    <button
      onClick={onClick}
      className={cn(
        "aspect-square rounded-xl p-1.5 flex flex-col justify-between transition-all border text-left",
        selected ? "border-[#03588C]/50 bg-[#03588C]/15" : "border-transparent hover:border-white/[0.08] hover:bg-white/[0.03]",
        !hasData && "opacity-40",
      )}
    >
      <span className="text-[11px] text-[#6B7280]">{day}</span>
      {hasData && data && (
        <>
          <span className={cn("text-[10px] font-bold block", data.pnl >= 0 ? "text-[#22C55E]" : "text-red-400")}>
            {data.pnl >= 0 ? "+" : ""}${Math.abs(data.pnl).toFixed(0)}
          </span>
          <div className={cn("h-1 rounded-full mt-0.5", data.pnl >= 0 ? "bg-[#22C55E]" : "bg-red-500")}
            style={{ width: `${Math.min(100, Math.abs(data.pnl) / 15)}%` }} />
        </>
      )}
    </button>
  );
}

// ─── ImportTradesModal ───────────────────────────────────────────────────────

function ImportTradesModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [file, setFile]           = useState<File | null>(null);
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult]       = useState<{ ok: boolean; msg: string } | null>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  const acceptFile = (f: File) => {
    const n = f.name.toLowerCase();
    if (!n.endsWith(".csv") && !n.endsWith(".pdf")) {
      setResult({ ok: false, msg: "Only .csv and .pdf files are supported" });
      return;
    }
    setFile(f);
    setResult(null);
  };

  const fileType = file?.name.toLowerCase().endsWith(".pdf") ? "PDF" : "CSV";

  const handleImport = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const res  = await fetch("/api/journal/import", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok) {
        const n = data.imported as number;
        setResult({ ok: true, msg: `${n} trade${n !== 1 ? "s" : ""} imported from ${(data.fileType as string).toUpperCase()}` });
        if (n > 0) setTimeout(() => { onImported(); onClose(); }, 1400);
      } else {
        setResult({ ok: false, msg: data.error ?? "Import failed" });
      }
    } catch {
      setResult({ ok: false, msg: "Upload failed — please try again" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-md p-6 shadow-glow-sm">

        {/* Hidden file input — kept outside the drop zone so programmatic .click()
            doesn't bubble back to the div's onClick and cancel the dialog */}
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) acceptFile(f);
            e.target.value = "";   // reset so same file can be re-selected
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#F2F0EB]">Import Trades</h2>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#F2F0EB] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={(e) => {
            // only clear dragging when cursor truly leaves the zone (not just entering a child)
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) acceptFile(f);
          }}
          onClick={() => { if (!file) inputRef.current?.click(); }}
          className={cn(
            "border-2 border-dashed rounded-xl p-7 text-center transition-all mb-4",
            file ? "border-[#03588C]/40 bg-[#03588C]/5 cursor-default"
              : dragging ? "border-[#03588C] bg-[#03588C]/10 cursor-copy"
              : "border-white/[0.12] hover:border-[#03588C]/50 hover:bg-white/[0.02] cursor-pointer",
          )}
        >
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <span className={cn(
                "text-[11px] font-bold px-2 py-0.5 rounded-md",
                fileType === "PDF"
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
              )}>
                {fileType}
              </span>
              <span className="text-sm text-[#F2F0EB] truncate max-w-[220px]">{file.name}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                className="text-[#6B7280] hover:text-red-400 transition-colors ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-7 h-7 text-[#6B7280] mx-auto mb-2.5" />
              <p className="text-sm text-[#F2F0EB] mb-1">Drop file here or click to browse</p>
              <p className="text-xs text-[#6B7280]">
                Accepts{" "}
                <span className="font-semibold text-emerald-400">.csv</span>
                {" "}and{" "}
                <span className="font-semibold text-red-400">.pdf</span>
                {" "}broker statements
              </p>
            </>
          )}
        </div>

        {/* Format hints */}
        {!file && (
          <div className="text-[11px] text-[#6B7280]/70 space-y-0.5 mb-4 px-1">
            <p className="text-[#F2F0EB]/30 font-medium mb-1.5 uppercase tracking-wider text-[10px]">Supported formats</p>
            <p>· MT4 / MT5 account statement — CSV or PDF</p>
            <p>· cTrader closed positions export</p>
            <p>· TradeLocker trade history</p>
            <p>· Any broker CSV with symbol, direction, date and P&L columns</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={cn(
            "flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-[13px] mb-4 border",
            result.ok
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-amber-500/10 border-amber-500/20 text-amber-400",
          )}>
            {result.ok
              ? <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
              : <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            <span>{result.msg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" disabled={!file || uploading} onClick={handleImport}>
            {uploading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><Upload className="w-3.5 h-3.5" /> Import</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── AddTradeModal ────────────────────────────────────────────────────────────

const REFUGE_TO_EMOTION: Record<string, string> = {
  Clear:   "calm",
  Charged: "focused",
  Heavy:   "anxious",
  Numb:    "neutral",
  Rattled: "frustrated",
};

const EMOTION_TO_REFUGE: Record<string, string> = {
  calm:      "Clear",
  focused:   "Charged",
  anxious:   "Heavy",
  neutral:   "Numb",
  frustrated: "Rattled",
};

type RefugeCtx = { mood: string; biome: string; duration_min: number } | null;

function AddTradeModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({
    symbol: "", direction: "long", entry_price: "", exit_price: "",
    pnl: "", volume: "", closed_at: new Date().toISOString().slice(0, 16),
    notes: "", grade: "", emotion: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refugeCtx, setRefugeCtx] = useState<RefugeCtx | undefined>(undefined);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const tz = getBrowserTimezone();
    const today = getLocalDateString(new Date(), tz);
    fetch(`/api/refuge/mood-context?date=${today}&tz=${encodeURIComponent(tz)}`)
      .then(r => r.ok ? r.json() : { context: null })
      .then(d => {
        setRefugeCtx(d.context ?? null);
        const mapped = d.context?.mood ? REFUGE_TO_EMOTION[d.context.mood] : null;
        if (mapped) setForm(f => ({ ...f, emotion: mapped }));
      })
      .catch(() => setRefugeCtx(null));
  }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/journal/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol: form.symbol,
        direction: form.direction,
        entry_price: form.entry_price ? parseFloat(form.entry_price) : null,
        exit_price: form.exit_price ? parseFloat(form.exit_price) : null,
        pnl: form.pnl ? parseFloat(form.pnl) : null,
        volume: form.volume ? parseFloat(form.volume) : null,
        closed_at: new Date(form.closed_at).toISOString(),
        notes: form.notes || null,
        grade: form.grade || null,
        emotion: form.emotion || null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json();
      setError(j.error ?? "Failed to add trade");
      return;
    }
    onAdded();
    onClose();
  };

  const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] placeholder-[#6B7280] focus:outline-none focus:border-[#03588C]/60 transition-all";

  const moodColor = refugeCtx
    ? (EMOTIONS.find(e => e.value === REFUGE_TO_EMOTION[refugeCtx.mood])?.color ?? "#6B7280")
    : "#6B7280";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-md p-6 shadow-glow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#F2F0EB]">Add Trade</h2>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#F2F0EB] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Refuge session found — dismissable banner */}
        {refugeCtx && !bannerDismissed && (
          <div
            className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl mb-4"
            style={{ background: `${moodColor}12`, border: `1px solid ${moodColor}28` }}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Leaf className="w-3.5 h-3.5 flex-shrink-0" style={{ color: moodColor }} />
              <span className="text-[12px] text-[#F2F0EB]/70">
                You visited Refuge today feeling{" "}
                <span className="font-semibold" style={{ color: moodColor }}>{refugeCtx.mood}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className="text-[#6B7280] hover:text-[#F2F0EB] transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* No Refuge session today — subtle nudge */}
        {refugeCtx === null && (
          <a
            href="/refuge"
            className="flex items-center gap-1.5 mb-4 text-[11px] text-[#6B7280] hover:text-[#4BA3D4] transition-colors group"
          >
            <Leaf className="w-3 h-3 group-hover:text-[#4BA3D4] transition-colors" />
            Visit Refuge before logging this trade →
          </a>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#6B7280] mb-1.5">Symbol *</label>
              <input value={form.symbol} onChange={set("symbol")} placeholder="EURUSD" required className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1.5">Direction</label>
              <select value={form.direction} onChange={set("direction")} className={inputCls}>
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-[#6B7280] mb-1.5">Entry</label>
              <input type="number" step="any" value={form.entry_price} onChange={set("entry_price")} placeholder="0.00" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1.5">Exit</label>
              <input type="number" step="any" value={form.exit_price} onChange={set("exit_price")} placeholder="0.00" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1.5">P&L ($) *</label>
              <input type="number" step="any" value={form.pnl} onChange={set("pnl")} placeholder="-0.00 for a loss" required className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#6B7280] mb-1.5">Closed At *</label>
              <input type="datetime-local" value={form.closed_at} onChange={set("closed_at")} required className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1.5">Grade</label>
              <select value={form.grade} onChange={set("grade")} className={inputCls}>
                <option value="">—</option>
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Emotional state — pre-filled from Refuge if a session exists */}
          <div>
            <label className="block text-xs text-[#6B7280] mb-1.5">
              Emotional state
              {refugeCtx && (
                <span className="ml-1.5 opacity-50">· pre-filled from Refuge</span>
              )}
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {EMOTIONS.map(em => {
                const active = form.emotion === em.value;
                return (
                  <button
                    key={em.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, emotion: active ? "" : em.value }))}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium transition-all border",
                      active ? "" : "border-white/[0.07] text-[#6B7280] hover:text-[#F2F0EB] hover:border-white/[0.15]",
                    )}
                    style={active ? {
                      background: `${em.color}18`,
                      borderColor: `${em.color}50`,
                      color: em.color,
                    } : undefined}
                  >
                    {em.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#6B7280] mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={set("notes")} placeholder="What happened? What did you learn?"
              rows={2} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F2F0EB] placeholder-[#6B7280] focus:outline-none focus:border-[#03588C]/60 transition-all resize-none" />
          </div>
          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Trade"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── TradeCard ────────────────────────────────────────────────────────────────

function TradeCard({ trade, expanded, onToggle, onUpdate }: {
  trade: Trade;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<Trade>) => void;
}) {
  const [notesDraft, setNotesDraft] = useState(trade.notes ?? "");
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setNotesDraft(trade.notes ?? ""); }, [trade.notes]);

  const saveNotes = (val: string) => {
    setNotesDraft(val);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => onUpdate({ notes: val }), 800);
  };

  const hasPnl = trade.pnl != null;
  const pnl = trade.pnl ?? 0;
  const isWin = hasPnl && pnl >= 0;
  const closedTime = new Date(trade.closed_at).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
  });

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className={cn("w-2 h-2 rounded-full flex-shrink-0", !hasPnl ? "bg-[#6B7280]" : isWin ? "bg-[#22C55E]" : "bg-red-500")} />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#F2F0EB]">{trade.symbol}</span>
              <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-lg",
                trade.direction === "long" ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-red-500/10 text-red-400")}>
                {trade.direction === "long" ? "Long" : "Short"}
              </span>
              {trade.grade && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#03588C]/15 text-[#4BA3D4] font-medium">{trade.grade}</span>
              )}
              {trade.emotion && EMOTION_TO_REFUGE[trade.emotion] && (() => {
                const refugeMood = EMOTION_TO_REFUGE[trade.emotion!];
                const accent     = getBiome(refugeMood).accent;
                return (
                  <span
                    title={`You were ${refugeMood} when this trade was logged.`}
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg cursor-default"
                    style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}33` }}
                  >
                    {refugeMood}
                  </span>
                );
              })()}
              {!trade.followed_plan && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            <p className="text-[11px] text-[#6B7280] mt-0.5">{closedTime}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn("text-sm font-bold", !hasPnl ? "text-[#6B7280]" : isWin ? "text-[#22C55E]" : "text-red-400")}>
            {!hasPnl ? "Pending" : `${isWin ? "+" : ""}$${Math.abs(pnl).toFixed(2)}`}
          </p>
          {trade.volume != null && (
            <p className="text-[11px] text-[#6B7280]">{trade.volume} lots</p>
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-white/[0.05] pt-4 space-y-4">
          {/* Emotion */}
          <div>
            <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-2">Emotion</p>
            <div className="flex gap-2 flex-wrap">
              {EMOTIONS.map((em) => {
                const active = trade.emotion === em.value;
                return (
                  <button key={em.value}
                    onClick={() => onUpdate({ emotion: active ? null : em.value })}
                    className={cn("flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-[10px] transition-all",
                      active ? "border-[#03588C]/40 bg-[#03588C]/12 text-[#F2F0EB]" : "border-white/[0.07] text-[#6B7280] hover:border-white/[0.15]")}
                  >
                    <em.icon className="w-4 h-4" style={{ color: active ? em.color : undefined }} />
                    {em.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grade + Plan */}
          <div className="flex gap-6 flex-wrap">
            <div>
              <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-2">Grade</p>
              <div className="flex gap-1.5">
                {GRADES.map((g) => (
                  <button key={g}
                    onClick={() => onUpdate({ grade: trade.grade === g ? null : g })}
                    className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                      trade.grade === g ? "bg-[#03588C] text-white" : "bg-white/[0.04] text-[#6B7280] hover:text-[#F2F0EB]")}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-2">Plan</p>
              <button
                onClick={() => onUpdate({ followed_plan: !trade.followed_plan })}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all",
                  trade.followed_plan
                    ? "border-[#22C55E]/30 bg-[#22C55E]/08 text-[#22C55E]"
                    : "border-amber-500/30 bg-amber-500/08 text-amber-400")}
              >
                {trade.followed_plan ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {trade.followed_plan ? "Followed" : "Violated"}
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-2">Notes</p>
            <textarea
              value={notesDraft}
              onChange={(e) => saveNotes(e.target.value)}
              placeholder="Add notes, observations or lessons..."
              rows={2}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs text-[#F2F0EB] placeholder-[#6B7280] resize-none focus:outline-none focus:border-[#03588C]/50"
            />
          </div>

          {/* Prices */}
          {(trade.entry_price != null || trade.exit_price != null) && (
            <div className="flex gap-4 text-[11px]">
              {trade.entry_price != null && (
                <div><p className="text-[#6B7280]">Entry</p><p className="text-[#F2F0EB] font-medium">{trade.entry_price}</p></div>
              )}
              {trade.exit_price != null && (
                <div><p className="text-[#6B7280]">Exit</p><p className="text-[#F2F0EB] font-medium">{trade.exit_price}</p></div>
              )}
              {trade.volume != null && (
                <div><p className="text-[#6B7280]">Volume</p><p className="text-[#F2F0EB] font-medium">{trade.volume}</p></div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Mood breakdown ───────────────────────────────────────────────────────────

type MoodStats = {
  refugeMood: string;
  accent:     string;
  count:      number;
  avgPnl:     number;
  winRate:    number;
  avgVolume:  number | null;
};

function computeMoodBreakdown(trades: Trade[]): MoodStats[] {
  const groups: Record<string, Trade[]> = {};
  for (const t of trades) {
    if (!t.emotion) continue;
    const refugeMood = EMOTION_TO_REFUGE[t.emotion];
    if (!refugeMood) continue;
    (groups[refugeMood] ??= []).push(t);
  }
  return Object.entries(groups)
    .map(([refugeMood, items]) => {
      const pnls     = items.map(t => t.pnl ?? 0);
      const avgPnl   = pnls.reduce((a, b) => a + b, 0) / pnls.length;
      const wins     = items.filter(t => (t.pnl ?? 0) > 0).length;
      const winRate  = wins / items.length;
      const vols     = items.filter(t => t.volume != null).map(t => t.volume!);
      const avgVolume = vols.length > 0 ? vols.reduce((a, b) => a + b, 0) / vols.length : null;
      return { refugeMood, accent: getBiome(refugeMood).accent, count: items.length, avgPnl, winRate, avgVolume };
    })
    .sort((a, b) => b.avgPnl - a.avgPnl);
}

// ─── JournalPage ──────────────────────────────────────────────────────────────

export default function JournalContent() {
  const today = new Date();
  const [view, setView] = useState<"calendar" | "list" | "analytics">("calendar");
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const [trades, setTrades] = useState<Trade[]>([]);
  const [calendar, setCalendar] = useState<Record<number, CalendarEntry>>({});
  const [dayNotes, setDayNotes] = useState("");
  const [dayTrades, setDayTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [expandedTrade, setExpandedTrade] = useState<string | null>(null);
  const [showAddModal, setShowAddModal]       = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("new") === "true") setShowAddModal(true);
  }, [searchParams]);

  const dayNotesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadTrades = useCallback(async () => {
    setLoading(true);
    try {
      const tz = getBrowserTimezone();
      const res = await fetch(`/api/journal/trades?year=${year}&month=${month}&tz=${encodeURIComponent(tz)}`);
      if (res.ok) {
        const data = await res.json();
        setTrades(data.trades ?? []);
        setCalendar(data.calendar ?? {});
      }
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { loadTrades(); }, [loadTrades]);

  // Load day notes + this day's trades (server-filtered by local date)
  // whenever the selected day changes.
  useEffect(() => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    const tz = getBrowserTimezone();
    fetch(`/api/journal/days/${dateStr}?tz=${encodeURIComponent(tz)}`)
      .then((r) => r.json())
      .then((d) => {
        setDayNotes(d.notes ?? "");
        setDayTrades(d.trades ?? []);
      })
      .catch(() => { setDayNotes(""); setDayTrades([]); });
  }, [year, month, selectedDay]);

  const saveDayNotes = (notes: string) => {
    setDayNotes(notes);
    if (dayNotesTimer.current) clearTimeout(dayNotesTimer.current);
    dayNotesTimer.current = setTimeout(() => {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
      fetch(`/api/journal/days/${dateStr}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
    }, 800);
  };

  const updateTrade = async (id: string, updates: Partial<Trade>) => {
    setTrades((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    await fetch(`/api/journal/trades/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const listRes = await fetch("/api/brokers/list");
      if (!listRes.ok) return;
      const { connections } = await listRes.json();

      let anyImported = false;
      for (const conn of connections ?? []) {
        const endpoint =
          conn.broker === "mt5"         ? "/api/brokers/mt5/sync" :
          conn.broker === "tradelocker" ? "/api/brokers/tradelocker/sync" :
          conn.broker === "ctrader"     ? "/api/brokers/ctrader/sync" :
          null;
        if (!endpoint) continue;

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connectionId: conn.id }),
        });
        if (res.ok) {
          const data = await res.json();
          if ((data.tradesImported ?? 0) > 0) anyImported = true;
        }
      }

      setLastSync(new Date());
      if (anyImported) await loadTrades();
    } finally {
      setSyncing(false);
    }
  };

  const navigateMonth = (dir: -1 | 1) => {
    const next = month + dir;
    if (next < 0) { setYear((y) => y - 1); setMonth(11); }
    else if (next > 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth(next);
  };

  // Derived stats
  const selectedDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
  const selectedDayTrades = dayTrades;
  const dayData = calendar[selectedDay];
  const totalPnL = Object.values(calendar).reduce((a, d) => a + d.pnl, 0);
  const winDays = Object.values(calendar).filter((d) => d.pnl > 0).length;
  const totalDays = Object.values(calendar).filter((d) => d.trades > 0).length;
  const wins = trades.filter((t) => (t.pnl ?? 0) > 0).length;
  const losses = trades.filter((t) => (t.pnl ?? 0) < 0).length;
  const avgWin = wins > 0
    ? trades.filter((t) => (t.pnl ?? 0) > 0).reduce((a, t) => a + (t.pnl ?? 0), 0) / wins
    : null;
  const avgLoss = losses > 0
    ? trades.filter((t) => (t.pnl ?? 0) < 0).reduce((a, t) => a + (t.pnl ?? 0), 0) / losses
    : null;

  const moodBreakdown = computeMoodBreakdown(trades);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();

  const syncLabel = syncing
    ? "Syncing..."
    : lastSync
    ? `Synced ${Math.round((Date.now() - lastSync.getTime()) / 60000)}m ago`
    : null;

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Journal"
        subtitle="Every trade logged automatically."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
              {syncing
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <RefreshCw className="w-3.5 h-3.5" />}
              Sync Now
            </Button>
            {syncLabel && <span className="text-[11px] text-[#6B7280]">{syncLabel}</span>}
            <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)}>
              <Upload className="w-3.5 h-3.5" />
              Import
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-3.5 h-3.5" />
              Add Manual
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-3 px-6 py-3 border-b border-white/[0.05] bg-[#06080f]">
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
          {(["calendar", "list", "analytics"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={cn("px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all",
                view === v ? "bg-[#03588C] text-white" : "text-[#6B7280] hover:text-[#F2F0EB]")}>
              {v}
            </button>
          ))}
        </div>
        {!loading && trades.length > 0 && (
          <span className="text-[11px] text-[#6B7280]">
            {trades.length} trade{trades.length !== 1 ? "s" : ""} · {wins}W {losses}L
            {trades.length > 0 && ` · ${((wins / (wins + losses || 1)) * 100).toFixed(0)}% WR`}
          </span>
        )}
      </div>

      <main className="flex-1 p-6 flex gap-6 overflow-auto">
        {view === "calendar" && (
          <>
            {/* Calendar column */}
            <div className="flex-1 space-y-5 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#F2F0EB]">{MONTHS[month]} {year}</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigateMonth(-1)}
                    className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-[#6B7280] hover:text-[#F2F0EB] transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => navigateMonth(1)}
                    className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-[#6B7280] hover:text-[#F2F0EB] transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="glass rounded-2xl p-4 flex items-center justify-center h-64">
                  <Loader2 className="w-6 h-6 animate-spin text-[#6B7280]" />
                </div>
              ) : (
                <div className="glass rounded-2xl p-4">
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {DAYS.map((d) => <div key={d} className="text-center text-[10px] text-[#6B7280] font-medium py-1">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                      <CalendarDay
                        key={day}
                        day={day}
                        data={calendar[day]}
                        selected={selectedDay === day}
                        onClick={() => setSelectedDay(day)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly summary */}
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-[#F2F0EB] mb-4">Monthly Summary — {MONTHS[month]}</h3>
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-[#6B7280]" />
                  </div>
                ) : trades.length === 0 ? (
                  <p className="text-xs text-[#6B7280] text-center py-2">
                    No trades yet. Hit <span className="text-[#F2F0EB] font-medium">Sync Now</span> to import from MT5.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {[
                      { l: "Net PnL", v: `${totalPnL >= 0 ? "+" : ""}$${Math.abs(totalPnL).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, c: totalPnL >= 0 ? "text-[#22C55E]" : "text-red-400" },
                      { l: "Win Days", v: `${winDays}/${totalDays}`, c: "text-[#4BA3D4]" },
                      { l: "Trades", v: String(trades.length), c: "text-[#F2F0EB]" },
                      { l: "Win Rate", v: (wins + losses) > 0 ? `${((wins / (wins + losses)) * 100).toFixed(0)}%` : "—", c: "text-[#22C55E]" },
                      { l: "Avg Win", v: avgWin != null ? `$${avgWin.toFixed(2)}` : "—", c: "text-[#22C55E]" },
                      { l: "Avg Loss", v: avgLoss != null ? `-$${Math.abs(avgLoss).toFixed(2)}` : "—", c: "text-red-400" },
                    ].map((s) => (
                      <div key={s.l}>
                        <p className="text-[10px] text-[#6B7280] mb-1">{s.l}</p>
                        <p className={cn("text-sm font-bold", s.c)}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Day detail panel */}
            <div className="w-72 flex-shrink-0 space-y-4">
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#F2F0EB]">
                    {MONTHS[month]} {selectedDay}
                    {isCurrentMonth && selectedDay === today.getDate() && (
                      <span className="ml-2 text-[10px] px-2 py-0.5 bg-[#03588C]/20 text-[#4BA3D4] rounded-full">Today</span>
                    )}
                  </h3>
                </div>

                {dayData && dayData.trades > 0 ? (
                  <div className="space-y-3">
                    <p className={cn("text-3xl font-black", dayData.pnl >= 0 ? "text-[#22C55E]" : "text-red-400")}>
                      {dayData.pnl >= 0 ? "+" : ""}${Math.abs(dayData.pnl).toFixed(2)}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div><p className="text-[#6B7280]">Trades</p><p className="text-[#F2F0EB] font-bold">{dayData.trades}</p></div>
                      <div>
                        <p className="text-[#6B7280]">Win Rate</p>
                        <p className="text-[#22C55E] font-bold">
                          {selectedDayTrades.length > 0
                            ? `${Math.round((selectedDayTrades.filter((t) => (t.pnl ?? 0) > 0).length / selectedDayTrades.length) * 100)}%`
                            : "—"}
                        </p>
                      </div>
                    </div>

                    {/* Day trades mini-list */}
                    <div className="space-y-1.5 mt-2">
                      {selectedDayTrades.map((t) => {
                        const tHasPnl = t.pnl != null;
                        const tIsWin = tHasPnl && (t.pnl ?? 0) >= 0;
                        return (
                        <div key={t.id} className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-xl">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", !tHasPnl ? "bg-[#6B7280]" : tIsWin ? "bg-[#22C55E]" : "bg-red-500")} />
                            <span className="text-xs font-medium text-[#F2F0EB]">{t.symbol}</span>
                            <span className="text-[10px] text-[#6B7280]">{t.direction === "long" ? "L" : "S"}</span>
                          </div>
                          <span className={cn("text-xs font-bold", !tHasPnl ? "text-[#6B7280]" : tIsWin ? "text-[#22C55E]" : "text-red-400")}>
                            {!tHasPnl ? "Pending" : `${tIsWin ? "+" : ""}$${Math.abs(t.pnl ?? 0).toFixed(2)}`}
                          </span>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#6B7280] text-center py-4">No trades on this day</p>
                )}

                <div className="mt-4 pt-4 border-t border-white/[0.05]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Mic className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span className="text-[10px] text-[#6B7280] font-medium uppercase tracking-wide">Session Notes</span>
                  </div>
                  <textarea
                    value={dayNotes}
                    onChange={(e) => saveDayNotes(e.target.value)}
                    placeholder="Add session notes..."
                    rows={3}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-[#F2F0EB] placeholder-[#6B7280] resize-none focus:outline-none focus:border-[#03588C]/50"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {view === "analytics" && (
          <div className="flex-1 max-w-3xl">
            <div className="glass rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/[0.05]">
                <h3 className="text-sm font-semibold text-[#F2F0EB]">Emotional Context Breakdown</h3>
                <p className="text-[11px] text-[#6B7280] mt-1">
                  Whether trading Rattled vs Clear produces different outcomes — {MONTHS[month]} {year}.
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-5 h-5 animate-spin text-[#6B7280]" />
                </div>
              ) : moodBreakdown.length === 0 ? (
                <div className="px-6 py-14 flex flex-col items-center text-center">
                  <Leaf className="w-7 h-7 text-[#6B7280]/30 mb-3" />
                  <p className="text-sm text-[#F2F0EB]/60 mb-1">No emotional context data yet.</p>
                  <p className="text-[12px] text-[#6B7280] max-w-xs">
                    Visit Refuge before logging trades to unlock mood-performance insights.
                  </p>
                  <a
                    href="/refuge"
                    className="flex items-center gap-1.5 mt-4 text-[11px] text-[#4BA3D4] hover:text-[#38BDF8] transition-colors"
                  >
                    <Leaf className="w-3 h-3" />
                    Go to Refuge →
                  </a>
                </div>
              ) : (
                <>
                  {/* Column headers */}
                  <div className="flex items-center gap-4 px-6 py-2.5 border-b border-white/[0.04] text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B7280]">
                    <span className="flex-1 min-w-0">Mood</span>
                    <span className="w-14 text-right flex-shrink-0">Trades</span>
                    <span className="w-24 text-right flex-shrink-0">Avg P&L</span>
                    <span className="w-32 flex-shrink-0">Win Rate</span>
                    <span className="w-20 text-right flex-shrink-0">Avg Size</span>
                  </div>

                  {/* Data rows */}
                  <div className="divide-y divide-white/[0.04]">
                    {moodBreakdown.map((row, i) => {
                      const isBest  = moodBreakdown.length >= 2 && i === 0;
                      const isWorst = moodBreakdown.length >= 2 && i === moodBreakdown.length - 1;
                      const pnlPositive = row.avgPnl >= 0;
                      return (
                        <div
                          key={row.refugeMood}
                          className="relative flex items-center gap-4 px-6 py-4"
                          style={isBest
                            ? { background: `${row.accent}08` }
                            : isWorst
                            ? { background: "rgba(239,68,68,0.04)" }
                            : undefined}
                        >
                          {/* Left accent stripe */}
                          {(isBest || isWorst) && (
                            <div
                              className="absolute left-0 top-0 bottom-0 w-[3px]"
                              style={{ background: isBest ? row.accent : "#EF4444" }}
                            />
                          )}

                          {/* Mood pill + rank badge */}
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <span
                              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg flex-shrink-0"
                              style={{ background: `${row.accent}22`, color: row.accent, border: `1px solid ${row.accent}33` }}
                            >
                              {row.refugeMood}
                            </span>
                            {isBest && (
                              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-1.5 py-0.5 rounded-md flex-shrink-0">
                                Best
                              </span>
                            )}
                            {isWorst && (
                              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-md flex-shrink-0">
                                Worst
                              </span>
                            )}
                          </div>

                          {/* Trade count */}
                          <span className="w-14 text-right flex-shrink-0 text-[12px] text-[#F2F0EB]/50 tabular-nums">
                            {row.count}
                          </span>

                          {/* Avg P&L */}
                          <span
                            className="w-24 text-right flex-shrink-0 text-[13px] font-bold tabular-nums"
                            style={{ color: pnlPositive ? "#22C55E" : "#EF4444" }}
                          >
                            {pnlPositive ? "+" : ""}${Math.abs(row.avgPnl).toFixed(2)}
                          </span>

                          {/* Win rate bar */}
                          <div className="w-32 flex-shrink-0 space-y-1.5">
                            <span className="text-[11px] font-medium text-[#F2F0EB]/70 tabular-nums">
                              {Math.round(row.winRate * 100)}%
                            </span>
                            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${row.winRate * 100}%`,
                                  background: row.winRate >= 0.6
                                    ? "#22C55E"
                                    : row.winRate >= 0.4
                                    ? "#F59E0B"
                                    : "#EF4444",
                                }}
                              />
                            </div>
                          </div>

                          {/* Avg position size */}
                          <span className="w-20 text-right flex-shrink-0 text-[12px] text-[#F2F0EB]/50 tabular-nums">
                            {row.avgVolume != null ? `${row.avgVolume.toFixed(2)}` : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Low-data footer note */}
                  {moodBreakdown.reduce((s, r) => s + r.count, 0) < 5 && (
                    <div className="px-6 py-3 border-t border-white/[0.04]">
                      <p className="text-[10px] text-[#6B7280]">
                        More data needed for reliable patterns — keep logging trades after Refuge sessions.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {view === "list" && (
          <div className="flex-1 space-y-3 max-w-3xl">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-[#6B7280]" />
              </div>
            ) : trades.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center">
                <p className="text-[#F2F0EB] font-medium mb-2">No trades yet</p>
                <p className="text-sm text-[#6B7280] mb-5">Connect your broker and sync to import trades automatically.</p>
                <Button onClick={handleSync} disabled={syncing} size="sm">
                  {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Sync Now
                </Button>
              </div>
            ) : (
              trades.map((trade) => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  expanded={expandedTrade === trade.id}
                  onToggle={() => setExpandedTrade(expandedTrade === trade.id ? null : trade.id)}
                  onUpdate={(updates) => updateTrade(trade.id, updates)}
                />
              ))
            )}
          </div>
        )}
      </main>

      {showAddModal && (
        <AddTradeModal
          onClose={() => setShowAddModal(false)}
          onAdded={loadTrades}
        />
      )}

      {showImportModal && (
        <ImportTradesModal
          onClose={() => setShowImportModal(false)}
          onImported={loadTrades}
        />
      )}
    </div>
  );
}
