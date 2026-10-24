import { Candle, BowScoreResult } from '@/types/trading';

// 1. Kalkulasi RSI Standar Wilder (14 Periode)
export function calculateRSI(candles: Candle[], period = 14): number[] {
  if (candles.length <= period) return [];
  const rsi: number[] = [];
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  rsi.push(100 - (100 / (1 + (avgGain / (avgLoss === 0 ? 0.001 : avgLoss)))));

  for (let i = period + 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    const currentGain = diff >= 0 ? diff : 0;
    const currentLoss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    const rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss);
    rsi.push(100 - (100 / (1 + rs)));
  }

  return rsi;
}

// 2. Kalkulasi Bollinger Bandwidth (Periode 20, StdDev 2)
export function calculateBollingerBandwidth(candles: Candle[], period = 20, multiplier = 2): number[] {
  if (candles.length < period) return [];
  const bandwidths: number[] = [];

  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    const mean = slice.reduce((acc, c) => acc + c.close, 0) / period;
    const variance = slice.reduce((acc, c) => acc + Math.pow(c.close - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    const upper = mean + (multiplier * stdDev);
    const lower = mean - (multiplier * stdDev);
    const bandwidth = (upper - lower) / mean;
    bandwidths.push(bandwidth);
  }

  return bandwidths;
}

// 3. Algoritma Utama Scoring Buy on Weakness
export function calculateBowScore(candles: Candle[]): BowScoreResult {
  if (candles.length < 60) {
    return {
      totalScore: 0,
      squeezeScore: 0,
      rsiScore: 0,
      breakoutScore: 0,
      suggestedEntry: 0,
      suggestedSL: 0,
      suggestedTP: 0
    };
  }

  const lastCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2];

  // A. Evaluasi Squeeze Bollinger Band (Max 35 Poin)
  let squeezeScore = 0;
  const bandwidths = calculateBollingerBandwidth(candles);
  if (bandwidths.length >= 60) {
    const currentBW = bandwidths[bandwidths.length - 1];
    const past60BW = bandwidths.slice(-60);
    const sortedBW = [...past60BW].sort((a, b) => a - b);
    const percentile20 = sortedBW[Math.floor(sortedBW.length * 0.2)];

    if (currentBW <= percentile20) {
      squeezeScore = 35; // Squeeze sangat rapat
    } else if (currentBW <= sortedBW[Math.floor(sortedBW.length * 0.4)]) {
      squeezeScore = 20; // Mulai menyempit
    }
  }

  // B. Evaluasi RSI Reversal (Max 35 Poin)
  let rsiScore = 0;
  const rsiValues = calculateRSI(candles);
  if (rsiValues.length >= 2) {
    const currentRSI = rsiValues[rsiValues.length - 1];
    const prevRSI = rsiValues[rsiValues.length - 2];

    // Reversal melengkung naik dari area bawah (< 40)
    if (prevRSI < 40 && currentRSI > prevRSI) {
      rsiScore += 20;
    }
    // Golden cross menembus garis 30 atau 40 ke atas
    if (prevRSI <= 30 && currentRSI > 30) {
      rsiScore += 15;
    } else if (prevRSI <= 40 && currentRSI > 40) {
      rsiScore += 10;
    }
  }

  // C. Evaluasi Candle Pantulan & Breakout (Max 30 Poin)
  let breakoutScore = 0;
  const isGreen = lastCandle.close > lastCandle.open;
  const currentBody = Math.abs(lastCandle.close - lastCandle.open);

  // Rata-rata body 10 hari terakhir
  const avgBody = candles.slice(-11, -1).reduce((acc, c) => acc + Math.abs(c.close - c.open), 0) / 10;

  if (isGreen && currentBody > (1.2 * avgBody)) {
    breakoutScore += 15; // Candle hijau bertenaga
  }

  // Cari Swing Low 20 hari untuk Support & SL
  const past20Lows = candles.slice(-21, -1).map(c => c.low);
  const supportLevel = Math.min(...past20Lows);
  const past20Highs = candles.slice(-21, -1).map(c => c.high);
  const resistanceLevel = Math.max(...past20Highs);

  // Jika harga memantul dekat dengan support (selisih <= 3%)
  if (Math.abs(lastCandle.low - supportLevel) / supportLevel <= 0.03) {
    breakoutScore += 15;
  }

  // Perhitungan Level Entry, SL, dan Target TP
  const suggestedEntry = lastCandle.close;
  // SL diletakkan sedikit di bawah Support terdekat (Buffer 1-2 tik)
  const suggestedSL = Math.floor(supportLevel * 0.98);
  // Target TP terdekat di resistance 20 hari
  const suggestedTP = resistanceLevel > suggestedEntry ? resistanceLevel : Math.floor(suggestedEntry * 1.08);

  const totalScore = Math.min(100, squeezeScore + rsiScore + breakoutScore);

  return {
    totalScore,
    squeezeScore,
    rsiScore,
    breakoutScore,
    suggestedEntry,
    suggestedSL,
    suggestedTP
  };
}
