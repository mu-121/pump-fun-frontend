import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/lib/api';

export function useProfile(address: string | undefined) {
  return useQuery({
    queryKey: ['profile', address],
    queryFn: () => {
      if (!address) throw new Error('address required');
      return getProfile(address);
    },
    enabled: Boolean(address),
    refetchInterval: 30_000,
  });
}
