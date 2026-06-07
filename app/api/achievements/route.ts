import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
  category: "volume" | "performance" | "discipline" | "journaling";
  tier: "bronze" | "silver" | "gold" | "platinum";
  unlocked: boolean;
  progress: number;   // 0–1
  progressLabel: string;
}

interface Trade {
  pnl: number | null;
  closed_at: string;
  followed_plan: boolean | null;
  emotion: string | null;
  notes: string | null;
  grade: string | null;
  setup: string | null;
}

function longestWinStreak(trades: Trade[]): number {
  let best = 0, cur = 0;
  for (const t of trades) {
    if ((t.pnl ?? 0) > 0) { cur++; best = Math.max(best, cur); }
    else cur = 0;
  }
  return best;
}

function profitableMonths(trades: Trade[]): number {
  const months: Record<string, number> = {};
  for (const t of trades) {
    const key = t.closed_at.slice(0, 7);
    months[key] = (months[key] ?? 0) + (t.pnl ?? 0);
  }
  return Object.values(months).filter((v) => v > 0).length;
}

function bestSingleDay(trades: Trade[]): number {
  const days: Record<string, number> = {};
  for (const t of trades) {
    const key = t.closed_at.slice(0, 10);
    days[key] = (days[key] ?? 0) + (t.pnl ?? 0);
  }
  return Math.max(0, ...Object.values(days));
}

function hadBounceBack(trades: Trade[]): boolean {
  const days: Record<string, number> = {};
  for (const t of trades) {
    const key = t.closed_at.slice(0, 10);
    days[key] = (days[key] ?? 0) + (t.pnl ?? 0);
  }
  const sortedDays = Object.entries(days).sort(([a], [b]) => a.localeCompare(b));
  for (let i = 1; i < sortedDays.length; i++) {
    if (sortedDays[i - 1][1] < 0 && sortedDays[i][1] > 0) return true;
  }
  return false;
}

export async function GET() {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("trades")
    .select("pnl, closed_at, followed_plan, emotion, notes, grade, setup")
    .eq("user_id", user.id)
    .order("closed_at", { ascending: true });

  const trades: Trade[] = data ?? [];
  const total = trades.length;
  const wins = trades.filter((t) => (t.pnl ?? 0) > 0);
  const winRate = total >= 20 ? (wins.length / total) * 100 : 0;
  const winStreak = longestWinStreak(trades);
  const followedCount = trades.filter((t) => t.followed_plan).length;
  const emotionCount = trades.filter((t) => t.emotion).length;
  const notesCount = trades.filter((t) => t.notes && t.notes.trim()).length;
  const gradeACount = trades.filter((t) => t.grade === "A" || t.grade === "A+").length;
  const setupCount = new Set(trades.map((t) => t.setup).filter(Boolean)).size;
  const profMonths = profitableMonths(trades);
  const bestDay = bestSingleDay(trades);
  const bounceBack = hadBounceBack(trades);

  const def = (
    id: string, title: string, description: string, icon: string, xp: number,
    category: Achievement["category"], tier: Achievement["tier"],
    progress: number, goal: number, label: string
  ): Achievement => {
    const clamped = Math.min(progress / goal, 1);
    return {
      id, title, description, icon, xp, category, tier,
      unlocked: clamped >= 1,
      progress: clamped,
      progressLabel: clamped >= 1 ? "Unlocked" : label,
    };
  };

  const achievements: Achievement[] = [
    // VOLUME
    def("first_trade", "First Step", "Take your first trade", "🎯", 10, "volume", "bronze", total, 1, `0/1 trades`),
    def("ten_trades", "Getting Started", "Complete 10 trades", "📈", 25, "volume", "bronze", total, 10, `${total}/10 trades`),
    def("fifty_trades", "Building Habits", "Complete 50 trades", "🔥", 75, "volume", "silver", total, 50, `${total}/50 trades`),
    def("hundred_trades", "Consistent Trader", "Complete 100 trades", "💯", 150, "volume", "silver", total, 100, `${total}/100 trades`),
    def("twofifty_trades", "Trade Machine", "Complete 250 trades", "⚡", 300, "volume", "gold", total, 250, `${total}/250 trades`),
    def("fivehundred_trades", "500 Club", "Complete 500 trades", "👑", 500, "volume", "platinum", total, 500, `${total}/500 trades`),

    // PERFORMANCE
    def("first_win", "First Blood", "Win your first trade", "✅", 10, "performance", "bronze", wins.length, 1, `0/1 wins`),
    def("streak_3", "On A Roll", "Win 3 trades in a row", "🎰", 30, "performance", "bronze", winStreak, 3, `${winStreak}/3 streak`),
    def("streak_5", "Hot Streak", "Win 5 trades in a row", "🌊", 75, "performance", "silver", winStreak, 5, `${winStreak}/5 streak`),
    def("streak_10", "Win Machine", "Win 10 trades in a row", "🏆", 200, "performance", "gold", winStreak, 10, `${winStreak}/10 streak`),
    def("wr_50", "Half & Half", "Achieve 50%+ win rate over 20+ trades", "📊", 50, "performance", "bronze", total >= 20 ? winRate : 0, 50, total < 20 ? `Need ${20 - total} more trades` : `${winRate.toFixed(0)}%/50%`),
    def("wr_60", "Sharp Edge", "Achieve 60%+ win rate over 20+ trades", "🎯", 100, "performance", "silver", total >= 20 ? winRate : 0, 60, total < 20 ? `Need ${20 - total} more trades` : `${winRate.toFixed(0)}%/60%`),
    def("wr_70", "Elite Performer", "Achieve 70%+ win rate over 20+ trades", "⭐", 250, "performance", "gold", total >= 20 ? winRate : 0, 70, total < 20 ? `Need ${20 - total} more trades` : `${winRate.toFixed(0)}%/70%`),
    def("prof_month", "Monthly Green", "Finish a calendar month in profit", "🌱", 100, "performance", "silver", profMonths, 1, profMonths === 0 ? "Not yet" : `${profMonths} month${profMonths > 1 ? "s" : ""}`),
    def("three_prof_months", "Quarterly Consistent", "Finish 3 calendar months in profit", "📅", 300, "performance", "gold", profMonths, 3, `${profMonths}/3 months`),
    def("best_day_100", "Triple Digit Day", "Make $100+ in a single trading day", "💰", 50, "performance", "bronze", bestDay, 100, `$${bestDay.toFixed(0)}/$100`),
    def("best_day_1000", "Four Figures", "Make $1,000+ in a single trading day", "🤑", 200, "performance", "gold", bestDay, 1000, `$${bestDay.toFixed(0)}/$1,000`),

    // DISCIPLINE
    def("first_plan", "Rule Keeper", "Follow your trading plan once", "📋", 10, "discipline", "bronze", followedCount, 1, `0/1 trades`),
    def("plan_12", "Disciplined Dozen", "Follow your plan 12 times", "🛡️", 40, "discipline", "bronze", followedCount, 12, `${followedCount}/12 trades`),
    def("plan_50", "Iron Will", "Follow your plan 50 times", "⚓", 100, "discipline", "silver", followedCount, 50, `${followedCount}/50 trades`),
    def("plan_100", "Unbreakable", "Follow your plan 100 times", "💎", 250, "discipline", "gold", followedCount, 100, `${followedCount}/100 trades`),
    def("bounce_back", "Phoenix", "Be profitable after a losing day", "🦅", 75, "discipline", "silver", bounceBack ? 1 : 0, 1, bounceBack ? "Unlocked" : "Not yet"),
    def("setups_3", "Versatile", "Trade 3 different setups", "🎨", 50, "discipline", "bronze", setupCount, 3, `${setupCount}/3 setups`),
    def("setups_5", "Diverse Playbook", "Trade 5 different setups", "📚", 150, "discipline", "silver", setupCount, 5, `${setupCount}/5 setups`),

    // JOURNALING
    def("first_emotion", "Self Aware", "Log your emotion on a trade", "🧠", 10, "journaling", "bronze", emotionCount, 1, `0/1 trades`),
    def("emotion_25", "Mindful Trader", "Log emotions on 25 trades", "🔍", 50, "journaling", "silver", emotionCount, 25, `${emotionCount}/25 trades`),
    def("emotion_50", "Emotional Mastery", "Log emotions on 50 trades", "🎓", 100, "journaling", "gold", emotionCount, 50, `${emotionCount}/50 trades`),
    def("notes_10", "Note Taker", "Add notes to 10 trades", "📝", 30, "journaling", "bronze", notesCount, 10, `${notesCount}/10 trades`),
    def("notes_50", "Deep Analyst", "Add notes to 50 trades", "🔬", 100, "journaling", "gold", notesCount, 50, `${notesCount}/50 trades`),
    def("grade_a_10", "Grade A Student", "Grade 10 trades A or A+", "🏅", 75, "journaling", "silver", gradeACount, 10, `${gradeACount}/10 trades`),
  ];

  const unlockedXp = achievements.filter((a) => a.unlocked).reduce((s, a) => s + a.xp, 0);

  const levels = [
    { name: "Novice", min: 0 },
    { name: "Apprentice", min: 100 },
    { name: "Trader", min: 250 },
    { name: "Skilled", min: 500 },
    { name: "Expert", min: 1000 },
    { name: "Master", min: 2000 },
    { name: "Elite", min: 5000 },
  ];
  const levelIdx = levels.reduce((best, lvl, i) => unlockedXp >= lvl.min ? i : best, 0);
  const currentLevel = levels[levelIdx];
  const nextLevel = levels[levelIdx + 1] ?? null;
  const levelProgress = nextLevel
    ? (unlockedXp - currentLevel.min) / (nextLevel.min - currentLevel.min)
    : 1;

  return NextResponse.json({
    achievements,
    stats: {
      totalXp: unlockedXp,
      unlocked: achievements.filter((a) => a.unlocked).length,
      total: achievements.length,
      level: currentLevel.name,
      levelProgress,
      nextLevel: nextLevel?.name ?? null,
      nextLevelXp: nextLevel?.min ?? null,
    },
  });
}
