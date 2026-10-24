'use client';

import React, { useState } from 'react';
import Badge from '@/components/common/Badge';
import { Plus, Trash2, Search, CheckCircle2, Layers, ShieldCheck, AlertCircle } from 'lucide-react';

interface UniverseStock {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  isSyariah: boolean;
  indexTags: string[];
  isLiquid: boolean;
  lastClose: number;
}

// Data awal semesta saham pengguna
const INITIAL_UNIVERSE: UniverseStock[] = [
  {
    id: '1',
    ticker: 'BBCA',
    name: 'Bank Central Asia Tbk',
    sector: 'Financials',
    isSyariah: false,
    indexTags: ['LQ45', 'IDX30'],
    isLiquid: true,
    lastClose: 9800
  },
  {
    id: '2',
    ticker: 'ASII',
    name: 'Astra International Tbk',
    sector: 'Industrials',
    isSyariah: true,
    indexTags: ['LQ45'],
    isLiquid: true,
    lastClose: 5100
  },
  {
    id: '3',
    ticker: 'TLKM',
    name: 'Telkom Indonesia Tbk',
    sector: 'Telecommunication',
    isSyariah: true,
    indexTags: ['LQ45', 'IDX30'],
    isLiquid: true,
    lastClose: 3250
  },
  {
    id: '4',
    ticker: 'BRIS',
    name: 'Bank Syariah Indonesia Tbk',
    sector: 'Financials',
    isSyariah: true,
    indexTags: ['LQ45'],
    isLiquid: true,
    lastClose: 2450
  }
];

export default function UniversePage() {
  const [universe, setUniverse] = useState<UniverseStock[]>(INITIAL_UNIVERSE);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTicker, setNewTicker] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Filter pencarian
  const filteredStocks = universe.filter(
    s => s.ticker.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase())
  );

  // Hapus saham dari semesta
  const handleRemoveStock = (id: string, ticker: string) => {
    setUniverse(universe.filter(s => s.id !== id));
    setNotification(`Emiten ${ticker} berhasil dihapus dari semesta saham Anda.`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Tambah saham baru ke semesta
  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTicker = newTicker.trim().toUpperCase();
    if (!cleanTicker) return;

    if (universe.some(s => s.ticker === cleanTicker)) {
      alert(`Emiten ${cleanTicker} sudah ada di semesta Anda!`);
      return;
    }

    // Simulasi penambahan emiten baru
    const addedStock: UniverseStock = {
      id: Date.now().toString(),
      ticker: cleanTicker,
      name: `Emiten ${cleanTicker} Indonesia`,
      sector: 'General Trade',
      isSyariah: true,
      indexTags: ['Kompas100'],
      isLiquid: true,
      lastClose: 1500
    };

    setUniverse([addedStock, ...universe]);
    setNewTicker('');
    setIsAddModalOpen(false);
    setNotification(`Berhasil menambahkan ${cleanTicker} ke semesta saham Anda!`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto p-3 md:p-6 space-y-6 pb-20">
      
      {/* 1. Header Kontrol & Tombol Tambah */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Semesta Saham Pribadi</h1>
          <p className="text-xs md:text-sm text-slate-400">
            Daftar emiten BEI yang grafik hariannya akan dipindai oleh algoritma BoW Scanner.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Emiten</span>
        </button>
      </div>

      {/* Banner Notifikasi */}
      {notification && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 2. Bar Pencarian */}
      <div className="w-full relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari emiten di semesta Anda (e.g., BBCA, ASII)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
        />
      </div>

      {/* 3. Tabel Daftar Saham Terpantau */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm md:text-base font-bold text-white">
              Total Emiten Terpantau ({filteredStocks.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">Shared Pool Database</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Kode</th>
                <th className="p-3.5">Nama Perusahaan</th>
                <th className="p-3.5">Sektor</th>
                <th className="p-3.5">Tag & Indeks</th>
                <th className="p-3.5">Harga Terakhir</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredStocks.map(stock => (
                <tr key={stock.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-bold text-white text-sm">{stock.ticker}</td>
                  <td className="p-3.5 text-slate-300 font-medium">{stock.name}</td>
                  <td className="p-3.5 text-slate-400">{stock.sector}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {stock.isSyariah && <Badge label="Syariah" variant="green" />}
                      {stock.indexTags.map(tag => (
                        <Badge key={tag} label={tag} variant="blue" />
                      ))}
                      {stock.isLiquid && <Badge label="Likuid" variant="slate" />}
                    </div>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-200">
                    Rp {stock.lastClose.toLocaleString('id-ID')}
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleRemoveStock(stock.id, stock.ticker)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                      title="Hapus dari semesta saya"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modal Dialog Tambah Emiten */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-white mb-1">Tambah Emiten ke Semesta</h2>
            <p className="text-xs text-slate-400 mb-4">
              Masukkan 4 huruf kode saham Bursa Efek Indonesia (contoh: UNTR, ICBP, PGAS).
            </p>

            <form onSubmit={handleAddStock} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1">Kode Ticker (IDX)</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. UNTR"
                  value={newTicker}
                  onChange={e => setNewTicker(e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold tracking-wider uppercase focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2 px-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!newTicker.trim()}
                  className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold transition"
                >
                  Tambahkan ke Semesta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
