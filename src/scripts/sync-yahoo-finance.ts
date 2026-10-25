// File: src/scripts/sync-yahoo-finance.ts

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import yahooFinance from 'yahoo-finance2';
import { calculateBowScore } from '../lib/indicators/scoring';
import { Candle } from '../types/trading';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  console.log('🚀 [START] Memulai Sinkronisasi EOD 3 Tahun & Keep-Alive Supabase...');
  const startTime = Date.now();

  try {
    // 1. SUPABASE KEEP-ALIVE PING
    const { error: pingError } = await supabase.from('stocks').select('id').limit(1);
    if (pingError) throw pingError;
    console.log('🟢 Supabase Keep-Alive: Database terhubung.');

    // 2. CEK AUTO-SEED JIKA TABEL STOCKS KOSONG
    let { data: activeStocks, error: stockError } = await supabase
      .from('stocks')
      .select('*')
      .eq('is_active', true);

    if (stockError) throw stockError;

    if (!activeStocks || activeStocks.length === 0) {
      console.log('🌱 Melakukan Auto-Seed 10 emiten utama BEI...');
      const seedData = DEFAULT_INITIAL_STOCKS.map((s) => ({
        ...s,
        is_liquid: true,
        is_active: true,
        last_bow_score: 0,
      }));

      const { data: seeded, error: seedError } = await supabase
        .from('stocks')
        .upsert(seedData, { onConflict: 'symbol' })
        .select();

      if (seedError) throw seedError;
      activeStocks = seeded;
      console.log(`✅ Berhasil seed ${activeStocks.length} saham.`);
    }

    // 3. TARIK DATA 3 TAHUN DARI YAHOO FINANCE
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    for (const stock of activeStocks) {
      console.log(`\n⏳ Mengambil candle 3 tahun untuk ${stock.symbol} (${stock.name})...`);

      try {
        const result: any[] = await yahooFinance.historical(stock.symbol, {
          period1: threeYearsAgo,
          interval: '1d',
        });

        if (!result || result.length === 0) {
          console.warn(`⚠️ Tidak ada candle untuk ${stock.symbol}`);
          continue;
        }

        // Sanitasi dan urutkan secara kronologis (Ascending)
        const dateMap = new Map<string, Candle>();
        for (const item of result) {
          if (item.close === null || item.open === null || item.high === null || item.low === null) {
            continue;
          }
          const d = new Date(item.date);
          if (isNaN(d.getTime())) continue;

          const dateStr = d.toISOString().split('T')[0];
          dateMap.set(dateStr, {
            time: dateStr,
            open: Math.round(item.open),
            high: Math.round(item.high),
            low: Math.round(item.low),
            close: Math.round(item.close),
            volume: Number(item.volume || 0),
          });
        }

        const candles: Candle[] = Array.from(dateMap.values()).sort((a, b) =>
          (a.time as string).localeCompare(b.time as string)
        );

        if (candles.length === 0) continue;

        // Hitung BoW dan Level SL/TP
        const bowAnalysis = calculateBowScore(candles);
        const lastCandle = candles[candles.length - 1];

        // 4. SIMPAN BATCH SELURUH CANDLE 3 TAHUN KE stock_candles
        const candleRows = candles.map((c) => ({
          stock_id: stock.id,
          time: c.time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume: c.volume,
        }));

        const BATCH_SIZE = 250;
        for (let i = 0; i < candleRows.length; i += BATCH_SIZE) {
          const chunk = candleRows.slice(i, i + BATCH_SIZE);
          await supabase
            .from('stock_candles')
            .upsert(chunk, { onConflict: 'stock_id, time' });
        }

        // 5. UPDATE MASTER STOCKS DENGAN HARGA & SKOR TERBARU
        await supabase
          .from('stocks')
          .update({
            last_bow_score: bowAnalysis.totalScore,
            last_close: lastCandle.close,
            suggested_entry: bowAnalysis.suggestedEntry,
            suggested_sl: bowAnalysis.suggestedSL,
            suggested_tp: bowAnalysis.suggestedTP,
            last_updated: new Date().toISOString(),
          })
          .eq('id', stock.id);

        console.log(
          `✅ ${stock.symbol} Berhasil! (${candles.length} candle 3 tahun) | Close: ${lastCandle.close} | BoW: ${bowAnalysis.totalScore}`
        );

        await delay(600); // Mencegah throttling Yahoo Finance
      } catch (err: any) {
        console.error(`❌ Gagal pada ${stock.symbol}:`, err.message);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n🎉 [COMPLETE] Sinkronisasi data 3 tahun selesai dalam ${duration} detik.`);
  } catch (err: any) {
    console.error('🔥 Fatal Error sync worker:', err.message);
    process.exit(1);
  }
}

runDailySync();
