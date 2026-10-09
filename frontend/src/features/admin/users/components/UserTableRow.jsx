import React from 'react';
import {
  Zap,
  Plus,
  Check,
  Copy,
  Building2,
  Facebook,
  Instagram,
  Share2,
  ExternalLink,
  ShieldAlert,
  Eye,
} from 'lucide-react';

/**
 * UserTableRow Component
 * Clean, modern table row consolidating tenant profile, subscription billing,
 * visual post quota progress bar, and social status into 5 spacious columns.
 */
export const UserTableRow = ({
  user,
  copiedId,
  onCopy,
  onOpenTopUp,
  onOpenConnectSocial,
  onToggleStatus,
  onViewDetails,
  isToggling = false,
}) => {
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
  const usagePercent = totalAllowed > 0 ? Math.min(100, Math.round((totalUsed / totalAllowed) * 100)) : 0;

  const isPro = sub?.plan === 'PRO' && price > 0;
  const isFree = sub?.plan === 'FREE' && planTotal > 0;
  const hasSub = planTotal > 0 || isPro || bonusTotal > 0;

  const refId = sub?.paymentId || sub?.orderId || null;
  const isActive = user.isActive !== false;
  const businessName = user.brandKit?.businessName;

  return (
    <tr className="hover:bg-slate-50/80 dark:hover:bg-[#1A2333]/60 transition-colors group">
      {/* Column 1: Business & User Details */}
      <td className="py-3 px-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm uppercase shrink-0 shadow-sm mt-0.5">
            {user.fullName?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                {user.fullName}
              </span>
              {!isActive && (
                <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 font-extrabold border border-red-200 dark:border-red-500/30 uppercase">
                  <ShieldAlert className="w-2.5 h-2.5" /> Suspended
                </span>
              )}
            </div>

            {/* Business Badge */}
            <div className="flex items-center gap-1.5">
              {businessName ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  <Building2 className="w-3 h-3 shrink-0" />
                  <span className="truncate max-w-[150px]">{businessName}</span>
                </span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 text-[11px] italic">
                  No brand set
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[180px]">
              {user.email}
            </div>
          </div>
        </div>
      </td>

      {/* Column 2: Subscription & Billing */}
      <td className="py-3 px-4 min-w-[190px]">
        <div className="space-y-1.5">
          {/* Plan Badge + Price */}
          <div className="flex items-center gap-2">
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
          </div>

          {/* Gateway & Status Subline */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            {sub?.paymentGateway ? (
              <span className="font-mono uppercase font-bold text-slate-700 dark:text-slate-300 text-[10px]">
                {sub.paymentGateway}
              </span>
            ) : (
              <span>Direct</span>
            )}
            <span>•</span>
            <span className="flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  totalRemaining > 0 ? 'bg-emerald-500' : hasSub ? 'bg-amber-500' : 'bg-slate-500'
                }`}
              />
              <span className="text-[10px] font-semibold">
                {totalRemaining > 0 ? 'Active' : hasSub ? 'Exhausted' : 'Inactive'}
              </span>
            </span>
          </div>

          {/* Reference ID Pill */}
          {refId && (
            <button
              type="button"
              onClick={() => onCopy(refId)}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#2C384E] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-mono text-[10px] transition cursor-pointer"
              title="Click to copy Transaction ID"
            >
              <span className="truncate max-w-[110px]">{refId}</span>
              {copiedId === refId ? (
                <Check className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
              ) : (
                <Copy className="w-2.5 h-2.5 text-slate-400 shrink-0" />
              )}
            </button>
          )}
        </div>
      </td>

      {/* Column 3: Post Quota Usage with Progress Bar */}
      <td className="py-3 px-4 min-w-[200px]">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
              {totalUsed} / {totalAllowed} used
            </span>
            <span className="font-mono font-bold text-[11px] text-emerald-600 dark:text-emerald-400">
              {totalRemaining} left
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
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

          {/* Sub-breakdown & Top-Up Button */}
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              {bonusTotal > 0 ? `+${bonusTotal} bonus` : 'base quota'}
            </span>
            <button
              type="button"
              onClick={() => onOpenTopUp(user)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-300 dark:hover:bg-amber-500/25 text-[10px] font-bold transition cursor-pointer"
              title="Add bonus post credits"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>Top-Up</span>
            </button>
          </div>
        </div>
      </td>

      {/* Column 4: Social Integration */}
      <td className="py-3 px-4 min-w-[170px]">
        <div className="space-y-1.5">
          {/* Connected Badges */}
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
                    title={`${acc.platform}: ${acc.accountName}`}
                  >
                    {acc.platform === 'FACEBOOK' ? (
                      <Facebook className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    ) : (
                      <Instagram className="w-2.5 h-2.5 text-pink-600 dark:text-pink-400 shrink-0" />
                    )}
                    <span className="truncate max-w-[70px]">{acc.accountName}</span>
                  </span>
                ))
            ) : (
              <span className="text-slate-400 dark:text-slate-500 text-[10px] italic">
                No socials linked
              </span>
            )}
          </div>

          {/* Facebook Page link pill (if exists) */}
          {user.facebookPageUrl && (
            <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              <Facebook className="w-2.5 h-2.5 text-blue-500 shrink-0" />
              <span className="truncate max-w-[100px]" title={user.facebookPageUrl}>
                {user.facebookPageUrl.replace(/^https?:\/\/(www\.)?/, '')}
              </span>
              {user.facebookPageUrl.startsWith('http') && (
                <a
                  href={user.facebookPageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-500 hover:text-emerald-400 shrink-0"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          )}

          {/* Quick Link Meta Button */}
          <button
            type="button"
            onClick={() => onOpenConnectSocial(user)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-300 dark:hover:bg-indigo-500/20 text-[10px] font-bold transition cursor-pointer"
            title="Link Meta System User Token"
          >
            <Share2 className="w-2.5 h-2.5" />
            <span>Meta Token</span>
          </button>
        </div>
      </td>

      {/* Column 5: Account Access & Actions */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-3">
          {/* Active/Suspended Toggle Switch */}
          <div className="flex items-center gap-1.5">
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
            <span
              className={`text-[10px] font-bold uppercase w-11 text-left ${
                isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isActive ? 'Active' : 'Off'}
            </span>
          </div>

          {/* View Details Drawer Button */}
          <button
            type="button"
            onClick={() => onViewDetails(user)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-[#2C384E] bg-white dark:bg-[#0B0F17] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs cursor-pointer"
            title="Inspect full tenant details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserTableRow;
