import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialApi } from '../services/social.api';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * Custom Hook for Social Accounts Management & OAuth Integrations
 */
export function useSocialAccounts(initialPage = 1, initialLimit = 10) {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  // Handle Meta OAuth Redirect Success / Error query parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const socialSuccess = urlParams.get('social_success');
    const account = urlParams.get('account');
    const error = urlParams.get('error');

    if (socialSuccess === 'true' && account) {
      setSuccessMsg(`🎉 Social Account ${account} connected successfully! Live post publishing is ready.`);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOCIAL.ALL });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      setErrorMsg(`Connection Error: ${error}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [queryClient]);

  // Fetch Connected Social Accounts
  const {
    data: accountsResponse,
    isLoading: isLoadingAccounts,
    refetch,
  } = useQuery({
    queryKey: [...QUERY_KEYS.SOCIAL.ALL, page, limit],
    queryFn: () => socialApi.getAccounts({ page, limit }),
  });

  const accounts = accountsResponse?.data?.accounts || [];
  const accountsMeta = accountsResponse?.data?.meta || accountsResponse?.meta;
  const instagramAccount = accounts.find((a) => a.platform === 'INSTAGRAM');
  const facebookAccount = accounts.find((a) => a.platform === 'FACEBOOK');
  const linkedinAccount = accounts.find((a) => a.platform === 'LINKEDIN');

  // Fetch Meta/Instagram Auth URL
  const { data: authUrlResponse, isLoading: isLoadingAuthUrl } = useQuery({
    queryKey: QUERY_KEYS.SOCIAL.AUTH_URL,
    queryFn: () => socialApi.getInstagramAuthUrl(),
  });

  const authUrlData = authUrlResponse?.data;
  const isMetaConfigured = authUrlData?.configured ?? true;

  // Manual Handle Connect Mutation
  const manualConnectMutation = useMutation({
    mutationFn: ({ handle, platform }) => socialApi.connectManualHandle(handle, platform),
    onSuccess: (res) => {
      const name = res.data?.data?.account?.accountName || 'Social Account';
      setSuccessMsg(`🎉 ${name} connected successfully!`);
      queryClient.invalidateQueries({ queryKey: ['socialAccounts'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOCIAL.ALL });
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to connect account.');
    },
  });

  // Disconnect Account Mutation
  const disconnectMutation = useMutation({
    mutationFn: (platform) => socialApi.disconnectAccount(platform),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialAccounts'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOCIAL.ALL });
      setSuccessMsg('');
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to disconnect account.');
    },
  });

  // LinkedIn OAuth Trigger Helper
  const getLinkedinAuthUrl = async () => {
    const res = await socialApi.getLinkedinAuthUrl();
    return res.data?.authUrl || res.authUrl;
  };

  return {
    accounts,
    accountsMeta,
    instagramAccount,
    facebookAccount,
    linkedinAccount,
    page,
    setPage,
    limit,
    setLimit,
    isLoadingAccounts,
    isLoadingAuthUrl,
    authUrlData,
    isMetaConfigured,
    errorMsg,
    setErrorMsg,
    successMsg,
    setSuccessMsg,
    refetch,
    connectManual: manualConnectMutation.mutate,
    isConnectingManual: manualConnectMutation.isPending,
    disconnect: disconnectMutation.mutate,
    isDisconnecting: disconnectMutation.isPending,
    getLinkedinAuthUrl,
  };
}
