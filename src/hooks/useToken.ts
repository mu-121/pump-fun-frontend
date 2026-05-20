import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getToken } from '@/lib/api';
import { getSocket, joinToken, leaveToken, onGraduation, onTokenState, onTrade } from '@/lib/ws';
import type {
  LiveGraduationPayload,
  LiveTokenStatePayload,
  LiveTradePayload,
  TokenWithOnChain,
} from '@/types';

/**
 * Fetch a single token's detail and keep it live:
 *   - Joins `token:<mint>` socket.io room while mounted
 *   - On `tokenState` events: patches reserves / price / marketCap in place
 *   - On `trade` events for this mint: bumps `lastTradeAt` + `tradeCount`
 *   - On `graduation` events: flips `isGraduated` + writes `graduatedPoolAddress`
 *
 * Returns the React Query result for the `getToken(mint)` request.
 */
export function useToken(mint: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['token', mint],
    queryFn: () => {
      if (!mint) throw new Error('mint required');
      return getToken(mint);
    },
    enabled: Boolean(mint),
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!mint) return;
    getSocket();
    joinToken(mint);
    const offState = onTokenState((raw) => {
      const evt = raw as LiveTokenStatePayload;
      if (!evt || evt.mintAddress !== mint) return;
      qc.setQueryData<TokenWithOnChain>(['token', mint], (prev) =>
        prev
          ? {
              ...prev,
              virtualSolReserves: evt.virtualSolReserves,
              virtualTokenReserves: evt.virtualTokenReserves,
              marketCapUsd: safeNumber(evt.marketCapUsd, prev.marketCapUsd),
            }
          : prev,
      );
    });
    const offTrade = onTrade((raw) => {
      const evt = raw as LiveTradePayload;
      if (!evt || evt.mintAddress !== mint) return;
      qc.setQueryData<TokenWithOnChain>(['token', mint], (prev) =>
        prev
          ? {
              ...prev,
              lastTradeAt: evt.blockTime,
              tradeCount: prev.tradeCount + 1,
              marketCapUsd: safeNumber(evt.marketCapUsd, prev.marketCapUsd),
            }
          : prev,
      );
    });
    const offGrad = onGraduation((raw) => {
      const evt = raw as LiveGraduationPayload;
      if (!evt || evt.mintAddress !== mint) return;
      qc.setQueryData<TokenWithOnChain>(['token', mint], (prev) =>
        prev
          ? {
              ...prev,
              isGraduated: true,
              graduatedPoolAddress: evt.graduatedPoolAddress,
              graduatedAt: evt.blockTime ?? prev.graduatedAt ?? new Date().toISOString(),
            }
          : prev,
      );
    });
    return () => {
      leaveToken(mint);
      offState();
      offTrade();
      offGrad();
    };
  }, [mint, qc]);

  return query;
}

function safeNumber(s: string | undefined, fallback: number): number {
  if (s === undefined) return fallback;
  const n = Number(s);
  return Number.isFinite(n) ? n : fallback;
}
