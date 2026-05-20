import type { Token, TokenWithOnChain } from '@/types';

/**
 * Effective bonding-curve reserves for display.
 * Prefers live on-chain reserves when the DB row is still at defaults (indexer lag).
 */
export function curveReserves(token: Token | TokenWithOnChain): {
  solLamports: string;
  tokenRaw: string;
} {
  const onChain = 'onChain' in token ? token.onChain : null;
  const dbSol = token.virtualSolReserves;
  const dbToken = token.virtualTokenReserves;
  const dbStale = dbSol === '0' || dbToken === '0';

  if (onChain && dbStale) {
    return {
      solLamports: onChain.quoteReserve,
      tokenRaw: onChain.baseReserve,
    };
  }

  return { solLamports: dbSol, tokenRaw: dbToken };
}
