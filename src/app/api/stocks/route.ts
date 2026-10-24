// File: src/app/api/stocks/route.ts

import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
import { calculateBowScore, calculateRSI } from '@/lib/indicators/scoring';
import { calculateBollingerBands } from '@/lib/indicators/bollinger';
import { Candle } from '@/types/trading';

// Daftar 10 Saham Utama IDX untuk Scanner BoW
const DEFAULT_WATCHLIST = [
  { ticker: 'BBCA', name: 'Bank Central Asia Tbk', sector: 'Perbankan', isSyariah: false, tags: ['LQ45', 'IDX30'] },
  { ticker: 'TLKM', name: 'Telkom Indonesia Tbk', sector: 'Telekomunikasi', isSyariah: true, tags: ['LQ45', 'IDX30'] },
  { ticker: 'BMRI', name: 'Bank Mandiri (Persero) Tbk', sector: 'Perbankan', isSyariah: false, tags: ['LQ45', 'IDX30'] },
  { ticker: 'BBRI', name: 'Bank Rakyat Indonesia Tbk', sector: 'Perbankan', isSyariah: false, tags: ['LQ45', 'IDX30'] },
  { ticker: 'ASII', name: 'Astra International Tbk', sector: 'Otomotif & Industri', isSyariah: true, tags: ['LQ45'] },
  { ticker: 'UNTR', name: 'United Tractors Tbk', sector: 'Alat Berat & Tambang', isSyariah: true, tags: ['LQ45'] },
  { ticker: 'ICBP', name: 'Indofood CBP Tbk', sector: 'Consumer Goods', isSyariah: true, tags: ['LQ45'] },
  { ticker: 'INDF', name: 'Indofood Sukses Makmur', sector: 'Consumer Goods', isSyariah: true, tags: ['LQ45'] },
  { ticker: 'BBNI', name: 'Bank Negara Indonesia', sector: 'Perbankan', isSyariah: false, tags: ['LQ45'] },
  { ticker: 'BRIS', name: 'Bank Syariah Indonesia', sector: 'Perbankan Syariah', isSyariah: true, tags: ['LQ45'] }
];

export const revalidate = 60; // Cache 60 detik agar hemat bandwidth

export async function GET() {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Ambil histori Yahoo Finance untuk semua emiten
    const stockPromises = DEFAULT_WATCHLIST.map(async (stock) => {
      try {
        const symbol = `${stock.ticker}.JK`;
        const result: any[] = await yahooFinance.historical(symbol, {
          period1: oneYearAgo,
          interval: '1d',
        });

        if (!result || result.length === 0) return null;

        const candles: Candle[] = result
          .filter(c => c.close !== null && c.close !== undefined)
          .map(c => ({
            time: new Date(c.date).toISOString().split('T')[0],
            open: Math.round(c.open ?? c.close),
            high: Math.round(c.high ?? c.close),
            low: Math.round(c.low ?? c.close),
            close: Math.round(c.close),
            volume: c.volume ?? 0,
          }));

        if (candles.length < 2) return null;

        // Kalkulasi Matematis Sesuai Blueprint
        const bowAnalysis = calculateBowScore(candles);
        const bollinger = calculateBollingerBands(candles);
        const rsiSeries = calculateRSI(candles);
        const currentRsi = rsiSeries.length > 0 ? Number(rsiSeries[rsiSeries.length - 1].toFixed(1)) : 50;

        const lastCandle = candles[candles.length - 1];
        const prevCandle = candles[candles.length - 2];
        const nominalChange = lastCandle.close - prevCandle.close;
        const percentChange = ((nominalChange / prevCandle.close) * 100).toFixed(2);

        // Tentukan Action Label
        let action: 'BUY' | 'HOLD' | 'SELL' = 'HOLD';
        if (bowAnalysis.totalScore >= 70) action = 'BUY';
        else if (bowAnalysis.totalScore < 45) action = 'SELL';

        return {
          id: stock.ticker,
          ticker: stock.ticker,
          name: stock.name,
          sector: stock.sector,
          isSyariah: stock.isSyariah,
          indexTags: stock.tags,
          isLiquid: true,
          bowScore: bowAnalysis.totalScore,
          lastClose: lastCandle.close,
          changePercent: `${nominalChange >= 0 ? '+' : ''}${percentChange}%`,
          changeNominal: `${nominalChange >= 0 ? '+' : ''}${nominalChange}`,
          action,
          suggestedEntry: bowAnalysis.suggestedEntry,
          suggestedSL: bowAnalysis.suggestedSL,
          suggestedTP: bowAnalysis.suggestedTP,
          rsi: currentRsi,
          macd: '1.2, 0.8, 0.4',
          candles: candles.slice(-60), // Kirim 60 candle terakhir untuk grafik
          bollinger: {
            upper: bollinger.upper.slice(-60),
            middle: bollinger.middle.slice(-60),
            lower: bollinger.lower.slice(-60),
          }
        };
      } catch (e) {
        console.error(`Gagal fetch ${stock.ticker}:`, e);
        return null;
      }
    });

    const results = await Promise.all(stockPromises);
    const validStocks = results.filter(Boolean);

    // Urutkan dari Skor BoW tertinggi
    validStocks.sort((a: any, b: any) => b.bowScore - a.bowScore);

    return NextResponse.json({ success: true, data: validStocks });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
