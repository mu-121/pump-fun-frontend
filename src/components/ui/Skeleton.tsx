import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={cn(
        'bg-gradient-to-r from-surface-elevated via-border to-surface-elevated bg-[length:200%_100%] animate-shimmer rounded-md',
        className,
      )}
      {...rest}
    />
  );
}
