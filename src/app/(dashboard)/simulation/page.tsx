'use client';

import React, { useState } from 'react';
import { executeSimSell } from '@/lib/trading/simulationEngine';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  History, 
  ArrowUpRight, 
  ArrowDownRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Data simulasi awal
interface Position {
  id: string;
  ticker: string;
  name: string;
  lots: number;
  avgBuyPrice: number;
  currentPrice: number;
  suggestedSL: number;
  suggestedTP: number;
}

interface TransactionLog {
  id: string;
  ticker: string;
  type: 'BUY' | 'SELL';
  price: number;
  lots: number;
  pnl?: number;
  pnlPercent?: number;
  date: string;
}

export default function SimulationPage() {
  const [cashBalance, setCashBalance] = useState<number>(45000000); // Sisa Kas Rp 45 Juta
  const [positions, setPositions] = useState<Position[]>([
    {
      id: '1',
      ticker: 'BBCA',
      name: 'Bank Central Asia Tbk',
      lots: 33,
      avgBuyPrice: 9600,
      currentPrice: 9800,
      suggestedSL: 9550,
      suggestedTP: 10400
    },
    {
      id: '2',
      ticker: 'ASII',
      name: 'Astra International Tbk',
      lots: 50,
      avgBuyPrice: 5150,
      currentPrice: 5100,
      suggestedSL: 4950,
      suggestedTP: 5500
    }
  ]);

  const [history, setHistory] = useState<TransactionLog[]>([
    {
      id: 'h1',
      ticker: 'TLKM',
      type: 'SELL',
      price: 3200,
      lots: 50,
      pnl: 1500000,
      pnlPercent: 10.3,
      date: '2025-02-12'
    },
    {
      id: 'h2',
      ticker: 'BBNI',
      type: 'SELL',
      price: 5400,
      lots: 40,
      pnl: -600000,
      pnlPercent: -2.7,
      date: '2025-02-10'
    }
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  // Perhitungan Nilai Portofolio
  const totalStockValue = positions.reduce((acc, pos) => acc + (pos.lots * 100 * pos.currentPrice), 0);
  const totalPortfolioValue = cashBalance + totalStockValue;
  
  const totalCost = positions.reduce((acc, pos) => acc + (pos.lots * 100 * pos.avgBuyPrice), 0);
  const totalFloatingPnl = totalStockValue - totalCost;
  const floatingPnlPercent = totalCost > 0 ? (totalFloatingPnl / totalCost) * 100 : 0;

  // Eksekusi Jual Saham Simulasi
  const handleSellPosition = (pos: Position) => {
    const result = executeSimSell({
      currentBalance: cashBalance,
      avgBuyPrice: pos.avgBuyPrice,
      sellPrice: pos.currentPrice,
      lots: pos.lots,
      sellFeePercent: 0.25
    });

    if (result.success) {
      setCashBalance(result.newBalance);
      setPositions(positions.filter(p => p.id !== pos.id));

      const newLog: TransactionLog = {
        id: Date.now().toString(),
        ticker: pos.ticker,
        type: 'SELL',
        price: pos.currentPrice,
        lots: pos.lots,
        pnl: result.realizedPnl,
        pnlPercent: result.realizedPnlPercent,
        date: new Date().toISOString().split('T')[0]
      };
      setHistory([newLog, ...history]);

      setNotification(`Sukses menjual ${pos.lots} Lot ${pos.ticker}. Realized PnL: Rp ${result.realizedPnl.toLocaleString('id-ID')} (${result.realizedPnlPercent}%)`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 md:p-6 space-y-6 pb-20">
      
      {/* 1. Header Judul */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Portofolio Simulasi</h1>
        <p className="text-xs md:text-sm text-slate-400">
          Uji coba hasil sinyal BoW tanpa resiko uang sungguhan.
        </p>
      </div>

      {/* Banner Notifikasi */}
      {notification && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 2. Grid Statistik Kartu Ringkasan Akun */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Nilai Aset */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Nilai Aset</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg md:text-xl font-bold text-white">
            Rp {totalPortfolioValue.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Modal Awal: Rp 100.000.000</div>
        </div>

        {/* Saldo Kas Virtual */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Kas Tersedia (Cash)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Siap Beli</span>
          </div>
          <div className="text-lg md:text-xl font-bold text-slate-200">
            Rp {cashBalance.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Sisa dana untuk entry baru</div>
        </div>

        {/* Floating PnL */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Floating Profit/Loss</span>
            {totalFloatingPnl >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className={`text-lg md:text-xl font-bold ${totalFloatingPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalFloatingPnl >= 0 ? '+' : ''}Rp {totalFloatingPnl.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] font-semibold mt-1 text-slate-400">
            {floatingPnlPercent >= 0 ? '+' : ''}{floatingPnlPercent.toFixed(2)}% dari modal saham
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Win Rate Jurnal</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg md:text-xl font-bold text-amber-400">
            66.7%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">2 Menang / 1 Kalah</div>
        </div>
      </div>

      {/* 3. Daftar Posisi Saham yang Sedang Dipegang */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm md:text-base font-bold text-white">Posisi Saham Terbuka ({positions.length})</h2>
          <span className="text-xs text-slate-400">Terupdate harga harian terakhir</span>
        </div>

        {positions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs md:text-sm">
            Tidak ada saham yang sedang dipegang. Buka menu Scanner untuk mencari peluang BoW!
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {positions.map(pos => {
              const posCost = pos.lots * 100 * pos.avgBuyPrice;
              const posValue = pos.lots * 100 * pos.currentPrice;
              const pnl = posValue - posCost;
              const pnlPercent = (pnl / posCost) * 100;

              return (
                <div key={pos.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-800/40 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">{pos.ticker}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {pos.lots} Lot ({pos.lots * 100} Lembar)
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{pos.name}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Modal: <strong className="text-slate-300">Rp {pos.avgBuyPrice.toLocaleString('id-ID')}</strong></span>
                      <span>Harga Sekarang: <strong className="text-slate-300">Rp {pos.currentPrice.toLocaleString('id-ID')}</strong></span>
                    </div>
                  </div>

                  {/* PnL & Tombol Jual */}
                  <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-6">
                    <div className="text-right">
                      <div className={`text-sm md:text-base font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {pnl >= 0 ? '+' : ''}Rp {pnl.toLocaleString('id-ID')}
                      </div>
                      <div className={`text-xs font-semibold ${pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                      </div>
                    </div>

                    <button
                      onClick={() => handleSellPosition(pos)}
                      className="py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
                    >
                      Jual / TP
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Riwayat Jurnal Transaksi */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm md:text-base font-bold text-white">Riwayat Jurnal Transaksi</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Emiten</th>
                <th className="p-3">Aksi</th>
                <th className="p-3">Harga</th>
                <th className="p-3">Jumlah Lot</th>
                <th className="p-3 text-right">Realized PnL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {history.map(item => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-3 text-slate-400">{item.date}</td>
                  <td className="p-3 font-bold text-white">{item.ticker}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                      SELL
                    </span>
                  </td>
                  <td className="p-3">Rp {item.price.toLocaleString('id-ID')}</td>
                  <td className="p-3">{item.lots} Lot</td>
                  <td className={`p-3 text-right font-bold ${item.pnl && item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.pnl && item.pnl >= 0 ? '+' : ''}Rp {item.pnl?.toLocaleString('id-ID')} ({item.pnlPercent}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
