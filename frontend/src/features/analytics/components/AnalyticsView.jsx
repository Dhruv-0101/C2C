import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Award,
  Sparkles,
  RefreshCw,
  Calendar,
  Filter,
  Instagram,
  Facebook,
  Linkedin,
  BarChart3,
  Share2,
  Heart,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { AnalyticsKpiCards } from './AnalyticsKpiCards';
import { EngagementChart } from './EngagementChart';

// Platform Color Palette
const PLATFORM_COLORS = {
  INSTAGRAM: '#E1306C',
  FACEBOOK: '#1877F2',
  LINKEDIN: '#0A66C2',
};

const CHART_COLORS = ['#4F46E5', '#F59E0B', '#10B981', '#EC4899'];

/**
 * Custom Dark Glassmorphism Tooltip for Recharts
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B0F17]/95 border border-[#2C384E] p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1">
        <p className="font-bold text-white border-b border-[#2C384E] pb-1 font-mono">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 font-mono">
            <span style={{ color: entry.color }} className="font-semibold">
              {entry.name}:
            </span>
            <span className="font-extrabold text-white">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsView = ({
  kpi = {},
  trends = [],
  platforms = [],
  topTemplates = [],
  isLoading = false,
  range = '30d',
  onRangeChange,
  platformFilter = 'ALL',
  onPlatformChange,
  onSeedDemo,
  isSeeding = false,
}) => {
  const formatNumber = (num = 0) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const hasData = trends.length > 0 || (kpi.totalImpressions && kpi.totalImpressions > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header & Filter Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#131B2A] via-[#1A2538] to-[#0B0F17] p-4 sm:p-5 rounded-2xl border border-[#2C384E] shadow-xl">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-heading font-extrabold text-xl text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Analytics & Insights</span>
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Meta & LinkedIn Graph API Live Sync</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Real-time engagement metrics, reach growth & insights fetched directly from Meta Graph API & LinkedIn API.
          </p>
        </div>

        {/* Action Controls - Single Row Alignment */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Range Selector */}
          <div className="flex items-center bg-[#0B0F17] rounded-xl border border-[#2C384E] p-1 shrink-0">
            {['7d', '30d', '90d'].map((r) => (
              <button
                key={r}
                onClick={() => onRangeChange?.(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                  range === r
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Platform Filter */}
          <div className="flex items-center bg-[#0B0F17] rounded-xl border border-[#2C384E] px-2.5 py-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
            <select
              value={platformFilter}
              onChange={(e) => onPlatformChange?.(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#131B2A]">All Platforms</option>
              <option value="INSTAGRAM" className="bg-[#131B2A]">Instagram</option>
              <option value="FACEBOOK" className="bg-[#131B2A]">Facebook</option>
              <option value="LINKEDIN" className="bg-[#131B2A]">LinkedIn</option>
            </select>
          </div>

          {/* Seed Demo Button */}
          <Button
            variant="outline"
            onClick={onSeedDemo}
            isLoading={isSeeding}
            className="py-1 px-2.5 text-xs font-bold border-[#2C384E] text-amber-400 hover:bg-amber-500/10 flex items-center gap-1 shrink-0"
            title="Seed engagement analytics for testing"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Seed Analytics</span>
          </Button>
        </div>
      </div>

      {!hasData && !isLoading ? (
        /* Empty State Card */
        <Card className="p-12 text-center bg-[#131B2A] border-[#2C384E] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-extrabold text-lg text-white">No Analytics Data Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Publish graphics to your social accounts or seed demo data to generate real-time metrics and charts.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={onSeedDemo}
            isLoading={isSeeding}
            className="py-2.5 px-5 text-xs font-bold"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Seed Demo Analytics Metrics
          </Button>
        </Card>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <AnalyticsKpiCards kpi={kpi} />

          {/* Time Series Area Chart: Daily Impressions & Reach Trend */}
          <EngagementChart trends={trends} />


          {/* Two-Column Grid: Platform Breakdown & Top Design Templates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Box: Platform Engagement Split */}
            <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-4">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2 border-b border-[#2C384E] pb-3">
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>Social Channel Distribution</span>
              </h3>

              {platforms.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 italic">
                  No platform breakdown available.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={platforms}
                          dataKey="reach"
                          nameKey="platform"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
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

                  {/* Legend Table */}
                  <div className="space-y-2 pt-2 border-t border-[#2C384E]">
                    {platforms.map((p) => (
                      <div key={p.platform} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-slate-200">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: PLATFORM_COLORS[p.platform] || '#4F46E5' }}
                          />
                          <span>{p.platform}</span>
                        </div>
                        <div className="font-mono text-slate-400">
                          <strong>{formatNumber(p.reach)}</strong> Reach ({p.postCount} posts)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Right Box: Top Performing Design Templates */}
            <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-4">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2 border-b border-[#2C384E] pb-3">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Top Performing Design Templates</span>
              </h3>

              {topTemplates.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 italic">
                  No template analytics available.
                </div>
              ) : (
                <div className="space-y-3">
                  {topTemplates.map((t, idx) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] flex items-center justify-between gap-3 hover:border-amber-500/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 font-extrabold text-xs flex items-center justify-center border border-amber-500/20 shrink-0">
                          #{idx + 1}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-xs text-white line-clamp-1">{t.title}</h4>
                          <span className="text-[10px] font-bold text-amber-400/90 uppercase px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                            {t.category}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-extrabold text-emerald-400 font-mono">
                          {t.avgEngagementRate}% Rate
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {formatNumber(t.totalImpressions)} Impr
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
