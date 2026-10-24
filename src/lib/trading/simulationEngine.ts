export interface SimBuyInput {
  currentBalance: number;
  price: number;
  lots: number;
  buyFeePercent: number;
}

export interface SimBuyOutput {
  success: boolean;
  newBalance: number;
  grossAmount: number;
  feeAmount: number;
  totalDeduction: number;
  error?: string;
}

export interface SimSellInput {
  currentBalance: number;
  avgBuyPrice: number;
  sellPrice: number;
  lots: number;
  sellFeePercent: number;
}

export interface SimSellOutput {
  success: boolean;
  newBalance: number;
  grossAmount: number;
  feeAmount: number;
  netCashReceived: number;
  realizedPnl: number;
  realizedPnlPercent: number;
}

// 1. Eksekusi Pembelian Simulasi
export function executeSimBuy(input: SimBuyInput): SimBuyOutput {
  const { currentBalance, price, lots, buyFeePercent } = input;
  const grossAmount = lots * 100 * price;
  const feeAmount = grossAmount * (buyFeePercent / 100);
  const totalDeduction = grossAmount + feeAmount;

  if (currentBalance < totalDeduction) {
    return {
      success: false,
      newBalance: currentBalance,
      grossAmount,
      feeAmount,
      totalDeduction,
      error: 'Saldo kas virtual tidak mencukupi!'
    };
  }

  return {
    success: true,
    newBalance: currentBalance - totalDeduction,
    grossAmount,
    feeAmount,
    totalDeduction
  };
}

// 2. Eksekusi Penjualan Simulasi
export function executeSimSell(input: SimSellInput): SimSellOutput {
  const { currentBalance, avgBuyPrice, sellPrice, lots, sellFeePercent } = input;
  const shares = lots * 100;
  
  const grossAmount = shares * sellPrice;
  const feeAmount = grossAmount * (sellFeePercent / 100);
  const netCashReceived = grossAmount - feeAmount;

  const originalCost = shares * avgBuyPrice;
  const realizedPnl = netCashReceived - originalCost;
  const realizedPnlPercent = Number(((realizedPnl / originalCost) * 100).toFixed(2));

  return {
    success: true,
    newBalance: currentBalance + netCashReceived,
    grossAmount,
    feeAmount,
    netCashReceived,
    realizedPnl,
    realizedPnlPercent
  };
}
