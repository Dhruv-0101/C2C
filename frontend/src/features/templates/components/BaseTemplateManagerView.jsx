import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  FileCode2,
  Plus,
  Upload,
  ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  FolderKanban,
  FolderTree,
  Calendar,
  Sparkles,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Alert } from "../../../components/ui/Alert";
import { FeedbackModal } from "../../../components/common/FeedbackModal";
import Pagination from "../../../components/common/Pagination";
import { SearchBar } from "../../../components/common/SearchBar";
import { GraphicCard } from "../../../components/common/GraphicCard";
import { ImageLightbox } from "../../../components/common/ImageLightbox";

/**
 * BaseTemplateManagerView
 * Pure Presentational Component rendering templates search, grid items, upload form modal, and lightbox view.
 */
export const BaseTemplateManagerView = ({
  onOpenCreate,
  modalProps,
  isModalOpen,
  setIsModalOpen,
  fullscreenTemplate,
  setFullscreenTemplate,
  errorMsg,
  formData,
  setFormData,
  setPage,
  setLimit,
  search,
  setSearch,
  selectedFestival,
  setSelectedFestival,
  selectedCategory,
  setSelectedCategory,
  templates,
  templateMeta,
  isLoadingTemplates,
  festivals = [],
  festivalMeta = null,
  festSearch = "",
  setFestSearch,
  festPage = 1,
  setFestPage,
  isLoadingFestivals = false,
  categoriesList = [],
  categoryMeta = null,
  catSearch = "",
  setCatSearch,
  catPage = 1,
  setCatPage,
  isLoadingCategories = false,
  handleFileChange,
  createTemplateMutation,
  deleteTemplateMutation,
  handleFormSubmit,
}) => {
  const [customCatInput, setCustomCatInput] = useState("");
  const [templateToDelete, setTemplateToDelete] = useState(null);

  const catTotalPages = categoryMeta?.totalPages || 1;
  const festTotalPages = festivalMeta?.totalPages || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#131B2A] border border-[#2C384E] p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-lg text-white flex items-center gap-2">
              <span>Graphic Templates Manager</span>
              <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                {templateMeta?.totalItems ?? templates.length} Templates
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Upload clean 1080x1080 graphic backgrounds that end-users composite with custom transparent brand frames.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          size="sm"
          onClick={() => (onOpenCreate ? onOpenCreate() : setIsModalOpen(true))}
        >
          Upload New Base Graphic
        </Button>
      </div>

      {/* Filter and Template Grid Card */}
      <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-6">
        {/* 1. Template Category Section (8 Items per Page + Search) */}
        <div className="space-y-3 p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <FolderTree className="w-4 h-4 text-amber-400" />
              <h4 className="font-heading font-extrabold text-sm text-white">
                Template Categories Navigation
              </h4>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                {categoryMeta?.totalItems ?? categoriesList.length} Template Categories
              </span>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                Page {catPage} of {catTotalPages}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Template Category Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search template categories..."
                  value={catSearch}
                  onChange={(e) => {
                    setCatSearch(e.target.value);
                    setCatPage(1);
                  }}
                  className="pl-8 pr-3 py-1 rounded-xl bg-[#131B2A] border border-[#2C384E] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 w-48"
                />
              </div>

              {/* Template Category Pagination Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={catPage <= 1}
                  onClick={() => setCatPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-lg bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 transition text-xs flex items-center gap-1 cursor-pointer"
                  title="Previous Template Categories"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                <button
                  type="button"
                  disabled={catPage >= catTotalPages}
                  onClick={() => setCatPage((p) => Math.min(catTotalPages, p + 1))}
                  className="px-2.5 py-1 rounded-lg bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 transition text-xs flex items-center gap-1 cursor-pointer"
                  title="Next Template Categories"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Template Category Pills (Max 8 shown per page) */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1.5 pb-3.5 custom-scrollbar">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
                !selectedCategory
                  ? "bg-amber-500 text-slate-950 font-bold shadow-glow"
                  : "bg-[#131B2A] text-slate-300 border border-[#2C384E] hover:border-slate-400"
              }`}
            >
              <span>🎨 All Template Categories</span>
            </button>

            {isLoadingCategories && (
              <span className="text-xs text-slate-400 animate-pulse px-2">
                Searching template categories...
              </span>
            )}

            {!isLoadingCategories && categoriesList.length === 0 && catSearch && (
              <span className="text-xs text-slate-400 italic px-2">
                No template categories matching "{catSearch}"
              </span>
            )}

            {categoriesList.map((cat) => {
              const isSelected = selectedCategory === cat.name || selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 font-bold shadow-glow"
                      : "bg-[#131B2A] text-slate-300 border border-[#2C384E] hover:border-slate-400"
                  }`}
                >
                  <span>{cat.icon || "🎨"}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Festival Section (8 Items per Page + Search) */}
        <div className="space-y-3 p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h4 className="font-heading font-extrabold text-sm text-white">
                Festivals Navigation
              </h4>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                {festivalMeta?.totalItems ?? festivals.length} Festivals
              </span>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                Page {festPage} of {festTotalPages}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Festival Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search festivals..."
                  value={festSearch}
                  onChange={(e) => {
                    setFestSearch(e.target.value);
                    setFestPage(1);
                  }}
                  className="pl-8 pr-3 py-1 rounded-xl bg-[#131B2A] border border-[#2C384E] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 w-40"
                />
              </div>

              {/* Festival Pagination Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={festPage <= 1}
                  onClick={() => setFestPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-lg bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 transition text-xs flex items-center gap-1 cursor-pointer"
                  title="Previous Festivals"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                <button
                  type="button"
                  disabled={festPage >= festTotalPages}
                  onClick={() => setFestPage((p) => Math.min(festTotalPages, p + 1))}
                  className="px-2.5 py-1 rounded-lg bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 transition text-xs flex items-center gap-1 cursor-pointer"
                  title="Next Festivals"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Festival Pills (Max 8 shown per page) */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1.5 pb-3.5 custom-scrollbar">
            <button
              type="button"
              onClick={() => {
                setSelectedFestival("");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
                !selectedFestival
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-glow"
                  : "bg-[#131B2A] text-slate-300 border border-[#2C384E] hover:border-slate-400"
              }`}
            >
              <span>🎉 All Festivals</span>
            </button>

            {isLoadingFestivals && (
              <span className="text-xs text-slate-400 animate-pulse px-2">
                Searching festivals...
              </span>
            )}

            {!isLoadingFestivals && festivals.length === 0 && festSearch && (
              <span className="text-xs text-slate-400 italic px-2">
                No festivals matching "{festSearch}"
              </span>
            )}

            {festivals.map((f) => {
              const isSelected = selectedFestival === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setSelectedFestival(f.id);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-emerald-500 text-slate-950 font-bold shadow-glow"
                      : "bg-[#131B2A] text-slate-300 border border-[#2C384E] hover:border-slate-400"
                  }`}
                >
                  <span>🪔</span>
                  <span>{f.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Search Base Templates Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
            <SearchBar
              placeholder="Search base graphic templates by title..."
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              className="w-full sm:max-w-md"
            />
            <div className="text-xs text-slate-400 font-mono">
              Showing {templates.length} of {templateMeta?.totalItems ?? templates.length} templates
            </div>
          </div>

          {(selectedCategory || selectedFestival) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-medium">Active Filters:</span>
              {selectedCategory && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1">
                  <span>Category:</span>
                  <span className="font-bold">{selectedCategory}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("");
                      setPage(1);
                    }}
                    className="hover:text-white ml-1 font-bold"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedFestival && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1">
                  <span>Festival:</span>
                  <span className="font-bold">
                    {festivals.find((f) => f.id === selectedFestival)?.name || selectedFestival}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFestival("");
                      setPage(1);
                    }}
                    className="hover:text-white ml-1 font-bold"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedFestival("");
                  setPage(1);
                }}
                className="text-xs text-amber-400 hover:underline font-semibold ml-2"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {isLoadingTemplates ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading base templates...</div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-2xl space-y-3">
            <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-semibold text-sm">No base graphic templates found.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search criteria or click the button above to upload a new base template.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {templates.map((tpl) => (
                <GraphicCard
                  key={tpl.id}
                  imageUrl={tpl.baseImageUrl}
                  title={tpl.title}
                  creator={tpl.creator}
                  onPreview={() => setFullscreenTemplate(tpl)}
                  onDelete={() => setTemplateToDelete(tpl)}
                  isDeleting={deleteTemplateMutation.isPending && deleteTemplateMutation.variables === tpl.id}
                />
              ))}
            </div>

            <Pagination
              meta={templateMeta}
              currentPage={templateMeta?.page || page}
              totalPages={templateMeta?.totalPages || 1}
              onPageChange={(newPage) => setPage(newPage)}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              pageSizeOptions={[8, 12, 24, 48]}
            />
          </div>
        )}
      </Card>

      <FeedbackModal {...modalProps} />

      {/* Reusable High-Res Lightbox Modal */}
      <ImageLightbox
        isOpen={Boolean(fullscreenTemplate)}
        item={fullscreenTemplate}
        onClose={() => setFullscreenTemplate(null)}
      />

      {/* Delete Confirmation Modal */}
      {templateToDelete &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-2xl bg-[#131B2A] border border-[#2C384E] p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-heading font-extrabold text-lg text-white">
                  Delete Graphic Template?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Are you sure you want to delete <span className="text-white font-semibold">"{templateToDelete.title}"</span>? This will permanently delete the background graphic.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setTemplateToDelete(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    deleteTemplateMutation.mutate(templateToDelete.id);
                    setTemplateToDelete(null);
                  }}
                  className="text-xs"
                >
                  Yes, Delete
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
