import { memo } from 'react';
import { Link } from 'react-router-dom';
import { bondingProgress, formatMarketCap } from '@/lib/format';
import { curveReserves } from '@/lib/curve';
import { cn } from '@/lib/utils';
import type { Token } from '@/types';

interface ExploreTokenCardProps {
  token: Token;
  index?: number;
  className?: string;
}

/** Image-forward grid card — pump.fun explore style. */
export const ExploreTokenCard = memo(function ExploreTokenCard({
  token,
  index = 0,
  className,
}: ExploreTokenCardProps): JSX.Element {
  const initial = (token.symbol || token.name || '?').slice(0, 1).toUpperCase();
  const progress = bondingProgress(curveReserves(token).solLamports);

  return (
    <Link
      to={`/token/${token.mintAddress}`}
      className={cn(
        'group block snap-start animate-fade-in motion-reduce:animate-none',
        className,
      )}
      style={{ animationDelay: `${Math.min(index, 24) * 15}ms`, animationFillMode: 'backwards' }}
    >
      <article
        className={cn(
          'relative aspect-square rounded-2xl overflow-hidden border border-border',
          'bg-surface-elevated transition-all duration-200',
          'group-hover:border-primary/40 group-hover:shadow-glow-primary',
        )}
      >
        {token.imageUrl ? (
          <img
            src={token.imageUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-surface-elevated to-surface text-4xl font-bold text-text-muted">
            {initial}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        {token.isGraduated ? (
          <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-accent/90 text-white">
            Graduated
          </span>
        ) : progress > 0.7 ? (
          <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/90 text-background">
            Hot
          </span>
        ) : null}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-sm font-bold text-white truncate">{token.name || 'Unnamed'}</p>
          <p className="text-xs font-mono text-white/80">${token.symbol}</p>
          <p className="mt-1.5 text-sm font-mono font-semibold text-primary tabular-nums">
            {formatMarketCap(token.marketCapUsd)}
          </p>
        </div>
      </article>
    </Link>
  );
});
