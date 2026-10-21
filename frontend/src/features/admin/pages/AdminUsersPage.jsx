import React, { useState, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useUsers } from '@/features/admin/users/hooks/useUsers';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { authApi } from '@/features/auth/api/auth.api';
import { billingApi } from '@/features/billing/api/billing.api';
import { usersApi } from '@/features/admin/users/api/users.api';
import { useFeedbackModal } from '@/components/feedback/FeedbackModal';
import { QUERY_KEYS } from '@/shared/constants';
import { AdminUsersTab } from '../users/AdminUsersTab';

/**
 * AdminUsersPage Component
 * Canonical route page for Business Users Directory (/admin/users).
 */
export const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  const { modalProps, showSuccess, showError } = useFeedbackModal();

  const [userPage, setUserPage] = useState(1);
  const [userLimit, setUserLimit] = useState(10);
  const [userSearch, setUserSearch] = useState('');
  const debouncedUserSearch = useDebounce(userSearch, 300);

  useEffect(() => {
    setUserPage(1);
  }, [debouncedUserSearch]);

  const {
    users,
    meta: userMeta,
    isLoading: isLoadingUsers,
    error: usersFetchError,
  } = useUsers(
    { page: userPage, limit: userLimit, search: debouncedUserSearch },
    { enabled: true }
  );

  // Toggle User Active Status Mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }) => authApi.toggleUserStatus(userId, isActive),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ALL });
      if (variables.isActive) {
        showSuccess('Account Activated! 🟢', 'User account has been activated successfully.');
      } else {
        showSuccess(
          'Account Deactivated! 🚫',
          'User account deactivated. All post creation & publishing capabilities have been blocked for this user.'
        );
      }
    },
    onError: (err) => {
      showError('Action Failed ⚠️', err.message || 'Failed to update user account status.');
    },
  });

  // Admin Quota Top-Up Mutation
  const topUpUserQuotaMutation = useMutation({
    mutationFn: ({ userId, bonusPosts }) => billingApi.adminTopUpQuota(userId, bonusPosts),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTION.ALL });
      showSuccess(
        'Quota Top-Up Granted! 🎉',
        `Successfully granted +${variables.bonusPosts || 10} bonus post quota to user.`
      );
    },
    onError: (err) => {
      showError('Top-Up Failed ⚠️', err.message || 'Failed to grant bonus post quota.');
    },
  });

  // Admin Meta Agency Token Connect Mutation
  const connectSocialTokenMutation = useMutation({
    mutationFn: ({ userId, token }) => usersApi.connectSocialToken(userId, token),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ALL });
      showSuccess(
        'Meta Assets Linked! 🚀',
        res?.message || 'Successfully connected Facebook Page and Instagram Account to client!'
      );
    },
    onError: (err) => {
      showError('Connection Failed ⚠️', err.message || 'Failed to verify or connect Meta token.');
    },
  });

  return (
    <>
      <AdminUsersTab
        users={users}
        userMeta={userMeta}
        isLoadingUsers={isLoadingUsers}
        usersFetchError={usersFetchError}
        userSearch={userSearch}
        setUserSearch={setUserSearch}
        userPage={userPage}
        setUserPage={setUserPage}
        setUserLimit={setUserLimit}
        toggleUserStatusMutation={toggleUserStatusMutation}
        topUpUserQuotaMutation={topUpUserQuotaMutation}
        connectSocialTokenMutation={connectSocialTokenMutation}
      />
    </>
  );
};

export default AdminUsersPage;
