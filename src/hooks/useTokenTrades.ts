import { useEffect } from 'react';
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { getTokenTrades } from '@/lib/api';
import { getSocket, joinToken, leaveToken, onTrade } from '@/lib/ws';
import type { LiveTradePayload, Page, Trade } from '@/types';

const PAGE_SIZE = 50;

interface UseTokenTradesOpts {
  /** Set to false to skip auto-joining the WS room — useful when another hook already did. */
  joinWsRoom?: boolean;
}

/**
 * Paginated token-trade history with live prepend.
 *
 * The first page mirrors the GET endpoint; subsequent pages are fetched via
 * `cursor` (older trades). On every incoming WS `trade` event for this mint we
 * synthesize a `Trade` row from the live payload and prepend it to the first
 * page so the table updates instantly. Once a refetch happens, the synthesized
 * row is replaced by the authoritative one (matched on `signature`).
 */
export function useTokenTrades(mint: string | undefined, opts: UseTokenTradesOpts = {}) {
  const qc = useQueryClient();
  const queryKey: [string, string | undefined] = ['token-trades', mint];

  const query = useInfiniteQuery<
    Page<Trade>,
    Error,
    InfiniteData<Page<Trade>>,
    [string, string | undefined],
    string | null
  >({
    queryKey,
    queryFn: ({ pageParam }) => {
      if (!mint) throw new Error('mint required');
      const params: { limit: number; cursor?: string } = { limit: PAGE_SIZE };
      if (pageParam) params.cursor = pageParam;
      return getTokenTrades(mint, params);
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(mint),
  });

  useEffect(() => {
    if (!mint) return;
    if (opts.joinWsRoom !== false) {
      getSocket();
      joinToken(mint);
    }
    const off = onTrade((raw) => {
      const evt = raw as LiveTradePayload;
      if (!evt || evt.mintAddress !== mint) return;
      const synthesized = synthesizeTrade(evt);
      qc.setQueryData<InfiniteData<Page<Trade>>>(queryKey, (prev) => {
        if (!prev || prev.pages.length === 0) return prev;
        const firstPage = prev.pages[0];
        if (!firstPage) return prev;
        // De-dup by signature in case the GET refetched between WS deliveries
        for (const p of prev.pages) {
          if (p.items.some((t) => t.signature === synthesized.signature)) return prev;
        }
        return {
          ...prev,
          pages: [
            {
              items: [synthesized, ...firstPage.items].slice(0, PAGE_SIZE),
              nextCursor: firstPage.nextCursor,
            },
            ...prev.pages.slice(1),
          ],
        };
      });
    });
    return () => {
      off();
      if (opts.joinWsRoom !== false) leaveToken(mint);
    };
  }, [mint, qc, opts.joinWsRoom]);

  return query;
}

function synthesizeTrade(evt: LiveTradePayload): Trade {
  return {
    id: `live-${evt.signature}`,
    signature: evt.signature,
    tokenMint: evt.mintAddress,
    traderAddress: evt.trader ?? 'unknown',
    side: evt.side,
    solAmount: evt.solAmount,
    tokenAmount: evt.tokenAmount,
    priceSol: Number(evt.priceSol) || 0,
    priceUsd: Number(evt.priceUsd) || 0,
    slot: '0',
    blockTime: evt.blockTime,
    createdAt: evt.blockTime,
  };
}
