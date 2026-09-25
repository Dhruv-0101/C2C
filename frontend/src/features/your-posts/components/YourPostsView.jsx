import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Zap,
  Search,
  Calendar,
  Sparkles,
  Share2,
  Maximize2,
  Layers,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { SearchBar } from '@/components/ui/SearchBar';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import Pagination from '@/components/ui/Pagination';
import { PostGridItem } from "./PostGridItem";

/**
 * YourPostsView
 * Presentational component displaying user's post portfolio, scheduled queue, live published posts, and draft graphics.
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
  searchQuery,
  setSearchQuery,
  onDeletePost,
}) => {
  const navigate = useNavigate();
  const isLoading = isLoadingPosts || isLoadingScheduled;
  const error = postsError || scheduledError;
  const [localActiveTab, setLocalActiveTab] = useState("ALL"); // 'ALL' | 'SCHEDULED' | 'PUBLISHED' | 'DRAFTS'
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  const setActiveTab = propSetActiveTab !== undefined ? propSetActiveTab : setLocalActiveTab;
  const [lightboxImage, setLightboxImage] = useState(null);

  // Filter posts based on search and active tab
  const filteredPosts = useMemo(() => {
    let list = posts;
    if (activeTab === "PUBLISHED") {
      list = list.filter((p) => p.status === "PUBLISHED");
    } else if (activeTab === "DRAFTS") {
      list = list.filter((p) => p.status === "DRAFT");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.occasionName?.toLowerCase().includes(q) ||
          p.template?.title?.toLowerCase().includes(q) ||
          p.festival?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [posts, activeTab, searchQuery]);

  // Filter scheduled posts based on search
  const filteredScheduled = useMemo(() => {
    if (!searchQuery.trim()) return scheduledPosts;
    const q = searchQuery.toLowerCase();
    return scheduledPosts.filter(
      (s) =>
        s.post?.occasionName?.toLowerCase().includes(q) ||
        s.post?.template?.title?.toLowerCase().includes(q)
    );
  }, [scheduledPosts, searchQuery]);
  const filteredScheduledPosts = filteredScheduled;

  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length;
  const scheduledCount = scheduledMeta?.totalItems ?? scheduledPosts.length;
  const draftCount = posts.filter((p) => p.status === "DRAFT").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#131B2A] border border-[#2C384E] p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-white">
              Your Social Posts & Publishing Queue
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage your created graphics, active scheduled queues, and live social media publications.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#131B2A] border-[#2C384E] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Portfolio</p>
            <p className="text-xl font-heading font-extrabold text-white">{postsMeta?.totalItems ?? posts.length}</p>
          </div>
        </Card>

        <Card className="p-4 bg-[#131B2A] border-[#2C384E] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Scheduled Queue</p>
            <p className="text-xl font-heading font-extrabold text-teal-400">{scheduledCount}</p>
          </div>
        </Card>

        <Card className="p-4 bg-[#131B2A] border-[#2C384E] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Published Live</p>
            <p className="text-xl font-heading font-extrabold text-emerald-400">{publishedCount}</p>
          </div>
        </Card>

        <Card className="p-4 bg-[#131B2A] border-[#2C384E] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Saved Drafts</p>
            <p className="text-xl font-heading font-extrabold text-amber-400">{draftCount}</p>
          </div>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#131B2A] border border-[#2C384E] text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded-lg transition shrink-0 ${
              activeTab === "ALL"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Posts ({posts.length})
          </button>

          <button
            onClick={() => setActiveTab("SCHEDULED")}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 shrink-0 ${
              activeTab === "SCHEDULED"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Scheduled Queue ({scheduledCount})</span>
          </button>

          <button
            onClick={() => setActiveTab("PUBLISHED")}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 shrink-0 ${
              activeTab === "PUBLISHED"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Published ({publishedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab("DRAFT")}
            className={`px-4 py-2 rounded-lg transition shrink-0 ${
              activeTab === "DRAFT"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="w-full sm:w-64">
          <SearchBar
            value={searchQuery}
            onChange={(val) => {
              const query = typeof val === "string" ? val : (val?.target?.value ?? "");
              setSearchQuery(query);
            }}
            placeholder="Search posts..."
          />
        </div>
      </div>

      {/* Main Content Render */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading your posts...</div>
      ) : activeTab === "SCHEDULED" ? (
        /* SCHEDULED QUEUE VIEW */
        filteredScheduled.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-2xl space-y-2 bg-[#131B2A]">
            <Clock className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-white font-bold text-base">No Scheduled Posts Queued</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Schedule posts using the Post Creator Studio or Festival Calendar to see them queued here!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredScheduled.map((item) => {
              let config = item.post?.userConfigJson;
              if (typeof config === "string") {
                try { config = JSON.parse(config); } catch (e) {}
              }
              const brandKitNeedsReview = Boolean(config?.brandKitNeedsReview);

              return (
                <Card
                  key={item.id}
                  className="p-4 bg-[#131B2A] border-[#2C384E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    {item.post?.finalGraphicUrl && (
                      <img
                        src={item.post.finalGraphicUrl}
                        alt="Scheduled Graphic"
                        onClick={() => setLightboxImage(item.post.finalGraphicUrl)}
                        className="w-14 h-14 rounded-xl object-cover border border-[#2C384E] cursor-pointer hover:opacity-80 transition"
                      />
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {item.post?.occasionName || item.post?.template?.title || "Scheduled Social Graphic"}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Scheduled for:{" "}
                        <strong className="text-amber-400">
                          {new Date(item.scheduledAt).toLocaleString()}
                        </strong>
                      </p>
                      {brandKitNeedsReview && (
                        <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                          <AlertCircle className="w-3 h-3" />
                          <span>BrandKit Details Changed</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5">
                      {item.targetPlatforms?.map((p) => (
                        <span
                          key={p}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono font-bold"
                        >
                          {p}
                        </span>
                      ))}
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        item.status === "SUCCESS"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : item.status === "PROCESSING"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                      }`}
                    >
                      {item.status}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/create-post", {
                          state: {
                            reusePost: item.post,
                            isEditingScheduled: true,
                            scheduledPostId: item.id,
                          },
                        })
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer"
                      title="Review & re-render graphic with latest BrandKit in Post Studio"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Edit in Studio</span>
                    </button>

                    {/* Delete / Cancel Scheduled Post Action */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-2 border border-rose-500/20"
                      title="Cancel & Delete Scheduled Post"
                      onClick={() => onDeletePost(item.postId || item.post?.id || item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        /* PORTFOLIO POSTS GRID VIEW (All, Published, Drafts) */
        filteredPosts.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-2xl space-y-2 bg-[#131B2A]">
            <FolderKanban className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-white font-bold text-base">No Posts Found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create and save your custom branded graphics using the Post Creator Studio!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPosts.map((post) => (
              <PostGridItem
                key={post.id}
                post={post}
                onLightbox={setLightboxImage}
                onDelete={onDeletePost}
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
