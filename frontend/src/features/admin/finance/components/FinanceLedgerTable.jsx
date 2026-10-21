import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { formatCurrency } from '../../../../shared/utils/currency.util';

/**
 * Historical transactions ledger table with pagination
 */
export const FinanceLedgerTable = ({
  transactions = [],
  isLoadingTransactions,
  meta,
  page,
  setPage,
  setLimit,
  onRefresh,
  scopeInfo,
  children, // Filter bar passed as slot or nested
}) => {
  return (
    <div className="p-3.5 sm:p-5 bg-[#131B2A] border border-[#2C384E] rounded-2xl space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C384E] pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-heading font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <span>Billing & Payment Transactions Ledger</span>
            </h3>
            <span className="text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-bold">
              {meta?.totalItems || 0} Total Records
            </span>
            <span className="text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
              {scopeInfo?.daysText}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical ledger of customer subscriptions, gateways, and payments covering {scopeInfo?.label}.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="text-slate-400 hover:text-white min-h-[36px] w-full sm:w-auto justify-center"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Filter Slot */}
      {children}

      {/* Mobile Card Stack View (< 768px) */}
      <div className="block md:hidden space-y-3">
        {isLoadingTransactions ? (
          Array.from({ length: 4 }).map((_, rIdx) => (
            <div
              key={rIdx}
              className="p-4 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-32 rounded skeleton-shimmer" />
                <div className="h-5 w-16 rounded-full skeleton-shimmer" />
              </div>
              <div className="h-3 w-48 rounded skeleton-shimmer opacity-70" />
              <div className="flex justify-between items-center pt-2 border-t border-[#2C384E]/40">
                <div className="h-4 w-20 rounded skeleton-shimmer" />
                <div className="h-4 w-24 rounded skeleton-shimmer" />
              </div>
            </div>
          ))
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 italic bg-[#0B0F17] rounded-xl border border-[#2C384E]">
            No matching transactions found.
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 rounded-xl bg-[#0B0F17] border border-[#2C384E] hover:border-slate-600 transition space-y-3 text-xs"
            >
              {/* Header: User & Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white truncate text-sm">
                    {tx.user?.fullName || 'User'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">
                    {tx.user?.email}
                  </div>
                  {tx.user?.brandKit?.businessName && (
                    <div className="text-[11px] text-amber-400 font-medium truncate mt-0.5">
                      {tx.user?.brandKit?.businessName}
                    </div>
                  )}
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border shrink-0 ${
                    tx.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : tx.status === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {tx.status}
                </span>
              </div>

              {/* Amount & Plan Row */}
              <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-[#131B2A] border border-[#2C384E]/70">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Amount
                  </span>
                  {tx.transactionType === 'ADMIN_BONUS' || tx.paymentGateway === 'ADMIN_BONUS' ? (
                    <div className="flex items-center gap-1">
                      <span className="text-purple-400 font-mono font-bold text-sm">+{tx.postCount || 10} Posts</span>
                      <span className="text-[10px] text-slate-500">(Bonus)</span>
                    </div>
                  ) : (
                    <span className="text-emerald-400 font-mono font-bold text-sm">
                      {formatCurrency(tx.pricePaid, tx.currency)}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Plan
                  </span>
                  {tx.transactionType === 'ADMIN_BONUS' || tx.paymentGateway === 'ADMIN_BONUS' ? (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1">
                      <span>Bonus</span>
                      {tx.postCount > 0 && <span>(+{tx.postCount}p)</span>}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
                      {tx.plan}
                    </span>
                  )}
                </div>
              </div>

              {/* Gateway, Currency & Date Details */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                      tx.paymentGateway === 'ADMIN_BONUS' || tx.transactionType === 'ADMIN_BONUS'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : tx.paymentGateway === 'RAZORPAY'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : tx.paymentGateway === 'STRIPE'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        : tx.paymentGateway === 'UPI'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {tx.paymentGateway === 'ADMIN_BONUS'
                      ? 'ADMIN BONUS'
                      : tx.paymentGateway === 'ADMIN_MANUAL'
                      ? 'MANUAL'
                      : (tx.paymentGateway || 'FREE')}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono font-bold">
                    {tx.currency || 'INR'}
                  </span>
                </div>

                <div className="font-mono text-[10px] text-slate-400">
                  {new Date(tx.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {/* Payment ID / Order ID */}
              {(tx.paymentId || tx.orderId) && (
                <div className="pt-2 border-t border-[#2C384E]/40 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="text-slate-500">Ref ID:</span>
                  <span className="truncate max-w-[200px]" title={tx.paymentId || tx.orderId}>
                    {tx.paymentId || tx.orderId}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop Transactions Table (>= 768px) */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar border border-[#2C384E] rounded-xl bg-[#0B0F17]">
        <table className="w-full text-left border-collapse text-xs min-w-[780px]">
          <thead>
            <tr className="border-b border-[#2C384E] bg-[#131B2A]/80 text-slate-400 font-bold uppercase tracking-wider">
              <th className="p-3">Date & Time</th>
              <th className="p-3">Customer / Email</th>
              <th className="p-3">Business</th>
              <th className="p-3">Plan</th>
              <th className="p-3">Gateway</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Payment / Order ID</th>
              <th className="p-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2C384E]/60 text-slate-200">
            {isLoadingTransactions ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="border-b border-[#2C384E]/40">
                  {Array.from({ length: 8 }).map((_, cIdx) => (
                    <td key={cIdx} className="p-3">
                      <div
                        className="h-3.5 rounded skeleton-shimmer"
                        style={{ width: `${60 + ((rIdx + cIdx) % 3) * 15}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                  No matching transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#131B2A]/60 transition">
                  <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  <td className="p-3 font-semibold text-white whitespace-nowrap">
                    <div>
                      <span>{tx.user?.fullName || 'User'}</span>
                      <span className="block text-[10px] text-slate-400 font-mono font-normal">
                        {tx.user?.email}
                      </span>
                    </div>
                  </td>

                  <td className="p-3 text-slate-300 font-medium whitespace-nowrap">
                    {tx.user?.brandKit?.businessName || '—'}
                  </td>

                  <td className="p-3">
                    {tx.transactionType === 'ADMIN_BONUS' || tx.paymentGateway === 'ADMIN_BONUS' ? (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1">
                        <span>Bonus</span>
                        {tx.postCount > 0 && <span>(+{tx.postCount}p)</span>}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
                        {tx.plan}
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          tx.paymentGateway === 'ADMIN_BONUS' || tx.transactionType === 'ADMIN_BONUS'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : tx.paymentGateway === 'RAZORPAY'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : tx.paymentGateway === 'STRIPE'
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                            : tx.paymentGateway === 'UPI'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {tx.paymentGateway === 'ADMIN_BONUS'
                          ? 'ADMIN BONUS'
                          : tx.paymentGateway === 'ADMIN_MANUAL'
                          ? 'MANUAL'
                          : (tx.paymentGateway || 'FREE')}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono font-bold">
                        {tx.currency || 'INR'}
                      </span>
                    </div>
                  </td>

                  <td className="p-3 font-mono font-bold text-xs">
                    {tx.transactionType === 'ADMIN_BONUS' || tx.paymentGateway === 'ADMIN_BONUS' ? (
                      <div className="flex flex-col">
                        <span className="text-purple-400">+{tx.postCount || 10} Posts</span>
                        <span className="text-[10px] text-slate-500 font-normal">Bonus Grant</span>
                      </div>
                    ) : (
                      <span className="text-emerald-400">{formatCurrency(tx.pricePaid, tx.currency)}</span>
                    )}
                  </td>

                  <td className="p-3 font-mono text-[10px] text-slate-400 whitespace-nowrap max-w-[160px] truncate">
                    {tx.paymentId || tx.orderId || '—'}
                  </td>

                  <td className="p-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        tx.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : tx.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <Pagination
        meta={meta}
        currentPage={meta?.page || page}
        totalPages={meta?.totalPages || 1}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        pageSizeOptions={[10, 20, 50, 100]}
      />
    </div>
  );
};
