import React from 'react';
import { Users } from 'lucide-react';
import { UserTableRow } from './UserTableRow';

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
  onToggleStatus,
  isToggling,
}) => {
  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm bg-[#131B2A] border border-[#2C384E] rounded-2xl">
        Loading user subscriptions & payment details...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-[#2C384E] bg-[#131B2A] rounded-2xl space-y-3">
        <Users className="w-10 h-10 text-slate-600 mx-auto" />
        <p className="text-slate-300 font-semibold text-sm">
          No registered business users found.
        </p>
      </div>
    );
  }

  return (
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
          {users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              copiedId={copiedId}
              onCopy={onCopy}
              onOpenTopUp={onOpenTopUp}
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
