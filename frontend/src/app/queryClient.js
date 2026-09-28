import { QueryClient } from '@tanstack/react-query';

/**
 * ⚡ TANSTACK QUERY (REACT QUERY) ENTERPRISE CLIENT
 * Centralized query caching configuration for maximum frontend performance.
 * 
 * - staleTime: 5 minutes data freshness (prevents unnecessary network round-trips on tab switch)
 * - gcTime: 15 minutes garbage collection time (keeps cached queries in memory for fast navigation)
 * - refetchOnWindowFocus: false (eliminates UI flashing on window focus)
 * - refetchOnReconnect: true (auto re-fetches when internet connection recovers)
 * - retry: 1 (retries once on network failure)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default queryClient;
