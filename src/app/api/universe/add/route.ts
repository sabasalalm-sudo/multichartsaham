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
    const { ticker, userId } = await request.json();
    const cleanTicker = ticker?.trim().toUpperCase();

    if (!cleanTicker || cleanTicker.length < 4) {
      return NextResponse.json({ success: false, message: 'Kode ticker tidak valid' }, { status: 400 });
    }

    const symbol = `${cleanTicker}.JK`;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // 1. TARIK DATA 1 TAHUN SEKETIKA DARI YAHOO FINANCE
    const result: any[] = await yahooFinance.historical(symbol, {
      period1: oneYearAgo,
      interval: '1d',
    });

    if (!result || result.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: `Emiten ${cleanTicker} tidak ditemukan di bursa BEI / Yahoo Finance` 
      }, { status: 404 });
    }

    const candles: Candle[] = result
      .filter(c => c.close !== null)
      .map(c => ({
        time: new Date(c.date).toISOString().split('T')[0],
        open: Math.round(c.open ?? c.close),
        high: Math.round(c.high ?? c.close),
        low: Math.round(c.low ?? c.close),
        close: Math.round(c.close),
        volume: c.volume ?? 0,
      }));

    // 2. HITUNG SKOR BoW & REKOMENDASI SAAT ITU JUGA
    const bowAnalysis = calculateBowScore(candles);
    const lastCandle = candles[candles.length - 1];

    // 3. SIMPAN KE MASTER STOCKS & USER UNIVERSE SUPABASE (JIKA TERKONEKSI)
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Simpan/Update Master Saham
      const { data: stockData } = await supabase
        .from('stocks')
        .upsert({
          symbol: symbol,
          ticker: cleanTicker,
          name: `${cleanTicker} Indonesia Tbk`,
          is_active: true,
          last_bow_score: bowAnalysis.totalScore,
          last_close: lastCandle.close,
          suggested_entry: bowAnalysis.suggestedEntry,
          suggested_sl: bowAnalysis.suggestedSL,
          suggested_tp: bowAnalysis.suggestedTP,
          last_updated: new Date().toISOString()
        }, { onConflict: 'symbol' })
        .select()
        .single();

      // Simpan ke User Watchlist
      if (userId && stockData) {
        await supabase.from('user_universe').upsert({
          user_id: userId,
          stock_id: stockData.id,
        }, { onConflict: 'user_id, stock_id' });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Emiten ${cleanTicker} berhasil ditambahkan dan dianalisis seketika!`,
      data: {
        ticker: cleanTicker,
        lastClose: lastCandle.close,
        bowScore: bowAnalysis.totalScore,
        suggestedEntry: bowAnalysis.suggestedEntry,
        suggestedSL: bowAnalysis.suggestedSL,
        suggestedTP: bowAnalysis.suggestedTP,
        candles: candles.slice(-60),
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
