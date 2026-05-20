import { useEffect } from 'react';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { getToken } from '@/lib/api';
import { getSocket, onNewToken } from '@/lib/ws';
import type { LiveNewTokenPayload, Page, Token } from '@/types';

/**
 * Subscribe to `newToken` WS events. When one arrives we re-fetch the canonical
 * `Token` row from the API (the WS payload is minimal — it carries no
 * name/symbol/image because those come from our DB), then prepend it to the
 * `tokens / sort=new` infinite-query cache.
 *
 * Mount this once at the app level — multiple consumers don't cause duplicate
 * prepends because we de-dupe by mintAddress on insert.
 */
export function useLiveTokens(): void {
  const qc = useQueryClient();

  useEffect(() => {
    getSocket(); // force connect + auto-join `global`
    return onNewToken(async (raw) => {
      const payload = raw as LiveNewTokenPayload | null;
      if (!payload?.mintAddress) return;

      let token: Token;
      try {
        token = await getToken(payload.mintAddress);
      } catch {
        return; // backend not ready yet — next poll will pick it up
      }

      qc.setQueriesData<InfiniteData<Page<Token>>>(
        { queryKey: ['tokens', 'new'], exact: false },
        (prev) => prependToFeed(prev, token),
      );
      qc.setQueriesData<InfiniteData<Page<Token>>>(
        { queryKey: ['tokens', 'trending'], exact: false },
        (prev) => prependToFeed(prev, token),
      );
    });
  }, [qc]);
}

function prependToFeed(
  prev: InfiniteData<Page<Token>> | undefined,
  token: Token,
): InfiniteData<Page<Token>> | undefined {
  if (!prev || prev.pages.length === 0) return prev;
  const firstPage = prev.pages[0];
  if (!firstPage) return prev;
  // De-dup: if the mint already appears anywhere in the cache, skip.
  for (const page of prev.pages) {
    if (page.items.some((t) => t.mintAddress === token.mintAddress)) return prev;
  }
  const nextFirstPage: Page<Token> = {
    items: [token, ...firstPage.items],
    nextCursor: firstPage.nextCursor,
  };
  return {
    ...prev,
    pages: [nextFirstPage, ...prev.pages.slice(1)],
  };
}
