"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Loader2 } from "lucide-react";
import { BiomeCanvas } from "@/components/ui/BiomeCanvas";
import { getBiome } from "@/lib/biomes";

// ── Types ─────────────────────────────────────────────────────────────────

export interface ExerciseTarget {
  name: string;
  type: string;  // "REBOOT" | "REWIRE" | "RECOVERY"
  mood: string;  // active Refuge mood
}

// ── Helpers ───────────────────────────────────────────────────────────────

const TYPE_COLOR: Record<string, string> = {
  REBOOT:   "#22C55E",
  REWIRE:   "#4BA3D4",
  RECOVERY: "#03588C",
};

function splitSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+["']?/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
}

// ── Component ─────────────────────────────────────────────────────────────

export function ExerciseNarrationPlayer({
  exercise,
  onClose,
}: {
  exercise: ExerciseTarget;
  onClose:  () => void;
}) {
  const biome = getBiome(exercise.mood);

  const [status,          setStatus]          = useState<"loading" | "ready" | "error">("loading");
  const [playing,         setPlaying]         = useState(false);
  const [started,         setStarted]         = useState(false);
  const [done,            setDone]            = useState(false);
  const [currentSentence, setCurrentSentence] = useState(-1);
  const [sentences,       setSentences]       = useState<string[]>([]);
  const [errMsg,          setErrMsg]          = useState("");

  const utteranceRef      = useRef<SpeechSynthesisUtterance | null>(null);
  const sentenceOffsets   = useRef<number[]>([]);
  const sentenceEls       = useRef<(HTMLSpanElement | null)[]>([]);

  // ── Fetch script & build utterance ────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams({
      exercise: exercise.name,
      type:     exercise.type,
      mood:     exercise.mood,
    });

    fetch(`/api/refuge/narration?${params}`)
      .then((r) => {
        if (!r.ok) return r.text().then((t) => { throw new Error(t || `Server error ${r.status}`); });
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (!data.script) {
          setErrMsg(data.error ?? "Failed to generate session.");
          setStatus("error");
          return;
        }

        const segs = splitSentences(data.script);
        setSentences(segs);

        // Pre-compute char offset of each sentence in the full text
        const offsets: number[] = [];
        let pos = 0;
        for (const s of segs) {
          offsets.push(pos);
          pos += s.length + 1; // +1 for the space between sentences
        }
        sentenceOffsets.current = offsets;

        const utt = new SpeechSynthesisUtterance(data.script);
        utt.rate   = 0.85;
        utt.pitch  = 0.9;
        utt.volume = 1;

        // Assign first available English male voice, fall back to any English voice
        const assignVoice = () => {
          const voices = speechSynthesis.getVoices();
          const voice =
            voices.find((v) => v.lang.startsWith("en") && /male/i.test(v.name)) ??
            voices.find((v) => v.lang.startsWith("en")) ??
            null;
          if (voice) utt.voice = voice;
        };

        if (speechSynthesis.getVoices().length > 0) {
          assignVoice();
        } else {
          speechSynthesis.addEventListener("voiceschanged", assignVoice, { once: true });
        }

        // Map charIndex → sentence index on each boundary event
        utt.onboundary = (e) => {
          const offs = sentenceOffsets.current;
          let idx = 0;
          for (let i = offs.length - 1; i >= 0; i--) {
            if (e.charIndex >= offs[i]) { idx = i; break; }
          }
          setCurrentSentence(idx);
        };

        utt.onend = () => {
          if (!cancelled) { setPlaying(false); setDone(true); }
        };

        // Ignore errors caused by cancel() on unmount / close
        utt.onerror = (e) => {
          if (!cancelled && e.error !== "interrupted" && e.error !== "canceled") {
            setErrMsg("Speech synthesis error. Please try again.");
            setStatus("error");
          }
        };

        utteranceRef.current = utt;
        setStatus("ready");
      })
      .catch((err) => {
        if (!cancelled) {
          setErrMsg(err.message ?? "Network error. Please try again.");
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
      speechSynthesis.cancel();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scroll active sentence into view ──────────────────────────────────────

  useEffect(() => {
    sentenceEls.current[currentSentence]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentSentence]);

  // ── Controls ──────────────────────────────────────────────────────────────

  const handlePlayPause = useCallback(() => {
    const utt = utteranceRef.current;
    if (!utt) return;
    if (!started) {
      speechSynthesis.speak(utt);
      setStarted(true);
      setPlaying(true);
    } else if (playing) {
      speechSynthesis.pause();
      setPlaying(false);
    } else {
      speechSynthesis.resume();
      setPlaying(true);
    }
  }, [started, playing]);

  const handleClose = () => {
    speechSynthesis.cancel();
    onClose();
  };

  const typeColor = TYPE_COLOR[exercise.type] ?? "#4BA3D4";
  const progress  = sentences.length > 0
    ? Math.max(0, currentSentence + 1) / sentences.length
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[110] flex flex-col overflow-hidden"
      style={{ background: biome.gradient }}
    >
      <BiomeCanvas
        biomeKey={biome.animation.key}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-0.5 h-5 rounded-full" style={{ background: biome.accent }} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Mental Toolkit</p>
              <p className="text-[11px] text-white/55">{biome.name} · {exercise.mood}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-white/55 hover:text-white hover:bg-white/[0.14] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Exercise identity */}
        <div className="text-center px-6 pt-3 pb-2 flex-shrink-0 space-y-1.5">
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border"
            style={{ color: typeColor, borderColor: `${typeColor}40`, background: `${typeColor}15` }}
          >
            {exercise.type}
          </span>
          <h2 className="text-[22px] font-bold text-white tracking-tight leading-tight">
            {exercise.name}
          </h2>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">

          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-4"
            >
              <div
                className="w-20 h-20 rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: `rgba(${biome.accentRgb}, 0.35)`,
                  background:  `rgba(${biome.accentRgb}, 0.1)`,
                }}
              >
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: biome.accent }} />
              </div>
              <p className="text-[13px] text-white/45 italic">Crafting your session…</p>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8"
            >
              <p className="text-sm text-red-400">{errMsg}</p>
              <button
                onClick={handleClose}
                className="text-xs text-white/50 underline hover:text-white/80 transition-colors"
              >
                Close
              </button>
            </motion.div>
          )}

          {status === "ready" && (
            <motion.div
              key="player"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="flex-1 flex flex-col min-h-0 px-5 pb-6 gap-4"
            >
              {/* Script */}
              <div className="flex-1 overflow-y-auto rounded-2xl bg-black/30 backdrop-blur-sm border border-white/[0.08] px-5 py-4">
                <p className="text-[14px] leading-[2] select-none">
                  {sentences.map((s, i) => (
                    <span
                      key={i}
                      ref={(el) => { sentenceEls.current[i] = el; }}
                      className="transition-colors duration-500"
                      style={{
                        color: i === currentSentence
                          ? "#ffffff"
                          : i < currentSentence
                          ? "rgba(255,255,255,0.25)"
                          : "rgba(255,255,255,0.48)",
                        textShadow: i === currentSentence
                          ? `0 0 20px rgba(${biome.accentRgb}, 0.5)`
                          : "none",
                      }}
                    >
                      {s}{" "}
                    </span>
                  ))}
                </p>
              </div>

              {/* Progress + controls */}
              <div className="flex-shrink-0 flex flex-col items-center gap-3">
                {/* Progress bar */}
                <div className="w-full max-w-sm space-y-1.5">
                  <div className="h-px bg-white/[0.12] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress * 100}%`, background: biome.accent }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/25 tabular-nums">
                    <span>{Math.max(0, currentSentence + 1)} / {sentences.length} sentences</span>
                    {done && <span style={{ color: biome.accent }}>complete</span>}
                  </div>
                </div>

                {/* Play / Pause */}
                <button
                  onClick={handlePlayPause}
                  className="w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  style={{
                    borderColor: `rgba(${biome.accentRgb}, 0.45)`,
                    background:  `rgba(${biome.accentRgb}, 0.14)`,
                    boxShadow:   `0 0 28px rgba(${biome.accentRgb}, 0.2)`,
                    color:       "#fff",
                  }}
                >
                  {playing
                    ? <Pause className="w-5 h-5" />
                    : <Play  className="w-5 h-5 ml-0.5" />}
                </button>

                {!started && (
                  <p className="text-[11px] italic text-white/28 text-center">
                    Press play when you&rsquo;re ready.
                  </p>
                )}

                {done && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[12px] italic text-white/45 text-center"
                  >
                    Session complete. Carry this with you.
                  </motion.p>
                )}

                <p className="text-[10px] text-white/18 uppercase tracking-[0.18em]">
                  Narrated for your {exercise.mood} state
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}
