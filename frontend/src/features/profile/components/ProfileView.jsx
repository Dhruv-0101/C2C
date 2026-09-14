import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Mail,
  Shield,
  Calendar,
  CreditCard,
  Sparkles,
  Building2,
  ArrowUpRight,
  Check,
  Zap,
  Receipt,
  Award,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  Copy,
  Download,
  Loader2,
  FileText,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { TwoFactorSettingsModal } from "../../../components/common/TwoFactorSettingsModal";
import { FeedbackModal } from "../../../components/common/FeedbackModal";
import Pagination from "../../../components/common/Pagination";
import { useFeedbackModal } from "../../../hooks/useFeedbackModal";
import { usePaginatedQuery } from "../../../hooks/usePaginatedQuery";
import { billingApi } from "../../../services/billing.api";
import { USER_PROFILE_QUERY_KEY } from "../../../hooks/useProfile";

/**
 * ProfileView
 * Presentational component rendering user account profile, subscription plan status, and billing history.
 */
export const ProfileView = ({ profile, subscription, brandKit, isLoading, error }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { modalProps, showSuccess, showError } = useFeedbackModal();

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "subscription" | "history"
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

  // Billing History Pagination State
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(5);
  const [copiedTxId, setCopiedTxId] = useState(null);
  const [downloadingTxId, setDownloadingTxId] = useState(null);

  // PDF Invoice Download handler
  const handleDownloadInvoice = async (transactionId) => {
    try {
      setDownloadingTxId(transactionId);
      await billingApi.downloadInvoice(transactionId);
      showSuccess("PDF Invoice downloaded successfully!");
    } catch (err) {
      showError(err.response?.data?.message || err.message || "Failed to download PDF invoice");
    } finally {
      setDownloadingTxId(null);
    }
  };

  // Fetch paginated user billing transactions from backend
  const {
    data: historyPayload,
    meta: historyMeta,
    isLoading: isLoadingHistory,
  } = usePaginatedQuery({
    queryKey: ['billingHistory'],
    queryFn: (params) => billingApi.getHistory(params),
    params: { page: historyPage, limit: historyLimit },
  });

  const historyItems = historyPayload?.items || historyPayload?.data || (Array.isArray(historyPayload) ? historyPayload : []);

  // Activate Free Plan Mutation
  const freePlanMutation = useMutation({
    mutationFn: () => billingApi.activateFreePlan(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
      showSuccess(data?.message || "Free Plan activated successfully!");
    },
    onError: (err) => {
      showError(err.response?.data?.message || err.message || "Failed to activate Free plan");
    },
  });

  if (isLoading) {
    return (
      <Card className="p-12 text-center text-slate-400 text-sm bg-[#131B2A] border-[#2C384E]">
        Loading user profile and subscription details...
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <Card className="p-12 text-center text-rose-400 text-sm bg-[#131B2A] border-[#2C384E]">
        Failed to load profile details. Please try refreshing.
      </Card>
    );
  }

  // Subscription state checks
  // Subscription state checks & quota calculation
  const totalPostsAllowed = subscription?.totalPostsAllowed || 0;
  const postsUsed = subscription?.postsUsed || 0;
  const planRemaining = Math.max(0, totalPostsAllowed - postsUsed);

  const bonusPostsAllowed = subscription?.bonusPostsAllowed || 0;
  const bonusPostsUsed = subscription?.bonusPostsUsed || 0;
  const bonusRemaining = Math.max(0, bonusPostsAllowed - bonusPostsUsed);

  const totalRemaining = planRemaining + bonusRemaining;

  const hasPlan = totalPostsAllowed > 0 || (subscription?.plan === 'PRO' && subscription?.pricePaid > 0);
  const hasBonusCredits = bonusPostsAllowed > 0;
  const hasSubscription = hasPlan || hasBonusCredits;

  const isAdminBonus = subscription?.paymentGateway === 'ADMIN_BONUS' || (!hasPlan && hasBonusCredits);
  const isPaidPlan = Boolean(subscription?.paymentGateway === 'RAZORPAY' || subscription?.paymentGateway === 'STRIPE');
  const isFreePlan = subscription?.plan === 'FREE' && totalPostsAllowed > 0;

  let planDisplayTitle = "NO ACTIVE PLAN";
  let planBadgeColor = "bg-slate-800 text-slate-400 border-slate-700";

  if (isPaidPlan) {
    planDisplayTitle = `${subscription.plan} PRO PLAN`;
    planBadgeColor = "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
  } else if (isFreePlan) {
    planDisplayTitle = "FREE STARTER PLAN";
    planBadgeColor = "bg-slate-800 text-slate-300 border-slate-700";
  } else if (hasBonusCredits) {
    planDisplayTitle = "ADMIN BONUS CREDITS ONLY";
    planBadgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm";
  }

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  const planPurchasedDate = subscription?.createdAt || subscription?.updatedAt
    ? new Date(subscription.createdAt || subscription.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Profile Header Hero Banner Card */}
      <Card className="p-6 bg-gradient-to-r from-[#131B2A] via-[#1A2538] to-[#0B0F17] border-[#2C384E] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {/* Avatar Badge */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 border-2 border-amber-300 shrink-0">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                profile.fullName?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-heading font-extrabold text-2xl text-white">
                  {profile.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                  {profile.role || "END_USER"}
                </span>
                {profile.isSuperAdmin && (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase">
                    SuperAdmin
                  </span>
                )}
                {hasSubscription ? (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${planBadgeColor}`}>
                    {planDisplayTitle}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold uppercase">
                    NO ACTIVE PLAN
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {profile.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIs2FAModalOpen(true)}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#0B0F17] hover:bg-slate-900 border border-[#2C384E] hover:border-amber-500/40 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>{profile.isTwoFactorEnabled ? "2FA Active" : "Enable 2FA"}</span>
            </button>

            <Button
              variant="outline"
              onClick={() => navigate("/brandkit")}
              className="flex-1 md:flex-initial py-2.5 px-4 text-xs text-amber-400 border-[#2C384E] hover:bg-amber-500/10 flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span>BrandKit Profile</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#2C384E] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "overview"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Account Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("subscription")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "subscription"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Current Active Plan & Quota</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "history"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Purchased Plans & Billing History</span>
        </button>
      </div>

      {/* TAB 1: Account Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
          {/* User Personal Details Card */}
          <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-4">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2 border-b border-[#2C384E] pb-3">
              <User className="w-4 h-4 text-amber-400" />
              <span>Personal Information</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Full Name</span>
                <span className="font-bold text-slate-100">{profile.fullName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Email Address</span>
                <span className="font-bold text-slate-100">{profile.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Account Type</span>
                <span className="font-bold text-amber-400 uppercase">{profile.role}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Google Authentication</span>
                <span className="font-bold text-slate-100 flex items-center gap-1">
                  {profile.isGoogleRegistered ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5" /> Connected
                    </span>
                  ) : (
                    "Email & Password"
                  )}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">2-Factor Authentication</span>
                <span className="font-bold text-slate-100">
                  {profile.isTwoFactorEnabled ? (
                    <span className="text-emerald-400 font-semibold">Enabled</span>
                  ) : (
                    <span className="text-amber-400 font-semibold">Disabled</span>
                  )}
                </span>
              </div>
            </div>
          </Card>

          {/* Business & BrandKit Information Card */}
          <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-4">
            <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Associated Business Details</span>
              </h3>
              <Link to="/brandkit" className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1">
                Edit BrandKit <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Business Name</span>
                <span className="font-bold text-slate-100">{brandKit?.businessName || "Not Configured"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Phone Number</span>
                <span className="font-bold text-slate-100">{brandKit?.phone || "N/A"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Location</span>
                <span className="font-bold text-slate-100">
                  {brandKit?.city ? `${brandKit.city}, ${brandKit.country || "India"}` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Website URL</span>
                <span className="font-bold text-amber-400 truncate max-w-[200px]">
                  {brandKit?.websiteUrl || "N/A"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Current Active Plan & Quota */}
      {activeTab === "subscription" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {!hasSubscription ? (
            /* Empty State Banner when NO PLAN HAS BEEN PURCHASED OR ACTIVATED */
            <Card className="p-8 text-center bg-[#131B2A] border-[#2C384E] rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-extrabold text-xl text-white">
                  No Active Subscription Plan
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  You have not purchased or activated any subscription plan yet. Activate the Free starter plan (5 Posts) or purchase a Pro plan to start generating post graphics.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  onClick={() => freePlanMutation.mutate()}
                  isLoading={freePlanMutation.isPending}
                  className="py-2.5 px-5 text-xs font-bold"
                >
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  Activate Free Starter Plan (5 Posts)
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="py-2.5 px-5 text-xs text-amber-400 border-[#2C384E] hover:bg-amber-500/10"
                >
                  <span>Explore Paid Pro Plans</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Option to Activate Free Plan if user has bonus credits but no plan yet */}
              {!hasPlan && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-amber-300 font-bold text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Want to claim your Free Plan Quota?
                    </h4>
                    <p className="text-[11px] text-amber-200/80 mt-0.5">
                      You are using Admin Bonus credits. You can also activate your Free Starter Plan to get +5 additional posts.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => freePlanMutation.mutate()}
                    isLoading={freePlanMutation.isPending}
                    className="py-1.5 px-3 text-xs font-bold shrink-0"
                  >
                    Activate Free Plan (+5 Posts)
                  </Button>
                </div>
              )}

              {/* Main Quota Overview Header */}
              <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-extrabold text-xl text-white uppercase">
                          {planDisplayTitle}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          ACTIVE
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {hasPlan
                          ? `Plan Activated / Upgraded on ${planPurchasedDate}`
                          : "Using Granted Admin Bonus Credits"}
                      </p>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase">Total Available Posts</p>
                    <p className="text-2xl font-extrabold text-emerald-400">
                      {totalRemaining} <span className="text-xs text-slate-400 font-normal">Posts</span>
                    </p>
                  </div>
                </div>

                {/* Quota Breakdown Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Plan Quota Box */}
                  <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#2C384E] pb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-indigo-400" />
                        Subscription Plan Quota
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {hasPlan ? subscription?.plan : "NO PLAN"}
                      </span>
                    </div>

                    {hasPlan ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-400">Allowed: <strong>{totalPostsAllowed}</strong></span>
                          <span className="text-amber-400">Used: <strong>{postsUsed}</strong></span>
                          <span className="text-emerald-400 font-bold">Remaining: <strong>{planRemaining}</strong></span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                            style={{
                              width: `${totalPostsAllowed > 0 ? Math.min(100, Math.round((postsUsed / totalPostsAllowed) * 100)) : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic py-2">
                        No active plan selected yet.
                      </p>
                    )}
                  </div>

                  {/* Admin Bonus Quota Box */}
                  <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#2C384E] pb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Admin Bonus Credits
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        BONUS
                      </span>
                    </div>

                    {hasBonusCredits ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-400">Granted: <strong>{bonusPostsAllowed}</strong></span>
                          <span className="text-amber-400">Used: <strong>{bonusPostsUsed}</strong></span>
                          <span className="text-emerald-400 font-bold">Remaining: <strong>{bonusRemaining}</strong></span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-300"
                            style={{
                              width: `${bonusPostsAllowed > 0 ? Math.min(100, Math.round((bonusPostsUsed / bonusPostsAllowed) * 100)) : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic py-2">
                        No bonus credits granted by admin.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Purchased Plans & Billing History */}
      {activeTab === "history" && (
        <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>Purchased Plans & Order Invoices</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Total Transactions: {historyMeta?.totalItems || historyItems.length || 0}
            </span>
          </div>

          {isLoadingHistory ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-[#0B0F17] rounded-xl border border-[#2C384E]">
              Loading billing transaction history...
            </div>
          ) : historyItems.length === 0 ? (
            <div className="p-8 text-center border-dashed border-[#2C384E] bg-[#0B0F17] rounded-xl space-y-2">
              <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-slate-300 font-bold text-sm">No Purchased Plans or Billing History</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You have not purchased any subscription plans yet. Your order history and invoices will appear here once you upgrade.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0B0F17] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#2C384E] font-bold">
                    <tr>
                      <th className="p-3">Plan / Description</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Price Paid</th>
                      <th className="p-3">Gateway</th>
                      <th className="p-3">Transaction / Order ID</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {historyItems.map((tx) => {
                      const txDate = tx.createdAt
                        ? new Date(tx.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "N/A";
                      const isBonus = tx.transactionType === "ADMIN_BONUS" || tx.paymentGateway === "ADMIN_BONUS";
                      const isPro = tx.plan === "PRO";
                      const refId = tx.paymentId || tx.orderId || "tx_grant";

                      return (
                        <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-bold text-white flex items-center gap-2">
                            <Zap className={`w-3.5 h-3.5 ${isPro ? "text-indigo-400 fill-indigo-400" : "text-amber-400"}`} />
                            <span>
                              {isBonus
                                ? `Admin Bonus Grant (+${tx.postCount || 10} Posts)`
                                : `${tx.plan} Plan (${tx.postCount || 5} Posts Quota)`}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{txDate}</td>
                          <td className="p-3 font-bold text-white">
                            {tx.pricePaid > 0
                              ? `${tx.currency === "USD" ? "$" : "₹"}${tx.pricePaid}`
                              : isBonus
                              ? "Bonus ($0)"
                              : "Free ($0)"}
                          </td>
                          <td className="p-3 uppercase text-slate-300 font-semibold font-mono text-[10px]">
                            <span className={`px-2 py-0.5 rounded border ${
                              tx.paymentGateway === "STRIPE"
                                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                                : tx.paymentGateway === "RAZORPAY"
                                ? "bg-teal-500/20 text-teal-300 border-teal-500/30"
                                : tx.paymentGateway === "ADMIN_BONUS"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                : "bg-slate-800 text-slate-300 border-slate-700"
                            }`}>
                              {tx.paymentGateway || "FREE"}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => {
                                if (refId) {
                                  navigator.clipboard.writeText(refId);
                                  setCopiedTxId(refId);
                                  setTimeout(() => setCopiedTxId(null), 2000);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#0B0F17] border border-[#2C384E] text-slate-300 hover:text-white font-mono text-[10px] group transition cursor-pointer"
                              title="Click to copy Transaction ID"
                            >
                              <span className="truncate max-w-[120px] font-bold">{refId}</span>
                              {copiedTxId === refId ? (
                                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-500 group-hover:text-amber-400 shrink-0" />
                              )}
                            </button>
                          </td>
                          <td className="p-3">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                              {tx.status || "COMPLETED"}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDownloadInvoice(tx.id)}
                              disabled={downloadingTxId === tx.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[11px] font-bold transition disabled:opacity-50 cursor-pointer"
                              title="Download Official PDF Invoice"
                            >
                              {downloadingTxId === tx.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                              <span>PDF Invoice</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Server-Side Pagination Controls */}
              <Pagination
                meta={historyMeta}
                currentPage={historyPage}
                totalPages={historyMeta?.totalPages || 1}
                onPageChange={setHistoryPage}
                onLimitChange={(newLimit) => {
                  setHistoryLimit(newLimit);
                  setHistoryPage(1);
                }}
              />
            </div>
          )}
        </Card>
      )}

      {/* 2FA Settings Modal */}
      <TwoFactorSettingsModal isOpen={is2FAModalOpen} onClose={() => setIs2FAModalOpen(false)} />

      {/* Feedback Toast Modal */}
      <FeedbackModal {...modalProps} />
    </div>
  );
};
