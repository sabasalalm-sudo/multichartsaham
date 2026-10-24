'use client';

import React, { useState } from 'react';
import StockCard, { StockCardData } from '@/components/charts/StockCard';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

// Data simulasi awal agar Anda bisa langsung melihat wujud aplikasinya
const INITIAL_DEMO_DATA: StockCardData[] = [
  {
    id: '1',
    ticker: 'BBCA',
    name: 'Bank Central Asia Tbk',
    sector: 'Financials',
    isSyariah: false,
    indexTags: ['LQ45', 'IDX30'],
    isLiquid: true,
    bowScore: 92,
    lastClose: 9800,
    suggestedEntry: 9800,
    suggestedSL: 9550,
    suggestedTP: 10400,
    candles: [
      { time: '2025-02-10', open: 9600, high: 9650, low: 9550, close: 9600, volume: 15000000 },
      { time: '2025-02-11', open: 9600, high: 9625, low: 9525, close: 9550, volume: 18000000 },
      { time: '2025-02-12', open: 9550, high: 9600, low: 9500, close: 9575, volume: 12000000 },
      { time: '2025-02-13', open: 9575, high: 9650, low: 9550, close: 9625, volume: 16000000 },
      { time: '2025-02-14', open: 9625, high: 9825, low: 9600, close: 9800, volume: 32000000 }
    ]
  },
  {
    id: '2',
    ticker: 'ASII',
    name: 'Astra International Tbk',
    sector: 'Industrials',
    isSyariah: true,
    indexTags: ['LQ45'],
    isLiquid: true,
    bowScore: 85,
    lastClose: 5100,
    suggestedEntry: 5100,
    suggestedSL: 4950,
    suggestedTP: 5500,
    candles: [
      { time: '2025-02-10', open: 5050, high: 5100, low: 4980, close: 5000, volume: 22000000 },
      { time: '2025-02-11', open: 5000, high: 5025, low: 4940, close: 4960, volume: 25000000 },
      { time: '2025-02-12', open: 4960, high: 5000, low: 4930, close: 4980, volume: 19000000 },
      { time: '2025-02-13', open: 4980, high: 5050, low: 4970, close: 5025, volume: 21000000 },
      { time: '2025-02-14', open: 5025, high: 5150, low: 5000, close: 5100, volume: 38000000 }
    ]
  }
];

export default function DashboardPage() {
  const [stocks] = useState<StockCardData[]>(INITIAL_DEMO_DATA);
  const [search, setSearch] = useState('');

  const handleOpenCalculator = (stock: StockCardData) => {
    alert(`Membuka kalkulator lot untuk: ${stock.ticker} (Akan dihubungkan di Sesi 6)`);
  };

  const filteredStocks = stocks.filter(
    s => s.ticker.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 md:p-6 pb-20">
      {/* 1. Bar Header Kontrol & Pencarian */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Scanner Buy On Weakness</h1>
          <p className="text-xs md:text-sm text-slate-400">
            Grafik harian diurutkan otomatis berdasarkan potensi pembalikan arah (BoW).
          </p>
        </div>

        {/* Input Pencarian */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari emiten (e.g., BBCA, ASII)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* 2. Responsive Multi-Chart Layout: 
             - Mobile: 1 kolom flex-col (Card Feed)
             - Tablet: 2 kolom grid
             - Desktop: 3 kolom grid
      */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredStocks.map(stock => (
          <StockCard
            key={stock.id}
            stock={stock}
            onOpenCalculator={handleOpenCalculator}
          />
        ))}
      </div>
    </div>
  );
}
