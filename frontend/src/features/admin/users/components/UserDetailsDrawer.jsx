import React from 'react';
import {
  X,
  Building2,
  Mail,
  Calendar,
  CreditCard,
  Zap,
  Share2,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Facebook,
  Instagram,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { formatDate } from '@/shared/utils/date.util';

/**
 * UserDetailsDrawer Component
 * Slide-out inspector drawer providing complete, uncluttered visibility into
 * tenant subscription credentials, post balance, brand kit info, and social connections.
 */
export const UserDetailsDrawer = ({
  user,
  isOpen,
  onClose,
  copiedId,
  onCopy,
  onOpenTopUp,
  onOpenConnectSocial,
  onToggleStatus,
  isToggling,
}) => {
  if (!isOpen || !user) return null;

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
  const isActive = user.isActive !== false;
  const refId = sub?.paymentId || sub?.orderId || null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-xl bg-[#0B0F17] text-slate-100 border-l border-[#2C384E] shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#2C384E] bg-[#131B2A]/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-base uppercase shrink-0 shadow-md">
              {user.fullName?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-extrabold text-base text-white truncate flex items-center gap-2">
                <span>{user.fullName}</span>
                {!isActive ? (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 uppercase font-bold">
                    <ShieldAlert className="w-2.5 h-2.5" /> Suspended
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-bold">
                    <ShieldCheck className="w-2.5 h-2.5" /> Active
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 font-mono truncate">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Action Bar */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onOpenTopUp(user)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs transition cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Grant Bonus Quota</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenConnectSocial(user)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs transition cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-indigo-400" />
              <span>Link Meta Token</span>
            </button>
          </div>

          {/* Section: Business & Tenant Profile */}
          <div className="rounded-2xl border border-[#2C384E] bg-[#131B2A]/60 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#2C384E]/60 pb-2.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Tenant Business Info</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">ID: {user.id?.slice(0, 10)}...</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Business Name</span>
                <span className="font-semibold text-white">
                  {user.brandKit?.businessName || (
                    <span className="text-slate-500 italic">Not Configured</span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Joined Date</span>
                <span className="font-mono text-slate-200">
                  {user.createdAt ? formatDate(user.createdAt) : '—'}
                </span>
              </div>
              {user.brandKit?.phone && (
                <div>
                  <span className="text-slate-400 text-[11px] block flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone
                  </span>
                  <span className="font-mono text-slate-200">{user.brandKit.phone}</span>
                </div>
              )}
              {(user.brandKit?.city || user.brandKit?.country) && (
                <div>
                  <span className="text-slate-400 text-[11px] block flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location
                  </span>
                  <span className="text-slate-200">
                    {[user.brandKit?.city, user.brandKit?.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section: Subscription & Billing */}
          <div className="rounded-2xl border border-[#2C384E] bg-[#131B2A]/60 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#2C384E]/60 pb-2.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                <span>Subscription & Payments</span>
              </span>
              {isPro ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold uppercase">
                  <Zap className="w-3 h-3 fill-indigo-400" /> Pro Plan
                </span>
              ) : isFree ? (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold uppercase">
                  Free Plan
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-500 border border-slate-700 text-[10px] uppercase">
                  No Subscription
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Amount Paid</span>
                <span className="font-mono font-bold text-white text-sm">
                  {price > 0 ? `${currencySym} ${price} ${sub?.currency || 'INR'}` : 'Free ($0)'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Payment Gateway</span>
                <span className="font-mono text-slate-200 uppercase font-bold">
                  {sub?.paymentGateway || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Billing Status</span>
                <span className="flex items-center gap-1 font-semibold text-slate-200">
                  {totalRemaining > 0 ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Active</span>
                    </>
                  ) : hasSub ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-400">Depleted / Expired</span>
                    </>
                  ) : (
                    <span className="text-slate-500 italic">Inactive</span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Reference / Order ID</span>
                {refId ? (
                  <button
                    type="button"
                    onClick={() => onCopy(refId)}
                    className="inline-flex items-center gap-1 text-slate-300 hover:text-white font-mono text-[11px] transition cursor-pointer"
                    title="Click to copy ID"
                  >
                    <span className="truncate max-w-[140px]">{refId}</span>
                    {copiedId === refId ? (
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-500 shrink-0" />
                    )}
                  </button>
                ) : (
                  <span className="text-slate-500 font-mono">—</span>
                )}
              </div>
            </div>
          </div>

          {/* Section: Post Generation Quota */}
          <div className="rounded-2xl border border-[#2C384E] bg-[#131B2A]/60 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#2C384E]/60 pb-2.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Post Creation Quota</span>
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {totalRemaining} Posts Left
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Overall Quota Consumption</span>
                <span className="font-mono text-slate-200 font-bold">
                  {totalUsed} / {totalAllowed} ({usagePercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
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
            </div>

            {/* Quota Sub-Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E]/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Base Plan Posts</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-base font-bold text-white font-mono">{planTotal - planUsed}</span>
                  <span className="text-[11px] text-slate-500 font-mono">of {planTotal}</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E]/60">
                <span className="text-amber-400 text-[10px] uppercase font-bold block">Bonus Admin Posts</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-base font-bold text-amber-300 font-mono">{bonusTotal - bonusUsed}</span>
                  <span className="text-[11px] text-slate-500 font-mono">of {bonusTotal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Social Media & Meta Setup */}
          <div className="rounded-2xl border border-[#2C384E] bg-[#131B2A]/60 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#2C384E]/60 pb-2.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Social Accounts & Meta</span>
              </span>
              {user.socialOnboardingStatus && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    user.socialOnboardingStatus === 'CONNECTED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {user.socialOnboardingStatus}
                </span>
              )}
            </div>

            {/* Connected Accounts */}
            <div>
              <span className="text-slate-400 text-[11px] block mb-2">Connected Platforms</span>
              {user.socialAccounts?.some((a) => a.isConnected) ? (
                <div className="flex flex-wrap gap-2">
                  {user.socialAccounts
                    .filter((a) => a.isConnected)
                    .map((acc) => (
                      <div
                        key={acc.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-xs font-semibold"
                      >
                        {acc.platform === 'FACEBOOK' ? (
                          <Facebook className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        ) : (
                          <Instagram className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                        )}
                        <span className="text-slate-200">{acc.accountName}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No social platforms linked yet.</p>
              )}
            </div>

            {/* Facebook Page URL */}
            {user.facebookPageUrl && (
              <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                    <Facebook className="w-3.5 h-3.5 text-blue-400" /> Facebook Page URL
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onCopy(user.facebookPageUrl)}
                      className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedId === user.facebookPageUrl ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {user.facebookPageUrl.startsWith('http') && (
                      <a
                        href={user.facebookPageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
                <p className="font-mono text-xs text-slate-300 break-all">{user.facebookPageUrl}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer / Account Status Toggle */}
        <div className="p-5 border-t border-[#2C384E] bg-[#131B2A]/90 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">Tenant Account Status</span>
            <span className="text-[11px] text-slate-400">
              {isActive ? 'Account has active access' : 'Access suspended due to policy'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isToggling}
              onClick={() => onToggleStatus(user)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isActive ? 'bg-emerald-500' : 'bg-red-500/80'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-xs font-bold uppercase ${
                isActive ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {isActive ? 'Active' : 'Suspended'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsDrawer;
