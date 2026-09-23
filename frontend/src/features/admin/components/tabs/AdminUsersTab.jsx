import React, { useState } from "react";
import { Users, CreditCard, Zap, CheckCircle2, AlertCircle, Clock, Copy, Check, ShieldAlert, Plus } from "lucide-react";
import { Alert } from "../../../../components/ui/Alert";
import { SearchBar } from "../../../../components/common/SearchBar";
import Pagination from "../../../../components/common/Pagination";

/**
 * AdminUsersTab Component
 * Business User & Subscription Billing Directory displaying all registered business tenants,
 * active plan subscription details, payment gateway, post quota usage, transaction IDs,
 * instant +10 Bonus Post Quota top-ups, and interactive Account Status deactivation toggle switches.
 */
export const AdminUsersTab = ({
  users = [],
  userMeta,
  isLoadingUsers,
  usersFetchError,
  userSearch,
  setUserSearch,
  userPage,
  setUserPage,
  setUserLimit,
  toggleUserStatusMutation,
  topUpUserQuotaMutation,
}) => {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-in fade-in duration-200 space-y-4">
      {/* Business User Directory & Payments Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Business Users & Payment Subscriptions</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage plan subscriptions, payment gateway references, post quotas, and toggle account access deactivation for policy violations.
            </p>
          </div>
        </div>

        <SearchBar
          value={userSearch}
          onChange={(val) => {
            const query = typeof val === "string" ? val : (val?.target?.value ?? "");
            setUserSearch(query);
            setUserPage(1);
          }}
          placeholder="Search by name, email, or business..."
          className="max-w-sm"
        />
      </div>

      {/* Error Notification */}
      {usersFetchError && (
        <Alert variant="error" message={usersFetchError.message} />
      )}

      {/* Table Content */}
      {isLoadingUsers ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-[#131B2A] border border-[#2C384E] rounded-2xl">
          Loading user subscriptions & payment details...
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#2C384E] bg-[#131B2A] rounded-2xl space-y-3">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-semibold text-sm">
            No registered business users found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-[#2C384E] bg-[#131B2A]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0F17] text-slate-400 uppercase tracking-wider font-bold border-b border-[#2C384E]">
                <tr>
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Business Name</th>
                  <th className="py-3.5 px-4">Active Plan</th>
                  <th className="py-3.5 px-4">Gateway</th>
                  <th className="py-3.5 px-4">Amount Paid</th>
                  <th className="py-3.5 px-4">Posts Quota Usage</th>
                  <th className="py-3.5 px-4">Payment Reference ID</th>
                  <th className="py-3.5 px-4">Plan Status</th>
                  <th className="py-3.5 px-4">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C384E]">
                {users.map((u) => {
                  const sub = u.subscription;
                  const price = sub?.pricePaid || 0;

                  const planTotal = sub?.totalPostsAllowed || 0;
                  const planUsed = sub?.postsUsed || 0;
                  const planRemaining = Math.max(0, planTotal - planUsed);

                  const bonusTotal = sub?.bonusPostsAllowed || 0;
                  const bonusUsed = sub?.bonusPostsUsed || 0;
                  const bonusRemaining = Math.max(0, bonusTotal - bonusUsed);

                  const totalRemaining = planRemaining + bonusRemaining;
                  const hasPlan = planTotal > 0 || (sub?.plan === "PRO" && price > 0);
                  const hasBonus = bonusTotal > 0;
                  const hasSub = hasPlan || hasBonus;

                  const isPro = sub?.plan === "PRO" && price > 0;
                  const isFree = sub?.plan === "FREE" && planTotal > 0;

                  const currencySym = sub?.currency === "USD" ? "$" : "₹";
                  const refId = sub?.paymentId || sub?.orderId || null;
                  const isActive = u.isActive !== false;

                  return (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition">
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-md">
                            {u.fullName?.charAt(0) || "U"}
                          </div>
                          <div>
                            <span className="font-bold text-white block flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {!isActive && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 font-extrabold border border-red-500/30 uppercase">
                                  <ShieldAlert className="w-2.5 h-2.5" /> Deactivated
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Business Name */}
                      <td className="py-3.5 px-4 font-medium text-slate-300">
                        {u.brandKit?.businessName ? (
                          <span className="text-amber-400 font-semibold">{u.brandKit.businessName}</span>
                        ) : (
                          <span className="text-slate-500 italic">Not Setup</span>
                        )}
                      </td>

                      {/* Plan Type */}
                      <td className="py-3.5 px-4">
                        {!hasSub ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                            NO PLAN ACTIVATED
                          </span>
                        ) : isPro ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold text-[10px] uppercase">
                            <Zap className="w-3 h-3 fill-indigo-400" /> PRO PLAN
                          </span>
                        ) : isFree ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[10px] uppercase">
                            FREE PLAN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px] uppercase shadow-xs">
                            <Zap className="w-3 h-3 text-amber-400" /> BONUS ONLY
                          </span>
                        )}
                      </td>

                      {/* Gateway */}
                      <td className="py-3.5 px-4">
                        {!hasSub || !sub.paymentGateway ? (
                          <span className="text-slate-500 font-mono text-[11px]">—</span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase border ${
                            sub.paymentGateway === "STRIPE"
                              ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                              : sub.paymentGateway === "RAZORPAY"
                              ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                              : sub.paymentGateway === "ADMIN_BONUS"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}>
                            {sub.paymentGateway}
                          </span>
                        )}
                      </td>

                      {/* Amount Paid */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {!hasSub ? (
                          <span className="text-slate-500 text-[11px]">—</span>
                        ) : isPro ? (
                          <span className="text-emerald-400 font-extrabold">
                            {currencySym} {price} {sub.currency || "INR"}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Free / Bonus ($0)</span>
                        )}
                      </td>

                      {/* Quota Progress & Top-Up Button */}
                      <td className="py-3.5 px-4 min-w-[170px]">
                        <div className="space-y-1">
                          <div className="text-[11px] font-mono flex flex-col gap-0.5">
                            {hasPlan && (
                              <div className="flex justify-between text-slate-300">
                                <span>Plan:</span>
                                <span className="font-bold text-white">{planUsed}/{planTotal}</span>
                              </div>
                            )}
                            {hasBonus && (
                              <div className="flex justify-between text-amber-300 font-bold">
                                <span>Bonus:</span>
                                <span>{bonusUsed}/{bonusTotal}</span>
                              </div>
                            )}
                            {!hasPlan && !hasBonus && (
                              <span className="text-slate-500 italic text-[10px]">0 Posts Available</span>
                            )}
                          </div>

                          <div className="pt-1 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-emerald-400 font-bold font-mono">
                              Rem: {totalRemaining}
                            </span>
                            <button
                              type="button"
                              disabled={topUpUserQuotaMutation?.isPending}
                              onClick={() => topUpUserQuotaMutation?.mutate({ userId: u.id, bonusPosts: 10 })}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 text-[10px] font-bold transition shadow-sm cursor-pointer"
                              title="Grant +10 Bonus Posts to this user"
                            >
                              <Plus className="w-2.5 h-2.5" />
                              <span>+10 Bonus</span>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Transaction / Reference ID */}
                      <td className="py-3.5 px-4">
                        {refId ? (
                          <button
                            type="button"
                            onClick={() => handleCopy(refId)}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#0B0F17] border border-[#2C384E] text-slate-300 hover:text-white font-mono text-[10px] group transition cursor-pointer"
                            title="Click to copy Payment Reference ID"
                          >
                            <span className="truncate max-w-[120px] font-bold">{refId}</span>
                            {copiedId === refId ? (
                              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-500 group-hover:text-amber-400 shrink-0" />
                            )}
                          </button>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Plan Status */}
                      <td className="py-3.5 px-4">
                        {!hasSub ? (
                          <span className="inline-flex items-center gap-1 text-slate-400 font-semibold text-[11px]">
                            <Clock className="w-3.5 h-3.5" /> NO PLAN
                          </span>
                        ) : totalRemaining <= 0 ? (
                          <span className="inline-flex items-center gap-1 text-red-400 font-bold text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" /> EXPIRED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                          </span>
                        )}
                      </td>

                      {/* Account Status (Interactive Deactivate / Activate Toggle Switch) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={toggleUserStatusMutation?.isPending}
                            onClick={() =>
                              toggleUserStatusMutation?.mutate({
                                userId: u.id,
                                isActive: !isActive,
                              })
                            }
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isActive ? "bg-emerald-500" : "bg-red-500/80"
                            }`}
                            title={isActive ? "Click to Deactivate Account" : "Click to Activate Account"}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                isActive ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>

                          <span
                            className={`text-[10px] font-extrabold uppercase font-mono px-2 py-0.5 rounded border ${
                              isActive
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                : "bg-red-500/20 border-red-500/40 text-red-400"
                            }`}
                          >
                            {isActive ? "ACTIVE" : "DEACTIVATED"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            meta={userMeta}
            currentPage={userPage}
            totalPages={userMeta?.totalPages || 1}
            onPageChange={setUserPage}
            onLimitChange={(newLimit) => {
              setUserLimit(newLimit);
              setUserPage(1);
            }}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      )}
    </div>
  );
};
export default AdminUsersTab;
