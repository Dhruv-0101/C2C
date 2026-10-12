import { useQuery } from '@tanstack/react-query';
import { adminFinanceApi } from '@/features/admin/finance/api/finance.api.js';

/**
 * useUserLedger Hook
 * Fetches the complete immutable financial ledger / transactions history for a specific business user.
 *
 * @param {string} userId - UUID of the target user
 * @param {Object} [params={}] - Pagination & filter parameters ({ page, limit, search, status, transactionType })
 * @param {Object} [options={}] - Additional query options
 */
export function useUserLedger(userId, params = {}, options = {}) {
  const query = useQuery({
    queryKey: ['admin', 'user-ledger', userId, params],
    queryFn: async () => {
      const response = await adminFinanceApi.getTransactions({
        userId,
        ...params,
      });
      return response;
    },
    enabled: Boolean(userId) && (options.enabled !== false),
    staleTime: 1000 * 60, // 1 minute
    ...options,
  });

  const transactions =
    query.data?.data?.items ||
    query.data?.items ||
    query.data?.data?.transactions ||
    query.data?.transactions ||
    [];

  const meta = query.data?.meta || {
    page: params.page || 1,
    limit: params.limit || 10,
    totalItems: query.data?.data?.totalCount || query.data?.totalCount || transactions.length,
    totalPages: query.data?.data?.totalPages || query.data?.totalPages || 1,
  };

  return {
    transactions,
    meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useUserLedger;
