'use client';

import React from 'react';
import LightweightChart from './LightweightChart';
import Badge from '../common/Badge';
import { Candle } from '@/types/trading';
import { Calculator, TrendingUp } from 'lucide-react';

export interface StockCardData {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  isSyariah: boolean;
  indexTags: string[];
  isLiquid: boolean;
  bowScore: number;
  lastClose: number;
  suggestedEntry: number;
  suggestedSL: number;
  suggestedTP: number;
  candles: Candle[];
}

interface StockCardProps {
  stock: StockCardData;
  onOpenCalculator: (stock: StockCardData) => void;
}

export default function StockCard({ stock, onOpenCalculator }: StockCardProps) {
  // Hitung perkiraan Risk Reward Ratio
  const risk = stock.suggestedEntry - stock.suggestedSL;
  const reward = stock.suggestedTP - stock.suggestedEntry;
  const rrr = risk > 0 ? (reward / risk).toFixed(1) : '0';

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-slate-700 transition duration-200">
      {/* 1. Header Kartu: Ticker, Nama & Skor */}
      <div className="p-3.5 border-b border-slate-800 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-wide">{stock.ticker}</h3>
            {stock.isSyariah && <Badge label="Syariah" variant="green" />}
            {stock.indexTags.map(tag => (
              <Badge key={tag} label={tag} variant="blue" />
            ))}
          </div>
          <p className="text-xs text-slate-400 truncate max-w-[200px]">{stock.name}</p>
        </div>

        {/* Skor BoW */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-emerald-400 font-bold text-sm bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded-lg">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{stock.bowScore} Pts</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">Skor Reversal</span>
        </div>
      </div>

      {/* 2. Area Grafik Canvas */}
      <div className="p-2 bg-slate-950">
        <LightweightChart
          candles={stock.candles}
          supportPrice={stock.suggestedSL}
          resistancePrice={stock.suggestedTP}
          height={220}
        />
      </div>

      {/* 3. Panel Ringkasan Metrik (Entry, SL, TP, RRR) */}
      <div className="grid grid-cols-4 gap-1 p-2.5 bg-slate-900/60 border-t border-slate-800 text-center text-xs">
        <div>
          <div className="text-[10px] text-slate-400">Entry</div>
          <div className="font-semibold text-slate-200">Rp {stock.suggestedEntry.toLocaleString('id-ID')}</div>
        </div>
        <div>
          <div className="text-[10px] text-rose-400">Stop Loss</div>
          <div className="font-semibold text-rose-400">Rp {stock.suggestedSL.toLocaleString('id-ID')}</div>
        </div>
        <div>
          <div className="text-[10px] text-amber-400">Target TP</div>
          <div className="font-semibold text-amber-400">Rp {stock.suggestedTP.toLocaleString('id-ID')}</div>
        </div>
        <div>
          <div className="text-[10px] text-emerald-400">Est. RRR</div>
          <div className="font-semibold text-emerald-400">1 : {rrr}</div>
        </div>
      </div>

      {/* 4. Tombol Aksi: Hitung Lot & Simulasi */}
      <div className="p-2.5 border-t border-slate-800/80 bg-slate-900">
        <button
          onClick={() => onOpenCalculator(stock)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md transition"
        >
          <Calculator className="w-4 h-4" />
          <span>Kalkulator Lot & Simulasi</span>
        </button>
      </div>
    </div>
  );
}
