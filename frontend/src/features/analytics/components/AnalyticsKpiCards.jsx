import React from 'react';
import { Eye, TrendingUp, TrendingDown, Users, Heart } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

/**
 * AnalyticsKpiCards
 * Reach, impressions & engagement stat cards
 */
export const AnalyticsKpiCards = ({ kpi = {} }) => {
  return (
    <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Card 1: Total Impressions */}
      <Card className="p-3.5 sm:p-5 bg-[#131B2A] border-[#2C384E] space-y-3 relative overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
          <span className="truncate mr-1">Total Impressions</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <Eye className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono truncate">
            {formatNumber(kpi.totalImpressions || 0)}
          </div>
          <div className="flex items-center gap-1.5 text-xs flex-wrap">
            {kpi.impressionsGrowth >= 0 ? (
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +{kpi.impressionsGrowth}%
              </span>
            ) : (
              <span className="text-rose-400 font-bold flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" /> {kpi.impressionsGrowth}%
              </span>
            )}
            <span className="text-slate-500 text-[11px]">vs prior period</span>
          </div>
        </div>
      </Card>

      {/* Card 2: Total Reach */}
      <Card className="p-3.5 sm:p-5 bg-[#131B2A] border-[#2C384E] space-y-3 relative overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
          <span className="truncate mr-1">Total Audience Reach</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono truncate">
            {formatNumber(kpi.totalReach || 0)}
          </div>
          <div className="flex items-center gap-1.5 text-xs flex-wrap">
            {kpi.reachGrowth >= 0 ? (
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +{kpi.reachGrowth}%
              </span>
            ) : (
              <span className="text-rose-400 font-bold flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" /> {kpi.reachGrowth}%
              </span>
            )}
            <span className="text-slate-500 text-[11px]">vs prior period</span>
          </div>
        </div>
      </Card>

      {/* Card 3: Avg Engagement Rate */}
      <Card className="p-3.5 sm:p-5 bg-[#131B2A] border-[#2C384E] space-y-3 relative overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
          <span className="truncate mr-1">Avg Engagement Rate</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono truncate">
            {kpi.avgEngagementRate || 0}%
          </div>
          <div className="flex items-center gap-1.5 text-xs flex-wrap">
            {kpi.engagementGrowth >= 0 ? (
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +{kpi.engagementGrowth}%
              </span>
            ) : (
              <span className="text-rose-400 font-bold flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" /> {kpi.engagementGrowth}%
              </span>
            )}
            <span className="text-slate-500 text-[11px]">vs prior period</span>
          </div>
        </div>
      </Card>

      {/* Card 4: Total Engagements */}
      <Card className="p-3.5 sm:p-5 bg-[#131B2A] border-[#2C384E] space-y-3 relative overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
          <span className="truncate mr-1">Total Interactions</span>
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
            <Heart className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono truncate">
            {formatNumber((kpi.totalLikes || 0) + (kpi.totalComments || 0) + (kpi.totalShares || 0))}
          </div>
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2.5 text-[10px] sm:text-[11px] text-slate-400 font-mono">
            <span>❤️ {formatNumber(kpi.totalLikes || 0)}</span>
            <span>💬 {formatNumber(kpi.totalComments || 0)}</span>
            <span>🔄 {formatNumber(kpi.totalShares || 0)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsKpiCards;
