// File: src/app/api/stocks/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateBollingerBands } from '@/lib/indicators/bollinger';
import { calculateRSI } from '@/lib/indicators/scoring';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const revalidate = 0; // Data selalu up-to-date

export async function GET() {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase URL/Key belum dikonfigurasi di Environment Variable' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Ambil seluruh saham aktif dari master stocks
    const { data: stocks, error: stockErr } = await supabase
      .from('stocks')
      .select('*')
      .eq('is_active', true)
      .order('last_bow_score', { ascending: false });

    if (stockErr) throw stockErr;

    if (!stocks || stocks.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 2. Ambil seluruh candle (histori 3 tahun) untuk masing-masing emiten
    const formattedStocks = await Promise.all(
      stocks.map(async (stock) => {
        const { data: candleData } = await supabase
          .from('stock_candles')
          .select('time, open, high, low, close, volume')
          .eq('stock_id', stock.id)
          .order('time', { ascending: true }); // Mengambil data berurutan A-Z

        const candles = (candleData || []).map((c: any) => ({
          time: String(c.time),
          open: Number(c.open),
          high: Number(c.high),
          low: Number(c.low),
          close: Number(c.close),
          volume: Number(c.volume || 0),
        }));

        // Kalkulasi Persentase Kenaikan/Penurunan Riil Harian
        let lastClose = Number(stock.last_close) || 0;
        let changePercentStr = '+0.00%';
        let changeNominalStr = '+0';

        if (candles.length > 0) {
          const currentCandle = candles[candles.length - 1];
          lastClose = currentCandle.close;

          if (candles.length > 1) {
            const prevCandle = candles[candles.length - 2];
            const nominalDiff = currentCandle.close - prevCandle.close;
            const pctDiff = (nominalDiff / prevCandle.close) * 100;

            changeNominalStr = nominalDiff >= 0 ? `+${nominalDiff}` : `${nominalDiff}`;
            changePercentStr = `${pctDiff >= 0 ? '+' : ''}${pctDiff.toFixed(2)}%`;
          }
        }

        // Kalkulasi Indikator Riil (Bollinger Bands & RSI 14)
        let bollinger = { upper: [], middle: [], lower: [] };
        let rsiVal = 50;

        if (candles.length >= 20) {
          try {
            bollinger = calculateBollingerBands(candles, 20, 2);
          } catch (e) {
            // fallback
          }
        }

        if (candles.length >= 15) {
          try {
            const rsiArray = calculateRSI(candles, 14);
            if (rsiArray && rsiArray.length > 0) {
              rsiVal = Number(rsiArray[rsiArray.length - 1].value.toFixed(1));
            }
          } catch (e) {
            // fallback
          }
        }

        const score = Number(stock.last_bow_score) || 0;
        let action: 'BUY' | 'HOLD' | 'SELL' = 'HOLD';
        if (score >= 70) action = 'BUY';
        else if (score < 45) action = 'SELL';

        return {
          id: stock.id,
          ticker: stock.ticker,
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector || 'Umum',
          isSyariah: Boolean(stock.is_syariah),
          indexTags: stock.index_tags || ['LQ45'],
          isLiquid: Boolean(stock.is_liquid),
          bowScore: score,
          lastClose: lastClose,
          changePercent: changePercentStr,
          changeNominal: changeNominalStr,
          action: action,
          suggestedEntry: Number(stock.suggested_entry) || lastClose,
          suggestedSL: Number(stock.suggested_sl) || Math.floor(lastClose * 0.95),
          suggestedTP: Number(stock.suggested_tp) || Math.floor(lastClose * 1.08),
          rsi: rsiVal,
          macd: 'Reversal Uptrend',
          bollinger: bollinger,
          candles: candles, // Seluruh histori riil yang tersimpan
        };
      })
    );

    return NextResponse.json({ success: true, data: formattedStocks });
  } catch (error: any) {
    console.error('Error di /api/stocks:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
