import React from 'react';
import { Layers, BarChart3, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';

export const AdminPostAnalyticsBar = ({ totalCount = 0, publishedCount = 0, scheduledCount = 0 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Card className="p-3.5 bg-[#131B2A] border-[#2C384E] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Total Generated Posts</p>
            <h4 className="text-lg font-bold text-white font-mono">{totalCount}</h4>
          </div>
        </div>
      </Card>

      <Card className="p-3.5 bg-[#131B2A] border-[#2C384E] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Published Live</p>
            <h4 className="text-lg font-bold text-emerald-400 font-mono">{publishedCount}</h4>
          </div>
        </div>
      </Card>

      <Card className="p-3.5 bg-[#131B2A] border-[#2C384E] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Scheduled Pipeline</p>
            <h4 className="text-lg font-bold text-amber-400 font-mono">{scheduledCount}</h4>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminPostAnalyticsBar;
