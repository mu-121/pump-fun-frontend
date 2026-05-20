import { useEffect, useRef } from 'react';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { getSocket, onTrade } from '@/lib/ws';
import type { LiveTradePayload, Page, Token } from '@/types';

const TAPE_MAX = 40;

/**
 * Subscribe to the global `trade` WS event. On each trade we:
 *   1. Patch the matching `Token` row across every `tokens / *` infinite query
 *      cache (lastTradeAt, marketCapUsd, tradeCount++). This makes market caps
 *      tick up live on the home feed without a refetch.
 *   2. Append the trade onto the rolling `liveTape` cache (capped at 40).
 *
 * Returns a stable ref to the current tape array — components read it via
 * `useLiveTape()` (below).
 */
export function useLiveTrades(): void {
  const qc = useQueryClient();

  useEffect(() => {
    getSocket(); // force the singleton to connect + auto-join `global`
    return onTrade((raw) => {
      const trade = raw as LiveTradePayload | null;
      if (!trade?.mintAddress) return;

      // Patch any infinite-query cache that contains this mint.
      qc.setQueriesData<InfiniteData<Page<Token>>>(
        { queryKey: ['tokens'], exact: false },
        (prev) => patchTokenInFeed(prev, trade),
      );

      // Append to the in-memory tape.
      qc.setQueryData<LiveTradePayload[]>(['live-tape'], (prev) => {
        const next = [trade, ...(prev ?? [])];
        return next.length > TAPE_MAX ? next.slice(0, TAPE_MAX) : next;
      });
    });
  }, [qc]);
}

/** React-hook view onto the rolling live-tape buffer. */
export function useLiveTape(): LiveTradePayload[] {
  const qc = useQueryClient();
  const dataRef = useRef<LiveTradePayload[]>([]);
  const data = qc.getQueryData<LiveTradePayload[]>(['live-tape']) ?? dataRef.current;
  dataRef.current = data;
  return data;
}

function patchTokenInFeed(
  prev: InfiniteData<Page<Token>> | undefined,
  trade: LiveTradePayload,
): InfiniteData<Page<Token>> | undefined {
  if (!prev) return prev;
  let changed = false;
  const nextPages = prev.pages.map((page) => {
    let pageChanged = false;
    const items = page.items.map((t) => {
      if (t.mintAddress !== trade.mintAddress) return t;
      pageChanged = true;
      return {
        ...t,
        lastTradeAt: trade.blockTime,
        tradeCount: t.tradeCount + 1,
        marketCapUsd: safeNumber(trade.marketCapUsd, t.marketCapUsd),
      };
    });
    if (!pageChanged) return page;
    changed = true;
    return { ...page, items };
  });
  return changed ? { ...prev, pages: nextPages } : prev;
}

function safeNumber(s: string | undefined, fallback: number): number {
  if (s === undefined) return fallback;
  const n = Number(s);
  return Number.isFinite(n) ? n : fallback;
}
