// File: src/components/charts/LightweightChart.tsx

'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  LineStyle,
  CrosshairMode,
  UTCTimestamp,
} from 'lightweight-charts';
import { Candle } from '@/types/trading';

interface BollingerPoint {
  time: string;
  value: number;
}

interface LightweightChartProps {
  ticker?: string;
  candles: Candle[];
  bollinger?: {
    upper: BollingerPoint[];
    middle: BollingerPoint[];
    lower: BollingerPoint[];
  };
  supportPrice?: number;
  resistancePrice?: number;
  height?: number;
  showVolume?: boolean;
  showMA?: boolean;
  showBollinger?: boolean;
}

interface BarHoverInfo {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  changePercent: number;
}

// Helper: Normalisasi format waktu ke YYYY-MM-DD standar bursa
function formatTimeToDateStr(timeVal: string | number | Date): string {
  if (typeof timeVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(timeVal)) {
    return timeVal;
  }
  const d = new Date(timeVal);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Helper: Kalkulasi Simple Moving Average (SMA)
function calculateSMA(data: { time: string; close: number }[], period: number) {
  const result: { time: string; value: number }[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({
      time: data[i].time,
      value: Number((sum / period).toFixed(2)),
    });
  }
  return result;
}

export default function LightweightChart({
  ticker = '',
  candles,
  bollinger,
  supportPrice,
  resistancePrice,
  height = 360,
  showVolume = true,
  showMA = true,
  showBollinger = true,
}: LightweightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const [hoverData, setHoverData] = useState<BarHoverInfo | null>(null);

  // 1. Sanitasi Data: Filter Nilai Valid, Deduplikasi Tanggal, & Urutkan Kronologis (Ascending)
  const sanitizedCandles = useMemo(() => {
    if (!candles || candles.length === 0) return [];

    const mapByDate = new Map<string, Candle>();

    for (const c of candles) {
      if (
        c.open === null ||
        c.high === null ||
        c.low === null ||
        c.close === null ||
        isNaN(c.open) ||
        isNaN(c.close)
      ) {
        continue;
      }

      const dateStr = formatTimeToDateStr(c.time);
      if (!dateStr) continue;

      mapByDate.set(dateStr, {
        time: dateStr,
        open: Number(c.open),
        high: Number(c.high),
        low: Number(c.low),
        close: Number(c.close),
        volume: Number(c.volume || 0),
      });
    }

    return Array.from(mapByDate.values()).sort((a, b) =>
      (a.time as string).localeCompare(b.time as string)
    );
  }, [candles]);

  // Siapkan data MA (5, 50, 200) mirip Stockbit
  const ma5Data = useMemo(() => {
    if (!showMA || sanitizedCandles.length < 5) return [];
    return calculateSMA(sanitizedCandles as any, 5);
  }, [sanitizedCandles, showMA]);

  const ma50Data = useMemo(() => {
    if (!showMA || sanitizedCandles.length < 50) return [];
    return calculateSMA(sanitizedCandles as any, 50);
  }, [sanitizedCandles, showMA]);

  const ma200Data = useMemo(() => {
    if (!showMA || sanitizedCandles.length < 200) return [];
    return calculateSMA(sanitizedCandles as any, 200);
  }, [sanitizedCandles, showMA]);

  // Setup default data header terakhir
  const lastBarInfo = useMemo<BarHoverInfo | null>(() => {
    if (sanitizedCandles.length === 0) return null;
    const last = sanitizedCandles[sanitizedCandles.length - 1];
    const prev = sanitizedCandles.length > 1 ? sanitizedCandles[sanitizedCandles.length - 2] : null;
    const change = prev ? ((last.close - prev.close) / prev.close) * 100 : 0;
    return {
      time: String(last.time),
      open: last.open,
      high: last.high,
      low: last.low,
      close: last.close,
      volume: last.volume || 0,
      changePercent: change,
    };
  }, [sanitizedCandles]);

  useEffect(() => {
    if (!chartContainerRef.current || sanitizedCandles.length === 0) return;

    // Bersihkan canvas lama jika ada
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;

    // 2. Inisialisasi Canvas Charting Pro ala Stockbit
    const chart = createChart(container, {
      width: container.clientWidth || 600,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: '#080D1A' },
        textColor: '#64748B',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(30, 45, 74, 0.4)', style: LineStyle.Solid },
        horzLines: { color: 'rgba(30, 45, 74, 0.4)', style: LineStyle.Solid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: 'rgba(56, 189, 248, 0.5)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#1E2D4A',
        },
        horzLine: {
          color: 'rgba(56, 189, 248, 0.5)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#1E2D4A',
        },
      },
      timeScale: {
        borderColor: '#1E2D4A',
        timeVisible: false,
        fixLeftEdge: false,
        fixRightEdge: false,
        rightOffset: 8,
        barSpacing: 9,
        minBarSpacing: 3,
      },
      rightPriceScale: {
        borderColor: '#1E2D4A',
        scaleMargins: {
          top: 0.1,
          bottom: 0.25, // Memberi ruang bawah untuk indikator volume
        },
        autoScale: true,
      },
    });

    chartRef.current = chart;

    // 3. Tambahkan Candlestick Series (Standar IDX: Hijau Naik, Merah Turun)
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00D084',
      downColor: '#F43F5E',
      borderVisible: true,
      borderUpColor: '#00D084',
      borderDownColor: '#F43F5E',
      wickUpColor: '#00D084',
      wickDownColor: '#F43F5E',
      priceFormat: {
        type: 'price',
        precision: 0,
        minMove: 1,
      },
    });
    candleSeriesRef.current = candleSeries;

    candleSeries.setData(
      sanitizedCandles.map((c) => ({
        time: c.time as string,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    // 4. Tambahkan Volume Series di Lapisan Bawah (Overlay ala Stockbit)
    if (showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: { type: 'volume' },
        priceScaleId: '', // Buat scale independen overlay
      });

      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8, // 20% area bawah untuk volume
          bottom: 0,
        },
      });

      const volumeData = sanitizedCandles.map((c) => ({
        time: c.time as string,
        value: c.volume || 0,
        color: c.close >= c.open ? 'rgba(0, 208, 132, 0.35)' : 'rgba(244, 63, 94, 0.35)',
      }));

      volumeSeries.setData(volumeData);
    }

    // 5. Tambahkan Indikator Moving Average (MA 5, MA 50, MA 200)
    if (showMA) {
      if (ma5Data.length > 0) {
        const ma5Series = chart.addLineSeries({
          color: '#38BDF8', // Cyan muda (MA 5)
          lineWidth: 1,
          crosshairMarkerVisible: false,
          title: 'MA 5',
        });
        ma5Series.setData(ma5Data);
      }

      if (ma50Data.length > 0) {
        const ma50Series = chart.addLineSeries({
          color: '#3B82F6', // Biru laut (MA 50)
          lineWidth: 1,
          crosshairMarkerVisible: false,
          title: 'MA 50',
        });
        ma50Series.setData(ma50Data);
      }

      if (ma200Data.length > 0) {
        const ma200Series = chart.addLineSeries({
          color: '#94A3B8', // Abu-abu gelap (MA 200)
          lineWidth: 1.5,
          crosshairMarkerVisible: false,
          title: 'MA 200',
        });
        ma200Series.setData(ma200Data);
      }
    }

    // 6. Bollinger Bands Overlay
    if (showBollinger && bollinger && bollinger.middle.length > 0) {
      const upperSeries = chart.addLineSeries({
        color: 'rgba(56, 189, 248, 0.6)',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        title: 'Upper BB',
      });
      upperSeries.setData(bollinger.upper);

      const middleSeries = chart.addLineSeries({
        color: 'rgba(245, 158, 11, 0.8)',
        lineWidth: 1,
        title: 'SMA 20',
      });
      middleSeries.setData(bollinger.middle);

      const lowerSeries = chart.addLineSeries({
        color: 'rgba(56, 189, 248, 0.6)',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        title: 'Lower BB',
      });
      lowerSeries.setData(bollinger.lower);
    }

    // 7. Garis SL & TP (Price Line)
    if (supportPrice && supportPrice > 0) {
      candleSeries.createPriceLine({
        price: supportPrice,
        color: '#F43F5E',
        lineWidth: 1.5,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `SL ${supportPrice.toLocaleString('id-ID')}`,
      });
    }

    if (resistancePrice && resistancePrice > 0) {
      candleSeries.createPriceLine({
        price: resistancePrice,
        color: '#00D084',
        lineWidth: 1.5,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `TP ${resistancePrice.toLocaleString('id-ID')}`,
      });
    }

    // 8. Tampilan Awal: Fokus pada 70 candle terakhir (TIDAK fitContent seluruh 3 tahun)
    const totalBars = sanitizedCandles.length;
    if (totalBars > 0) {
      const defaultBarsVisible = Math.min(totalBars, 75);
      chart.timeScale().setVisibleLogicalRange({
        from: totalBars - defaultBarsVisible,
        to: totalBars + 5,
      });
    }

    // 9. Crosshair Tooltip Hover Tracker
    chart.subscribeCrosshairMove((param) => {
      if (
        !param.time ||
        !param.point ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > height
      ) {
        setHoverData(null);
        return;
      }

      const candlePoint = param.seriesData.get(candleSeries) as any;
      if (candlePoint) {
        const timeStr = String(param.time);
        const idx = sanitizedCandles.findIndex((c) => c.time === timeStr);
        let pct = 0;
        if (idx > 0) {
          const prevC = sanitizedCandles[idx - 1];
          pct = ((candlePoint.close - prevC.close) / prevC.close) * 100;
        }

        const original = sanitizedCandles[idx];
        setHoverData({
          time: timeStr,
          open: candlePoint.open,
          high: candlePoint.high,
          low: candlePoint.low,
          close: candlePoint.close,
          volume: original?.volume || 0,
          changePercent: pct,
        });
      }
    });

    // 10. Auto-Fit Responsif Menggunakan ResizeObserver (Saat Sidebar Di-Hide / Ditempel)
    let animationFrameId: number;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length || !chartRef.current) return;
      const { width, height: observedHeight } = entries[0].contentRect;
      
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        if (chartRef.current && width > 0) {
          chartRef.current.applyOptions({
            width: width,
            height: observedHeight > 0 ? observedHeight : height,
          });
        }
      });
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [
    sanitizedCandles,
    bollinger,
    supportPrice,
    resistancePrice,
    height,
    showVolume,
    showMA,
    showBollinger,
    ma5Data,
    ma50Data,
    ma200Data,
  ]);

  // Data yang sedang aktif ditampilkan di header (Hover atau Last Bar)
  const display = hoverData || lastBarInfo;
  const isUp = (display?.changePercent || 0) >= 0;

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-brand-bg border border-brand-border flex flex-col group select-none">
      {/* Legend & OHLCV Bar Overlay ala Stockbit / TradingView */}
      <div className="absolute top-2 left-3 z-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono pointer-events-none bg-brand-bg/80 backdrop-blur-sm px-2 py-1 rounded-md border border-brand-border/40">
        {ticker && (
          <span className="font-bold text-white tracking-wider text-xs">{ticker}</span>
        )}
        {display ? (
          <>
            <span className="text-slate-400">{display.time}</span>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">
                O: <span className="text-slate-200">{display.open.toLocaleString('id-ID')}</span>
              </span>
              <span className="text-slate-400">
                H: <span className="text-slate-200">{display.high.toLocaleString('id-ID')}</span>
              </span>
              <span className="text-slate-400">
                L: <span className="text-slate-200">{display.low.toLocaleString('id-ID')}</span>
              </span>
              <span className="text-slate-400">
                C:{' '}
                <span className={isUp ? 'text-trading-buy font-semibold' : 'text-trading-sell font-semibold'}>
                  {display.close.toLocaleString('id-ID')}
                </span>
              </span>
              <span className={`font-semibold ${isUp ? 'text-trading-buy' : 'text-trading-sell'}`}>
                ({isUp ? '+' : ''}
                {display.changePercent.toFixed(2)}%)
              </span>
            </div>
            {showVolume && display.volume > 0 && (
              <span className="text-slate-400 hidden sm:inline">
                Vol: <span className="text-slate-200">{display.volume.toLocaleString('id-ID')}</span>
              </span>
            )}
          </>
        ) : (
          <span className="text-slate-500">Memuat data candle...</span>
        )}
      </div>

      {/* Indikator Active Tags (Kanan Atas) */}
      <div className="absolute top-2 right-3 z-10 flex items-center space-x-2 text-[10px] pointer-events-none">
        {showMA && (
          <div className="flex items-center space-x-1.5 bg-brand-card/90 px-2 py-0.5 rounded border border-brand-border/60">
            <span className="text-[#38BDF8] font-medium">MA5</span>
            <span className="text-[#3B82F6] font-medium">MA50</span>
            <span className="text-[#94A3B8] font-medium">MA200</span>
          </div>
        )}
        {showBollinger && (
          <div className="bg-brand-card/90 px-2 py-0.5 rounded border border-brand-border/60 text-amber-400 font-medium">
            BB (20,2)
          </div>
        )}
      </div>

      {/* Kontainer Canvas Chart */}
      <div
        ref={chartContainerRef}
        className="w-full transition-all duration-150"
        style={{ height: `${height}px` }}
      />
    </div>
  );
}
