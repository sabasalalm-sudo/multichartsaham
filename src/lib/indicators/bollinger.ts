import { Candle } from '@/types/trading';

export interface BollingerLinePoint {
  time: string;
  value: number;
}

export interface BollingerBandsResult {
  upper: BollingerLinePoint[];
  middle: BollingerLinePoint[];
  lower: BollingerLinePoint[];
}

export function calculateBollingerBands(candles: Candle[], period = 20, multiplier = 2): BollingerBandsResult {
  const upper: BollingerLinePoint[] = [];
  const middle: BollingerLinePoint[] = [];
  const lower: BollingerLinePoint[] = [];

  if (candles.length < period) return { upper, middle, lower };

  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    const mean = slice.reduce((acc, c) => acc + c.close, 0) / period;
    const variance = slice.reduce((acc, c) => acc + Math.pow(c.close - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    const time = candles[i].time;
    middle.push({ time, value: Number(mean.toFixed(2)) });
    upper.push({ time, value: Number((mean + multiplier * stdDev).toFixed(2)) });
    lower.push({ time, value: Number((mean - multiplier * stdDev).toFixed(2)) });
  }

  return { upper, middle, lower };
}
