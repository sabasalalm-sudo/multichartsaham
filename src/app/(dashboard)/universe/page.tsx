// File: src/app/(dashboard)/universe/page.tsx

'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  CheckCircle2, 
  Layers, 
  Star, 
  ArrowLeft, 
  Check, 
  SlidersHorizontal 
} from 'lucide-react';
import Link from 'next/link';

interface UniverseStock {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  isSyariah: boolean;
  indexTags: string[];
  isLiquid: boolean;
  bowScore: number;
  lastClose: number;
  changePercent: string;
  isFavorite?: boolean;
}

const INITIAL_UNIVERSE: UniverseStock[] = [
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
    isFavorite: true,
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
    isFavorite: true,
  },
  {
    id: '3',
    ticker: 'BMRI',
    name: 'Bank Mandiri Tbk',
    sector: 'Perbankan',
    isSyariah: false,
    indexTags: ['LQ45'],
    isLiquid: true,
    bowScore: 85,
    lastClose: 6450,
    changePercent: '+2.87%',
    isFavorite: false,
  },
  {
    id: '4',
    ticker: 'BBRI',
    name: 'Bank Rakyat Indonesia Tbk',
    sector: 'Perbankan',
    isSyariah: false,
    indexTags: ['LQ45'],
    isLiquid: true,
    bowScore: 78,
    lastClose: 5200,
    changePercent: '+2.44%',
    isFavorite: true,
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
    isFavorite: false,
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
    isFavorite: false,
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
    isFavorite: false,
  }
];

export default function UniversePage() {
  const [universe, setUniverse] = useState<UniverseStock[]>(INITIAL_UNIVERSE);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'Watchlist' | 'Favorit' | 'Sektor' | 'Industri'>('Watchlist');
  const [subFilter, setSubFilter] = useState<'Semua' | 'LQ45' | 'Syariah' | 'Likuid'>('Semua');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTicker, setNewTicker] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Toggle Favorit
  const handleToggleFavorite = (id: string) => {
    setUniverse(universe.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
  };

  // Hapus dari Semesta
  const handleRemoveStock = (id: string, ticker: string) => {
    setUniverse(universe.filter(s => s.id !== id));
    setNotification(`Emiten ${ticker} dihapus dari semesta.`);
    setTimeout(() => setNotification(null), 2500);
  };

  // Tambah Emiten Baru
  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTicker = newTicker.trim().toUpperCase();
    if (!cleanTicker) return;

    if (universe.some(s => s.ticker === cleanTicker)) {
      alert(`Emiten ${cleanTicker} sudah ada di semesta Anda!`);
      return;
    }

    const added: UniverseStock = {
      id: Date.now().toString(),
      ticker: cleanTicker,
      name: `${cleanTicker} Indonesia Tbk`,
      sector: 'Manufaktur & Energi',
      isSyariah: true,
      indexTags: ['Kompas100'],
      isLiquid: true,
      bowScore: 70,
      lastClose: 1550,
      changePercent: '+0.00%',
      isFavorite: false,
    };

    setUniverse([added, ...universe]);
    setNewTicker('');
    setIsAddModalOpen(false);
    setNotification(`Berhasil menambahkan ${cleanTicker} ke semesta!`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter Data
  const filteredStocks = universe.filter(stock => {
    const matchesSearch = stock.ticker.toLowerCase().includes(search.toLowerCase()) || 
                          stock.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'Favorit' && !stock.isFavorite) return false;

    if (subFilter === 'LQ45') return stock.indexTags.includes('LQ45');
    if (subFilter === 'Syariah') return stock.isSyariah;
    if (subFilter === 'Likuid') return stock.isLiquid;

    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      
      {/* 1. Header Bar Sesuai Referensi ("← Semesta Saham") */}
      <div className="flex items-center justify-between pb-2 border-b border-brand-border">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1 text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-base font-extrabold text-white">Semesta Saham</h1>
          <span className="text-xs text-slate-400 font-medium">({filteredStocks.length} Terpantau)</span>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-glow-buy"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Emiten</span>
        </button>
      </div>

      {/* Banner Notifikasi */}
      {notification && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 2. Bar Pencarian */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari saham, ticker, atau sektor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-brand-card border border-brand-border rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
        />
      </div>

      {/* 3. Kategori Tab (Watchlist, Favorit, Sektor, Industri) */}
      <div className="grid grid-cols-4 p-1 bg-brand-bg rounded-xl border border-brand-border text-xs font-bold text-center">
        {(['Watchlist', 'Favorit', 'Sektor', 'Industri'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-1.5 rounded-lg transition ${
              activeTab === tab
                ? 'bg-brand-subtle text-white border border-brand-border shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4. Sub-Filter Pills (Semua, LQ45, Syariah, Likuid) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {(['Semua', 'LQ45', 'Syariah', 'Likuid'] as const).map(pill => (
          <button
            key={pill}
            onClick={() => setSubFilter(pill)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition shrink-0 ${
              subFilter === pill
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-brand-card text-slate-400 hover:text-white border border-brand-border'
            }`}
          >
            {pill}
          </button>
        ))}
      </div>

      {/* 5. Daftar List Emiten Semesta */}
      <div className="bg-brand-card rounded-2xl border border-brand-border divide-y divide-brand-border/60 overflow-hidden shadow-glow-panel">
        {filteredStocks.map(stock => (
          <div
            key={stock.id}
            className="p-3.5 flex items-center justify-between hover:bg-brand-subtle/50 transition"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggleFavorite(stock.id)}
                className={`p-1 transition ${
                  stock.isFavorite ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                <Star className={`w-4 h-4 ${stock.isFavorite ? 'fill-amber-400' : ''}`} />
              </button>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-white">{stock.ticker}</span>
                  {stock.isSyariah && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                      S
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">{stock.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs font-bold text-white block">
                  {stock.lastClose.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] font-semibold text-emerald-400">
                  {stock.changePercent}
                </span>
              </div>

              {/* Skor BoW */}
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-xs flex items-center justify-center">
                {stock.bowScore}
              </div>

              {/* Tombol Hapus */}
              <button
                onClick={() => handleRemoveStock(stock.id, stock.ticker)}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                title="Hapus dari semesta"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dialog Tambah Emiten */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-brand-card border border-brand-border rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <h2 className="text-sm font-bold text-white mb-1">Tambah Emiten ke Semesta</h2>
            <p className="text-[11px] text-slate-400 mb-4">
              Ketik 4 huruf kode ticker IDX (misal: ICBP, INDF, PGAS).
            </p>

            <form onSubmit={handleAddStock} className="space-y-3.5">
              <input
                type="text"
                maxLength={4}
                placeholder="e.g. ICBP"
                value={newTicker}
                onChange={e => setNewTicker(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl text-white font-black tracking-widest uppercase focus:outline-none focus:border-emerald-500 text-sm text-center"
                autoFocus
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-1.5 px-3 rounded-lg border border-brand-border text-slate-300 text-xs font-medium hover:bg-brand-subtle"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!newTicker.trim()}
                  className="py-1.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-brand-subtle disabled:text-slate-500 text-slate-950 text-xs font-bold transition shadow-glow-buy"
                >
                  Tambahkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
