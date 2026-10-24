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
