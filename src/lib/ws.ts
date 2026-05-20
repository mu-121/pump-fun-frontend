import { io, type Socket } from 'socket.io-client';
import { env } from './env';

export type FeedKey = 'feed:new' | 'feed:trending' | 'feed:graduating' | 'feed:graduated';

export interface ServerToClientEvents {
  newToken: (payload: unknown) => void;
  trade: (payload: unknown) => void;
  tokenState: (payload: unknown) => void;
  graduation: (payload: unknown) => void;
}

export interface ClientToServerEvents {
  subscribe: (payload: { room: string }) => void;
  unsubscribe: (payload: { room: string }) => void;
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | undefined;

/**
 * Lazily create (and reuse) a single Socket.io connection to the backend.
 * Auto-reconnects with exponential backoff.
 */
export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (socket) return socket;
  socket = io(env.wsUrl, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 10_000,
    reconnectionAttempts: Infinity,
    withCredentials: true,
  });
  return socket;
}

export function joinToken(mint: string): void {
  getSocket().emit('subscribe', { room: `token:${mint}` });
}

export function leaveToken(mint: string): void {
  getSocket().emit('unsubscribe', { room: `token:${mint}` });
}

export function joinFeed(feed: FeedKey): void {
  getSocket().emit('subscribe', { room: feed });
}

export function leaveFeed(feed: FeedKey): void {
  getSocket().emit('unsubscribe', { room: feed });
}

export type Unsubscribe = () => void;

export function onTrade(cb: (payload: unknown) => void): Unsubscribe {
  const s = getSocket();
  s.on('trade', cb);
  return () => {
    s.off('trade', cb);
  };
}

export function onNewToken(cb: (payload: unknown) => void): Unsubscribe {
  const s = getSocket();
  s.on('newToken', cb);
  return () => {
    s.off('newToken', cb);
  };
}

export function onGraduation(cb: (payload: unknown) => void): Unsubscribe {
  const s = getSocket();
  s.on('graduation', cb);
  return () => {
    s.off('graduation', cb);
  };
}

export function onTokenState(cb: (payload: unknown) => void): Unsubscribe {
  const s = getSocket();
  s.on('tokenState', cb);
  return () => {
    s.off('tokenState', cb);
  };
}
