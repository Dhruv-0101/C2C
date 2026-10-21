import React from 'react';
import {
  Users,
  Zap,
  Plus,
  Check,
  Copy,
  Building2,
  Facebook,
  Instagram,
  Share2,
  ShieldAlert,
  Eye,
  Receipt,
} from 'lucide-react';
import { UserTableRow } from './UserTableRow';
import { SkeletonTable } from '@/components/feedback/SkeletonLoader';

/**
 * UserTable Component
 * Responsive view for Business Tenants and Payment Subscriptions:
 * - Desktop/Tablet (md+): 5-column detailed tabular layout inside horizontal scroll wrapper
 * - Mobile (<md): Touch-friendly, adaptive card stack with full inspection, quota bars, and actions
 */
export const UserTable = ({
  users = [],
  isLoading,
  copiedId,
  onCopy,
  onOpenTopUp,
  onOpenConnectSocial,
  onToggleStatus,
  onViewDetails,
  onOpenLedger,
  isToggling,
}) => {
  if (isLoading) {
    return (
      <div className="py-2">
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center border border-dashed border-slate-200 dark:border-[#2C384E] bg-white dark:bg-[#131B2A] rounded-2xl space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-slate-800 dark:text-slate-200 font-bold text-sm">
            No registered business tenants found
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Try adjusting your search query or filter settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile View: Responsive Card Stack (< md) */}
      <div className="block md:hidden space-y-3.5">
        {users.map((user) => {
          const sub = user.subscription;
          const price = sub?.pricePaid || 0;
          const currencySym = sub?.currency === 'USD' ? '$' : '₹';

          const planTotal = sub?.totalPostsAllowed || 0;
          const planUsed = sub?.postsUsed || 0;
          const planRemaining = Math.max(0, planTotal - planUsed);

          const bonusTotal = sub?.bonusPostsAllowed || 0;
          const bonusUsed = sub?.bonusPostsUsed || 0;
          const bonusRemaining = Math.max(0, bonusTotal - bonusUsed);

          const totalAllowed = planTotal + bonusTotal;
          const totalUsed = planUsed + bonusUsed;
          const totalRemaining = planRemaining + bonusRemaining;
          const usagePercent =
            totalAllowed > 0
              ? Math.min(100, Math.round((totalUsed / totalAllowed) * 100))
              : 0;

          const isPro = sub?.plan === 'PRO' && price > 0;
          const isFree = sub?.plan === 'FREE' && planTotal > 0;
          const hasSub = planTotal > 0 || isPro || bonusTotal > 0;

          const refId = sub?.paymentId || sub?.orderId || null;
          const isActive = user.isActive !== false;
          const businessName = user.brandKit?.businessName;

          return (
            <div
              key={user.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-[#2C384E] bg-white dark:bg-[#131B2A] space-y-3.5 shadow-sm"
            >
              {/* 1. Tenant & Brand Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm uppercase shrink-0 shadow-sm mt-0.5">
                    {user.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                        {user.fullName}
                      </span>
                      {!isActive ? (
                        <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 font-extrabold border border-red-200 dark:border-red-500/30 uppercase">
                          <ShieldAlert className="w-2.5 h-2.5" /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 font-extrabold border border-emerald-200 dark:border-emerald-500/30 uppercase">
                          Active
                        </span>
                      )}
                    </div>

                    {businessName ? (
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{businessName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-xs italic block">
                        No brand configured
                      </span>
                    )}

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      {user.email}
                    </div>
                  </div>
                </div>

                {/* Actions: View Details & Status Switch */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onViewDetails(user)}
                    className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-[#2C384E] bg-slate-50 dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition shadow-xs cursor-pointer"
                    title="Inspect full tenant details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={isToggling}
                    onClick={() => onToggleStatus(user)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isActive ? 'bg-emerald-500' : 'bg-red-500/80'
                    }`}
                    title={isActive ? 'Click to Suspend Account' : 'Click to Activate Account'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isActive ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 2. Subscription & Billing Info */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200/80 dark:border-[#2C384E]/70 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isPro ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/40 dark:text-indigo-300 font-bold text-[10px] uppercase shadow-xs">
                        <Zap className="w-3 h-3 fill-indigo-500 dark:fill-indigo-400" />
                        <span>Pro Plan</span>
                        <span className="opacity-60">•</span>
                        <span className="font-mono">{currencySym}{price}</span>
                      </span>
                    ) : isFree ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase">
                        Free Plan
                      </span>
                    ) : bonusTotal > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-300 font-bold text-[10px] uppercase">
                        Bonus Only
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] uppercase">
                        No Plan
                      </span>
                    )}

                    {sub?.paymentGateway && (
                      <span className="font-mono uppercase font-bold text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800">
                        {sub.paymentGateway}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenLedger && onOpenLedger(user)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 dark:text-indigo-300 hover:text-white transition cursor-pointer text-xs font-bold min-h-[30px]"
                    title="View full billing ledger & transactions history"
                  >
                    <Receipt className="w-3 h-3" />
                    <span>Ledger</span>
                  </button>
                </div>

                {refId && (
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 dark:border-[#2C384E]/50">
                    <span className="text-slate-500 dark:text-slate-400">Ref ID:</span>
                    <button
                      type="button"
                      onClick={() => onCopy(refId)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#2C384E] text-slate-700 dark:text-slate-300 font-mono text-[10px] transition cursor-pointer"
                    >
                      <span className="truncate max-w-[140px]">{refId}</span>
                      {copiedId === refId ? (
                        <Check className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Post Quota Usage */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                    {totalUsed} / {totalAllowed} used
                  </span>
                  <span className="font-mono font-bold text-[11px] text-emerald-600 dark:text-emerald-400">
                    {totalRemaining} left
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      usagePercent >= 90
                        ? 'bg-rose-500'
                        : usagePercent >= 70
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    {bonusTotal > 0 ? `+${bonusTotal} bonus` : 'base quota'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenTopUp(user)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-300 dark:hover:bg-amber-500/25 text-xs font-bold transition cursor-pointer min-h-[32px]"
                    title="Add bonus post credits"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Top-Up Quota</span>
                  </button>
                </div>
              </div>

              {/* 4. Social Accounts & Meta Linking */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/80 dark:border-[#2C384E]/70 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {user.socialAccounts?.some((a) => a.isConnected) ? (
                    user.socialAccounts
                      .filter((a) => a.isConnected)
                      .map((acc) => (
                        <span
                          key={acc.id}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            acc.platform === 'FACEBOOK'
                              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30'
                              : 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-500/15 dark:text-pink-300 dark:border-pink-500/30'
                          }`}
                        >
                          {acc.platform === 'FACEBOOK' ? (
                            <Facebook className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          ) : (
                            <Instagram className="w-2.5 h-2.5 text-pink-600 dark:text-pink-400 shrink-0" />
                          )}
                          <span className="truncate max-w-[80px]">{acc.accountName}</span>
                        </span>
                      ))
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] italic">
                      No socials linked
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenConnectSocial(user)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-300 dark:hover:bg-indigo-500/20 text-[11px] font-bold transition cursor-pointer min-h-[30px]"
                  title="Link Meta System User Token"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Meta Token</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop/Tablet Table View (hidden on mobile, visible on md+) */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar rounded-2xl border border-slate-200 dark:border-[#2C384E] bg-white dark:bg-[#131B2A] shadow-sm">
        <table className="w-full text-left text-xs min-w-[840px]">
          <thead className="bg-slate-50 dark:bg-[#0B0F17] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-[#2C384E] text-[11px]">
            <tr>
              <th className="py-3 px-4">Business & Tenant</th>
              <th className="py-3 px-4">Subscription & Billing</th>
              <th className="py-3 px-4">Post Quota Usage</th>
              <th className="py-3 px-4">Social Integrations</th>
              <th className="py-3 px-4 text-right">Account & Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#2C384E]/70">
            {users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                copiedId={copiedId}
                onCopy={onCopy}
                onOpenTopUp={onOpenTopUp}
                onOpenConnectSocial={onOpenConnectSocial}
                onToggleStatus={onToggleStatus}
                onViewDetails={onViewDetails}
                onOpenLedger={onOpenLedger}
                isToggling={isToggling}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;

