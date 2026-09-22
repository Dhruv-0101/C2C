import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '../services/billing.api';
import { useAuth } from './useAuth';

export const QUERY_KEYS = {
  SUBSCRIPTION: ['subscription', 'status'],
};

export const useSubscription = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Fetch live subscription status & post quota only if user is authenticated
  const {
    data: subscription,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.SUBSCRIPTION,
    queryFn: billingApi.getStatus,
    enabled: Boolean(isAuthenticated),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });

  const openPlanModal = useCallback(() => setIsPlanModalOpen(true), []);
  const closePlanModal = useCallback(() => setIsPlanModalOpen(false), []);

  const postsRemaining = subscription?.postsRemaining !== undefined ? subscription.postsRemaining : 0;
  const planRemaining = subscription?.planRemaining !== undefined ? subscription.planRemaining : 0;
  const bonusRemaining = subscription?.bonusRemaining !== undefined ? subscription.bonusRemaining : 0;
  const hasPlan = !!subscription?.hasPlan;
  const isExpired = subscription?.isExpired || postsRemaining <= 0;
  const planName = subscription?.plan || null;
  const canCreatePost = postsRemaining > 0;


  // Activate Free Plan Mutation
  const activateFreeMutation = useMutation({
    mutationFn: billingApi.activateFreePlan,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTION });
      setSuccessData(data);
    },
  });

  // Verify Razorpay Mutation
  const verifyRazorpayMutation = useMutation({
    mutationFn: billingApi.verifyRazorpayPayment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTION });
      setSuccessData(data);
      closePlanModal();
    },
  });

  // Verify Stripe Mutation
  const verifyStripeMutation = useMutation({
    mutationFn: billingApi.verifyStripePayment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTION });
      setSuccessData(data);
      closePlanModal();
    },
  });

  return {
    subscription,
    isLoading,
    isError,
    refetchSubscription: refetch,
    postsRemaining,
    planRemaining,
    bonusRemaining,
    isExpired,
    hasPlan,
    canCreatePost,
    planName,
    isPlanModalOpen,
    openPlanModal,
    closePlanModal,
    successData,
    setSuccessData,
    activateFreeMutation,
    verifyRazorpayMutation,
    verifyStripeMutation,
  };
};
