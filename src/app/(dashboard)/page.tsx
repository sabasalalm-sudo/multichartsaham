// File: src/app/(dashboard)/page.tsx

'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  ChevronDown, 
  ArrowUpRight, 
  Sparkles, 
  Clock, 
  ShieldAlert,
  Target,
  LogIn
} from 'lucide-react';
import LotCalculatorModal from '@/components/calculator/LotCalculatorModal';
import { StockCardData } from '@/components/charts/StockCard';

// Data Mockup Komprehensif Sesuai Referensi Visual
const EXTENDED_MOCK_STOCKS: (StockCardData & { 
  action: 'BUY' | 'HOLD' | 'SELL';
  changePercent: string;
  changeNominal: string;
  rsi: number;
  macd: string;
})[] = [
  {
    id: '1',
    ticker: 'BBCA',
    name: 'Bank Central Asia Tbk',
    sector: 'Perbankan',
    isSyariah: false,
    indexTags: ['LQ45', 'IDX30'],
    isLiquid: true,
    bowScore: 92,
    lastClose: 9200,
    changePercent: '+4.62%',
    changeNominal: '+405',
    action: 'BUY',
    suggestedEntry: 8900,
    suggestedSL: 8600,
    suggestedTP: 10200,
    rsi: 62.4,
    macd: '1.2, 0.8, 0.4',
    candles: [
      { time: '2025-02-10', open: 8850, high: 8925, low: 8800, close: 8900, volume: 15000000 },
      { time: '2025-02-11', open: 8900, high: 8975, low: 8850, close: 8925, volume: 18000000 },
      { time: '2025-02-12', open: 8925, high: 9000, low: 8900, close: 8975, volume: 14000000 },
      { time: '2025-02-13', open: 8975, high: 9075, low: 8950, close: 9050, volume: 21000000 },
      { time: '2025-02-14', open: 9050, high: 9250, low: 9025, close: 9200, volume: 35000000 },
    ]
  },
  {
    id: '2',
    ticker: 'TLKM',
    name: 'Telkom Indonesia Tbk',
    sector: 'Telekomunikasi',
    isSyariah: true,
    indexTags: ['LQ45', 'IDX30'],
    isLiquid: true,
    bowScore: 88,
    lastClose: 3890,
    changePercent: '+3.21%',
    changeNominal: '+120',
    action: 'BUY',
    suggestedEntry: 3800,
    suggestedSL: 3700,
    suggestedTP: 4150,
    rsi: 58.1,
    macd: '0.9, 0.5, 0.4',
    candles: [
      { time: '2025-02-10', open: 3750, high: 3780, low: 3720, close: 3760, volume: 22000000 },
      { time: '2025-02-14', open: 3800, high: 3910, low: 3790, close: 3890, volume: 45000000 },
    ]
  },
  {
    id: '3',
    ticker: 'BMRI',
    name: 'Bank Mandiri (Persero) Tbk',
    sector: 'Perbankan',
    isSyariah: false,
    indexTags: ['LQ45', 'IDX30'],
    isLiquid: true,
    bowScore: 85,
    lastClose: 6450,
    changePercent: '+2.87%',
    changeNominal: '+175',
    action: 'BUY',
    suggestedEntry: 6300,
    suggestedSL: 6150,
    suggestedTP: 6900,
    rsi: 55.3,
    macd: '1.0, 0.6, 0.4',
    candles: []
  },
  {
    id: '4',
    ticker: 'BBRI',
    name: 'Bank Rakyat Indonesia Tbk',
    sector: 'Perbankan',
    isSyariah: false,
    indexTags: ['LQ45', 'IDX30'],
    isLiquid: true,
    bowScore: 78,
    lastClose: 5200,
    changePercent: '+2.44%',
    changeNominal: '+125',
    action: 'BUY',
    suggestedEntry: 5100,
    suggestedSL: 4950,
    suggestedTP: 5550,
    rsi: 52.0,
    macd: '0.4, 0.3, 0.1',
    candles: []
  },
  {
    id: '5',
    ticker: 'ASII',
    name: 'Astra International Tbk',
    sector: 'Otomotif & Industri',
    isSyariah: true,
    indexTags: ['LQ45'],
    isLiquid: true,
    bowScore: 76,
    lastClose: 6850,
    changePercent: '+1.98%',
    changeNominal: '+125',
    action: 'HOLD',
    suggestedEntry: 6700,
    suggestedSL: 6500,
    suggestedTP: 7300,
    rsi: 49.8,
    macd: '0.2, 0.2, 0.0',
    candles: []
  },
  {
    id: '6',
    ticker: 'UNTR',
    name: 'United Tractors Tbk',
    sector: 'Alat Berat & Tambang',
    isSyariah: true,
    indexTags: ['LQ45'],
    isLiquid: true,
    bowScore: 72,
    lastClose: 25300,
    changePercent: '+1.76%',
    changeNominal: '+425',
    action: 'BUY',
    suggestedEntry: 24800,
    suggestedSL: 24100,
    suggestedTP: 27000,
    rsi: 51.2,
    macd: '2.1, 1.5, 0.6',
    candles: []
  },
  {
    id: '7',
    ticker: 'ICBP',
    name: 'Indofood CBP Tbk',
    sector: 'Consumer Goods',
    isSyariah: true,
    indexTags: ['LQ45'],
    isLiquid: true,
    bowScore: 71,
    lastClose: 12450,
    changePercent: '+1.23%',
    changeNominal: '+150',
    action: 'BUY',
    suggestedEntry: 12200,
    suggestedSL: 11900,
    suggestedTP: 13200,
    rsi: 48.6,
    macd: '0.5, 0.4, 0.1',
    candles: []
  },
  {
    id: '8',
    ticker: 'INDF',
    name: 'Indofood Sukses Makmur',
    sector: 'Consumer Goods',
    isSyariah: true,
    indexTags: ['LQ45'],
    isLiquid: true,
    bowScore: 68,
    lastClose: 6925,
    changePercent: '+1.12%',
    changeNominal: '+75',
    action: 'HOLD',
    suggestedEntry: 6800,
    suggestedSL: 6650,
    suggestedTP: 7300,
    rsi: 46.2,
    macd: '0.1, 0.1, 0.0',
    candles: []
  },
  {
    id: '9',
    ticker: 'BBNI',
    name: 'Bank Negara Indonesia',
    sector: 'Perbankan',
    isSyariah: false,
    indexTags: ['LQ45'],
    isLiquid: true,
    bowScore: 65,
    lastClose: 4900,
    changePercent: '+0.98%',
    changeNominal: '+50',
    action: 'HOLD',
    suggestedEntry: 4820,
    suggestedSL: 4700,
    suggestedTP: 5200,
    rsi: 45.1,
    macd: '0.2, 0.3, -0.1',
    candles: []
  },
  {
    id: '10',
    ticker: 'BRIS',
    name: 'Bank Syariah Indonesia',
    sector: 'Perbankan Syariah',
    isSyariah: true,
    indexTags: ['LQ45'],
    isLiquid: true,
    bowScore: 55,
    lastClose: 2820,
    changePercent: '+0.52%',
    changeNominal: '+15',
    action: 'HOLD',
    suggestedEntry: 2780,
    suggestedSL: 2690,
    suggestedTP: 3050,
    rsi: 43.0,
    macd: '-0.1, 0.0, -0.1',
    candles: []
  }
];

// Data Mockup Transaksi Jurnal Hari Ini
const TODAY_TRANSACTIONS = [
  { id: 't1', ticker: 'BBCA', type: 'Buy', lots: 100, price: 8950, profit: '+Rp 420,000', time: '09:45', style: 'Swing' },
  { id: 't2', ticker: 'TLKM', type: 'Buy', lots: 200, price: 3850, profit: '+Rp 120,000', time: '10:12', style: 'Scaling' },
  { id: 't3', ticker: 'BMRI', type: 'Sell', lots: 150, price: 6420, profit: '+Rp 310,000', time: '11:36', style: 'Swing' },
  { id: 't4', ticker: 'BBRI', type: 'Buy', lots: 100, price: 5150, profit: '+Rp 205,000', time: '13:20', style: 'Swing' },
  { id: 't5', ticker: 'UNTR', type: 'Sell', lots: 50, price: 25600, profit: '+Rp 150,000', time: '14:05', style: 'Swing' },
  { id: 't6', ticker: 'INDF', type: 'Buy', lots: 80, price: 6880, profit: '+Rp 180,000', time: '15:32', style: 'Swing' },
];

export default function DashboardPage() {
  const [stocks] = useState(EXTENDED_MOCK_STOCKS);
  const [selectedStock, setSelectedStock] = useState(EXTENDED_MOCK_STOCKS[0]);
  const [activeTab, setActiveTab] = useState<'Semua' | 'Favorit' | 'LQ45' | 'Syariah' | 'Likuid'>('Semua');
  const [activeTimeframe, setActiveTimeframe] = useState('1D');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

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
        {/* KOLOM 1: MULTI CHART - WATCHLIST SAHAM (Span 5 Kolom di Desktop) */}
        {/* ================================================================ */}
        <section className="lg:col-span-5 flex flex-col bg-brand-card rounded-2xl border border-brand-border p-3.5 shadow-glow-panel">
          
          {/* Header Watchlist & Filter Tab */}
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Multi Chart - Watchlist</span>
                <span className="text-xs text-slate-400 font-normal">({filteredStocks.length} Saham)</span>
              </h2>
            </div>

            {/* Dropdown Urutkan */}
            <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-brand-subtle px-2.5 py-1 rounded-lg border border-brand-border cursor-pointer">
              <span>Urutkan: <strong className="text-white">Skor Tertinggi</strong></span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* Filter Pills Tab (Semua, Favorit, LQ45, Syariah, Likuid) */}
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

          {/* Grid Mini Stock Cards (Scrollable) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[720px] overflow-y-auto pr-1">
            {filteredStocks.map((stock) => {
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
                  {/* Atas: Ticker, Nama, Skor Circle */}
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

                  {/* Bawah: Harga, % Kenaikan, Badge Action */}
                  <div className="flex items-end justify-between mt-1 pt-1.5 border-t border-brand-border/40">
                    <div>
                      <span className="text-xs font-bold text-white block leading-tight">
                        {stock.lastClose.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-400">
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
            })}
          </div>

        </section>

        {/* ================================================================ */}
        {/* KOLOM 2: DETAIL SAHAM, CHART & REKOMENDASI BoW (Span 4 di Desktop) */}
        {/* ================================================================ */}
        <section className="lg:col-span-4 flex flex-col bg-brand-card rounded-2xl border border-brand-border p-3.5 shadow-glow-panel">
          
          {/* Header Info Saham Terpilih & Tombol BUY */}
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

          {/* Ringkasan Harga Saham Terpilih */}
          <div className="flex items-baseline gap-2 py-2.5">
            <span className="text-2xl font-black text-white">
              {selectedStock.lastClose.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-bold text-emerald-400">
              {selectedStock.changePercent} ({selectedStock.changeNominal})
            </span>
          </div>

          {/* Timeframe Selector (1D, 1W, 1M, 3M, 1Y, ALL) */}
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

          {/* Visual Canvas Grafik Sederhana (Candlestick Placeholder) */}
          <div className="w-full h-52 bg-brand-bg rounded-xl border border-brand-border p-2 relative flex flex-col justify-end overflow-hidden">
            {/* Grid Lines Horisontal */}
            <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none opacity-20">
              <div className="border-b border-dashed border-slate-600 w-full"></div>
              <div className="border-b border-dashed border-slate-600 w-full"></div>
              <div className="border-b border-dashed border-slate-600 w-full"></div>
            </div>

            {/* Candlestick Mock Visual Bars */}
            <div className="flex items-end justify-between gap-1.5 h-36 px-2 relative z-10">
              {[8900, 8950, 8920, 9020, 9150, 9100, 9200].map((val, idx) => {
                const heightPct = ((val - 8800) / 450) * 80 + 15;
                const isGreen = idx % 2 === 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div
                      className={`w-full rounded-sm ${
                        isGreen ? 'bg-emerald-500 shadow-glow-buy' : 'bg-rose-500'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    ></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-Indikator RSI & MACD */}
          <div className="mt-3 p-2.5 rounded-xl bg-brand-bg border border-brand-border space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">RSI (14)</span>
              <span className="text-emerald-400 font-bold">{selectedStock.rsi}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">MACD</span>
              <span className="text-slate-300 font-mono text-[10px]">{selectedStock.macd}</span>
            </div>
          </div>

          {/* BOX REKOMENDASI BoW (Entry, SL, TP) */}
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
                <span className="text-[10px] text-slate-400 block font-medium">SL</span>
                <span className="text-[11px] font-bold text-rose-400">
                  {selectedStock.suggestedSL?.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-brand-subtle/80 border border-brand-border">
                <span className="text-[10px] text-slate-400 block font-medium">TP</span>
                <span className="text-[11px] font-bold text-emerald-400">
                  {selectedStock.suggestedTP?.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

        </section>

        {/* ================================================================ */}
        {/* KOLOM 3: JURNAL TRADING & RINGKASAN HARI INI (Span 3 di Desktop)  */}
        {/* ================================================================ */}
        <section className="lg:col-span-3 flex flex-col bg-brand-card rounded-2xl border border-brand-border p-3.5 shadow-glow-panel justify-between">
          
          <div>
            {/* Header Jurnal Trading */}
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <h3 className="text-sm font-bold text-white">Jurnal Trading (Hari Ini)</h3>
              <a href="/simulation#jurnal" className="text-[11px] text-emerald-400 hover:underline font-semibold">
                Lihat Semua
              </a>
            </div>

            {/* List Transaksi Hari Ini */}
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

      {/* MODAL BOTTOM-SHEET KALKULATOR LOT & MONEY MANAGEMENT */}
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
