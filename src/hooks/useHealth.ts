import { useQuery } from '@tanstack/react-query';
import { getHealth, ApiError } from '../services/api';
import { HealthResponse } from '../types/api';

export function useHealth() {
  const query = useQuery<HealthResponse, ApiError>({
    queryKey: ['health'],
    queryFn: getHealth,
    refetchInterval: 60000, // poll every 60s
    retry: 2,
    staleTime: 30000,
  });

  const isStale =
    query.data?.status === 'stale' ||
    (query.error instanceof ApiError && query.error.status === 503);

  return {
    ...query,
    health: query.data,
    isStale,
    isHealthy: query.data?.status === 'ok' && !isStale,
  };
}
