// File: src/app/(dashboard)/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ArrowUpRight, 
  Sparkles, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import LotCalculatorModal from '@/components/calculator/LotCalculatorModal';
import LightweightChart from '@/components/charts/LightweightChart';

const TODAY_TRANSACTIONS = [
  { id: 't1', ticker: 'BBCA', type: 'Buy', lots: 100, price: 8950, profit: '+Rp 420,000', time: '09:45', style: 'Swing' },
  { id: 't2', ticker: 'TLKM', type: 'Buy', lots: 200, price: 3850, profit: '+Rp 120,000', time: '10:12', style: 'Scaling' },
  { id: 't3', ticker: 'BMRI', type: 'Sell', lots: 150, price: 6420, profit: '+Rp 310,000', time: '11:36', style: 'Swing' },
  { id: 't4', ticker: 'BBRI', type: 'Buy', lots: 100, price: 5150, profit: '+Rp 205,000', time: '13:20', style: 'Swing' },
  { id: 't5', ticker: 'UNTR', type: 'Sell', lots: 50, price: 25600, profit: '+Rp 150,000', time: '14:05', style: 'Swing' },
  { id: 't6', ticker: 'INDF', type: 'Buy', lots: 80, price: 6880, profit: '+Rp 180,000', time: '15:32', style: 'Swing' },
];

export default function DashboardPage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Semua' | 'Favorit' | 'LQ45' | 'Syariah' | 'Likuid'>('Semua');
  const [activeTimeframe, setActiveTimeframe] = useState('1D');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Ambil Data Real-Time Yahoo Finance & Indikator via API
  const fetchRealData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stocks');
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setStocks(json.data);
        setSelectedStock(json.data[0]);
      }
    } catch (e) {
      console.error('Gagal mengambil data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  // Filter Saham berdasarkan Tab
  const filteredStocks = stocks.filter(stock => {
    if (activeTab === 'LQ45') return stock.indexTags.includes('LQ45');
    if (activeTab === 'Syariah') return stock.isSyariah;
    if (activeTab === 'Likuid') return stock.isLiquid;
    return true;
  });

  return (
    <div className="w-full">
      {/* Container Grid 3-Kolom Desktop & 1-Kolom Mobile Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* ================================================================ */}
        {/* KOLOM 1: MULTI CHART - WATCHLIST SAHAM                           */}
        {/* ================================================================ */}
        <section className="lg:col-span-5 flex flex-col bg-brand-card rounded-2xl border border-brand-border p-3.5 shadow-glow-panel">
          
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Multi Chart - Watchlist</span>
                <span className="text-xs text-slate-400 font-normal">({filteredStocks.length} Saham)</span>
              </h2>
              {loading && <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-brand-subtle px-2.5 py-1 rounded-lg border border-brand-border cursor-pointer">
              <span>Urutkan: <strong className="text-white">Skor Tertinggi</strong></span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* Filter Pills Tab */}
          <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar">
            {(['Semua', 'Favorit', 'LQ45', 'Syariah', 'Likuid'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition shrink-0 ${
                  activeTab === tab
                    ? 'bg-emerald-500 text-slate-950 shadow-glow-buy'
                    : 'bg-brand-subtle text-slate-400 hover:text-white border border-brand-border/60'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Grid Mini Stock Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[720px] overflow-y-auto pr-1">
            {loading && stocks.length === 0 ? (
              <div className="col-span-2 py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                <span className="text-xs">Menarik candle bursa Yahoo Finance & menghitung BoW...</span>
              </div>
            ) : (
              filteredStocks.map((stock) => {
                const isSelected = selectedStock?.id === stock.id;
                const isBuy = stock.action === 'BUY';
                const isHold = stock.action === 'HOLD';

                return (
                  <div
                    key={stock.id}
                    onClick={() => setSelectedStock(stock)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-brand-subtle border-emerald-500/60 ring-1 ring-emerald-500/40 shadow-sm'
                        : 'bg-brand-bg/60 border-brand-border hover:border-slate-700 hover:bg-brand-subtle/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-white tracking-wide">{stock.ticker}</span>
                          {stock.isSyariah && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                              S
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{stock.name}</p>
                      </div>

                      {/* Skor BoW Badge */}
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black shrink-0">
                        {stock.bowScore}
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-1 pt-1.5 border-t border-brand-border/40">
                      <div>
                        <span className="text-xs font-bold text-white block leading-tight">
                          {stock.lastClose.toLocaleString('id-ID')}
                        </span>
                        <span className={`text-[10px] font-semibold ${stock.changePercent.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {stock.changePercent}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] uppercase font-black px-2 py-0.5 rounded tracking-wider ${
                          isBuy
                            ? 'bg-emerald-500 text-slate-950'
                            : isHold
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {stock.action}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </section>

        {/* ================================================================ */}
        {/* KOLOM 2: DETAIL SAHAM, TRADINGVIEW CANVAS, BOLLINGER & REKOMENDASI */}
        {/* ================================================================ */}
        <section className="lg:col-span-4 flex flex-col bg-brand-card rounded-2xl border border-brand-border p-3.5 shadow-glow-panel">
          
          {selectedStock ? (
            <>
              {/* Header Info Saham Terpilih */}
              <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white">{selectedStock.ticker}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-subtle text-slate-400 border border-brand-border">
                      {selectedStock.sector}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{selectedStock.name}</p>
                </div>

                <button
                  onClick={() => setIsCalculatorOpen(true)}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black tracking-wide shadow-glow-buy transition flex items-center gap-1"
                >
                  <span>BUY</span>
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* Harga Terakhir & % Kenaikan */}
              <div className="flex items-baseline gap-2 py-2.5">
                <span className="text-2xl font-black text-white">
                  {selectedStock.lastClose.toLocaleString('id-ID')}
                </span>
                <span className={`text-xs font-bold ${selectedStock.changePercent.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedStock.changePercent} ({selectedStock.changeNominal})
                </span>
              </div>

              {/* Timeframe Selector */}
              <div className="flex items-center gap-1 bg-brand-bg p-1 rounded-xl border border-brand-border mb-3 text-[10px] font-bold">
                {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    className={`flex-1 py-1 rounded-lg transition ${
                      activeTimeframe === tf
                        ? 'bg-brand-subtle text-white border border-brand-border shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* TRADINGVIEW CANVAS LENGKAP: CANDLESTICK + BOLLINGER BANDS + SUPPORT & RESISTEN */}
              <div className="w-full">
                <LightweightChart
                  candles={selectedStock.candles}
                  bollinger={selectedStock.bollinger}
                  supportPrice={selectedStock.suggestedSL}
                  resistancePrice={selectedStock.suggestedTP}
                  height={200}
                />
              </div>

              {/* Indikator RSI (14) & MACD Riil */}
              <div className="mt-3 p-2.5 rounded-xl bg-brand-bg border border-brand-border space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">RSI (14 Wilder)</span>
                  <span className={`font-bold ${selectedStock.rsi < 35 ? 'text-emerald-400' : selectedStock.rsi > 70 ? 'text-rose-400' : 'text-white'}`}>
                    {selectedStock.rsi} {selectedStock.rsi < 35 ? '(Oversold / Reversal)' : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">MACD Signal</span>
                  <span className="text-slate-300 font-mono text-[10px]">{selectedStock.macd}</span>
                </div>
              </div>

              {/* REKOMENDASI BoW DENGAN ENTRY, SL, TP RIIL */}
              <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-emerald-950/30 to-brand-bg border border-emerald-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Rekomendasi BoW</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
                    {selectedStock.bowScore}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-1.5 rounded-lg bg-brand-subtle/80 border border-brand-border">
                    <span className="text-[10px] text-slate-400 block font-medium">Entry</span>
                    <span className="text-[11px] font-bold text-emerald-400">
                      {selectedStock.suggestedEntry?.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-brand-subtle/80 border border-brand-border">
                    <span className="text-[10px] text-slate-400 block font-medium">SL (Support)</span>
                    <span className="text-[11px] font-bold text-rose-400">
                      {selectedStock.suggestedSL?.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-brand-subtle/80 border border-brand-border">
                    <span className="text-[10px] text-slate-400 block font-medium">TP (Resisten)</span>
                    <span className="text-[11px] font-bold text-emerald-400">
                      {selectedStock.suggestedTP?.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-24 text-center text-slate-400 text-xs">Pilih salah satu saham untuk melihat chart.</div>
          )}

        </section>

        {/* ================================================================ */}
        {/* KOLOM 3: JURNAL TRADING & RINGKASAN HARI INI                     */}
        {/* ================================================================ */}
        <section className="lg:col-span-3 flex flex-col bg-brand-card rounded-2xl border border-brand-border p-3.5 shadow-glow-panel justify-between">
          
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <h3 className="text-sm font-bold text-white">Jurnal Trading (Hari Ini)</h3>
              <a href="/simulation#jurnal" className="text-[11px] text-emerald-400 hover:underline font-semibold">
                Lihat Semua
              </a>
            </div>

            <div className="space-y-2 mt-3 max-h-[460px] overflow-y-auto pr-1">
              {TODAY_TRANSACTIONS.map((trx) => (
                <div
                  key={trx.id}
                  className="p-2.5 rounded-xl bg-brand-bg/80 border border-brand-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${
                        trx.type === 'Buy'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {trx.ticker.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{trx.ticker}</span>
                        <span className="text-[9px] font-semibold text-slate-400">{trx.type}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{trx.lots} lot</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-white block">
                      {trx.price.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">
                      {trx.profit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOX RINGKASAN HARI INI */}
          <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-br from-brand-subtle to-brand-card border border-brand-border">
            <h4 className="text-xs font-bold text-slate-300 mb-2">Ringkasan Hari Ini</h4>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Total Profit</span>
                <span className="text-xs font-extrabold text-emerald-400">+Rp 945,000</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Win Rate</span>
                <span className="text-xs font-extrabold text-white">68%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Transaksi</span>
                <span className="text-xs font-extrabold text-white">6</span>
              </div>
            </div>
          </div>

        </section>

      </div>

      {/* MODAL KALKULATOR LOT & MONEY MANAGEMENT */}
      {selectedStock && (
        <LotCalculatorModal
          isOpen={isCalculatorOpen}
          onClose={() => setIsCalculatorOpen(false)}
          stock={selectedStock}
        />
      )}
    </div>
  );
}
