import { LotSizingParams, LotSizingResult } from '@/types/trading';

export function calculateLotSizing(params: LotSizingParams): LotSizingResult {
  const { capital, riskPercent, entryPrice, stopLossPrice, takeProfitPrice, buyFeePercent, sellFeePercent } = params;

  if (entryPrice <= stopLossPrice) {
    return {
      lots: 0,
      shares: 0,
      grossAmount: 0,
      buyFeeAmount: 0,
      totalCashNeeded: 0,
      maxRiskAmount: 0,
      actualRiskAmount: 0,
      riskRewardRatio: 0,
      isValid: false,
      errorMessage: 'Harga Stop Loss harus lebih rendah dari Harga Entry!'
    };
  }

  // 1. Resiko maksimal dalam Rupiah
  const maxRiskAmount = capital * (riskPercent / 100);

  // 2. Selisih harga per lembar
  const netRiskPerShare = entryPrice - stopLossPrice;

  // 3. Penyesuaian dengan Broker Fee (Beli + Jual)
  const totalFeeRate = (buyFeePercent + sellFeePercent) / 100;
  const feePerShare = entryPrice * totalFeeRate;
  const adjustedRiskPerShare = netRiskPerShare + feePerShare;

  // 4. Hitung Lembar & Lot
  const sharesAllowed = Math.floor(maxRiskAmount / adjustedRiskPerShare);
  let lots = Math.floor(sharesAllowed / 100);

  // 5. Cek ketersediaan modal tunai
  let grossAmount = lots * 100 * entryPrice;
  let buyFeeAmount = grossAmount * (buyFeePercent / 100);
  let totalCashNeeded = grossAmount + buyFeeAmount;

  // Jika modal tunai tidak cukup, turunkan jumlah lot
  while (totalCashNeeded > capital && lots > 0) {
    lots -= 1;
    grossAmount = lots * 100 * entryPrice;
    buyFeeAmount = grossAmount * (buyFeePercent / 100);
    totalCashNeeded = grossAmount + buyFeeAmount;
  }

  const shares = lots * 100;
  const actualRiskAmount = (shares * netRiskPerShare) + (grossAmount * totalFeeRate);

  // 6. Hitung Risk to Reward Ratio (RRR)
  const potentialProfitPerShare = takeProfitPrice - entryPrice;
  const riskRewardRatio = netRiskPerShare > 0 ? Number((potentialProfitPerShare / netRiskPerShare).toFixed(2)) : 0;

  return {
    lots,
    shares,
    grossAmount,
    buyFeeAmount,
    totalCashNeeded,
    maxRiskAmount,
    actualRiskAmount,
    riskRewardRatio,
    isValid: lots > 0,
    errorMessage: lots === 0 ? 'Modal tidak mencukupi untuk toleransi resiko ini.' : undefined
  };
}
