import React from 'react';
import { TrendingUp, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../../../shared/utils/currency.util';

/**
 * Financial Executive KPI Cards Grid displaying INR/USD metrics and active subs
 */
export const FinanceKpiCards = ({
  currency,
  overview,
  isLoadingOverview,
  scopeInfo,
}) => {
  const getCurrencyRevenue = (currCode) => {
    if (!overview?.currencyBreakdown) return 0;
    const item = overview.currencyBreakdown.find(
      (c) => (c.currency || '').toUpperCase() === currCode.toUpperCase()
    );
    return item ? item.revenue : 0;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* INR Revenue Card */}
      <div
        className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#182335] to-[#0F172A] border border-[#2C384E] border-t-2 border-t-amber-500 flex flex-col justify-between space-y-3 relative overflow-hidden transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg ${
          currency === 'INR' ? 'ring-1 ring-amber-500/60 shadow-amber-500/10 shadow-xl' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base shrink-0">🇮🇳</span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider truncate">
              INR Revenue
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold shrink-0 whitespace-nowrap">
            Razorpay / UPI
          </span>
        </div>
        <div>
          <h3 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight font-mono">
            {isLoadingOverview ? '...' : formatCurrency(getCurrencyRevenue('INR'), 'INR')}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block shrink-0" />
              <span className="truncate">Domestic Volume</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
              {scopeInfo?.daysText}
            </span>
          </div>
        </div>
      </div>

      {/* INR MRR Card */}
      <div
        className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#182335] to-[#0F172A] border border-[#2C384E] border-t-2 border-t-amber-500 flex flex-col justify-between space-y-3 relative overflow-hidden transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg ${
          currency === 'INR' ? 'ring-1 ring-amber-500/60 shadow-amber-500/10 shadow-xl' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base shrink-0">🇮🇳</span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider truncate">
              INR MRR
            </span>
          </div>
          <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl xl:text-3xl font-extrabold text-amber-400 tracking-tight font-mono">
            {isLoadingOverview ? '...' : formatCurrency(overview?.mrrINR, 'INR')}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block shrink-0" />
              <span className="truncate">INR Run Rate</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
              30-Day Rate
            </span>
          </div>
        </div>
      </div>

      {/* USD Revenue Card */}
      <div
        className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#182335] to-[#0F172A] border border-[#2C384E] border-t-2 border-t-purple-500 flex flex-col justify-between space-y-3 relative overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg ${
          currency === 'USD' ? 'ring-1 ring-purple-500/60 shadow-purple-500/10 shadow-xl' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base shrink-0">🇺🇸</span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider truncate">
              USD Revenue
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-mono font-bold shrink-0 whitespace-nowrap">
            Stripe Global
          </span>
        </div>
        <div>
          <h3 className="text-2xl xl:text-3xl font-extrabold text-purple-200 tracking-tight font-mono">
            {isLoadingOverview ? '...' : formatCurrency(getCurrencyRevenue('USD'), 'USD')}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block shrink-0" />
              <span className="truncate">Int'l Volume</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/20">
              {scopeInfo?.daysText}
            </span>
          </div>
        </div>
      </div>

      {/* USD MRR Card */}
      <div
        className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#182335] to-[#0F172A] border border-[#2C384E] border-t-2 border-t-purple-500 flex flex-col justify-between space-y-3 relative overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg ${
          currency === 'USD' ? 'ring-1 ring-purple-500/60 shadow-purple-500/10 shadow-xl' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base shrink-0">🇺🇸</span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider truncate">
              USD MRR
            </span>
          </div>
          <div className="p-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl xl:text-3xl font-extrabold text-purple-300 tracking-tight font-mono">
            {isLoadingOverview ? '...' : formatCurrency(overview?.mrrUSD, 'USD')}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block shrink-0" />
              <span className="truncate">USD Run Rate</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
              30-Day Rate
            </span>
          </div>
        </div>
      </div>

      {/* Active Accounts Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#182335] to-[#0F172A] border border-[#2C384E] border-t-2 border-t-emerald-500 flex flex-col justify-between space-y-3 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider truncate">
            Active Accounts
          </span>
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl xl:text-3xl font-extrabold text-emerald-400 tracking-tight font-mono">
            {isLoadingOverview ? '...' : `${overview?.activeSubsCount || 0} Active`}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1">
            <span className="flex items-center gap-1 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shrink-0" />
              <span className="truncate">
                {overview?.paidUsersCount || 0} Paid | {overview?.expiredSubsCount || 0} Expired
              </span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
              Current
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
