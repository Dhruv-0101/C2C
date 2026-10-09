import React, { useState } from "react";
import {
  Users,
  CreditCard,
  Zap,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldAlert,
  Plus,
  Share2,
  Filter,
  Sparkles,
} from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { SearchBar } from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';
import { UserTable } from "./components/UserTable";
import { QuotaTopUpModal } from "./components/QuotaTopUpModal";
import { ConnectSocialModal } from "./components/ConnectSocialModal";
import { UserDetailsDrawer } from "./components/UserDetailsDrawer";

/**
 * AdminUsersTab Component
 * Business User & Subscription Billing Directory displaying all registered business tenants,
 * active plan subscription details, payment gateway, post quota usage, transaction IDs,
 * instant Bonus Post Quota top-ups, Meta Agency Social Linking, and interactive Account Status deactivation toggle switches.
 */
export const AdminUsersTab = ({
  users = [],
  userMeta,
  isLoadingUsers,
  usersFetchError,
  userSearch,
  setUserSearch,
  userPage,
  setUserPage,
  setUserLimit,
  toggleUserStatusMutation,
  topUpUserQuotaMutation,
  connectSocialTokenMutation,
}) => {
  const [copiedId, setCopiedId] = useState(null);
  const [topUpUser, setTopUpUser] = useState(null);
  const [socialModalUser, setSocialModalUser] = useState(null);
  const [inspectUser, setInspectUser] = useState(null);

  // Quick Filters
  const [planFilter, setPlanFilter] = useState('ALL'); // 'ALL' | 'PRO' | 'FREE' | 'NONE'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'SUSPENDED'

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // KPI Calculations across loaded tenants
  const totalTenantsCount = userMeta?.totalCount ?? users.length;
  const proTenantsCount = users.filter((u) => u.subscription?.plan === 'PRO').length;
  const activeTenantsCount = users.filter((u) => u.isActive !== false).length;
  const socialLinkedCount = users.filter(
    (u) => u.socialAccounts?.some((a) => a.isConnected) || Boolean(u.facebookPageUrl)
  ).length;

  // Filtered users for table
  const displayedUsers = users.filter((u) => {
    if (planFilter === 'PRO' && u.subscription?.plan !== 'PRO') return false;
    if (planFilter === 'FREE' && u.subscription?.plan !== 'FREE') return false;
    if (planFilter === 'NONE' && (u.subscription?.plan === 'PRO' || u.subscription?.plan === 'FREE')) return false;

    if (statusFilter === 'ACTIVE' && u.isActive === false) return false;
    if (statusFilter === 'SUSPENDED' && u.isActive !== false) return false;

    return true;
  });

  return (
    <div className="animate-in fade-in duration-200 space-y-5">
      {/* 1. Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Business Users & Payment Subscriptions</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage client plan subscriptions, post quotas, Meta agency links, and account access.
            </p>
          </div>
        </div>

        <SearchBar
          value={userSearch}
          onChange={(val) => {
            const query = typeof val === "string" ? val : (val?.target?.value ?? "");
            setUserSearch(query);
            setUserPage(1);
          }}
          placeholder="Search by name, email, or business..."
          className="max-w-xs"
        />
      </div>

      {/* 2. KPI Summary Pulse Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-[#2C384E] bg-white dark:bg-[#131B2A] flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              Total Tenants
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
              {totalTenantsCount}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-[#2C384E] bg-white dark:bg-[#131B2A] flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              Pro Subscribers
            </span>
            <span className="text-base font-bold text-purple-600 dark:text-purple-400 font-mono">
              {proTenantsCount}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-[#2C384E] bg-white dark:bg-[#131B2A] flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              Active Accounts
            </span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {activeTenantsCount}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-[#2C384E] bg-white dark:bg-[#131B2A] flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              Social Integrated
            </span>
            <span className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">
              {socialLinkedCount}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter Pills Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-[#0B0F17] p-2 rounded-xl border border-slate-200 dark:border-[#2C384E]/70 text-xs">
        {/* Plan Filter Group */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 dark:text-slate-400 font-bold px-1.5 flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3" /> Plan:
          </span>
          {[
            { id: 'ALL', label: 'All Plans' },
            { id: 'PRO', label: 'Pro Only' },
            { id: 'FREE', label: 'Free' },
            { id: 'NONE', label: 'No Plan' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPlanFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition cursor-pointer ${
                planFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Filter Group */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 dark:text-slate-400 font-bold px-1.5 text-[11px]">
            Status:
          </span>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'ACTIVE', label: 'Active' },
            { id: 'SUSPENDED', label: 'Suspended' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Notification */}
      {usersFetchError && (
        <Alert variant="error" message={usersFetchError.message} />
      )}

      {/* 4. Main Clean Table View */}
      <UserTable
        users={displayedUsers}
        isLoading={isLoadingUsers}
        copiedId={copiedId}
        onCopy={handleCopy}
        onOpenTopUp={(u) => setTopUpUser(u)}
        onOpenConnectSocial={(u) => setSocialModalUser(u)}
        onViewDetails={(u) => setInspectUser(u)}
        onToggleStatus={(u) =>
          toggleUserStatusMutation?.mutate({
            userId: u.id,
            isActive: u.isActive === false,
          })
        }
        isToggling={toggleUserStatusMutation?.isPending}
      />

      {/* 5. Modals & Side Drawer */}
      {/* Full Tenant Inspection Drawer */}
      <UserDetailsDrawer
        user={inspectUser}
        isOpen={Boolean(inspectUser)}
        onClose={() => setInspectUser(null)}
        copiedId={copiedId}
        onCopy={handleCopy}
        onOpenTopUp={(u) => {
          setInspectUser(null);
          setTopUpUser(u);
        }}
        onOpenConnectSocial={(u) => {
          setInspectUser(null);
          setSocialModalUser(u);
        }}
        onToggleStatus={(u) =>
          toggleUserStatusMutation?.mutate({
            userId: u.id,
            isActive: u.isActive === false,
          })
        }
        isToggling={toggleUserStatusMutation?.isPending}
      />

      {/* Bonus Quota Top-Up Modal */}
      <QuotaTopUpModal
        isOpen={Boolean(topUpUser)}
        onClose={() => setTopUpUser(null)}
        user={topUpUser}
        onConfirm={(payload) => topUpUserQuotaMutation?.mutate(payload)}
        isPending={topUpUserQuotaMutation?.isPending}
      />

      {/* Meta Agency Social Linking Modal */}
      <ConnectSocialModal
        isOpen={Boolean(socialModalUser)}
        onClose={() => setSocialModalUser(null)}
        user={socialModalUser}
        onConfirm={(payload) => connectSocialTokenMutation?.mutateAsync(payload)}
        isPending={connectSocialTokenMutation?.isPending}
      />

      {/* Pagination */}
      {users.length > 0 && (
        <Pagination
          meta={userMeta}
          currentPage={userPage}
          totalPages={userMeta?.totalPages || 1}
          onPageChange={setUserPage}
          onLimitChange={(newLimit) => {
            setUserLimit(newLimit);
            setUserPage(1);
          }}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )}
    </div>
  );
};

export default AdminUsersTab;
