import { useEffect, useRef } from 'react';
import { ArrowDownRight, ArrowUpRight, ExternalLink } from 'lucide-react';
import { AddressDisplay } from '@/components/ui/AddressDisplay';
import { Button } from '@/components/ui/Button';
import { useTokenTrades } from '@/hooks/useTokenTrades';
import { formatSol, formatTimeAgo, formatToken, formatUsd } from '@/lib/format';
import { getExplorerUrl } from '@/lib/tx';
import { cn } from '@/lib/utils';

const TOKEN_DECIMALS = 6;

interface TradesTableProps {
  mint: string;
  /** Defaults to true. Pass false if a parent hook already owns the WS join. */
  joinWsRoom?: boolean;
}

export function TradesTable({ mint, joinWsRoom }: TradesTableProps): JSX.Element {
  const opts: { joinWsRoom?: boolean } = {};
  if (joinWsRoom !== undefined) opts.joinWsRoom = joinWsRoom;
  const query = useTokenTrades(mint, opts);

  /** Track which signatures we've seen so we can briefly highlight new rows. */
  const seenRef = useRef<Set<string>>(new Set());
  const newSignaturesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const items = query.data?.pages.flatMap((p) => p.items) ?? [];
    const fresh: string[] = [];
    for (const t of items) {
      if (!seenRef.current.has(t.signature)) {
        seenRef.current.add(t.signature);
        // Skip the initial bulk load — only highlight rows that arrived
        // after the first page settled.
        if (seenRef.current.size > items.length / 2) fresh.push(t.signature);
      }
    }
    if (fresh.length === 0) return;
    for (const s of fresh) newSignaturesRef.current.add(s);
    const t = window.setTimeout(() => {
      for (const s of fresh) newSignaturesRef.current.delete(s);
    }, 1_200);
    return () => window.clearTimeout(t);
  }, [query.data]);

  const items = query.data?.pages.flatMap((p) => p.items) ?? [];

  if (query.isLoading) {
    return <p className="p-6 text-center text-xs text-text-muted">Loading trades…</p>;
  }
  if (query.error) {
    return <p className="p-6 text-center text-xs text-danger">{query.error.message}</p>;
  }
  if (items.length === 0) {
    return <p className="p-6 text-center text-xs text-text-muted">No trades yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-text-muted bg-surface-elevated">
              <Th>Time</Th>
              <Th>Type</Th>
              <Th align="right">SOL</Th>
              <Th align="right">Tokens</Th>
              <Th align="right">Price (USD)</Th>
              <Th>Trader</Th>
              <Th align="right">Tx</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => {
              const isBuy = t.side === 'BUY';
              const highlight = newSignaturesRef.current.has(t.signature);
              return (
                <tr
                  key={t.signature}
                  className={cn(
                    'border-t border-border transition-colors',
                    highlight ? 'bg-primary/10 motion-reduce:bg-transparent' : 'hover:bg-surface-elevated/40',
                  )}
                >
                  <Td className="text-text-muted whitespace-nowrap">
                    {formatTimeAgo(t.blockTime, { suffix: false })}
                  </Td>
                  <Td>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-xs font-medium',
                        isBuy ? 'text-primary' : 'text-danger',
                      )}
                    >
                      {isBuy ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {isBuy ? 'Buy' : 'Sell'}
                    </span>
                  </Td>
                  <Td align="right" className="font-mono tabular-nums">
                    {formatSol(t.solAmount, { withUnit: false, fractionDigits: 4 })}
                  </Td>
                  <Td align="right" className="font-mono tabular-nums">
                    {formatToken(t.tokenAmount, TOKEN_DECIMALS, { compact: true })}
                  </Td>
                  <Td align="right" className="font-mono tabular-nums text-text-muted">
                    {formatUsd(t.priceUsd, { compact: false })}
                  </Td>
                  <Td>
                    <AddressDisplay
                      address={t.traderAddress}
                      head={4}
                      tail={4}
                      withSolscan={false}
                    />
                  </Td>
                  <Td align="right">
                    <a
                      href={getExplorerUrl(t.signature)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-text-muted hover:text-text-primary"
                      aria-label="View on Solscan"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {query.hasNextPage ? (
        <div className="flex justify-center pt-2">
          <Button
            variant="secondary"
            size="sm"
            loading={query.isFetchingNextPage}
            onClick={() => query.fetchNextPage()}
          >
            Load older
          </Button>
        </div>
      ) : null}
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
