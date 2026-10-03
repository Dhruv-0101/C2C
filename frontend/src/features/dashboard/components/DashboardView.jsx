import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Plus, Zap, Activity } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { DashboardQuickStats } from "./DashboardQuickStats";
import { DashboardAnalyticsSummary } from "./DashboardAnalyticsSummary";

/**
 * DashboardView
 * Presentational Component rendering admin-style statistics boxes, quick feature access modules,
 * mixed post analytics summary, and interactive navigation shortcuts.
 */
export const DashboardView = ({
  user,
  handleOpenNewPost,
  totalPostsCount = 0,
  scheduledCount = 0,
  activeChannelsCount = 0,
  analyticsKpi = {},
  analyticsPlatforms = [],
  analyticsPosts = [],
  isAnalyticsLoading = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-3 animate-in fade-in duration-300 w-full">
      {/* Welcome Banner */}
      <div className="p-3 sm:p-4 rounded-2xl border border-[#2C384E] bg-gradient-to-r from-[#131B2A] via-[#1a2538] to-[#0B0F17] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
            <Sparkles className="w-3 h-3" />
            <span>Brand Workspace Dashboard</span>
          </div>
          <h1 className="font-heading font-extrabold text-lg sm:text-xl text-white">
            Welcome back, <span className="text-amber-400">{user?.fullName || "Creator"}</span>!
          </h1>
          <p className="text-[11px] text-slate-400 max-w-xl">
            Create & share branded posts instantly across all channels!
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="primary" icon={Plus} size="sm" onClick={() => handleOpenNewPost(null)} className="text-xs py-1.5 px-3">
            New Post
          </Button>
          <Button variant="outline" icon={Zap} size="sm" onClick={() => navigate("/brandkit")} className="text-xs py-1.5 px-3">
            Configure BrandKit
          </Button>
        </div>
      </div>

      {/* Admin-Style Interactive Statistics Header Cards (Boxes) */}
      <div className="space-y-1.5">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>Workspace Performance Metrics</span>
        </h2>

        <DashboardQuickStats
          totalPostsCount={totalPostsCount}
          scheduledCount={scheduledCount}
          activeChannelsCount={activeChannelsCount}
        />

      </div>

      {/* Mixed Social Media Analytics & Live Performance Overview */}
      <DashboardAnalyticsSummary
        kpi={analyticsKpi}
        platforms={analyticsPlatforms}
        posts={analyticsPosts}
        isLoading={isAnalyticsLoading}
      />
    </div>
  );
};
