// File: src/components/charts/LightweightChart.tsx

'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, LineStyle } from 'lightweight-charts';
import { Candle } from '@/types/trading';

interface BollingerPoint {
  time: string;
  value: number;
}

interface LightweightChartProps {
  candles: Candle[];
  bollinger?: {
    upper: BollingerPoint[];
    middle: BollingerPoint[];
    lower: BollingerPoint[];
  };
  supportPrice?: number;
  resistancePrice?: number;
  height?: number;
}

export default function LightweightChart({
  candles,
  bollinger,
  supportPrice,
  resistancePrice,
  height = 220
}: LightweightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !candles || candles.length === 0) return;

    // Inisialisasi Canvas TradingView
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#080D1A' },
        textColor: '#94A3B8',
        fontSize: 10,
      },
      grid: {
        vertLines: { color: 'rgba(30, 45, 74, 0.3)' },
        horzLines: { color: 'rgba(30, 45, 74, 0.3)' },
      },
      crosshair: {
        vertLine: { color: '#00D084', width: 1, style: LineStyle.Dashed },
        horzLine: { color: '#00D084', width: 1, style: LineStyle.Dashed },
      },
      width: chartContainerRef.current.clientWidth || 400,
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

    // 1. Candlestick Series (Bursa BEI Hijau Naik / Merah Turun)
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00D084',
      downColor: '#F43F5E',
      borderVisible: false,
      wickUpColor: '#00D084',
      wickDownColor: '#F43F5E',
    });

    candleSeries.setData(candles as any);

    // 2. Bollinger Bands Overlay (Jika Tersedia)
    if (bollinger && bollinger.middle.length > 0) {
      // Upper Band (Biru Langit Transparan)
      const upperSeries = chart.addLineSeries({
        color: 'rgba(56, 189, 248, 0.5)',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        title: 'Upper BB',
      });
      upperSeries.setData(bollinger.upper as any);

      // Middle Band / SMA-20 (Oranye/Kuning Halus)
      const middleSeries = chart.addLineSeries({
        color: 'rgba(245, 158, 11, 0.7)',
        lineWidth: 1,
        title: 'SMA 20',
      });
      middleSeries.setData(bollinger.middle as any);

      // Lower Band (Biru Langit Transparan)
      const lowerSeries = chart.addLineSeries({
        color: 'rgba(56, 189, 248, 0.5)',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        title: 'Lower BB',
      });
      lowerSeries.setData(bollinger.lower as any);
    }

    // 3. Garis Support / Stop Loss (Merah Putus-putus)
    if (supportPrice && supportPrice > 0) {
      candleSeries.createPriceLine({
        price: supportPrice,
        color: '#F43F5E',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'SL Support',
      });
    }

    // 4. Garis Target / Resisten (Hijau Putus-putus)
    if (resistancePrice && resistancePrice > 0) {
      candleSeries.createPriceLine({
        price: resistancePrice,
        color: '#00D084',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'TP Target',
      });
    }

    chart.timeScale().fitContent();

    // Auto-Resize Responsif
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
  }, [candles, bollinger, supportPrice, resistancePrice, height]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-brand-bg border border-brand-border">
      <div ref={chartContainerRef} className="w-full" style={{ height: `${height}px` }} />
    </div>
  );
}
