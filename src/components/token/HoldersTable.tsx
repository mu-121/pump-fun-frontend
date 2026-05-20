import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { AlertTriangle, Crown } from 'lucide-react';
import { AddressDisplay } from '@/components/ui/AddressDisplay';
import { useTokenHolders } from '@/hooks/useTokenHolders';
import { formatToken } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Token } from '@/types';

const TOKEN_DECIMALS = 6;
const CONCENTRATION_TOP_N = 10;
const CONCENTRATION_THRESHOLD = 0.5;

interface HoldersTableProps {
  token: Token;
}

export function HoldersTable({ token }: HoldersTableProps): JSX.Element {
  const { data, isLoading, error } = useTokenHolders(token.mintAddress, { limit: 50 });
  const items = data?.items ?? [];

  const totalSupply = useMemo(() => new BigNumber(token.totalSupply), [token.totalSupply]);
  const concentration = useMemo(() => {
    if (totalSupply.isZero() || items.length === 0) return 0;
    const topN = items.slice(0, CONCENTRATION_TOP_N);
    const sum = topN.reduce((acc, h) => acc.plus(h.balance), new BigNumber(0));
    return sum.div(totalSupply).toNumber();
  }, [items, totalSupply]);

  if (isLoading) {
    return <p className="p-6 text-center text-xs text-text-muted">Loading holders…</p>;
  }
  if (error) {
    return <p className="p-6 text-center text-xs text-danger">{error.message}</p>;
  }
  if (items.length === 0) {
    return <p className="p-6 text-center text-xs text-text-muted">No holders yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {concentration > CONCENTRATION_THRESHOLD ? (
        <div className="flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/5 px-3 py-2 text-xs text-danger">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Top {CONCENTRATION_TOP_N} wallets hold {(concentration * 100).toFixed(1)}% of supply —
          concentration risk.
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-text-muted bg-surface-elevated">
              <Th>#</Th>
              <Th>Address</Th>
              <Th align="right">Balance</Th>
              <Th align="right">% supply</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((h, i) => {
              const pct = totalSupply.isZero()
                ? 0
                : new BigNumber(h.balance).div(totalSupply).times(100).toNumber();
              const isCreator = h.walletAddress === token.creatorAddress;
              return (
                <tr
                  key={h.id}
                  className="border-t border-border hover:bg-surface-elevated/40 transition-colors"
                >
                  <Td className="text-text-muted font-mono">{i + 1}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <AddressDisplay address={h.walletAddress} head={5} tail={5} />
                      {isCreator ? (
                        <span className="inline-flex items-center gap-0.5 rounded bg-accent/15 text-accent text-[10px] px-1.5 py-0.5">
                          <Crown className="h-2.5 w-2.5" />
                          Creator
                        </span>
                      ) : null}
                    </div>
                  </Td>
                  <Td align="right" className="font-mono tabular-nums">
                    {formatToken(h.balance, TOKEN_DECIMALS, { compact: true })}
                  </Td>
                  <Td align="right" className="font-mono tabular-nums text-text-muted">
                    {pct.toFixed(2)}%
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}): JSX.Element {
  return (
    <th className={cn('px-3 py-2 font-medium', align === 'right' ? 'text-right' : 'text-left')}>
      {children}
    </th>
  );
}

function Td({
  children,
  align = 'left',
  className,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}): JSX.Element {
  return (
    <td
      className={cn(
        'px-3 py-2 align-middle',
        align === 'right' ? 'text-right' : 'text-left',
        className,
      )}
    >
      {children}
    </td>
  );
}
