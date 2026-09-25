import React, { useState } from "react";
import { Users, CreditCard, Zap, CheckCircle2, AlertCircle, Clock, Copy, Check, ShieldAlert, Plus } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { SearchBar } from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';
import { UserTable } from "./components/UserTable";
import { QuotaTopUpModal } from "./components/QuotaTopUpModal";

/**
 * AdminUsersTab Component
 * Business User & Subscription Billing Directory displaying all registered business tenants,
 * active plan subscription details, payment gateway, post quota usage, transaction IDs,
 * instant Bonus Post Quota top-ups, and interactive Account Status deactivation toggle switches.
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
  const [topUpUser, setTopUpUser] = useState(null);

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
      <UserTable
        users={users}
        isLoading={isLoadingUsers}
        copiedId={copiedId}
        onCopy={handleCopy}
        onOpenTopUp={(u) => setTopUpUser(u)}
        onToggleStatus={(u) =>
          toggleUserStatusMutation?.mutate({
            userId: u.id,
            isActive: u.isActive === false,
          })
        }
        isToggling={toggleUserStatusMutation?.isPending}
      />

      {/* Bonus Quota Top-Up Modal */}
      <QuotaTopUpModal
        isOpen={Boolean(topUpUser)}
        onClose={() => setTopUpUser(null)}
        user={topUpUser}
        onConfirm={(payload) => topUpUserQuotaMutation?.mutate(payload)}
        isPending={topUpUserQuotaMutation?.isPending}
      />

      {users.length > 0 && (
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
      )}
    </div>
  );
};
export default AdminUsersTab;
