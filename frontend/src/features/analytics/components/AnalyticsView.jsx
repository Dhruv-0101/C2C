import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Award,
  Sparkles,
  RefreshCw,
  Filter,
  Instagram,
  Facebook,
  Share2,
  Heart,
  HelpCircle,
  Layers,
  Calculator,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { AnalyticsKpiCards } from './AnalyticsKpiCards';
import { EngagementChart } from './EngagementChart';
import { PostAnalyticsList } from './PostAnalyticsList';
import { MetricsExplanationModal } from './MetricsExplanationModal';
import { SkeletonKPI } from '@/components/feedback/SkeletonLoader';

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
  posts = [],
  postsMeta = { totalCount: 0, totalItems: 0, page: 1, limit: 9, totalPages: 1 },
  isLoading = false,
  isPostsLoading = false,
  range = '30d',
  onRangeChange,
  platformFilter = 'ALL',
  onPlatformChange,
  searchTerm = '',
  onSearchChange,
  sortBy = 'createdAt',
  onSortChange,
  page = 1,
  onPageChange,
  limit = 9,
  onLimitChange,
  onSync,
  isSyncing = false,
  onSeedDemo,
  isSeeding = false,
}) => {
  // Metrics explanation modal state
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  const formatNumber = (num = 0) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const hasData =
    trends.length > 0 ||
    posts.length > 0 ||
    (kpi.totalImpressions && kpi.totalImpressions > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
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
              <span>Meta Graph API Live Sync</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Real counts for Impressions, Reach, Likes, Comments & Shares directly from Instagram & Facebook.
          </p>
        </div>

        {/* Action Controls Toolbar */}
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
            </select>
          </div>

          {/* Sync Live Data Button */}
          <Button
            variant="outline"
            onClick={onSync}
            isLoading={isSyncing}
            className="py-1 px-3 text-xs font-bold border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-1.5 shrink-0"
            title="Fetch real-time metrics directly from Meta Graph API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Live Data'}</span>
          </Button>

          {/* Metrics Guide Button */}
          <Button
            variant="outline"
            onClick={() => setIsExplanationOpen(true)}
            className="py-1 px-2.5 text-xs font-bold border-[#2C384E] text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-1.5 shrink-0"
            title="How are analytics and engagement rates calculated?"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Metrics Guide</span>
          </Button>

          {/* Seed Demo Button */}
          <Button
            variant="outline"
            onClick={onSeedDemo}
            isLoading={isSeeding}
            className="py-1 px-2.5 text-xs font-bold border-[#2C384E] text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 flex items-center gap-1 shrink-0"
            title="Seed engagement analytics for testing"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Seed</span>
          </Button>
        </div>
      </div>

      {/* Formula & Calculation Consistency Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#131B2A] to-[#0B0F17] border border-amber-500/30 text-xs">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-slate-300 font-semibold">Official Standard Formula:</span>
          <span className="font-mono text-amber-300 font-bold hidden sm:inline">
            Engagement Rate (%) = (Total Interactions ÷ Audience Reach) × 100
          </span>
        </div>

        <button
          onClick={() => setIsExplanationOpen(true)}
          className="text-amber-400 hover:text-amber-300 font-bold text-xs underline underline-offset-2 flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span>Calculation Details</span>
          <ShieldCheck className="w-3.5 h-3.5" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <SkeletonKPI count={4} />
          <div className="rounded-2xl border border-slate-700/50 bg-[#131B2A]/80 p-6 space-y-4">
            <div className="h-5 w-48 rounded skeleton-shimmer" />
            <div className="h-64 w-full rounded-xl skeleton-shimmer" />
          </div>
        </div>
      ) : !hasData ? (
        /* Empty State Card */
        <Card className="p-12 text-center bg-[#131B2A] border-[#2C384E] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-extrabold text-lg text-white">No Analytics Data Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Publish graphics to Instagram or Facebook via Post Studio or click Sync Live Data to fetch real-time engagement.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              onClick={onSync}
              isLoading={isSyncing}
              className="py-2.5 px-5 text-xs font-bold"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Sync Live Meta Data
            </Button>
            <Button
              variant="outline"
              onClick={onSeedDemo}
              isLoading={isSeeding}
              className="py-2.5 px-5 text-xs font-bold border-[#2C384E]"
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-amber-400" />
              Seed Demo Analytics
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* SECTION 1: MASTER KPI CARDS (Aggregated across all published posts) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-bold uppercase tracking-wider text-slate-400">
                Performance Overview ({postsMeta.totalCount || posts.length} Published {postsMeta.totalCount === 1 ? 'Post' : 'Posts'})
              </span>
              <span className="font-mono text-emerald-400">100% Meta Verified</span>
            </div>
            <AnalyticsKpiCards kpi={kpi} />
          </div>

          {/* SECTION 2: CHARTS & VISUAL DISTRIBUTION */}
          <div className="space-y-6">
            {/* Time Series Area Chart: Daily Impressions & Reach Trend */}
            <EngagementChart trends={trends} />

            {/* Two-Column Grid: Platform Breakdown & Top Design Templates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Box: Platform Engagement Split */}
              <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-4">
                <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
                  <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-amber-400" />
                    <span>Social Channel Distribution</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    Total Reach: <strong className="text-white">{formatNumber(kpi.totalReach || 0)}</strong>
                  </span>
                </div>

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
                      {platforms.map((p) => {
                        const totalPlatformReach = platforms.reduce((acc, curr) => acc + (curr.reach || 0), 0);
                        const reachPct = totalPlatformReach > 0 ? Math.round(((p.reach || 0) / totalPlatformReach) * 100) : 0;
                        return (
                          <div key={p.platform} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 font-bold text-slate-200">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: PLATFORM_COLORS[p.platform] || '#4F46E5' }}
                              />
                              <span>{p.platform}</span>
                            </div>
                            <div className="font-mono text-slate-400">
                              <strong className="text-white">{formatNumber(p.reach)}</strong> Reach ({reachPct}%) • {p.postCount} {p.postCount === 1 ? 'post' : 'posts'}
                            </div>
                          </div>
                        );
                      })}
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
          </div>

          {/* SECTION 3: INDIVIDUAL POST INSIGHTS & PERFORMANCE FEED (Full Enterprise Pagination) */}
          <div className="space-y-4 border-t border-[#2C384E] pt-8">
            <PostAnalyticsList
              posts={posts}
              meta={postsMeta}
              isLoading={isPostsLoading}
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              platformFilter={platformFilter}
              onPlatformChange={onPlatformChange}
              sortBy={sortBy}
              onSortChange={onSortChange}
              page={page}
              onPageChange={onPageChange}
              limit={limit}
              onLimitChange={onLimitChange}
            />
          </div>
        </div>
      )}

      {/* Metrics Explanation Glossary & Formula Modal */}
      <MetricsExplanationModal
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
      />
    </div>
  );
};

export default AnalyticsView;
