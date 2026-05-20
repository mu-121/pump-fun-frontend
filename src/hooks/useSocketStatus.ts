import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/ws';

/**
 * `true` while the singleton socket is connected. Updates on
 * connect / disconnect / reconnect events.
 */
export function useSocketStatus(): boolean {
  const [connected, setConnected] = useState<boolean>(() => getSocket().connected);

  useEffect(() => {
    const s = getSocket();
    const onConnect = (): void => setConnected(true);
    const onDisconnect = (): void => setConnected(false);
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    setConnected(s.connected);
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, []);

  return connected;
}
