import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, Share2, Building2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

/**
 * DashboardQuickStats
 * Posts remaining & scheduled today pills / metric cards
 */
export const DashboardQuickStats = ({
  totalPostsCount = 0,
  scheduledCount = 0,
  activeChannelsCount = 0,
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
      {/* Box 1: Generated Posts & Portfolio */}
      <Card
        onClick={() => navigate("/posts")}
        className="p-3 min-[380px]:p-3.5 sm:p-4 border-[#2C384E] bg-[#131B2A] space-y-1 sm:space-y-1.5 cursor-pointer hover:border-amber-500/50 hover:shadow-lg transition-all duration-200 active:scale-[0.98] group rounded-2xl min-w-0"
      >
        <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
          <span className="group-hover:text-amber-400 transition-colors truncate">Generated Posts</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="font-heading text-xl min-[380px]:text-2xl font-extrabold text-white truncate">{totalPostsCount}</p>
        <p className="text-[10.5px] min-[380px]:text-[11px] text-amber-400 font-semibold flex items-center gap-1 truncate">
          <span>View Post Portfolio &rarr;</span>
        </p>
      </Card>

      {/* Box 2: Scheduled Queue & Calendar */}
      <Card
        onClick={() => navigate("/calendar")}
        className="p-3 min-[380px]:p-3.5 sm:p-4 border-[#2C384E] bg-[#131B2A] space-y-1 sm:space-y-1.5 cursor-pointer hover:border-teal-500/50 hover:shadow-lg transition-all duration-200 active:scale-[0.98] group rounded-2xl min-w-0"
      >
        <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
          <span className="group-hover:text-teal-400 transition-colors truncate">Scheduled Queue</span>
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="font-heading text-xl min-[380px]:text-2xl font-extrabold text-teal-400 truncate">{scheduledCount}</p>
        <p className="text-[10.5px] min-[380px]:text-[11px] text-teal-400 font-semibold flex items-center gap-1 truncate">
          <span>Manage Content Calendar &rarr;</span>
        </p>
      </Card>

      {/* Box 3: Social Channels Connection */}
      <Card
        onClick={() => navigate("/connections")}
        className="p-3 min-[380px]:p-3.5 sm:p-4 border-[#2C384E] bg-[#131B2A] space-y-1 sm:space-y-1.5 cursor-pointer hover:border-indigo-500/50 hover:shadow-lg transition-all duration-200 active:scale-[0.98] group rounded-2xl min-w-0"
      >
        <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
          <span className="group-hover:text-indigo-400 transition-colors truncate">Social Channels</span>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <Share2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="font-heading text-xl min-[380px]:text-2xl font-extrabold text-white truncate">{activeChannelsCount} Active</p>
        <p className="text-[10.5px] min-[380px]:text-[11px] text-indigo-400 font-semibold flex items-center gap-1 truncate">
          <span>{activeChannelsCount > 0 ? "Manage Channels &rarr;" : "Connect Channels &rarr;"}</span>
        </p>
      </Card>

      {/* Box 4: Master BrandKit Setup */}
      <Card
        onClick={() => navigate("/brandkit")}
        className="p-3 min-[380px]:p-3.5 sm:p-4 border-[#2C384E] bg-[#131B2A] space-y-1 sm:space-y-1.5 cursor-pointer hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 active:scale-[0.98] group rounded-2xl min-w-0"
      >
        <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
          <span className="group-hover:text-emerald-400 transition-colors truncate">Master BrandKit</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="font-heading text-xl min-[380px]:text-2xl font-extrabold text-emerald-400 truncate">Brand Profile</p>
        <p className="text-[10.5px] min-[380px]:text-[11px] text-emerald-400 font-semibold flex items-center gap-1 truncate">
          <span>Manage Brand Assets &rarr;</span>
        </p>
      </Card>
    </div>
  );
};

export default DashboardQuickStats;
