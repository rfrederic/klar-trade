"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import {
  Play, ChevronLeft, ChevronRight, Volume2,
  Star, Flame, Clock, Zap, Moon, Sun, CloudRain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { getBiome, BIOME_ORDER } from "@/lib/biomes";
import { BiomeCanvas } from "@/components/ui/BiomeCanvas";
import { MeditationPlayer } from "@/components/ui/MeditationPlayer";
import { ExerciseNarrationPlayer, type ExerciseTarget } from "@/components/ui/ExerciseNarrationPlayer";
import { RefugeHistory } from "@/components/ui/RefugeHistory";

// ─── Mood overlay ─────────────────────────────────────────────────────────

const MOOD_UI = {
  Rattled: { icon: Zap,       accent: "#8B5CF6", ring: "border-violet-500/30 hover:border-violet-400/60 bg-violet-500/10 hover:bg-violet-500/16",  iconColor: "text-violet-400" },
  Charged: { icon: Flame,     accent: "#38BDF8", ring: "border-sky-400/30 hover:border-sky-400/60 bg-sky-400/10 hover:bg-sky-400/16",               iconColor: "text-sky-400" },
  Heavy:   { icon: CloudRain, accent: "#06B6D4", ring: "border-cyan-500/30 hover:border-cyan-500/60 bg-cyan-500/10 hover:bg-cyan-500/16",            iconColor: "text-cyan-400" },
  Numb:    { icon: Moon,      accent: "#67E8F9", ring: "border-teal-400/30 hover:border-teal-300/60 bg-teal-400/10 hover:bg-teal-400/16",            iconColor: "text-teal-300" },
  Clear:   { icon: Sun,       accent: "#F59E0B", ring: "border-amber-400/30 hover:border-amber-400/60 bg-amber-400/10 hover:bg-amber-400/16",        iconColor: "text-amber-400" },
} as const;

const MOOD_DESC: Record<string, string> = {
  Rattled: "Reactive, chasing — hard to sit on hands",
  Charged: "Dialed in, confident, itching to execute",
  Heavy:   "Carrying a loss into today's chart",
  Numb:    "Screen time without signal, just going through it",
  Clear:   "Patient, process-led, trusting the plan",
};

function MoodOverlay({ onSelect }: { onSelect: (moodId: string) => void }) {
  return (
    <motion.div
      key="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#06080f]/96 backdrop-blur-sm px-6"
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 55% 45% at 50% 38%, rgba(75,163,212,0.055) 0%, transparent 70%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.38 }}
        className="relative z-10 max-w-xl w-full"
      >
        <div className="text-center mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#6B7280] mb-2">Refuge</p>
          <h1 className="text-[28px] font-bold text-[#F2F0EB] mb-2 tracking-tight">How are you feeling?</h1>
          <p className="text-sm text-[#6B7280]">Your biome will meet you where you are.</p>
        </div>

        <div className="grid grid-cols-5 gap-2.5">
          {BIOME_ORDER.map((moodId, i) => {
            const ui = MOOD_UI[moodId as keyof typeof MOOD_UI];
            const biome = getBiome(moodId);
            const Icon = ui.icon;
            return (
              <motion.button
                key={moodId}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 + i * 0.07, duration: 0.32 }}
                whileHover={{ scale: 1.06, y: -7 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onSelect(moodId)}
                className={cn("flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-200", ui.ring)}
              >
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -4, 0] }}
                  transition={{ duration: 0.45 }}
                  className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", ui.ring)}
                >
                  <Icon className={cn("w-5 h-5", ui.iconColor)} />
                </motion.div>
                <div className="text-center">
                  <p className="text-[12px] font-semibold text-[#F2F0EB] leading-tight">{moodId}</p>
                  <p className="text-[9.5px] text-[#6B7280] mt-0.5 leading-snug">{MOOD_DESC[moodId]}</p>
                  <p className="text-[9px] mt-1 font-medium" style={{ color: ui.accent }}>{biome.name}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <p className="text-center text-[10px] text-[#6B7280]/50 mt-8">
          Saved automatically · Shapes your practice today
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Toolkit data ─────────────────────────────────────────────────────────

const toolkit = [
  {
    category: "REBOOT",
    badge: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
    items: [
      { name: "60 Second Reboot", duration: "1:42" },
      { name: "Box Breathing",    duration: "5:33" },
      { name: "Reset",            duration: "4:01" },
    ],
  },
  {
    category: "REWIRE",
    badge: "bg-[#4BA3D4]/10 text-[#4BA3D4] border-[#4BA3D4]/20",
    items: [
      { name: "Visualization",      duration: "8:00" },
      { name: "Affirmations",       duration: "5:00" },
      { name: "Pattern Interrupt",  duration: "3:30" },
      { name: "Journaling Prompt",  duration: "10:00" },
      { name: "Focus Reset",        duration: "6:00" },
      { name: "Gratitude Practice", duration: "7:00" },
      { name: "Mindful Observation",duration: "4:30" },
    ],
  },
  {
    category: "RECOVERY",
    badge: "bg-[#03588C]/10 text-[#4BA3D4] border-[#03588C]/20",
    items: [
      { name: "Post-Loss Reset",     duration: "12:00" },
      { name: "Emotional Release",   duration: "9:00" },
      { name: "Confidence Rebuild",  duration: "15:00" },
      { name: "Acceptance Practice", duration: "8:30" },
      { name: "Rest Protocol",       duration: "20:00" },
    ],
  },
];

const durations = ["5 min", "10 min", "15 min", "30 min", "1 hour"];

// ─── Client component ─────────────────────────────────────────────────────

export function RefugeClient() {
  const [showOverlay, setShowOverlay]       = useState(false);
  const [activeMoodId, setActiveMoodId]     = useState<string | null>(null);
  const [biomeId, setBiomeId]               = useState<string>("Clear");
  const [selectedDuration, setSelectedDuration] = useState("10 min");
  const [sound, setSound]                   = useState("Forest Morning");
  const [volume, setVolume]                 = useState(70);
  const [showPlayer, setShowPlayer]          = useState(false);
  const [intention, setIntention]           = useState("");
  const [filter, setFilter]                 = useState("All");
  const [starred, setStarred]               = useState<Record<string, boolean>>({});
  const [scriptExpanded, setScriptExpanded] = useState(false);
  const [activeExercise, setActiveExercise] = useState<ExerciseTarget | null>(null);

  useEffect(() => {
    fetch("/api/refuge/checkin")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.checkin) {
          const age = Date.now() - new Date(d.checkin.created_at).getTime();
          if (age < 30 * 60 * 1000) {
            setActiveMoodId(d.checkin.mood);
            setBiomeId(d.checkin.mood);
            setSound(getBiome(d.checkin.mood).ambient.label);
            return;
          }
        }
        setShowOverlay(true);
      })
      .catch(() => { setShowOverlay(true); });
  }, []);

  const handleMoodSelect = async (moodId: string) => {
    const biome = getBiome(moodId);
    setActiveMoodId(moodId);
    setBiomeId(moodId);
    setSound(biome.ambient.label);
    setScriptExpanded(false);
    await fetch("/api/refuge/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood: moodId, biome: biome.name }),
    }).catch(() => {});
    setShowOverlay(false);
  };

  const biome = getBiome(biomeId);
  const allSounds = [biome.ambient.label, "White Noise", "Rain", "Ocean", "Forest", "Fire"].filter(
    (s, i, a) => a.indexOf(s) === i
  );
  const activeMoodUi = activeMoodId ? MOOD_UI[activeMoodId as keyof typeof MOOD_UI] : null;
  const ActiveIcon   = activeMoodUi?.icon;

  const biomeOrderIndex = BIOME_ORDER.indexOf(biomeId);
  const allCategories = ["All 15", "Reboot 3", "Rewire 7", "Recovery 5"];

  return (
    <div className="flex flex-col flex-1 relative">
      <AnimatePresence>
        {showPlayer && (
          <MeditationPlayer
            biome={biome}
            initialDuration={parseInt(selectedDuration) || 5}
            initialVolume={volume / 100}
            sessionMood={activeMoodId ?? biome.moodId}
            onClose={() => setShowPlayer(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOverlay && <MoodOverlay onSelect={handleMoodSelect} />}
      </AnimatePresence>

      <AnimatePresence>
        {activeExercise && (
          <ExerciseNarrationPlayer
            exercise={activeExercise}
            onClose={() => setActiveExercise(null)}
          />
        )}
      </AnimatePresence>

      <Header
        title="Refuge"
        subtitle={
          activeMoodId
            ? `${biome.name} · ${activeMoodId}`
            : "Sharpen before you trade. Decompress after."
        }
        action={
          <button
            onClick={() => setShowOverlay(true)}
            className="text-[11px] text-[#6B7280] hover:text-[#F2F0EB] transition-colors px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/[0.12]"
          >
            {activeMoodId ? `${activeMoodId} · change` : "Check in"}
          </button>
        }
      />

      <main className="flex-1 overflow-y-auto">
        {/* ── Hero ── */}
        <div
          className="relative min-h-[460px] flex items-center justify-center px-6 py-12 overflow-hidden transition-[background] duration-1000"
          style={{ background: biome.gradient }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={biomeId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="absolute inset-0"
            >
              <BiomeCanvas
                biomeKey={biome.animation.key}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
            </motion.div>
          </AnimatePresence>

          <button
            onClick={() => {
              const prev = BIOME_ORDER[Math.max(0, biomeOrderIndex - 1)];
              setBiomeId(prev);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 backdrop-blur flex items-center justify-center text-white/60 hover:text-white transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              const next = BIOME_ORDER[Math.min(BIOME_ORDER.length - 1, biomeOrderIndex + 1)];
              setBiomeId(next);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 backdrop-blur flex items-center justify-center text-white/60 hover:text-white transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {BIOME_ORDER.map((id) => (
              <button
                key={id}
                onClick={() => setBiomeId(id)}
                className="transition-all rounded-full"
                style={{
                  background: id === biomeId ? "#fff" : "rgba(255,255,255,0.3)",
                  width: id === biomeId ? "16px" : "6px",
                  height: "6px",
                }}
              />
            ))}
          </div>

          {activeMoodId && ActiveIcon && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full border bg-black/40 backdrop-blur text-[11px] font-medium",
                activeMoodUi?.ring ?? ""
              )}>
                <ActiveIcon className={cn("w-3 h-3", activeMoodUi?.iconColor)} />
                <span className="text-white/80">{biome.name}</span>
              </div>
            </div>
          )}

          <div className="relative z-10 max-w-2xl w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.1]">
                <h2 className="text-base font-bold text-white mb-4">Meditation Session</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] text-white/60 uppercase tracking-wide mb-2">Duration</p>
                    <div className="flex flex-wrap gap-1.5">
                      {durations.map((d) => (
                        <button key={d} onClick={() => setSelectedDuration(d)}
                          className={cn("px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                            selectedDuration === d
                              ? "text-white border-transparent"
                              : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20"
                          )}
                          style={selectedDuration === d ? { background: biome.accent, borderColor: biome.accent } : {}}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-white/60 uppercase tracking-wide mb-2">Ambient Sound</p>
                    <select value={sound} onChange={(e) => setSound(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
                      {allSounds.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] text-white/60 uppercase tracking-wide">Volume</p>
                      <Volume2 className="w-3.5 h-3.5 text-white/60" />
                    </div>
                    <input type="range" min={0} max={100} value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-full" style={{ accentColor: biome.accent }} />
                  </div>

                  <button
                    onClick={() => setShowPlayer(true)}
                    className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all text-white hover:opacity-90"
                    style={{ background: biome.accent }}
                  >
                    <Play className="w-4 h-4" /> Begin Session
                  </button>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.1]">
                <div className="mb-4">
                  <p className="text-[11px] text-white/60 uppercase tracking-wide mb-2">Today I Will</p>
                  <textarea value={intention} onChange={(e) => setIntention(e.target.value)}
                    placeholder="Set your trading intention for today..."
                    rows={3}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/40 resize-none focus:outline-none" />
                </div>

                <p className="text-[11px] text-white/60 uppercase tracking-wide mb-3">Your Progress</p>
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {["S","M","T","W","T","F","S"].map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className={cn("w-6 h-6 rounded-full border flex items-center justify-center text-[9px]",
                        i === 3 ? "text-white" : "border-white/20 text-white/40"
                      )}
                      style={i === 3 ? { background: biome.accent, borderColor: biome.accent } : {}}>
                        {i === 3 ? "●" : "○"}
                      </div>
                      <span className="text-[9px] text-white/40">{d}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-xs text-white/60">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Minutes This Week:
                    <span className="text-white font-semibold">0m</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-[#F59E0B]" /> Current Streak:
                    <span className="text-white font-semibold">0 Days</span>
                  </div>
                </div>
              </div>
            </div>

            {activeMoodId && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/[0.1] overflow-hidden"
              >
                <button
                  onClick={() => setScriptExpanded((v) => !v)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-1 h-4 rounded-full" style={{ background: biome.accent }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                      Meditation · {biome.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-white/40">{scriptExpanded ? "hide" : "read"}</span>
                </button>
                <AnimatePresence initial={false}>
                  {scriptExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28 }}
                    >
                      <p className="px-5 pb-5 text-[13px] text-white/70 leading-[1.8] italic">
                        &ldquo;{biome.script}&rdquo;
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── Mental Toolkit ── */}
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#F2F0EB]">Mental Toolkit</h2>
            <p className="text-sm text-[#6B7280] mt-0.5">A curated library of mental exercises to rewire your trading mind.</p>
          </div>

          <div className="flex gap-1.5">
            {allCategories.map((c) => (
              <button key={c} onClick={() => setFilter(c.split(" ")[0])}
                className={cn("px-4 py-2 rounded-xl text-xs font-medium border transition-all",
                  filter === c.split(" ")[0]
                    ? "bg-[#03588C] text-white border-[#03588C]"
                    : "glass text-[#6B7280] hover:text-[#F2F0EB]")}>
                {c}
              </button>
            ))}
          </div>

          {toolkit
            .filter((g) => filter === "All" || g.category === filter.toUpperCase())
            .map((group) => (
              <div key={group.category}>
                <h3 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest mb-3">{group.category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {group.items.map((item) => (
                    <div
                      key={item.name}
                      onClick={() => {
                        setActiveExercise({ name: item.name, type: group.category, mood: activeMoodId ?? "Clear" });
                      }}
                      className="glass rounded-2xl p-4 hover:-translate-y-0.5 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", group.badge)}>
                          {group.category}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setStarred((s) => ({ ...s, [item.name]: !s[item.name] })); }}
                        >
                          <Star className={cn("w-4 h-4 transition-colors",
                            starred[item.name] ? "text-[#D9CA82] fill-[#D9CA82]" : "text-[#6B7280]")} />
                        </button>
                      </div>
                      <h4 className="text-sm font-semibold text-[#F2F0EB] mb-1">{item.name}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#6B7280] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.duration}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full bg-[#03588C] flex items-center justify-center">
                          <Play className="w-3 h-3 text-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-[#D9CA82]" />
              <h3 className="text-sm font-semibold text-[#F2F0EB]">Quick Reset Tools</h3>
              <span className="text-[11px] text-[#6B7280]">Under 2 minutes each</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {["60 Second Reboot", "Box Breathing", "Pattern Interrupt"].map((name) => (
                <button key={name}
                  onClick={() => setActiveExercise({ name, type: "REBOOT", mood: activeMoodId ?? "Clear" })}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#03588C]/10 border border-[#03588C]/20 hover:bg-[#03588C]/20 transition-all text-left">
                  <div className="w-8 h-8 rounded-full bg-[#03588C] flex items-center justify-center flex-shrink-0">
                    <Play className="w-3.5 h-3.5 text-white ml-0.5" />
                  </div>
                  <span className="text-sm font-medium text-[#F2F0EB]">{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.05]">
          <RefugeHistory />
        </div>
      </main>
    </div>
  );
}
