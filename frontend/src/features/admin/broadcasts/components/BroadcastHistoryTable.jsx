import React from 'react';
import { Megaphone, Users, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

/**
 * Broadcast Campaigns History Table Component
 * Displays previously dispatched manual broadcasts, delivery metrics, and admin audit log.
 */
export const BroadcastHistoryTable = ({
  broadcasts = [],
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  onPageChange,
  isLoading = false,
}) => {
  const getTypeBadge = (type) => {
    switch (type) {
      case 'PROMOTION':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'MAINTENANCE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'SYSTEM':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'ANNOUNCEMENT':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getAudienceLabel = (aud) => {
    switch (aud) {
      case 'ALL':
        return 'All Users';
      case 'FREE_USERS':
        return 'Free Plan';
      case 'PRO_USERS':
        return 'Pro Members';
      default:
        return aud;
    }
  };

  return (
    <div className="rounded-2xl bg-[#131B2A] border border-[#2C384E] shadow-xl overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-[#2C384E] flex items-center justify-between">
        <div>
          <h3 className="font-heading font-bold text-sm sm:text-base text-white">
            Past Broadcast Campaigns
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit log of all manual push notifications and in-app alerts dispatched
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300">
          {pagination.total} Total Campaigns
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#2C384E] bg-slate-950/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Campaign Headline</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Audience</th>
              <th className="py-3 px-4">Delivered</th>
              <th className="py-3 px-4">Sender</th>
              <th className="py-3 px-4 text-right">Date Sent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2C384E]/60 text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <div className="animate-spin w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2" />
                  Loading broadcast history...
                </td>
              </tr>
            ) : broadcasts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <Megaphone className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-bold text-slate-400">No Broadcasts Sent Yet</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Use the composer above to dispatch your first campaign.
                  </p>
                </td>
              </tr>
            ) : (
              broadcasts.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 max-w-[240px]">
                    <p className="font-bold text-white truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.message}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getTypeBadge(
                        item.type
                      )}`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-300">
                      {getAudienceLabel(item.targetAudience)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-emerald-400">{item.recipientCount} users</p>
                    <p className="text-[10px] text-slate-500">{item.deliveredCount} devices</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    <p className="text-xs font-semibold text-slate-200">
                      {item.admin?.fullName || 'SuperAdmin'}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                      {item.admin?.email}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400 whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="p-3 border-t border-[#2C384E] flex items-center justify-between text-xs bg-slate-950/40">
          <span className="text-slate-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastHistoryTable;
