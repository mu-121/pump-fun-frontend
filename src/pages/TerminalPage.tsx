import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  Filter,
  LineChart,
  Star,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface Row {
  ticker: string;
  name: string;
  emoji: string;
  mint: string;
  priceUsd: number;
  change24h: number;
  volume24h: number;
  mcap: number;
  ageHours: number;
  watched?: boolean;
}

const WATCHLIST: Row[] = [
  { ticker: 'BUTT',   name: 'Buttcoin',  emoji: '🍑', mint: 'BuTTcoiN1111111111111111111111111111111111', priceUsd: 0.0000215, change24h: 142, volume24h: 8_400_000, mcap: 21_500_000, ageHours: 14, watched: true },
  { ticker: 'TROLL',  name: 'TROLL',     emoji: '👺', mint: 'TroLLcoiN111111111111111111111111111111111', priceUsd: 0.000120,  change24h: 87,  volume24h: 24_000_000, mcap: 120_000_000, ageHours: 96, watched: true },
  { ticker: 'LMAO',   name: 'LMAO!',     emoji: '😂', mint: 'LMaOcoiN1111111111111111111111111111111111', priceUsd: 0.0000057, change24h: 54,  volume24h: 1_100_000, mcap: 5_670_000, ageHours: 6, watched: true },
  { ticker: 'WIF',    name: 'dogwifhat', emoji: '🐕', mint: 'WiFcoiN11111111111111111111111111111111111', priceUsd: 0.0000011, change24h: 28,  volume24h: 240_000,    mcap: 1_100_000, ageHours: 2, watched: false },
  { ticker: 'POPCAT', name: 'Popcat',    emoji: '🐈', mint: 'PopCatcoiN1111111111111111111111111111111', priceUsd: 0.00000089, change24h: -12, volume24h: 95_000,     mcap: 890_000, ageHours: 9, watched: false },
  { ticker: 'BOOB',   name: 'boob',      emoji: '🌸', mint: 'BoobcoiN1111111111111111111111111111111111', priceUsd: 0.0000064, change24h: 12,  volume24h: 720_000,    mcap: 6_380_000, ageHours: 22, watched: false },
  { ticker: 'PUNCH',  name: '$Punch',    emoji: '👊', mint: 'PuncHcoiN111111111111111111111111111111111', priceUsd: 0.0000028, change24h: -4,  volume24h: 305_000,    mcap: 2_830_000, ageHours: 50, watched: false },
  { ticker: 'APPLE',  name: 'Apple',     emoji: '🍎', mint: 'ApPLecoiN111111111111111111111111111111111', priceUsd: 0.00000048, change24h: -0.5, volume24h: 88_000, mcap: 481_000, ageHours: 28, watched: false },
];

const PRICE_BOOKS = [
  { label: 'Bids', side: 'buy' as const, rows: [
    { price: 0.0000214, size: 12_500 },
    { price: 0.0000213, size: 22_100 },
    { price: 0.0000212, size: 8_400 },
    { price: 0.0000210, size: 47_900 },
    { price: 0.0000208, size: 31_200 },
  ]},
  { label: 'Asks', side: 'sell' as const, rows: [
    { price: 0.0000216, size: 9_800 },
    { price: 0.0000217, size: 14_500 },
    { price: 0.0000219, size: 41_200 },
    { price: 0.0000221, size: 6_700 },
    { price: 0.0000223, size: 18_900 },
  ]},
];

export function TerminalPage(): JSX.Element {
  const [showOnlyWatched, setShowOnlyWatched] = useState(false);
  const rows = showOnlyWatched ? WATCHLIST.filter((r) => r.watched) : WATCHLIST;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-semibold tracking-tight">
            <LineChart className="h-6 w-6 text-primary" />
            Terminal
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Power-user view — multi-token watchlist, quick-buy, and live order book.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowOnlyWatched((v) => !v)}
            className={cn(
              'inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition-colors',
              showOnlyWatched
                ? 'border-primary/60 bg-primary/10 text-primary'
                : 'border-border bg-surface-elevated text-text-muted hover:text-text-primary',
            )}
          >
            {showOnlyWatched ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            Watchlist only
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-surface-elevated text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Card padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-text-muted bg-surface-elevated">
                    <Th className="w-7"> </Th>
                    <Th>Token</Th>
                    <Th align="right">Price</Th>
                    <Th align="right">24h</Th>
                    <Th align="right">Volume</Th>
                    <Th align="right">Mcap</Th>
                    <Th align="right">Age</Th>
                    <Th align="right">Trade</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <WatchRow key={r.mint} row={r} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <Card title="Order book" description="$BUTT · live">
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              {PRICE_BOOKS.map((book) => (
                <div key={book.label}>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1.5">
                    {book.label}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {book.rows.map((row, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex items-center justify-between rounded px-1.5 py-0.5',
                          book.side === 'buy' ? 'text-primary' : 'text-danger',
                        )}
                      >
                        <span className="tabular-nums">{row.price.toFixed(7)}</span>
                        <span className="tabular-nums text-text-muted">
                          {row.size.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-text-muted">Spread</span>
              <span className="font-mono text-text-primary">0.93%</span>
            </div>
          </Card>

          <Card title="Quick buy" description="One-click on selected token">
            <div className="grid grid-cols-4 gap-1.5">
              {[0.1, 0.5, 1, 5].map((sol) => (
                <button
                  key={sol}
                  type="button"
                  className="h-10 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                >
                  {sol} SOL
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-text-muted">
              Hotkeys: <kbd className="font-mono text-text-primary">1 2 3 4</kbd>{' '}
              for {`{0.1 / 0.5 / 1 / 5}`} SOL on the focused row.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function WatchRow({ row }: { row: Row }): JSX.Element {
  const up = row.change24h >= 0;
  return (
    <tr className="border-t border-border hover:bg-surface-elevated/40 transition-colors">
      <Td>
        <button
          type="button"
          className={cn(
            'p-1 rounded text-text-muted hover:text-text-primary',
            row.watched && 'text-accent',
          )}
          aria-label="Toggle watchlist"
        >
          <Star className={cn('h-3.5 w-3.5', row.watched && 'fill-current')} />
        </button>
      </Td>
      <Td>
        <Link
          to={`/token/${row.mint}`}
          className="flex items-center gap-2 hover:text-primary transition-colors"
        >
          <span className="grid place-items-center h-7 w-7 rounded-md bg-surface-elevated border border-border text-base">
            {row.emoji}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-tight">{row.name}</p>
            <p className="text-[10px] font-mono text-text-muted leading-tight">${row.ticker}</p>
          </div>
        </Link>
      </Td>
      <Td align="right" className="font-mono tabular-nums">
        ${row.priceUsd.toFixed(7)}
      </Td>
      <Td align="right">
        <span
          className={cn(
            'inline-flex items-center gap-0.5 font-mono tabular-nums',
            up ? 'text-primary' : 'text-danger',
          )}
        >
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {up ? '+' : ''}
          {row.change24h.toFixed(1)}%
        </span>
      </Td>
      <Td align="right" className="font-mono tabular-nums text-text-muted">
        ${formatCompact(row.volume24h)}
      </Td>
      <Td align="right" className="font-mono tabular-nums">
        ${formatCompact(row.mcap)}
      </Td>
      <Td align="right" className="font-mono tabular-nums text-text-muted">
        {row.ageHours < 24 ? `${row.ageHours}h` : `${Math.floor(row.ageHours / 24)}d`}
      </Td>
      <Td align="right">
        <button
          type="button"
          className="inline-flex items-center gap-1 h-7 px-2 rounded-md bg-primary text-background text-[11px] font-semibold hover:bg-primary-600 transition-colors"
        >
          <Zap className="h-3 w-3" />
          Buy
        </button>
      </Td>
    </tr>
  );
}

function formatCompact(n: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(
    n,
  );
}

function Th({
  children,
  align = 'left',
  className,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}): JSX.Element {
  return (
    <th
      className={cn(
        'px-3 py-2 font-medium',
        align === 'right' ? 'text-right' : 'text-left',
        className,
      )}
    >
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
        'px-3 py-2.5 align-middle',
        align === 'right' ? 'text-right' : 'text-left',
        className,
      )}
    >
      {children}
    </td>
  );
}
