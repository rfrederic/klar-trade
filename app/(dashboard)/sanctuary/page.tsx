"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Play, Pause, ChevronLeft, ChevronRight, Volume2, Star, Flame, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const backgrounds = [
  { label: "Forest", gradient: "from-green-900/60 to-emerald-950/80" },
  { label: "Mountains", gradient: "from-slate-700/60 to-blue-950/80" },
  { label: "Ocean", gradient: "from-blue-800/60 to-cyan-950/80" },
  { label: "Desert Dawn", gradient: "from-orange-700/50 to-rose-950/70" },
];

const ambientSounds = ["White Noise", "Rain", "Ocean", "Forest", "Fire"];
const durations = ["5 min", "10 min", "15 min", "30 min", "1 hour"];

const toolkit = [
  {
    category: "REBOOT",
    color: "#22C55E",
    badge: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
    items: [
      { name: "60 Second Reboot", duration: "1:42", starred: false },
      { name: "Box Breathing", duration: "5:33", starred: true },
      { name: "Reset", duration: "4:01", starred: false },
    ],
  },
  {
    category: "REWIRE",
    color: "#4BA3D4",
    badge: "bg-[#4BA3D4]/10 text-[#4BA3D4] border-[#4BA3D4]/20",
    items: [
      { name: "Visualization", duration: "8:00", starred: false },
      { name: "Affirmations", duration: "5:00", starred: false },
      { name: "Pattern Interrupt", duration: "3:30", starred: true },
      { name: "Journaling Prompt", duration: "10:00", starred: false },
      { name: "Focus Reset", duration: "6:00", starred: false },
      { name: "Gratitude Practice", duration: "7:00", starred: false },
      { name: "Mindful Observation", duration: "4:30", starred: false },
    ],
  },
  {
    category: "RECOVERY",
    color: "#03588C",
    badge: "bg-[#03588C]/10 text-[#4BA3D4] border-[#03588C]/20",
    items: [
      { name: "Post-Loss Reset", duration: "12:00", starred: false },
      { name: "Emotional Release", duration: "9:00", starred: false },
      { name: "Confidence Rebuild", duration: "15:00", starred: false },
      { name: "Acceptance Practice", duration: "8:30", starred: false },
      { name: "Rest Protocol", duration: "20:00", starred: false },
    ],
  },
];

export default function SanctuaryPage() {
  const [bgIndex, setBgIndex] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState("10 min");
  const [sound, setSound] = useState("Rain");
  const [volume, setVolume] = useState(70);
  const [playing, setPlaying] = useState(false);
  const [intention, setIntention] = useState("");
  const [filter, setFilter] = useState("All");
  const [starred, setStarred] = useState<Record<string, boolean>>({});

  const allCategories = ["All 15", "Reboot 3", "Rewire 7", "Recovery 5"];
  const bg = backgrounds[bgIndex];

  const toggleStar = (name: string) => setStarred((s) => ({ ...s, [name]: !s[name] }));

  return (
    <div className="flex flex-col flex-1">
      <Header title="Sanctuary" subtitle="Reset your mind before or after a session." />

      <main className="flex-1 overflow-y-auto">
        {/* Hero meditation section */}
        <div className={cn("relative bg-gradient-to-b", bg.gradient, "min-h-[420px] flex items-center justify-center px-6 py-12 overflow-hidden")}>
          {/* Background nav */}
          <button
            onClick={() => setBgIndex(Math.max(0, bgIndex - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 backdrop-blur flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setBgIndex(Math.min(backgrounds.length - 1, bgIndex + 1))}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 backdrop-blur flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Background label */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {backgrounds.map((b, i) => (
              <button key={b.label} onClick={() => setBgIndex(i)}
                className={cn("w-1.5 h-1.5 rounded-full transition-all", i === bgIndex ? "bg-white" : "bg-white/30")} />
            ))}
          </div>

          <div className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.1]">
              <h2 className="text-lg font-bold text-white mb-4">Meditation Session</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-[11px] text-white/60 uppercase tracking-wide mb-2">Duration</p>
                  <div className="flex flex-wrap gap-1.5">
                    {durations.map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDuration(d)}
                        className={cn("px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                          selectedDuration === d
                            ? "bg-[#03588C] text-white border-[#03588C]"
                            : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20")}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] text-white/60 uppercase tracking-wide mb-2">Ambient Sound</p>
                  <select
                    value={sound}
                    onChange={(e) => setSound(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    {ambientSounds.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] text-white/60 uppercase tracking-wide">Volume</p>
                    <Volume2 className="w-3.5 h-3.5 text-white/60" />
                  </div>
                  <input
                    type="range" min={0} max={100} value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full accent-[#03588C]"
                  />
                </div>

                <button
                  onClick={() => setPlaying(!playing)}
                  className={cn("w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                    playing ? "bg-white/20 text-white" : "bg-[#03588C] text-white shadow-glow-sm hover:shadow-glow-md hover:bg-[#024a77]")}
                >
                  {playing ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start</>}
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.1]">
              <div className="mb-4">
                <p className="text-[11px] text-white/60 uppercase tracking-wide mb-2">Today I Will</p>
                <textarea
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  placeholder="Set your trading intention for today..."
                  rows={3}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/40 resize-none focus:outline-none"
                />
              </div>

              <p className="text-[11px] text-white/60 uppercase tracking-wide mb-3">Your Progress</p>
              <div className="grid grid-cols-7 gap-1 mb-3">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={cn("w-6 h-6 rounded-full border flex items-center justify-center text-[9px]",
                      i === 3 ? "bg-[#03588C] border-[#03588C] text-white" : "border-white/20 text-white/40")}>
                      {i === 3 ? "●" : "○"}
                    </div>
                    <span className="text-[9px] text-white/40">{d}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs text-white/60">
                <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Minutes This Week: <span className="text-white font-semibold">0m</span></div>
                <div className="flex items-center gap-2"><Flame className="w-3.5 h-3.5 text-[#F59E0B]" /> Current Streak: <span className="text-white font-semibold">0 Days</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Mental Toolkit */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#F2F0EB]">Mental Toolkit</h2>
              <p className="text-sm text-[#6B7280] mt-0.5">A curated library of mental exercises to rewire your trading mind.</p>
            </div>
          </div>

          <div className="flex gap-1.5">
            {allCategories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c.split(" ")[0])}
                className={cn("px-4 py-2 rounded-xl text-xs font-medium border transition-all",
                  filter === c.split(" ")[0]
                    ? "bg-[#03588C] text-white border-[#03588C]"
                    : "glass text-[#6B7280] hover:text-[#F2F0EB]")}
              >
                {c}
              </button>
            ))}
          </div>

          {toolkit.filter((g) => filter === "All" || g.category === filter.toUpperCase()).map((group) => (
            <div key={group.category}>
              <h3 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest mb-3">{group.category}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {group.items.map((item) => (
                  <div
                    key={item.name}
                    className="glass rounded-2xl p-4 hover:-translate-y-0.5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", group.badge)}>{group.category}</div>
                      <button onClick={(e) => { e.stopPropagation(); toggleStar(item.name); }}>
                        <Star className={cn("w-4 h-4 transition-colors", starred[item.name] ? "text-[#D9CA82] fill-[#D9CA82]" : "text-[#6B7280]")} />
                      </button>
                    </div>
                    <h4 className="text-sm font-semibold text-[#F2F0EB] mb-1">{item.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#6B7280] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.duration}
                      </span>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full bg-[#03588C] flex items-center justify-center">
                        <Play className="w-3 h-3 text-white ml-0.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Quick Reset Tools */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-[#D9CA82]" />
              <h3 className="text-sm font-semibold text-[#F2F0EB]">Quick Reset Tools</h3>
              <span className="text-[11px] text-[#6B7280]">Under 2 minutes each</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {["60 Second Reboot", "Box Breathing", "Pattern Interrupt"].map((name) => (
                <button key={name} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#03588C]/10 border border-[#03588C]/20 hover:bg-[#03588C]/20 transition-all text-left">
                  <div className="w-8 h-8 rounded-full bg-[#03588C] flex items-center justify-center flex-shrink-0">
                    <Play className="w-3.5 h-3.5 text-white ml-0.5" />
                  </div>
                  <span className="text-sm font-medium text-[#F2F0EB]">{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
