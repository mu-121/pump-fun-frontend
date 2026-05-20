import {
  keepPreviousData,
  useInfiniteQuery,
  type InfiniteData,
} from '@tanstack/react-query';
import { listTokens, type ListTokensParams } from '@/lib/api';
import type { Page, SortOption, Token } from '@/types';

const PAGE_SIZE = 50;

export interface UseTokensArgs {
  sort: SortOption;
  search?: string;
}

/**
 * Paginated token feed. One React Query "infinite query" per (sort, search)
 * combo — pages are accumulated in `data.pages`.
 *
 * - `new`: no polling — relies on WS for live additions (see `useLiveTokens`)
 * - `trending`: 30s polling on top of WS
 * - `graduating` / `graduated`: 60s polling
 */
export function useTokens({ sort, search }: UseTokensArgs) {
  const trimmed = search?.trim();
  return useInfiniteQuery<
    Page<Token>,
    Error,
    InfiniteData<Page<Token>>,
    [string, SortOption, string | undefined],
    string | null
  >({
    queryKey: ['tokens', sort, trimmed || undefined],
    queryFn: ({ pageParam }) => {
      const params: ListTokensParams = { sort, limit: PAGE_SIZE };
      if (pageParam) params.cursor = pageParam;
      if (trimmed) params.search = trimmed;
      return listTokens(params);
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
    refetchInterval:
      sort === 'new' ? false : sort === 'trending' ? 30_000 : 60_000,
    refetchIntervalInBackground: false,
  });
}
