import { useQuery } from '@tanstack/react-query';
import { getCandles, type CandlesParams } from '@/lib/api';

export function useCandles(mint: string | undefined, params: CandlesParams) {
  return useQuery({
    queryKey: ['candles', mint, params],
    queryFn: () => {
      if (!mint) throw new Error('mint required');
      return getCandles(mint, params);
    },
    enabled: Boolean(mint),
    refetchInterval: 30_000,
  });
}
