import React from 'react';
import {
  ShieldAlert,
  Zap,
  Plus,
  Check,
  Copy,
  Clock,
  AlertCircle,
  CheckCircle2,
  Facebook,
  Instagram,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { UserStatusBadge } from './UserStatusBadge';

/**
 * UserTableRow Component
 * Renders individual business tenant row with subscription metrics, payment reference, and action switches.
 */
export const UserTableRow = ({
  user,
  copiedId,
  onCopy,
  onOpenTopUp,
  onOpenConnectSocial,
  onToggleStatus,
  isToggling = false,
}) => {
  const sub = user.subscription;
  const price = sub?.pricePaid || 0;

  const planTotal = sub?.totalPostsAllowed || 0;
  const planUsed = sub?.postsUsed || 0;
  const planRemaining = Math.max(0, planTotal - planUsed);

  const bonusTotal = sub?.bonusPostsAllowed || 0;
  const bonusUsed = sub?.bonusPostsUsed || 0;
  const bonusRemaining = Math.max(0, bonusTotal - bonusUsed);

  const totalRemaining = planRemaining + bonusRemaining;
  const hasPlan = planTotal > 0 || (sub?.plan === 'PRO' && price > 0);
  const hasBonus = bonusTotal > 0;
  const hasSub = hasPlan || hasBonus;

  const isPro = sub?.plan === 'PRO' && price > 0;
  const isFree = sub?.plan === 'FREE' && planTotal > 0;

  const currencySym = sub?.currency === 'USD' ? '$' : '₹';
  const refId = sub?.paymentId || sub?.orderId || null;
  const isActive = user.isActive !== false;

  return (
    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition">
      {/* User Info */}
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-sm">
            {user.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
              <span>{user.fullName}</span>
              {!isActive && (
                <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 font-extrabold border border-red-200 dark:border-red-500/30 uppercase">
                  <ShieldAlert className="w-2.5 h-2.5" /> Deactivated
                </span>
              )}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{user.email}</span>
          </div>
        </div>
      </td>

      {/* Business Name */}
      <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
        {user.brandKit?.businessName ? (
          <span className="text-amber-700 dark:text-amber-400 font-semibold">{user.brandKit.businessName}</span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 italic">Not Setup</span>
        )}
      </td>

      {/* Plan Type */}
      <td className="py-2.5 px-3">
        {!hasSub ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
            NO PLAN ACTIVATED
          </span>
        ) : isPro ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/40 dark:text-indigo-300 font-bold text-[10px] uppercase">
            <Zap className="w-3 h-3 fill-indigo-500 dark:fill-indigo-400" /> PRO PLAN
          </span>
        ) : isFree ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase">
            FREE PLAN
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-300 font-bold text-[10px] uppercase shadow-xs">
            <Zap className="w-3 h-3 text-amber-600 dark:text-amber-400" /> BONUS
          </span>
        )}
      </td>

      {/* Gateway */}
      <td className="py-2.5 px-3">
        {!hasSub || !sub.paymentGateway ? (
          <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">—</span>
        ) : (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase border ${
              sub.paymentGateway === 'STRIPE'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/40'
                : sub.paymentGateway === 'RAZORPAY'
                  ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/40'
                  : sub.paymentGateway === 'ADMIN_BONUS'
                    ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                    : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
          >
            {sub.paymentGateway}
          </span>
        )}
      </td>

      {/* Amount Paid */}
      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
        {!hasSub ? (
          <span className="text-slate-400 dark:text-slate-500 text-[11px]">—</span>
        ) : isPro ? (
          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
            {currencySym} {price} {sub.currency || 'INR'}
          </span>
        ) : (
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">Free / Bonus ($0)</span>
        )}
      </td>

      {/* Quota Progress & Top-Up Button */}
      <td className="py-2.5 px-3 min-w-[160px]">
        <div className="space-y-1">
          <div className="text-[11px] font-mono flex flex-col gap-0.5">
            {hasPlan && (
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Plan:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {planUsed}/{planTotal}
                </span>
              </div>
            )}
            {hasBonus && (
              <div className="flex justify-between text-amber-700 dark:text-amber-300 font-bold">
                <span>Bonus:</span>
                <span>
                  {bonusUsed}/{bonusTotal}
                </span>
              </div>
            )}
            {!hasPlan && !hasBonus && (
              <span className="text-slate-400 dark:text-slate-500 italic text-[10px]">0 Posts Available</span>
            )}
          </div>

          <div className="pt-0.5 flex items-center justify-between gap-2">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
              Rem: {totalRemaining}
            </span>
            <button
              type="button"
              onClick={() => onOpenTopUp(user)}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-300 dark:hover:bg-amber-500/30 text-[10px] font-bold transition shadow-xs cursor-pointer"
              title="Grant Bonus Posts to this user"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>+Quota</span>
            </button>
          </div>
        </div>
      </td>

      {/* Transaction / Reference ID */}
      <td className="py-2.5 px-3">
        {refId ? (
          <button
            type="button"
            onClick={() => onCopy(refId)}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#2C384E] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-mono text-[10px] group transition cursor-pointer"
            title="Click to copy Payment Reference ID"
          >
            <span className="truncate max-w-[120px] font-bold">{refId}</span>
            {copiedId === refId ? (
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <Copy className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 shrink-0" />
            )}
          </button>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">—</span>
        )}
      </td>

      {/* Plan Status */}
      <td className="py-2.5 px-3">
        {!hasSub ? (
          <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
            <Clock className="w-3.5 h-3.5" /> NO PLAN
          </span>
        ) : totalRemaining <= 0 ? (
          <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-bold text-[11px]">
            <AlertCircle className="w-3.5 h-3.5" /> EXPIRED
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
          </span>
        )}
      </td>

      {/* Social Accounts & Meta Link */}
      <td className="py-2.5 px-3 min-w-[160px]">
        <div className="space-y-1">
          {/* Active Connected Badges */}
          <div className="flex flex-col gap-1">
            {user.socialAccounts?.some((a) => a.isConnected) ? (
              <div className="flex flex-wrap gap-1">
                {user.socialAccounts
                  .filter((a) => a.isConnected)
                  .map((acc) => (
                    <span
                      key={acc.id}
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                        acc.platform === 'FACEBOOK'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30'
                          : acc.platform === 'INSTAGRAM'
                          ? 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-500/15 dark:text-pink-300 dark:border-pink-500/30'
                          : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }`}
                      title={`${acc.platform}: ${acc.accountName}`}
                    >
                      {acc.platform === 'FACEBOOK' ? (
                        <Facebook className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      ) : (
                        <Instagram className="w-2.5 h-2.5 text-pink-600 dark:text-pink-400 shrink-0" />
                      )}
                      <span className="truncate max-w-[85px]">{acc.accountName}</span>
                    </span>
                  ))}
              </div>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 text-[10px] italic">No Socials Linked</span>
            )}
          </div>

          {/* Submitted Facebook Page Link Card */}
          {user.facebookPageUrl && (
            <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#2C384E] space-y-1">
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                  <Facebook className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Page Link:</span>
                </span>
                <span
                  className={`px-1 py-0.2 rounded font-bold uppercase text-[8px] ${
                    user.socialOnboardingStatus === 'CONNECTED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400'
                      : user.socialOnboardingStatus === 'REQUEST_SENT'
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-400'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400'
                  }`}
                >
                  {user.socialOnboardingStatus || 'SUBMITTED'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1 text-[10px]">
                <span className="text-slate-700 dark:text-slate-300 font-mono truncate max-w-[110px]" title={user.facebookPageUrl}>
                  {user.facebookPageUrl}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onCopy(user.facebookPageUrl)}
                    className="p-0.5 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
                    title="Copy Page URL"
                  >
                    {copiedId === user.facebookPageUrl ? (
                      <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-2.5 h-2.5" />
                    )}
                  </button>
                  {user.facebookPageUrl.startsWith('http') && (
                    <a
                      href={user.facebookPageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-0.5 rounded text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition cursor-pointer"
                      title="Open in Facebook"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => onOpenConnectSocial(user)}
            className="w-full inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded bg-gradient-to-r from-amber-50 via-rose-50 to-indigo-50 dark:from-amber-500/20 dark:via-rose-500/20 dark:to-indigo-500/20 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-white hover:border-amber-400 text-[10px] font-bold transition shadow-xs cursor-pointer"
            title="Link or Update Meta System User Token for this client"
          >
            <Share2 className="w-2.5 h-2.5" />
            <span>Link Meta</span>
          </button>
        </div>
      </td>

      {/* Account Status Switch */}
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isToggling}
            onClick={() => onToggleStatus(user)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isActive ? 'bg-emerald-500' : 'bg-red-500/80'
            }`}
            title={isActive ? 'Click to Deactivate Account' : 'Click to Activate Account'}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isActive ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-[10px] font-bold ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {isActive ? 'ACTIVE' : 'OFF'}
          </span>
        </div>
      </td>
    </tr>
  );
};

export default UserTableRow;
