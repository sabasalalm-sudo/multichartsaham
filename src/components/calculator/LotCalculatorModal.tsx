'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { StockCardData } from '../charts/StockCard';
import { calculateLotSizing } from '@/lib/trading/moneyManagement';
import { X, ShieldAlert, CheckCircle2, TrendingUp, DollarSign, Play } from 'lucide-react';

interface LotCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: StockCardData | null;
}

export default function LotCalculatorModal({ isOpen, onClose, stock }: LotCalculatorModalProps) {
  // State Input Form
  const [capital, setCapital] = useState<number>(100000000); // Default 100jt
  const [riskPercent, setRiskPercent] = useState<number>(1.0); // 1%
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [stopLossPrice, setStopLossPrice] = useState<number>(0);
  const [takeProfitPrice, setTakeProfitPrice] = useState<number>(0);
  const [buyFeePercent] = useState<number>(0.15); // 0.15% fee beli
  const [sellFeePercent] = useState<number>(0.25); // 0.25% fee jual
  const [simSuccess, setSimSuccess] = useState<boolean>(false);

  // Inisialisasi data saat modal dibuka
  useEffect(() => {
    if (stock) {
      setEntryPrice(stock.suggestedEntry);
      setStopLossPrice(stock.suggestedSL);
      setTakeProfitPrice(stock.suggestedTP);
      setSimSuccess(false);
    }
  }, [stock]);

  // Kalkulasi Real-Time menggunakan modul matematika dari Sesi 2
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

    // Logika simulasi pembelian berhasil
    setSimSuccess(true);
    setTimeout(() => {
      setSimSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 transition-opacity">
      {/* Container: Bottom Sheet di Mobile, Modal Center di Desktop */}
      <div className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        
        {/* Header Modal */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{stock.ticker}</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Skor BoW: {stock.bowScore}
              </span>
            </div>
            <p className="text-xs text-slate-400">Kalkulator Lot & Eksekusi Simulasi</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifikasi Sukses Eksekusi Simulasi */}
        {simSuccess && (
          <div className="p-3 bg-emerald-950 border-b border-emerald-800 flex items-center gap-2 text-emerald-300 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Berhasil! Pembelian simulasi {sizingResult?.lots} Lot {stock.ticker} tercatat di portofolio.</span>
          </div>
        )}

        {/* Konten Scrollable */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs md:text-sm">
          {/* 1. Pengaturan Modal & Resiko */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 text-xs">Total Modal Anda (Rp)</label>
              <input
                type="number"
                value={capital}
                onChange={e => setCapital(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 text-xs">Toleransi Resiko (%)</label>
              <input
                type="number"
                step="0.1"
                value={riskPercent}
                onChange={e => setRiskPercent(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 2. Parameter Harga (Entry, SL, TP) */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-400 mb-1 text-xs">Harga Entry</label>
              <input
                type="number"
                value={entryPrice}
                onChange={e => setEntryPrice(Number(e.target.value))}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-rose-400 mb-1 text-xs">Stop Loss (SL)</label>
              <input
                type="number"
                value={stopLossPrice}
                onChange={e => setStopLossPrice(Number(e.target.value))}
                className="w-full p-2 bg-slate-950 border border-rose-900/60 rounded-lg text-rose-300 font-semibold focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-amber-400 mb-1 text-xs">Target (TP)</label>
              <input
                type="number"
                value={takeProfitPrice}
                onChange={e => setTakeProfitPrice(Number(e.target.value))}
                className="w-full p-2 bg-slate-950 border border-amber-900/60 rounded-lg text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 3. Hasil Kalkulasi Lot Sizing */}
          {sizingResult && sizingResult.isValid ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Rekomendasi Pembelian:</span>
                <span className="text-xl font-extrabold text-emerald-400">{sizingResult.lots} LOT</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-slate-400">Total Modal Dibutuhkan</div>
                  <div className="font-semibold text-slate-200">
                    Rp {sizingResult.totalCashNeeded.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    (Termasuk Fee Beli: Rp {sizingResult.buyFeeAmount.toLocaleString('id-ID')})
                  </div>
                </div>

                <div>
                  <div className="text-slate-400">Maks. Resiko Riil (Rupiah)</div>
                  <div className="font-semibold text-rose-400">
                    Rp {sizingResult.actualRiskAmount.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    ({((sizingResult.actualRiskAmount / capital) * 100).toFixed(2)}% dari total modal)
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Risk to Reward Ratio (RRR):</span>
                <span className="font-bold text-amber-400 text-sm">1 : {sizingResult.riskRewardRatio}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-center gap-2 text-rose-400 text-xs">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{sizingResult?.errorMessage || 'Periksa kembali parameter harga dan resiko Anda.'}</span>
            </div>
          )}
        </div>

        {/* Footer Tombol Aksi */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-1/3 py-2.5 px-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium text-xs transition"
          >
            Batal
          </button>
          
          <button
            disabled={!sizingResult?.isValid || simSuccess}
            onClick={handleSimulateBuy}
            className="w-2/3 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Eksekusi Simulasi ({sizingResult?.lots || 0} Lot)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
