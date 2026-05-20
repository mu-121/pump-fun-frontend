import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  padded?: boolean;
}

export function Card({
  title,
  description,
  actions,
  padded = true,
  className,
  children,
  ...rest
}: CardProps): JSX.Element {
  return (
    <div
      className={cn(
        'bg-surface rounded-xl border border-border shadow-glow-sm',
        'transition-colors hover:border-text-muted/30',
        className,
      )}
      {...rest}
    >
      {title || actions ? (
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            {title ? <h3 className="text-sm font-semibold text-text-primary">{title}</h3> : null}
            {description ? (
              <p className="mt-0.5 text-xs text-text-muted">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}
      <div className={padded ? 'p-4' : ''}>{children}</div>
    </div>
  );
}
