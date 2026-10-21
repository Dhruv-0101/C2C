import { useQuery } from '@tanstack/react-query';
import { billingApi } from '@/features/billing/api/billing.api';
import { useAuth } from '@/features/auth/hooks/useAuth';

/**
 * 🧾 useBillingHistory Hook
 * Fetches user's paginated billing transaction ledger & payment history.
 *
 * @param {Object} options
 * @param {number} [options.page=1]
 * @param {number} [options.limit=10]
 */
export const useBillingHistory = ({ page = 1, limit = 10 } = {}) => {
  const { isAuthenticated } = useAuth();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['billing', 'history', page, limit],
    queryFn: () => billingApi.getHistory({ page, limit }),
    enabled: Boolean(isAuthenticated),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const responsePayload = data?.data;
  const transactions = Array.isArray(responsePayload?.data)
    ? responsePayload.data
    : Array.isArray(responsePayload)
    ? responsePayload
    : [];

  const meta = responsePayload?.meta || {
    totalCount: transactions.length,
    page,
    limit,
    totalPages: 1,
  };

  return {
    transactions,
    meta,
    isLoading,
    isError,
    error,
    refetchHistory: refetch,
  };
};

export default useBillingHistory;
