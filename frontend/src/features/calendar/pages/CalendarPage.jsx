import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { festivalSchema } from '@/features/admin/festivals/validations/festival.validation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useFestivals } from '@/features/calendar/hooks/useFestivals';
import { useTemplates } from '@/features/admin/templates/hooks/useTemplates';
import { useYourPosts } from '@/features/your-posts/hooks/useYourPosts';
import { FestivalCalendarView } from "../components/FestivalCalendarView";

/**
 * CalendarPage Component
 * Canonical Content Calendar Route Page (/calendar).
 * Handles monthly calendar date calculations, festival schedules, user queue, and post creator transitions.
 */
export const CalendarPage = ({ onSelectTemplate, onAddFestival }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);

  // TanStack Query for Festivals (fetch up to 500 to ensure full calendar coverage)
  const {
    festivals,
    isLoading: isLoadingFestivals,
    createFestival,
    isCreating: isSubmittingFest,
    createError,
    deleteFestival,
  } = useFestivals({ limit: 500, includeInactive: false });

  // TanStack Query for User Scheduled & Published Posts
  const {
    posts: userPosts,
    scheduledPosts,
  } = useYourPosts();

  // Selected Festival Day Multi-Festival Tab & Template Search State
  const [selectedFestivalTab, setSelectedFestivalTab] = useState("all");
  const [festivalTemplatePage, setFestivalTemplatePage] = useState(1);
  const [festivalTemplateLimit, setFestivalTemplateLimit] = useState(12);
  const [festivalTemplateSearch, setFestivalTemplateSearch] = useState("");

  const activeFestivalId =
    selectedFestivalTab !== "all"
      ? selectedFestivalTab
      : selectedDayDetails?.festivals?.[0]?.id;

  const {
    templates: paginatedFestivalTemplates,
    meta: festivalTemplatesMeta,
    isLoading: isLoadingFestivalTemplates,
  } = useTemplates(
    {
      page: festivalTemplatePage,
      limit: festivalTemplateLimit,
      search: festivalTemplateSearch,
      festivalId: activeFestivalId,
    },
    { enabled: !!activeFestivalId && !!selectedDayDetails && selectedFestivalTab !== "all" },
  );

  // Handle Template Selection -> Direct Navigation to Post Studio
  const handleTemplateSelect = (template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    } else {
      navigate("/create-post", { state: { template } });
    }
  };

  // Add Festival Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFestError, setAddFestError] = useState("");

  // RHF + Zod for Add Festival Form
  const {
    register: registerFest,
    handleSubmit: handleSubmitFest,
    reset: resetFest,
    setValue: setFestValue,
    watch: watchFest,
    formState: { errors: festErrors },
  } = useForm({
    resolver: zodResolver(festivalSchema),
    defaultValues: {
      name: "",
      date: "",
      description: "",
      targetRegion: "India",
    },
  });

  const handleAddFestivalSubmit = async (data) => {
    setAddFestError("");
    try {
      await createFestival({
        name: data.name.trim(),
        date: data.date,
        description: data.description ? data.description.trim() : undefined,
        targetRegion: data.targetRegion || "India",
      });
      setIsAddModalOpen(false);
      resetFest();
    } catch (err) {
      setAddFestError(
        err?.response?.data?.message || err?.message || createError?.message || "Failed to add festival.",
      );
    }
  };

  const handleDeleteFestival = async (id) => {
    if (!window.confirm("Are you sure you want to delete this festival day?")) return;
    try {
      await deleteFestival(id);
      setSelectedDayDetails(null);
    } catch (err) {
      console.error("Failed to delete festival:", err);
    }
  };

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Defensive Array Check for festivals
  const safeFestivals = Array.isArray(festivals)
    ? festivals
    : festivals?.festivals || festivals?.data || [];

  const getNormalizedDateKey = (val) => {
    if (!val) return "";
    if (typeof val === "string") {
      const match = val.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) return match[1];
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // Festivals Map by Date (YYYY-MM-DD)
  // CRITICAL: Strictly exclude inactive festivals from the calendar grid for all roles (users and admins)
  const festivalMap = {};
  safeFestivals.forEach((fest) => {
    if (!fest || !fest.date || fest.isActive === false) return;
    const dateKey = getNormalizedDateKey(fest.date);
    if (!dateKey) return;
    if (!festivalMap[dateKey]) {
      festivalMap[dateKey] = [];
    }
    festivalMap[dateKey].push(fest);
  });

  // Published Posts Map by Date (YYYY-MM-DD)
  const publishedMap = {};
  const publishedPostIds = new Set();
  userPosts.forEach((post) => {
    if (post.status !== "PUBLISHED" || !post.createdAt) return;
    const dateKey = getNormalizedDateKey(post.createdAt);
    if (!dateKey) return;
    if (!publishedMap[dateKey]) {
      publishedMap[dateKey] = [];
    }
    publishedMap[dateKey].push(post);
    publishedPostIds.add(post.id);
  });

  // Scheduled Posts Map by Date (YYYY-MM-DD)
  // Deduplicate: If an item was already executed and is published, avoid double-counting
  const scheduledMap = {};
  scheduledPosts.forEach((item) => {
    if (!item.scheduledAt) return;
    const dateKey = getNormalizedDateKey(item.scheduledAt);
    if (!dateKey) return;

    const targetPostId = item.postId || item.post?.id;
    if (targetPostId && publishedPostIds.has(targetPostId)) {
      return;
    }

    if (!scheduledMap[dateKey]) {
      scheduledMap[dateKey] = [];
    }
    scheduledMap[dateKey].push(item);
  });

  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push({ key: `empty-${i}`, isPadding: true });
  }

  const today = new Date();
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const monthStr = String(month + 1).padStart(2, "0");
    const dayStr = String(dayNum).padStart(2, "0");
    const dateKey = `${year}-${monthStr}-${dayStr}`;

    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === dayNum;

    calendarCells.push({
      key: `day-${dayNum}`,
      dayNum,
      dateKey,
      isToday,
      festivals: festivalMap[dateKey] || [],
      scheduledPosts: scheduledMap[dateKey] || [],
      publishedPosts: publishedMap[dateKey] || [],
    });
  }

  const handleCellClick = (cell) => {
    if (cell.isPadding) return;
    if (isAdmin && onAddFestival && cell.festivals.length === 0 && cell.scheduledPosts.length === 0 && cell.publishedPosts.length === 0) {
      onAddFestival(cell.dateKey);
      return;
    }
    setSelectedFestivalTab("all");
    setFestivalTemplatePage(1);
    setFestivalTemplateSearch("");
    setSelectedDayDetails(cell);
  };

  return (
    <FestivalCalendarView
      isAdmin={isAdmin}
      onAddFestival={onAddFestival}
      currentDate={currentDate}
      monthName={monthName}
      year={year}
      prevMonth={prevMonth}
      nextMonth={nextMonth}
      goToToday={goToToday}
      calendarCells={calendarCells}
      selectedDayDetails={selectedDayDetails}
      setSelectedDayDetails={setSelectedDayDetails}
      selectedFestivalTab={selectedFestivalTab}
      setSelectedFestivalTab={setSelectedFestivalTab}
      handleCellClick={handleCellClick}
      handleDeleteFestival={handleDeleteFestival}
      paginatedFestivalTemplates={paginatedFestivalTemplates}
      festivalTemplatesMeta={festivalTemplatesMeta}
      isLoadingFestivalTemplates={isLoadingFestivalTemplates}
      festivalTemplatePage={festivalTemplatePage}
      setFestivalTemplatePage={setFestivalTemplatePage}
      festivalTemplateLimit={festivalTemplateLimit}
      setFestivalTemplateLimit={setFestivalTemplateLimit}
      festivalTemplateSearch={festivalTemplateSearch}
      setFestivalTemplateSearch={setFestivalTemplateSearch}
      isAddModalOpen={isAddModalOpen}
      setIsAddModalOpen={setIsAddModalOpen}
      registerFest={registerFest}
      handleSubmitFest={handleSubmitFest}
      resetFest={resetFest}
      setFestValue={setFestValue}
      watchFest={watchFest}
      festErrors={festErrors}
      isSubmittingFest={isSubmittingFest}
      addFestError={addFestError}
      handleAddFestivalSubmit={handleAddFestivalSubmit}
      onSelectTemplate={handleTemplateSelect}
    />
  );
};

export { CalendarPage as FestivalCalendarContainer };
export default CalendarPage;
