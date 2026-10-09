import { useQuery } from '@tanstack/react-query';
import { getSystemStatusApi } from '../api/system.api';

export const SYSTEM_STATUS_QUERY_KEY = ['system-status'];

/**
 * ⚡ Custom hook for live system status polling with TanStack Query
 * Auto-refreshes every 30 seconds to keep telemetry current.
 */
export const useSystemStatus = (options = {}) => {
  return useQuery({
    queryKey: SYSTEM_STATUS_QUERY_KEY,
    queryFn: getSystemStatusApi,
    refetchInterval: 30000, // 30s live poll
    staleTime: 10000,
    retry: 2,
    ...options,
  });
};
