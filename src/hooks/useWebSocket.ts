import { useEffect } from 'react';
import {
  getSocket,
  joinFeed,
  joinToken,
  leaveFeed,
  leaveToken,
  onGraduation,
  onNewToken,
  onTokenState,
  onTrade,
  type FeedKey,
} from '@/lib/ws';

export interface UseWebSocketHandlers {
  onTrade?: (payload: unknown) => void;
  onNewToken?: (payload: unknown) => void;
  onGraduation?: (payload: unknown) => void;
  onTokenState?: (payload: unknown) => void;
}

/**
 * Subscribe to backend WS events. Pass `token` to auto-join `token:<mint>`,
 * or `feed` to auto-join a feed room. Cleans up on unmount.
 */
export function useWebSocket(opts: {
  token?: string;
  feed?: FeedKey;
  handlers?: UseWebSocketHandlers;
} = {}): void {
  const { token, feed, handlers } = opts;

  useEffect(() => {
    // Force a single socket connection
    getSocket();
    if (token) joinToken(token);
    if (feed) joinFeed(feed);
    return () => {
      if (token) leaveToken(token);
      if (feed) leaveFeed(feed);
    };
  }, [token, feed]);

  useEffect(() => {
    if (!handlers) return;
    const offs: Array<() => void> = [];
    if (handlers.onTrade) offs.push(onTrade(handlers.onTrade));
    if (handlers.onNewToken) offs.push(onNewToken(handlers.onNewToken));
    if (handlers.onGraduation) offs.push(onGraduation(handlers.onGraduation));
    if (handlers.onTokenState) offs.push(onTokenState(handlers.onTokenState));
    return () => {
      for (const off of offs) off();
    };
  }, [handlers]);
}
