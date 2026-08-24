import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { festivalSchema } from "@/validations/festival.validation";
import { useAuth } from "@/hooks/useAuth";
import { useFestivals } from "@/hooks/useFestivals";
import { useTemplates } from "@/hooks/useTemplates.js";
import { useYourPosts } from "@/hooks/useYourPosts.js";
import { FestivalCalendarView } from "../components/FestivalCalendarView";

/**
 * FestivalCalendarContainer
 * Container component handling interactive festival calendar calculations, TanStack festival & template queries,
 * user scheduled posts queue, published post mapping, and festival creation logic.
 */
export const FestivalCalendarContainer = ({ onSelectTemplate }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);

  // TanStack Query for Festivals
  const {
    festivals,
    isLoading: isLoadingFestivals,
    createFestival,
    isCreating: isSubmittingFest,
    createError,
    deleteFestival,
  } = useFestivals();

  // TanStack Query for User Scheduled & Published Posts
  const {
    posts: userPosts,
    scheduledPosts,
    triggerScheduledJobs,
    isTriggering,
  } = useYourPosts();

  // Selected Festival Day Template Search & Pagination State
  const [festivalTemplatePage, setFestivalTemplatePage] = useState(1);
  const [festivalTemplateLimit, setFestivalTemplateLimit] = useState(6);
  const [festivalTemplateSearch, setFestivalTemplateSearch] = useState("");

  const activeFestivalId = selectedDayDetails?.festivals?.[0]?.id;

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
    { enabled: !!activeFestivalId && !!selectedDayDetails },
  );

  // Post Studio Modal State
  const [studioTemplate, setStudioTemplate] = useState(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

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

  const festivalMap = {};
  safeFestivals.forEach((fest) => {
    if (!fest || !fest.date) return;
    const festDate = new Date(fest.date);
    const dateKey = `${festDate.getFullYear()}-${String(
      festDate.getMonth() + 1,
    ).padStart(2, "0")}-${String(festDate.getDate()).padStart(2, "0")}`;
    if (!festivalMap[dateKey]) {
      festivalMap[dateKey] = [];
    }
    festivalMap[dateKey].push(fest);
  });

  // Scheduled Posts Map by Date (YYYY-MM-DD)
  const scheduledMap = {};
  scheduledPosts.forEach((item) => {
    if (!item.scheduledAt) return;
    const itemDate = new Date(item.scheduledAt);
    const dateKey = `${itemDate.getFullYear()}-${String(
      itemDate.getMonth() + 1,
    ).padStart(2, "0")}-${String(itemDate.getDate()).padStart(2, "0")}`;
    if (!scheduledMap[dateKey]) {
      scheduledMap[dateKey] = [];
    }
    scheduledMap[dateKey].push(item);
  });

  // Published Posts Map by Date (YYYY-MM-DD)
  const publishedMap = {};
  userPosts.forEach((post) => {
    if (post.status !== "PUBLISHED" || !post.createdAt) return;
    const postDate = new Date(post.createdAt);
    const dateKey = `${postDate.getFullYear()}-${String(
      postDate.getMonth() + 1,
    ).padStart(2, "0")}-${String(postDate.getDate()).padStart(2, "0")}`;
    if (!publishedMap[dateKey]) {
      publishedMap[dateKey] = [];
    }
    publishedMap[dateKey].push(post);
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
    setSelectedDayDetails(cell);
    if (isAdmin && cell.festivals.length === 0 && cell.scheduledPosts.length === 0 && cell.publishedPosts.length === 0) {
      setFestValue("date", cell.dateKey);
      setIsAddModalOpen(true);
    }
  };

  return (
    <FestivalCalendarView
      isAdmin={isAdmin}
      currentDate={currentDate}
      monthName={monthName}
      year={year}
      prevMonth={prevMonth}
      nextMonth={nextMonth}
      goToToday={goToToday}
      calendarCells={calendarCells}
      selectedDayDetails={selectedDayDetails}
      setSelectedDayDetails={setSelectedDayDetails}
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
      studioTemplate={studioTemplate}
      setStudioTemplate={setStudioTemplate}
      isStudioOpen={isStudioOpen}
      setIsStudioOpen={setIsStudioOpen}
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
      onSelectTemplate={onSelectTemplate}
      triggerScheduledJobs={triggerScheduledJobs}
      isTriggering={isTriggering}
    />
  );
};
