import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Calendar, Sparkles, AlertCircle } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import { SearchBar } from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';
import { useYourPosts } from '@/features/your-posts/hooks/useYourPosts';
import { useDebounce } from '@/shared/hooks/useDebounce';

/**
 * ScheduledPostsQueueView
 * Renders user's scheduled post queue with debounced searching and standardized pagination.
 */
export const ScheduledPostsQueueView = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const {
    scheduledPosts,
    scheduledMeta,
    scheduledPage,
    setScheduledPage,
    scheduledLimit,
    setScheduledLimit,
    isLoadingScheduled,
    error,
  } = useYourPosts({
    search: debouncedSearch,
  });

  // Auto-reset page on search change
  useEffect(() => {
    setScheduledPage(1);
  }, [debouncedSearch, setScheduledPage]);

  return (
    <Card className="p-3.5 min-[380px]:p-4 sm:p-6 bg-[#131B2A] border-[#2C384E] space-y-4 sm:space-y-6 rounded-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4 border-b border-[#2C384E] pb-3.5 sm:pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-white truncate">
                Scheduled Posts Queue
              </h3>
              <span className="text-[11px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/30 px-2.5 py-0.5 rounded-full shrink-0">
                {scheduledMeta?.totalItems ?? scheduledPosts.length} Queued
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
              Posts queued for automated publication across social platforms.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-64">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search scheduled posts..."
          />
        </div>
      </div>

      {error && <Alert variant="error" message="Failed to load scheduled queue." />}

      {isLoadingScheduled ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl skeleton-shimmer shrink-0" />
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="h-4 w-48 rounded skeleton-shimmer" />
                  <div className="h-3 w-32 rounded skeleton-shimmer opacity-70" />
                  <div className="h-3 w-64 rounded skeleton-shimmer opacity-50" />
                </div>
              </div>
              <div className="h-9 w-28 rounded-xl skeleton-shimmer shrink-0" />
            </div>
          ))}
        </div>
      ) : scheduledPosts.length === 0 ? (
        <div className="p-6 sm:p-8 text-center border border-dashed border-[#2C384E] rounded-2xl space-y-2">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-semibold text-sm">
            {search ? `No scheduled posts matching "${search}"` : "No Scheduled Posts Queued"}
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search ? "Try adjusting your search terms." : "Use the Post Creator or Festival Studio to schedule posts for future dates!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduledPosts.map((item) => {
            let config = item.post?.userConfigJson;
            if (typeof config === "string") {
              try { config = JSON.parse(config); } catch (e) {}
            }
            const brandKitNeedsReview = Boolean(config?.brandKitNeedsReview);

            return (
              <div
                key={item.id}
                className="p-3 min-[380px]:p-4 rounded-xl bg-[#0B0F17] border border-[#2C384E] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 min-w-0"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 w-full">
                  {item.post?.finalGraphicUrl ? (
                    <img
                      src={item.post.finalGraphicUrl}
                      alt="Scheduled Graphic"
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg object-cover border border-[#2C384E] shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-slate-900 border border-[#2C384E] flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-teal-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs min-[380px]:text-sm text-white truncate" title={item.post?.occasionName || item.post?.template?.title || "Scheduled Social Post"}>
                      {item.post?.occasionName || item.post?.template?.title || "Scheduled Social Post"}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-mono mt-0.5 truncate">
                      Scheduled for:{" "}
                      <strong className="text-amber-400">
                        {new Date(item.scheduledAt).toLocaleString()}
                      </strong>
                    </p>
                    {brandKitNeedsReview && (
                      <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>BrandKit Details Changed</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap w-full md:w-auto pt-2.5 md:pt-0 border-t md:border-t-0 border-[#2C384E]/60 shrink-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
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
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
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
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer shrink-0 min-h-[36px] active:scale-95"
                    title="Review & re-render graphic with latest BrandKit in Post Studio"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Edit in Studio</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      )}

      {/* Central Pagination */}
      {scheduledMeta && (
        <Pagination
          meta={scheduledMeta}
          currentPage={scheduledPage}
          totalPages={scheduledMeta?.totalPages || 1}
          onPageChange={setScheduledPage}
          onLimitChange={setScheduledLimit}
          pageSizeOptions={[5, 10, 20]}
        />
      )}
    </Card>
  );
};
