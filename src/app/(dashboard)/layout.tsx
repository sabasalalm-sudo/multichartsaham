'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LineChart, WalletCards, ShieldCheck } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. Header Navbar Utama */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Judul App */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm md:text-base text-white tracking-wide">BoW Scanner</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                BEI Daily
              </span>
            </div>
          </div>

          {/* Menu Tab Navigasi */}
          <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                pathname === '/'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Scanner</span>
            </Link>

            <Link
              href="/simulation"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                pathname === '/simulation'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <WalletCards className="w-3.5 h-3.5" />
              <span>Simulasi</span>
            </Link>
          </nav>

        </div>
      </header>

      {/* 2. Konten Halaman Aktif */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
