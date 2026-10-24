'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  LineChart,
  Layers,
  TrendingUp,
  BookOpen,
  Calendar,
  Settings,
  Search,
  Bell,
  Sparkles,
  ArrowUpRight,
  User,
  CheckCircle2,
  Moon,
  Sun,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(true);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Scanner BoW', href: '/', icon: LineChart },
    { name: 'Semesta Saham', href: '/universe', icon: Layers },
    { name: 'Simulasi Trading', href: '/simulation', icon: TrendingUp },
    { name: 'Jurnal Trading', href: '/simulation#jurnal', icon: BookOpen },
    { name: 'Kalender', href: '#', icon: Calendar },
    { name: 'Pengaturan', href: '#', icon: Settings },
  ];

  const marketIndices = [
    { name: 'IHSG', value: '7,245.32', change: '+1.28% (+91.32)', isUp: true },
    { name: 'LQ45', value: '902.17', change: '+1.12% (+10.05)', isUp: true },
    { name: 'IDX30', value: '432.76', change: '+1.34% (+5.74)', isUp: true },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-slate-100 flex font-sans antialiased overflow-x-hidden">
      
      {/* ========================================================= */}
      {/* 1. SIDEBAR NAVIGASI DESKTOP (Tersembunyi di Mobile)       */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex flex-col w-64 bg-brand-card border-r border-brand-border shrink-0 select-none">
        {/* Brand Logo */}
        <div className="p-5 border-b border-brand-border">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-glow-buy">
              <TrendingUp className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">BO-W</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Stock Scanner & Simulator</p>
            </div>
          </Link>
        </div>

        {/* Menu Navigasi Utama */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-brand-subtle'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Banner Upgrade ke PRO di Bawah Sidebar */}
        <div className="p-4 border-t border-brand-border">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/40 via-brand-subtle to-brand-card border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <h4 className="text-xs font-bold text-white">Upgrade ke PRO</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug mb-3">
              Dapatkan fitur lengkap untuk hasil trading yang lebih optimal.
            </p>
            <button className="w-full py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-glow-buy flex items-center justify-center gap-1">
              <span>Lihat Paket</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. AREA KONTEN UTAMA & HEADER ATAS                        */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-brand-bg/95 backdrop-blur-md border-b border-brand-border px-4 py-2.5">
          <div className="flex flex-col gap-2.5">
            
            {/* Baris Atas Header (Tagline, Theme Switch, Demo Badge) */}
            <div className="hidden lg:flex items-center justify-between text-xs border-b border-brand-border/60 pb-2">
              <div className="flex items-center gap-2 text-slate-400 font-medium">
                <span className="text-white font-semibold">Lihat banyak saham. Ambil keputusan lebih cepat.</span>
                <span className="text-slate-600">•</span>
                <span>Scanner</span>
                <span className="text-slate-600">•</span>
                <span>Chart Multi-Saham</span>
                <span className="text-slate-600">•</span>
                <span>Trading Simulator</span>
                <span className="text-slate-600">•</span>
                <span>Jurnal Trading</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Dark / Light Toggle Pill */}
                <div className="flex items-center bg-brand-card border border-brand-border rounded-full p-0.5 text-[11px] font-semibold text-slate-300">
                  <button
                    onClick={() => setIsDarkMode(true)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition ${
                      isDarkMode ? 'bg-brand-subtle text-emerald-400 shadow' : 'text-slate-400'
                    }`}
                  >
                    <Moon className="w-3 h-3" />
                    <span>Dark Mode</span>
                  </button>
                  <button
                    onClick={() => setIsDarkMode(false)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition ${
                      !isDarkMode ? 'bg-white text-slate-900 shadow' : 'text-slate-400'
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    <span>Light Mode</span>
                  </button>
                </div>

                {/* Status Demo App */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Demo App</span>
                  <span className="text-[10px] text-slate-400 font-normal">Data real-time (Demo)</span>
                </div>
              </div>
            </div>

            {/* Baris Bawah Header (Search, Indeks Pasar IHSG/LQ45/IDX30, Profil) */}
            <div className="flex items-center justify-between gap-3">
              
              {/* Kolom Pencarian Saham */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari saham, ticker, atau sektor..."
                  className="w-full bg-brand-card border border-brand-border rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Ticker Indeks Pasar Saham (IHSG, LQ45, IDX30) */}
              <div className="hidden sm:flex items-center gap-2">
                {marketIndices.map((idx) => (
                  <div
                    key={idx.name}
                    className="flex flex-col bg-brand-card border border-brand-border rounded-xl px-3 py-1.5 min-w-[110px]"
                  >
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">{idx.name}</span>
                    <span className="text-xs font-bold text-white">{idx.value}</span>
                    <span className="text-[10px] font-semibold text-emerald-400">{idx.change}</span>
                  </div>
                ))}
              </div>

              {/* User Dropdown / Notification Area */}
              <div className="flex items-center gap-2 shrink-0">
                <button className="p-2 rounded-xl bg-brand-card border border-brand-border text-slate-400 hover:text-white transition">
                  <Bell className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-brand-card border border-brand-border">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-white leading-none">Demo User</p>
                    <span className="text-[10px] text-emerald-400 font-medium">Free Plan</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </header>

        {/* Konten Halaman Aktif (Children) */}
        <main className="flex-1 p-3 lg:p-4 min-w-0">
          {children}
        </main>
      </div>

      {/* ========================================================= */}
      {/* 3. MOBILE BOTTOM NAVIGATION (Khusus Android/iOS Screen)   */}
      {/* ========================================================= */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-card/95 backdrop-blur-md border-t border-brand-border px-3 py-2 flex items-center justify-around">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            pathname === '/' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Beranda</span>
        </Link>

        <Link
          href="/"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            pathname === '/' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <LineChart className="w-5 h-5" />
          <span>Scanner</span>
        </Link>

        <Link
          href="/universe"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            pathname === '/universe' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>Semesta</span>
        </Link>

        <Link
          href="/simulation"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            pathname === '/simulation' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>Jurnal</span>
        </Link>

        <Link
          href="/profile"
          className="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white"
        >
          <User className="w-5 h-5" />
          <span>Profil</span>
        </Link>
      </nav>

    </div>
  );
}
