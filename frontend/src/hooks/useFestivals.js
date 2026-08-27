import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { festivalApi } from '@/services/festival.api';
import { QUERY_KEYS } from '@/constants/queryKeys';

/**
 * Custom TanStack Query Hook for Festival Calendar Data & Operations
 * @param {{ year?: number|string, includeInactive?: boolean }} [options={ includeInactive: true }]
 */
export const useFestivals = (options = { includeInactive: true }) => {
  const queryClient = useQueryClient();

  const festivalsQuery = useQuery({
    queryKey: [...QUERY_KEYS.FESTIVALS.ALL, options],
    queryFn: async () => {
      const response = await festivalApi.getFestivals(options);
      // Handle array vs object response structures safely
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (Array.isArray(response.data?.festivals)) {
        return response.data.festivals;
      }
      if (Array.isArray(response.festivals)) {
        return response.festivals;
      }
      return [];
    },
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
    festivals: Array.isArray(festivalsQuery.data) ? festivalsQuery.data : [],
    isLoading: festivalsQuery.isLoading,
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
