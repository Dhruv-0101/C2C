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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* Box 1: Generated Posts & Portfolio */}
      <Card
        onClick={() => navigate("/your-posts")}
        className="p-3 border-[#2C384E] bg-[#131B2A] space-y-1 cursor-pointer hover:border-amber-500/50 hover:shadow-lg transition-all duration-200 group"
      >
        <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
          <span className="group-hover:text-amber-400 transition-colors">Generated Posts</span>
          <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="font-heading text-xl font-extrabold text-white">{totalPostsCount}</p>
        <p className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
          <span>View Post Portfolio &rarr;</span>
        </p>
      </Card>

      {/* Box 2: Scheduled Queue & Calendar */}
      <Card
        onClick={() => navigate("/calendar")}
        className="p-3 border-[#2C384E] bg-[#131B2A] space-y-1 cursor-pointer hover:border-teal-500/50 hover:shadow-lg transition-all duration-200 group"
      >
        <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
          <span className="group-hover:text-teal-400 transition-colors">Scheduled Queue</span>
          <div className="p-1 rounded-lg bg-teal-500/10 text-teal-400">
            <Calendar className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="font-heading text-xl font-extrabold text-teal-400">{scheduledCount}</p>
        <p className="text-[10px] text-teal-400 font-medium">
          <span>Manage Content Calendar &rarr;</span>
        </p>
      </Card>

      {/* Box 3: Social Channels Connection */}
      <Card
        onClick={() => navigate("/social")}
        className="p-3 border-[#2C384E] bg-[#131B2A] space-y-1 cursor-pointer hover:border-indigo-500/50 hover:shadow-lg transition-all duration-200 group"
      >
        <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
          <span className="group-hover:text-indigo-400 transition-colors">Social Channels</span>
          <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Share2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="font-heading text-xl font-extrabold text-white">{activeChannelsCount} Active</p>
        <p className="text-[10px] text-indigo-400 font-medium">
          <span>{activeChannelsCount > 0 ? "Manage Channels &rarr;" : "Connect Social Channels &rarr;"}</span>
        </p>
      </Card>

      {/* Box 4: Master BrandKit Setup */}
      <Card
        onClick={() => navigate("/brandkit")}
        className="p-3 border-[#2C384E] bg-[#131B2A] space-y-1 cursor-pointer hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 group"
      >
        <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
          <span className="group-hover:text-emerald-400 transition-colors">Master BrandKit</span>
          <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Building2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="font-heading text-lg font-extrabold text-emerald-400">Brand Profile</p>
        <p className="text-[10px] text-emerald-400 font-medium">
          <span>Manage Brand Assets &rarr;</span>
        </p>
      </Card>
    </div>
  );
};

export default DashboardQuickStats;
