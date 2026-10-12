import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Search,
  Eye,
  Globe,
  FileCode2,
  Sparkles,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useTemplates } from "@/features/admin/templates/hooks/useTemplates";
import { useDebounce } from "@/shared/hooks/useDebounce";
import Pagination from "@/components/ui/Pagination";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { formatDate } from "@/shared/utils/date.util";
import { TemplatePostsModal } from "@/features/admin/templates/components/TemplatePostsModal";

/**
 * TemplatesByFestivalView Component
 * Dedicated Explorer View allowing administrators to inspect templates grouped by festival occasion.
 * Includes interactive festival selector pills, live debounced template searching, full pagination, and lightbox inspection.
 *
 * @param {Object} props
 * @param {Array} props.festivals - List of available festival entities
 * @param {boolean} props.isLoadingFestivals - Whether parent festivals are loading
 */
export const TemplatesByFestivalView = ({ festivals = [], isLoadingFestivals = false }) => {
  const [selectedFestivalId, setSelectedFestivalId] = useState(festivals[0]?.id || "");
  const [festivalSearch, setFestivalSearch] = useState("");
  const [templatePage, setTemplatePage] = useState(1);
  const [templateLimit, setTemplateLimit] = useState(8);
  const [templateSearch, setTemplateSearch] = useState("");
  const [lightboxItem, setLightboxItem] = useState(null);
  const [viewingTemplatePosts, setViewingTemplatePosts] = useState(null);

  const debouncedTemplateSearch = useDebounce(templateSearch, 300);
  const debouncedFestivalSearch = useDebounce(festivalSearch, 300);

  // Auto-select first festival when festivals become available
  useEffect(() => {
    if (!selectedFestivalId && festivals.length > 0) {
      setSelectedFestivalId(festivals[0].id);
    }
  }, [festivals, selectedFestivalId]);

  // Reset template pagination when switching festivals or searching
  useEffect(() => {
    setTemplatePage(1);
  }, [selectedFestivalId, debouncedTemplateSearch]);

  const activeFestival = festivals.find((f) => f.id === selectedFestivalId) || festivals[0] || null;

  // Query templates for active festival
  const {
    templates = [],
    meta,
    isLoading: isLoadingTemplates,
    error,
  } = useTemplates(
    {
      page: templatePage,
      limit: templateLimit,
      search: debouncedTemplateSearch || undefined,
      festivalId: activeFestival?.id,
    },
    { enabled: Boolean(activeFestival?.id) }
  );

  // Filter festivals list for selector pills
  const filteredFestivals = festivals.filter((f) => {
    if (!debouncedFestivalSearch) return true;
    const q = debouncedFestivalSearch.toLowerCase();
    return (
      f.name?.toLowerCase().includes(q) ||
      f.targetRegion?.toLowerCase().includes(q) ||
      f.description?.toLowerCase().includes(q)
    );
  });

  const totalTemplates =
    meta?.totalItems ??
    activeFestival?._count?.templates ??
    (Array.isArray(activeFestival?.templates) ? activeFestival.templates.length : templates.length);

  if (isLoadingFestivals && festivals.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p>Loading festival templates catalog...</p>
      </div>
    );
  }

  if (festivals.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-2xl text-slate-400 text-xs space-y-2 bg-[#131B2A]/40">
        <CalendarIcon className="w-8 h-8 text-amber-400 mx-auto opacity-40" />
        <p className="font-heading font-bold text-sm text-white">No festivals available</p>
        <p>Create a festival first to view and manage its attached graphic templates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Festival Selector Tabs & Search Strip */}
      <div className="p-5 rounded-2xl bg-[#131B2A] border border-[#2C384E] space-y-3.5 shadow-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#2C384E] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="font-heading font-extrabold text-sm text-white">
              Select Festival Occasion
            </h4>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {festivals.length} Occasions
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter festivals..."
              value={festivalSearch}
              onChange={(e) => setFestivalSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#0B0F17] border border-[#2C384E] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>
        </div>

        {/* Scrollable Festival Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {filteredFestivals.map((fest) => {
            const isSelected = fest.id === activeFestival?.id;
            const count =
              fest._count?.templates ??
              (Array.isArray(fest.templates) ? fest.templates.length : 0);

            return (
              <button
                key={fest.id}
                type="button"
                onClick={() => setSelectedFestivalId(fest.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-2 border cursor-pointer ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold scale-[1.02]"
                    : "bg-[#0B0F17] text-slate-300 border-[#2C384E] hover:border-slate-500 hover:text-white"
                }`}
              >
                <span>🪔 {fest.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                    isSelected
                      ? "bg-slate-950/20 text-slate-950"
                      : "bg-slate-800 text-amber-400 border border-slate-700/60"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Active Festival Showcase & Templates Grid */}
      {activeFestival && (
        <div className="p-6 rounded-2xl bg-[#131B2A] border border-[#2C384E] space-y-5 shadow-lg">
          {/* Active Festival Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-extrabold text-lg text-white truncate">
                    {activeFestival.name}
                  </h3>
                  <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/30 font-semibold shrink-0">
                    📅 {formatDate(activeFestival.date)}
                  </span>
                  {activeFestival.targetRegion && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700 shrink-0">
                      <Globe className="w-3 h-3 text-amber-400" />
                      <span>{activeFestival.targetRegion}</span>
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono font-bold shrink-0">
                    {totalTemplates} {totalTemplates === 1 ? "Template" : "Templates"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {activeFestival.description || "Master graphic templates designed for this festive celebration."}
                </p>
              </div>
            </div>

            {/* Template Search Filter within active festival */}
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${activeFestival.name} templates...`}
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#0B0F17] border border-[#2C384E] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          {/* Templates Grid Content */}
          {isLoadingTemplates ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: templateLimit }).map((_, i) => (
                <div
                  key={`skel-fest-page-${i}`}
                  className="border border-[#2C384E] rounded-2xl p-3 bg-[#0B0F17] space-y-3 animate-pulse"
                >
                  <div className="aspect-square rounded-xl bg-slate-800" />
                  <div className="h-3.5 bg-slate-800 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs">
              Failed to load templates for {activeFestival.name}. Please try again.
            </div>
          ) : templates.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-2xl text-slate-400 text-xs space-y-2 bg-[#0B0F17]/40">
              <FileCode2 className="w-8 h-8 text-amber-400 mx-auto opacity-50" />
              <p className="font-heading font-bold text-sm text-white">
                {templateSearch ? `No templates matching "${templateSearch}"` : `No templates added for ${activeFestival.name} yet`}
              </p>
              <p className="text-slate-400 max-w-md mx-auto">
                {templateSearch
                  ? "Try adjusting your search query."
                  : "Upload graphic templates in Master Templates tab and assign them to this festival to display here."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setLightboxItem(tpl)}
                  className="group relative border border-[#2C384E] rounded-2xl overflow-hidden hover:border-amber-500/60 hover:shadow-xl transition-all cursor-pointer bg-[#0B0F17] flex flex-col justify-between"
                >
                  {/* Image Preview Container */}
                  <div className="aspect-square relative overflow-hidden bg-slate-950 flex items-center justify-center">
                    <img
                      src={tpl.baseImageUrl}
                      alt={tpl.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-2 text-center">
                      <span className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold shadow-md transform translate-y-1 group-hover:translate-y-0 transition flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview Graphic</span>
                      </span>
                      <span className="text-[10px] text-slate-300 font-mono">
                        Click to inspect
                      </span>
                    </div>

                    {/* Subtle Category Tag (Top Left) if present */}
                    {tpl.templateCategory?.name && (
                      <div className="absolute top-2 left-2 max-w-[55%] pointer-events-none">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/75 backdrop-blur-md border border-slate-700/60 text-slate-300 text-[10px] font-medium shadow-sm truncate">
                          <span className="text-teal-400 text-[11px] shrink-0">📁</span>
                          <span className="truncate">{tpl.templateCategory.name}</span>
                        </span>
                      </div>
                    )}

                    {/* Posts Tracking Badge Button (Top Right) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingTemplatePosts(tpl);
                      }}
                      className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-slate-700/60 hover:border-amber-400/50 backdrop-blur-md text-slate-200 hover:text-amber-300 transition-all shadow-md cursor-pointer text-[10px] font-semibold"
                      title={`View ${tpl._count?.posts ?? 0} posts created with this template`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{tpl._count?.posts ?? 0}</span>
                    </button>
                  </div>

                  {/* Clean Card Title & Post Count Footer */}
                  <div className="p-3 border-t border-[#2C384E] bg-[#131B2A] flex items-center justify-between gap-2">
                    <p
                      className="text-xs font-semibold text-white truncate group-hover:text-amber-400 transition-colors"
                      title={tpl.title}
                    >
                      {tpl.title}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingTemplatePosts(tpl);
                      }}
                      className="font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer shrink-0 text-[10px]"
                      title="Inspect posts created with this template"
                    >
                      <span>{tpl._count?.posts ?? 0} posts</span>
                      <span className="text-xs">→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {templates.length > 0 && (
            <div className="pt-4 border-t border-[#2C384E]">
              <Pagination
                meta={meta}
                currentPage={templatePage}
                totalPages={meta?.totalPages || Math.max(1, Math.ceil(totalTemplates / templateLimit))}
                onPageChange={(p) => setTemplatePage(p)}
                onLimitChange={(l) => {
                  setTemplateLimit(l);
                  setTemplatePage(1);
                }}
                pageSizeOptions={[8, 12, 16, 24]}
                className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300"
              />
            </div>
          )}
        </div>
      )}

      {/* Full-resolution Image Lightbox Viewer */}
      {lightboxItem && (
        <ImageLightbox
          isOpen={Boolean(lightboxItem)}
          item={{
            title: lightboxItem.title,
            imageUrl: lightboxItem.baseImageUrl,
            caption: `${lightboxItem.title} • ${activeFestival?.name}`,
          }}
          imageUrl={lightboxItem.baseImageUrl}
          onClose={() => setLightboxItem(null)}
        />
      )}

      {/* Template Posts Inspector Modal */}
      <TemplatePostsModal
        isOpen={Boolean(viewingTemplatePosts)}
        onClose={() => setViewingTemplatePosts(null)}
        template={viewingTemplatePosts}
      />
    </div>
  );
};

export default TemplatesByFestivalView;
