import { useEffect, useRef } from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { TokenCard } from './TokenCard';
import { ExploreTokenCard } from './ExploreTokenCard';
import type { Page, Token } from '@/types';
import { cn } from '@/lib/utils';

interface TokenListProps {
  pages: Page<Token>[] | undefined;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  error: Error | null;
  emptyMessage?: string;
  className?: string;
  /** `explore` = image-forward pump.fun grid; default = classic cards */
  variant?: 'default' | 'explore';
}

/**
 * Responsive grid: 1 → 2 → 3 → 4 columns. Renders skeletons during the first
 * load, an empty state when the feed has no items, and an infinite-scroll
 * sentinel that fetches the next page when scrolled into view (with an
 * explicit "Load more" button as a fallback for assistive tech / no-IO browsers).
 */
export function TokenList({
  pages,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  error,
  emptyMessage = 'No tokens yet',
  className,
  variant = 'default',
}: TokenListProps): JSX.Element {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            fetchNextPage();
            return;
          }
        }
      },
      { rootMargin: '400px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (error) {
    return (
      <div className={cn('rounded-xl border border-border bg-surface p-8 text-center', className)}>
        <p className="text-sm text-text-primary font-medium">Couldn't load tokens</p>
        <p className="mt-1 text-xs text-text-muted">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return <GridSkeleton className={className} />;
  }

  const flat: Token[] = pages?.flatMap((p) => p.items) ?? [];
  if (flat.length === 0) {
    return (
      <div className={cn('rounded-xl border border-border bg-surface p-12 text-center', className)}>
        <Inbox className="h-6 w-6 mx-auto text-text-muted" />
        <p className="mt-3 text-sm text-text-primary font-medium">{emptyMessage}</p>
        <p className="mt-1 text-xs text-text-muted">
          When a token shows up, it'll appear here in real time.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div
        className={cn(
          'grid gap-3',
          variant === 'explore'
            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        )}
      >
        {flat.map((token, i) =>
          variant === 'explore' ? (
            <ExploreTokenCard key={token.mintAddress} token={token} index={i} />
          ) : (
            <TokenCard key={token.mintAddress} token={token} index={i} />
          ),
        )}
      </div>
      <div ref={sentinelRef} aria-hidden="true" className="h-1" />
      {hasNextPage ? (
        <div className="flex justify-center pt-2">
          <Button
            variant="secondary"
            loading={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            Load more
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function GridSkeleton({ className }: { className?: string }): JSX.Element {
  return (
    <div className={cn('grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', className)}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="mt-4 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-2/3" />
          <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}
