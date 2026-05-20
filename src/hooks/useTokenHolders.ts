import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTokenHolders } from '@/lib/api';
import { onTrade } from '@/lib/ws';
import type { Holder, LiveTradePayload, Page } from '@/types';

const HOLDER_REFETCH_DEBOUNCE_MS = 2_000;
const POLL_MS = 30_000;

/**
 * Top holders for a token. Polls every 30s; additionally, when a WS trade
 * event comes in for this mint we schedule a debounced refetch so the table
 * stays close to live without spamming the API on busy tokens.
 */
export function useTokenHolders(
  mint: string | undefined,
  params: { limit?: number; cursor?: string } = {},
) {
  const qc = useQueryClient();
  const queryKey = ['token-holders', mint, params] as const;

  const query = useQuery<Page<Holder>>({
    queryKey,
    queryFn: () => {
      if (!mint) throw new Error('mint required');
      return getTokenHolders(mint, params);
    },
    enabled: Boolean(mint),
    refetchInterval: POLL_MS,
  });

  useEffect(() => {
    if (!mint) return;
    let pending: number | null = null;
    const off = onTrade((raw) => {
      const evt = raw as LiveTradePayload;
      if (!evt || evt.mintAddress !== mint) return;
      if (pending != null) window.clearTimeout(pending);
      pending = window.setTimeout(() => {
        void qc.invalidateQueries({ queryKey: ['token-holders', mint], exact: false });
      }, HOLDER_REFETCH_DEBOUNCE_MS);
    });
    return () => {
      off();
      if (pending != null) window.clearTimeout(pending);
    };
  }, [mint, qc]);

  return query;
}
