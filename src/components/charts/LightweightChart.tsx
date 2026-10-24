'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, LineStyle } from 'lightweight-charts';
import { Candle } from '@/types/trading';

interface LightweightChartProps {
  candles: Candle[];
  supportPrice?: number;
  resistancePrice?: number;
  height?: number;
}

export default function LightweightChart({
  candles,
  supportPrice,
  resistancePrice,
  height = 220
}: LightweightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !candles || candles.length === 0) return;

    // 1. Inisialisasi Canvas
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f172a' },
        textColor: '#94a3b8'
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' }
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      timeScale: {
        borderColor: '#334155'
      },
      rightPriceScale: {
        borderColor: '#334155'
      }
    });

    chartRef.current = chart;

    // 2. Tambahkan Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444'
    });

    const formattedCandles = candles.map(c => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close
    }));

    candleSeries.setData(formattedCandles as any);

    // 3. Garis Support (Biru)
    if (supportPrice && supportPrice > 0) {
      candleSeries.createPriceLine({
        price: supportPrice,
        color: '#38bdf8',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'Support'
      });
    }

    // 4. Garis Resisten (Kuning)
    if (resistancePrice && resistancePrice > 0) {
      candleSeries.createPriceLine({
        price: resistancePrice,
        color: '#facc15',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'Target'
      });
    }

    chart.timeScale().fitContent();

    // 5. Responsive Resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [candles, supportPrice, resistancePrice, height]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-md">
      <div ref={chartContainerRef} className="w-full" style={{ height: `${height}px` }} />
    </div>
  );
}
