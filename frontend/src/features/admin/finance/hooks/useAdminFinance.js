import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { adminFinanceApi } from '../api/finance.api.js';
import { QUERY_KEYS } from '@/shared/constants';

export const useAdminFinance = ({
  page = 1,
  limit = 10,
  search = '',
  status = '',
  paymentGateway = '',
  currency = '',
  plan = '',
  startDate = '',
  endDate = '',
} = {}) => {
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);

  // 1. Executive Financial Overview Query
  const {
    data: overviewData,
    isLoading: isLoadingOverview,
    error: overviewError,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: QUERY_KEYS.FINANCE.OVERVIEW,
    queryFn: () => adminFinanceApi.getOverview(),
    staleTime: 60 * 1000,
  });

  // 2. Paginated Transactions Query
  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: QUERY_KEYS.FINANCE.TRANSACTIONS({
      page,
      limit,
      search,
      status,
      paymentGateway,
      currency,
      plan,
      startDate,
      endDate,
    }),
    queryFn: () => {
      const cleanParams = Object.fromEntries(
        Object.entries({
          page,
          limit,
          search: search?.trim() || undefined,
          status: status || undefined,
          paymentGateway: paymentGateway || undefined,
          currency: currency || undefined,
          plan: plan || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }).filter(([_, v]) => v !== undefined)
      );
      return adminFinanceApi.getTransactions(cleanParams);
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

  // 3. Record Manual Transaction Mutation
  const recordManualMutation = useMutation({
    mutationFn: (data) => adminFinanceApi.recordManualTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FINANCE.ALL });
    },
  });

  // 4. Download CSV Statement Export Handler
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const cleanParams = Object.fromEntries(
        Object.entries({
          search: search?.trim() || undefined,
          status: status || undefined,
          paymentGateway: paymentGateway || undefined,
          currency: currency || undefined,
          plan: plan || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }).filter(([_, v]) => v !== undefined)
      );
      const blob = await adminFinanceApi.exportTransactionsCsv(cleanParams);

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BrandFlow-Financial-Statement-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV statement:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    overview: overviewData?.data || null,
    isLoadingOverview,
    overviewError,
    refetchOverview,

    transactions: transactionsData?.data?.items || [],
    meta: {
      page: transactionsData?.meta?.page || transactionsData?.data?.meta?.page || transactionsData?.data?.currentPage || page,
      limit: transactionsData?.meta?.limit || transactionsData?.data?.meta?.limit || limit,
      totalItems: transactionsData?.meta?.totalItems ?? transactionsData?.data?.meta?.totalItems ?? transactionsData?.data?.totalCount ?? 0,
      totalPages: transactionsData?.meta?.totalPages || transactionsData?.data?.meta?.totalPages || 1,
      currentPage: transactionsData?.meta?.page || transactionsData?.data?.meta?.page || transactionsData?.data?.currentPage || page,
      hasNextPage: (transactionsData?.meta?.page || transactionsData?.data?.meta?.page || page) < (transactionsData?.meta?.totalPages || transactionsData?.data?.meta?.totalPages || 1),
      hasPrevPage: (transactionsData?.meta?.page || transactionsData?.data?.meta?.page || page) > 1,
    },
    isLoadingTransactions,
    transactionsError,
    refetchTransactions,

    recordManualMutation,
    handleExportCsv,
    isExporting,
  };
};

export default useAdminFinance;
