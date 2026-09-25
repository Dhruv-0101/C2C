import React from 'react';
import { Search, Calendar, X } from 'lucide-react';
import { Input } from '../../../../components/ui/Input';

/**
 * Filter controls bar for the finance ledger
 */
export const FinanceLedgerFilters = ({
  search,
  onSearchChange,
  currency,
  onCurrencyChange,
  paymentGateway,
  onPaymentGatewayChange,
  status,
  onStatusChange,
  plan,
  onPlanChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onClearDates,
  scopeInfo,
}) => {
  return (
    <div className="space-y-3 p-3.5 bg-[#0B0F17] border border-[#2C384E] rounded-xl text-xs">
      {/* Row 1: Search, Currency, Gateway, Status, Plan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search user, email, payment ID..."
            className="bg-[#131B2A] border-[#2C384E] text-xs text-white pl-8 py-1.5"
          />
        </div>

        {/* Currency Filter */}
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="w-full bg-[#131B2A] border border-[#2C384E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
        >
          <option value="">All Currencies</option>
          <option value="INR">🇮🇳 INR (₹)</option>
          <option value="USD">🇺🇸 USD ($)</option>
        </select>

        {/* Gateway Filter */}
        <select
          value={paymentGateway}
          onChange={(e) => onPaymentGatewayChange(e.target.value)}
          className="w-full bg-[#131B2A] border border-[#2C384E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
        >
          <option value="">All Gateways</option>
          <option value="RAZORPAY">Razorpay</option>
          <option value="STRIPE">Stripe</option>
          <option value="UPI">UPI Direct</option>
          <option value="FREE">Free Tier</option>
          <option value="ADMIN_MANUAL">Admin Manual</option>
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full bg-[#131B2A] border border-[#2C384E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option value="">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>

        {/* Plan Filter */}
        <select
          value={plan}
          onChange={(e) => onPlanChange(e.target.value)}
          className="w-full bg-[#131B2A] border border-[#2C384E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option value="">All Plans</option>
          <option value="FREE">Free</option>
          <option value="PRO">Pro</option>
        </select>
      </div>

      {/* Row 2: Date Filters & Timeframe Scope Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#2C384E]/60">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Date Range:</span>
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 uppercase font-mono">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="bg-[#131B2A] border border-[#2C384E] rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 uppercase font-mono">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="bg-[#131B2A] border border-[#2C384E] rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={onClearDates}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/30 transition flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Clear Dates</span>
            </button>
          )}
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Covering: <span className="text-emerald-400 font-bold">{scopeInfo?.daysText}</span> ({scopeInfo?.label})
        </div>
      </div>
    </div>
  );
};
