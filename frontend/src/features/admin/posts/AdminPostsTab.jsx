import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  FolderKanban,
  Maximize2,
  Calendar,
  Image,
  Filter,
  X,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  BarChart3,
  ChevronDown,
  ChevronUp,
  List,
  LayoutGrid,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { SearchBar } from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { AdminPostCard } from "./components/AdminPostCard";

/**
 * AdminPostsTab Component
 * Comprehensive audit & tracking interface for generated posts.
 * Allows Admins & SubAdmins to track posts across:
 * - Business Category (Industry Niche)
 * - Frame Overlay applied
 * - Template & Template Category utilized
 * - Festival targeted
 * - Creator details (User Name, Email, Avatar)
 * - Aggregated volume distribution analytics ("Kitni bani hai")
 */
export const AdminPostsTab = ({
  posts = [],
  postMeta,
  isLoadingPosts,
  postsFetchError,
  postPage,
  setPostPage,
  setPostLimit,
  // Filters
  categoryFilter,
  setCategoryFilter,
  frameFilter,
  setFrameFilter,
  templateCategoryFilter,
  setTemplateCategoryFilter,
  festivalFilter,
  setFestivalFilter,
  statusFilter,
  setStatusFilter,
  postSearch,
  setPostSearch,
  // Metadata options for filter dropdowns
  categoriesList = [],
  framesList = [],
  templateCategoriesList = [],
  festivalsList = [],
  // Analytics
  analytics,
  isLoadingAnalytics,
}) => {
  const [selectedPostForLightbox, setSelectedPostForLightbox] = useState(null);
  const [showAnalyticsBreakdown, setShowAnalyticsBreakdown] = useState(false);
  const [postViewMode, setPostViewMode] = useState("table");

  const hasActiveFilters = Boolean(
    categoryFilter ||
    frameFilter ||
    templateCategoryFilter ||
    festivalFilter ||
    statusFilter ||
    postSearch
  );

  const handleClearFilters = () => {
    setCategoryFilter("");
    setFrameFilter("");
    setTemplateCategoryFilter("");
    setFestivalFilter("");
    setStatusFilter("");
    setPostSearch("");
    setPostPage(1);
  };

  const topCategory = analytics?.byCategory?.[0];
  const topFrame = analytics?.byFrame?.find((f) => f.frameId !== "no_frame") || analytics?.byFrame?.[0];
  const topTemplate = analytics?.byTemplate?.[0];
  const topFestival = analytics?.byFestival?.find((f) => f.festivalId !== "no_festival") || analytics?.byFestival?.[0];

  return (
    <div className="animate-in fade-in duration-200 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Generated Posts Audit & Tracking</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Track which business category, frame, template, and festival each post was created for, and audit creator activity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-[#131B2A] border border-[#2C384E]">
            <button
              type="button"
              onClick={() => setPostViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                postViewMode === "table"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPostViewMode("cards")}
              className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                postViewMode === "cards"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAnalyticsBreakdown((prev) => !prev)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#131B2A] hover:bg-[#1C2638] text-slate-300 hover:text-white border border-[#2C384E] text-xs font-semibold transition cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Volume Breakdown</span>
            {showAnalyticsBreakdown ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Top Aggregation KPI Stat Cards ("Kitni bani hai") */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Posts */}
        <div className="bg-[#131B2A] border border-[#2C384E] p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Posts Created</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {isLoadingAnalytics ? "..." : (analytics?.totalPosts ?? 0)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Platform wide volume</div>
        </div>

        {/* Top Business Category */}
        <div className="bg-[#131B2A] border border-[#2C384E] p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Top Industry Niche</span>
            <FolderKanban className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-sm font-bold text-white mt-2 truncate" title={topCategory?.name || "N/A"}>
            {isLoadingAnalytics ? "..." : (topCategory?.name || "N/A")}
          </div>
          <div className="text-[11px] text-indigo-400 mt-1">
            {topCategory ? `${topCategory.count} posts (${topCategory.percentage}%)` : "No data"}
          </div>
        </div>

        {/* Top Frame Overlay */}
        <div className="bg-[#131B2A] border border-[#2C384E] p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Top Brand Frame</span>
            <Maximize2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-white mt-2 truncate" title={topFrame?.title || "N/A"}>
            {isLoadingAnalytics ? "..." : (topFrame?.title || "None")}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            {topFrame ? `${topFrame.count} posts (${topFrame.percentage}%)` : "No data"}
          </div>
        </div>

        {/* Top Festival */}
        <div className="bg-[#131B2A] border border-[#2C384E] p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Top Festival Event</span>
            <Calendar className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-sm font-bold text-white mt-2 truncate" title={topFestival?.name || "N/A"}>
            {isLoadingAnalytics ? "..." : (topFestival?.name || "General")}
          </div>
          <div className="text-[11px] text-rose-400 mt-1">
            {topFestival ? `${topFestival.count} posts (${topFestival.percentage}%)` : "No data"}
          </div>
        </div>
      </div>

      {/* Collapsible Detailed Volume Breakdown Panel */}
      {showAnalyticsBreakdown && (
        <div className="p-5 rounded-2xl bg-[#0D131F] border border-[#2C384E] animate-in fade-in slide-in-from-top-2 duration-200 space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-white">Aggregated Volume Breakdowns</span>
            </div>
            <span className="text-xs text-slate-400">Total: {analytics?.totalPosts || 0} posts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* By Business Category */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                <span>By Business Category</span>
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(analytics?.byCategory || []).map((cat) => (
                  <div key={cat.categoryId} className="text-xs space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span className="truncate max-w-[180px]" title={cat.name}>{cat.name}</span>
                      <span className="font-mono text-slate-400">{cat.count} ({cat.percentage}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1A2333] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(4, cat.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Frame Overlay */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>By Frame Overlay</span>
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(analytics?.byFrame || []).map((frame) => (
                  <div key={frame.frameId} className="text-xs space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span className="truncate max-w-[180px]" title={frame.title}>{frame.title}</span>
                      <span className="font-mono text-slate-400">{frame.count} ({frame.percentage}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1A2333] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(4, frame.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Template Category */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5 text-amber-400" />
                <span>By Template Category</span>
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(analytics?.byTemplateCategory || []).map((tc) => (
                  <div key={tc.id} className="text-xs space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span className="truncate max-w-[180px]" title={tc.name}>{tc.name}</span>
                      <span className="font-mono text-slate-400">{tc.count} ({tc.percentage}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1A2333] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(4, tc.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Dimensional Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#131B2A] border border-[#2C384E] space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Filter Posts:</span>
          </div>

          <SearchBar
            value={postSearch}
            onChange={(val) => {
              const query = typeof val === "string" ? val : (val?.target?.value ?? "");
              setPostSearch(query);
              setPostPage(1);
            }}
            placeholder="Search by user name, email, or occasion..."
            className="w-full lg:max-w-xs"
          />
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
          {/* Business Category Filter */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 block mb-1">Business Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPostPage(1);
              }}
              className="w-full bg-[#0B0F17] border border-[#2C384E] text-white text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Frame Filter */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 block mb-1">Brand Frame</label>
            <select
              value={frameFilter}
              onChange={(e) => {
                setFrameFilter(e.target.value);
                setPostPage(1);
              }}
              className="w-full bg-[#0B0F17] border border-[#2C384E] text-white text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Frames</option>
              {framesList.map((frame) => (
                <option key={frame.id} value={frame.id}>
                  {frame.title}
                </option>
              ))}
            </select>
          </div>

          {/* Template Category Filter */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 block mb-1">Template Category</label>
            <select
              value={templateCategoryFilter}
              onChange={(e) => {
                setTemplateCategoryFilter(e.target.value);
                setPostPage(1);
              }}
              className="w-full bg-[#0B0F17] border border-[#2C384E] text-white text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Visual Themes</option>
              {templateCategoriesList.map((tc) => (
                <option key={tc.id} value={tc.id}>
                  {tc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Festival Filter */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 block mb-1">Festival Event</label>
            <select
              value={festivalFilter}
              onChange={(e) => {
                setFestivalFilter(e.target.value);
                setPostPage(1);
              }}
              className="w-full bg-[#0B0F17] border border-[#2C384E] text-white text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Festivals</option>
              {festivalsList.map((fest) => (
                <option key={fest.id} value={fest.id}>
                  {fest.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 block mb-1">Post Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPostPage(1);
              }}
              className="w-full bg-[#0B0F17] border border-[#2C384E] text-white text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="DRAFT">DRAFT</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Indicator */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-[#1E293B]">
            <span className="text-xs text-amber-400 font-medium">
              Filtered results active
            </span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Error State */}
      {postsFetchError && (
        <Alert variant="error" message={postsFetchError.message || "Failed to load posts audit trail."} />
      )}

      {/* Posts Audit Feed Table / Cards */}
      {isLoadingPosts ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-[#131B2A] border border-[#2C384E] rounded-2xl">
          Loading generated posts directory...
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#2C384E] bg-[#131B2A] rounded-2xl space-y-3">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-semibold text-sm">
            No generated posts match the selected criteria.
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="mt-2 text-xs"
            >
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {postViewMode === "cards" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {posts.map((post) => (
                <AdminPostCard
                  key={post.id}
                  post={post}
                  onPreview={() => setSelectedPostForLightbox(post)}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#2C384E] bg-[#131B2A]">
              <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0B0F17] text-slate-400 uppercase font-semibold text-[11px] border-b border-[#2C384E]">
                <tr>
                  <th className="py-3 px-4">Post Artwork</th>
                  <th className="py-3 px-4">Creator User</th>
                  <th className="py-3 px-4">Business Category</th>
                  <th className="py-3 px-4">Frame Overlay</th>
                  <th className="py-3 px-4">Template & Theme</th>
                  <th className="py-3 px-4">Festival</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C384E]/50">
                {posts.map((post) => {
                  const creator = post.user;
                  const categoryName = post.category?.name || "General Business";
                  const frameTitle = post.frame?.title || "No Frame";
                  const templateTitle = post.template?.title || "Custom Graphic";
                  const templateCategoryName = post.template?.templateCategory?.name || "General";
                  const festivalName = post.festival?.name || "-";
                  const graphicUrl = post.finalGraphicUrl || post.customImageUrl || post.template?.baseImageUrl;

                  return (
                    <tr key={post.id} className="hover:bg-[#1A2333]/50 transition">
                      {/* Image Thumbnail */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => setSelectedPostForLightbox(post)}
                          className="w-12 h-12 rounded-xl overflow-hidden bg-[#0B0F17] border border-[#2C384E] relative group cursor-pointer shrink-0 shadow-md"
                        >
                          {graphicUrl ? (
                            <img
                              src={graphicUrl}
                              alt={post.occasionName || "Post preview"}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <Image className="w-5 h-5" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </td>

                      {/* Creator Details (User) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0 overflow-hidden">
                            {creator?.avatarUrl ? (
                              <img src={creator.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              creator?.fullName?.[0]?.toUpperCase() || "U"
                            )}
                          </div>
                          <div className="truncate max-w-[140px]">
                            <div className="font-semibold text-white truncate" title={creator?.fullName || "User"}>
                              {creator?.fullName || "Anonymous User"}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate" title={creator?.email}>
                              {creator?.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Business Category */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-medium whitespace-nowrap">
                          <FolderKanban className="w-3 h-3 text-indigo-400" />
                          <span>{categoryName}</span>
                        </span>
                      </td>

                      {/* Frame Overlay */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap border ${
                            post.frameId
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                              : "bg-slate-800/40 text-slate-400 border-slate-700/40"
                          }`}
                        >
                          <Maximize2 className="w-3 h-3 text-emerald-400" />
                          <span className="truncate max-w-[120px]" title={frameTitle}>{frameTitle}</span>
                        </span>
                      </td>

                      {/* Template & Template Category */}
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-white truncate max-w-[150px]" title={templateTitle}>
                            {templateTitle}
                          </div>
                          <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                            <span>Theme: {templateCategoryName}</span>
                          </div>
                        </div>
                      </td>

                      {/* Festival */}
                      <td className="py-3 px-4">
                        {post.festivalId ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-medium">
                            <Calendar className="w-3 h-3 text-rose-400" />
                            <span className="truncate max-w-[100px]" title={festivalName}>{festivalName}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                            post.status === "PUBLISHED"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : post.status === "SCHEDULED"
                              ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                              : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {post.status === "PUBLISHED" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : post.status === "SCHEDULED" ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          <span>{post.status}</span>
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }) : "-"}
                      </td>

                      {/* Preview Button */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedPostForLightbox(post)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="View High-Res Graphic"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}

          {/* Centralized Pagination */}
          <Pagination
            meta={postMeta}
            currentPage={postPage}
            totalPages={postMeta?.totalPages || 1}
            onPageChange={(p) => setPostPage(p)}
            onLimitChange={(l) => {
              if (setPostLimit) setPostLimit(l);
              setPostPage(1);
            }}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      )}

      {/* Lightbox Modal for Post Preview */}
      {selectedPostForLightbox && (
        <ImageLightbox
          isOpen={Boolean(selectedPostForLightbox)}
          item={{
            ...selectedPostForLightbox,
            title: selectedPostForLightbox.occasionName || selectedPostForLightbox.template?.title || "User Generated Post",
            category: `Category: ${selectedPostForLightbox.category?.name || "General"} | Frame: ${selectedPostForLightbox.frame?.title || "None"}`,
          }}
          imageUrl={selectedPostForLightbox.finalGraphicUrl || selectedPostForLightbox.customImageUrl}
          onClose={() => setSelectedPostForLightbox(null)}
        />
      )}
    </div>
  );
};

export default AdminPostsTab;
