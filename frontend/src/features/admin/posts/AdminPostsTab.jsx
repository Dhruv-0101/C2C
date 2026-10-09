import React, { useState } from "react";
import {
  Layers,
  FolderKanban,
  Maximize2,
  Calendar,
  Image,
  Filter,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { SearchBar } from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { FilterSearchablePicker } from "./components/FilterSearchablePicker";
import { categoryApi } from '@/features/admin/categories/api/category.api';
import { frameApi } from '@/features/admin/frames/api/frame.api';
import { templateCategoryApi } from '@/features/admin/template-categories/api/templateCategory.api';
import { festivalApi } from '@/features/admin/festivals/api/festival.api';

/**
 * AdminPostsTab Component
 * Comprehensive audit & tracking interface for generated posts.
 * Allows Admins & SubAdmins to track posts across:
 * - Business Category (Industry Niche) with real-time search & pagination
 * - Frame Overlay applied with search & pagination
 * - Template & Template Category utilized with search & pagination
 * - Festival targeted with search & pagination
 * - Creator details (User Name, Email, Avatar)
 * - Platform KPI volume stats
 */
export const AdminPostsTab = ({
  posts = [],
  postMeta,
  isLoadingPosts,
  postsFetchError,
  postPage,
  setPostPage,
  setPostLimit,
  // Filters
  categoryFilter,
  setCategoryFilter,
  frameFilter,
  setFrameFilter,
  templateCategoryFilter,
  setTemplateCategoryFilter,
  festivalFilter,
  setFestivalFilter,
  statusFilter,
  setStatusFilter,
  postSearch,
  setPostSearch,
  // Metadata options for scalable search & pagination pickers
  categoriesList = [],
  framesList = [],
  templateCategoriesList = [],
  festivalsList = [],
  // Analytics
  analytics,
  isLoadingAnalytics,
}) => {
  const [selectedPostForLightbox, setSelectedPostForLightbox] = useState(null);
  const [selectedLabels, setSelectedLabels] = useState({});

  const handleSelectFilter = (key, id, item) => {
    if (key === 'category') {
      setCategoryFilter(id);
      setSelectedLabels((prev) => ({ ...prev, category: item?.name || item?.title || '' }));
    } else if (key === 'frame') {
      setFrameFilter(id);
      setSelectedLabels((prev) => ({ ...prev, frame: item?.name || item?.title || '' }));
    } else if (key === 'templateCategory') {
      setTemplateCategoryFilter(id);
      setSelectedLabels((prev) => ({ ...prev, templateCategory: item?.name || item?.title || '' }));
    } else if (key === 'festival') {
      setFestivalFilter(id);
      setSelectedLabels((prev) => ({ ...prev, festival: item?.name || item?.title || '' }));
    }
    setPostPage(1);
  };

  const hasActiveFilters = Boolean(
    categoryFilter ||
    frameFilter ||
    templateCategoryFilter ||
    festivalFilter ||
    statusFilter ||
    postSearch
  );

  const handleClearFilters = () => {
    setCategoryFilter("");
    setFrameFilter("");
    setTemplateCategoryFilter("");
    setFestivalFilter("");
    setStatusFilter("");
    setPostSearch("");
    setSelectedLabels({});
    setPostPage(1);
  };

  const selectedCategoryObj = categoriesList.find((c) => String(c.id) === String(categoryFilter));
  const selectedFrameObj = framesList.find((f) => String(f.id) === String(frameFilter));
  const selectedTemplateCategoryObj = templateCategoriesList.find((tc) => String(tc.id) === String(templateCategoryFilter));
  const selectedFestivalObj = festivalsList.find((f) => String(f.id) === String(festivalFilter));

  const displayCategoryName = selectedLabels.category || selectedCategoryObj?.name;
  const displayFrameName = selectedLabels.frame || selectedFrameObj?.title;
  const displayTemplateCategoryName = selectedLabels.templateCategory || selectedTemplateCategoryObj?.name;
  const displayFestivalName = selectedLabels.festival || selectedFestivalObj?.name;

  return (
    <div className="animate-in fade-in duration-200 space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2C384E] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Generated Posts Audit & Tracking</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track which business category, frame, template, and festival each post was created for, and audit creator activity.
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Dimensional Filter Toolbar with Paginated Comboboxes */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#2C384E] space-y-3.5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-amber-500" />
            <span>Filter Posts Audit Trail:</span>
            {postMeta?.totalItems !== undefined && (
              <span className="ml-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {postMeta.totalItems} {postMeta.totalItems === 1 ? 'post' : 'posts'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
            <SearchBar
              value={postSearch}
              onChange={(val) => {
                const query = typeof val === "string" ? val : (val?.target?.value ?? "");
                setPostSearch(query);
                setPostPage(1);
              }}
              placeholder="Search user name, email, occasion..."
              className="w-full"
            />

            {/* Post Status Selector */}
            <div className="shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPostPage(1);
                }}
                className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#2C384E] text-slate-800 dark:text-white text-xs font-bold rounded-xl px-2.5 py-2 focus:outline-none focus:border-amber-500 transition cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4 Paginated & Searchable Filters (Handles 1000+ items smoothly) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* 1. Business Category Paginated Combobox */}
          <FilterSearchablePicker
            label="Business Category"
            icon={FolderKanban}
            selectedId={categoryFilter}
            selectedName={displayCategoryName}
            onSelect={(id, item) => handleSelectFilter('category', id, item)}
            placeholder="Search business categories..."
            accentColor="indigo"
            queryKeyPrefix="filter-picker-categories"
            queryFn={async ({ page, limit, search }) => {
              const res = await categoryApi.getCategories({ page, limit, search });
              const list = res?.data?.categories || res?.categories || [];
              const meta = res?.meta || res?.data?.meta || { totalPages: 1, totalItems: list.length, page, limit };
              return {
                items: list.map((c) => ({ id: c.id, name: c.name, description: c.description })),
                meta,
              };
            }}
            getSingleItemFn={async (id) => {
              const res = await categoryApi.getCategoryById(id);
              return res?.data?.category || res?.category || null;
            }}
            items={categoriesList}
            pageSize={10}
          />

          {/* 2. Brand Frame Paginated Combobox */}
          <FilterSearchablePicker
            label="Brand Frame"
            icon={Maximize2}
            selectedId={frameFilter}
            selectedName={displayFrameName}
            onSelect={(id, item) => handleSelectFilter('frame', id, item)}
            placeholder="Search brand frames..."
            accentColor="emerald"
            queryKeyPrefix="filter-picker-frames"
            queryFn={async ({ page, limit, search }) => {
              const res = await frameApi.getFrames({ page, limit, search });
              const list = res?.data?.frames || res?.frames || [];
              const meta = res?.meta || res?.data?.meta || { totalPages: 1, totalItems: list.length, page, limit };
              return {
                items: list.map((f) => ({ id: f.id, name: f.title, title: f.title })),
                meta,
              };
            }}
            getSingleItemFn={async (id) => {
              const res = await frameApi.getFrameById(id);
              return res?.data?.frame || res?.frame || null;
            }}
            items={framesList}
            pageSize={10}
          />

          {/* 3. Template Category Paginated Combobox */}
          <FilterSearchablePicker
            label="Template Category"
            icon={Image}
            selectedId={templateCategoryFilter}
            selectedName={displayTemplateCategoryName}
            onSelect={(id, item) => handleSelectFilter('templateCategory', id, item)}
            placeholder="Search template categories..."
            accentColor="amber"
            queryKeyPrefix="filter-picker-template-categories"
            queryFn={async ({ page, limit, search }) => {
              const res = await templateCategoryApi.getTemplateCategories({ page, limit, search });
              const list = res?.data?.categories || res?.categories || [];
              const meta = res?.meta || res?.data?.meta || { totalPages: 1, totalItems: list.length, page, limit };
              return {
                items: list.map((tc) => ({ id: tc.id, name: tc.name, description: tc.description })),
                meta,
              };
            }}
            getSingleItemFn={async (id) => {
              const res = await templateCategoryApi.getTemplateCategoryById(id);
              return res?.data?.category || res?.category || null;
            }}
            items={templateCategoriesList}
            pageSize={10}
          />

          {/* 4. Festival Event Paginated Combobox */}
          <FilterSearchablePicker
            label="Festival Event"
            icon={Calendar}
            selectedId={festivalFilter}
            selectedName={displayFestivalName}
            onSelect={(id, item) => handleSelectFilter('festival', id, item)}
            placeholder="Search festivals..."
            accentColor="rose"
            queryKeyPrefix="filter-picker-festivals"
            queryFn={async ({ page, limit, search }) => {
              const res = await festivalApi.getFestivals({ page, limit, search, includeInactive: false });
              const list = res?.data?.festivals || res?.festivals || (Array.isArray(res?.data) ? res.data : []) || [];
              const meta = res?.meta || res?.data?.meta || { totalPages: 1, totalItems: list.length, page, limit };
              return {
                items: list.map((f) => ({
                  id: f.id,
                  name: f.name,
                  title: f.name,
                  description: f.date ? new Date(f.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : null,
                })),
                meta,
              };
            }}
            getSingleItemFn={async (id) => {
              const res = await festivalApi.getFestivalById(id);
              return res?.data?.festival || res?.festival || null;
            }}
            items={festivalsList}
            pageSize={10}
          />
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap pt-2.5 border-t border-slate-200 dark:border-[#2C384E]/70">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
              Active Filters:
            </span>
            {categoryFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30">
                <span>Category: {displayCategoryName || 'Selected'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter("");
                    setSelectedLabels((prev) => ({ ...prev, category: '' }));
                    setPostPage(1);
                  }}
                  className="hover:opacity-75 cursor-pointer ml-0.5 text-xs font-bold"
                  title="Remove category filter"
                >
                  ×
                </button>
              </span>
            )}
            {frameFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30">
                <span>Frame: {displayFrameName || 'Selected'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFrameFilter("");
                    setSelectedLabels((prev) => ({ ...prev, frame: '' }));
                    setPostPage(1);
                  }}
                  className="hover:opacity-75 cursor-pointer ml-0.5 text-xs font-bold"
                  title="Remove frame filter"
                >
                  ×
                </button>
              </span>
            )}
            {templateCategoryFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30">
                <span>Template: {displayTemplateCategoryName || 'Selected'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setTemplateCategoryFilter("");
                    setSelectedLabels((prev) => ({ ...prev, templateCategory: '' }));
                    setPostPage(1);
                  }}
                  className="hover:opacity-75 cursor-pointer ml-0.5 text-xs font-bold"
                  title="Remove template category filter"
                >
                  ×
                </button>
              </span>
            )}
            {festivalFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30">
                <span>Festival: {displayFestivalName || 'Selected'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFestivalFilter("");
                    setSelectedLabels((prev) => ({ ...prev, festival: '' }));
                    setPostPage(1);
                  }}
                  className="hover:opacity-75 cursor-pointer ml-0.5 text-xs font-bold"
                  title="Remove festival filter"
                >
                  ×
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                <span>Status: {statusFilter}</span>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("");
                    setPostPage(1);
                  }}
                  className="hover:opacity-75 cursor-pointer ml-0.5 text-xs font-bold"
                  title="Remove status filter"
                >
                  ×
                </button>
              </span>
            )}
            {postSearch && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                <span>Search: "{postSearch}"</span>
                <button
                  type="button"
                  onClick={() => {
                    setPostSearch("");
                    setPostPage(1);
                  }}
                  className="hover:opacity-75 cursor-pointer ml-0.5 text-xs font-bold"
                  title="Clear search"
                >
                  ×
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleClearFilters}
              className="ml-auto text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Error State */}
      {postsFetchError && (
        <Alert variant="error" message={postsFetchError.message || "Failed to load posts audit trail."} />
      )}

      {/* Posts Audit Feed Table (List View) */}
      {isLoadingPosts ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-[#2C384E] bg-white dark:bg-[#131B2A] shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-[#2C384E]">
              <tr>
                <th className="py-2.5 px-3">Post Artwork</th>
                <th className="py-2.5 px-3">Creator User</th>
                <th className="py-2.5 px-3">Business Category</th>
                <th className="py-2.5 px-3">Frame Overlay</th>
                <th className="py-2.5 px-3">Template & Theme</th>
                <th className="py-2.5 px-3">Festival</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Created At</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2C384E]/50">
              {Array.from({ length: 6 }).map((_, rIdx) => (
                <tr key={rIdx} className="border-b border-slate-100 dark:border-[#2C384E]/40">
                  <td className="py-2.5 px-3">
                    <div className="w-11 h-11 rounded-xl skeleton-shimmer shrink-0" />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full skeleton-shimmer shrink-0" />
                      <div className="space-y-1">
                        <div className="h-3.5 w-24 rounded skeleton-shimmer" />
                        <div className="h-2.5 w-16 rounded skeleton-shimmer opacity-60" />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="h-6 w-24 rounded-full skeleton-shimmer" />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="h-6 w-20 rounded-full skeleton-shimmer" />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="space-y-1">
                      <div className="h-3.5 w-28 rounded skeleton-shimmer" />
                      <div className="h-2.5 w-16 rounded skeleton-shimmer opacity-60" />
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="h-3.5 w-20 rounded skeleton-shimmer" />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="h-6 w-16 rounded-full skeleton-shimmer" />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="h-3.5 w-20 rounded skeleton-shimmer" />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="h-7 w-16 rounded-lg skeleton-shimmer ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : posts.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-slate-200 dark:border-[#2C384E] bg-white dark:bg-[#131B2A] rounded-2xl space-y-3">
          <Layers className="w-9 h-9 text-slate-400 dark:text-slate-600 mx-auto" />
          <p className="text-slate-600 dark:text-slate-300 font-semibold text-sm">
            No generated posts match the selected criteria.
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="mt-2 text-xs"
            >
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-[#2C384E] bg-white dark:bg-[#131B2A] shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-[#2C384E]">
                <tr>
                  <th className="py-2.5 px-3">Post Artwork</th>
                  <th className="py-2.5 px-3">Creator User</th>
                  <th className="py-2.5 px-3">Business Category</th>
                  <th className="py-2.5 px-3">Frame Overlay</th>
                  <th className="py-2.5 px-3">Template & Theme</th>
                  <th className="py-2.5 px-3">Festival</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Created At</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2C384E]/50">
                {posts.map((post) => {
                  const creator = post.user;
                  const categoryName = post.category?.name || "General Business";
                  const frameTitle = post.frame?.title || "No Frame";
                  const templateTitle = post.template?.title || "Custom Graphic";
                  const templateCategoryName = post.template?.templateCategory?.name || "General";
                  const festivalName = post.festival?.name || "-";
                  const graphicUrl = post.finalGraphicUrl || post.customImageUrl || post.template?.baseImageUrl;

                  return (
                    <tr key={post.id} className="hover:bg-slate-50/80 dark:hover:bg-[#1A2333]/50 transition">
                      {/* Image Thumbnail */}
                      <td className="py-2.5 px-3">
                        <div
                          onClick={() => setSelectedPostForLightbox(post)}
                          className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#2C384E] relative group cursor-pointer shrink-0 shadow-sm"
                        >
                          {graphicUrl ? (
                            <img
                              src={graphicUrl}
                              alt={post.occasionName || "Post preview"}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                              <Image className="w-4 h-4" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </td>

                      {/* Creator Details (User) */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-xs shrink-0 overflow-hidden shadow-2xs">
                            {creator?.avatarUrl ? (
                              <img src={creator.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              creator?.fullName?.[0]?.toUpperCase() || "U"
                            )}
                          </div>
                          <div className="truncate max-w-[140px]">
                            <div className="font-semibold text-slate-900 dark:text-white truncate" title={creator?.fullName || "User"}>
                              {creator?.fullName || "Anonymous User"}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono" title={creator?.email}>
                              {creator?.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Business Category (Task 14 Fix: crisp light theme contrast) */}
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20 text-[11px] font-medium whitespace-nowrap">
                          <FolderKanban className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          <span>{categoryName}</span>
                        </span>
                      </td>

                      {/* Frame Overlay */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap border ${
                            post.frameId
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
                              : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/40"
                          }`}
                        >
                          <Maximize2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="truncate max-w-[120px]" title={frameTitle}>{frameTitle}</span>
                        </span>
                      </td>

                      {/* Template & Template Category */}
                      <td className="py-2.5 px-3">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white truncate max-w-[150px]" title={templateTitle}>
                            {templateTitle}
                          </div>
                          <div className="text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-1 mt-0.5 font-medium">
                            <span>Theme: {templateCategoryName}</span>
                          </div>
                        </div>
                      </td>

                      {/* Festival */}
                      <td className="py-2.5 px-3">
                        {post.festivalId ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20 text-[10px] font-medium">
                            <Calendar className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                            <span className="truncate max-w-[100px]" title={festivalName}>{festivalName}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 font-mono">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                            post.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30"
                              : post.status === "SCHEDULED"
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30"
                              : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30"
                          }`}
                        >
                          {post.status === "PUBLISHED" ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          ) : post.status === "SCHEDULED" ? (
                            <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          )}
                          <span>{post.status}</span>
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px] font-mono">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }) : "-"}
                      </td>

                      {/* Preview Button */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedPostForLightbox(post)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white transition cursor-pointer shadow-2xs"
                          title="View High-Res Graphic"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Centralized Pagination */}
          <Pagination
            meta={postMeta}
            currentPage={postPage}
            totalPages={postMeta?.totalPages || 1}
            onPageChange={(p) => setPostPage(p)}
            onLimitChange={(l) => {
              if (setPostLimit) setPostLimit(l);
              setPostPage(1);
            }}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      )}

      {/* Lightbox Modal for Post Preview */}
      {selectedPostForLightbox && (
        <ImageLightbox
          isOpen={Boolean(selectedPostForLightbox)}
          item={{
            ...selectedPostForLightbox,
            title: selectedPostForLightbox.occasionName || selectedPostForLightbox.template?.title || "User Generated Post",
            category: `Category: ${selectedPostForLightbox.category?.name || "General"} | Frame: ${selectedPostForLightbox.frame?.title || "None"}`,
          }}
          imageUrl={selectedPostForLightbox.finalGraphicUrl || selectedPostForLightbox.customImageUrl}
          onClose={() => setSelectedPostForLightbox(null)}
        />
      )}
    </div>
  );
};

export default AdminPostsTab;
