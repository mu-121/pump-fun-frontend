import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

const POLL_MS = 15_000;

/**
 * SOL balance of the connected wallet, in lamports. `null` while disconnected.
 * Polled every 15s; expose `refresh()` for post-action refetches.
 */
export function useSolBalance(): {
  lamports: bigint | null;
  isLoading: boolean;
  refresh: () => void;
} {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const owner = publicKey?.toBase58();
  console.log(owner, publicKey, "ownerrrrrrrrrr");
  const qc = useQueryClient();
  console.log(connection.rpcEndpoint, "url");
  const query = useQuery<bigint>({
    queryKey: ['balance', 'sol', owner],
    queryFn: async () => {
      if (!publicKey) return 0n;
      const lamports = await connection.getBalance(publicKey, 'confirmed');
      console.log(lamports, "lamportsssssssssss");
      return BigInt(lamports);
    },
    enabled: Boolean(publicKey),
    refetchInterval: POLL_MS,
  });
  console.log(query.data, "querydata")
  return {
    lamports: owner ? (query.data ?? null) : null,
    isLoading: query.isLoading,
    refresh: () => void qc.invalidateQueries({ queryKey: ['balance', 'sol', owner] }),
  };
}

/**
 * Raw token balance (sum across all token accounts) for the connected wallet
 * and the given mint, in the token's base units. `null` while disconnected.
 */
export function useTokenBalance(mint: string | undefined): {
  raw: bigint | null;
  isLoading: boolean;
  refresh: () => void;
} {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const owner = publicKey?.toBase58();
  const qc = useQueryClient();
  console.log(owner, "cjeck");
  const mintPk = useMemo(() => {
    if (!mint) return null;
    try {
      return new PublicKey(mint);
    } catch {
      return null;
    }
  }, [mint]);

  const query = useQuery<bigint>({
    queryKey: ['balance', 'token', owner, mint],
    queryFn: async () => {
      if (!publicKey || !mintPk) return 0n;
      const res = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint: mintPk },
        'confirmed',
      );
      let total = 0n;
      for (const acc of res.value) {
        const parsed = acc.account.data as { parsed?: { info?: { tokenAmount?: { amount?: string } } } };
        const raw = parsed?.parsed?.info?.tokenAmount?.amount;
        if (typeof raw === 'string') total += BigInt(raw);
      }
      return total;
    },
    enabled: Boolean(publicKey && mintPk),
    refetchInterval: POLL_MS,
  });

  // Token balance is stale after a trade; expose a refresh that consumers call.
  useEffect(() => {
    // no-op — keeps the linter happy about unused effect; the hook composes well otherwise.
  }, []);

  return {
    raw: owner ? (query.data ?? null) : null,
    isLoading: query.isLoading,
    refresh: () => void qc.invalidateQueries({ queryKey: ['balance', 'token', owner, mint] }),
  };
}
