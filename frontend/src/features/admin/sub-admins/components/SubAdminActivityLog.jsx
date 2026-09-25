import React from 'react';
import { Activity } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { formatDateTime } from '../../../../shared/utils/date.util';

export const SubAdminActivityLog = ({ activities = [], isLoading }) => {
  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 italic">Loading activity logs...</div>;
  }

  if (activities.length === 0) {
    return <div className="p-8 text-center text-slate-500 italic">No activity logs recorded.</div>;
  }

  return (
    <div className="space-y-3">
      {activities.map((act) => (
        <Card key={act.id} className="p-3 bg-[#131B2A] border-[#2C384E] flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">
                <span className="text-amber-400">{act.subAdmin?.fullName || 'Moderator'}</span> {act.action}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">{act.details || '—'}</p>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">{formatDateTime(act.createdAt)}</span>
        </Card>
      ))}
    </div>
  );
};

export default SubAdminActivityLog;
