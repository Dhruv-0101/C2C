import React from 'react';
import { Users } from 'lucide-react';
import { UserTableRow } from './UserTableRow';
import { SkeletonTable } from '@/components/feedback/SkeletonLoader';

/**
 * UserTable Component
 * Clean, modern table view for Business Tenants and Payment Subscriptions.
 */
export const UserTable = ({
  users = [],
  isLoading,
  copiedId,
  onCopy,
  onOpenTopUp,
  onOpenConnectSocial,
  onToggleStatus,
  onViewDetails,
  isToggling,
}) => {
  if (isLoading) {
    return (
      <div className="py-2">
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-slate-200 dark:border-[#2C384E] bg-white dark:bg-[#131B2A] rounded-2xl space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-slate-800 dark:text-slate-200 font-bold text-sm">
            No registered business tenants found
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Try adjusting your search query or filter settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-[#2C384E] bg-white dark:bg-[#131B2A] shadow-sm">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 dark:bg-[#0B0F17] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-[#2C384E] text-[11px]">
          <tr>
            <th className="py-3 px-4">Business & Tenant</th>
            <th className="py-3 px-4">Subscription & Billing</th>
            <th className="py-3 px-4">Post Quota Usage</th>
            <th className="py-3 px-4">Social Integrations</th>
            <th className="py-3 px-4 text-right">Account & Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-[#2C384E]/70">
          {users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              copiedId={copiedId}
              onCopy={onCopy}
              onOpenTopUp={onOpenTopUp}
              onOpenConnectSocial={onOpenConnectSocial}
              onToggleStatus={onToggleStatus}
              onViewDetails={onViewDetails}
              isToggling={isToggling}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
