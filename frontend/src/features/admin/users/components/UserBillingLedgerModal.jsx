import React, { useState, useEffect } from "react";
import {
  CreditCard,
  X,
  Search,
  Zap,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Copy,
  Check,
  Filter,
  FileText,
  ShieldCheck,
  ShieldAlert,
  ArrowDownCircle,
  Receipt,
} from "lucide-react";
import { useUserLedger } from "../hooks/useUserLedger";
import { useDebounce } from "@/shared/hooks/useDebounce";
import Pagination from "@/components/ui/Pagination";
import { formatDate } from "@/shared/utils/date.util";
import { billingApi } from "@/features/billing/api/billing.api";

/**
 * UserBillingLedgerModal Component
 * Enterprise financial ledger inspector allowing administrators to review the complete,
 * immutable transaction history, invoices, plan payments, and quota credits for a specific tenant.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Modal dismissal callback
 * @param {Object|null} props.user - Target user entity with subscription & brandKit
 */
export const UserBillingLedgerModal = ({ isOpen, onClose, user }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  // Reset pagination state when modal opens or user changes
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setSearch("");
      setStatusFilter("ALL");
    }
  }, [isOpen, user?.id]);

  // Reset page to 1 on filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const {
    transactions = [],
    meta,
    isLoading,
    error,
  } = useUserLedger(
    user?.id,
    {
      page,
      limit,
      search: debouncedSearch || undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
    },
    { enabled: Boolean(isOpen && user?.id) }
  );

  if (!isOpen || !user) return null;

  const sub = user.subscription;
  const isPro = sub?.plan === "PRO";
  const isFree = sub?.plan === "FREE";
  const currencySym = sub?.currency === "USD" ? "$" : "₹";
  const totalRemaining = Math.max(
    0,
    (sub?.totalPostsAllowed || 0) + (sub?.bonusPostsAllowed || 0) - (sub?.postsUsed || 0) - (sub?.bonusPostsUsed || 0)
  );

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadInvoice = async (txId) => {
    try {
      setDownloadingId(txId);
      await billingApi.downloadInvoice(txId);
    } catch (err) {
      console.error("Failed to download invoice:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const totalTransactionsCount = meta?.totalItems ?? transactions.length;

  return (
    <div
      className="modal-backdrop-overlay fixed inset-0 w-screen h-screen z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in bg-slate-950/80 backdrop-blur-sm overflow-hidden"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[92vh] bg-[#131B2A] border border-[#2C384E] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Header: User Info & Subscription Badge */}
        <div className="p-5 sm:p-6 border-b border-[#2C384E] flex items-center justify-between gap-4 shrink-0 bg-[#0B0F17]">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-sm">
              <Receipt className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-extrabold text-lg text-white truncate">
                  {user.fullName}
                </h3>
                {user.brandKit?.businessName && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                    <Building2 className="w-3 h-3 text-amber-400" />
                    <span>{user.brandKit.businessName}</span>
                  </span>
                )}
                {isPro ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold uppercase">
                    <Zap className="w-3 h-3 fill-indigo-400" /> Pro Plan ({currencySym}{sub.pricePaid})
                  </span>
                ) : isFree ? (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold uppercase">
                    Free Plan
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] uppercase">
                    No Plan
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono font-bold shrink-0">
                  {totalTransactionsCount} {totalTransactionsCount === 1 ? "Transaction" : "Transactions"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                {user.email} • ID: {user.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition cursor-pointer shrink-0"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Top Summary Pulse Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-[#0E1522] border-b border-[#2C384E] shrink-0 text-xs">
          <div className="p-3 rounded-xl bg-[#131B2A] border border-[#2C384E]/70 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Post Quota</span>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold font-mono text-emerald-400">{totalRemaining} Posts</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {(sub?.postsUsed || 0) + (sub?.bonusPostsUsed || 0)} used
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#131B2A] border border-[#2C384E]/70 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Plan Tier</span>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold text-white font-mono">{sub?.plan || "NONE"}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {sub?.status === "ACTIVE" ? "🟢 Active" : "⚪ " + (sub?.status || "Inactive")}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#131B2A] border border-[#2C384E]/70 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment Gateway</span>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold text-amber-300 font-mono uppercase">
                {sub?.paymentGateway || "Direct / Free"}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{sub?.currency || "INR"}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#131B2A] border border-[#2C384E]/70 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Invoices</span>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold text-indigo-300 font-mono">{totalTransactionsCount}</span>
              <span className="text-[10px] text-slate-400 font-mono">ledger records</span>
            </div>
          </div>
        </div>

        {/* 3. Filter & Search Strip */}
        <div className="px-5 py-3 border-b border-[#2C384E] bg-[#0B0F17] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by Order ID, Payment ID, or Gateway..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-[#131B2A] border border-[#2C384E] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-bold px-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Status:
            </span>
            {["ALL", "COMPLETED", "PENDING", "FAILED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  statusFilter === st
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {st === "ALL" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Scrollable Ledger Transactions Table */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={`skel-tx-${i}`}
                  className="h-14 rounded-xl bg-[#0B0F17] border border-[#2C384E] animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs">
              Failed to load financial ledger for this tenant. Please try again.
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-2xl text-slate-400 text-xs space-y-2 bg-[#0B0F17]/40">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <p className="font-heading font-bold text-sm text-white">
                {search ? `No ledger records matching "${search}"` : "No billing transactions recorded yet"}
              </p>
              <p className="text-slate-400 max-w-md mx-auto">
                {search
                  ? "Try clearing your search query or status filter."
                  : "All subscription purchases, plan renewals, manual payments, and admin bonus quotas will appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#2C384E] rounded-2xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0B0F17] text-slate-400 uppercase text-[10px] font-bold border-b border-[#2C384E]">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Transaction / Reference</th>
                    <th className="py-3 px-4">Type & Plan</th>
                    <th className="py-3 px-4">Credits Added</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Gateway</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C384E]/70 bg-[#131B2A]">
                  {transactions.map((tx) => {
                    const txId = tx.id || tx.paymentId;
                    const dateFormatted = tx.createdAt ? formatDate(tx.createdAt) : "—";
                    const isCompleted = tx.status === "COMPLETED";
                    const isPending = tx.status === "PENDING";
                    const isFailed = tx.status === "FAILED";

                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* 1. Date */}
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                          {dateFormatted}
                        </td>

                        {/* 2. Transaction / Payment ID */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            {tx.paymentId ? (
                              <button
                                type="button"
                                onClick={() => handleCopy(tx.paymentId)}
                                className="inline-flex items-center gap-1 font-mono text-xs text-white hover:text-indigo-300 transition cursor-pointer"
                                title="Click to copy Payment ID"
                              >
                                <span className="font-bold">{tx.paymentId}</span>
                                {copiedId === tx.paymentId ? (
                                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                                ) : (
                                  <Copy className="w-3 h-3 text-slate-500 shrink-0" />
                                )}
                              </button>
                            ) : (
                              <span className="font-mono text-slate-400 text-xs">
                                {tx.orderId || tx.id?.slice(0, 12)}
                              </span>
                            )}
                            {tx.orderId && tx.paymentId && (
                              <div className="text-[10px] text-slate-500 font-mono">
                                Order: {tx.orderId}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 3. Transaction Type & Plan */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                tx.transactionType === "PLAN_PURCHASE"
                                  ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                                  : tx.transactionType === "ADMIN_BONUS"
                                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                  : "bg-slate-800 text-slate-300 border border-slate-700"
                              }`}
                            >
                              {tx.transactionType === "PLAN_PURCHASE"
                                ? "Plan Purchase"
                                : tx.transactionType === "ADMIN_BONUS"
                                ? "Admin Top-Up"
                                : "Activation"}
                            </span>
                            <div className="text-[10px] text-slate-400 font-medium">
                              Plan: <span className="text-white font-bold">{tx.plan || "PRO"}</span>
                            </div>
                          </div>
                        </td>

                        {/* 4. Post Credits Added */}
                        <td className="py-3 px-4 font-mono font-bold text-amber-300 whitespace-nowrap">
                          {tx.postCount > 0 ? `+${tx.postCount} Posts` : "—"}
                        </td>

                        {/* 5. Amount Paid */}
                        <td className="py-3 px-4 font-mono font-bold text-white text-sm whitespace-nowrap">
                          {tx.pricePaid > 0 ? (
                            <span>
                              {tx.currency === "USD" ? "$" : "₹"} {tx.pricePaid} {tx.currency || "INR"}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">Free ($0)</span>
                          )}
                        </td>

                        {/* 6. Payment Gateway */}
                        <td className="py-3 px-4 font-mono text-xs uppercase text-slate-300 whitespace-nowrap">
                          {tx.paymentGateway || "DIRECT"}
                        </td>

                        {/* 7. Status Badge */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isCompleted
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : isFailed
                                ? "bg-red-500/15 text-red-400 border-red-500/30"
                                : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isCompleted ? "bg-emerald-400" : isFailed ? "bg-red-400" : "bg-amber-400"
                              }`}
                            />
                            <span>{tx.status}</span>
                          </span>
                        </td>

                        {/* 8. Download Invoice Action */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleDownloadInvoice(tx.id)}
                            disabled={downloadingId === tx.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:text-white transition cursor-pointer text-xs font-semibold disabled:opacity-50"
                            title="Download PDF Tax Invoice"
                          >
                            <Download className="w-3 h-3 text-indigo-400" />
                            <span>{downloadingId === tx.id ? "Downloading..." : "Invoice"}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 5. Modal Footer with Pagination */}
        {transactions.length > 0 && (
          <div className="p-4 border-t border-[#2C384E] bg-[#0B0F17] shrink-0">
            <Pagination
              meta={meta}
              currentPage={page}
              totalPages={meta?.totalPages || Math.max(1, Math.ceil(totalTransactionsCount / limit))}
              onPageChange={(newPage) => setPage(newPage)}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              pageSizeOptions={[5, 10, 20, 50]}
              className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBillingLedgerModal;
