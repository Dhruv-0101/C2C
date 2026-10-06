import React from "react";
import { createPortal } from "react-dom";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Flame,
  Sparkles,
  X,
  Trash2,
  Image as ImageIcon,
  Search,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Clock,
  Send,
  CheckCircle2,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useTheme } from '@/shared/hooks';

/**
 * FestivalCalendarView
 * Presentational component rendering interactive festival calendar grid, festival badges,
 * user scheduled posts, user published posts, day detail drawer, and template selection modals.
 */
export const FestivalCalendarView = ({
  isAdmin,
  onAddFestival,
  currentDate,
  monthName,
  year,
  prevMonth,
  nextMonth,
  goToToday,
  calendarCells,
  selectedDayDetails,
  setSelectedDayDetails,
  selectedFestivalTab = "all",
  setSelectedFestivalTab,
  handleCellClick,
  handleDeleteFestival,
  paginatedFestivalTemplates,
  festivalTemplatesMeta,
  isLoadingFestivalTemplates,
  festivalTemplatePage,
  setFestivalTemplatePage,
  festivalTemplateLimit,
  setFestivalTemplateLimit,
  festivalTemplateSearch,
  setFestivalTemplateSearch,
  studioTemplate,
  setStudioTemplate,
  isStudioOpen,
  setIsStudioOpen,
  isAddModalOpen,
  setIsAddModalOpen,
  registerFest,
  handleSubmitFest,
  resetFest,
  setFestValue,
  watchFest,
  festErrors,
  isSubmittingFest,
  addFestError,
  handleAddFestivalSubmit,
  onSelectTemplate,
}) => {
  const { isDark } = useTheme();
  const safeSelectedFestivals = selectedDayDetails?.festivals || [];
  const rawScheduledPosts = selectedDayDetails?.scheduledPosts || [];
  const safePublishedPosts = selectedDayDetails?.publishedPosts || [];

  // Deduplicate: filter out scheduled queue items whose post has already been published
  const publishedIdsSet = new Set(safePublishedPosts.map((p) => p.id));
  const safeScheduledPosts = rawScheduledPosts.filter((item) => {
    const pId = item.postId || item.post?.id;
    return !pId || !publishedIdsSet.has(pId);
  });

  const modalDayTotalTemplates = safeSelectedFestivals.reduce((sum, f) => {
    return (
      sum +
      Math.max(
        f._count?.templates ?? 0,
        Array.isArray(f.templates) ? f.templates.length : 0
      )
    );
  }, 0);

  const festivalsToRender =
    selectedFestivalTab === "all"
      ? safeSelectedFestivals
      : safeSelectedFestivals.filter((f) => f.id === selectedFestivalTab);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131B2A] border border-[#2C384E] p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-white">
              Social Media Content Calendar
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore national festivals, schedule upcoming social media posts, and track live publications.
            </p>
          </div>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center bg-[#0B0F17] p-1.5 rounded-xl border border-[#2C384E]">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevMonth}
            className="h-8 w-8 p-0 text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-heading font-bold text-sm text-white px-3 min-w-[130px] text-center">
            {monthName} {year}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextMonth}
            className="h-8 w-8 p-0 text-slate-400 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <div className="h-4 w-px bg-slate-800 mx-1" />
          <Button variant="outline" size="sm" onClick={goToToday} className="text-xs">
            Today
          </Button>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <Card className="border-[#2C384E] bg-[#131B2A] p-4 sm:p-6">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
            <div
              key={day}
              className={`py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl border ${
                idx === 0 || idx === 6
                  ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
                  : "text-slate-200 bg-[#0B0F17] border-[#2C384E]"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid Cells */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {calendarCells.map((cell) => {
            if (cell.isPadding) {
              return (
                <div
                  key={cell.key}
                  className="min-h-[90px] sm:min-h-[110px] rounded-xl bg-slate-900/20 border border-slate-800/30 opacity-40 pointer-events-none"
                />
              );
            }

            const hasFestivals = cell.festivals && cell.festivals.length > 0;
            const scheduledList = cell.scheduledPosts || [];
            const publishedList = cell.publishedPosts || [];

            // Deduplicate unique user posts defensively
            const postMap = new Map();
            scheduledList.forEach((item) => {
              const pId = item.postId || item.post?.id || item.id;
              postMap.set(pId, { type: "scheduled", data: item, id: pId });
            });
            publishedList.forEach((post) => {
              const existing = postMap.get(post.id);
              postMap.set(post.id, {
                type: "published",
                data: post,
                scheduledData: existing?.data,
                id: post.id,
              });
            });

            const allUserPosts = Array.from(postMap.values());
            const totalUserPosts = allUserPosts.length;
            const hasEvents = hasFestivals || totalUserPosts > 0;

            // Direct post pills vs overflow badge:
            // If date has festival(s):
            //   - Up to 2 posts are shown directly (no overflow badge needed for 1 or 2 posts).
            //   - If 3 or more posts exist: show 1 direct post pill + "+X more posts" overflow badge.
            // If date has NO festivals:
            //   - Up to 3 posts are shown directly (no overflow badge needed for 1, 2, or 3 posts).
            //   - If 4 or more posts exist: show 2 direct post pills + "+X more posts" overflow badge.
            let visibleUserPosts = allUserPosts;
            let overflowUserPostsCount = 0;

            if (hasFestivals) {
              if (totalUserPosts > 2) {
                visibleUserPosts = allUserPosts.slice(0, 1);
                overflowUserPostsCount = totalUserPosts - 1;
              }
            } else {
              if (totalUserPosts > 3) {
                visibleUserPosts = allUserPosts.slice(0, 2);
                overflowUserPostsCount = totalUserPosts - 2;
              }
            }

            // Limit festivals shown directly to 1 if user posts exist to avoid vertical clipping
            const maxFestivalsToShow = totalUserPosts > 0 ? 1 : 2;
            const visibleFestivals = hasFestivals ? cell.festivals.slice(0, maxFestivalsToShow) : [];
            const overflowFestivalsCount = hasFestivals ? cell.festivals.length - visibleFestivals.length : 0;

            // Total templates across all festivals on this day
            const dayTotalTemplates = hasFestivals
              ? cell.festivals.reduce(
                  (sum, f) =>
                    sum +
                    Math.max(
                      f._count?.templates ?? 0,
                      Array.isArray(f.templates) ? f.templates.length : 0
                    ),
                  0
                )
              : 0;

            // Find festival with cover banner image if uploaded by Admin
            const festivalWithBanner = hasFestivals
              ? cell.festivals.find((f) => f.bannerUrl)
              : null;
            const bannerUrl = festivalWithBanner?.bannerUrl;

            return (
              <div
                key={cell.key}
                onClick={() => handleCellClick(cell)}
                className={`relative min-h-[90px] sm:min-h-[115px] p-2 rounded-xl border transition-all duration-200 flex flex-col justify-between cursor-pointer group overflow-hidden ${
                  cell.isToday
                    ? "bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10"
                    : hasEvents
                      ? "bg-[#0B0F17] border-slate-700 hover:border-amber-400 hover:shadow-md"
                      : "bg-[#0B0F17]/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40"
                }`}
              >
                {/* Festival Cover Banner Background Overlay (Rendered vibrant & crisp as requested) */}
                {bannerUrl && (
                  <img
                    src={bannerUrl}
                    alt={festivalWithBanner.name || "Festival Cover"}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300 pointer-events-none"
                  />
                )}

                {/* Cell Top Header */}
                <div className="relative z-10 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold ${
                      cell.isToday
                        ? "bg-amber-500 text-slate-950 font-black shadow-md"
                        : bannerUrl
                          ? "text-white bg-slate-950/80 backdrop-blur-md border border-white/20 group-hover:text-amber-400 shadow-md"
                          : "text-slate-300 group-hover:text-amber-400"
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  <div className="flex items-center gap-1">
                    {dayTotalTemplates > 0 && (
                      <span
                        className="px-1.5 py-0.5 rounded-md bg-purple-600/90 text-white font-mono text-[9px] font-black shadow-sm flex items-center gap-1 border border-purple-400/40"
                        title={`${dayTotalTemplates} Graphic Templates on this date`}
                      >
                        <span>🎨</span>
                        <span>{dayTotalTemplates}</span>
                      </span>
                    )}
                    {cell.isToday && (
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-tighter bg-slate-950/85 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-amber-500/40 shadow-md">
                        Today
                      </span>
                    )}
                  </div>
                </div>

                {/* Event & Post Badges Container */}
                <div className="relative z-10 space-y-1 my-1 flex-1 flex flex-col justify-end">
                  {/* Visible User Posts (Scheduled / Published) */}
                  {visibleUserPosts.map((postItem) => {
                    if (postItem.type === "scheduled") {
                      const item = postItem.data;
                      return (
                        <div
                          key={`sched-${item.id}`}
                          className="px-2 py-0.5 rounded-lg bg-teal-50 border-teal-300 text-teal-900 dark:bg-teal-500/30 dark:backdrop-blur-md dark:border-teal-500/50 dark:text-teal-200 border text-[10px] font-mono font-bold flex items-center justify-between gap-1 truncate shadow-xs transition-all"
                          title={`Scheduled: ${new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        >
                          <span className="truncate text-teal-900 dark:text-teal-200 font-bold">
                            ⏰ {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <Clock className="w-3 h-3 text-teal-700 dark:text-teal-300 shrink-0" />
                        </div>
                      );
                    }
                    const post = postItem.data;
                    return (
                      <div
                        key={`pub-${post.id}`}
                        className="px-2 py-0.5 rounded-lg bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-500/30 dark:backdrop-blur-md dark:border-emerald-500/50 dark:text-emerald-200 border text-[10px] font-semibold flex items-center justify-between gap-1 truncate shadow-xs transition-all"
                        title="Published Live Post"
                      >
                        <span className="truncate text-emerald-900 dark:text-emerald-200 font-bold">🚀 Live</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-300 shrink-0" />
                      </div>
                    );
                  })}

                  {/* Smart Overflow Badge for 3+ scheduled/published posts */}
                  {overflowUserPostsCount > 0 && (
                    <div
                      className="px-2 py-0.5 rounded-lg bg-teal-50 hover:bg-teal-100 border-teal-300 text-teal-900 dark:bg-slate-900/90 dark:hover:bg-teal-950/80 dark:backdrop-blur-md dark:border-teal-500/40 dark:text-teal-300 border text-[9px] font-bold flex items-center justify-between gap-1 truncate shadow-xs transition-all cursor-pointer group/pill"
                      title={`${overflowUserPostsCount} more scheduled/published post${overflowUserPostsCount > 1 ? "s" : ""} on this date. Click to view all.`}
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 shrink-0 animate-pulse" />
                        <span className="text-teal-900 dark:text-teal-300">+{overflowUserPostsCount} more post{overflowUserPostsCount > 1 ? "s" : ""}</span>
                      </span>
                      <span className="text-[8px] text-teal-700 group-hover/pill:text-teal-900 dark:text-teal-400/80 dark:group-hover/pill:text-teal-200 uppercase font-mono tracking-wider shrink-0 font-bold">
                        View →
                      </span>
                    </div>
                  )}

                  {/* Festival & Attached Templates Badges */}
                  {hasFestivals && (
                    <div className="space-y-1">
                      {visibleFestivals.map((fest) => {
                        const templateCount = Math.max(
                          fest._count?.templates ?? 0,
                          Array.isArray(fest.templates) ? fest.templates.length : 0
                        );
                        return (
                          <div
                            key={fest.id}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center justify-between gap-1 truncate shadow-md ${
                              bannerUrl
                                ? "bg-slate-950/90 backdrop-blur-md border border-slate-700/70 text-amber-300"
                                : "bg-amber-500/25 backdrop-blur-md border border-amber-500/50 text-amber-200"
                            }`}
                          >
                            <span className="truncate">{fest.name}</span>
                            {templateCount > 0 && (
                              <span
                                className="px-1.5 py-0.5 rounded-md bg-purple-600 text-white font-mono text-[9px] font-black shrink-0 border border-purple-400/40 shadow-sm"
                                title={`${templateCount} Templates`}
                              >
                                {templateCount}
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {overflowFestivalsCount > 0 && (
                        <div
                          className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-extrabold text-center truncate shadow-sm"
                          title={`${overflowFestivalsCount} more festival(s) on this date`}
                        >
                          +{overflowFestivalsCount} more
                        </div>
                      )}
                    </div>
                  )}

                  {!hasEvents && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-slate-500 flex items-center gap-1 justify-center py-1">
                      {isAdmin ? (
                        <>
                          <Plus className="w-3 h-3 text-amber-400" />
                          <span>Add Festival</span>
                        </>
                      ) : (
                        <span>No Event</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Selected Day Details & Scheduled Queue Drawer Modal */}
      {selectedDayDetails &&
        createPortal(
          <div className="modal-backdrop-overlay fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div
              className="max-w-4xl w-full max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border"
              style={{
                backgroundColor: isDark ? "#131B2A" : "#FFFFFF",
                borderColor: isDark ? "#2C384E" : "#E2E8F0",
              }}
            >
              {/* Drawer Top Header */}
              <div
                className="p-6 border-b flex items-center justify-between"
                style={{ borderColor: isDark ? "#2C384E" : "#E2E8F0" }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className="font-heading font-bold text-lg"
                      style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}
                    >
                      Day Details — {selectedDayDetails.dateKey}
                    </h3>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: isDark ? "#94A3B8" : "#64748B" }}
                    >
                      {safeSelectedFestivals.length > 0
                        ? `${safeSelectedFestivals.length} Festival${safeSelectedFestivals.length > 1 ? "s" : ""} • ${modalDayTotalTemplates} Graphic Template${modalDayTotalTemplates === 1 ? "" : "s"} for this day`
                        : "Explore festival graphics, queued scheduled posts, and live publications for this day."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin && onAddFestival && (
                    <Button
                      size="sm"
                      variant="primary"
                      icon={Plus}
                      onClick={() => {
                        onAddFestival(selectedDayDetails.dateKey);
                        setSelectedDayDetails(null);
                      }}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs py-1.5 shadow-md"
                    >
                      Add Festival
                    </Button>
                  )}
                  <button
                    onClick={() => setSelectedDayDetails(null)}
                    className="p-2 rounded-lg transition cursor-pointer"
                    style={{
                      backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                      color: isDark ? "#CBD5E1" : "#475569",
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Body Scroll Container */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                {/* 1. Scheduled Posts for this Day */}
                {safeScheduledPosts.length > 0 && (
                  <div className="space-y-3">
                    <div
                      className="border-b pb-2"
                      style={{ borderColor: isDark ? "#1E293B" : "#E2E8F0" }}
                    >
                      <h4 className="font-heading font-bold text-sm text-teal-500 dark:text-teal-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Scheduled Posts Queue ({safeScheduledPosts.length})
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {safeScheduledPosts.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl border flex items-center justify-between gap-3"
                          style={{
                            backgroundColor: isDark ? "#0B0F17" : "#F8FAFC",
                            borderColor: isDark ? "#2C384E" : "#E2E8F0",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {item.post?.finalGraphicUrl && (
                              <img
                                src={item.post.finalGraphicUrl}
                                alt="Scheduled graphic"
                                className="w-12 h-12 rounded-lg object-cover border"
                                style={{ borderColor: isDark ? "#2C384E" : "#E2E8F0" }}
                              />
                            )}
                            <div>
                              <p
                                className="text-xs font-bold"
                                style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}
                              >
                                {item.post?.occasionName || item.post?.template?.title || "Scheduled Graphic"}
                              </p>
                              <p className="text-[11px] text-teal-600 dark:text-teal-400 font-mono mt-0.5">
                                Scheduled Time: {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {item.targetPlatforms && item.targetPlatforms.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  {item.targetPlatforms.map((p) => (
                                    <span
                                      key={p}
                                      className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border"
                                      style={{
                                        backgroundColor: isDark ? "#1E293B" : "#E2E8F0",
                                        color: isDark ? "#CBD5E1" : "#334155",
                                        borderColor: isDark ? "#334155" : "#CBD5E1",
                                      }}
                                    >
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-300 border border-teal-500/40 text-[10px] font-extrabold uppercase">
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Published Posts for this Day */}
                {safePublishedPosts.length > 0 && (
                  <div className="space-y-3">
                    <h4
                      className="font-heading font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2 border-b pb-2"
                      style={{ borderColor: isDark ? "#1E293B" : "#E2E8F0" }}
                    >
                      <CheckCircle2 className="w-4 h-4" /> Published Posts ({safePublishedPosts.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {safePublishedPosts.map((post) => (
                        <div
                          key={post.id}
                          className="p-3 rounded-xl border flex items-center gap-3"
                          style={{
                            backgroundColor: isDark ? "#0B0F17" : "#F8FAFC",
                            borderColor: isDark ? "#2C384E" : "#E2E8F0",
                          }}
                        >
                          {post.finalGraphicUrl && (
                            <img
                              src={post.finalGraphicUrl}
                              alt="Published Graphic"
                              className="w-12 h-12 rounded-lg object-cover border"
                              style={{ borderColor: isDark ? "#2C384E" : "#E2E8F0" }}
                            />
                          )}
                          <div>
                            <p
                              className="text-xs font-bold line-clamp-1"
                              style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}
                            >
                              {post.occasionName || post.template?.title || post.festival?.name || "Live Social Post"}
                            </p>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">🚀 Successfully Published</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. National Festivals & Custom Templates Showcase */}
                {safeSelectedFestivals.length > 0 ? (
                  <div className="space-y-6">
                    {/* Multi-Festival Filter Tabs (When 2 or more festivals occur on the same day) */}
                    {safeSelectedFestivals.length > 1 && (
                      <div
                        className="flex items-center gap-2 overflow-x-auto pb-2 border-b custom-scrollbar"
                        style={{ borderColor: isDark ? "#2C384E" : "#E2E8F0" }}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedFestivalTab && setSelectedFestivalTab("all")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-2 cursor-pointer ${
                            selectedFestivalTab === "all"
                              ? "bg-amber-500 text-slate-950 shadow-md font-black"
                              : "border hover:border-slate-400"
                          }`}
                          style={
                            selectedFestivalTab === "all"
                              ? {}
                              : {
                                  backgroundColor: isDark ? "#0B0F17" : "#F1F5F9",
                                  color: isDark ? "#CBD5E1" : "#475569",
                                  borderColor: isDark ? "#2C384E" : "#E2E8F0",
                                }
                          }
                        >
                          <span>🌟 All Festivals</span>
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                              selectedFestivalTab === "all"
                                ? "bg-slate-950/20 text-slate-950 font-black"
                                : isDark
                                ? "bg-slate-800 text-amber-300"
                                : "bg-slate-200 text-amber-700"
                            }`}
                          >
                            {modalDayTotalTemplates}
                          </span>
                        </button>

                        {safeSelectedFestivals.map((fest) => {
                          const isTabActive = selectedFestivalTab === fest.id;
                          const count = Math.max(
                            fest._count?.templates ?? 0,
                            Array.isArray(fest.templates) ? fest.templates.length : 0
                          );
                          return (
                            <button
                              key={fest.id}
                              type="button"
                              onClick={() => setSelectedFestivalTab && setSelectedFestivalTab(fest.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-2 cursor-pointer ${
                                isTabActive
                                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                                  : "border hover:border-slate-400"
                              }`}
                              style={
                                isTabActive
                                  ? {}
                                  : {
                                      backgroundColor: isDark ? "#0B0F17" : "#F1F5F9",
                                      color: isDark ? "#CBD5E1" : "#475569",
                                      borderColor: isDark ? "#2C384E" : "#E2E8F0",
                                    }
                              }
                            >
                              <span>🪔 {fest.name}</span>
                              <span
                                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                                  isTabActive
                                    ? "bg-slate-950/20 text-slate-950 font-black"
                                    : isDark
                                    ? "bg-purple-900/50 text-purple-300 border border-purple-500/30"
                                    : "bg-purple-100 text-purple-700 border border-purple-300"
                                }`}
                              >
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Render Each Festival and Its Specific Templates */}
                    {festivalsToRender.map((fest) => {
                      const festTemplates =
                        selectedFestivalTab === fest.id && paginatedFestivalTemplates?.length > 0
                          ? paginatedFestivalTemplates
                          : Array.isArray(fest.templates)
                            ? fest.templates
                            : [];

                      const festCount = Math.max(
                        fest._count?.templates ?? 0,
                        festTemplates.length
                      );

                      return (
                        <div
                          key={fest.id}
                          className="p-5 rounded-2xl border space-y-4 shadow-lg"
                          style={{
                            backgroundColor: isDark ? "#0B0F17" : "#F8FAFC",
                            borderColor: isDark ? "#2C384E" : "#E2E8F0",
                          }}
                        >
                          {/* Banner preview if available - Responsive Unclipped Rectangle View */}
                          {fest.bannerUrl && (
                            <div
                              className="w-full rounded-2xl overflow-hidden relative border mb-3 flex items-center justify-center shadow-lg"
                              style={{
                                borderColor: isDark ? "#2C384E" : "#E2E8F0",
                                backgroundColor: isDark ? "rgba(2, 6, 23, 0.8)" : "#FFFFFF",
                              }}
                            >
                              <img
                                src={fest.bannerUrl}
                                alt={fest.name}
                                className="w-full max-h-[300px] sm:max-h-[360px] object-contain rounded-xl"
                              />
                            </div>
                          )}

                          {/* Festival Header Bar */}
                          <div
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3"
                            style={{ borderColor: isDark ? "#1E293B" : "#E2E8F0" }}
                          >
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4
                                  className="font-heading font-extrabold text-lg"
                                  style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}
                                >
                                  {fest.name}
                                </h4>
                                {fest.targetRegion && (
                                  <span
                                    className="px-2 py-0.5 rounded-full border text-[10px] font-semibold"
                                    style={{
                                      backgroundColor: isDark ? "#1E293B" : "#E2E8F0",
                                      color: isDark ? "#CBD5E1" : "#334155",
                                      borderColor: isDark ? "#334155" : "#CBD5E1",
                                    }}
                                  >
                                    📍 {fest.targetRegion}
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold">
                                  {festCount} Template{festCount === 1 ? "" : "s"}
                                </span>
                              </div>
                              <p
                                className="text-xs mt-1"
                                style={{ color: isDark ? "#94A3B8" : "#64748B" }}
                              >
                                {fest.description || "Special occasion / festive celebration."}
                              </p>
                            </div>

                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteFestival(fest.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition self-start sm:self-center cursor-pointer"
                                title="Delete Festival"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Search bar when filtered to single festival */}
                          {selectedFestivalTab === fest.id && (
                            <div className="relative">
                              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                              <input
                                type="text"
                                placeholder={`Filter templates for ${fest.name}...`}
                                value={festivalTemplateSearch}
                                onChange={(e) => {
                                  setFestivalTemplateSearch(e.target.value);
                                  setFestivalTemplatePage(1);
                                }}
                                className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-amber-400 transition"
                                style={{
                                  backgroundColor: isDark ? "#131B2A" : "#FFFFFF",
                                  borderColor: isDark ? "#2C384E" : "#CBD5E1",
                                  color: isDark ? "#FFFFFF" : "#0F172A",
                                }}
                              />
                            </div>
                          )}

                          {/* Templates Grid */}
                          {festTemplates.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-1">
                              {festTemplates.map((template) => (
                                <div
                                  key={template.id}
                                  className="group relative border rounded-xl overflow-hidden hover:border-amber-500/60 hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
                                  style={{
                                    backgroundColor: isDark ? "#131B2A" : "#FFFFFF",
                                    borderColor: isDark ? "#2C384E" : "#E2E8F0",
                                  }}
                                  onClick={() => {
                                    if (onSelectTemplate) {
                                      onSelectTemplate(template);
                                    }
                                  }}
                                >
                                  <div className="aspect-square relative overflow-hidden bg-slate-950 flex items-center justify-center">
                                    <img
                                      src={template.baseImageUrl}
                                      alt={template.title}
                                      className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                                    />
                                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                      <span className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold shadow-md transform translate-y-1 group-hover:translate-y-0 transition">
                                        Create Post
                                      </span>
                                    </div>
                                  </div>
                                  <div
                                    className="p-2.5 border-t"
                                    style={{
                                      backgroundColor: isDark ? "#131B2A" : "#FFFFFF",
                                      borderColor: isDark ? "#2C384E" : "#E2E8F0",
                                    }}
                                  >
                                    <p
                                      className="text-xs font-bold truncate"
                                      style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}
                                      title={template.title}
                                    >
                                      {template.title}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div
                              className="p-6 text-center text-xs border border-dashed rounded-xl space-y-1"
                              style={{
                                borderColor: isDark ? "#2C384E" : "#CBD5E1",
                                backgroundColor: isDark ? "rgba(19, 27, 42, 0.4)" : "#F1F5F9",
                                color: isDark ? "#94A3B8" : "#64748B",
                              }}
                            >
                              <p
                                className="font-semibold"
                                style={{ color: isDark ? "#CBD5E1" : "#334155" }}
                              >
                                No graphic templates attached to {fest.name} yet.
                              </p>
                              <p style={{ color: isDark ? "#64748B" : "#94A3B8" }}>
                                Graphic templates uploaded for this festival will appear here for one-click post creation.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  safeScheduledPosts.length === 0 &&
                  safePublishedPosts.length === 0 && (
                    <div
                      className="p-12 text-center text-xs"
                      style={{ color: isDark ? "#64748B" : "#94A3B8" }}
                    >
                      No events, scheduled posts, or publications recorded for this date.
                    </div>
                  )
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
