import React from 'react';
import { Activity } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { formatDateTime } from '../../../../shared/utils/date.util';

export const SubAdminActivityLog = ({ activities = [], isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="p-3 sm:p-3.5 bg-[#131B2A] border border-[#2C384E] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg skeleton-shimmer shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-40 sm:w-56 rounded skeleton-shimmer" />
                <div className="h-3 w-28 sm:w-36 rounded skeleton-shimmer opacity-60" />
              </div>
            </div>
            <div className="h-3 w-28 rounded skeleton-shimmer opacity-50 pl-11 sm:pl-0" />
          </div>
        ))}
      </div>
    );
  }

  const sortedActivities = React.useMemo(() => {
    return [...activities].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [activities]);

  if (sortedActivities.length === 0) {
    return (
      <div className="p-6 sm:p-8 text-center text-slate-400 text-xs sm:text-sm border border-dashed border-[#2C384E] rounded-xl bg-[#131B2A]/30">
        No activity logs recorded.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedActivities.map((act) => (
        <Card
          key={act.id}
          className="p-3 sm:p-3.5 bg-[#131B2A] border-[#2C384E] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-sm hover:border-amber-500/30 transition"
        >
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5 sm:mt-0">
              <Activity className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white break-words leading-snug">
                <span className="text-amber-400 font-bold">{act.subAdmin?.fullName || 'Moderator'}</span> {act.action}
              </p>
              <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{act.details || '—'}</p>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-mono shrink-0 pl-11 sm:pl-0">
            {formatDateTime(act.createdAt)}
          </span>
        </Card>
      ))}
    </div>
  );
};

export default SubAdminActivityLog;
