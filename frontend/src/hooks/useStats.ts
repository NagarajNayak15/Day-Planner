import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/lib/api';

export const statsKeys = {
  all: ['stats'] as const,
};

export function useStats() {
  return useQuery({
    queryKey: statsKeys.all,
    queryFn: async () => (await statsApi.get()).stats,
  });
}
