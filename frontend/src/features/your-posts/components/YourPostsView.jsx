import React, { useState } from "react";
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
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { SearchBar } from "../../../components/common/SearchBar";
import { ImageLightbox } from "../../../components/common/ImageLightbox";

/**
 * YourPostsView
 * Presentational component displaying user's post portfolio, scheduled queue, live published posts, and draft graphics.
 */
export const YourPostsView = ({
  posts,
  scheduledPosts,
  isLoading,
  error,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onDeletePost,
  onTriggerScheduled,
  isTriggering,
}) => {
  const [lightboxImage, setLightboxImage] = useState(null);

  // Filter posts based on search and active tab
  const filteredPosts = posts.filter((p) => {
    const titleMatch =
      p.occasionName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!titleMatch) return false;

    if (activeTab === "PUBLISHED") return p.status === "PUBLISHED";
    if (activeTab === "DRAFT") return p.status === "DRAFT";
    return true;
  });

  const filteredScheduled = scheduledPosts.filter((s) => {
    return (
      s.post?.occasionName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.post?.customText?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length;
  const scheduledCount = scheduledPosts.length;
  const draftCount = posts.filter((p) => p.status === "DRAFT").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131B2A] border border-[#2C384E] p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Share2 className="w-6 h-6" />
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

        {activeTab === "SCHEDULED" && (
          <Button
            variant="primary"
            icon={Zap}
            isLoading={isTriggering}
            onClick={onTriggerScheduled}
            className="bg-amber-500 text-slate-950 hover:bg-amber-400 border-0 font-bold shrink-0"
          >
            ⚡ Test Trigger Queue Now
          </Button>
        )}
      </div>

      {/* Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#131B2A] border-[#2C384E] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Portfolio</p>
            <p className="text-xl font-heading font-extrabold text-white">{posts.length}</p>
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
            onChange={(e) => setSearchQuery(e.target.value)}
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
            {filteredScheduled.map((item) => (
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
                      {item.post?.occasionName || item.post?.customText || "Scheduled Social Graphic"}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Scheduled for:{" "}
                      <strong className="text-amber-400">
                        {new Date(item.scheduledAt).toLocaleString()}
                      </strong>
                    </p>
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
                </div>
              </Card>
            ))}
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
              <Card
                key={post.id}
                className="p-4 bg-[#131B2A] border-[#2C384E] space-y-4 flex flex-col justify-between group hover:border-slate-500 transition"
              >
                <div className="space-y-3">
                  {/* Image Preview */}
                  {post.finalGraphicUrl ? (
                    <div className="relative aspect-square rounded-xl overflow-hidden border border-[#2C384E] bg-[#0B0F17]">
                      <img
                        src={post.finalGraphicUrl}
                        alt={post.occasionName || "Post Graphic"}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300 cursor-pointer"
                        onClick={() => setLightboxImage(post.finalGraphicUrl)}
                      />
                      <span
                        className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          post.status === "PUBLISHED"
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-amber-500 text-slate-950"
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                  ) : (
                    <div className="aspect-square rounded-xl bg-[#0B0F17] border border-[#2C384E] flex items-center justify-center text-xs text-slate-500">
                      No Preview Image
                    </div>
                  )}

                  {/* Details */}
                  <div>
                    <h4 className="font-bold text-sm text-white line-clamp-1">
                      {post.occasionName || post.customText || "Branded Graphic Post"}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {post.customText || post.offerText || "No caption text"}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono mt-2">
                      Created: {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-[#2C384E] flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-slate-400 hover:text-white"
                    onClick={() => setLightboxImage(post.finalGraphicUrl)}
                  >
                    View HD
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                    onClick={() => onDeletePost(post.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Image Lightbox Preview Modal */}
      {lightboxImage && (
        <ImageLightbox
          imageUrl={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
};
