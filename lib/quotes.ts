export interface Quote {
  id: string;
  text: string;
  author: string;
  category: QuoteCategory;
  context?: QuoteContext[];
}

export type QuoteCategory =
  | "discipline"
  | "patience"
  | "emotional"
  | "consistency"
  | "risk"
  | "confidence"
  | "recovery"
  | "focus"
  | "execution"
  | "mindset";

export type QuoteContext =
  | "login"
  | "win"
  | "loss"
  | "rule_break"
  | "session_open"
  | "session_close"
  | "streak"
  | "milestone"
  | "general";

export const quotes: Quote[] = [
  // ── DISCIPLINE ──────────────────────────────────────────────────────
  { id: "d1", text: "The market rewards discipline, not emotion.", author: "Unknown", category: "discipline" },
  { id: "d2", text: "Your edge is not your strategy. It's your ability to follow it.", author: "Unknown", category: "discipline" },
  { id: "d3", text: "Discipline is doing what needs to be done, even when you don't feel like it.", author: "Unknown", category: "discipline" },
  { id: "d4", text: "The hardest trade to execute is the one your plan says to take, but your emotions say to skip.", author: "Unknown", category: "discipline" },
  { id: "d5", text: "Your rules exist to protect you from the worst version of yourself.", author: "Unknown", category: "discipline" },
  { id: "d6", text: "Trade your plan. Review your plan. Improve your plan. Repeat.", author: "Unknown", category: "discipline" },
  { id: "d7", text: "A disciplined mind sees opportunity where emotional minds see chaos.", author: "Unknown", category: "discipline" },
  { id: "d8", text: "The trader who follows their rules on bad days is the trader who compounds on good ones.", author: "Unknown", category: "discipline" },
  { id: "d9", text: "Structure is not a cage. It is the architecture of elite performance.", author: "Unknown", category: "discipline" },
  { id: "d10", text: "Do not negotiate with your rules mid-trade. That negotiation always ends the same way.", author: "Unknown", category: "discipline" },
  { id: "d11", text: "Discipline is the bridge between your trading plan and your trading results.", author: "Unknown", category: "discipline" },
  { id: "d12", text: "The moment you think 'just this once,' your edge begins to erode.", author: "Unknown", category: "discipline" },

  // ── PATIENCE ────────────────────────────────────────────────────────
  { id: "p1", text: "Patience is not waiting. It is the wisdom to know when not to act.", author: "Unknown", category: "patience" },
  { id: "p2", text: "The best trade is often the one you did not take.", author: "Jesse Livermore", category: "patience" },
  { id: "p3", text: "Sit on your hands until the market shows you exactly what you need.", author: "Unknown", category: "patience" },
  { id: "p4", text: "Opportunities come to those who wait. Losses come to those who rush.", author: "Unknown", category: "patience" },
  { id: "p5", text: "The market is open 252 days a year. One missed setup is not a tragedy.", author: "Unknown", category: "patience" },
  { id: "p6", text: "Waiting for the A+ setup is not a sign of weakness. It is the definition of precision.", author: "Unknown", category: "patience" },
  { id: "p7", text: "Boredom in trading is a feature, not a bug. Use it well.", author: "Unknown", category: "patience" },
  { id: "p8", text: "The market will always give you another chance. Your capital may not.", author: "Unknown", category: "patience" },
  { id: "p9", text: "Speed to exit bad trades. Patience to wait for good ones.", author: "Unknown", category: "patience" },
  { id: "p10", text: "The highest-probability trade is the one you've waited the longest for.", author: "Unknown", category: "patience" },

  // ── EMOTIONAL CONTROL ────────────────────────────────────────────────
  { id: "e1", text: "The goal is not to predict the market. It is to manage your reaction to it.", author: "Unknown", category: "emotional" },
  { id: "e2", text: "When emotions run high, your edge runs low.", author: "Unknown", category: "emotional" },
  { id: "e3", text: "Fear and greed are the market's oldest tricks. Do not fall for either.", author: "Unknown", category: "emotional" },
  { id: "e4", text: "You cannot control the market. You can only control yourself.", author: "Unknown", category: "emotional" },
  { id: "e5", text: "Emotional detachment is not indifference. It is clarity.", author: "Unknown", category: "emotional" },
  { id: "e6", text: "The trade that feels most uncomfortable is often the correct one.", author: "Unknown", category: "emotional" },
  { id: "e7", text: "Your feelings are data points — not instructions.", author: "Unknown", category: "emotional" },
  { id: "e8", text: "React less. Respond more. There is a critical difference.", author: "Unknown", category: "emotional" },
  { id: "e9", text: "Anxiety before a trade is normal. Acting on that anxiety is costly.", author: "Unknown", category: "emotional" },
  { id: "e10", text: "A calm mind is your most powerful trading tool. Protect it.", author: "Unknown", category: "emotional" },
  { id: "e11", text: "The market feeds on emotional traders. Starve it.", author: "Unknown", category: "emotional" },

  // ── CONSISTENCY ──────────────────────────────────────────────────────
  { id: "c1", text: "Consistency beats intensity. Small edges compounded become empires.", author: "Unknown", category: "consistency" },
  { id: "c2", text: "One bad trade doesn't make you a bad trader. A pattern of bad trades does.", author: "Unknown", category: "consistency" },
  { id: "c3", text: "The most powerful trading edge is showing up the same way every single day.", author: "Unknown", category: "consistency" },
  { id: "c4", text: "Elite traders are boring. They do the same thing correctly, again and again.", author: "Unknown", category: "consistency" },
  { id: "c5", text: "Your week is made of individual decisions. Make each one count.", author: "Unknown", category: "consistency" },
  { id: "c6", text: "Good process, consistently applied, is the only path to sustainable results.", author: "Unknown", category: "consistency" },
  { id: "c7", text: "A 65% win rate executed consistently beats a 90% win rate executed randomly.", author: "Unknown", category: "consistency" },
  { id: "c8", text: "Professionalism is not about big wins. It is about small habits done reliably.", author: "Unknown", category: "consistency" },
  { id: "c9", text: "Your edge is only as good as your consistency in applying it.", author: "Unknown", category: "consistency" },

  // ── RISK MANAGEMENT ──────────────────────────────────────────────────
  { id: "r1", text: "The first rule: never lose more than you planned to. The second: never forget the first.", author: "Unknown", category: "risk" },
  { id: "r2", text: "Protect your capital. Opportunities never stop coming.", author: "Unknown", category: "risk" },
  { id: "r3", text: "Professional traders manage risk first. Everything else is secondary.", author: "Unknown", category: "risk" },
  { id: "r4", text: "A 50% loss requires a 100% gain to recover. Protect your downside obsessively.", author: "Unknown", category: "risk" },
  { id: "r5", text: "Sizing too large is not confidence. It is ego dressed as conviction.", author: "Unknown", category: "risk" },
  { id: "r6", text: "You survive losing streaks through discipline on position size, not prayer.", author: "Unknown", category: "risk" },
  { id: "r7", text: "The stop loss is your respect for uncertainty — not an admission of failure.", author: "Unknown", category: "risk" },
  { id: "r8", text: "Lose small. Learn fast. Win large. This is the sequence.", author: "Unknown", category: "risk" },
  { id: "r9", text: "Your max loss per day is a hard limit, not a suggestion.", author: "Unknown", category: "risk" },
  { id: "r10", text: "Capital preserved today is opportunity compounded tomorrow.", author: "Unknown", category: "risk" },

  // ── CONFIDENCE ───────────────────────────────────────────────────────
  { id: "cf1", text: "Confidence in trading comes from a process, not from outcomes.", author: "Unknown", category: "confidence" },
  { id: "cf2", text: "Trust your edge. It was built with data, not feelings.", author: "Unknown", category: "confidence" },
  { id: "cf3", text: "You don't need to win every trade. You need to execute your plan every trade.", author: "Unknown", category: "confidence" },
  { id: "cf4", text: "The market does not know you. Only you know your edge.", author: "Unknown", category: "confidence" },
  { id: "cf5", text: "Real trading confidence is quiet. It does not need to shout.", author: "Unknown", category: "confidence" },
  { id: "cf6", text: "Doubt your emotions. Trust your backtested system.", author: "Unknown", category: "confidence" },
  { id: "cf7", text: "You have survived every losing streak so far. Your preparation will carry you through this one too.", author: "Unknown", category: "confidence" },

  // ── RECOVERY ─────────────────────────────────────────────────────────
  { id: "rv1", text: "A loss is tuition. Make sure you got the lesson.", author: "Unknown", category: "recovery", context: ["loss"] },
  { id: "rv2", text: "Every elite trader has a story of their worst loss. And they are still here.", author: "Unknown", category: "recovery", context: ["loss"] },
  { id: "rv3", text: "The comeback begins with a single disciplined trade.", author: "Unknown", category: "recovery", context: ["loss"] },
  { id: "rv4", text: "Walk away before you dig deeper. The market will be here tomorrow.", author: "Unknown", category: "recovery", context: ["rule_break", "loss"] },
  { id: "rv5", text: "Revenge trading has never made anyone money. Not once.", author: "Unknown", category: "recovery", context: ["loss", "rule_break"] },
  { id: "rv6", text: "A bad session does not define your career. Your response to it does.", author: "Unknown", category: "recovery", context: ["loss"] },
  { id: "rv7", text: "Close the platform. Clear your head. Come back tomorrow with a clean slate.", author: "Unknown", category: "recovery", context: ["loss", "rule_break"] },
  { id: "rv8", text: "The best thing you can do after a loss is to execute your next trade perfectly.", author: "Unknown", category: "recovery", context: ["loss"] },

  // ── FOCUS ────────────────────────────────────────────────────────────
  { id: "f1", text: "Focus on the process. The profits will follow.", author: "Unknown", category: "focus" },
  { id: "f2", text: "One A+ setup executed perfectly is worth ten B setups forced.", author: "Unknown", category: "focus" },
  { id: "f3", text: "Your job today is not to make money. It is to execute your plan.", author: "Unknown", category: "focus", context: ["session_open"] },
  { id: "f4", text: "Remove distractions. The market demands full presence.", author: "Unknown", category: "focus" },
  { id: "f5", text: "Before you enter, know exactly why. Before you exit, know exactly why.", author: "Unknown", category: "focus" },
  { id: "f6", text: "Narrow your focus. Master one setup before chasing ten.", author: "Unknown", category: "focus" },
  { id: "f7", text: "Presence is the premium traders pay for performance.", author: "Unknown", category: "focus" },
  { id: "f8", text: "Trade with your full attention or do not trade at all.", author: "Unknown", category: "focus" },

  // ── EXECUTION ────────────────────────────────────────────────────────
  { id: "ex1", text: "Your job is execution, not prediction.", author: "Unknown", category: "execution" },
  { id: "ex2", text: "A perfect entry means nothing without a disciplined exit.", author: "Unknown", category: "execution" },
  { id: "ex3", text: "Speed in execution. Patience in waiting. This is the professional's edge.", author: "Unknown", category: "execution" },
  { id: "ex4", text: "Know your entry. Know your stop. Know your target. Enter — then let the trade work.", author: "Unknown", category: "execution" },
  { id: "ex5", text: "Hesitation at the trigger is the price of self-doubt. Remove it.", author: "Unknown", category: "execution" },
  { id: "ex6", text: "Execution quality is a skill. Practice it on every single trade.", author: "Unknown", category: "execution" },

  // ── LONG-TERM MINDSET ────────────────────────────────────────────────
  { id: "m1", text: "This is a marathon, not a sprint. Act accordingly.", author: "Unknown", category: "mindset" },
  { id: "m2", text: "Think in sample sizes, not in individual trades.", author: "Unknown", category: "mindset" },
  { id: "m3", text: "The compounding of good decisions is the most powerful force in trading.", author: "Unknown", category: "mindset" },
  { id: "m4", text: "Millionaire traders are built in boring, consistent weeks. Not in one lucky day.", author: "Unknown", category: "mindset" },
  { id: "m5", text: "You are building a career. Every trade is a brick in that foundation.", author: "Unknown", category: "mindset" },
  { id: "m6", text: "Trade for the trader you want to be in five years, not the profit you want today.", author: "Unknown", category: "mindset" },
  { id: "m7", text: "The market humbles everyone eventually. Stay humble before it does.", author: "Unknown", category: "mindset" },
  { id: "m8", text: "Longevity in trading is the ultimate performance metric.", author: "Unknown", category: "mindset" },
  { id: "m9", text: "Short-term pain from following rules creates long-term freedom from losses.", author: "Unknown", category: "mindset" },
];

const categoryContextMap: Record<QuoteContext, QuoteCategory[]> = {
  login: ["discipline", "focus", "mindset"],
  win: ["consistency", "mindset", "confidence"],
  loss: ["recovery", "risk", "emotional"],
  rule_break: ["discipline", "recovery", "emotional"],
  session_open: ["focus", "execution", "discipline"],
  session_close: ["consistency", "mindset", "recovery"],
  streak: ["consistency", "confidence", "mindset"],
  milestone: ["mindset", "confidence", "consistency"],
  general: ["discipline", "patience", "focus"],
};

export function getRandomQuote(category?: QuoteCategory): Quote {
  const pool = category ? quotes.filter((q) => q.category === category) : quotes;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getContextualQuote(context: QuoteContext): Quote {
  const categories = categoryContextMap[context];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const pool = quotes.filter(
    (q) => q.category === category && (!q.context || q.context.includes(context))
  );
  const fallback = quotes.filter((q) => q.category === category);
  const final = pool.length > 0 ? pool : fallback;
  return final[Math.floor(Math.random() * final.length)];
}

export const categoryMeta: Record<QuoteCategory, { label: string; color: string; bg: string }> = {
  discipline: { label: "Discipline", color: "text-indigo-400", bg: "bg-indigo-500/15" },
  patience: { label: "Patience", color: "text-violet-400", bg: "bg-violet-500/15" },
  emotional: { label: "Emotional Control", color: "text-cyan-400", bg: "bg-cyan-500/15" },
  consistency: { label: "Consistency", color: "text-emerald-400", bg: "bg-emerald-500/15" },
  risk: { label: "Risk", color: "text-amber-400", bg: "bg-amber-500/15" },
  confidence: { label: "Confidence", color: "text-blue-400", bg: "bg-blue-500/15" },
  recovery: { label: "Recovery", color: "text-rose-400", bg: "bg-rose-500/15" },
  focus: { label: "Focus", color: "text-teal-400", bg: "bg-teal-500/15" },
  execution: { label: "Execution", color: "text-purple-400", bg: "bg-purple-500/15" },
  mindset: { label: "Mindset", color: "text-slate-300", bg: "bg-slate-500/15" },
};
