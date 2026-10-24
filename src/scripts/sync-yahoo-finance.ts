// File: src/scripts/sync-yahoo-finance.ts

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import yahooFinance from 'yahoo-finance2';
import { calculateBowScore } from '../lib/indicators/scoring';
import { Candle } from '../types/trading';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diisi!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Daftar Saham Default (Auto-Seed jika DB kosong)
const DEFAULT_INITIAL_STOCKS = [
  { symbol: 'BBCA.JK', ticker: 'BBCA', name: 'Bank Central Asia Tbk', sector: 'Financials', is_syariah: false, index_tags: ['LQ45', 'IDX30'] },
  { symbol: 'BBRI.JK', ticker: 'BBRI', name: 'Bank Rakyat Indonesia Tbk', sector: 'Financials', is_syariah: false, index_tags: ['LQ45', 'IDX30'] },
  { symbol: 'BMRI.JK', ticker: 'BMRI', name: 'Bank Mandiri (Persero) Tbk', sector: 'Financials', is_syariah: false, index_tags: ['LQ45', 'IDX30'] },
  { symbol: 'BBNI.JK', ticker: 'BBNI', name: 'Bank Negara Indonesia Tbk', sector: 'Financials', is_syariah: false, index_tags: ['LQ45', 'IDX30'] },
  { symbol: 'TLKM.JK', ticker: 'TLKM', name: 'Telkom Indonesia Tbk', sector: 'Infrastructure', is_syariah: true, index_tags: ['LQ45', 'IDX30'] },
  { symbol: 'ASII.JK', ticker: 'ASII', name: 'Astra International Tbk', sector: 'Industrials', is_syariah: true, index_tags: ['LQ45', 'IDX30'] },
  { symbol: 'UNTR.JK', ticker: 'UNTR', name: 'United Tractors Tbk', sector: 'Industrials', is_syariah: true, index_tags: ['LQ45', 'IDX30'] },
  { symbol: 'ICBP.JK', ticker: 'ICBP', name: 'Indofood CBP Sukses Makmur Tbk', sector: 'Consumer Goods', is_syariah: true, index_tags: ['LQ45', 'IDX30'] },
  { symbol: 'INDF.JK', ticker: 'INDF', name: 'Indofood Sukses Makmur Tbk', sector: 'Consumer Goods', is_syariah: true, index_tags: ['LQ45', 'IDX30'] },
  { symbol: 'BRIS.JK', ticker: 'BRIS', name: 'Bank Syariah Indonesia Tbk', sector: 'Financials', is_syariah: true, index_tags: ['LQ45'] },
];

async function runDailySync() {
  console.log('🚀 [START] Memulai Sinkronisasi EOD & Keep-Alive Supabase...');
  const startTime = Date.now();

  try {
    // 1. SUPABASE KEEP-ALIVE PING
    const { error: pingError } = await supabase.from('stocks').select('id').limit(1);
    if (pingError) throw pingError;
    console.log('🟢 Supabase Keep-Alive: Database terhubung aktif.');

    // 2. CEK APAKAH TABEL STOCKS KOSONG? JIKA KOSONG, LAKUKAN AUTO-SEED
    let { data: activeStocks, error: stockError } = await supabase
      .from('stocks')
      .select('*')
      .eq('is_active', true);

    if (stockError) throw stockError;

    if (!activeStocks || activeStocks.length === 0) {
      console.log('🌱 Database stocks masih kosong. Memulai Auto-Seed 10 saham utama BEI...');
      
      const seedData = DEFAULT_INITIAL_STOCKS.map(s => ({
        ...s,
        is_liquid: true,
        is_active: true,
        last_bow_score: 0
      }));

      const { data: seeded, error: seedError } = await supabase
        .from('stocks')
        .upsert(seedData, { onConflict: 'symbol' })
        .select();

      if (seedError) throw seedError;
      activeStocks = seeded;
      console.log(`✅ Berhasil melakukan Auto-Seed ${activeStocks.length} saham ke Supabase!`);
    }

    console.log(`📋 Memproses penarikan data untuk ${activeStocks.length} saham aktif...`);

    // 3. TARIK DATA 1 TAHUN DARI YAHOO FINANCE UNTUK SETIAP SAHAM
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    for (const stock of activeStocks) {
      console.log(`\n⏳ Mengambil candle 1 tahun ${stock.symbol} (${stock.name})...`);

      try {
        const result: any[] = await yahooFinance.historical(stock.symbol, {
          period1: oneYearAgo,
          interval: '1d'
        });

        if (!result || result.length === 0) {
          console.warn(`⚠️ Tidak ada candle untuk ${stock.symbol}`);
          continue;
        }

        const candles: Candle[] = result
          .filter(c => c.close !== null && c.close !== undefined)
          .map(c => ({
            time: new Date(c.date).toISOString().split('T')[0],
            open: Math.round(c.open ?? c.close),
            high: Math.round(c.high ?? c.close),
            low: Math.round(c.low ?? c.close),
            close: Math.round(c.close),
            volume: c.volume ?? 0
          }));

        // Hitung Skor BoW & Support/Resisten
        const bowAnalysis = calculateBowScore(candles);
        const lastCandle = candles[candles.length - 1];

        // 4. SIMPAN 60 CANDLE TERAKHIR KE TABEL stock_candles
        const recentCandles = candles.slice(-60).map(c => ({
          stock_id: stock.id,
          time: c.time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume: c.volume
        }));

        await supabase.from('stock_candles').upsert(recentCandles, { onConflict: 'stock_id, time' });

        // 5. UPDATE SKOR BoW & REKOMENDASI DI TABEL stocks
        await supabase
          .from('stocks')
          .update({
            last_bow_score: bowAnalysis.totalScore,
            last_close: lastCandle.close,
            suggested_entry: bowAnalysis.suggestedEntry,
            suggested_sl: bowAnalysis.suggestedSL,
            suggested_tp: bowAnalysis.suggestedTP,
            last_updated: new Date().toISOString()
          })
          .eq('id', stock.id);

        console.log(`✅ ${stock.symbol} Selesai! Skor BoW: ${bowAnalysis.totalScore} | Close: ${lastCandle.close} | SL: ${bowAnalysis.suggestedSL} | TP: ${bowAnalysis.suggestedTP}`);

        await delay(800);
      } catch (err: any) {
        console.error(`❌ Gagal pada ${stock.symbol}:`, err.message);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n🎉 [COMPLETE] Sinkronisasi seluruh candle bursa selesai dalam ${duration} detik.`);
  } catch (err: any) {
    console.error('🔥 Fatal Error pada worker:', err.message);
    process.exit(1);
  }
}

runDailySync();
