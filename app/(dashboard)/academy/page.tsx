"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { GraduationCap, Play, Lock, Check, Clock, Star, BookOpen, Brain, Shield, TrendingUp, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const paths = [
  { id: "foundations", label: "Foundations", description: "Start here", icon: BookOpen, color: "indigo" },
  { id: "psychology", label: "Psychology", description: "Mindset mastery", icon: Brain, color: "violet" },
  { id: "risk", label: "Risk & Size", description: "Capital protection", icon: Shield, color: "rose" },
  { id: "execution", label: "Execution", description: "Precision entries", icon: Zap, color: "amber" },
  { id: "advanced", label: "Advanced", description: "Elite strategies", icon: TrendingUp, color: "emerald" },
];

const courses = [
  {
    id: "1",
    path: "foundations",
    title: "Trading Psychology 101",
    description: "Understand why your emotions are your biggest trading risk — and how to rewire your response patterns.",
    icon: Brain,
    color: "indigo",
    lessons: 12,
    duration: "4.5h",
    level: "Beginner",
    progress: 100,
    completed: true,
    modules: ["The Emotional Trading Cycle", "Understanding Fear & Greed", "Building a Process-Based Mindset", "The Discipline Framework"],
  },
  {
    id: "2",
    path: "risk",
    title: "Risk Management Mastery",
    description: "Learn how professional traders define, size, and protect every trade with military-grade precision.",
    icon: Shield,
    color: "violet",
    lessons: 8,
    duration: "3h",
    level: "Beginner",
    progress: 75,
    completed: false,
    modules: ["Defining Your Risk Budget", "Position Sizing Formulas", "Stop Loss Placement Strategy", "Managing Drawdowns"],
  },
  {
    id: "3",
    path: "foundations",
    title: "Building a Winning Trading Plan",
    description: "Create a rules-based system that defines exactly when, how, and why you trade — before you ever hit the market.",
    icon: BookOpen,
    color: "cyan",
    lessons: 10,
    duration: "3.5h",
    level: "Beginner",
    progress: 40,
    completed: false,
    modules: ["Why Most Plans Fail", "The 7 Rules Every Plan Needs", "Setup Criteria & Grading", "Session Management"],
  },
  {
    id: "4",
    path: "execution",
    title: "Precision Trade Execution",
    description: "Master the art of flawless entry timing, scaling, and exits. Turn your plan into consistent action.",
    icon: Zap,
    color: "amber",
    lessons: 9,
    duration: "3h",
    level: "Intermediate",
    progress: 0,
    completed: false,
    locked: false,
    modules: ["Entry Timing Mastery", "Reading Order Flow", "Scaling In & Out", "Managing Open Trades"],
  },
  {
    id: "5",
    path: "psychology",
    title: "Elite Trading Psychology",
    description: "Advanced mindset work used by top-performing professional traders to maintain peak performance.",
    icon: Brain,
    color: "rose",
    lessons: 14,
    duration: "5h",
    level: "Advanced",
    progress: 0,
    completed: false,
    locked: true,
    modules: ["Peak Performance Routines", "Recovery After Drawdowns", "Confidence Without Arrogance", "Sustaining Discipline"],
  },
  {
    id: "6",
    path: "advanced",
    title: "Advanced Setups & Confluence",
    description: "High-probability setup library with deep-dive entries, exits, and market condition filters.",
    icon: TrendingUp,
    color: "emerald",
    lessons: 16,
    duration: "6.5h",
    level: "Advanced",
    progress: 0,
    completed: false,
    locked: true,
    modules: ["Multi-Timeframe Confluence", "Volume Profile Trading", "Liquidity Concepts", "Building Your Setup Library"],
  },
];

const levelBadge = {
  Beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Advanced: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export default function AcademyPage() {
  const [activePath, setActivePath] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const filtered = activePath === "all" ? courses : courses.filter((c) => c.path === activePath);
  const selected = courses.find((c) => c.id === selectedCourse);

  const totalProgress = Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length);

  return (
    <div className="flex flex-col flex-1">
      <Header title="Klartrade Academy" subtitle="Learn. Apply. Compound." />

      <main className="flex-1 p-6 space-y-6">

        {/* Progress overview */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-white">Your Learning Journey</h2>
                <p className="text-xs text-slate-500">{courses.filter(c => c.completed).length} of {courses.length} courses completed</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold font-display text-white">{totalProgress}%</p>
              <p className="text-xs text-slate-500">overall progress</p>
            </div>
          </div>
          <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${totalProgress}%` }}
            />
          </div>

          {/* Achievement chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { label: "Psychology Certified", earned: true },
              { label: "Risk Manager", earned: false },
              { label: "Execution Master", earned: false },
              { label: "Elite Trader", earned: false },
            ].map((badge) => (
              <div
                key={badge.label}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border",
                  badge.earned
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-white/[0.03] text-slate-600 border-white/[0.06]"
                )}
              >
                {badge.earned ? <Star className="w-3 h-3 fill-amber-400" /> : <Lock className="w-3 h-3" />}
                {badge.label}
              </div>
            ))}
          </div>
        </div>

        {/* Learning path filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActivePath("all")}
            className={cn("px-4 py-2 rounded-xl text-sm font-medium transition-all border", activePath === "all" ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" : "glass text-slate-500 hover:text-slate-300")}
          >
            All Courses
          </button>
          {paths.map((path) => (
            <button
              key={path.id}
              onClick={() => setActivePath(path.id)}
              className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border", activePath === path.id ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" : "glass text-slate-500 hover:text-slate-300")}
            >
              <path.icon className="w-3.5 h-3.5" />
              {path.label}
            </button>
          ))}
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((course) => (
            <div
              key={course.id}
              onClick={() => !course.locked && setSelectedCourse(course.id === selectedCourse ? null : course.id)}
              className={cn(
                "glass rounded-2xl p-5 transition-all duration-200 relative overflow-hidden",
                course.locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-white/[0.05] hover:-translate-y-0.5",
                selectedCourse === course.id ? "border-indigo-500/30 bg-indigo-500/[0.05]" : ""
              )}
            >
              {/* Lock overlay */}
              {course.locked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d0d1e] border border-white/[0.1] rounded-lg">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-400 font-medium">Requires Pro</span>
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${course.color}-500/15`}>
                  <course.icon className={`w-5 h-5 text-${course.color}-400`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", levelBadge[course.level as keyof typeof levelBadge])}>
                    {course.level}
                  </span>
                  {course.completed && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-[14px] font-semibold text-white mb-1.5">{course.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{course.description}</p>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3">
                <span className="flex items-center gap-1"><Play className="w-3 h-3" />{course.lessons} lessons</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
              </div>

              {course.progress > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Progress</span>
                    <span className={course.completed ? "text-emerald-400" : "text-indigo-400"}>{course.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", course.completed ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-500 to-violet-500")}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {course.progress === 0 && !course.locked && (
                <Button size="sm" className="w-full mt-2">
                  <Play className="w-3.5 h-3.5" />
                  Start Course
                </Button>
              )}

              {/* Expanded modules */}
              {selectedCourse === course.id && (
                <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2">
                  {course.modules.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                      <div className={cn("w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0", i < Math.floor(course.progress / 25) ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.05] text-slate-600")}>
                        {i < Math.floor(course.progress / 25) ? <Check className="w-2.5 h-2.5" /> : <span className="text-[9px]">{i + 1}</span>}
                      </div>
                      {m}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
