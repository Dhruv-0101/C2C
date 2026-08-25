import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Instagram, CheckCircle, AlertCircle, Link2, Unlink, ExternalLink, ShieldCheck, Key, RefreshCw } from 'lucide-react';
import { socialApi } from '../../../services/social.api';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';

export const SocialAccountsManager = () => {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  // Handle Meta OAuth Redirect Success / Error query parameters
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const socialSuccess = urlParams.get('social_success');
    const account = urlParams.get('account');
    const error = urlParams.get('error');

    if (socialSuccess === 'true' && account) {
      setSuccessMsg(`🎉 Instagram Account ${account} connected successfully! Live post publishing is ready.`);
      queryClient.invalidateQueries({ queryKey: ['socialAccounts'] });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      setErrorMsg(`Instagram Connection Error: ${error}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [queryClient]);

  // Fetch Connected Social Accounts
  const { data: accountsResponse, isLoading, refetch } = useQuery({
    queryKey: ['socialAccounts'],
    queryFn: () => socialApi.getAccounts(),
  });

  const accounts = accountsResponse?.data?.accounts || [];
  const instagramAccount = accounts.find((a) => a.platform === 'INSTAGRAM');

  // Fetch Instagram Auth URL
  const { data: authUrlResponse, isLoading: isLoadingAuthUrl } = useQuery({
    queryKey: ['instagramAuthUrl'],
    queryFn: () => socialApi.getInstagramAuthUrl(),
  });

  const authUrlData = authUrlResponse?.data;
  const isMetaConfigured = authUrlData?.configured ?? true;

  const [manualHandle, setManualHandle] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Manual Handle Connect Mutation
  const manualConnectMutation = useMutation({
    mutationFn: (handle) => socialApi.connectManualHandle(handle, 'INSTAGRAM'),
    onSuccess: (res) => {
      const name = res.data?.data?.account?.accountName || 'Instagram Account';
      setSuccessMsg(`🎉 ${name} connected successfully!`);
      setShowManualInput(false);
      setManualHandle('');
      queryClient.invalidateQueries({ queryKey: ['socialAccounts'] });
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to connect Instagram handle.');
    },
  });

  // Disconnect Account Mutation
  const disconnectMutation = useMutation({
    mutationFn: (platform) => socialApi.disconnectAccount(platform),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialAccounts'] });
      setSuccessMsg('');
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to disconnect account.');
    },
  });

  const handleConnectInstagram = () => {
    if (!isMetaConfigured) {
      setShowConfigGuide(true);
      return;
    }
    if (authUrlData?.authUrl) {
      window.location.href = authUrlData.authUrl;
    } else {
      setErrorMsg('Meta App ID is missing in backend .env. Please configure META_APP_ID.');
    }
  };

  return (
    <div className="bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-6 shadow-xl text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-600/20 border border-pink-500/30 text-pink-400">
            <Instagram className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-lg text-white">
              Instagram Business Account Integration
            </h3>
            <p className="text-xs text-slate-400">
              Connect your Instagram Business/Creator account for live automated post publishing.
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="self-start sm:self-auto p-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {successMsg && <Alert variant="success" message={successMsg} />}
      {errorMsg && <Alert variant="error" message={errorMsg} />}

      {/* Main Instagram Status Card */}
      <div className="p-5 rounded-2xl bg-[#0B0F17] border border-[#2C384E] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-glow">
            <Instagram className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-base text-white">Instagram Business & Creator</h4>
              {instagramAccount?.isConnected ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Not Connected</span>
                </span>
              )}
            </div>

            {instagramAccount?.isConnected ? (
              <div className="space-y-0.5 text-xs text-slate-300">
                <a
                  href={`https://instagram.com/${instagramAccount.accountName.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono font-bold text-amber-400 text-sm hover:text-amber-300 hover:underline transition group"
                  title="View profile on Instagram"
                >
                  <span>{instagramAccount.accountName}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition" />
                </a>
                <p className="text-[11px] text-slate-400">
                  Linked via Meta Graph API • Auto-Publish Ready
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Publish branded graphics directly to your Instagram Business feed.
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons & Manual Connect Form */}
        <div className="flex flex-col items-end gap-2">
          {instagramAccount?.isConnected ? (
            <Button
              variant="outline"
              className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs justify-center"
              isLoading={disconnectMutation.isPending}
              onClick={() => disconnectMutation.mutate('INSTAGRAM')}
              icon={Unlink}
            >
              Disconnect Instagram
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Button
                variant="primary"
                className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs justify-center shadow-lg"
                isLoading={isLoadingAuthUrl}
                onClick={handleConnectInstagram}
                icon={Link2}
              >
                Connect via Meta OAuth
              </Button>

              <button
                type="button"
                onClick={() => setShowManualInput(!showManualInput)}
                className="text-xs text-amber-400 hover:underline px-2 py-1 font-semibold"
              >
                {showManualInput ? 'Cancel' : 'Or Enter Username Manually'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Manual Username Input Box */}
      {!instagramAccount?.isConnected && showManualInput && (
        <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-3 animate-in fade-in">
          <label className="text-xs font-semibold text-slate-300 block">
            Enter your exact Instagram Username:
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-mono">@</span>
              <input
                type="text"
                placeholder="your_instagram_username"
                value={manualHandle}
                onChange={(e) => setManualHandle(e.target.value)}
                className="w-full pl-7 pr-3 py-2 rounded-xl bg-[#131B2A] border border-[#2C384E] text-white text-sm font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              isLoading={manualConnectMutation.isPending}
              onClick={() => manualConnectMutation.mutate(manualHandle)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
            >
              Connect Username
            </Button>
          </div>
        </div>
      )}

      {/* Configuration Assistant Box (If Meta Credentials Not Set) */}
      {(!isMetaConfigured || showConfigGuide) && (
        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-4 animate-in fade-in">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Key className="w-4 h-4" />
            <span>Meta App Credentials Required for Live Publishing</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            To publish live posts to real Instagram accounts, configure your Meta App credentials in the backend <code className="bg-[#0B0F17] px-1.5 py-0.5 rounded text-amber-300 font-mono">.env</code> file:
          </p>

          <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-xs font-mono text-slate-200 space-y-1 overflow-x-auto">
            <p className="text-slate-500"># backend/.env</p>
            <p><span className="text-amber-400">META_APP_ID</span>="your_facebook_app_id"</p>
            <p><span className="text-amber-400">META_APP_SECRET</span>="your_facebook_app_secret"</p>
            <p><span className="text-amber-400">META_REDIRECT_URI</span>="http://localhost:5000/api/v1/social/meta/callback"</p>
            <p><span className="text-teal-400">SOCIAL_PUBLISHER_MODE</span>="LIVE"</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
            <a
              href="https://developers.facebook.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-amber-400 hover:underline font-bold"
            >
              <span>Open Meta Developer Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => setShowConfigGuide(false)}
              className="text-slate-400 hover:text-white transition"
            >
              Dismiss Notice
            </button>
          </div>
        </div>
      )}

      {/* Features Badge Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
        <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] flex items-center gap-2.5 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>AES-256 Encrypted Token Storage</span>
        </div>
        <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] flex items-center gap-2.5 text-slate-300">
          <RefreshCw className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <span>60-Day Long-Lived Token Refresh</span>
        </div>
        <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] flex items-center gap-2.5 text-slate-300">
          <Instagram className="w-4 h-4 text-pink-400 flex-shrink-0" />
          <span>2-Step Media Container Publish</span>
        </div>
      </div>
    </div>
  );
};
