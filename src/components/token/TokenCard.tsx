import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import {
  bondingProgress,
  formatAddress,
  formatMarketCap,
  formatTimeAgo,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { BondingProgressBar } from './BondingProgressBar';
import type { Token } from '@/types';

interface TokenCardProps {
  token: Token;
  /** Render-order index — used for the stagger animation on first mount. */
  index?: number;
  className?: string;
}

/**
 * Memoized so live cache updates (tradeCount++ / marketCapUsd refresh) on
 * unrelated tokens don't re-render every card in the grid.
 */
export const TokenCard = memo(function TokenCard({
  token,
  index = 0,
  className,
}: TokenCardProps): JSX.Element {
  const progress = bondingProgress(token.virtualSolReserves);
  const initial = (token.symbol || token.name || '?').slice(0, 1).toUpperCase();

  return (
    <Link
      to={`/token/${token.mintAddress}`}
      className={cn(
        'group relative block animate-fade-in motion-reduce:animate-none',
        className,
      )}
      style={{ animationDelay: `${Math.min(index, 30) * 20}ms`, animationFillMode: 'backwards' }}
    >
      <div
        className={cn(
          'h-full rounded-xl border border-border bg-surface p-4',
          'transition-colors duration-150',
          'group-hover:border-text-muted/40 group-hover:shadow-glow',
        )}
      >
        <div className="flex items-start gap-3">
          <Avatar imageUrl={token.imageUrl} initial={initial} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-text-primary">
                {token.name || 'Unnamed'}
              </span>
              <span className="text-xs font-mono text-text-muted shrink-0">${token.symbol}</span>
              {token.isGraduated ? <GraduatedBadge /> : null}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-text-muted">
              <span className="font-mono">by {formatAddress(token.creatorAddress, 4, 4)}</span>
              <span>·</span>
              <span>{formatTimeAgo(token.lastTradeAt ?? token.createdAt, { suffix: true })}</span>
            </div>
          </div>
        </div>

        {token.description ? (
          <p className="mt-3 line-clamp-2 text-xs text-text-muted">{token.description}</p>
        ) : null}

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-text-muted">Market cap</div>
            <div className="font-mono text-base font-semibold text-text-primary tabular-nums">
              {formatMarketCap(token.marketCapUsd)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wide text-text-muted">Trades</div>
            <div className="font-mono text-sm text-text-primary tabular-nums">{token.tradeCount}</div>
          </div>
        </div>

        <BondingProgressBar value={progress} className="mt-3" />
      </div>
    </Link>
  );
});

function Avatar({ imageUrl, initial }: { imageUrl: string | null; initial: string }): JSX.Element {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        loading="lazy"
        className="h-12 w-12 rounded-lg object-cover border border-border bg-surface-elevated shrink-0"
      />
    );
  }
  return (
    <div className="h-12 w-12 rounded-lg bg-surface-elevated border border-border grid place-items-center text-sm font-semibold text-text-muted shrink-0">
      {initial}
    </div>
  );
}

function GraduatedBadge(): JSX.Element {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-accent/15 text-accent text-[10px] px-1.5 py-0.5 font-medium shrink-0">
      <Check className="h-3 w-3" />
      Graduated
    </span>
  );
}
