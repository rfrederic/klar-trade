"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX, Play, Pause, RotateCcw } from "lucide-react";
import { BiomeCanvas } from "@/components/ui/BiomeCanvas";
import type { Biome } from "@/lib/biomes";

// ─── Breathing math ────────────────────────────────────────────────────────

const BREATH_PHASES = [
  { label: "Inhale", dur: 4000, fromScale: 0.68, toScale: 1.0  },
  { label: "Hold",   dur: 2000, fromScale: 1.0,  toScale: 1.0  },
  { label: "Exhale", dur: 4000, fromScale: 1.0,  toScale: 0.68 },
  { label: "Hold",   dur: 2000, fromScale: 0.68, toScale: 0.68 },
] as const;

const BREATH_CYCLE = BREATH_PHASES.reduce((s, p) => s + p.dur, 0); // 12 000 ms

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function getBreathState(ms: number) {
  const pos = ms % BREATH_CYCLE;
  let acc = 0;
  for (const p of BREATH_PHASES) {
    if (pos < acc + p.dur) {
      const t         = (pos - acc) / p.dur;
      const scale     = p.fromScale + (p.toScale - p.fromScale) * easeInOut(t);
      const countdown = Math.ceil((p.dur - (pos - acc)) / 1000);
      return { label: p.label as string, scale, countdown };
    }
    acc += p.dur;
  }
  return { label: "Inhale", scale: 0.68, countdown: 4 };
}

// ─── Narration helpers ─────────────────────────────────────────────────────

function splitScript(script: string): string[] {
  return (script.match(/[^.!?]+[.!?]+/g) ?? [script]).map(s => s.trim()).filter(Boolean);
}

function getSentenceIdx(elapsed: number, total: number, count: number): number | null {
  if (count === 0) return null;
  const intro = Math.min(total * 0.1, 18000);
  const outro = Math.min(total * 0.1, 18000);
  if (elapsed < intro || elapsed > total - outro) return null;
  const window = total - intro - outro;
  return Math.min(Math.floor(((elapsed - intro) / window) * count), count - 1);
}

// ─── Utils ─────────────────────────────────────────────────────────────────

function fmt(ms: number) {
  const t = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}

function rampAudio(audio: HTMLAudioElement, to: number, ms: number) {
  const steps = 20;
  const from  = audio.volume;
  let   i     = 0;
  const id    = setInterval(() => {
    i++;
    audio.volume = Math.max(0, Math.min(1, from + (to - from) * (i / steps)));
    if (i >= steps) { audio.volume = to; clearInterval(id); }
  }, ms / steps);
  return () => clearInterval(id);
}

// ─── Breathing ring ────────────────────────────────────────────────────────

const R    = 108;
const CIRC = 2 * Math.PI * R;

function BreathingRing({
  biome, elapsed, totalMs, playing,
}: {
  biome: Biome; elapsed: number; totalMs: number; playing: boolean;
}) {
  const { label, scale, countdown } = getBreathState(elapsed);
  const sessionPct = Math.min(elapsed / totalMs, 1);
  const glow       = Math.max(0, (scale - 0.68) / 0.32); // 0..1 during inhale

  return (
    <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
      {/* Session progress arc */}
      <svg viewBox="0 0 240 240" className="absolute inset-0" width={240} height={240}
        style={{ transform: "rotate(-90deg)" }}>
        <circle cx="120" cy="120" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
        <circle cx="120" cy="120" r={R} fill="none"
          stroke={biome.accent}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - sessionPct)}
        />
      </svg>

      {/* Fixed outer decoration ring */}
      <div className="absolute rounded-full border"
        style={{
          width: 186, height: 186,
          borderColor: `rgba(${biome.accentRgb}, 0.1)`,
        }} />

      {/* Breathing ring — scales with breath */}
      <div className="absolute rounded-full border-2"
        style={{
          width: 148, height: 148,
          transform: `scale(${scale})`,
          borderColor: `rgba(${biome.accentRgb}, ${0.38 + glow * 0.42})`,
          boxShadow: [
            `0 0 ${14 + glow * 34}px rgba(${biome.accentRgb}, ${0.14 + glow * 0.28})`,
            `inset 0 0 ${8 + glow * 18}px rgba(${biome.accentRgb}, ${0.04 + glow * 0.1})`,
          ].join(", "),
          transition: "border-color 0.3s, box-shadow 0.3s",
        }} />

      {/* Fill glow — also scales */}
      <div className="absolute rounded-full"
        style={{
          width: 88, height: 88,
          transform: `scale(${scale})`,
          background: `radial-gradient(circle, rgba(${biome.accentRgb}, ${0.13 + glow * 0.12}) 0%, transparent 80%)`,
        }} />

      {/* Center text */}
      <div className="relative z-10 flex flex-col items-center select-none">
        <AnimatePresence mode="wait">
          <motion.span
            key={playing ? label : "paused"}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35 }}
            className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/45"
          >
            {playing ? label : "Paused"}
          </motion.span>
        </AnimatePresence>

        <span className="text-[28px] font-light text-white/80 mt-0.5 tabular-nums leading-none">
          {playing ? countdown : "—"}
        </span>

        <span className="text-[11px] text-white/30 mt-2 tabular-nums">
          {fmt(totalMs - elapsed)}
        </span>
      </div>
    </div>
  );
}

// ─── Narration ─────────────────────────────────────────────────────────────

function NarrationLine({ line }: { line: string | null }) {
  return (
    <div className="h-28 flex items-center justify-center px-10">
      <AnimatePresence mode="wait">
        {line && (
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-[14px] italic text-white/52 text-center max-w-sm leading-[2] tracking-wide"
          >
            &ldquo;{line}&rdquo;
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Completion ────────────────────────────────────────────────────────────

function CompletionScreen({
  biome, durationMin, onClose, onReplay,
}: {
  biome: Biome; durationMin: number; onClose: () => void; onReplay: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.18, duration: 0.45 }}
        className="flex flex-col items-center gap-6 text-center max-w-xs"
      >
        {/* Check ring */}
        <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center"
          style={{
            borderColor: `rgba(${biome.accentRgb}, 0.55)`,
            background:  `rgba(${biome.accentRgb}, 0.1)`,
          }}>
          <svg viewBox="0 0 24 24" className="w-7 h-7" style={{ color: biome.accent }}>
            <path fill="none" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 mb-1">
            Session complete
          </p>
          <h2 className="text-[26px] font-bold text-white leading-tight">
            {durationMin} {durationMin === 1 ? "minute" : "minutes"}
          </h2>
          <p className="text-sm text-white/45 mt-1.5">{biome.name}</p>
        </div>

        <p className="text-[13px] italic text-white/42 leading-relaxed px-4">
          Carry this stillness with you.
        </p>

        <div className="flex gap-3">
          <button onClick={onReplay}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/15 text-[12px] font-medium text-white/65 hover:text-white hover:border-white/30 transition-all">
            <RotateCcw className="w-3.5 h-3.5" /> Replay
          </button>
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-[12px] font-semibold text-white transition-all hover:opacity-90"
            style={{ background: biome.accent }}>
            Return
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Player ────────────────────────────────────────────────────────────────

const DURATIONS = [2, 5, 10, 15] as const;

export function MeditationPlayer({
  biome,
  initialDuration = 5,
  initialVolume   = 0.6,
  sessionMood,
  onClose,
}: {
  biome: Biome;
  initialDuration?: number;
  initialVolume?:   number;
  sessionMood?:     string;
  onClose: () => void;
}) {
  const [duration,  setDuration]  = useState<number>(
    DURATIONS.includes(initialDuration as typeof DURATIONS[number]) ? initialDuration : 5
  );
  const [started,   setStarted]   = useState(false);
  const [playing,   setPlaying]   = useState(false);
  const [completed, setCompleted] = useState(false);
  const [elapsed,   setElapsed]   = useState(0);
  const [volume,    setVolume]    = useState(Math.max(0, Math.min(1, initialVolume)));
  const [muted,     setMuted]     = useState(false);
  const [showVol,   setShowVol]   = useState(false);

  const elapsedRef    = useRef(0);
  const audioRef      = useRef<HTMLAudioElement | null>(null);
  const rampRef       = useRef<(() => void) | null>(null);
  const loggedRef     = useRef(false);
  const completingRef = useRef(false);

  const totalMs    = duration * 60 * 1000;
  const sentences  = splitScript(biome.script);
  const sentIdx    = getSentenceIdx(elapsed, totalMs, sentences.length);
  const currentLine = sentIdx !== null ? sentences[sentIdx] ?? null : null;
  const progress   = Math.min(elapsed / totalMs, 1);

  // ── Audio setup ──

  useEffect(() => {
    const audio    = new Audio();
    audio.src      = biome.ambient.file;
    audio.loop     = true;
    audio.volume   = 0;
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ""; };
  }, [biome.ambient.file]);

  // ── Play / pause audio with fade ──

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    rampRef.current?.();  // cancel any in-flight ramp
    const target = muted ? 0 : volume;
    if (playing) {
      audio.play().catch(() => {});
      rampRef.current = rampAudio(audio, target, 3000);
    } else {
      const fadeDuration = completingRef.current ? 1800 : 900;
      completingRef.current = false;
      rampRef.current = rampAudio(audio, 0, fadeDuration);
      const t = setTimeout(() => audio.pause(), fadeDuration + 100);
      return () => clearTimeout(t);
    }
  }, [playing]);                 // eslint-disable-line react-hooks/exhaustive-deps

  // Volume knob while playing
  useEffect(() => {
    if (!playing || !audioRef.current) return;
    rampRef.current?.();
    rampRef.current = rampAudio(audioRef.current, muted ? 0 : volume, 400);
  }, [volume, muted]);           // eslint-disable-line react-hooks/exhaustive-deps

  // ── RAF session timer ──

  useEffect(() => {
    if (!playing) return;
    const origin = performance.now() - elapsedRef.current;
    let raf: number;
    const tick = () => {
      const e = performance.now() - origin;
      if (e >= totalMs) {
        elapsedRef.current    = totalMs;
        completingRef.current = true;
        setElapsed(totalMs);
        setPlaying(false);
        setCompleted(true);
        logSession(true);
        return;
      }
      elapsedRef.current = e;
      setElapsed(e);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, totalMs]);

  // Reset elapsed when duration changes while idle
  useEffect(() => {
    if (!started) {
      elapsedRef.current = 0;
      setElapsed(0);
    }
  }, [duration]);                // eslint-disable-line react-hooks/exhaustive-deps

  // ── Session logging ──

  const logSession = (completedFlag: boolean) => {
    if (!started || loggedRef.current) return;
    const mins = completedFlag ? duration : Math.floor(elapsedRef.current / 60000);
    if (mins < 1) return;
    loggedRef.current = true;
    fetch("/api/refuge/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood: sessionMood ?? biome.moodId, biome: biome.name, duration_min: mins, completed: completedFlag }),
    }).catch(() => {});
  };

  // ── Actions ──

  const handleStart = () => {
    elapsedRef.current    = 0;
    loggedRef.current     = false;
    completingRef.current = false;
    setElapsed(0);
    setCompleted(false);
    setStarted(true);
    setPlaying(true);
  };

  const handleReplay = () => {
    elapsedRef.current    = 0;
    loggedRef.current     = false;
    completingRef.current = false;
    setElapsed(0);
    setCompleted(false);
    setStarted(true);
    setPlaying(true);
  };

  const handleClose = () => {
    logSession(false);
    if (audioRef.current) {
      rampRef.current?.();
      rampRef.current = rampAudio(audioRef.current, 0, 600);
    }
    setTimeout(onClose, 650);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
      style={{ background: biome.gradient }}
    >
      {/* Canvas */}
      <BiomeCanvas
        biomeKey={biome.animation.key}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Readability veil */}
      <div className="absolute inset-0 bg-black/32 pointer-events-none" />

      {/* UI layer */}
      <div className="relative z-10 flex flex-col h-full">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-0.5 h-5 rounded-full" style={{ background: biome.accent }} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/38">
                {biome.name}
              </p>
              <p className="text-[11px] text-white/55 leading-tight">{biome.moodId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Volume slider */}
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {showVol && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 80, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <input type="range" min={0} max={1} step={0.02} value={volume}
                      onChange={e => setVolume(Number(e.target.value))}
                      className="w-20 h-0.5 block"
                      style={{ accentColor: biome.accent }} />
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={() => setShowVol(v => !v)}
                title="Adjust volume"
                className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-white/55 hover:text-white hover:bg-white/[0.14] transition-all"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-white/55 hover:text-white hover:bg-white/[0.14] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Main area ── */}
        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!started ? (
              /* Pre-session — duration selection */
              <motion.div
                key="pre"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-8"
              >
                <div className="text-center space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                    {biome.ambient.label}
                  </p>
                  <h2 className="text-[28px] font-bold text-white tracking-tight">
                    {biome.name}
                  </h2>
                  <p className="text-[13px] text-white/45">Choose a duration to begin</p>
                </div>

                {/* Duration pills */}
                <div className="flex gap-2.5">
                  {DURATIONS.map(d => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className="w-16 h-16 rounded-2xl text-sm font-bold border transition-all hover:scale-105 active:scale-95"
                      style={
                        duration === d
                          ? { background: biome.accent, borderColor: biome.accent, color: "#fff",
                              boxShadow: `0 0 24px rgba(${biome.accentRgb}, 0.35)` }
                          : { background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.14)",
                              color: "rgba(255,255,255,0.65)" }
                      }
                    >
                      {d}m
                    </button>
                  ))}
                </div>

                {/* Script preview */}
                <p className="text-[12px] italic text-white/32 max-w-xs text-center leading-relaxed px-4">
                  &ldquo;{sentences[0]}&rdquo;
                </p>

                <button
                  onClick={handleStart}
                  className="w-36 h-12 rounded-2xl text-[14px] font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background:  biome.accent,
                    boxShadow:   `0 0 30px rgba(${biome.accentRgb}, 0.3)`,
                  }}
                >
                  Begin
                </button>
              </motion.div>
            ) : (
              /* Active session — breathing ring */
              <motion.div
                key="session"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55 }}
              >
                <BreathingRing
                  biome={biome}
                  elapsed={elapsed}
                  totalMs={totalMs}
                  playing={playing}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Narration ── */}
        {started && <NarrationLine line={currentLine} />}

        {/* ── Bottom controls ── */}
        {started && (
          <div className="px-8 pb-10 space-y-5">
            {/* Progress track */}
            <div className="space-y-1.5">
              <div className="h-px bg-white/[0.1] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${progress * 100}%`, background: biome.accent }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/28 tabular-nums">
                <span>{fmt(elapsed)}</span>
                <span>{fmt(totalMs)}</span>
              </div>
            </div>

            {/* Play/Pause + Mute */}
            <div className="flex items-center justify-center gap-6">
              <span className="text-[11px] text-white/30 w-14 text-right tabular-nums">
                {duration}m
              </span>

              <button
                onClick={() => setPlaying(p => !p)}
                className="w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                style={{
                  borderColor: `rgba(${biome.accentRgb}, 0.45)`,
                  background:  `rgba(${biome.accentRgb}, 0.12)`,
                  boxShadow:   `0 0 22px rgba(${biome.accentRgb}, 0.14)`,
                  color:       "#fff",
                }}
              >
                {playing
                  ? <Pause className="w-5 h-5" />
                  : <Play  className="w-5 h-5 ml-0.5" />}
              </button>

              <div className="w-14 flex items-center">
                <button
                  onClick={() => setMuted(m => !m)}
                  title={muted ? "Unmute" : "Mute"}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-white/[0.1]"
                  style={{ color: muted ? `rgba(${biome.accentRgb}, 0.5)` : "rgba(255,255,255,0.4)" }}
                >
                  {muted
                    ? <VolumeX className="w-4 h-4" />
                    : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Completion ── */}
      <AnimatePresence>
        {completed && (
          <CompletionScreen
            biome={biome}
            durationMin={duration}
            onClose={handleClose}
            onReplay={handleReplay}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
