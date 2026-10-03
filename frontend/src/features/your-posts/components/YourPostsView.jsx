import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Calendar,
  Sparkles,
  Maximize2,
  Layers,
  Plus,
  Download,
  Tag,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { SearchBar } from '@/components/ui/SearchBar';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import Pagination from '@/components/ui/Pagination';
import { SkeletonGrid } from '@/components/feedback/SkeletonLoader';
import { PostGridItem } from "./PostGridItem";

/**
 * YourPostsView
 * Enterprise presentational component displaying user's post portfolio, scheduled queue, live published posts, and draft graphics.
 */
export const YourPostsView = ({
  posts = [],
  postsMeta,
  isLoadingPosts,
  postsError,
  postsPage = 1,
  setPostsPage,
  postsLimit = 10,
  setPostsLimit,
  scheduledPosts = [],
  scheduledMeta,
  isLoadingScheduled,
  scheduledError,
  scheduledPage = 1,
  setScheduledPage,
  scheduledLimit = 10,
  setScheduledLimit,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  searchQuery = "",
  setSearchQuery,
  onDeletePost,
}) => {
  const navigate = useNavigate();
  const isLoading = isLoadingPosts || isLoadingScheduled;
  const error = postsError || scheduledError;
  const [localActiveTab, setLocalActiveTab] = useState("ALL"); // 'ALL' | 'SCHEDULED' | 'PUBLISHED' | 'DRAFT'
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  const setActiveTab = propSetActiveTab !== undefined ? propSetActiveTab : setLocalActiveTab;
  const [lightboxImage, setLightboxImage] = useState(null);

  // Filter posts based on search and active tab
  const filteredPosts = useMemo(() => {
    let list = posts || [];
    if (activeTab === "PUBLISHED") {
      list = list.filter((p) => p.status === "PUBLISHED");
    } else if (activeTab === "DRAFT") {
      list = list.filter((p) => p.status === "DRAFT");
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.occasionName?.toLowerCase().includes(q) ||
          p.template?.title?.toLowerCase().includes(q) ||
          p.festival?.name?.toLowerCase().includes(q) ||
          p.captions?.[0]?.captionText?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [posts, activeTab, searchQuery]);

  // Filter scheduled posts based on search
  const filteredScheduled = useMemo(() => {
    if (!scheduledPosts || scheduledPosts.length === 0) return [];
    if (!searchQuery || !searchQuery.trim()) return scheduledPosts;
    const q = searchQuery.toLowerCase().trim();
    return scheduledPosts.filter(
      (s) =>
        s.post?.occasionName?.toLowerCase().includes(q) ||
        s.post?.template?.title?.toLowerCase().includes(q) ||
        s.post?.festival?.name?.toLowerCase().includes(q)
    );
  }, [scheduledPosts, searchQuery]);

  const publishedCount = (posts || []).filter((p) => p.status === "PUBLISHED").length;
  const scheduledCount = scheduledMeta?.totalItems ?? (scheduledPosts || []).length;
  const draftCount = (posts || []).filter((p) => p.status === "DRAFT").length;
  const totalPostsCount = postsMeta?.totalItems ?? (posts || []).length;

  // Global Image Download handler
  const handleDownload = (graphicUrl, title) => {
    if (!graphicUrl) return;
    const link = document.createElement("a");
    link.href = graphicUrl;
    link.download = `${(title || "BrandFlow-Post").replace(/[^a-zA-Z0-9_-]/g, "_")}.png`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Platform badge helper
  const renderPlatformBadge = (platform) => {
    const p = (platform || "").toUpperCase();
    let badgeClass = "bg-slate-800 text-slate-300 border-slate-700";
    if (p.includes("INSTAGRAM")) {
      badgeClass = "bg-pink-500/15 text-pink-400 border-pink-500/30";
    } else if (p.includes("FACEBOOK")) {
      badgeClass = "bg-blue-500/15 text-blue-400 border-blue-500/30";
    } else if (p.includes("LINKEDIN")) {
      badgeClass = "bg-sky-500/15 text-sky-400 border-sky-500/30";
    } else if (p.includes("TWITTER") || p === "X") {
      badgeClass = "bg-slate-800 text-slate-200 border-slate-600";
    }

    return (
      <span
        key={platform}
        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass} uppercase tracking-wider`}
      >
        {platform}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Header Banner with Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#131B2A] border border-[#2C384E] p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-inner">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-white tracking-tight">
              Your Social Posts & Publishing Queue
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Inspect your created branded graphics, active scheduled publishing pipelines, and live social media publications.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/create-post")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create New Post</span>
        </button>
      </div>

      {/* Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Portfolio */}
        <Card className="p-4 bg-[#131B2A] border-[#2C384E] flex items-center gap-3.5 rounded-2xl hover:border-slate-500 transition duration-200">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Portfolio</p>
            <p className="text-xl font-heading font-extrabold text-white mt-0.5">{totalPostsCount}</p>
          </div>
        </Card>

        {/* Scheduled Queue */}
        <Card className="p-4 bg-[#131B2A] border-[#2C384E] flex items-center gap-3.5 rounded-2xl hover:border-slate-500 transition duration-200">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Scheduled Queue</p>
            <p className="text-xl font-heading font-extrabold text-teal-400 mt-0.5">{scheduledCount}</p>
          </div>
        </Card>

        {/* Published Live */}
        <Card className="p-4 bg-[#131B2A] border-[#2C384E] flex items-center gap-3.5 rounded-2xl hover:border-slate-500 transition duration-200">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Published Live</p>
            <p className="text-xl font-heading font-extrabold text-emerald-400 mt-0.5">{publishedCount}</p>
          </div>
        </Card>

        {/* Saved Drafts */}
        <Card className="p-4 bg-[#131B2A] border-[#2C384E] flex items-center gap-3.5 rounded-2xl hover:border-slate-500 transition duration-200">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Saved Drafts</p>
            <p className="text-xl font-heading font-extrabold text-amber-400 mt-0.5">{draftCount}</p>
          </div>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
        {/* Navigation Tabs with Badges */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#131B2A] border border-[#2C384E] text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "ALL"
                ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <span>All Posts</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === "ALL"
                  ? "bg-slate-950/20 text-slate-950 font-bold"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {totalPostsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("SCHEDULED")}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "SCHEDULED"
                ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Scheduled Queue</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === "SCHEDULED"
                  ? "bg-slate-950/20 text-slate-950 font-bold"
                  : "bg-teal-500/20 text-teal-400 font-bold"
              }`}
            >
              {scheduledCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("PUBLISHED")}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "PUBLISHED"
                ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Published</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === "PUBLISHED"
                  ? "bg-slate-950/20 text-slate-950 font-bold"
                  : "bg-emerald-500/20 text-emerald-400 font-bold"
              }`}
            >
              {publishedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("DRAFT")}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "DRAFT"
                ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <span>Drafts</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === "DRAFT"
                  ? "bg-slate-950/20 text-slate-950 font-bold"
                  : "bg-amber-500/20 text-amber-400 font-bold"
              }`}
            >
              {draftCount}
            </span>
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="w-full sm:w-64">
          <SearchBar
            value={searchQuery}
            onChange={(val) => {
              const query = typeof val === "string" ? val : (val?.target?.value ?? "");
              setSearchQuery?.(query);
            }}
            placeholder="Search by occasion, festival..."
          />
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <SkeletonGrid variant="post" count={6} columns="grid-cols-1 sm:grid-cols-2 md:grid-cols-3" />
      ) : activeTab === "SCHEDULED" ? (

        /* ==================== SCHEDULED QUEUE VIEW ==================== */
        filteredScheduled.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-2xl space-y-3 bg-[#131B2A]">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center mx-auto">
              <Clock className="w-7 h-7" />
            </div>
            <p className="text-white font-bold text-base">No Scheduled Posts in Queue</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Schedule your branded graphics from the Festival Calendar or Post Studio to automate your social media publishing pipeline.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/calendar")}
                className="px-4 py-2 rounded-xl bg-[#0B0F17] hover:bg-slate-800 text-slate-200 border border-[#2C384E] text-xs font-semibold transition cursor-pointer"
              >
                Browse Calendar
              </button>
              <button
                type="button"
                onClick={() => navigate("/create-post")}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
              >
                Create & Schedule
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredScheduled.map((item) => {
              let config = item.post?.userConfigJson;
              if (typeof config === "string") {
                try { config = JSON.parse(config); } catch (e) {}
              }
              const brandKitNeedsReview = Boolean(config?.brandKitNeedsReview);
              const postTitle =
                item.post?.occasionName ||
                item.post?.template?.title ||
                item.post?.festival?.name ||
                "Scheduled Social Graphic";

              const scheduledDateFormatted = new Date(item.scheduledAt).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              const createdDateFormatted = (item.createdAt || item.post?.createdAt)
                ? new Date(item.createdAt || item.post?.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : null;

              const postForLightbox = {
                ...(item.post || {}),
                id: item.post?.id || item.id,
                title: postTitle,
                occasionName: postTitle,
                finalGraphicUrl: item.post?.finalGraphicUrl,
                caption: item.post?.captions?.[0]?.captionText,
                captions: item.post?.captions || [],
                hashtags: item.post?.captions?.[0]?.hashtags || [],
                categoryName: item.post?.category?.name || item.post?.festival?.name || "Scheduled Post",
                scheduledAt: item.scheduledAt,
                createdAt: item.createdAt || item.post?.createdAt,
              };

              return (
                <Card
                  key={item.id}
                  className="p-4 bg-[#131B2A] border-[#2C384E] hover:border-slate-500/80 transition-all rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    {item.post?.finalGraphicUrl ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#2C384E] bg-[#0B0F17] shrink-0 group/img cursor-pointer">
                        <img
                          src={item.post.finalGraphicUrl}
                          alt={postTitle}
                          onClick={() => setLightboxImage(postForLightbox)}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div
                          onClick={() => setLightboxImage(postForLightbox)}
                          className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Maximize2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[#0B0F17] border border-[#2C384E] flex items-center justify-center text-[10px] text-slate-500 shrink-0">
                        No Graphic
                      </div>
                    )}

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-white truncate" title={postTitle}>
                        {postTitle}
                      </h4>

                      {/* Dual Dates: Created Date & Scheduled Date */}
                      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                        {createdDateFormatted && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0B0F17] border border-[#2C384E] text-slate-400">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>Created: <strong className="text-slate-300 font-medium">{createdDateFormatted}</strong></span>
                          </div>
                        )}

                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0B0F17] border border-[#2C384E] text-slate-400">
                          <Clock className="w-3 h-3 text-teal-400 shrink-0" />
                          <span>Scheduled for: <strong className="text-teal-300 font-semibold">{scheduledDateFormatted}</strong></span>
                        </div>

                        {brandKitNeedsReview && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                            <AlertCircle className="w-3 h-3 text-amber-400" />
                            <span>BrandKit Updated</span>
                          </div>
                        )}
                      </div>

                      {/* Complete Caption & Details - Clean without bulky layout */}
                      {item.post?.captions?.[0]?.captionText && (
                        <div className="bg-[#0B0F17]/80 rounded-lg p-2 border border-[#2C384E]/60 max-w-2xl">
                          <p className="text-xs text-slate-300 leading-relaxed max-h-16 overflow-y-auto custom-scrollbar whitespace-pre-wrap select-text pr-1 font-sans">
                            {item.post.captions[0].captionText}
                          </p>
                          {item.post.captions[0].hashtags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1.5 border-t border-[#2C384E]/40 mt-1.5">
                              {item.post.captions[0].hashtags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-1.5 py-0.2 rounded border border-teal-500/20"
                                >
                                  {tag.startsWith("#") ? tag : `#${tag}`}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Target Platforms, Status & Actions */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0 self-end md:self-center">
                    {/* Platforms Badges */}
                    {item.targetPlatforms && item.targetPlatforms.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        {item.targetPlatforms.map(renderPlatformBadge)}
                      </div>
                    )}

                    {/* Status Pill */}
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        item.status === "SUCCESS"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : item.status === "PROCESSING"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                          : item.status === "FAILED"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          : "bg-teal-500/20 text-teal-300 border-teal-500/40"
                      }`}
                    >
                      {item.status}
                    </span>

                    {/* Preview Full HD Graphic */}
                    {item.post?.finalGraphicUrl && (
                      <button
                        type="button"
                        onClick={() => setLightboxImage(postForLightbox)}
                        className="p-2 rounded-xl bg-[#0B0F17] hover:bg-slate-800 border border-[#2C384E] hover:border-slate-500 text-slate-300 hover:text-white transition cursor-pointer"
                        title="View Full HD Graphic & Caption"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Download Graphic PNG */}
                    {item.post?.finalGraphicUrl && (
                      <button
                        type="button"
                        onClick={() => handleDownload(item.post.finalGraphicUrl, postTitle)}
                        className="p-2 rounded-xl bg-[#0B0F17] hover:bg-slate-800 border border-[#2C384E] hover:border-amber-500/40 text-slate-300 hover:text-amber-400 transition cursor-pointer"
                        title="Download Graphic PNG"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete / Cancel Scheduled Post Action */}
                    <button
                      type="button"
                      className="p-2 rounded-xl bg-[#0B0F17] hover:bg-rose-500/15 border border-[#2C384E] hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      title="Cancel & Delete Scheduled Post"
                      onClick={() => onDeletePost(item.postId || item.post?.id || item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : (

        /* ==================== PORTFOLIO POSTS GRID VIEW ==================== */
        filteredPosts.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-2xl space-y-3 bg-[#131B2A]">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
              <FolderKanban className="w-7 h-7" />
            </div>
            <p className="text-white font-bold text-base">No Posts Found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {searchQuery.trim()
                ? `No posts matched "${searchQuery}". Try a different keyword.`
                : "Create and save your custom branded graphics using the Post Creator Studio!"}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate("/create-post")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create Your First Post</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredPosts.map((post) => (
              <PostGridItem
                key={post.id}
                post={post}
                onLightbox={setLightboxImage}
                onDelete={onDeletePost}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )
      )}

      {/* Central Pagination Controls */}
      {activeTab === "SCHEDULED" ? (
        <Pagination
          meta={scheduledMeta}
          currentPage={scheduledPage}
          totalPages={scheduledMeta?.totalPages || 1}
          onPageChange={setScheduledPage}
          onLimitChange={setScheduledLimit}
          pageSizeOptions={[10, 20, 50]}
        />
      ) : (
        <Pagination
          meta={postsMeta}
          currentPage={postsPage}
          totalPages={postsMeta?.totalPages || 1}
          onPageChange={setPostsPage}
          onLimitChange={setPostsLimit}
          pageSizeOptions={[10, 20, 50]}
        />
      )}

      {/* Image Lightbox Preview Modal */}
      <ImageLightbox
        isOpen={Boolean(lightboxImage)}
        item={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
};

export default YourPostsView;
