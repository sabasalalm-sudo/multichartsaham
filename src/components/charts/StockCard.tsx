// File: src/components/charts/StockCard.tsx

'use client';

import React from 'react';
import LightweightChart from './LightweightChart';
import { Candle } from '@/types/trading';
import { TrendingUp, Calculator, ArrowUpRight } from 'lucide-react';

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
  onSelect?: (stock: StockCardData) => void;
  isSelected?: boolean;
}

export default function StockCard({ stock, onOpenCalculator, onSelect, isSelected }: StockCardProps) {
  // Hitung perkiraan Risk Reward Ratio
  const risk = stock.suggestedEntry - stock.suggestedSL;
  const reward = stock.suggestedTP - stock.suggestedEntry;
  const rrr = risk > 0 ? (reward / risk).toFixed(1) : '0';

  return (
    <div 
      onClick={() => onSelect && onSelect(stock)}
      className={`flex flex-col bg-brand-card border rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-glow-buy' 
          : 'border-brand-border hover:border-slate-700 hover:bg-brand-cardHover'
      }`}
    >
      {/* 1. Header Kartu: Ticker, Badges, & Skor Lingkaran */}
      <div className="p-3.5 border-b border-brand-border/60 flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-extrabold text-white tracking-wide">{stock.ticker}</h3>
            {stock.isSyariah && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                Syariah
              </span>
            )}
            {stock.indexTags.map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-brand-subtle text-slate-300 font-semibold border border-brand-border">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 truncate max-w-[210px]">{stock.name}</p>
        </div>

        {/* Skor BoW Badge Lingkaran */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-xs shrink-0 shadow-sm">
          {stock.bowScore}
        </div>
      </div>

      {/* 2. Area Grafik Canvas TradingView */}
      <div className="p-2.5 bg-brand-bg">
        <LightweightChart
          candles={stock.candles}
          supportPrice={stock.suggestedSL}
          resistancePrice={stock.suggestedTP}
          height={180}
        />
      </div>

      {/* 3. Panel Ringkasan Metrik (Entry, SL, TP, RRR) */}
      <div className="grid grid-cols-4 gap-1 p-2 bg-brand-subtle/50 border-t border-brand-border text-center">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Entry</span>
          <span className="font-bold text-slate-200 text-xs">{stock.suggestedEntry.toLocaleString('id-ID')}</span>
        </div>
        <div>
          <span className="text-[10px] text-rose-400 block font-medium">Stop Loss</span>
          <span className="font-bold text-rose-400 text-xs">{stock.suggestedSL.toLocaleString('id-ID')}</span>
        </div>
        <div>
          <span className="text-[10px] text-emerald-400 block font-medium">Target TP</span>
          <span className="font-bold text-emerald-400 text-xs">{stock.suggestedTP.toLocaleString('id-ID')}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Est. RRR</span>
          <span className="font-bold text-white text-xs">1:{rrr}</span>
        </div>
      </div>

      {/* 4. Tombol Aksi: Kalkulator Lot & Simulasi */}
      <div className="p-2.5 border-t border-brand-border bg-brand-card">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenCalculator(stock);
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow-buy transition"
        >
          <Calculator className="w-4 h-4 stroke-[2.5]" />
          <span>Kalkulator Lot & Simulasi</span>
        </button>
      </div>
    </div>
  );
}
