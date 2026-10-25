// File: src/app/api/universe/add/route.ts

import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
import { createClient } from '@supabase/supabase-js';
import { calculateBowScore } from '@/lib/indicators/scoring';
import { Candle } from '@/types/trading';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticker, userId } = body;
    const cleanTicker = ticker?.trim().toUpperCase();

    if (!cleanTicker || cleanTicker.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Kode ticker saham tidak valid' },
        { status: 400 }
      );
    }

    const symbol = `${cleanTicker}.JK`;

    // 1. TENTUKAN RENTANG WAKTU 3 TAHUN KE BELAKANG HINGGA HARI INI
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    // 2. AMBIL HISTORI CANDLE 3 TAHUN SECARA PARALEL DENGAN DETAIL PROFIL EMITEN
    const [historicalData, quoteData] = await Promise.all([
      yahooFinance.historical(symbol, {
        period1: threeYearsAgo,
        interval: '1d',
      }).catch((err) => {
        console.error(`Gagal mengambil data histori ${symbol}:`, err.message);
        return null;
      }),
      yahooFinance.quote(symbol).catch(() => null),
    ]);

    if (!historicalData || historicalData.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Emiten ${cleanTicker} tidak ditemukan di Bursa Efek Indonesia (Yahoo Finance). Pastikan kode ticker benar.`,
        },
        { status: 404 }
      );
    }

    // 3. SANITASI DATA CANDLE 3 TAHUN (Standarisasi Tanggal YYYY-MM-DD & Rounding Rupiah)
    const validMap = new Map<string, Candle>();

    for (const item of historicalData) {
      if (item.close === null || item.open === null || item.high === null || item.low === null) {
        continue;
      }

      const d = new Date(item.date);
      if (isNaN(d.getTime())) continue;

      const dateStr = d.toISOString().split('T')[0];
      validMap.set(dateStr, {
        time: dateStr,
        open: Math.round(item.open),
        high: Math.round(item.high),
        low: Math.round(item.low),
        close: Math.round(item.close),
        volume: Number(item.volume || 0),
      });
    }

    // Urutkan data secara kronologis (Ascending A-Z)
    const candles: Candle[] = Array.from(validMap.values()).sort((a, b) =>
      (a.time as string).localeCompare(b.time as string)
    );

    if (candles.length === 0) {
      return NextResponse.json(
        { success: false, message: `Data transaksi untuk ${cleanTicker} kosong.` },
        { status: 400 }
      );
    }

    // 4. HITUNG SKOR BUY ON WEAKNESS (BoW), SUPPORT, DAN TARGET RESISTEN
    const bowAnalysis = calculateBowScore(candles);
    const lastCandle = candles[candles.length - 1];

    // Ambil nama resmi emiten dari quote Yahoo Finance jika tersedia
    const companyName =
      quoteData?.longName ||
      quoteData?.shortName ||
      `${cleanTicker} Tbk`;

    // 5. SIMPAN KE DATABASE POSTGRESQL SUPABASE (SHARED POOL + CANDLES + USER WATCHLIST)
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // A. Upsert ke Master Tabel 'stocks'
      const { data: stockData, error: stockError } = await supabase
        .from('stocks')
        .upsert(
          {
            symbol: symbol,
            ticker: cleanTicker,
            name: companyName,
            is_active: true,
            is_liquid: true,
            last_bow_score: bowAnalysis.totalScore,
            last_close: lastCandle.close,
            suggested_entry: bowAnalysis.suggestedEntry,
            suggested_sl: bowAnalysis.suggestedSL,
            suggested_tp: bowAnalysis.suggestedTP,
            last_updated: new Date().toISOString(),
          },
          { onConflict: 'symbol' }
        )
        .select()
        .single();

      if (stockError) {
        console.error('Error upsert master stock:', stockError.message);
      }

      if (stockData?.id) {
        // B. BATCH UPSERT DATA CANDLE 3 TAHUN KE 'stock_candles' (Batch per 200 baris agar aman dari limit payload)
        const candleRows = candles.map((c) => ({
          stock_id: stockData.id,
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
          const { error: candleError } = await supabase
            .from('stock_candles')
            .upsert(chunk, { onConflict: 'stock_id, time' });

          if (candleError) {
            console.error(`Gagal batch simpan candle batch ${i}:`, candleError.message);
          }
        }

        // C. Simpan ke Tabel 'user_universe' jika ada userId (Watchlist Pengguna)
        if (userId) {
          await supabase.from('user_universe').upsert(
            {
              user_id: userId,
              stock_id: stockData.id,
              added_at: new Date().toISOString(),
            },
            { onConflict: 'user_id, stock_id' }
          );
        }
      }
    }

    // 6. KEMBALIKAN DATA LENGKAP 3 TAHUN UNTUK RENDERING LANGSUNG PADA MULTI-CHART
    return NextResponse.json({
      success: true,
      message: `Emiten ${cleanTicker} (${candles.length} candle 3 tahun) berhasil disinkronkan!`,
      data: {
        ticker: cleanTicker,
        name: companyName,
        symbol: symbol,
        lastClose: lastCandle.close,
        bowScore: bowAnalysis.totalScore,
        suggestedEntry: bowAnalysis.suggestedEntry,
        suggestedSL: bowAnalysis.suggestedSL,
        suggestedTP: bowAnalysis.suggestedTP,
        candles: candles, // Mengirimkan seluruh histori 3 tahun lengkap
      },
    });
  } catch (error: any) {
    console.error('Error in /api/universe/add:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error saat mengambil data emiten' },
      { status: 500 }
    );
  }
}
