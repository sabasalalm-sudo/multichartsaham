'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, LineStyle } from 'lightweight-charts';
import { Candle } from '@/types/trading';
import { calculateBollingerBands } from '@/lib/indicators/bollinger';

interface LightweightChartProps {
  candles: Candle[];
  supportPrice?: number;
  resistancePrice?: number;
  height?: number;
  showBollinger?: boolean;
}

export default function LightweightChart({
  candles,
  supportPrice,
  resistancePrice,
  height = 240,
  showBollinger = true
}: LightweightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return;

    // 1. Inisialisasi Canvas TradingView
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f172a' }, // Slate-900 (Dark theme elegan)
        textColor: '#94a3b8' // Slate-400
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' }
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
        secondsVisible: false
      },
      rightPriceScale: {
        borderColor: '#334155',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1
        }
      },
      crosshair: {
        vertLine: { color: '#64748b', width: 1, style: LineStyle.Dashed },
        horzLine: { color: '#64748b', width: 1, style: LineStyle.Dashed }
      }
    });

    chartRef.current = chart;

    // 2. Tambahkan Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',        // Hijau (Bullish)
      downColor: '#ef4444',      // Merah (Bearish)
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444'
    });

    // Format data candlestick
    const formattedCandles = candles.map(c => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close
    }));
    candleSeries.setData(formattedCandles as any);

    // 3. Tambahkan Bollinger Bands (Jika diaktifkan)
    if (showBollinger) {
      const bands = calculateBollingerBands(candles);

      const upperSeries = chart.addLineSeries({
        color: '#64748b',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        priceLineVisible: false
      });
      upperSeries.setData(bands.upper as any);

      const middleSeries = chart.addLineSeries({
        color: '#475569',
        lineWidth: 1,
        priceLineVisible: false
      });
      middleSeries.setData(bands.middle as any);

      const lowerSeries = chart.addLineSeries({
        color: '#64748b',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        priceLineVisible: false
      });
      lowerSeries.setData(bands.lower as any);
    }

    // 4. Garis Horisontal Support (Biru)
    if (supportPrice && supportPrice > 0) {
      candleSeries.createPriceLine({
        price: supportPrice,
        color: '#38bdf8', // Sky-400
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'Support'
      });
    }

    // 5. Garis Horisontal Resisten / Target TP (Kuning Emas)
    if (resistancePrice && resistancePrice > 0) {
      candleSeries.createPriceLine({
        price: resistancePrice,
        color: '#facc15', // Yellow-400
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'Target/Res'
      });
    }

    // Auto-fit rentang waktu agar candle proporsional
    chart.timeScale().fitContent();

    // 6. Responsive Auto-Resize (Menyesuaikan lebar layar PC & HP secara mulus)
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(chartContainerRef.current);

    // 7. Bersihkan memori saat komponen dilepas (mencegah memory leak)
    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [candles, supportPrice, resistancePrice, height, showBollinger]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-md">
      <div ref={chartContainerRef} className="w-full" style={{ height: `${height}px` }} />
    </div>
  );
}
