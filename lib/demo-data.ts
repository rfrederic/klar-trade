// All demo / hardcoded fake data — no Supabase calls needed

export type DemoTrade = {
  id: string;
  date: string;
  symbol: string;
  direction: "BUY" | "SELL";
  pnl: number;
  emotion: "Rattled" | "Clear" | "Charged";
  setup: string;
  followed_plan: boolean;
  outcome: "Win" | "Loss";
  notes: string;
};

function daysAgo(n: number): string {
  const d = new Date("2026-06-07");
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

export const DEMO_STATS = {
  balance: 12840,
  starting_balance: 10000,
  pnl: 2840,
  pnl_pct: 28.4,
  win_rate: 64,
  total_trades: 45,
  wins: 29,
  losses: 16,
  discipline: 78,
  avg_win: 148,
  avg_loss: 72,
  best_trade: 220,
  worst_trade: -85,
  refuge_streak: 7,
  refuge_sessions: 12,
};

export const DEMO_TRADES: DemoTrade[] = [
  { id:"t01", date:daysAgo(0),  symbol:"EURUSD", direction:"BUY",  pnl: 130, emotion:"Clear",   setup:"Trend Follow", followed_plan:true,  outcome:"Win",  notes:"Clean breakout above session high. Entered on London pullback and held to NY target." },
  { id:"t02", date:daysAgo(0),  symbol:"XAUUSD", direction:"SELL", pnl: -75, emotion:"Charged", setup:"Reversal",     followed_plan:true,  outcome:"Loss", notes:"Counter-trend on gold. Price held support stronger than expected." },
  { id:"t03", date:daysAgo(1),  symbol:"NAS100", direction:"BUY",  pnl: 195, emotion:"Clear",   setup:"Breakout",     followed_plan:true,  outcome:"Win",  notes:"Tech sector gap fill. Clean structure, held full target." },
  { id:"t04", date:daysAgo(1),  symbol:"GBPUSD", direction:"SELL", pnl:  85, emotion:"Clear",   setup:"Trend Follow", followed_plan:true,  outcome:"Win",  notes:"Following the daily downtrend on Cable. Entry at London open." },
  { id:"t05", date:daysAgo(2),  symbol:"US30",   direction:"BUY",  pnl: -50, emotion:"Rattled", setup:"Reversal",     followed_plan:false, outcome:"Loss", notes:"Entered too early at support. Should have waited for confirmation." },
  { id:"t06", date:daysAgo(2),  symbol:"EURUSD", direction:"SELL", pnl:  70, emotion:"Clear",   setup:"Range",        followed_plan:true,  outcome:"Win",  notes:"Range fade at resistance. Tight stop, 2R target hit cleanly." },
  { id:"t07", date:daysAgo(3),  symbol:"XAUUSD", direction:"BUY",  pnl: 160, emotion:"Charged", setup:"Breakout",     followed_plan:true,  outcome:"Win",  notes:"Gold breaking out of multi-day consolidation zone." },
  { id:"t08", date:daysAgo(3),  symbol:"NAS100", direction:"SELL", pnl: -85, emotion:"Rattled", setup:"Reversal",     followed_plan:false, outcome:"Loss", notes:"Revenge trade after prior loss. Broke my rules entirely." },
  { id:"t09", date:daysAgo(4),  symbol:"GBPUSD", direction:"BUY",  pnl: 110, emotion:"Clear",   setup:"Breakout",     followed_plan:true,  outcome:"Win",  notes:"GBP strength on positive data release. Breakout held all session." },
  { id:"t10", date:daysAgo(4),  symbol:"US30",   direction:"SELL", pnl: 145, emotion:"Clear",   setup:"Trend Follow", followed_plan:true,  outcome:"Win",  notes:"Following the daily bearish trend. Patient entry at premium." },
  { id:"t11", date:daysAgo(5),  symbol:"EURUSD", direction:"BUY",  pnl: -38, emotion:"Clear",   setup:"Reversal",     followed_plan:true,  outcome:"Loss", notes:"Valid setup, execution good. Market moved against at news." },
  { id:"t12", date:daysAgo(6),  symbol:"XAUUSD", direction:"BUY",  pnl: 220, emotion:"Clear",   setup:"Breakout",     followed_plan:true,  outcome:"Win",  notes:"Major structural breakout on gold. Held for extended target." },
  { id:"t13", date:daysAgo(6),  symbol:"NAS100", direction:"BUY",  pnl: 150, emotion:"Charged", setup:"Trend Follow", followed_plan:true,  outcome:"Win",  notes:"Tech momentum, held trend all morning session." },
  { id:"t14", date:daysAgo(7),  symbol:"GBPUSD", direction:"SELL", pnl: -65, emotion:"Rattled", setup:"Breakout",     followed_plan:true,  outcome:"Loss", notes:"False breakout. Setup was valid but no follow-through." },
  { id:"t15", date:daysAgo(7),  symbol:"US30",   direction:"BUY",  pnl: 100, emotion:"Clear",   setup:"Range",        followed_plan:true,  outcome:"Win",  notes:"Range trade on US30. Bought off session lows, clean move." },
  { id:"t16", date:daysAgo(8),  symbol:"EURUSD", direction:"SELL", pnl:  90, emotion:"Clear",   setup:"Trend Follow", followed_plan:true,  outcome:"Win",  notes:"EUR weakness in NY session after ECB commentary." },
  { id:"t17", date:daysAgo(8),  symbol:"XAUUSD", direction:"SELL", pnl: -60, emotion:"Charged", setup:"Reversal",     followed_plan:false, outcome:"Loss", notes:"Fighting the trend. Exited early to limit damage." },
  { id:"t18", date:daysAgo(9),  symbol:"NAS100", direction:"BUY",  pnl: 180, emotion:"Clear",   setup:"Breakout",     followed_plan:true,  outcome:"Win",  notes:"Strong momentum day. Gapped up and held all session." },
  { id:"t19", date:daysAgo(9),  symbol:"GBPUSD", direction:"BUY",  pnl: 120, emotion:"Clear",   setup:"Trend Follow", followed_plan:true,  outcome:"Win",  notes:"Followed my playbook exactly. Textbook entry and exit." },
  { id:"t20", date:daysAgo(10), symbol:"US30",   direction:"SELL", pnl: -42, emotion:"Rattled", setup:"Range",        followed_plan:false, outcome:"Loss", notes:"Entered on emotion after missing a prior move. Poor discipline." },
  { id:"t21", date:daysAgo(11), symbol:"EURUSD", direction:"BUY",  pnl: 165, emotion:"Clear",   setup:"Breakout",     followed_plan:true,  outcome:"Win",  notes:"EUR data surprise to upside. Break above key daily level." },
  { id:"t22", date:daysAgo(11), symbol:"XAUUSD", direction:"BUY",  pnl: 175, emotion:"Charged", setup:"Trend Follow", followed_plan:true,  outcome:"Win",  notes:"Gold trending higher all week. Good entry at H4 pullback." },
  { id:"t23", date:daysAgo(12), symbol:"NAS100", direction:"SELL", pnl: -70, emotion:"Clear",   setup:"Reversal",     followed_plan:true,  outcome:"Loss", notes:"Missed entry first attempt, second try didn't work either." },
  { id:"t24", date:daysAgo(13), symbol:"GBPUSD", direction:"SELL", pnl: 135, emotion:"Clear",   setup:"Breakout",     followed_plan:true,  outcome:"Win",  notes:"GBP breaking down through key support. Full extension held." },
  { id:"t25", date:daysAgo(13), symbol:"US30",   direction:"BUY",  pnl: 115, emotion:"Charged", setup:"Trend Follow", followed_plan:true,  outcome:"Win",  notes:"Dip buy on uptrend. Patience paid off." },
  { id:"t26", date:daysAgo(14), symbol:"EURUSD", direction:"SELL", pnl: -48, emotion:"Rattled", setup:"Reversal",     followed_plan:false, outcome:"Loss", notes:"Emotional after news spike. Should have stayed out." },
  { id:"t27", date:daysAgo(15), symbol:"XAUUSD", direction:"BUY",  pnl: 200, emotion:"Clear",   setup:"Breakout",     followed_plan:true,  outcome:"Win",  notes:"Overnight hold paid off. Clean break above $2,400." },
  { id:"t28", date:daysAgo(15), symbol:"NAS100", direction:"BUY",  pnl:  95, emotion:"Clear",   setup:"Range",        followed_plan:true,  outcome:"Win",  notes:"Range bounce held perfectly at intraday support." },
  { id:"t29", date:daysAgo(16), symbol:"GBPUSD", direction:"BUY",  pnl: -55, emotion:"Charged", setup:"Breakout",     followed_plan:true,  outcome:"Loss", notes:"Breakout failed. Price rejected at prior high." },
  { id:"t30", date:daysAgo(17), symbol:"US30",   direction:"SELL", pnl: 150, emotion:"Clear",   setup:"Trend Follow", followed_plan:true,  outcome:"Win",  notes:"Clean trending day on indices. Held from open to 14:00." },
  { id:"t31", date:daysAgo(17), symbol:"EURUSD", direction:"BUY",  pnl:  65, emotion:"Clear",   setup:"Range",        followed_plan:true,  outcome:"Win",  notes:"Quick range scalp. Fast and disciplined." },
  { id:"t32", date:daysAgo(18), symbol:"XAUUSD", direction:"SELL", pnl: -52, emotion:"Rattled", setup:"Reversal",     followed_plan:false, outcome:"Loss", notes:"Poor mental state. Should not have traded today." },
  { id:"t33", date:daysAgo(19), symbol:"NAS100", direction:"BUY",  pnl: 195, emotion:"Charged", setup:"Breakout",     followed_plan:true,  outcome:"Win",  notes:"AI sector rally. Held the full move from the open." },
  { id:"t34", date:daysAgo(19), symbol:"GBPUSD", direction:"SELL", pnl: 110, emotion:"Clear",   setup:"Trend Follow", followed_plan:true,  outcome:"Win",  notes:"Following the weekly downtrend on cable. Clean H4 entry." },
  { id:"t35", date:daysAgo(20), symbol:"US30",   direction:"BUY",  pnl: -58, emotion:"Clear",   setup:"Reversal",     followed_plan:true,  outcome:"Loss", notes:"Valid setup. Market structure shifted against me." },
  { id:"t36", date:daysAgo(21), symbol:"EURUSD", direction:"BUY",  pnl: 140, emotion:"Clear",   setup:"Breakout",     followed_plan:true,  outcome:"Win",  notes:"Break above monthly high. Clean momentum day." },
  { id:"t37", date:daysAgo(21), symbol:"XAUUSD", direction:"BUY",  pnl: 175, emotion:"Charged", setup:"Trend Follow", followed_plan:true,  outcome:"Win",  notes:"Gold on a major bull trend. Added on H4 pullback." },
  { id:"t38", date:daysAgo(22), symbol:"NAS100", direction:"SELL", pnl: -75, emotion:"Rattled", setup:"Reversal",     followed_plan:false, outcome:"Loss", notes:"Counter-trend on tech during strong bull market. Poor decision." },
  { id:"t39", date:daysAgo(23), symbol:"GBPUSD", direction:"BUY",  pnl: 100, emotion:"Clear",   setup:"Range",        followed_plan:true,  outcome:"Win",  notes:"GBP holding range support. Clean bounce trade." },
  { id:"t40", date:daysAgo(23), symbol:"US30",   direction:"BUY",  pnl: 140, emotion:"Clear",   setup:"Trend Follow", followed_plan:true,  outcome:"Win",  notes:"Bull trend continuation. Patient and disciplined entry." },
  { id:"t41", date:daysAgo(24), symbol:"EURUSD", direction:"SELL", pnl: -65, emotion:"Clear",   setup:"Range",        followed_plan:true,  outcome:"Loss", notes:"Range resistance test, weak follow-through from sellers." },
  { id:"t42", date:daysAgo(25), symbol:"XAUUSD", direction:"BUY",  pnl: 220, emotion:"Charged", setup:"Breakout",     followed_plan:true,  outcome:"Win",  notes:"Best trade of the month. Gold major breakout session." },
  { id:"t43", date:daysAgo(26), symbol:"NAS100", direction:"BUY",  pnl: 135, emotion:"Clear",   setup:"Trend Follow", followed_plan:true,  outcome:"Win",  notes:"Tech sector momentum. Trend is your friend." },
  { id:"t44", date:daysAgo(27), symbol:"GBPUSD", direction:"SELL", pnl:  85, emotion:"Clear",   setup:"Reversal",     followed_plan:true,  outcome:"Win",  notes:"Textbook reversal at weekly resistance zone." },
  { id:"t45", date:daysAgo(28), symbol:"US30",   direction:"BUY",  pnl: -45, emotion:"Charged", setup:"Breakout",     followed_plan:true,  outcome:"Loss", notes:"Early entry on breakout anticipation. Stopped before the move." },
];

// Equity curve — 30 data points, $10k → $12,840
export const DEMO_EQUITY = [
  { label: "May 8",  value: 10000 },
  { label: "May 9",  value: 10140 },
  { label: "May 10", value: 10055 },
  { label: "May 11", value: 10290 },
  { label: "May 12", value: 10195 },
  { label: "May 13", value: 10430 },
  { label: "May 14", value: 10350 },
  { label: "May 15", value: 10570 },
  { label: "May 16", value: 10690 },
  { label: "May 17", value: 10520 },
  { label: "May 18", value: 10760 },
  { label: "May 19", value: 10910 },
  { label: "May 20", value: 10790 },
  { label: "May 21", value: 11050 },
  { label: "May 22", value: 11170 },
  { label: "May 23", value: 11010 },
  { label: "May 24", value: 11260 },
  { label: "May 25", value: 11400 },
  { label: "May 26", value: 11280 },
  { label: "May 27", value: 11510 },
  { label: "May 28", value: 11650 },
  { label: "May 29", value: 11530 },
  { label: "May 30", value: 11760 },
  { label: "May 31", value: 11910 },
  { label: "Jun 1",  value: 11790 },
  { label: "Jun 2",  value: 12040 },
  { label: "Jun 3",  value: 11960 },
  { label: "Jun 4",  value: 12210 },
  { label: "Jun 5",  value: 12130 },
  { label: "Jun 6",  value: 12840 },
];

// Refuge sessions
export const DEMO_REFUGE = [
  { id:"r01", date:"Jun 7",  biome:"Ocean",    duration:8,  mood_before:"Charged", mood_after:"Clear" },
  { id:"r02", date:"Jun 6",  biome:"Forest",   duration:10, mood_before:"Rattled", mood_after:"Clear" },
  { id:"r03", date:"Jun 5",  biome:"Mountain", duration:7,  mood_before:"Clear",   mood_after:"Clear" },
  { id:"r04", date:"Jun 4",  biome:"Ocean",    duration:12, mood_before:"Charged", mood_after:"Calm"  },
  { id:"r05", date:"Jun 3",  biome:"Desert",   duration:8,  mood_before:"Rattled", mood_after:"Clear" },
  { id:"r06", date:"Jun 2",  biome:"Forest",   duration:9,  mood_before:"Clear",   mood_after:"Clear" },
  { id:"r07", date:"Jun 1",  biome:"Ocean",    duration:10, mood_before:"Charged", mood_after:"Clear" },
  { id:"r08", date:"May 28", biome:"Mountain", duration:7,  mood_before:"Rattled", mood_after:"Calm"  },
  { id:"r09", date:"May 25", biome:"Forest",   duration:8,  mood_before:"Clear",   mood_after:"Clear" },
  { id:"r10", date:"May 22", biome:"Ocean",    duration:11, mood_before:"Charged", mood_after:"Clear" },
  { id:"r11", date:"May 18", biome:"Desert",   duration:9,  mood_before:"Rattled", mood_after:"Calm"  },
  { id:"r12", date:"May 15", biome:"Forest",   duration:8,  mood_before:"Clear",   mood_after:"Clear" },
];

// Pre-computed analytics
export const DEMO_ANALYTICS = {
  by_setup: [
    { name: "Trend Follow", trades: 14, wins: 11, pnl:  1180, win_rate: 79 },
    { name: "Breakout",     trades: 14, wins: 10, pnl:   990, win_rate: 71 },
    { name: "Range",        trades:  9, wins:  6, pnl:   345, win_rate: 67 },
    { name: "Reversal",     trades:  8, wins:  2, pnl:  -392, win_rate: 25 },
  ],
  by_symbol: [
    { symbol: "EURUSD", trades: 10, win_rate: 60, pnl:  549 },
    { symbol: "XAUUSD", trades: 10, win_rate: 60, pnl: 1063 },
    { symbol: "GBPUSD", trades:  9, win_rate: 67, pnl:  625 },
    { symbol: "US30",   trades:  9, win_rate: 67, pnl:  598 },
    { symbol: "NAS100", trades:  7, win_rate: 57, pnl:   320 },
  ],
  by_emotion: [
    { emotion: "Clear",   trades: 25, avg_pnl:  88, win_rate: 72 },
    { emotion: "Charged", trades: 13, avg_pnl:  42, win_rate: 62 },
    { emotion: "Rattled", trades:  7, avg_pnl: -58, win_rate: 14 },
  ],
  daily_pnl: [
    { label: "May 8",  pnl:  140 },
    { label: "May 9",  pnl:  -75 },
    { label: "May 10", pnl:  280 },
    { label: "May 11", pnl: -120 },
    { label: "May 12", pnl:  215 },
    { label: "May 13", pnl:  165 },
    { label: "May 14", pnl:  -55 },
    { label: "May 15", pnl:  330 },
    { label: "May 16", pnl:  -90 },
    { label: "May 17", pnl:  195 },
    { label: "May 18", pnl:  245 },
    { label: "May 19", pnl: -110 },
    { label: "May 20", pnl:  310 },
    { label: "May 21", pnl:  175 },
    { label: "May 22", pnl:  -65 },
  ],
};

export const DEMO_JOURNAL_NOTES: Record<string, string> = {
  [daysAgo(0)]:  "Strong session. Stayed patient and followed the plan. Two trades: one winner, one loser. Net positive. Mental state was clear throughout.",
  [daysAgo(1)]:  "Good execution on NAS breakout. GBPUSD trend follow was textbook. Feeling confident but not overconfident.",
  [daysAgo(2)]:  "One bad trade (US30 reversal, broke rules). Need to review my triggers for entering early. EUR range worked well.",
  [daysAgo(3)]:  "Gold breakout day was excellent. NAS revenge trade was a mistake — logged and reviewed. Must reset tomorrow.",
  [daysAgo(4)]:  "Disciplined day. Both trades followed the plan. GBP and US30 both worked. Feeling good about process.",
  [daysAgo(5)]:  "One loss on EUR reversal — was a valid setup, just didn't work. No regrets. Accepted the loss and moved on.",
  [daysAgo(6)]:  "Two winners today. XAU breakout was the trade of the week so far. NAS trend follow was clean.",
  [daysAgo(7)]:  "Mixed day. GBP false breakout was frustrating. US30 range trade made up for it. Need to review breakout entries.",
};
