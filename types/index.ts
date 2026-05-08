export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  type: "long" | "short";
  entryPrice: number;
  exitPrice: number | null;
  size: number;
  pnl: number | null;
  pnlPercent: number | null;
  status: "open" | "closed" | "cancelled";
  entryTime: string;
  exitTime: string | null;
  setup: string;
  notes: string;
  ruleFollowed: boolean;
  emotionalState: "calm" | "anxious" | "confident" | "fearful" | "greedy";
  disciplineScore: number;
  tags: string[];
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  summary: string;
  tradeIds: string[];
  mood: "excellent" | "good" | "neutral" | "bad" | "terrible";
  lessons: string;
  disciplineScore: number;
  emotionalInsights: string;
}

export interface TradingPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  rules: string[];
  riskPerTrade: number;
  maxDailyLoss: number;
  maxDrawdown: number;
  setupTypes: string[];
  sessionTimes: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  totalPnl: number;
  disciplineScore: number;
  longestWinStreak: number;
  longestLossStreak: number;
  ruleAdherence: number;
}

export interface AIInsight {
  id: string;
  type: "warning" | "success" | "suggestion" | "analysis";
  title: string;
  description: string;
  timestamp: string;
  action?: string;
}

export interface EconomicEvent {
  id: string;
  date: string;
  time: string;
  currency: string;
  event: string;
  impact: "low" | "medium" | "high";
  forecast: string | null;
  previous: string | null;
  actual: string | null;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: { monthly: number; yearly: number };
  features: string[];
  highlighted: boolean;
  badge?: string;
}
