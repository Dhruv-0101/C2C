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
  Zap,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { PostStudioModal } from "./PostStudioModal";

/**
 * FestivalCalendarView
 * Presentational component rendering interactive festival calendar grid, festival badges,
 * user scheduled posts, user published posts, day detail drawer, and template selection modals.
 */
export const FestivalCalendarView = ({
  isAdmin,
  currentDate,
  monthName,
  year,
  prevMonth,
  nextMonth,
  goToToday,
  calendarCells,
  selectedDayDetails,
  setSelectedDayDetails,
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
  triggerScheduledJobs,
  isTriggering,
}) => {
  const safeSelectedFestivals = selectedDayDetails?.festivals || [];
  const safeScheduledPosts = selectedDayDetails?.scheduledPosts || [];
  const safePublishedPosts = selectedDayDetails?.publishedPosts || [];

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
            const hasScheduled = cell.scheduledPosts && cell.scheduledPosts.length > 0;
            const hasPublished = cell.publishedPosts && cell.publishedPosts.length > 0;
            const hasEvents = hasFestivals || hasScheduled || hasPublished;

            return (
              <div
                key={cell.key}
                onClick={() => handleCellClick(cell)}
                className={`min-h-[90px] sm:min-h-[115px] p-2 rounded-xl border transition-all duration-200 flex flex-col justify-between cursor-pointer group ${
                  cell.isToday
                    ? "bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10"
                    : hasEvents
                      ? "bg-[#0B0F17] border-slate-700 hover:border-amber-400 hover:shadow-md"
                      : "bg-[#0B0F17]/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40"
                }`}
              >
                {/* Cell Top Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold ${
                      cell.isToday
                        ? "bg-amber-500 text-slate-950"
                        : "text-slate-300 group-hover:text-amber-400"
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {cell.isToday && (
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-tighter">
                      Today
                    </span>
                  )}
                </div>

                {/* Event & Post Badges Container */}
                <div className="space-y-1 my-1 flex-1 flex flex-col justify-end">
                  {/* Scheduled Posts Badges */}
                  {hasScheduled &&
                    cell.scheduledPosts.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="px-2 py-0.5 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 text-[10px] font-mono font-bold flex items-center justify-between gap-1 truncate"
                      >
                        <span className="truncate">
                          ⏰ {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <Clock className="w-3 h-3 text-teal-400 shrink-0" />
                      </div>
                    ))}

                  {/* Published Posts Badges */}
                  {hasPublished &&
                    cell.publishedPosts.slice(0, 1).map((post) => (
                      <div
                        key={post.id}
                        className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold flex items-center justify-between gap-1 truncate"
                      >
                        <span className="truncate">🚀 Live</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      </div>
                    ))}

                  {/* Festival Badges */}
                  {hasFestivals &&
                    cell.festivals.slice(0, 2).map((fest) => (
                      <div
                        key={fest.id}
                        className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-semibold flex items-center justify-between gap-1 truncate"
                      >
                        <span className="truncate">{fest.name}</span>
                        <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      </div>
                    ))}

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

      {/* SuperAdmin Add Festival Modal */}
      {isAddModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <Card className="max-w-md w-full p-6 bg-[#131B2A] border-[#2C384E] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-heading font-extrabold text-lg text-white">
                  Add Festival Day
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {addFestError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                  {addFestError}
                </div>
              )}

              <form onSubmit={handleSubmitFest(handleAddFestivalSubmit)} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300">Festival Title *</label>
                  <Input
                    {...registerFest("name")}
                    placeholder="e.g. Diwali Celebration"
                    className="mt-1"
                  />
                  {festErrors.name && (
                    <p className="text-[11px] text-rose-400 mt-1">{festErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Festival Date *</label>
                  <Input
                    type="date"
                    {...registerFest("date")}
                    className="mt-1"
                  />
                  {festErrors.date && (
                    <p className="text-[11px] text-rose-400 mt-1">{festErrors.date.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Description</label>
                  <Input
                    {...registerFest("description")}
                    placeholder="Optional details..."
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmittingFest}
                  >
                    Save Festival
                  </Button>
                </div>
              </form>
            </Card>
          </div>,
          document.body,
        )}

      {/* Selected Day Details & Scheduled Queue Drawer Modal */}
      {selectedDayDetails &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <div className="max-w-4xl w-full max-h-[85vh] bg-[#131B2A] border border-[#2C384E] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
              {/* Drawer Top Header */}
              <div className="p-6 border-b border-[#2C384E] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-white">
                      Day Details — {selectedDayDetails.dateKey}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Explore festival graphics, queued scheduled posts, and live publications for this day.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDayDetails(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body Scroll Container */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* 1. Scheduled Posts for this Day */}
                {safeScheduledPosts.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="font-heading font-bold text-sm text-teal-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Scheduled Posts Queue ({safeScheduledPosts.length})
                      </h4>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={Zap}
                        isLoading={isTriggering}
                        onClick={triggerScheduledJobs}
                        className="bg-amber-500 text-slate-950 text-xs py-1"
                      >
                        Test Trigger Now
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {safeScheduledPosts.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            {item.post?.finalGraphicUrl && (
                              <img
                                src={item.post.finalGraphicUrl}
                                alt="Scheduled graphic"
                                className="w-12 h-12 rounded-lg object-cover border border-[#2C384E]"
                              />
                            )}
                            <div>
                              <p className="text-xs font-bold text-white">
                                {item.post?.occasionName || item.post?.customText || "Scheduled Graphic"}
                              </p>
                              <p className="text-[11px] text-teal-400 font-mono mt-0.5">
                                Scheduled Time: {new Date(item.scheduledAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-extrabold uppercase">
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
                    <h4 className="font-heading font-bold text-sm text-emerald-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <CheckCircle2 className="w-4 h-4" /> Published Posts ({safePublishedPosts.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {safePublishedPosts.map((post) => (
                        <div
                          key={post.id}
                          className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] flex items-center gap-3"
                        >
                          {post.finalGraphicUrl && (
                            <img
                              src={post.finalGraphicUrl}
                              alt="Published Graphic"
                              className="w-12 h-12 rounded-lg object-cover border border-[#2C384E]"
                            />
                          )}
                          <div>
                            <p className="text-xs font-bold text-white line-clamp-1">
                              {post.occasionName || post.customText || "Live Social Post"}
                            </p>
                            <span className="text-[10px] text-emerald-400 font-semibold">🚀 Successfully Published</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. National Festivals & Custom Templates Showcase */}
                {safeSelectedFestivals.length > 0 ? (
                  safeSelectedFestivals.map((fest) => {
                    const displayTemplates =
                      paginatedFestivalTemplates ||
                      fest.templates?.filter((t) => t.festivalId === fest.id) ||
                      [];

                    return (
                      <div key={fest.id} className="space-y-4">
                        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                          <div>
                            <h4 className="font-heading font-extrabold text-xl text-white">
                              {fest.name}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">
                              {fest.description || "Special celebration day."}
                            </p>
                          </div>

                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteFestival(fest.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                              title="Delete Festival"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {displayTemplates.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {displayTemplates.map((template) => (
                              <div
                                key={template.id}
                                className="group relative bg-[#0B0F17] border border-[#2C384E] rounded-xl overflow-hidden hover:border-amber-500/50 transition cursor-pointer"
                                onClick={() => {
                                  if (onSelectTemplate) {
                                    onSelectTemplate(template);
                                  } else {
                                    setStudioTemplate(template);
                                    setIsStudioOpen(true);
                                  }
                                }}
                              >
                                <div className="aspect-square relative overflow-hidden bg-slate-950">
                                  <img
                                    src={template.baseImageUrl}
                                    alt={template.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                                    <Button
                                      size="sm"
                                      variant="primary"
                                      icon={Sparkles}
                                      className="w-full text-xs"
                                    >
                                      Create Post
                                    </Button>
                                  </div>
                                </div>
                                <div className="p-2.5">
                                  <p className="text-xs font-bold text-white truncate">
                                    {template.title}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                            No graphic templates available for this festival yet.
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  safeScheduledPosts.length === 0 &&
                  safePublishedPosts.length === 0 && (
                    <div className="p-12 text-center text-slate-500 text-xs">
                      No events, scheduled posts, or publications recorded for this date.
                    </div>
                  )
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Post Studio Modal Overlay */}
      {isStudioOpen && studioTemplate && (
        <PostStudioModal
          template={studioTemplate}
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
        />
      )}
    </div>
  );
};
