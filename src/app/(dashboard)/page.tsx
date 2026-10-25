// File: src/app/(dashboard)/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ArrowUpRight, 
  Sparkles, 
  Loader2, 
  Plus, 
  PanelLeftClose, 
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  LayoutGrid,
  Columns,
  Square,
  Activity,
  Layers,
  Search
} from 'lucide-react';
import LotCalculatorModal from '@/components/calculator/LotCalculatorModal';
import LightweightChart from '@/components/charts/LightweightChart';

const TODAY_TRANSACTIONS = [
  { id: 't1', ticker: 'BBCA', type: 'Buy', lots: 100, price: 8950, profit: '+Rp 420.000', time: '09:45', style: 'Swing' },
  { id: 't2', ticker: 'TLKM', type: 'Buy', lots: 200, price: 3850, profit: '+Rp 120.000', time: '10:12', style: 'Scaling' },
  { id: 't3', ticker: 'BMRI', type: 'Sell', lots: 150, price: 6420, profit: '+Rp 310.000', time: '11:36', style: 'Swing' },
  { id: 't4', ticker: 'BBRI', type: 'Buy', lots: 100, price: 5150, profit: '+Rp 205.000', time: '13:20', style: 'Swing' },
  { id: 't5', ticker: 'UNTR', type: 'Sell', lots: 50, price: 25600, profit: '+Rp 150.000', time: '14:05', style: 'Swing' },
  { id: 't6', ticker: 'INDF', type: 'Buy', lots: 80, price: 6880, profit: '+Rp 180.000', time: '15:32', style: 'Swing' },
];

export default function DashboardPage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Semua' | 'Favorit' | 'LQ45' | 'Syariah' | 'Likuid'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Layout & Visibility State (Stockbit Style)
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(true);
  const [isJournalOpen, setIsJournalOpen] = useState(true);
  const [gridMode, setGridMode] = useState<'1x1' | '1x2' | '2x2'>('1x1');

  // Chart Slot Emiten (Mendukung hingga 4 emiten bersamaan)
  const [slotTickers, setSlotTickers] = useState<string[]>(['BBCA', 'TLKM', 'BMRI', 'BBRI']);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);

  // Form Tambah Saham Baru (Instant 3-Year Fetch)
  const [newTickerInput, setNewTickerInput] = useState('');
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Modal Calculator
  const [selectedStockForCalc, setSelectedStockForCalc] = useState<any>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Quick Indicator Toggles
  const [showVolume, setShowVolume] = useState(true);
  const [showMA, setShowMA] = useState(true);
  const [showBollinger, setShowBollinger] = useState(true);

  // 1. Fetch Real Data dari API Supabase
  const fetchStocksData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stocks');
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setStocks(json.data);
      }
    } catch (e) {
      console.error('Gagal mengambil data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocksData();
  }, []);

  // 2. Tambah Emiten Baru Secara Instan (3 Tahun Yahoo Finance Sync)
  const handleAddNewStock = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTickerInput.trim().toUpperCase();
    if (!clean || clean.length < 3) return;

    try {
      setIsAddingStock(true);
      setFeedbackMsg(null);
      const res = await fetch('/api/universe/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: clean }),
      });
      const json = await res.json();

      if (json.success) {
        setFeedbackMsg({ text: `Emiten ${clean} 3 tahun berhasil ditambahkan!` });
        setNewTickerInput('');
        await fetchStocksData();
        // Pasang di slot aktif
        setSlotTickers((prev) => {
          const next = [...prev];
          next[activeSlotIndex] = clean;
          return next;
        });
      } else {
        setFeedbackMsg({ text: json.message || 'Gagal menambahkan emiten.', error: true });
      }
    } catch (err: any) {
      setFeedbackMsg({ text: err.message, error: true });
    } finally {
      setIsAddingStock(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  // Filter Saham
  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'LQ45') return stock.indexTags.includes('LQ45');
    if (activeTab === 'Syariah') return stock.isSyariah;
    if (activeTab === 'Likuid') return stock.isLiquid;
    return true;
  });

  // Helper untuk mendapatkan objek data saham per slot
  const getStockByTicker = (ticker: string) => {
    return stocks.find((s) => s.ticker === ticker) || stocks[0] || null;
  };

  // Tentukan jumlah chart yang dirender
  const activeSlots =
    gridMode === '1x1' ? [0] : gridMode === '1x2' ? [0, 1] : [0, 1, 2, 3];

  return (
    <div className="w-full flex flex-col gap-3">
      {/* ================================================================ */}
      {/* TOP CONTROLS & STOCKBIT TOOLBAR                                  */}
      {/* ================================================================ */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-brand-card p-2.5 rounded-xl border border-brand-border shadow-sm">
        {/* Toggle Panel Kiri (Watchlist) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWatchlistOpen(!isWatchlistOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
              isWatchlistOpen
                ? 'bg-brand-subtle text-white border-brand-border hover:bg-brand-card'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
            title="Sembunyikan / Tampilkan Watchlist"
          >
            {isWatchlistOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            <span className="hidden sm:inline">Watchlist</span>
          </button>

          {/* Form Tambah Emiten Cepat */}
          <form onSubmit={handleAddNewStock} className="flex items-center gap-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Tambah Emiten (cth: NSSS, BREN)..."
                value={newTickerInput}
                onChange={(e) => setNewTickerInput(e.target.value)}
                className="w-40 sm:w-56 bg-brand-bg text-white placeholder-slate-500 text-xs px-2.5 py-1.5 rounded-lg border border-brand-border focus:outline-none focus:border-emerald-500 font-mono uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={isAddingStock || !newTickerInput.trim()}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
            >
              {isAddingStock ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
              <span className="hidden md:inline">Tarik 3 Thn</span>
            </button>
          </form>

          {feedbackMsg && (
            <span className={`text-[11px] font-semibold ${feedbackMsg.error ? 'text-rose-400' : 'text-emerald-400'}`}>
              {feedbackMsg.text}
            </span>
          )}
        </div>

        {/* Multi-Chart Switcher & Indicator Toggles */}
        <div className="flex items-center gap-2">
          {/* Layout Grid Buttons */}
          <div className="flex items-center bg-brand-bg p-0.5 rounded-lg border border-brand-border">
            <button
              onClick={() => setGridMode('1x1')}
              className={`p-1.5 rounded transition ${gridMode === '1x1' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              title="1 Chart (Fokus)"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setGridMode('1x2')}
              className={`p-1.5 rounded transition ${gridMode === '1x2' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              title="2 Chart (Berdampingan)"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setGridMode('2x2')}
              className={`p-1.5 rounded transition ${gridMode === '2x2' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              title="4 Chart (Grid 2x2 ala Stockbit)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Indicator Toggles */}
          <div className="hidden lg:flex items-center gap-1 bg-brand-bg p-1 rounded-lg border border-brand-border text-[11px] font-medium">
            <button
              onClick={() => setShowMA(!showMA)}
              className={`px-2 py-0.5 rounded ${showMA ? 'bg-brand-subtle text-cyan-400 font-bold' : 'text-slate-500'}`}
            >
              MA
            </button>
            <button
              onClick={() => setShowBollinger(!showBollinger)}
              className={`px-2 py-0.5 rounded ${showBollinger ? 'bg-brand-subtle text-amber-400 font-bold' : 'text-slate-500'}`}
            >
              BB
            </button>
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2 py-0.5 rounded ${showVolume ? 'bg-brand-subtle text-emerald-400 font-bold' : 'text-slate-500'}`}
            >
              VOL
            </button>
          </div>

          {/* Toggle Panel Kanan (Jurnal) */}
          <button
            onClick={() => setIsJournalOpen(!isJournalOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
              isJournalOpen
                ? 'bg-brand-subtle text-white border-brand-border hover:bg-brand-card'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
            title="Sembunyikan / Tampilkan Jurnal"
          >
            <span className="hidden sm:inline">Jurnal</span>
            {isJournalOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* MAIN CONTAINER DENGAN AUTO-FIT LEBAR SECARA DINAMIS              */}
      {/* ================================================================ */}
      <div className="flex gap-3 w-full items-start">
        
        {/* ============================================================== */}
        {/* PANEL KIRI: WATCHLIST (COLLAPSIBLE)                            */}
        {/* ============================================================== */}
        {isWatchlistOpen && (
          <aside className="w-full lg:w-[320px] shrink-0 flex flex-col bg-brand-card rounded-2xl border border-brand-border p-3 shadow-glow-panel transition-all duration-200">
            <div className="flex items-center justify-between pb-2.5 border-b border-brand-border/60">
              <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Watchlist</span>
                <span className="text-slate-400 font-normal">({filteredStocks.length})</span>
              </h2>
              {loading && <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />}
            </div>

            {/* Search Input */}
            <div className="relative mt-2">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Cari ticker / nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-bg text-white placeholder-slate-500 text-xs pl-8 pr-2.5 py-1.5 rounded-lg border border-brand-border focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Filter Pills Tab */}
            <div className="flex items-center gap-1 py-2 overflow-x-auto no-scrollbar">
              {(['Semua', 'Favorit', 'LQ45', 'Syariah', 'Likuid'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition shrink-0 ${
                    activeTab === tab
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-brand-subtle text-slate-400 hover:text-white border border-brand-border/60'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* List Mini Emiten Cards */}
            <div className="flex flex-col gap-1.5 max-h-[660px] overflow-y-auto pr-1">
              {filteredStocks.map((stock) => {
                const isSelectedInSlot = slotTickers[activeSlotIndex] === stock.ticker;

                return (
                  <div
                    key={stock.id}
                    onClick={() => {
                      setSlotTickers((prev) => {
                        const next = [...prev];
                        next[activeSlotIndex] = stock.ticker;
                        return next;
                      });
                    }}
                    className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelectedInSlot
                        ? 'bg-brand-subtle border-emerald-500 ring-1 ring-emerald-500/40'
                        : 'bg-brand-bg/50 border-brand-border hover:bg-brand-subtle/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-white">{stock.ticker}</span>
                        {stock.isSyariah && (
                          <span className="text-[8px] px-1 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                            S
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 truncate max-w-[130px] block">
                        {stock.name}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-white block">
                        {stock.lastClose.toLocaleString('id-ID')}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          stock.changePercent.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {stock.changePercent}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* ============================================================== */}
        {/* PANEL TENGAH: TRADINGVIEW MULTI-CHART CANVAS (AUTO-FIT)        */}
        {/* ============================================================== */}
        <main className="flex-1 min-w-0 flex flex-col gap-3">
          <div
            className={`grid gap-3 w-full ${
              gridMode === '1x1'
                ? 'grid-cols-1'
                : gridMode === '1x2'
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-2'
            }`}
          >
            {activeSlots.map((slotIdx) => {
              const ticker = slotTickers[slotIdx] || 'BBCA';
              const stock = getStockByTicker(ticker);
              const isActiveSlot = activeSlotIndex === slotIdx;

              return (
                <div
                  key={slotIdx}
                  onClick={() => setActiveSlotIndex(slotIdx)}
                  className={`bg-brand-card rounded-2xl border p-3 flex flex-col gap-2 transition-all shadow-glow-panel ${
                    isActiveSlot ? 'border-emerald-500/70 ring-1 ring-emerald-500/30' : 'border-brand-border'
                  }`}
                >
                  {/* Slot Top Header */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-brand-border/50">
                    <div className="flex items-center gap-2">
                      <select
                        value={ticker}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSlotTickers((prev) => {
                            const next = [...prev];
                            next[slotIdx] = val;
                            return next;
                          });
                        }}
                        className="bg-brand-subtle text-white font-extrabold text-xs px-2 py-1 rounded border border-brand-border focus:outline-none cursor-pointer"
                      >
                        {stocks.map((s) => (
                          <option key={s.id} value={s.ticker}>
                            {s.ticker} - {s.name.slice(0, 20)}
                          </option>
                        ))}
                      </select>

                      {stock && (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs font-bold text-white">
                            {stock.lastClose.toLocaleString('id-ID')}
                          </span>
                          <span
                            className={`text-[10px] font-semibold ${
                              stock.changePercent.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {stock.changePercent}
                          </span>
                        </div>
                      )}
                    </div>

                    {stock && (
                      <button
                        onClick={() => {
                          setSelectedStockForCalc(stock);
                          setIsCalculatorOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-glow-buy"
                      >
                        <span>BUY</span>
                        <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                      </button>
                    )}
                  </div>

                  {/* Canvas Charting 3 Tahun Auto-Fit */}
                  {stock && stock.candles && stock.candles.length > 0 ? (
                    <LightweightChart
                      ticker={stock.ticker}
                      candles={stock.candles}
                      bollinger={stock.bollinger}
                      supportPrice={stock.suggestedSL}
                      resistancePrice={stock.suggestedTP}
                      height={gridMode === '1x1' ? 440 : 280}
                      showVolume={showVolume}
                      showMA={showMA}
                      showBollinger={showBollinger}
                    />
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-400 mb-1" />
                      <span>Menyiapkan histori 3 tahun {ticker}...</span>
                    </div>
                  )}

                  {/* Rekomendasi BoW Mini Bar */}
                  {stock && (
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] pt-1">
                      <div className="p-1 rounded bg-brand-bg border border-brand-border">
                        <span className="text-slate-400 block text-[9px]">Entry</span>
                        <span className="text-emerald-400 font-bold">
                          {stock.suggestedEntry?.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="p-1 rounded bg-brand-bg border border-brand-border">
                        <span className="text-slate-400 block text-[9px]">SL (Support)</span>
                        <span className="text-rose-400 font-bold">
                          {stock.suggestedSL?.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="p-1 rounded bg-brand-bg border border-brand-border">
                        <span className="text-slate-400 block text-[9px]">TP (Resisten)</span>
                        <span className="text-emerald-400 font-bold">
                          {stock.suggestedTP?.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>

        {/* ============================================================== */}
        {/* PANEL KANAN: JURNAL TRADING (COLLAPSIBLE)                      */}
        {/* ============================================================== */}
        {isJournalOpen && (
          <aside className="w-full lg:w-[280px] shrink-0 flex flex-col bg-brand-card rounded-2xl border border-brand-border p-3 shadow-glow-panel transition-all duration-200">
            <div className="flex items-center justify-between pb-2.5 border-b border-brand-border/60">
              <h3 className="text-xs font-bold text-white">Jurnal Hari Ini</h3>
              <a href="/simulation" className="text-[10px] text-emerald-400 hover:underline font-semibold">
                Buka Simulasi
              </a>
            </div>

            <div className="space-y-1.5 mt-2 max-h-[420px] overflow-y-auto pr-1">
              {TODAY_TRANSACTIONS.map((trx) => (
                <div
                  key={trx.id}
                  className="p-2 rounded-xl bg-brand-bg/70 border border-brand-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-black ${
                        trx.type === 'Buy'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {trx.ticker.slice(0, 2)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{trx.ticker}</span>
                      <span className="text-[9px] text-slate-400">{trx.lots} lot</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold text-white block">
                      {trx.price.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">
                      {trx.profit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Ringkasan */}
            <div className="mt-3 p-2.5 rounded-xl bg-brand-subtle/80 border border-brand-border text-center">
              <span className="text-[10px] text-slate-400 block">Total Realized PnL</span>
              <span className="text-sm font-black text-emerald-400">+Rp 1.385.000</span>
              <div className="flex justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-brand-border/50">
                <span>Win Rate: <strong className="text-white">71%</strong></span>
                <span>Trades: <strong className="text-white">6</strong></span>
              </div>
            </div>
          </aside>
        )}

      </div>

      {/* Modal Lot Calculator */}
      {selectedStockForCalc && (
        <LotCalculatorModal
          isOpen={isCalculatorOpen}
          onClose={() => setIsCalculatorOpen(false)}
          stock={selectedStockForCalc}
        />
      )}
    </div>
  );
}
