// File: src/app/(dashboard)/simulation/page.tsx

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { executeSimSell } from '@/lib/trading/simulationEngine';
import { 
  ArrowLeft, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  History, 
  CheckCircle2, 
  Plus 
} from 'lucide-react';

interface Position {
  id: string;
  ticker: string;
  name: string;
  lots: number;
  avgBuyPrice: number;
  currentPrice: number;
  allocationPercent: number;
}

interface TransactionLog {
  id: string;
  ticker: string;
  type: 'BUY' | 'SELL';
  price: number;
  lots: number;
  pnl?: number;
  time: string;
  date: string;
}

export default function SimulationPage() {
  const [activeTab, setActiveTab] = useState<'portofolio' | 'posisi' | 'jurnal'>('portofolio');
  const [cashBalance, setCashBalance] = useState<number>(50000000); // Rp 50.000.000
  const [positions, setPositions] = useState<Position[]>([
    {
      id: '1',
      ticker: 'BBCA',
      name: 'Bank Central Asia Tbk',
      lots: 20,
      avgBuyPrice: 8950,
      currentPrice: 9200,
      allocationPercent: 35,
    },
    {
      id: '2',
      ticker: 'TLKM',
      name: 'Telkom Indonesia Tbk',
      lots: 32,
      avgBuyPrice: 3800,
      currentPrice: 3890,
      allocationPercent: 25,
    },
    {
      id: '3',
      ticker: 'BMRI',
      name: 'Bank Mandiri Tbk',
      lots: 16,
      avgBuyPrice: 6300,
      currentPrice: 6450,
      allocationPercent: 20,
    }
  ]);

  const [history, setHistory] = useState<TransactionLog[]>([
    { id: '1', ticker: 'BBCA', type: 'BUY', lots: 100, price: 8950, pnl: 420000, time: '09:45', date: '15 Apr 2025' },
    { id: '2', ticker: 'TLKM', type: 'SELL', lots: 50, price: 6200, pnl: -75000, time: '14:16', date: '14 Apr 2025' },
    { id: '3', ticker: 'BMRI', type: 'BUY', lots: 80, price: 6200, pnl: 240000, time: '11:33', date: '12 Apr 2025' },
    { id: '4', ticker: 'ASII', type: 'SELL', lots: 30, price: 5800, pnl: -124000, time: '09:45', date: '10 Apr 2025' },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  // Total Nilai Portofolio & Keuntungan
  const totalStockValue = positions.reduce((acc, pos) => acc + (pos.lots * 100 * pos.currentPrice), 0);
  const totalPortfolioValue = cashBalance + totalStockValue;
  const initialCapital = 50000000;
  const totalGain = totalPortfolioValue - initialCapital;
  const totalGainPercent = ((totalGain / initialCapital) * 100).toFixed(2);

  // Eksekusi Jual Posisi Simulasi
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
        time: '15:15',
        date: 'Hari Ini'
      };
      setHistory([newLog, ...history]);
      setNotification(`Sukses menjual ${pos.lots} Lot ${pos.ticker}. Realized: Rp ${result.realizedPnl.toLocaleString('id-ID')}`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-12">
      
      {/* Header Bar Sesuai Referensi ("← Simulasi Trading") */}
      <div className="flex items-center justify-between pb-2 border-b border-brand-border">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1 text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-base font-extrabold text-white">Simulasi Trading</h1>
        </div>
      </div>

      {/* Tabs Segmented: Portofolio | Posisi Terbuka | Jurnal */}
      <div className="grid grid-cols-3 p-1 bg-brand-bg rounded-xl border border-brand-border text-xs font-bold text-center">
        {(['portofolio', 'posisi', 'jurnal'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-1.5 rounded-lg capitalize transition ${
              activeTab === tab
                ? 'bg-brand-subtle text-white border border-brand-border shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'portofolio' ? 'Portofolio' : tab === 'posisi' ? 'Posisi Terbuka' : 'Jurnal'}
          </button>
        ))}
      </div>

      {/* Banner Notifikasi */}
      {notification && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: PORTOFOLIO & ALOKASI ASET (Sesuai Layar Mobile ke-3)     */}
      {/* ============================================================== */}
      {activeTab === 'portofolio' && (
        <div className="space-y-4">
          {/* Card Saldo & Keuntungan */}
          <div className="p-4 bg-brand-card rounded-2xl border border-brand-border shadow-glow-panel">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Saldo Virtual</span>
                <span className="text-xl font-black text-white">
                  Rp {cashBalance.toLocaleString('id-ID')}
                </span>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                +{totalGainPercent}%
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Total Nilai Portofolio</span>
                <span className="font-bold text-white">Rp {totalPortfolioValue.toLocaleString('id-ID')}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Keuntungan</span>
                <span className="font-bold text-emerald-400">
                  {totalGain >= 0 ? '+' : ''}Rp {totalGain.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Card Donut Chart & Alokasi Aset */}
          <div className="p-4 bg-brand-card rounded-2xl border border-brand-border shadow-glow-panel">
            <h3 className="text-xs font-bold text-slate-300 mb-4">Alokasi Aset</h3>

            <div className="flex items-center justify-around gap-4">
              {/* Donut Visual Indicator (83% Terinvestasi) */}
              <div className="relative flex items-center justify-center w-24 h-24">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-brand-subtle stroke-current"
                    strokeWidth="3.8"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500 stroke-current"
                    strokeDasharray="83, 100"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-sm font-black text-white">83%</span>
                </div>
              </div>

              {/* Legend Alokasi */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-300 font-medium">BBCA</span>
                  <span className="text-slate-400 ml-auto font-bold">35%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                  <span className="text-slate-300 font-medium">TLKM</span>
                  <span className="text-slate-400 ml-auto font-bold">25%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-slate-300 font-medium">BMRI</span>
                  <span className="text-slate-400 ml-auto font-bold">20%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                  <span className="text-slate-300 font-medium">Lainnya</span>
                  <span className="text-slate-400 ml-auto font-bold">20%</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA: Trading Baru */}
          <Link
            href="/"
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-glow-buy transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Trading Baru</span>
          </Link>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: POSISI TERBUKA                                          */}
      {/* ============================================================== */}
      {activeTab === 'posisi' && (
        <div className="space-y-2.5">
          {positions.map(pos => {
            const cost = pos.lots * 100 * pos.avgBuyPrice;
            const currentVal = pos.lots * 100 * pos.currentPrice;
            const pnl = currentVal - cost;
            const pnlPercent = (pnl / cost) * 100;

            return (
              <div
                key={pos.id}
                className="p-3.5 bg-brand-card rounded-2xl border border-brand-border flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">{pos.ticker}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-subtle text-slate-400">
                      {pos.lots} lot
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Avg: Rp {pos.avgBuyPrice.toLocaleString('id-ID')}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`text-xs font-black block ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pnl >= 0 ? '+' : ''}Rp {pnl.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                    </span>
                  </div>

                  <button
                    onClick={() => handleSellPosition(pos)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition"
                  >
                    Jual
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: JURNAL TRANSAKSI (Sesuai Layar Mobile ke-5)              */}
      {/* ============================================================== */}
      {activeTab === 'jurnal' && (
        <div className="space-y-3">
          <div className="space-y-2">
            {history.map(item => (
              <div
                key={item.id}
                className="p-3 bg-brand-card rounded-2xl border border-brand-border flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">{item.date} • {item.time}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-white">{item.ticker}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                        item.type === 'BUY'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {item.lots} lot @ {item.price.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-black ${
                      (item.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {(item.pnl || 0) >= 0 ? '+' : ''}Rp {item.pnl?.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
