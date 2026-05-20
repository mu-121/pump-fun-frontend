import { memo } from 'react';
import { Link } from 'react-router-dom';
import { bondingProgress, formatMarketCap } from '@/lib/format';
import { curveReserves } from '@/lib/curve';
import { cn } from '@/lib/utils';
import type { Token } from '@/types';

interface CompactTokenCardProps {
  token: Token;
  rank: number;
  className?: string;
}

/** Small ranked card for horizontal “graduating” strip. */
export const CompactTokenCard = memo(function CompactTokenCard({
  token,
  rank,
  className,
}: CompactTokenCardProps): JSX.Element {
  const initial = (token.symbol || token.name || '?').slice(0, 1).toUpperCase();
  const progress = bondingProgress(curveReserves(token).solLamports);
  const pct = Math.round(progress * 100);

  return (
    <Link
      to={`/token/${token.mintAddress}`}
      className={cn(
        'flex shrink-0 w-[200px] snap-start items-center gap-3 p-3 rounded-xl',
        'border border-border bg-surface hover:bg-surface-elevated hover:border-primary/30 transition-colors',
        className,
      )}
    >
      <span className="text-lg font-bold text-text-muted tabular-nums w-5">{rank}</span>
      {token.imageUrl ? (
        <img
          src={token.imageUrl}
          alt=""
          className="h-11 w-11 rounded-full object-cover border border-border shrink-0"
        />
      ) : (
        <div className="h-11 w-11 rounded-full bg-surface-elevated border border-border grid place-items-center text-sm font-bold text-text-muted shrink-0">
          {initial}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text-primary truncate">${token.symbol}</p>
        <p className="text-xs font-mono text-text-muted tabular-nums">
          {formatMarketCap(token.marketCapUsd)}
        </p>
        <p className="text-[10px] text-primary font-mono mt-0.5">{pct}% to grad</p>
      </div>
    </Link>
  );
});
