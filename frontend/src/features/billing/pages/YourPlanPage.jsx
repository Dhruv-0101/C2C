import React, { useState } from 'react';
import {
  CreditCard,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Download,
  Gift,
  Layers,
  Flame,
  FileText,
  RefreshCw,
  Sliders,
  DollarSign,
  ShieldCheck,
  Check,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSubscription } from '../hooks/useSubscription';
import { useBillingHistory } from '../hooks/useBillingHistory';
import { billingApi } from '../api/billing.api';
import { PlanSelectionModal } from '../components/PlanSelectionModal';
import { PaymentSuccessModal } from '../components/PaymentSuccessModal';
import { formatDate } from '@/shared/utils/date.util';

/**
 * 👑 YourPlanPage Component
 * Full-scale enterprise Subscription & Billing management page for small business owners.
 * Displays live post quota, Admin-granted bonus credits, 1-click Free Plan activation,
 * dynamic Pro Plan slider upgrades, and downloadable PDF tax invoice ledger.
 * Fully responsive across Mobile, Tablet, and Desktop.
 */
export const YourPlanPage = () => {
  const {
    subscription,
    isLoading: isSubLoading,
    refetchSubscription,
    postsRemaining,
    planRemaining,
    bonusRemaining,
    hasPlan,
    isExpired,
    planName,
    isPlanModalOpen,
    openPlanModal,
    closePlanModal,
    successData,
    setSuccessData,
    activateFreeMutation,
  } = useSubscription();

  const {
    transactions,
    meta,
    isLoading: isHistoryLoading,
    refetchHistory,
  } = useBillingHistory({ page: 1, limit: 15 });

  const [downloadingTxId, setDownloadingTxId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);

  // 1-Click Free Plan Activation Handler
  const handleActivateFree = async () => {
    try {
      await activateFreeMutation.mutateAsync();
      await refetchSubscription();
      await refetchHistory();
    } catch (err) {
      console.error('Free plan activation error:', err);
    }
  };

  // Download Invoice PDF Handler
  const handleDownloadInvoice = async (transactionId) => {
    try {
      setDownloadingTxId(transactionId);
      setDownloadError(null);
      await billingApi.downloadInvoice(transactionId);
    } catch (err) {
      console.error('Failed to download invoice:', err);
      setDownloadError(err?.response?.data?.message || err?.message || 'Failed to download invoice.');
    } finally {
      setDownloadingTxId(null);
    }
  };

  // Quota calculation helpers
  const totalPostsAllowed = subscription?.totalPostsAllowed || 0;
  const postsUsed = subscription?.postsUsed || 0;
  const bonusPostsAllowed = subscription?.bonusPostsAllowed || 0;
  const bonusPostsUsed = subscription?.bonusPostsUsed || 0;
  const totalAvailableCredits = (planRemaining || 0) + (bonusRemaining || 0);

  const usagePercent =
    totalPostsAllowed > 0
      ? Math.min(100, Math.round((postsUsed / totalPostsAllowed) * 100))
      : 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-12 max-w-7xl mx-auto">
      {/* 🏷️ Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#24344D]/70 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-extrabold shadow-glow shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-tight">
                Your Plan & Subscriptions
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Manage your active post quota, Admin-granted bonus credits, and invoice history.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              refetchSubscription();
              refetchHistory();
            }}
            disabled={isSubLoading || isHistoryLoading}
            className="text-xs font-semibold text-slate-400 hover:text-white border border-[#24344D] bg-[#0E1624] rounded-xl px-3 py-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSubLoading || isHistoryLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={openPlanModal}
            className="text-xs font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-glow rounded-xl px-4 py-2 cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>Upgrade Plan</span>
          </Button>
        </div>
      </div>

      {/* ⚠️ Download Error Notification */}
      {downloadError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{downloadError}</span>
          </div>
          <button
            onClick={() => setDownloadError(null)}
            className="text-rose-400 hover:text-rose-200 text-xs font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 🚀 Active Plan Hero Section */}
      {!hasPlan ? (
        /* NO_PLAN State: Prompt 1-Click Free Plan Activation */
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A253A] via-[#121A29] to-[#0A0F19] border-2 border-amber-500/40 p-6 sm:p-8 shadow-2xl shadow-amber-500/10">
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" /> No Active Subscription Plan
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
                Activate Your Free Starter Plan (5 Posts)
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                You get 5 complimentary AI visual post generations and multi-platform publishing credits to test BrandFlow for your business. No credit card required!
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" /> 5 Free Live Social Posts
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" /> Nano Banana 2.1 AI Visuals
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" /> Multi-Platform Auto Scheduling
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Button
                type="button"
                variant="primary"
                onClick={handleActivateFree}
                disabled={activateFreeMutation.isPending}
                className="py-3 px-6 rounded-2xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-glow flex items-center justify-center gap-2 cursor-pointer"
              >
                {activateFreeMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Activating Free Plan...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>Activate 5 Free Posts Now 🚀</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={openPlanModal}
                className="py-3 px-5 rounded-2xl text-xs sm:text-sm font-bold border-[#2A3B55] text-white hover:bg-slate-800/80 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>View Pro Pricing</span>
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE PLAN State: Complete Quota, Bonus & Breakdown Card */
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#162032] via-[#0E1624] to-[#080C14] border border-[#24344D] p-5 sm:p-8 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Card Header: Tier Badge & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#24344D]/80">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-lg shrink-0 ${
                  planName === 'PRO'
                    ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-amber-500/20'
                    : 'bg-gradient-to-tr from-indigo-600 to-blue-400 text-white shadow-indigo-500/20'
                }`}
              >
                {planName === 'PRO' ? '👑' : '🎁'}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-tight">
                    {planName === 'PRO' ? 'BrandFlow Pro Subscription' : 'Free Starter Plan'}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isExpired
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {isExpired ? (
                      <>
                        <AlertCircle className="w-3 h-3 text-rose-400" />
                        <span>Quota Exhausted</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Active Plan</span>
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Active since {formatDate(subscription?.createdAt, 'MMM dd, yyyy')} · Auto-renewable credits
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openPlanModal}
              className="text-xs font-bold border-amber-500/40 text-amber-300 hover:bg-amber-500/10 rounded-xl px-4 py-2 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-300" />
              <span>{planName === 'PRO' ? 'Top-Up Credits' : 'Upgrade to Pro'}</span>
            </Button>
          </div>

          {/* 3-Column Quota Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 py-6">
            {/* 1. Plan Posts */}
            <div className="p-4 rounded-2xl bg-[#0B0F17]/90 border border-[#24344D]/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Base Plan Posts</span>
                </span>
                <span className="text-slate-500">{postsUsed} / {totalPostsAllowed} used</span>
              </div>
              <div className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                {planRemaining}{' '}
                <span className="text-xs sm:text-sm font-sans font-medium text-slate-400">
                  posts remaining
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Included in your base {planName || 'FREE'} plan tier.
              </p>
            </div>

            {/* 2. Admin Granted Bonus Posts */}
            <div className="p-4 rounded-2xl bg-[#0B0F17]/90 border border-indigo-500/30 space-y-1.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between text-xs text-indigo-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Admin Bonus Credits</span>
                </span>
                <span className="text-indigo-400/80">{bonusPostsUsed} / {bonusPostsAllowed} used</span>
              </div>
              <div className="text-2xl sm:text-3xl font-heading font-extrabold text-indigo-200">
                {bonusRemaining}{' '}
                <span className="text-xs sm:text-sm font-sans font-medium text-indigo-300/80">
                  bonus remaining
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {bonusPostsAllowed > 0
                  ? 'Special complimentary credits granted directly by platform administrators.'
                  : 'No bonus credits currently granted. Contact support for volume perks.'}
              </p>
            </div>

            {/* 3. Total Available Posts */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-yellow-500/5 to-transparent border border-amber-500/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Total Available Balance</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  Ready to Post
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-heading font-extrabold text-amber-300">
                {totalAvailableCredits}{' '}
                <span className="text-xs sm:text-sm font-sans font-medium text-amber-400/80">
                  total posts
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Combined balance usable for AI creation, scheduling, and live publishing.
              </p>
            </div>
          </div>

          {/* Visual Usage Progress Bar */}
          <div className="space-y-2 pt-2 border-t border-[#24344D]/80">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>Overall Base Quota Consumed</span>
              <span className="font-mono text-white font-bold">{usagePercent}% used</span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#0B0F17] overflow-hidden border border-[#24344D] p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercent >= 90
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400'
                }`}
                style={{ width: `${Math.max(3, usagePercent)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 💳 Pro Plan Value Card / Upgrade Banner */}
      {planName !== 'PRO' && (
        <div className="p-6 rounded-3xl bg-[#0E1624] border border-[#24344D] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                👑 Supercharge Your Social Growth
              </span>
              <span className="text-xs text-slate-400">Starting at ₹10.50 / post</span>
            </div>
            <h3 className="text-lg sm:text-xl font-heading font-extrabold text-white">
              Need more posts? Upgrade to BrandFlow Pro
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Unlock unlimited AI image generation with Gemini Nano Banana 2.1, auto-scheduler with calendar queue, multi-account publishing, and GST invoice receipts.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={openPlanModal}
            className="py-3 px-6 rounded-2xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-glow flex items-center justify-center gap-2 shrink-0 cursor-pointer w-full md:w-auto"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Select Pro Plan Volume</span>
          </Button>
        </div>
      )}

      {/* 🧾 Payment & Billing History Table */}
      <div className="rounded-3xl bg-[#0E1624] border border-[#24344D] overflow-hidden shadow-2xl">
        <div className="p-5 sm:p-6 border-b border-[#24344D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-heading font-extrabold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Billing & Payment History</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review all past activations, payment gateway references, and download official PDF receipts.
            </p>
          </div>

          <span className="text-xs font-semibold text-slate-400">
            Total Records: <span className="text-white font-mono font-bold">{transactions.length}</span>
          </span>
        </div>

        {isHistoryLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
            <span>Loading billing history...</span>
          </div>
        ) : transactions.length === 0 ? (
          /* Empty Transactions State */
          <div className="p-10 sm:p-14 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#162032] border border-[#24344D] text-slate-500 flex items-center justify-center mx-auto text-xl">
              🧾
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white">No payment transactions recorded yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When you purchase a Pro plan or activate a subscription, your complete transaction ledger and tax invoices will appear here.
            </p>
            {!hasPlan && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleActivateFree}
                className="mt-2 text-xs font-bold border-amber-500/40 text-amber-300 hover:bg-amber-500/10 rounded-xl px-4 py-2 cursor-pointer"
              >
                Activate Free Plan First
              </Button>
            )}
          </div>
        ) : (
          /* Responsive Table Container */
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#121B2B] text-slate-400 font-bold uppercase tracking-wider border-b border-[#24344D] text-[10px]">
                  <th className="py-3 px-4 sm:px-6">Date</th>
                  <th className="py-3 px-4 sm:px-6">Transaction ID</th>
                  <th className="py-3 px-4 sm:px-6">Plan Tier</th>
                  <th className="py-3 px-4 sm:px-6">Credits</th>
                  <th className="py-3 px-4 sm:px-6">Amount Paid</th>
                  <th className="py-3 px-4 sm:px-6">Gateway</th>
                  <th className="py-3 px-4 sm:px-6">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24344D]/50 text-slate-300">
                {transactions.map((tx) => {
                  const isDownloading = downloadingTxId === tx.id;
                  const isFree = tx.pricePaid === 0 || tx.paymentGateway === 'FREE';

                  return (
                    <tr key={tx.id} className="hover:bg-[#141F33]/60 transition-colors">
                      {/* Date */}
                      <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-300 whitespace-nowrap">
                        {formatDate(tx.createdAt, 'MMM dd, yyyy · hh:mm a')}
                      </td>

                      {/* Transaction ID */}
                      <td className="py-3.5 px-4 sm:px-6 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        <span className="bg-[#090D15] px-2 py-0.5 rounded border border-[#24344D]">
                          {tx.id.substring(0, 8)}...
                        </span>
                      </td>

                      {/* Plan Tier */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.plan === 'PRO'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {tx.plan === 'PRO' ? '👑 PRO' : '🎁 FREE'}
                        </span>
                      </td>

                      {/* Credits */}
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-white whitespace-nowrap">
                        +{tx.postCount || 5} Posts
                      </td>

                      {/* Price Paid */}
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-200 whitespace-nowrap">
                        {isFree ? (
                          <span className="text-emerald-400 font-semibold">Free ₹0</span>
                        ) : (
                          `${tx.currency === 'USD' ? '$' : '₹'}${tx.pricePaid}`
                        )}
                      </td>

                      {/* Payment Gateway */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap font-medium text-[11px] text-slate-400">
                        {tx.paymentGateway || (isFree ? 'Free Starter' : 'Direct')}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.status === 'SUCCESS' || tx.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{tx.status}</span>
                        </span>
                      </td>

                      {/* Invoice Download Button */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(tx.id)}
                          disabled={isDownloading}
                          className="text-[11px] font-bold text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 cursor-pointer inline-flex items-center gap-1"
                        >
                          {isDownloading ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin text-amber-300" />
                              <span>PDF...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3 text-amber-300" />
                              <span>Invoice</span>
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 💳 Pro Plan Selection & Checkout Modal */}
      {isPlanModalOpen && (
        <PlanSelectionModal
          isOpen={isPlanModalOpen}
          onClose={closePlanModal}
          currentPlan={planName || 'FREE'}
          postsRemaining={postsRemaining}
          onSuccess={(data) => {
            setSuccessData(data);
            refetchSubscription();
            refetchHistory();
            closePlanModal();
          }}
        />
      )}

      {/* 🎉 Payment Success Celebration Modal */}
      {successData && (
        <PaymentSuccessModal
          isOpen={!!successData}
          onClose={() => setSuccessData(null)}
          data={successData}
        />
      )}
    </div>
  );
};

export default YourPlanPage;
