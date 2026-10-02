import React from 'react';
import { TrendingUp, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../../../shared/utils/currency.util';
import { SkeletonKPI } from '@/components/feedback/SkeletonLoader';

/**
 * Financial Executive KPI Cards Grid displaying INR/USD metrics and active subs
 * Clean enterprise-grade layout with high contrast figures and un-truncated badges.
 */
export const FinanceKpiCards = ({
  currency,
  overview,
  isLoadingOverview,
  scopeInfo,
}) => {
  if (isLoadingOverview) {
    return <SkeletonKPI count={5} />;
  }

  const getCurrencyRevenue = (currCode) => {
    if (!overview?.currencyBreakdown) return 0;
    const item = overview.currencyBreakdown.find(
      (c) => (c.currency || '').toUpperCase() === currCode.toUpperCase()
    );
    return item ? item.revenue : 0;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. INR Revenue Card */}
      <div
        className={`p-4 sm:p-5 rounded-2xl bg-[#131B2A] border transition-all duration-200 flex flex-col justify-between space-y-3 relative overflow-hidden group ${
          currency === 'INR'
            ? 'border-amber-500/50 bg-[#152033] shadow-lg shadow-black/40 ring-1 ring-amber-500/30'
            : 'border-[#2C384E] hover:border-slate-600 hover:bg-[#152033]/60'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              INR Revenue
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono font-semibold shrink-0">
            Razorpay
          </span>
        </div>
        <div>
          <h3 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight font-mono">
            {isLoadingOverview ? '...' : formatCurrency(getCurrencyRevenue('INR'), 'INR')}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-2 pt-2 border-t border-[#2C384E]/50">
            <span className="truncate text-slate-400">Domestic Volume</span>
            <span className="text-[10px] font-semibold text-slate-400 shrink-0">
              {scopeInfo?.daysText}
            </span>
          </div>
        </div>
      </div>

      {/* 2. INR MRR Card */}
      <div
        className={`p-4 sm:p-5 rounded-2xl bg-[#131B2A] border transition-all duration-200 flex flex-col justify-between space-y-3 relative overflow-hidden group ${
          currency === 'INR'
            ? 'border-amber-500/50 bg-[#152033] shadow-lg shadow-black/40 ring-1 ring-amber-500/30'
            : 'border-[#2C384E] hover:border-slate-600 hover:bg-[#152033]/60'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              INR MRR
            </span>
          </div>
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight font-mono">
            {isLoadingOverview ? '...' : formatCurrency(overview?.mrrINR, 'INR')}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-2 pt-2 border-t border-[#2C384E]/50">
            <span className="truncate text-slate-400">Monthly Run Rate</span>
            <span className="text-[10px] text-emerald-400/90 font-semibold shrink-0">
              30-Day Rate
            </span>
          </div>
        </div>
      </div>

      {/* 3. USD Revenue Card */}
      <div
        className={`p-4 sm:p-5 rounded-2xl bg-[#131B2A] border transition-all duration-200 flex flex-col justify-between space-y-3 relative overflow-hidden group ${
          currency === 'USD'
            ? 'border-sky-500/50 bg-[#152033] shadow-lg shadow-black/40 ring-1 ring-sky-500/30'
            : 'border-[#2C384E] hover:border-slate-600 hover:bg-[#152033]/60'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              USD Revenue
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[10px] font-mono font-semibold shrink-0">
            Stripe
          </span>
        </div>
        <div>
          <h3 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight font-mono">
            {isLoadingOverview ? '...' : formatCurrency(getCurrencyRevenue('USD'), 'USD')}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-2 pt-2 border-t border-[#2C384E]/50">
            <span className="truncate text-slate-400">Int'l Volume</span>
            <span className="text-[10px] font-semibold text-slate-400 shrink-0">
              {scopeInfo?.daysText}
            </span>
          </div>
        </div>
      </div>

      {/* 4. USD MRR Card */}
      <div
        className={`p-4 sm:p-5 rounded-2xl bg-[#131B2A] border transition-all duration-200 flex flex-col justify-between space-y-3 relative overflow-hidden group ${
          currency === 'USD'
            ? 'border-sky-500/50 bg-[#152033] shadow-lg shadow-black/40 ring-1 ring-sky-500/30'
            : 'border-[#2C384E] hover:border-slate-600 hover:bg-[#152033]/60'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              USD MRR
            </span>
          </div>
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight font-mono">
            {isLoadingOverview ? '...' : formatCurrency(overview?.mrrUSD, 'USD')}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-2 pt-2 border-t border-[#2C384E]/50">
            <span className="truncate text-slate-400">Monthly Run Rate</span>
            <span className="text-[10px] text-emerald-400/90 font-semibold shrink-0">
              30-Day Rate
            </span>
          </div>
        </div>
      </div>

      {/* 5. Active Accounts Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#131B2A] border border-[#2C384E] hover:border-slate-600 hover:bg-[#152033]/60 transition-all duration-200 flex flex-col justify-between space-y-3 relative overflow-hidden group">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Active Accounts
            </span>
          </div>
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight font-mono">
              {isLoadingOverview ? '...' : (overview?.activeSubsCount || 0)}
            </h3>
            <span className="text-xs font-semibold text-emerald-400">Active</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-2 pt-2 border-t border-[#2C384E]/50">
            <span className="flex items-center gap-1 truncate text-slate-400">
              <span className="truncate">
                {overview?.paidUsersCount || 0} Paid | {overview?.expiredSubsCount || 0} Expired
              </span>
            </span>
            <span className="text-[10px] text-emerald-400/90 font-semibold shrink-0">
              Current
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceKpiCards;
