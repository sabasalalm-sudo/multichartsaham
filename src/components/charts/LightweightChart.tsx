// File: src/components/charts/LightweightChart.tsx

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
  height = 200
}: LightweightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Inisialisasi Canvas Charting TradingView
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#080D1A' },
        textColor: '#94A3B8',
        fontSize: 10,
      },
      grid: {
        vertLines: { color: 'rgba(30, 45, 74, 0.5)' },
        horzLines: { color: 'rgba(30, 45, 74, 0.5)' },
      },
      crosshair: {
        vertLine: { color: '#00D084', width: 1, style: LineStyle.Dashed },
        horzLine: { color: '#00D084', width: 1, style: LineStyle.Dashed },
      },
      width: chartContainerRef.current.clientWidth || 300,
      height: height,
      timeScale: {
        borderColor: '#1E2D4A',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: '#1E2D4A',
      },
    });

    chartRef.current = chart;

    // Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00D084',
      downColor: '#F43F5E',
      borderVisible: false,
      wickUpColor: '#00D084',
      wickDownColor: '#F43F5E',
    });

    if (candles && candles.length > 0) {
      const formattedCandles = candles.map(c => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close
      }));
      candleSeries.setData(formattedCandles as any);
    }

    // Garis Support (Stop Loss)
    if (supportPrice && supportPrice > 0) {
      candleSeries.createPriceLine({
        price: supportPrice,
        color: '#F43F5E',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'SL'
      });
    }

    // Garis Target Resisten (Take Profit)
    if (resistancePrice && resistancePrice > 0) {
      candleSeries.createPriceLine({
        price: resistancePrice,
        color: '#00D084',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'TP'
      });
    }

    chart.timeScale().fitContent();

    // Auto-Resize dengan ResizeObserver (Mencegah Crash Layar Responsif / Flexbox)
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !chartRef.current) return;
      const { width } = entries[0].contentRect;
      if (width > 0) {
        chartRef.current.applyOptions({ width });
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [candles, supportPrice, resistancePrice, height]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-brand-bg">
      <div ref={chartContainerRef} className="w-full" style={{ height: `${height}px` }} />
    </div>
  );
}
