// File: src/components/calculator/LotCalculatorModal.tsx

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { StockCardData } from '../charts/StockCard';
import { calculateLotSizing } from '@/lib/trading/moneyManagement';
import { X, ArrowLeft, ShieldAlert, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';

interface LotCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: StockCardData | null;
}

export default function LotCalculatorModal({ isOpen, onClose, stock }: LotCalculatorModalProps) {
  const [activeTab, setActiveTab] = useState<'calculator' | 'risk'>('calculator');
  const [capital, setCapital] = useState<number>(50000000); // 50 Juta sesuai referensi
  const [riskPercent, setRiskPercent] = useState<number>(1.0); // 1.00%
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [stopLossPrice, setStopLossPrice] = useState<number>(0);
  const [takeProfitPrice, setTakeProfitPrice] = useState<number>(0);
  const [buyFeePercent] = useState<number>(0.15);
  const [sellFeePercent] = useState<number>(0.25);
  const [simSuccess, setSimSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (stock) {
      setEntryPrice(stock.suggestedEntry || stock.lastClose);
      setStopLossPrice(stock.suggestedSL);
      setTakeProfitPrice(stock.suggestedTP);
      setSimSuccess(false);
    }
  }, [stock]);

  // Kalkulasi Lot Sizing Real-Time
  const sizingResult = useMemo(() => {
    if (!stock || entryPrice <= 0 || stopLossPrice <= 0) return null;

    return calculateLotSizing({
      capital,
      riskPercent,
      entryPrice,
      stopLossPrice,
      takeProfitPrice,
      buyFeePercent,
      sellFeePercent
    });
  }, [stock, capital, riskPercent, entryPrice, stopLossPrice, takeProfitPrice, buyFeePercent, sellFeePercent]);

  if (!isOpen || !stock) return null;

  const handleSimulateBuy = () => {
    if (!sizingResult || !sizingResult.isValid) return;

    setSimSuccess(true);
    setTimeout(() => {
      setSimSuccess(false);
      onClose();
    }, 1800);
  };

  // Potensi Profit Nominal & Persen
  const potentialProfit = sizingResult && takeProfitPrice > entryPrice
    ? (takeProfitPrice - entryPrice) * (sizingResult.lots * 100)
    : 0;
  const potentialProfitPercent = sizingResult && entryPrice > 0
    ? (((takeProfitPrice - entryPrice) / entryPrice) * 100).toFixed(2)
    : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-brand-card border border-brand-border rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        
        {/* Header Modal Sesuai Referensi ("← Kalkulator Lot & Risk Management") */}
        <div className="p-4 border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-bold text-white">Kalkulator Lot & Risk Management</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Segmented: Lot Calculator | Risk Management */}
        <div className="px-4 pt-3">
          <div className="grid grid-cols-2 p-1 bg-brand-bg rounded-xl border border-brand-border text-xs font-bold">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`py-1.5 rounded-lg transition ${
                activeTab === 'calculator'
                  ? 'bg-brand-subtle text-white border border-brand-border shadow'
                  : 'text-slate-400'
              }`}
            >
              Lot Calculator
            </button>
            <button
              onClick={() => setActiveTab('risk')}
              className={`py-1.5 rounded-lg transition ${
                activeTab === 'risk'
                  ? 'bg-brand-subtle text-white border border-brand-border shadow'
                  : 'text-slate-400'
              }`}
            >
              Risk Management
            </button>
          </div>
        </div>

        {/* Alert Feedback Eksekusi Simulasi */}
        {simSuccess && (
          <div className="mx-4 mt-3 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Order simulasi {sizingResult?.lots} Lot {stock.ticker} berhasil dicatat!</span>
          </div>
        )}

        {/* Konten Form Parameter */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
          {/* Modal Input */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold text-[11px]">Modal</label>
            <div className="relative">
              <input
                type="number"
                value={capital}
                onChange={e => setCapital(Number(e.target.value))}
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">IDR</span>
            </div>
          </div>

          {/* Resiko per Transaksi (%) */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold text-[11px]">Risiko per Transaksi</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={riskPercent}
                onChange={e => setRiskPercent(Number(e.target.value))}
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">%</span>
            </div>
          </div>

          {/* Stop Loss (SL) & Take Profit (TP) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-rose-400 mb-1 font-semibold text-[11px]">Stop Loss (SL)</label>
              <input
                type="number"
                value={stopLossPrice}
                onChange={e => setStopLossPrice(Number(e.target.value))}
                className="w-full bg-brand-bg border border-rose-900/40 rounded-xl px-3 py-2 text-rose-300 font-bold focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-emerald-400 mb-1 font-semibold text-[11px]">Take Profit (TP)</label>
              <input
                type="number"
                value={takeProfitPrice}
                onChange={e => setTakeProfitPrice(Number(e.target.value))}
                className="w-full bg-brand-bg border border-emerald-900/40 rounded-xl px-3 py-2 text-emerald-300 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* BOX HASIL PERHITUNGAN */}
          {sizingResult && sizingResult.isValid ? (
            <div className="p-3.5 bg-brand-bg rounded-xl border border-brand-border space-y-2">
              <h4 className="text-[11px] font-bold text-slate-300">Hasil Perhitungan</h4>

              <div className="flex items-center justify-between pb-1.5 border-b border-brand-border">
                <span className="text-slate-400">Lot Maksimal</span>
                <span className="text-sm font-black text-emerald-400">{sizingResult.lots} lot</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Nilai Transaksi</span>
                <span className="font-semibold text-white text-[11px]">
                  Rp {sizingResult.grossAmount.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Potensi Risiko</span>
                <span className="font-semibold text-rose-400 text-[11px]">
                  Rp {sizingResult.actualRiskAmount.toLocaleString('id-ID')} ({riskPercent.toFixed(2)}%)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Potensi Profit</span>
                <span className="font-semibold text-emerald-400 text-[11px]">
                  Rp {potentialProfit.toLocaleString('id-ID')} ({potentialProfitPercent}%)
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl flex items-center gap-2 text-rose-400 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{sizingResult?.errorMessage || 'Sesuaikan kembali nilai SL & TP Anda.'}</span>
            </div>
          )}
        </div>

        {/* Footer Tombol Simpan */}
        <div className="p-4 border-t border-brand-border bg-brand-card">
          <button
            disabled={!sizingResult?.isValid || simSuccess}
            onClick={handleSimulateBuy}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-brand-subtle disabled:text-slate-500 text-slate-950 font-black text-xs shadow-glow-buy transition"
          >
            Simpan
          </button>
        </div>

      </div>
    </div>
  );
}
