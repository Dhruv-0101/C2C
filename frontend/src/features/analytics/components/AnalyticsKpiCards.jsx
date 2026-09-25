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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Impressions */}
      <Card className="p-5 bg-[#131B2A] border-[#2C384E] space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
          <span>Total Impressions</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Eye className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-extrabold text-white font-mono">
            {formatNumber(kpi.totalImpressions || 0)}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {kpi.impressionsGrowth >= 0 ? (
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +{kpi.impressionsGrowth}%
              </span>
            ) : (
              <span className="text-rose-400 font-bold flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" /> {kpi.impressionsGrowth}%
              </span>
            )}
            <span className="text-slate-500">vs prior period</span>
          </div>
        </div>
      </Card>

      {/* Card 2: Total Reach */}
      <Card className="p-5 bg-[#131B2A] border-[#2C384E] space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
          <span>Total Audience Reach</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-extrabold text-white font-mono">
            {formatNumber(kpi.totalReach || 0)}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {kpi.reachGrowth >= 0 ? (
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +{kpi.reachGrowth}%
              </span>
            ) : (
              <span className="text-rose-400 font-bold flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" /> {kpi.reachGrowth}%
              </span>
            )}
            <span className="text-slate-500">vs prior period</span>
          </div>
        </div>
      </Card>

      {/* Card 3: Avg Engagement Rate */}
      <Card className="p-5 bg-[#131B2A] border-[#2C384E] space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
          <span>Avg Engagement Rate</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {kpi.avgEngagementRate || 0}%
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {kpi.engagementGrowth >= 0 ? (
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +{kpi.engagementGrowth}%
              </span>
            ) : (
              <span className="text-rose-400 font-bold flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" /> {kpi.engagementGrowth}%
              </span>
            )}
            <span className="text-slate-500">vs prior period</span>
          </div>
        </div>
      </Card>

      {/* Card 4: Total Engagements */}
      <Card className="p-5 bg-[#131B2A] border-[#2C384E] space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
          <span>Total Interactions</span>
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Heart className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-extrabold text-white font-mono">
            {formatNumber((kpi.totalLikes || 0) + (kpi.totalComments || 0) + (kpi.totalShares || 0))}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
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
