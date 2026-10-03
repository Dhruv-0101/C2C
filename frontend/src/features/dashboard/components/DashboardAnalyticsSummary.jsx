import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  Heart,
  Share2,
  Sparkles,
  ArrowRight,
  Calendar,
  Layers,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

const PLATFORM_COLORS = {
  INSTAGRAM: '#E1306C',
  FACEBOOK: '#1877F2',
  LINKEDIN: '#0A66C2',
};

const CHART_COLORS = ['#E1306C', '#1877F2', '#4F46E5', '#F59E0B'];

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#0B0F17]/95 border border-[#2C384E] p-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1 font-mono">
        <p className="font-bold text-white flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.fill || data.color }} />
          <span>{data.name}</span>
        </p>
        <p className="text-slate-300">
          Reach: <strong className="text-white">{data.value.toLocaleString()}</strong>
        </p>
      </div>
    );
  }
  return null;
};

/**
 * DashboardAnalyticsSummary
 * Mixed social media performance section rendered on the primary user dashboard.
 * Aggregates overall reach, impressions, engagement rates, social channel distribution,
 * and high-performing published post previews.
 */
export const DashboardAnalyticsSummary = ({
  kpi = {},
  platforms = [],
  posts = [],
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const totalInteractions = (kpi.totalLikes || 0) + (kpi.totalComments || 0) + (kpi.totalShares || 0);
  const totalPlatformReach = platforms.reduce((acc, curr) => acc + (curr.reach || 0), 0);

  const hasData =
    (kpi.totalReach && kpi.totalReach > 0) ||
    (kpi.totalImpressions && kpi.totalImpressions > 0) ||
    posts.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-3 pt-2">
        <div className="h-5 w-56 rounded skeleton-shimmer" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-[#131B2A] border border-[#2C384E] skeleton-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Social Performance & Audience Reach</span>
          </h2>
        </div>

        <Card className="p-6 bg-[#131B2A] border-[#2C384E] text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-sm text-white">No Live Performance Data Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Publish branded graphics to your connected Instagram or Facebook accounts to start seeing real-time audience reach and engagement metrics here.
            </p>
          </div>
          <div className="pt-1">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/create-post')}
              className="text-xs font-bold py-1.5 px-4"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Create & Publish First Post
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-1">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2C384E] pb-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Mixed Social Performance & Audience Reach</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider hidden sm:inline-flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Meta Verified
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Real aggregated reach, impressions and engagement measured across your published posts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/analytics')}
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition self-start sm:self-auto cursor-pointer"
        >
          <span>View Deep Analytics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Master KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Card 1: Total Reach */}
        <Card className="p-3 bg-[#131B2A] border-[#2C384E] space-y-1 relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
            <span>Total Reach</span>
            <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Users className="w-3 h-3" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            {formatNumber(kpi.totalReach || 0)}
          </div>
          <div className="text-[10px] text-amber-400/90 font-mono">
            Unique accounts reached
          </div>
        </Card>

        {/* Card 2: Total Impressions */}
        <Card className="p-3 bg-[#131B2A] border-[#2C384E] space-y-1 relative overflow-hidden group hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
            <span>Impressions</span>
            <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Eye className="w-3 h-3" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            {formatNumber(kpi.totalImpressions || 0)}
          </div>
          <div className="text-[10px] text-indigo-400/90 font-mono">
            Total content views
          </div>
        </Card>

        {/* Card 3: Avg Engagement Rate */}
        <Card className="p-3 bg-[#131B2A] border-[#2C384E] space-y-1 relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
            <span>Engagement Rate</span>
            <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-3 h-3" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono">
            {kpi.avgEngagementRate || 0}%
          </div>
          <div className="text-[10px] text-emerald-400/80 font-mono">
            (Interactions ÷ Reach) × 100
          </div>
        </Card>

        {/* Card 4: Total Engagements */}
        <Card className="p-3 bg-[#131B2A] border-[#2C384E] space-y-1 relative overflow-hidden group hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
            <span>Interactions</span>
            <div className="p-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Heart className="w-3 h-3" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-rose-400 font-mono">
            {formatNumber(totalInteractions)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono truncate">
            {formatNumber(kpi.totalLikes || 0)} Likes • {formatNumber(kpi.totalComments || 0)} Comments • {formatNumber(kpi.totalShares || 0)} Shares
          </div>
        </Card>
      </div>

      {/* 2-Column Analytics Module: Donut Distribution & Recent Live Posts Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: Social Channel Distribution (Donut Chart) */}
        <Card className="p-4 bg-[#131B2A] border-[#2C384E] lg:col-span-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-[#2C384E] pb-2">
            <h3 className="font-heading font-bold text-xs text-white flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Channel Distribution</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Total Reach: <strong className="text-white">{formatNumber(kpi.totalReach || 0)}</strong>
            </span>
          </div>

          {platforms.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 italic">
              No platform breakdown available yet.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platforms}
                      dataKey="reach"
                      nameKey="platform"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={4}
                    >
                      {platforms.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PLATFORM_COLORS[entry.platform] || CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 pt-1 border-t border-[#2C384E]">
                {platforms.map((p) => {
                  const pct = totalPlatformReach > 0 ? Math.round(((p.reach || 0) / totalPlatformReach) * 100) : 0;
                  return (
                    <div key={p.platform} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-200">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: PLATFORM_COLORS[p.platform] || '#4F46E5' }}
                        />
                        <span className="text-[11px]">{p.platform}</span>
                      </div>
                      <div className="font-mono text-slate-400 text-[11px]">
                        <strong className="text-white">{formatNumber(p.reach)}</strong> Reach ({pct}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Right: Live Published Graphics Performance Showcase */}
        <Card className="p-4 bg-[#131B2A] border-[#2C384E] lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between border-b border-[#2C384E] pb-2">
            <h3 className="font-heading font-bold text-xs text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Published Graphics Live Performance</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Showing top {posts.slice(0, 2).length} posts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {posts.slice(0, 2).map((post) => {
              const { title, graphicUrl, publishedAt, createdAt, metrics = {}, platformBreakdown = [] } = post;
              const formattedDate = new Date(publishedAt || createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={post.id}
                  className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] hover:border-amber-500/40 transition flex flex-col justify-between space-y-2 group"
                >
                  <div className="flex items-start gap-2.5">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-black/40 border border-[#2C384E] overflow-hidden shrink-0">
                      {graphicUrl ? (
                        <img
                          src={graphicUrl}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-[9px] text-slate-600 font-mono flex items-center justify-center h-full">
                          Post
                        </span>
                      )}
                    </div>

                    {/* Title & Date */}
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" /> {formattedDate}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-bold">
                          {metrics.engagementRate || 0}% Rate
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-white truncate group-hover:text-amber-400 transition">
                        {title}
                      </h4>
                    </div>
                  </div>

                  {/* Micro Metrics Strip */}
                  <div className="grid grid-cols-3 gap-1 p-1.5 rounded-lg bg-[#131B2A] border border-[#2C384E] text-center font-mono text-[10px]">
                    <div>
                      <span className="text-slate-400 block text-[9px]">REACH</span>
                      <strong className="text-white block">{formatNumber(metrics.reach || 0)}</strong>
                      {platformBreakdown.length > 1 && (
                        <span className="text-[8px] text-amber-400/90 block truncate">
                          {platformBreakdown.map((p) => `${p.platform === 'INSTAGRAM' ? 'IG' : 'FB'}: ${p.reach}`).join(' • ')}
                        </span>
                      )}
                    </div>

                    <div className="border-x border-[#2C384E]">
                      <span className="text-slate-400 block text-[9px]">IMPR</span>
                      <strong className="text-white block">{formatNumber(metrics.impressions || 0)}</strong>
                      {platformBreakdown.length > 1 && (
                        <span className="text-[8px] text-slate-400 block truncate">
                          {platformBreakdown.map((p) => `${p.platform === 'INSTAGRAM' ? 'IG' : 'FB'}: ${p.impressions}`).join(' • ')}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[9px]">LIKES</span>
                      <strong className="text-rose-400 block">{formatNumber(metrics.likes || 0)}</strong>
                      {platformBreakdown.length > 1 && (
                        <span className="text-[8px] text-slate-400 block truncate">
                          {platformBreakdown.map((p) => `${p.platform === 'INSTAGRAM' ? 'IG' : 'FB'}: ${p.likes}`).join(' • ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Deep Insights Trigger -> Navigates to Analytics Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/analytics')}
                    className="w-full text-[10px] font-bold py-1 border-[#2C384E] hover:border-amber-500/40 hover:bg-amber-500/10 flex items-center justify-center gap-1"
                  >
                    <BarChart3 className="w-3 h-3 text-amber-400" />
                    <span>View Post Deep Insights</span>
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardAnalyticsSummary;
