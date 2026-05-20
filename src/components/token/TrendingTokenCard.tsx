import { memo } from 'react';
import { Link } from 'react-router-dom';
import { formatMarketCap } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Token } from '@/types';

interface TrendingTokenCardProps {
  token: Token;
  className?: string;
}

/** Wide feature card for the trending carousel. */
export const TrendingTokenCard = memo(function TrendingTokenCard({
  token,
  className,
}: TrendingTokenCardProps): JSX.Element {
  const initial = (token.symbol || token.name || '?').slice(0, 1).toUpperCase();

  return (
    <Link
      to={`/token/${token.mintAddress}`}
      className={cn(
        'block shrink-0 w-[280px] sm:w-[320px] snap-start group',
        className,
      )}
    >
      <article
        className={cn(
          'relative h-[180px] rounded-2xl overflow-hidden border border-border',
          'transition-all group-hover:border-primary/40 group-hover:shadow-glow-primary',
        )}
      >
        {token.imageUrl ? (
          <img
            src={token.imageUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface grid place-items-center text-5xl font-bold text-text-muted">
            {initial}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-lg font-bold text-white truncate">{token.name || 'Unnamed'}</p>
          <p className="text-xs text-white/70 font-mono">${token.symbol}</p>
          <p className="mt-2 text-base font-mono font-semibold text-primary tabular-nums">
            {formatMarketCap(token.marketCapUsd)} MC
          </p>
          {token.description ? (
            <p className="mt-1 text-xs text-white/60 line-clamp-1">{token.description}</p>
          ) : null}
        </div>
      </article>
    </Link>
  );
});
