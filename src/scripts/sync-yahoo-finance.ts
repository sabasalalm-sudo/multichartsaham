import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import yahooFinance from 'yahoo-finance2';
import { calculateBowScore } from '../lib/indicators/scoring';
import { Candle } from '../types/trading';

// Menggunakan Service Role Key untuk bypass RLS (karena ini worker internal)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diisi!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Fungsi pembantu jeda waktu (mencegah blokir rate limit dari Yahoo)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runDailySync() {
  console.log('🚀 [START] Memulai Sinkronisasi EOD & Keep-Alive Supabase...');
  const startTime = Date.now();

  try {
    // 1. SUPABASE KEEP-ALIVE PING
    const { error: pingError } = await supabase.from('stocks').select('id').limit(1);
    if (pingError) throw pingError;
    console.log('🟢 Supabase Keep-Alive: Database aktif.');

    // 2. AMBIL DAFTAR SAHAM AKTIF
    const { data: activeStocks, error: stockError } = await supabase
      .from('stocks')
      .select('*')
      .eq('is_active', true);

    if (stockError) throw stockError;

    if (!activeStocks || activeStocks.length === 0) {
      console.log('ℹ️ Tidak ada saham yang aktif dipantau. Selesai.');
      return;
    }

    console.log(`📋 Ditemukan ${activeStocks.length} saham aktif untuk diproses.`);

    // 3. PROSES SETIAP SAHAM SATU PER SATU
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    for (const stock of activeStocks) {
      console.log(`\n⏳ Memproses ${stock.symbol} (${stock.name})...`);

      try {
        // Ambil data dari Yahoo Finance (contoh symbol: BBCA.JK)
        const result: any[] = await yahooFinance.historical(stock.symbol, {
          period1: oneYearAgo,
          interval: '1d'
        });

        if (!result || result.length === 0) {
          console.warn(`⚠️ Data tidak ditemukan untuk ${stock.symbol}`);
          continue;
        }

        // Format data menjadi struktur Candle kita
        const candles: Candle[] = result
          .filter(c => c.close !== null && c.close !== undefined)
          .map(c => ({
            time: new Date(c.date).toISOString().split('T')[0],
            open: c.open ?? c.close,
            high: c.high ?? c.close,
            low: c.low ?? c.close,
            close: c.close,
            volume: c.volume ?? 0
          }));

        // Hitung Skor BoW menggunakan modul logika Sesi 2
        const bowAnalysis = calculateBowScore(candles);
        const lastCandle = candles[candles.length - 1];

        // 4. SIMPAN HISTORI CANDLE TERBARU (Hanya 30 hari terakhir agar cepat)
        const recentCandles = candles.slice(-30).map(c => ({
          stock_id: stock.id,
          time: c.time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume: c.volume
        }));

        await supabase.from('stock_candles').upsert(recentCandles, { onConflict: 'stock_id, time' });

        // 5. UPDATE SKOR & SARAN ENTRY DI TABEL STOCKS
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

        console.log(`✅ ${stock.symbol} Sukses! Skor BoW: ${bowAnalysis.totalScore} | Close: ${lastCandle.close}`);

        // Beri jeda 800ms antar saham agar ramah API
        await delay(800);
      } catch (err: any) {
        console.error(`❌ Gagal memproses ${stock.symbol}:`, err.message);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n🎉 [COMPLETE] Seluruh sinkronisasi selesai dalam ${duration} detik.`);
  } catch (err: any) {
    console.error('🔥 Fatal Error pada worker:', err.message);
    process.exit(1);
  }
}

runDailySync();
