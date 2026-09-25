import React, { useState, useMemo, useEffect } from "react";
import {
  Activity,
  FileCode2,
  Layers,
  Calendar,
  FolderKanban,
  FolderTree,
  Shield,
  Search,
  RefreshCw,
  ExternalLink,
  Eye,
  CalendarClock,
  Clock,
  User,
  Filter,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { SearchBar } from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';
import { useSubAdminActivity } from '@/features/admin/sub-admins/hooks/useSubAdminActivity';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { ADMIN_TABS } from '@/shared/constants';
import { formatDateTime as formatDate } from '@/shared/utils/date.util';
import { SubAdminActivityLog } from "./components/SubAdminActivityLog";

// Visual theme configurations for each creation type
const TYPE_CONFIG = {
  template: {
    label: "Graphic Template",
    icon: FileCode2,
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    dotColor: "bg-purple-400",
    targetTab: ADMIN_TABS.TEMPLATES,
  },
  frame: {
    label: "Brand Frame",
    icon: Layers,
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    dotColor: "bg-sky-400",
    targetTab: ADMIN_TABS.FRAMES,
  },
  festival: {
    label: "Festival Event",
    icon: Calendar,
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    dotColor: "bg-emerald-400",
    targetTab: ADMIN_TABS.FESTIVALS,
  },
  category: {
    label: "Business Category",
    icon: FolderKanban,
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    dotColor: "bg-indigo-400",
    targetTab: ADMIN_TABS.CATEGORIES,
  },
  templateCategory: {
    label: "Template Category",
    icon: FolderTree,
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    dotColor: "bg-teal-400",
    targetTab: ADMIN_TABS.TEMPLATE_CATEGORIES,
  },
};



/**
 * Format relative time (e.g. "3 hours ago")
 */
const formatRelativeTime = (dateString) => {
  if (!dateString) return "";
  try {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
};

/**
 * AdminSubAdminActivityTab Component
 * SuperAdmin exclusive audit feed tracking and inspecting all items created by SubAdmins.
 */
export const AdminSubAdminActivityTab = ({ onNavigateTab }) => {
  const [selectedSubAdminId, setSelectedSubAdminId] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [inspectItem, setInspectItem] = useState(null);
  const [viewMode, setViewMode] = useState("cards");

  // Auto-reset page to 1 whenever debounced search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedSubAdminId, selectedType]);

  // Fetch audit activity feed
  const { items, summary, meta, isLoading, error, refetch, isFetching } =
    useSubAdminActivity({
      subAdminId: selectedSubAdminId || undefined,
      type: selectedType,
      search: debouncedSearchTerm || undefined,
      page: currentPage,
      limit: pageSize,
    });

  const subAdminsList = summary?.subAdmins || [];
  const typeCounts = summary?.byType || {
    templates: 0,
    frames: 0,
    festivals: 0,
    categories: 0,
  };

  const handleSubAdminSelect = (id) => {
    setSelectedSubAdminId(id);
    setCurrentPage(1);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  return (
    <div className="animate-in fade-in duration-200 space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2C384E] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shadow-glow">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-xl text-white tracking-wide flex items-center gap-2">
                SubAdmin Creations & Activity Audit
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time tracking of all graphic templates, brand frames, festivals, and categories created by SubAdmins.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={RefreshCw}
            className={`border-[#2C384E] text-slate-300 hover:text-white ${
              isFetching ? "animate-spin" : ""
            }`}
            onClick={() => refetch()}
          >
            Refresh Feed
          </Button>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Creations */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#131B2A] to-[#0B0F17] border border-amber-500/30 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Created</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-heading">
              {summary?.totalCreations ?? 0}
            </span>
            <span className="text-[10px] text-amber-400 font-medium">All Works</span>
          </div>
        </div>

        {/* Graphic Templates */}
        <div
          onClick={() => handleTypeSelect(selectedType === "template" ? "all" : "template")}
          className={`p-4 rounded-2xl bg-[#131B2A] border cursor-pointer transition-all hover:border-purple-500/60 ${
            selectedType === "template"
              ? "border-purple-500 bg-purple-500/10 shadow-lg"
              : "border-[#2C384E]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300">Templates</span>
            <FileCode2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-heading">
              {typeCounts.templates}
            </span>
            <span className="text-[10px] text-purple-400 font-medium">Posters</span>
          </div>
        </div>

        {/* Brand Frames */}
        <div
          onClick={() => handleTypeSelect(selectedType === "frame" ? "all" : "frame")}
          className={`p-4 rounded-2xl bg-[#131B2A] border cursor-pointer transition-all hover:border-sky-500/60 ${
            selectedType === "frame"
              ? "border-sky-500 bg-sky-500/10 shadow-lg"
              : "border-[#2C384E]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-300">Brand Frames</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-heading">
              {typeCounts.frames}
            </span>
            <span className="text-[10px] text-sky-400 font-medium">Overlays</span>
          </div>
        </div>

        {/* Festival Events */}
        <div
          onClick={() => handleTypeSelect(selectedType === "festival" ? "all" : "festival")}
          className={`p-4 rounded-2xl bg-[#131B2A] border cursor-pointer transition-all hover:border-emerald-500/60 ${
            selectedType === "festival"
              ? "border-emerald-500 bg-emerald-500/10 shadow-lg"
              : "border-[#2C384E]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300">Festivals</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-heading">
              {typeCounts.festivals}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">Events</span>
          </div>
        </div>

        {/* Business Categories */}
        <div
          onClick={() => handleTypeSelect(selectedType === "category" ? "all" : "category")}
          className={`p-4 rounded-2xl bg-[#131B2A] border cursor-pointer transition-all hover:border-indigo-500/60 ${
            selectedType === "category"
              ? "border-indigo-500 bg-indigo-500/10 shadow-lg"
              : "border-[#2C384E]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-300">Categories</span>
            <FolderKanban className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-heading">
              {typeCounts.categories}
            </span>
            <span className="text-[10px] text-indigo-400 font-medium">Niches</span>
          </div>
        </div>

        {/* Template Categories */}
        <div
          onClick={() => handleTypeSelect(selectedType === "templateCategory" ? "all" : "templateCategory")}
          className={`p-4 rounded-2xl bg-[#131B2A] border cursor-pointer transition-all hover:border-teal-500/60 ${
            selectedType === "templateCategory"
              ? "border-teal-500 bg-teal-500/10 shadow-lg"
              : "border-[#2C384E]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-300">Tpl Categories</span>
            <FolderTree className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-heading">
              {typeCounts.templateCategories || 0}
            </span>
            <span className="text-[10px] text-teal-400 font-medium">Themes</span>
          </div>
        </div>
      </div>

      {/* 3. SubAdmin Contributor Quick Filter Carousel / Strip */}
      <div className="p-4 rounded-2xl bg-[#131B2A]/80 border border-[#2C384E] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Filter by SubAdmin Author
            </span>
          </div>
          {selectedSubAdminId && (
            <button
              onClick={() => handleSubAdminSelect("")}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              Reset Author Filter
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => handleSubAdminSelect("")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              selectedSubAdminId === ""
                ? "bg-amber-500 text-slate-950 shadow-glow font-extrabold"
                : "bg-[#0B0F17] text-slate-400 hover:text-white border border-[#2C384E]"
            }`}
          >
            <span>All SubAdmins</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                selectedSubAdminId === ""
                  ? "bg-slate-950/20 text-slate-950 font-bold"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {subAdminsList.length}
            </span>
          </button>

          {subAdminsList.map((subAdmin) => {
            const isSelected = selectedSubAdminId === subAdmin.id;
            const total = subAdmin.counts?.total ?? 0;

            return (
              <button
                key={subAdmin.id}
                onClick={() => handleSubAdminSelect(isSelected ? "" : subAdmin.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2.5 ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 shadow-glow font-bold"
                    : "bg-[#0B0F17] text-slate-300 hover:text-white border border-[#2C384E] hover:border-amber-500/40"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                    isSelected
                      ? "bg-slate-950 text-amber-400"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {subAdmin.fullName?.charAt(0)?.toUpperCase() || "S"}
                </div>
                <div className="text-left">
                  <span className="block truncate max-w-[140px] text-xs">
                    {subAdmin.fullName}
                  </span>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    isSelected
                      ? "bg-slate-950/20 text-slate-950"
                      : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                  }`}
                >
                  {total} works
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Controls Toolbar (Type Filter, Search, Sort) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0B0F17] p-3 rounded-2xl border border-[#2C384E]">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All Items" },
            { id: "template", label: "Templates", count: typeCounts.templates },
            { id: "frame", label: "Frames", count: typeCounts.frames },
            { id: "festival", label: "Festivals", count: typeCounts.festivals },
            { id: "category", label: "Categories", count: typeCounts.categories },
          ].map((tab) => {
            const isActive = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTypeSelect(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? "bg-slate-800 text-amber-400 border border-amber-500/40 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Bar & View Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto shrink-0">
          <div className="w-full sm:w-64">
            <SearchBar
              value={searchTerm}
              onChange={(val) => {
                const query = typeof val === "string" ? val : (val?.target?.value ?? "");
                setSearchTerm(query);
                setCurrentPage(1);
              }}
              placeholder="Search items by title..."
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#131B2A] p-1 rounded-xl border border-[#2C384E] shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === "cards"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode("auditLog")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === "auditLog"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Audit Log
            </button>
          </div>
        </div>
      </div>

      {/* 5. Error Alert */}
      {error && <Alert variant="error" message={error.message || "Failed to load audit feed."} />}

      {/* 6. Creations Grid / Feed */}
      {viewMode === "auditLog" ? (
        <SubAdminActivityLog
          activities={items.map((item) => ({
            id: item.id,
            action: `created ${item.itemType} "${item.title || 'Untitled'}"`,
            subAdmin: { fullName: item.creatorName },
            details: item.subtitle || item.description || `Category: ${item.categoryName || 'General'}`,
            createdAt: item.createdAt,
          }))}
          isLoading={isLoading}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-[#131B2A] border border-[#2C384E] animate-pulse p-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-4 w-24 bg-slate-800 rounded-md" />
                <div className="h-32 w-full bg-slate-800/60 rounded-xl" />
                <div className="h-4 w-3/4 bg-slate-800 rounded-md" />
              </div>
              <div className="h-8 w-full bg-slate-800/40 rounded-xl" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-2xl space-y-4 bg-[#131B2A]/30">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">No creations found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {searchTerm || selectedSubAdminId || selectedType !== "all"
                ? "Try adjusting your filters or search keywords to view SubAdmin activity."
                : "Delegated SubAdmins haven't created any items yet. When they create festival events, templates, frames, or categories, they will be tracked here."}
            </p>
          </div>
          {(searchTerm || selectedSubAdminId || selectedType !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedSubAdminId("");
                setSelectedType("all");
                setSearchTerm("");
                setCurrentPage(1);
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => {
              const cfg = TYPE_CONFIG[item.itemType] || TYPE_CONFIG.template;
              const Icon = cfg.icon;

              return (
                <div
                  key={`${item.itemType}-${item.id}`}
                  className="rounded-2xl bg-[#131B2A] border border-[#2C384E] hover:border-amber-500/40 transition-all duration-200 overflow-hidden flex flex-col group hover:shadow-xl"
                >
                  {/* Card Header Badge & Time */}
                  <div className="p-3.5 border-b border-[#2C384E]/70 flex items-center justify-between bg-[#0B0F17]/40">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${cfg.badgeColor}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{cfg.label}</span>
                    </span>

                    <span
                      className="text-[10px] text-slate-400 flex items-center gap-1"
                      title={formatDate(item.createdAt)}
                    >
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{formatRelativeTime(item.createdAt)}</span>
                    </span>
                  </div>

                  {/* Card Media Preview Container */}
                  <div className="relative h-44 bg-[#0B0F17] flex items-center justify-center overflow-hidden border-b border-[#2C384E]/50 group-hover:bg-[#070A0F] transition">
                    {item.itemType === "category" ? (
                      <div className="text-center p-6 space-y-2">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
                          <FolderKanban className="w-7 h-7" />
                        </div>
                        <span className="text-xs font-bold text-indigo-300 block font-mono">
                          /{item.subtitle?.replace("Slug: /", "")}
                        </span>
                      </div>
                    ) : item.previewUrl ? (
                      <img
                        src={item.previewUrl}
                        alt={item.title}
                        className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-center text-slate-600 space-y-1">
                        <Icon className="w-8 h-8 mx-auto text-slate-600" />
                        <span className="text-[10px] block">No Preview</span>
                      </div>
                    )}

                    {/* Quick Overlay Action */}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                      <button
                        onClick={() => setInspectItem(item)}
                        className="px-3 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg hover:bg-amber-400 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      {onNavigateTab && (
                        <button
                          onClick={() => onNavigateTab(cfg.targetTab)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 hover:bg-slate-700 transition"
                          title={`Open ${cfg.label} in ${cfg.targetTab} tab`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Tab</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Content & Details */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4
                        className="font-bold text-sm text-white truncate group-hover:text-amber-300 transition"
                        title={item.title}
                      >
                        {item.title || "Untitled Item"}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.subtitle || item.description || "SubAdmin asset contribution"}
                      </p>

                      {item.eventDate && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
                          <CalendarClock className="w-3 h-3" />
                          <span>Date: {new Date(item.eventDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* SubAdmin Creator Attribution Bar */}
                    <div className="pt-2.5 border-t border-[#2C384E]/70 flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                          {item.creator?.fullName?.charAt(0)?.toUpperCase() || "S"}
                        </div>
                        <div className="overflow-hidden">
                          <span
                            className="text-xs font-bold text-slate-200 block truncate"
                            title={item.creator?.fullName}
                          >
                            {item.creator?.fullName || "SubAdmin"}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {item.creator?.email || "Delegated SubAdmin"}
                          </span>
                        </div>
                      </div>

                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                        SUBADMIN
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 7. Pagination Controls */}
          <div className="pt-4 border-t border-[#2C384E]">
            <Pagination
              meta={meta}
              currentPage={meta?.page || currentPage}
              totalPages={meta?.totalPages || 1}
              onPageChange={(p) => setCurrentPage(p)}
              onLimitChange={(l) => {
                setPageSize(l);
                setCurrentPage(1);
              }}
              pageSizeOptions={[12, 24, 48]}
            />
          </div>
        </div>
      )}

      {/* 8. Inspect Item Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#131B2A] border border-[#2C384E] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${
                    TYPE_CONFIG[inspectItem.itemType]?.badgeColor
                  }`}
                >
                  {TYPE_CONFIG[inspectItem.itemType]?.label}
                </span>
                <span className="text-xs text-slate-400">Creation Audit Detail</span>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Media Preview */}
            <div className="h-64 bg-[#0B0F17] rounded-2xl border border-[#2C384E] flex items-center justify-center overflow-hidden relative">
              {inspectItem.itemType === "category" ? (
                <div className="text-center space-y-2 p-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                    <FolderKanban className="w-8 h-8" />
                  </div>
                  <h3 className="font-heading font-extrabold text-white text-lg">
                    {inspectItem.title}
                  </h3>
                  <p className="text-xs text-indigo-300 font-mono">
                    Slug: /{inspectItem.subtitle?.replace("Slug: /", "")}
                  </p>
                </div>
              ) : inspectItem.previewUrl ? (
                <img
                  src={inspectItem.previewUrl}
                  alt={inspectItem.title}
                  className="max-h-full max-w-full object-contain p-2"
                />
              ) : (
                <div className="text-slate-500 text-xs">No media preview available</div>
              )}
            </div>

            {/* Modal Metadata Grid */}
            <div className="space-y-3">
              <div>
                <h3 className="font-heading font-extrabold text-white text-lg">
                  {inspectItem.title}
                </h3>
                {inspectItem.description && (
                  <p className="text-xs text-slate-400 mt-1">{inspectItem.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase font-bold">
                    Created By
                  </span>
                  <span className="text-white font-bold block mt-0.5">
                    {inspectItem.creator?.fullName || "SubAdmin"}
                  </span>
                  <span className="text-slate-400 text-[10px] block">
                    {inspectItem.creator?.email}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block uppercase font-bold">
                    Timestamp
                  </span>
                  <span className="text-white font-bold block mt-0.5">
                    {formatDate(inspectItem.createdAt)}
                  </span>
                  <span className="text-amber-400 text-[10px] block">
                    ({formatRelativeTime(inspectItem.createdAt)})
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setInspectItem(null)}>
                Close
              </Button>
              {onNavigateTab && (
                <Button
                  variant="primary"
                  icon={ExternalLink}
                  onClick={() => {
                    const target = TYPE_CONFIG[inspectItem.itemType]?.targetTab;
                    setInspectItem(null);
                    if (target) onNavigateTab(target);
                  }}
                >
                  Manage in {TYPE_CONFIG[inspectItem.itemType]?.label} Tab
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubAdminActivityTab;
