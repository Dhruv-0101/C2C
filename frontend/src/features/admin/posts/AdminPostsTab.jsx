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
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { SearchBar } from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { FilterSearchablePicker } from "./components/FilterSearchablePicker";

/**
 * AdminPostsTab Component
 * Comprehensive audit & tracking interface for generated posts.
 * Allows Admins & SubAdmins to track posts across:
 * - Business Category (Industry Niche) with real-time search & pagination
 * - Frame Overlay applied with search & pagination
 * - Template & Template Category utilized with search & pagination
 * - Festival targeted with search & pagination
 * - Creator details (User Name, Email, Avatar)
 * - Platform KPI volume stats
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
  // Metadata options for scalable search & pagination pickers
  categoriesList = [],
  framesList = [],
  templateCategoriesList = [],
  festivalsList = [],
  // Analytics
  analytics,
  isLoadingAnalytics,
}) => {
  const [selectedPostForLightbox, setSelectedPostForLightbox] = useState(null);

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
  const topFestival = analytics?.byFestival?.find((f) => f.festivalId !== "no_festival") || analytics?.byFestival?.[0];

  return (
    <div className="animate-in fade-in duration-200 space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2C384E] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Generated Posts Audit & Tracking</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track which business category, frame, template, and festival each post was created for, and audit creator activity.
            </p>
          </div>
        </div>
      </div>

      {/* Top Aggregation KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Posts */}
        <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#2C384E] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Posts Created</span>
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {isLoadingAnalytics ? "..." : (analytics?.totalPosts ?? 0)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Platform wide volume</div>
        </div>

        {/* Top Business Category */}
        <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#2C384E] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Top Industry Niche</span>
            <FolderKanban className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-2 truncate" title={topCategory?.name || "N/A"}>
            {isLoadingAnalytics ? "..." : (topCategory?.name || "N/A")}
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
            {topCategory ? `${topCategory.count} posts (${topCategory.percentage}%)` : "No data"}
          </div>
        </div>

        {/* Top Frame Overlay */}
        <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#2C384E] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Top Brand Frame</span>
            <Maximize2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-2 truncate" title={topFrame?.title || "N/A"}>
            {isLoadingAnalytics ? "..." : (topFrame?.title || "None")}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            {topFrame ? `${topFrame.count} posts (${topFrame.percentage}%)` : "No data"}
          </div>
        </div>

        {/* Top Festival */}
        <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#2C384E] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Top Festival Event</span>
            <Calendar className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-2 truncate" title={topFestival?.name || "N/A"}>
            {isLoadingAnalytics ? "..." : (topFestival?.name || "General")}
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
            {topFestival ? `${topFestival.count} posts (${topFestival.percentage}%)` : "No data"}
          </div>
        </div>
      </div>

      {/* Multi-Dimensional Filter Toolbar with Paginated & Searchable Pickers */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#2C384E] space-y-3.5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Filter Posts Audit Trail:</span>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
            <SearchBar
              value={postSearch}
              onChange={(val) => {
                const query = typeof val === "string" ? val : (val?.target?.value ?? "");
                setPostSearch(query);
                setPostPage(1);
              }}
              placeholder="Search user name, email, or occasion..."
              className="w-full"
            />

            {/* Post Status Selector */}
            <div className="shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPostPage(1);
                }}
                className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#2C384E] text-slate-800 dark:text-white text-xs font-bold rounded-xl px-2.5 py-2 focus:outline-none focus:border-amber-500 transition cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic High-Volume Search & Paginated Filter Pickers (Enterprise 1000+ Scalable) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* 1. Business Category Searchable Picker */}
          <FilterSearchablePicker
            label="Business Category"
            icon={FolderKanban}
            items={categoriesList}
            selectedId={categoryFilter}
            onSelect={(id) => {
              setCategoryFilter(id);
              setPostPage(1);
            }}
            placeholder="Search business categories..."
            accentColor="indigo"
          />

          {/* 2. Brand Frame Searchable Picker */}
          <FilterSearchablePicker
            label="Brand Frame"
            icon={Maximize2}
            items={framesList}
            selectedId={frameFilter}
            onSelect={(id) => {
              setFrameFilter(id);
              setPostPage(1);
            }}
            placeholder="Search brand frames..."
            accentColor="emerald"
          />

          {/* 3. Template Category Searchable Picker */}
          <FilterSearchablePicker
            label="Template Category"
            icon={Image}
            items={templateCategoriesList}
            selectedId={templateCategoryFilter}
            onSelect={(id) => {
              setTemplateCategoryFilter(id);
              setPostPage(1);
            }}
            placeholder="Search template themes..."
            accentColor="amber"
          />

          {/* 4. Festival Event Searchable Picker */}
          <FilterSearchablePicker
            label="Festival Event"
            icon={Calendar}
            items={festivalsList}
            selectedId={festivalFilter}
            onSelect={(id) => {
              setFestivalFilter(id);
              setPostPage(1);
            }}
            placeholder="Search festivals..."
            accentColor="rose"
          />
        </div>

        {/* Clear Filters Indicator */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-[#1E293B]">
            <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
              Filtered results active
            </span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition cursor-pointer"
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

      {/* Posts Audit Feed Table (List View) */}
      {isLoadingPosts ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-[#2C384E] bg-white dark:bg-[#131B2A] shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-[#2C384E]">
              <tr>
                <th className="py-2.5 px-3">Post Artwork</th>
                <th className="py-2.5 px-3">Creator User</th>
                <th className="py-2.5 px-3">Business Category</th>
                <th className="py-2.5 px-3">Frame Overlay</th>
                <th className="py-2.5 px-3">Template & Theme</th>
                <th className="py-2.5 px-3">Festival</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Created At</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2C384E]/50">
              {Array.from({ length: 6 }).map((_, rIdx) => (
                <tr key={rIdx} className="border-b border-slate-100 dark:border-[#2C384E]/40">
                  <td className="py-2.5 px-3">
                    <div className="w-11 h-11 rounded-xl skeleton-shimmer shrink-0" />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full skeleton-shimmer shrink-0" />
                      <div className="space-y-1">
                        <div className="h-3.5 w-24 rounded skeleton-shimmer" />
                        <div className="h-2.5 w-16 rounded skeleton-shimmer opacity-60" />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="h-6 w-24 rounded-full skeleton-shimmer" />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="h-6 w-20 rounded-full skeleton-shimmer" />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="space-y-1">
                      <div className="h-3.5 w-28 rounded skeleton-shimmer" />
                      <div className="h-2.5 w-16 rounded skeleton-shimmer opacity-60" />
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="h-3.5 w-20 rounded skeleton-shimmer" />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="h-6 w-16 rounded-full skeleton-shimmer" />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="h-3.5 w-20 rounded skeleton-shimmer" />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="h-7 w-16 rounded-lg skeleton-shimmer ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : posts.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-slate-200 dark:border-[#2C384E] bg-white dark:bg-[#131B2A] rounded-2xl space-y-3">
          <Layers className="w-9 h-9 text-slate-400 dark:text-slate-600 mx-auto" />
          <p className="text-slate-600 dark:text-slate-300 font-semibold text-sm">
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
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-[#2C384E] bg-white dark:bg-[#131B2A] shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-[#2C384E]">
                <tr>
                  <th className="py-2.5 px-3">Post Artwork</th>
                  <th className="py-2.5 px-3">Creator User</th>
                  <th className="py-2.5 px-3">Business Category</th>
                  <th className="py-2.5 px-3">Frame Overlay</th>
                  <th className="py-2.5 px-3">Template & Theme</th>
                  <th className="py-2.5 px-3">Festival</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Created At</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2C384E]/50">
                {posts.map((post) => {
                  const creator = post.user;
                  const categoryName = post.category?.name || "General Business";
                  const frameTitle = post.frame?.title || "No Frame";
                  const templateTitle = post.template?.title || "Custom Graphic";
                  const templateCategoryName = post.template?.templateCategory?.name || "General";
                  const festivalName = post.festival?.name || "-";
                  const graphicUrl = post.finalGraphicUrl || post.customImageUrl || post.template?.baseImageUrl;

                  return (
                    <tr key={post.id} className="hover:bg-slate-50/80 dark:hover:bg-[#1A2333]/50 transition">
                      {/* Image Thumbnail */}
                      <td className="py-2.5 px-3">
                        <div
                          onClick={() => setSelectedPostForLightbox(post)}
                          className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#2C384E] relative group cursor-pointer shrink-0 shadow-sm"
                        >
                          {graphicUrl ? (
                            <img
                              src={graphicUrl}
                              alt={post.occasionName || "Post preview"}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                              <Image className="w-4 h-4" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </td>

                      {/* Creator Details (User) */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-xs shrink-0 overflow-hidden shadow-2xs">
                            {creator?.avatarUrl ? (
                              <img src={creator.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              creator?.fullName?.[0]?.toUpperCase() || "U"
                            )}
                          </div>
                          <div className="truncate max-w-[140px]">
                            <div className="font-semibold text-slate-900 dark:text-white truncate" title={creator?.fullName || "User"}>
                              {creator?.fullName || "Anonymous User"}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono" title={creator?.email}>
                              {creator?.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Business Category (Task 14 Fix: crisp light theme contrast) */}
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20 text-[11px] font-medium whitespace-nowrap">
                          <FolderKanban className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          <span>{categoryName}</span>
                        </span>
                      </td>

                      {/* Frame Overlay */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap border ${
                            post.frameId
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
                              : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/40"
                          }`}
                        >
                          <Maximize2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="truncate max-w-[120px]" title={frameTitle}>{frameTitle}</span>
                        </span>
                      </td>

                      {/* Template & Template Category */}
                      <td className="py-2.5 px-3">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white truncate max-w-[150px]" title={templateTitle}>
                            {templateTitle}
                          </div>
                          <div className="text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-1 mt-0.5 font-medium">
                            <span>Theme: {templateCategoryName}</span>
                          </div>
                        </div>
                      </td>

                      {/* Festival */}
                      <td className="py-2.5 px-3">
                        {post.festivalId ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20 text-[10px] font-medium">
                            <Calendar className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                            <span className="truncate max-w-[100px]" title={festivalName}>{festivalName}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 font-mono">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                            post.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30"
                              : post.status === "SCHEDULED"
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30"
                              : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30"
                          }`}
                        >
                          {post.status === "PUBLISHED" ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          ) : post.status === "SCHEDULED" ? (
                            <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          )}
                          <span>{post.status}</span>
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px] font-mono">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }) : "-"}
                      </td>

                      {/* Preview Button */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedPostForLightbox(post)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white transition cursor-pointer shadow-2xs"
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
