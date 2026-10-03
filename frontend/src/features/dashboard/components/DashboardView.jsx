import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Plus,
  Zap,
  Activity,
  Shield,
  Wand2,
  Calendar,
  Building2,
  Archive,
  ArrowRight,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
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
            Your BrandKit is active. Create & share branded posts instantly across all channels!
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

      {/* Quick Access Feature Modules Grid */}
      <div className="space-y-1.5 pt-0.5">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Workspace Quick Actions & Modules</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[
            {
              title: "Post Studio",
              desc: "Create and design branded social posts",
              path: "/create-post",
              icon: Wand2,
              color: "text-amber-400",
              borderColor: "hover:border-amber-500/50",
            },
            {
              title: "Festival Content Calendar",
              desc: "View upcoming events, holidays & celebrations",
              path: "/calendar",
              icon: Calendar,
              color: "text-teal-400",
              borderColor: "hover:border-teal-500/50",
            },
            {
              title: "BrandKit Setup",
              desc: "Update business logo, phone number & details",
              path: "/brandkit",
              icon: Building2,
              color: "text-purple-400",
              borderColor: "hover:border-purple-500/50",
            },
            {
              title: "Graphic Vault",
              desc: "Access uploaded images & saved graphics",
              path: "/vault",
              icon: Archive,
              color: "text-emerald-400",
              borderColor: "hover:border-emerald-500/50",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card
                key={idx}
                onClick={() => navigate(item.path)}
                className={`p-3 bg-[#131B2A] border-[#2C384E] cursor-pointer transition-all duration-200 group ${item.borderColor} hover:shadow-lg`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-1.5 rounded-lg bg-[#0B0F17] border border-[#2C384E] ${item.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-bold text-xs text-white group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  {item.desc}
                </p>
              </Card>
            );
          })}
        </div>
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
