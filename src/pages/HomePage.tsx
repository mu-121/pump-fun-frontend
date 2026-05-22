import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChevronRight,
  Flame,
  LayoutGrid,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import { LiveTape } from '@/components/token/LiveTape';
import { TokenList } from '@/components/token/TokenList';
import { HorizontalScroll } from '@/components/token/HorizontalScroll';
import { CompactTokenCard } from '@/components/token/CompactTokenCard';
import { TrendingTokenCard } from '@/components/token/TrendingTokenCard';
import { useTokens } from '@/hooks/useTokens';
import { useLiveTokens } from '@/hooks/useLiveTokens';
import { useLiveTrades } from '@/hooks/useLiveTrades';
import { cn } from '@/lib/utils';
import type { SortOption } from '@/types';

const EXPLORE_FILTERS: Array<{ value: SortOption; label: string; icon?: typeof Star }> = [
  { value: 'trending', label: 'Movers', icon: Star },
  { value: 'new', label: 'New', icon: Sparkles },
  { value: 'graduating', label: 'Graduating', icon: Flame },
  { value: 'graduated', label: 'Graduated', icon: TrendingUp },
];

const VALID_SORTS = new Set<SortOption>(['new', 'trending', 'graduating', 'graduated']);

function readSortFromParams(params: URLSearchParams): SortOption {
  const raw = params.get('sort');
  return raw && VALID_SORTS.has(raw as SortOption) ? (raw as SortOption) : 'trending';
}

export function HomePage(): JSX.Element {
  useLiveTokens();
  useLiveTrades();

  const [searchParams, setSearchParams] = useSearchParams();
  const sort = useMemo(() => readSortFromParams(searchParams), [searchParams]);
  const search = searchParams.get('search')?.trim() || undefined;

  const graduatingQuery = useTokens({ sort: 'graduating' });
  const trendingQuery = useTokens({ sort: 'trending' });
  const exploreQuery = useTokens({ sort, search });

  const graduating = graduatingQuery.data?.pages[0]?.items.slice(0, 8) ?? [];
  const trending = trendingQuery.data?.pages[0]?.items.slice(0, 6) ?? [];

  const setSort = (next: SortOption): void => {
    const params = new URLSearchParams(searchParams);
    if (next === 'trending') params.delete('sort');
    else params.set('sort', next);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="flex flex-col gap-8 font-['Inter']">
      <LiveTape />

      {/* Graduating soon */}
      <section>
        <SectionHeader
          title="Graduating soon"
          className="mb-3"
          icon={<Flame className="h-4 w-4 text-orange-400" />}
          action={
            <button
              type="button"
              onClick={() => setSort('graduating')}
              className="text-xs font-medium text-text-muted hover:text-primary flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </button>
          }
        />
        {graduatingQuery.isLoading ? (
          <StripSkeleton />
        ) : graduating.length === 0 ? (
          <p className="text-sm text-text-muted py-4">No tokens close to graduation yet.</p>
        ) : (
          <HorizontalScroll>
            {graduating.map((token, i) => (
              <CompactTokenCard key={token.mintAddress} token={token} rank={i + 1} />
            ))}
          </HorizontalScroll>
        )}
      </section>

      {/* Trending now */}
      <section>
        <SectionHeader
          title="Trending now"
          className="mb-3"
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
        />
        {trendingQuery.isLoading ? (
          <StripSkeleton tall />
        ) : trending.length === 0 ? (
          <p className="text-sm text-text-muted py-4">No trending tokens yet.</p>
        ) : (
          <HorizontalScroll>
            {trending.map((token) => (
              <TrendingTokenCard key={token.mintAddress} token={token} />
            ))}
          </HorizontalScroll>
        )}
      </section>

      {/* Explore coins */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Explore coins"
          icon={<LayoutGrid className="h-4 w-4 text-text-muted" />}
        />

        <div className="inline-flex flex-wrap items-center w-fit relative h-auto w-auto justify-start gap-1 rounded-xl border border-[#27272A] bg-[#18191B] p-1 font-['Inter']">
          {EXPLORE_FILTERS.map(({ value, label, icon: Icon }) => {
            const active = sort === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setSort(value)}
                className={cn(
                  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-[Inter] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 relative z-10 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200',
                  active
                    ? 'bg-[#86EFAC] text-black shadow-sm'
                    : 'text-[#A1A1AA] hover:bg-[#27272A]/60 hover:text-[#FAFAFA]'
                )}
              >
                {Icon ? <Icon className={cn("h-4 w-4", active ? "text-black" : "")} /> : null}
                {label}
              </button>
            );
          })}
        </div>

        <TokenList
          variant="explore"
          pages={exploreQuery.data?.pages}
          isLoading={exploreQuery.isLoading}
          isFetchingNextPage={exploreQuery.isFetchingNextPage}
          hasNextPage={Boolean(exploreQuery.hasNextPage)}
          fetchNextPage={exploreQuery.fetchNextPage}
          error={exploreQuery.error}
          emptyMessage={
            search
              ? `No tokens matching "${search}"`
              : sort === 'graduated'
                ? 'No graduated tokens yet'
                : 'No tokens yet — be the first to launch'
          }
        />
      </section>
    </div>
  );
}

function SectionHeader({
  title,
  icon,
  action,
  className,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <h2 className="font-medium text-[20px] text-[#FAFAFA]">
        {/* {icon} */}
        {title}
      </h2>
      {action}
    </div>
  );
}

function StripSkeleton({ tall }: { tall?: boolean }): JSX.Element {
  return (
    <div className={cn('flex gap-3 overflow-hidden', tall ? 'h-[180px]' : 'h-[72px]')}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'shrink-0 rounded-xl bg-surface-elevated animate-pulse border border-border',
            tall ? 'w-[300px] h-full' : 'w-[200px] h-full',
          )}
        />
      ))}
    </div>
  );
}
