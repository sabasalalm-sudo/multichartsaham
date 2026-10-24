// ==========================================
// 1. DATA HISTORI & TEKNIKAL (EOD & CHART)
// ==========================================
export interface Candle {
  time: string; // Format: 'YYYY-MM-DD'
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BowScoreResult {
  totalScore: number;       // 0 - 100
  squeezeScore: number;     // 0 - 35
  rsiScore: number;         // 0 - 35
  breakoutScore: number;    // 0 - 30
  suggestedEntry: number;
  suggestedSL: number;
  suggestedTP: number;
}

// ==========================================
// 2. MASTER SAHAM & INDEKS PASAR (UI WATCHLIST)
// ==========================================
export type TradeAction = 'BUY' | 'HOLD' | 'SELL';

export interface MarketIndex {
  symbol: string;           // 'IHSG', 'LQ45', 'IDX30'
  name: string;
  value: number;
  changePercent: number;
  changeNominal: number;
}

export interface Stock {
  id: string;
  symbol: string;           // 'BBCA.JK'
  ticker: string;           // 'BBCA'
  name: string;             // 'Bank Central Asia Tbk'
  sector?: string;
  is_syariah: boolean;
  index_tags: string[];     // ['LQ45', 'IDX30']
  is_liquid: boolean;
  is_active: boolean;
  last_bow_score: number;
  last_close: number;
  change_percent?: number;  // Contoh: +4.62%
  change_nominal?: number;  // Contoh: +405
  action?: TradeAction;     // 'BUY' | 'HOLD' | 'SELL'
  suggested_entry?: number;
  suggested_sl?: number;
  suggested_tp?: number;
  sparkline?: number[];     // Data ringkas mini-chart di kartu saham
}

// ==========================================
// 3. KALKULATOR LOT & MONEY MANAGEMENT
// ==========================================
export interface LotSizingParams {
  capital: number;
  riskPercent: number;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  buyFeePercent: number;
  sellFeePercent: number;
}

export interface LotSizingResult {
  lots: number;
  shares: number;
  grossAmount: number;
  buyFeeAmount: number;
  totalCashNeeded: number;
  maxRiskAmount: number;
  actualRiskAmount: number;
  riskRewardRatio: number;
  isValid: boolean;
  errorMessage?: string;
}

// ==========================================
// 4. SIMULASI TRADING & JURNAL TRANSAKSI
// ==========================================
export interface SimPosition {
  id: string;
  user_id: string;
  stock_id: string;
  ticker: string;
  name: string;
  lots: number;
  avg_buy_price: number;
  current_price?: number;
  target_sl?: number;
  target_tp?: number;
  unrealized_pnl?: number;
  unrealized_pnl_percent?: number;
  created_at: string;
}

export interface SimTransaction {
  id: string;
  user_id: string;
  stock_id?: string;
  ticker: string;
  name?: string;
  type: 'BUY' | 'SELL';
  price: number;
  lots: number;
  fee_amount: number;
  realized_pnl: number;
  style?: string;           // e.g. 'Swing', 'Scalping', 'BoW'
  notes?: string;
  created_at: string;
}

export interface DailySummary {
  totalProfit: number;
  winRate: number;
  totalTransactions: number;
}

export interface AssetAllocation {
  ticker: string;
  percentage: number;
  color?: string;
}

// ==========================================
// 5. PROFIL PENGGUNA
// ==========================================
export interface UserProfile {
  id: string;
  email: string;
  is_premium: boolean;
  premium_until?: string | null;
  default_capital: number;
  risk_percentage: number;
  buy_fee_percent: number;
  sell_fee_percent: number;
  virtual_balance: number;
}
