import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
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
  LayoutGrid,
  List,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import Pagination from "@/components/ui/Pagination";
import { useTheme, useMediaQuery } from '@/shared/hooks';

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
  const navigate = useNavigate();
  const { isDark } = useTheme();
  // Default to 'grid' (Month Grid) across all screen sizes
  const [activeViewMode, setActiveViewMode] = useState("grid");
  const currentViewMode = activeViewMode || "grid";

  // Escape key listener for day details drawer modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedDayDetails) {
        setSelectedDayDetails(null);
      }
    };
    if (selectedDayDetails) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedDayDetails, setSelectedDayDetails]);

  const safeSelectedFestivals = selectedDayDetails?.festivals || [];
  const rawScheduledPosts = selectedDayDetails?.scheduledPosts || [];
  const safePublishedPosts = selectedDayDetails?.publishedPosts || [];
  const safeCreatedPosts = selectedDayDetails?.createdPosts || [];

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

  // Filter active agenda days (days in current month with festivals, scheduled posts, published posts, or created posts, or today)
  const activeAgendaDays = calendarCells.filter((cell) => {
    if (cell.isPadding) return false;
    const hasFestivals = cell.festivals && cell.festivals.length > 0;
    const hasScheduled = cell.scheduledPosts && cell.scheduledPosts.length > 0;
    const hasPublished = cell.publishedPosts && cell.publishedPosts.length > 0;
    const hasCreated = cell.createdPosts && cell.createdPosts.length > 0;
    return hasFestivals || hasScheduled || hasPublished || hasCreated || cell.isToday;
  });

  const getDayName = (dateKey) => {
    if (!dateKey) return "";
    const parts = dateKey.split("-");
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString("en-US", { weekday: "short" });
    }
    return "";
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4 bg-[#131B2A] border border-[#2C384E] p-3.5 min-[380px]:p-4 sm:p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="font-heading font-extrabold text-lg min-[380px]:text-xl sm:text-2xl text-white tracking-tight break-words">
              Social Media Content Calendar
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
              Explore national festivals, schedule upcoming social media posts, and track live publications.
            </p>
          </div>
        </div>

        {/* Controls: Segmented View Switcher + Month Navigation */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-stretch lg:self-center justify-between sm:justify-end">
          {/* View Mode Toggle: [ 📅 Month Grid ] [ 📋 Agenda ] */}
          <div className="flex items-center p-1 bg-[#0B0F17] rounded-xl border border-[#2C384E] shadow-inner shrink-0">
            <button
              type="button"
              onClick={() => setActiveViewMode("grid")}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentViewMode === "grid"
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Month Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode("agenda")}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentViewMode === "agenda"
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
          </div>

          {/* Month Navigation Controls */}
          <div className="flex items-center gap-0.5 sm:gap-2 bg-[#0B0F17] p-1 sm:p-1.5 rounded-xl border border-[#2C384E] shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevMonth}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-heading font-bold text-xs sm:text-sm text-white px-1.5 sm:px-3 min-w-[95px] sm:min-w-[130px] text-center truncate">
              {monthName} {year}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <div className="h-4 w-px bg-slate-800 mx-0.5 sm:mx-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="text-xs px-2.5 py-1 h-8 text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
            >
              Today
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Responsive Agenda View vs Month Grid */}
      {currentViewMode === "agenda" ? (
        <div className="space-y-4">
          {activeAgendaDays.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center border-[#2C384E] bg-[#131B2A] rounded-2xl space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <CalendarDays className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-extrabold text-lg text-white">
                  No Scheduled Events in {monthName} {year}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  No upcoming festivals or scheduled posts found for this month. You can view the full month grid or jump into AI Post Studio to create a branded post.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveViewMode("grid")}
                  className="text-xs text-slate-300 border-slate-700"
                >
                  <LayoutGrid className="w-3.5 h-3.5 mr-1.5" />
                  View Month Grid
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate("/create-post")}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Create Branded Post
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeAgendaDays.map((cell) => {
                const hasFestivals = cell.festivals && cell.festivals.length > 0;
                const scheduledList = cell.scheduledPosts || [];
                const publishedList = cell.publishedPosts || [];

                // Deduplicate unique user posts
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
                const userPosts = Array.from(postMap.values());

                const totalTemplates = hasFestivals
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

                const weekday = getDayName(cell.dateKey);

                return (
                  <div
                    key={`agenda-${cell.dateKey}`}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      cell.isToday
                        ? "bg-gradient-to-br from-[#131B2A] to-[#1c1810] border-amber-500/60 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/40"
                        : "bg-[#131B2A] border-[#2C384E] hover:border-slate-600 shadow-md"
                    }`}
                  >
                    {/* Agenda Card Header: Date Stamp + Summary Badges */}
                    <div className="p-3.5 sm:p-5 border-b border-[#2C384E]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B0F17]/60">
                      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                        {/* Tactile Date Badge */}
                        <div
                          className={`w-12 h-12 min-[380px]:w-14 min-[380px]:h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center border shrink-0 ${
                            cell.isToday
                              ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/20"
                              : "bg-[#131B2A] border-[#2C384E] text-slate-200"
                          }`}
                        >
                          <span className="text-[9px] min-[380px]:text-[10px] sm:text-xs font-black uppercase tracking-wider opacity-80">
                            {weekday || monthName.slice(0, 3)}
                          </span>
                          <span className="text-lg min-[380px]:text-xl sm:text-2xl font-black leading-none my-0.5">
                            {cell.dayNum}
                          </span>
                          <span className="text-[8.5px] min-[380px]:text-[9px] font-mono opacity-70">
                            {monthName.slice(0, 3).toUpperCase()}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-heading font-extrabold text-sm min-[380px]:text-base sm:text-lg text-white truncate">
                              {cell.dateKey}
                            </h3>
                            {cell.isToday && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-sm animate-pulse shrink-0">
                                ★ Today
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
                            {hasFestivals && (
                              <span className="text-amber-300 font-semibold flex items-center gap-1">
                                <span>🪔</span>
                                <span>{cell.festivals.length} Festival{cell.festivals.length > 1 ? "s" : ""}</span>
                              </span>
                            )}
                            {totalTemplates > 0 && (
                              <span className="text-purple-300 font-semibold flex items-center gap-1">
                                <span>🎨</span>
                                <span>{totalTemplates} Template{totalTemplates > 1 ? "s" : ""}</span>
                              </span>
                            )}
                            {userPosts.length > 0 && (
                              <span className="text-teal-300 font-semibold flex items-center gap-1">
                                <span>⏰</span>
                                <span>{userPosts.length} Post{userPosts.length > 1 ? "s" : ""}</span>
                              </span>
                            )}
                            {!hasFestivals && userPosts.length === 0 && cell.isToday && (
                              <span className="text-slate-400">Available day for new social posts</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto self-start sm:self-center pt-1 sm:pt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCellClick(cell)}
                          className="w-full sm:w-auto text-xs h-9 px-3 justify-center text-slate-200 border-slate-700 hover:border-amber-400 hover:text-white shrink-0"
                        >
                          <span>Day Details</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>

                    {/* Agenda Card Body */}
                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Festivals List on this Day */}
                      {hasFestivals && (
                        <div className="space-y-3">
                          {cell.festivals.map((fest) => {
                            const festTemplateCount = Math.max(
                              fest._count?.templates ?? 0,
                              Array.isArray(fest.templates) ? fest.templates.length : 0
                            );
                            const previewTemplates = Array.isArray(fest.templates)
                              ? fest.templates.slice(0, 4)
                              : [];

                            return (
                              <div
                                key={fest.id}
                                className="p-3.5 sm:p-4 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-3"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-lg">🪔</span>
                                    <h4 className="font-heading font-extrabold text-sm sm:text-base text-amber-300">
                                      {fest.name}
                                    </h4>
                                    {fest.targetRegion && (
                                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold">
                                        📍 {fest.targetRegion}
                                      </span>
                                    )}
                                    {festTemplateCount > 0 && (
                                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold">
                                        🎨 {festTemplateCount} Templates
                                      </span>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleCellClick(cell)}
                                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 self-start sm:self-center cursor-pointer"
                                  >
                                    <span>Browse All Templates</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>

                                {fest.bannerUrl && (
                                  <div className="w-full max-h-36 sm:max-h-44 rounded-xl overflow-hidden border border-[#2C384E]">
                                    <img
                                      src={fest.bannerUrl}
                                      alt={fest.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}

                                {fest.description && (
                                  <p className="text-xs text-slate-400">
                                    {fest.description}
                                  </p>
                                )}

                                {/* Preview Graphic Templates (Quick 1-Click Launch) */}
                                {previewTemplates.length > 0 && (
                                  <div className="space-y-1.5 pt-1">
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                      Quick Templates:
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 min-[380px]:gap-2.5">
                                      {previewTemplates.map((tpl) => (
                                        <div
                                          key={tpl.id}
                                          onClick={() => {
                                            if (onSelectTemplate) {
                                              onSelectTemplate(tpl);
                                            } else {
                                              navigate("/create-post", {
                                                state: { template: tpl, festivalId: fest.id },
                                              });
                                            }
                                          }}
                                          className="group relative border border-[#2C384E] hover:border-amber-400 rounded-xl overflow-hidden bg-[#131B2A] transition cursor-pointer flex flex-col min-w-0"
                                        >
                                          <div className="aspect-square bg-slate-950 flex items-center justify-center overflow-hidden">
                                            <img
                                              src={tpl.baseImageUrl}
                                              alt={tpl.title}
                                              className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                                            />
                                          </div>
                                          <div className="p-1.5 min-[380px]:p-2 border-t border-[#2C384E] flex items-center justify-between gap-1 min-w-0">
                                            <span className="text-[10px] min-[380px]:text-[11px] font-bold text-slate-200 truncate">
                                              {tpl.title}
                                            </span>
                                            <span className="text-[9.5px] min-[380px]:text-[10px] text-amber-400 font-bold shrink-0">
                                              Use →
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Scheduled Posts for this Day */}
                      {scheduledList.length > 0 && (
                        <div className="p-3.5 sm:p-4 rounded-xl bg-teal-500/5 border border-teal-500/20 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <h4 className="font-heading font-bold text-xs sm:text-sm text-teal-400 flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-teal-400" />
                              <span>Scheduled Posts Queue ({scheduledList.length})</span>
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {scheduledList.map((item) => (
                              <div
                                key={`agenda-sched-${item.id}`}
                                className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] flex items-center gap-3"
                              >
                                {item.post?.finalGraphicUrl ? (
                                  <img
                                    src={item.post.finalGraphicUrl}
                                    alt="Scheduled graphic"
                                    className="w-12 h-12 rounded-lg object-cover border border-[#2C384E] shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-slate-900 border border-[#2C384E] flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5 text-teal-400" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-white truncate">
                                    {item.post?.occasionName || item.post?.template?.title || "Scheduled Post"}
                                  </p>
                                  <p className="text-[11px] text-teal-400 font-mono mt-0.5">
                                    ⏰ {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                  {item.targetPlatforms && item.targetPlatforms.length > 0 && (
                                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                                      {item.targetPlatforms.map((p) => (
                                        <span
                                          key={p}
                                          className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700"
                                        >
                                          {p}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Published Posts for this Day */}
                      {publishedList.length > 0 && (
                        <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2.5">
                          <h4 className="font-heading font-bold text-xs sm:text-sm text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Live Published Posts ({publishedList.length})</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {publishedList.map((post) => (
                              <div
                                key={`agenda-pub-${post.id}`}
                                className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] flex items-center gap-3"
                              >
                                {post.finalGraphicUrl && (
                                  <img
                                    src={post.finalGraphicUrl}
                                    alt="Published graphic"
                                    className="w-12 h-12 rounded-lg object-cover border border-[#2C384E] shrink-0"
                                  />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-white truncate">
                                    {post.occasionName || post.template?.title || "Published Graphic"}
                                  </p>
                                  <span className="text-[10px] text-emerald-400 font-semibold">
                                    🚀 Live on Social Media
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Today Open State when no festival / scheduled */}
                      {!hasFestivals && scheduledList.length === 0 && publishedList.length === 0 && cell.isToday && (
                        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                            <p className="text-xs text-slate-300">
                              Today is completely free. Launch the Post Studio to create a prompt-based post with Nano Banana 2.1 or pick a festival template.
                            </p>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate("/create-post")}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0"
                          >
                            Create Post
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Main Calendar Month Grid */
        <Card className="border-[#2C384E] bg-[#131B2A] p-2 sm:p-5 lg:p-6 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar -mx-0.5 sm:mx-0 px-0.5 sm:px-0">
            <div className="min-w-[560px] md:min-w-full">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
              <div
                key={day}
                className={`py-1.5 sm:py-2.5 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider rounded-lg sm:rounded-xl border ${
                  idx === 0 || idx === 6
                    ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
                    : "text-slate-200 bg-[#0B0F17] border-[#2C384E]"
                }`}
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 2)}</span>
              </div>
            ))}
          </div>

          {/* Days Grid Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2.5">
            {calendarCells.map((cell) => {
              if (cell.isPadding) {
                return (
                  <div
                    key={cell.key}
                    className="min-h-[64px] sm:min-h-[110px] rounded-lg sm:rounded-xl bg-slate-900/20 border border-slate-800/30 opacity-40 pointer-events-none"
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
                  className={`relative min-h-[64px] sm:min-h-[115px] p-1 sm:p-2 rounded-lg sm:rounded-xl border transition-all duration-200 flex flex-col justify-between cursor-pointer group overflow-hidden ${
                    cell.isToday
                      ? "bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10"
                      : hasEvents
                        ? "bg-[#0B0F17] border-slate-700 hover:border-amber-400 hover:shadow-md"
                        : "bg-[#0B0F17]/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40"
                  }`}
                >
                  {/* Festival Cover Banner Background Overlay */}
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
                      className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-xs font-extrabold ${
                        cell.isToday
                          ? "bg-amber-500 text-slate-950 font-black shadow-md"
                          : bannerUrl
                            ? "text-white bg-slate-950/80 backdrop-blur-md border border-white/20 group-hover:text-amber-400 shadow-md"
                            : "text-slate-300 group-hover:text-amber-400"
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    <div className="flex items-center gap-0.5 sm:gap-1">
                      {dayTotalTemplates > 0 && (
                        <span
                          className="px-1 sm:px-1.5 py-0.5 rounded-md bg-purple-600/90 text-white font-mono text-[8px] sm:text-[9px] font-black shadow-sm flex items-center gap-0.5 sm:gap-1 border border-purple-400/40"
                          title={`${dayTotalTemplates} Graphic Templates on this date`}
                        >
                          <span>🎨</span>
                          <span>{dayTotalTemplates}</span>
                        </span>
                      )}
                      {cell.isToday && (
                        <span className="text-[8px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-tighter bg-slate-950/85 backdrop-blur-md px-1 sm:px-1.5 py-0.5 rounded-full border border-amber-500/40 shadow-md">
                          <span className="hidden sm:inline">Today</span>
                          <span className="sm:hidden">★</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Event & Post Badges Container */}
                  <div className="relative z-10 space-y-0.5 sm:space-y-1 my-0.5 sm:my-1 flex-1 flex flex-col justify-end">
                    {/* Visible User Posts (Scheduled / Published) */}
                    {visibleUserPosts.map((postItem) => {
                      if (postItem.type === "scheduled") {
                        const item = postItem.data;
                        return (
                          <div
                            key={`sched-${item.id}`}
                            className="px-1 sm:px-2 py-0.5 rounded sm:rounded-lg bg-teal-50 border-teal-300 text-teal-900 dark:bg-teal-500/30 dark:backdrop-blur-md dark:border-teal-500/50 dark:text-teal-200 border text-[8.5px] sm:text-[10px] font-mono font-bold flex items-center justify-between gap-0.5 sm:gap-1 truncate shadow-xs transition-all"
                            title={`Scheduled: ${new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          >
                            <span className="truncate text-teal-900 dark:text-teal-200 font-bold">
                              ⏰ <span className="hidden sm:inline">{new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="sm:hidden">{new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit' })}</span>
                            </span>
                            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-teal-700 dark:text-teal-300 shrink-0" />
                          </div>
                        );
                      }
                      const post = postItem.data;
                      return (
                        <div
                          key={`pub-${post.id}`}
                          className="px-1 sm:px-2 py-0.5 rounded sm:rounded-lg bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-500/30 dark:backdrop-blur-md dark:border-emerald-500/50 dark:text-emerald-200 border text-[8.5px] sm:text-[10px] font-semibold flex items-center justify-between gap-0.5 sm:gap-1 truncate shadow-xs transition-all"
                          title="Published Live Post"
                        >
                          <span className="truncate text-emerald-900 dark:text-emerald-200 font-bold">🚀 Live</span>
                          <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-700 dark:text-emerald-300 shrink-0" />
                        </div>
                      );
                    })}

                    {/* Smart Overflow Badge for 3+ scheduled/published posts */}
                    {overflowUserPostsCount > 0 && (
                      <div
                        className="px-1 sm:px-2 py-0.5 rounded sm:rounded-lg bg-teal-50 hover:bg-teal-100 border-teal-300 text-teal-900 dark:bg-slate-900/90 dark:hover:bg-teal-950/80 dark:backdrop-blur-md dark:border-teal-500/40 dark:text-teal-300 border text-[8px] sm:text-[9px] font-bold flex items-center justify-between gap-1 truncate shadow-xs transition-all cursor-pointer group/pill"
                        title={`${overflowUserPostsCount} more scheduled/published post${overflowUserPostsCount > 1 ? "s" : ""} on this date. Click to view all.`}
                      >
                        <span className="truncate flex items-center gap-1">
                          <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 shrink-0 animate-pulse" />
                          <span className="text-teal-900 dark:text-teal-300">+{overflowUserPostsCount} <span className="hidden sm:inline">more</span></span>
                        </span>
                        <span className="text-[7.5px] sm:text-[8px] text-teal-700 group-hover/pill:text-teal-900 dark:text-teal-400/80 dark:group-hover/pill:text-teal-200 uppercase font-mono tracking-wider shrink-0 font-bold">
                          →
                        </span>
                      </div>
                    )}

                    {/* Festival & Attached Templates Badges */}
                    {hasFestivals && (
                      <div className="space-y-0.5 sm:space-y-1">
                        {visibleFestivals.map((fest) => {
                          const templateCount = Math.max(
                            fest._count?.templates ?? 0,
                            Array.isArray(fest.templates) ? fest.templates.length : 0
                          );
                          return (
                            <div
                              key={fest.id}
                              className={`px-1 sm:px-2 py-0.5 rounded sm:rounded-lg text-[8.5px] sm:text-[10px] font-bold flex items-center justify-between gap-0.5 sm:gap-1 truncate shadow-md ${
                                bannerUrl
                                  ? "bg-slate-950/90 backdrop-blur-md border border-slate-700/70 text-amber-300"
                                  : "bg-amber-500/25 backdrop-blur-md border border-amber-500/50 text-amber-200"
                              }`}
                            >
                              <span className="truncate">{fest.name}</span>
                              {templateCount > 0 && (
                                <span
                                  className="px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded bg-purple-600 text-white font-mono text-[8px] sm:text-[9px] font-black shrink-0 border border-purple-400/40 shadow-sm"
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
                            className="px-1 sm:px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[8px] sm:text-[9px] font-extrabold text-center truncate shadow-sm"
                            title={`${overflowFestivalsCount} more festival(s) on this date`}
                          >
                            +{overflowFestivalsCount}
                          </div>
                        )}
                      </div>
                    )}

                    {!hasEvents && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-slate-500 flex items-center gap-1 justify-center py-0.5">
                        {isAdmin ? (
                          <>
                            <Plus className="w-3 h-3 text-amber-400" />
                            <span className="hidden sm:inline">Add</span>
                          </>
                        ) : (
                          <span className="hidden sm:inline">No Event</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
            </div>
          </div>
        </Card>
      )}

      {/* Selected Day Details & Scheduled Queue Drawer Modal */}
      {selectedDayDetails &&
        createPortal(
          <div
            className="modal-backdrop-overlay fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedDayDetails(null);
            }}
          >
            <div
              className="max-w-4xl w-full max-h-[92dvh] sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border"
              style={{
                backgroundColor: isDark ? "#131B2A" : "#FFFFFF",
                borderColor: isDark ? "#2C384E" : "#E2E8F0",
              }}
            >
              {/* Drawer Top Header */}
              <div
                className="p-3.5 sm:p-6 border-b flex items-center justify-between gap-2.5 sm:gap-3 shrink-0"
                style={{ borderColor: isDark ? "#2C384E" : "#E2E8F0" }}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="p-2 sm:p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 shrink-0">
                    <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3
                      className="font-heading font-bold text-sm min-[380px]:text-base sm:text-lg truncate"
                      style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}
                    >
                      Day Details — {selectedDayDetails.dateKey}
                    </h3>
                    <p
                      className="text-[10px] min-[380px]:text-[11px] sm:text-xs mt-0.5 line-clamp-1"
                      style={{ color: isDark ? "#94A3B8" : "#64748B" }}
                    >
                      {safeSelectedFestivals.length > 0
                        ? `${safeSelectedFestivals.length} Festival${safeSelectedFestivals.length > 1 ? "s" : ""} • ${modalDayTotalTemplates} Graphic Template${modalDayTotalTemplates === 1 ? "" : "s"} for this day`
                        : "Explore festival graphics, queued scheduled posts, and live publications for this day."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isAdmin && onAddFestival && (
                    <Button
                      size="sm"
                      variant="primary"
                      icon={Plus}
                      onClick={() => {
                        onAddFestival(selectedDayDetails.dateKey);
                        setSelectedDayDetails(null);
                      }}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs py-1.5 shadow-md hidden sm:inline-flex"
                    >
                      Add Festival
                    </Button>
                  )}
                  <button
                    onClick={() => setSelectedDayDetails(null)}
                    aria-label="Close"
                    className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl transition cursor-pointer hover:bg-slate-800"
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
              <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 custom-scrollbar">

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
                      const isCurrentFestActive =
                        selectedFestivalTab === fest.id ||
                        safeSelectedFestivals.length === 1;

                      let festTemplates = [];
                      let currentMeta = null;

                      if (
                        isCurrentFestActive &&
                        paginatedFestivalTemplates &&
                        paginatedFestivalTemplates.length > 0
                      ) {
                        festTemplates = paginatedFestivalTemplates;
                        currentMeta = festivalTemplatesMeta;
                      } else if (Array.isArray(fest.templates)) {
                        const allTemplates = fest.templates;
                        const startIndex = (festivalTemplatePage - 1) * festivalTemplateLimit;
                        festTemplates = allTemplates.slice(
                          startIndex,
                          startIndex + festivalTemplateLimit
                        );
                        currentMeta = {
                          page: festivalTemplatePage,
                          limit: festivalTemplateLimit,
                          totalItems: allTemplates.length,
                          totalPages: Math.ceil(allTemplates.length / festivalTemplateLimit),
                          hasNextPage:
                            festivalTemplatePage <
                            Math.ceil(allTemplates.length / festivalTemplateLimit),
                          hasPrevPage: festivalTemplatePage > 1,
                        };
                      }

                      const festCount = Math.max(
                        fest._count?.templates ?? 0,
                        fest.templates?.length || 0,
                        currentMeta?.totalItems ?? 0
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
                                  {festCount} Unique Template{festCount === 1 ? "" : "s"}
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

                          {/* Search bar when filtered to single festival or active festival */}
                          {isCurrentFestActive && festCount > 0 && (
                            <div className="relative">
                              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                              <input
                                type="text"
                                placeholder={`Filter & search among ${festCount} templates for ${fest.name}...`}
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

                          {/* Templates Grid with Loading Skeleton & Central Pagination */}
                          {isLoadingFestivalTemplates && isCurrentFestActive ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-1">
                              {Array.from({ length: festivalTemplateLimit }).map((_, i) => (
                                <div
                                  key={`skel-tpl-${i}`}
                                  className="aspect-square rounded-xl animate-pulse"
                                  style={{ backgroundColor: isDark ? "#1E293B" : "#E2E8F0" }}
                                />
                              ))}
                            </div>
                          ) : festTemplates.length > 0 ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 min-[380px]:gap-3.5 pt-1">
                                {festTemplates.map((template) => (
                                  <div
                                    key={template.id}
                                    className="group relative border rounded-xl overflow-hidden hover:border-amber-500/60 hover:shadow-lg transition cursor-pointer flex flex-col justify-between min-w-0"
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
                                        <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-amber-500 text-slate-950 text-[11px] sm:text-xs font-bold shadow-md transform translate-y-1 group-hover:translate-y-0 transition">
                                          Create Post
                                        </span>
                                      </div>
                                    </div>
                                    <div
                                      className="p-1.5 min-[380px]:p-2 sm:p-2.5 border-t"
                                      style={{
                                        backgroundColor: isDark ? "#131B2A" : "#FFFFFF",
                                        borderColor: isDark ? "#2C384E" : "#E2E8F0",
                                      }}
                                    >
                                      <p
                                        className="text-[11px] sm:text-xs font-bold truncate"
                                        style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}
                                        title={template.title}
                                      >
                                        {template.title}
                                      </p>
                                      <span className="sm:hidden mt-0.5 inline-flex items-center gap-1 text-[9.5px] min-[380px]:text-[10px] font-bold text-amber-400">
                                        Tap to Create →
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Central Pagination Controls */}
                              {festTemplates.length > 0 && (
                                <Pagination
                                  meta={
                                    currentMeta || {
                                      page: festivalTemplatePage,
                                      limit: festivalTemplateLimit,
                                      totalItems: festCount,
                                      totalPages: Math.max(1, Math.ceil(festCount / festivalTemplateLimit)),
                                      hasNextPage:
                                        festivalTemplatePage <
                                        Math.ceil(festCount / festivalTemplateLimit),
                                      hasPrevPage: festivalTemplatePage > 1,
                                    }
                                  }
                                  currentPage={festivalTemplatePage}
                                  totalPages={
                                    currentMeta?.totalPages ||
                                    Math.max(1, Math.ceil(festCount / festivalTemplateLimit))
                                  }
                                  onPageChange={(newPage) =>
                                    setFestivalTemplatePage && setFestivalTemplatePage(newPage)
                                  }
                                  onLimitChange={(newLimit) => {
                                    if (setFestivalTemplateLimit) setFestivalTemplateLimit(newLimit);
                                    if (setFestivalTemplatePage) setFestivalTemplatePage(1);
                                  }}
                                  pageSizeOptions={[8, 12, 16, 24]}
                                />
                              )}
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
                  safePublishedPosts.length === 0 &&
                  safeCreatedPosts.length === 0 && (
                    <div
                      className="p-12 text-center text-xs"
                      style={{ color: isDark ? "#64748B" : "#94A3B8" }}
                    >
                      No events, scheduled posts, or publications recorded for this date.
                    </div>
                  )
                )}

                {/* 4. Your Work Today / On This Day */}
                {(safeCreatedPosts.length > 0 || selectedDayDetails.isToday) && (
                  <div
                    className="space-y-3 pt-4 border-t"
                    style={{ borderColor: isDark ? "#2C384E" : "#E2E8F0" }}
                  >
                    <div className="flex items-center justify-between">
                      <h4
                        className="font-heading font-bold text-sm flex items-center gap-2"
                        style={{ color: isDark ? "#F59E0B" : "#D97706" }}
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>
                          {selectedDayDetails.isToday
                            ? "Your Work Today"
                            : `Your Work on This Day (${safeCreatedPosts.length})`}
                        </span>
                      </h4>
                      {safeCreatedPosts.length > 0 && (
                        <span
                          className="text-[11px] font-mono px-2 py-0.5 rounded-full border"
                          style={{
                            backgroundColor: isDark ? "#0B0F17" : "#F1F5F9",
                            borderColor: isDark ? "#2C384E" : "#CBD5E1",
                            color: isDark ? "#94A3B8" : "#64748B",
                          }}
                        >
                          {safeCreatedPosts.length} post{safeCreatedPosts.length > 1 ? "s" : ""} crafted
                        </span>
                      )}
                    </div>

                    {safeCreatedPosts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {safeCreatedPosts.map((post) => {
                          const sched = post.scheduledPost;
                          const isLive = post.status === "PUBLISHED" || sched?.status === "SUCCESS";
                          const hasSchedule = Boolean(sched?.scheduledAt);

                          return (
                            <div
                              key={`created-${post.id}`}
                              className="p-3 rounded-xl border flex items-center gap-3 transition hover:border-amber-500/50"
                              style={{
                                backgroundColor: isDark ? "#0B0F17" : "#F8FAFC",
                                borderColor: isDark ? "#2C384E" : "#E2E8F0",
                              }}
                            >
                              {post.finalGraphicUrl ? (
                                <img
                                  src={post.finalGraphicUrl}
                                  alt="Crafted Graphic"
                                  className="w-12 h-12 rounded-lg object-cover border shrink-0"
                                  style={{ borderColor: isDark ? "#2C384E" : "#E2E8F0" }}
                                />
                              ) : (
                                <div
                                  className="w-12 h-12 rounded-lg border flex items-center justify-center shrink-0"
                                  style={{
                                    backgroundColor: isDark ? "#131B2A" : "#F1F5F9",
                                    borderColor: isDark ? "#2C384E" : "#E2E8F0",
                                  }}
                                >
                                  <ImageIcon className="w-5 h-5 text-slate-500" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <p
                                  className="text-xs font-bold line-clamp-1"
                                  style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}
                                  title={post.occasionName || post.template?.title || "Branded Graphic"}
                                >
                                  {post.occasionName || post.template?.title || "Branded Graphic"}
                                </p>

                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                  Created: {new Date(post.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>

                                <div className="pt-0.5">
                                  {isLive ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                                      {hasSchedule && sched?.publishedAt
                                        ? `Live on ${new Date(sched.publishedAt).toLocaleDateString([], { month: "short", day: "numeric" })}`
                                        : "Live (Published)"}
                                    </span>
                                  ) : hasSchedule ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                                      <Clock className="w-3 h-3 shrink-0" />
                                      Scheduled for {new Date(sched.scheduledAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                                      Draft Graphic
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        className="p-4 rounded-xl border border-dashed text-center text-xs space-y-0.5"
                        style={{
                          backgroundColor: isDark ? "rgba(11, 15, 23, 0.4)" : "#F8FAFC",
                          borderColor: isDark ? "#2C384E" : "#E2E8F0",
                          color: isDark ? "#94A3B8" : "#64748B",
                        }}
                      >
                        <p className="font-semibold">No graphics created yet today.</p>
                        <p className="text-[11px] opacity-75">
                          Pick any festival template above to design and schedule your posts!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
