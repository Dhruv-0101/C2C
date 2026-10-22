import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/features/notifications/api/notification.api';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';

/**
 * Enterprise Admin Broadcasts Hook
 * Handles campaign composition, live audience estimation, dispatch mutations, and history.
 */
export const useAdminBroadcasts = (initialParams = { page: 1, limit: 10 }) => {
  const queryClient = useQueryClient();
  const [params, setParams] = useState(initialParams);
  const [selectedAudience, setSelectedAudience] = useState('ALL');

  // Fetch paginated broadcast history
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    isError: isHistoryError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.BROADCASTS(params),
    queryFn: () => notificationApi.getBroadcasts(params),
    staleTime: 1000 * 30, // 30s
  });

  const broadcasts = historyData?.broadcasts || [];
  const pagination = historyData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Fetch audience size estimate for real-time form counter
  const {
    data: audienceEstimate,
    isLoading: isLoadingEstimate,
    refetch: refetchEstimate,
  } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.AUDIENCE_ESTIMATE(selectedAudience),
    queryFn: () => notificationApi.getAudienceEstimate(selectedAudience),
    staleTime: 1000 * 60, // 1 min
  });

  // Broadcast dispatch mutation
  const broadcastMutation = useMutation({
    mutationFn: (payload) => notificationApi.sendBroadcast(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.ALL });
    },
  });

  // Admin test push to own registered device
  const testPushMutation = useMutation({
    mutationFn: (payload) => notificationApi.sendTestPush(payload),
  });

  return {
    broadcasts,
    pagination,
    params,
    setParams,
    selectedAudience,
    setSelectedAudience,
    audienceEstimate: audienceEstimate || { userCount: 0, deviceCount: 0 },
    isLoadingHistory,
    isHistoryError,
    isLoadingEstimate,
    refetchHistory,
    refetchEstimate,
    sendBroadcast: broadcastMutation.mutateAsync,
    isBroadcasting: broadcastMutation.isPending,
    sendTestPush: testPushMutation.mutateAsync,
    isSendingTest: testPushMutation.isPending,
  };
};

export default useAdminBroadcasts;
