import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { festivalApi } from '@/services/festival.api';
import { QUERY_KEYS } from '@/constants/queryKeys';

/**
 * Custom TanStack Query Hook for Festival Calendar Data & Operations
 * @param {{ year?: number|string, includeInactive?: boolean }} [options={ includeInactive: true }]
 */
export const useFestivals = (options = { includeInactive: true, limit: 100 }) => {
  const queryClient = useQueryClient();

  const festivalsQuery = useQuery({
    queryKey: [...QUERY_KEYS.FESTIVALS.ALL, options],
    queryFn: async () => {
      const response = await festivalApi.getFestivals(options);
      const list =
        response?.data?.festivals ||
        response?.festivals ||
        (Array.isArray(response?.data) ? response.data : []) ||
        [];
      const meta = response?.meta || response?.data?.meta || null;
      return { festivals: Array.isArray(list) ? list : [], meta };
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const createFestivalMutation = useMutation({
    mutationFn: (data) => festivalApi.createFestival(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FESTIVALS.ALL });
    },
  });

  const updateFestivalMutation = useMutation({
    mutationFn: ({ id, data }) => festivalApi.updateFestival(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FESTIVALS.ALL });
    },
  });

  const deleteFestivalMutation = useMutation({
    mutationFn: (id) => festivalApi.deleteFestival(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FESTIVALS.ALL });
    },
  });

  return {
    festivals: festivalsQuery.data?.festivals || [],
    meta: festivalsQuery.data?.meta || null,
    isLoading: festivalsQuery.isLoading,
    isFetching: festivalsQuery.isFetching,
    isError: festivalsQuery.isError,
    error: festivalsQuery.error,
    refetch: festivalsQuery.refetch,
    createFestival: createFestivalMutation.mutateAsync,
    isCreating: createFestivalMutation.isPending,
    createError: createFestivalMutation.error,
    updateFestival: (id, data) => updateFestivalMutation.mutateAsync({ id, data }),
    isUpdating: updateFestivalMutation.isPending,
    updateError: updateFestivalMutation.error,
    deleteFestival: deleteFestivalMutation.mutateAsync,
    isDeleting: deleteFestivalMutation.isPending,
  };
};
