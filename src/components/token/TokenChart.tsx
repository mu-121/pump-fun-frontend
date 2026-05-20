import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  createChart,
  type CandlestickData,
  type HistogramData,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import { Tab, TabList, Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCandles } from '@/hooks/useCandles';
import { onTrade } from '@/lib/ws';
import { toUnixMs } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { CandleIntervalKey, LiveTradePayload } from '@/types';

const INTERVALS: Array<{ value: CandleIntervalKey; label: string; seconds: number }> = [
  { value: '1m', label: '1m', seconds: 60 },
  { value: '5m', label: '5m', seconds: 300 },
  { value: '1h', label: '1h', seconds: 3_600 },
  { value: '1d', label: '1d', seconds: 86_400 },
];

interface TokenChartProps {
  mint: string;
  className?: string;
}

/**
 * Candlestick + volume chart driven by `/api/v1/tokens/:mint/candles`. New
 * trades from the WS room update the current bucket in-place via
 * `series.update()` so the chart ticks live without a refetch.
 */
export function TokenChart({ mint, className }: TokenChartProps): JSX.Element {
  const [intervalKey, setIntervalKey] = useIntervalParam('1m');
  const intervalSeconds = useMemo(
    () => INTERVALS.find((i) => i.value === intervalKey)?.seconds ?? 60,
    [intervalKey],
  );

  const { data: candles, isLoading } = useCandles(mint, { interval: intervalKey, limit: 500 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  /** Last candle we rendered — used to extend the current bucket on live trades. */
  const lastCandleRef = useRef<CandlestickData<UTCTimestamp> | null>(null);
  const lastVolumeRef = useRef<HistogramData<UTCTimestamp> | null>(null);

  // ---- One-time chart construction ----
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      width: el.clientWidth,
      height: el.clientHeight || 360,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8b91a0',
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      },
      grid: {
        vertLines: { color: 'rgba(38, 41, 50, 0.6)' },
        horzLines: { color: 'rgba(38, 41, 50, 0.6)' },
      },
      rightPriceScale: { borderColor: '#262932' },
      timeScale: { borderColor: '#262932', timeVisible: true, secondsVisible: false },
      crosshair: { mode: 1 },
      autoSize: false,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00d97e',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#00d97e',
      wickDownColor: '#f43f5e',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'vol',
    });
    chart
      .priceScale('vol')
      .applyOptions({ scaleMargins: { top: 0.82, bottom: 0 }, borderColor: 'transparent' });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const ro = new ResizeObserver(() => {
      if (!el) return;
      chart.applyOptions({ width: el.clientWidth, height: el.clientHeight || 360 });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      lastCandleRef.current = null;
      lastVolumeRef.current = null;
    };
  }, []);

  // ---- Apply fetched candles on data / interval change ----
  useEffect(() => {
    const candleSeries = candleSeriesRef.current;
    const volumeSeries = volumeSeriesRef.current;
    if (!candleSeries || !volumeSeries) return;

    const bars: CandlestickData<UTCTimestamp>[] = (candles ?? []).map((c) => ({
      time: c.time as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    const volumes: HistogramData<UTCTimestamp>[] = (candles ?? []).map((c) => ({
      time: c.time as UTCTimestamp,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(0, 217, 126, 0.35)' : 'rgba(244, 63, 94, 0.35)',
    }));

    candleSeries.setData(bars);
    volumeSeries.setData(volumes);

    lastCandleRef.current = bars.length > 0 ? bars[bars.length - 1]! : null;
    lastVolumeRef.current = volumes.length > 0 ? volumes[volumes.length - 1]! : null;
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  // ---- Live update from WS ----
  useEffect(() => {
    return onTrade((raw) => {
      const trade = raw as LiveTradePayload;
      if (!trade || trade.mintAddress !== mint) return;
      const candleSeries = candleSeriesRef.current;
      const volumeSeries = volumeSeriesRef.current;
      if (!candleSeries || !volumeSeries) return;

      const tradeUnix = Math.floor(toUnixMs(trade.blockTime) / 1000);
      if (!Number.isFinite(tradeUnix)) return;
      const bucket = Math.floor(tradeUnix / intervalSeconds) * intervalSeconds;
      const price = Number(trade.priceUsd);
      if (!Number.isFinite(price) || price <= 0) return;
      const solValue = Number(trade.solAmount) / 1e9;

      const last = lastCandleRef.current;
      let next: CandlestickData<UTCTimestamp>;
      let nextVol: HistogramData<UTCTimestamp>;
      if (last && (last.time as number) === bucket) {
        next = {
          time: last.time,
          open: last.open,
          high: Math.max(last.high, price),
          low: Math.min(last.low, price),
          close: price,
        };
        const lastVol = lastVolumeRef.current;
        nextVol = {
          time: last.time,
          value: (lastVol?.value ?? 0) + solValue,
          color: price >= last.open ? 'rgba(0, 217, 126, 0.35)' : 'rgba(244, 63, 94, 0.35)',
        };
      } else {
        const open = last?.close ?? price;
        next = {
          time: bucket as UTCTimestamp,
          open,
          high: Math.max(open, price),
          low: Math.min(open, price),
          close: price,
        };
        nextVol = {
          time: bucket as UTCTimestamp,
          value: solValue,
          color: price >= open ? 'rgba(0, 217, 126, 0.35)' : 'rgba(244, 63, 94, 0.35)',
        };
      }
      lastCandleRef.current = next;
      lastVolumeRef.current = nextVol;
      candleSeries.update(next);
      volumeSeries.update(nextVol);
    });
  }, [mint, intervalSeconds]);

  const hasData = (candles?.length ?? 0) > 0;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <Tabs value={intervalKey} onValueChange={(v) => setIntervalKey(v as CandleIntervalKey)}>
          <TabList>
            {INTERVALS.map((i) => (
              <Tab key={i.value} value={i.value}>
                {i.label}
              </Tab>
            ))}
          </TabList>
        </Tabs>
      </div>

      <div
        className="relative rounded-xl border border-border bg-surface overflow-hidden"
        style={{ height: 400 }}
      >
        <div ref={containerRef} className="absolute inset-0" />
        {isLoading ? (
          <div className="absolute inset-0 p-4">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        ) : null}
        {!isLoading && !hasData ? (
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="text-center">
              <p className="text-sm text-text-primary font-medium">No trades yet</p>
              <p className="text-xs text-text-muted mt-1">
                The chart will fill in as soon as someone trades.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function useIntervalParam(
  initial: CandleIntervalKey,
): [CandleIntervalKey, (v: CandleIntervalKey) => void] {
  return useState<CandleIntervalKey>(initial);
}
