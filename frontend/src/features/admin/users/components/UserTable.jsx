import React from 'react';
import { Users } from 'lucide-react';
import { UserTableRow } from './UserTableRow';
import { SkeletonTable } from '@/components/feedback/SkeletonLoader';

/**
 * UserTable Component
 * Business User & Subscription Billing Directory table view.
 */
export const UserTable = ({
  users = [],
  isLoading,
  copiedId,
  onCopy,
  onOpenTopUp,
  onOpenConnectSocial,
  onToggleStatus,
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
      <div className="p-8 text-center border border-dashed border-slate-200 dark:border-[#2C384E] bg-white dark:bg-[#131B2A] rounded-2xl space-y-2">
        <Users className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
        <p className="text-slate-600 dark:text-slate-300 font-semibold text-sm">
          No registered business users found.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-[#2C384E] bg-white dark:bg-[#131B2A] shadow-sm">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-[#2C384E] text-[11px]">
          <tr>
            <th className="py-2.5 px-3">User Details</th>
            <th className="py-2.5 px-3">Business Name</th>
            <th className="py-2.5 px-3">Active Plan</th>
            <th className="py-2.5 px-3">Gateway</th>
            <th className="py-2.5 px-3">Amount Paid</th>
            <th className="py-2.5 px-3">Posts Quota Usage</th>
            <th className="py-2.5 px-3">Payment Reference ID</th>
            <th className="py-2.5 px-3">Plan Status</th>
            <th className="py-2.5 px-3">Social Media</th>
            <th className="py-2.5 px-3">Account Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-[#2C384E]">
          {users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              copiedId={copiedId}
              onCopy={onCopy}
              onOpenTopUp={onOpenTopUp}
              onOpenConnectSocial={onOpenConnectSocial}
              onToggleStatus={onToggleStatus}
              isToggling={isToggling}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
