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
    <div className="p-5 bg-[#131B2A] border border-[#2C384E] rounded-2xl space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C384E] pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <span>Billing & Payment Transactions Ledger</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-bold">
              {meta?.totalItems || 0} Total Records
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
              {scopeInfo?.daysText}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical ledger of customer subscriptions, gateways, and payments covering {scopeInfo?.label}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Filter Slot */}
      {children}

      {/* Transactions Table */}
      <div className="overflow-x-auto border border-[#2C384E] rounded-xl bg-[#0B0F17]">
        <table className="w-full text-left border-collapse text-xs">
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
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                  Loading transactions ledger...
                </td>
              </tr>
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
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
                      {tx.plan}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          tx.paymentGateway === 'RAZORPAY'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : tx.paymentGateway === 'STRIPE'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : tx.paymentGateway === 'UPI'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {tx.paymentGateway || 'FREE'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono font-bold">
                        {tx.currency || 'INR'}
                      </span>
                    </div>
                  </td>

                  <td className="p-3 font-mono font-bold text-emerald-400 text-xs">
                    {formatCurrency(tx.pricePaid, tx.currency)}
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
