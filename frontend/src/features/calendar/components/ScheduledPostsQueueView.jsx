import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Calendar, Sparkles, AlertCircle, X } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import { SearchBar } from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';
import { useYourPosts } from '@/features/your-posts/hooks/useYourPosts';
import { useDebounce } from '@/shared/hooks/useDebounce';

/**
 * ScheduledPostsQueueView
 * Renders user's scheduled post queue with multi-filter controls, debounced searching, and standardized pagination.
 */
export const ScheduledPostsQueueView = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
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
    platform: platform || undefined,
    timeFilter: timeFilter || undefined,
  });

  // Auto-reset page on search or filter change
  useEffect(() => {
    setScheduledPage(1);
  }, [debouncedSearch, platform, timeFilter, setScheduledPage]);

  return (
    <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-lg text-white">
                Scheduled Posts Queue
              </h3>
              <span className="text-[11px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/30 px-2.5 py-0.5 rounded-full">
                {scheduledMeta?.totalItems ?? scheduledPosts.length} Queued
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Posts queued for automated publication across social platforms.
            </p>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Channel Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-xs">
            <span className="text-slate-400 font-medium">Channel:</span>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[#131B2A] text-white">All</option>
              <option value="INSTAGRAM" className="bg-[#131B2A] text-white">Instagram</option>
              <option value="FACEBOOK" className="bg-[#131B2A] text-white">Facebook</option>
              <option value="LINKEDIN" className="bg-[#131B2A] text-white">LinkedIn</option>
            </select>
          </div>

          {/* Time Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-xs">
            <span className="text-slate-400 font-medium">Period:</span>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[#131B2A] text-white">All Time</option>
              <option value="today" className="bg-[#131B2A] text-white">Today</option>
              <option value="week" className="bg-[#131B2A] text-white">Past 7 Days</option>
              <option value="month" className="bg-[#131B2A] text-white">Past 30 Days</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="w-full sm:w-56">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search queue..."
            />
          </div>

          {/* Clear Filters Button */}
          {(Boolean(platform) || Boolean(timeFilter) || Boolean(search)) && (
            <button
              type="button"
              onClick={() => {
                setPlatform("");
                setTimeFilter("");
                setSearch("");
              }}
              className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              title="Reset Filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {error && <Alert variant="error" message="Failed to load scheduled queue." />}

      {isLoadingScheduled ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-16 h-16 rounded-xl skeleton-shimmer shrink-0" />
                <div className="space-y-2 flex-1">
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
        <div className="p-8 text-center border border-dashed border-[#2C384E] rounded-2xl space-y-2">
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
                className="p-4 rounded-xl bg-[#0B0F17] border border-[#2C384E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  {item.post?.finalGraphicUrl && (
                    <img
                      src={item.post.finalGraphicUrl}
                      alt="Scheduled Graphic"
                      className="w-12 h-12 rounded-lg object-cover border border-[#2C384E]"
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {item.post?.occasionName || item.post?.template?.title || "Scheduled Social Post"}
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer"
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
