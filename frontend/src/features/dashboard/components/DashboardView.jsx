import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Calendar,
  Share2,
  TrendingUp,
  Plus,
  CheckCircle,
  Zap,
  Building2,
  Layers,
  Palette,
  FolderKanban,
  ArrowRight,
  Shield,
  Activity,
  Archive,
  Wand2,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { FestivalCalendarContainer } from "../../../features/calendar/containers/FestivalCalendarContainer";

/**
 * DashboardView
 * Presentational Component rendering admin-style statistics boxes, quick feature access modules,
 * interactive content calendar, and recent AI campaigns audit list.
 */
export const DashboardView = ({
  user,
  handleOpenNewPost,
  totalPostsCount = 0,
  scheduledCount = 0,
  activeChannelsCount = 3,
  recentPosts = [],
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[#2C384E] bg-gradient-to-r from-[#131B2A] via-[#1a2538] to-[#0B0F17] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Brand Workspace Dashboard</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Welcome back, <span className="text-amber-400">{user?.fullName || "Creator"}</span>!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Your BrandKit is active and ready. Easily create, design, and share branded posts across your social media channels!
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="primary" icon={Plus} onClick={() => handleOpenNewPost(null)}>
            New Post
          </Button>
          <Button variant="outline" icon={Zap} onClick={() => navigate("/brandkit")}>
            Configure BrandKit
          </Button>
        </div>
      </div>

      {/* Admin-Style Interactive Statistics Header Cards (Boxes) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span>Workspace Performance Metrics</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Box 1: Generated Posts & Portfolio */}
          <Card
            onClick={() => navigate("/your-posts")}
            className="p-5 border-[#2C384E] bg-[#131B2A] space-y-2 cursor-pointer hover:border-amber-500/50 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span className="group-hover:text-amber-400 transition-colors">Generated Posts</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="font-heading text-3xl font-extrabold text-white">{totalPostsCount}</p>
            <p className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
              <span>View Post Portfolio &rarr;</span>
            </p>
          </Card>

          {/* Box 2: Scheduled Queue & Calendar */}
          <Card
            onClick={() => navigate("/calendar")}
            className="p-5 border-[#2C384E] bg-[#131B2A] space-y-2 cursor-pointer hover:border-teal-500/50 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span className="group-hover:text-teal-400 transition-colors">Scheduled Queue</span>
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="font-heading text-3xl font-extrabold text-teal-400">{scheduledCount}</p>
            <p className="text-[11px] text-teal-400 font-medium">
              <span>Manage Content Calendar &rarr;</span>
            </p>
          </Card>

          {/* Box 3: Social Channels Connection */}
          <Card
            onClick={() => navigate("/connections")}
            className="p-5 border-[#2C384E] bg-[#131B2A] space-y-2 cursor-pointer hover:border-indigo-500/50 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span className="group-hover:text-indigo-400 transition-colors">Social Channels</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Share2 className="w-4 h-4" />
              </div>
            </div>
            <p className="font-heading text-3xl font-extrabold text-white">{activeChannelsCount} Active</p>
            <p className="text-[11px] text-indigo-400 font-medium">
              <span>Instagram, FB, LinkedIn &rarr;</span>
            </p>
          </Card>

          {/* Box 4: Master BrandKit Setup */}
          <Card
            onClick={() => navigate("/brandkit")}
            className="p-5 border-[#2C384E] bg-[#131B2A] space-y-2 cursor-pointer hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span className="group-hover:text-emerald-400 transition-colors">Master BrandKit</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="font-heading text-2xl font-extrabold text-emerald-400">Brand Profile</p>
            <p className="text-[11px] text-emerald-400 font-medium">
              <span>Manage Brand Assets &rarr;</span>
            </p>
          </Card>
        </div>
      </div>

      {/* Quick Access Feature Modules Grid */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Workspace Quick Actions & Modules</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                className={`p-5 bg-[#131B2A] border-[#2C384E] cursor-pointer transition-all duration-200 group ${item.borderColor} hover:shadow-lg`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {item.desc}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Posts Activity */}
      <Card className="border-[#2C384E] bg-[#131B2A] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg text-white">Recent Posts & Graphics</h3>
          <Button variant="primary" icon={Plus} className="text-xs" onClick={() => handleOpenNewPost(null)}>
            Create New Post
          </Button>
        </div>

        {recentPosts.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No recent graphics yet. Click "Create New Post" to start!
          </p>
        ) : (
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {post.finalGraphicUrl && (
                    <img
                      src={post.finalGraphicUrl}
                      alt="Graphic Thumbnail"
                      className="w-10 h-10 rounded-lg object-cover border border-[#2C384E]"
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      {post.occasionName || post.customText || "Branded Graphic Post"}
                    </p>
                    <p className="text-xs text-slate-400">
                      Created {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    post.status === "PUBLISHED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
