import { cn } from '@/lib/utils';

interface BondingProgressBarProps {
  /** 0..1 ratio. */
  value: number;
  className?: string;
  showLabel?: boolean;
  thickness?: 'thin' | 'thick';
}

/**
 * Just the horizontal progress bar. Use `BondingProgress` (card) for the
 * fully-formatted detail-page version.
 */
export function BondingProgressBar({
  value,
  className,
  showLabel = true,
  thickness = 'thin',
}: BondingProgressBarProps): JSX.Element {
  const pct = Math.max(0, Math.min(100, value * 100));
  const filled = pct >= 100;
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'relative flex-1 rounded-full bg-surface-elevated overflow-hidden',
          thickness === 'thin' ? 'h-1.5' : 'h-2.5',
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            filled ? 'bg-accent' : 'bg-primary',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel ? (
        <span className="text-[10px] font-mono tabular-nums text-text-muted shrink-0">
          {pct.toFixed(0)}%
        </span>
      ) : null}
    </div>
  );
}
