import React, { useState, useEffect } from "react";
import {
  FolderTree,
  FileCode2,
  X,
  Search,
  Eye,
  Sparkles,
} from "lucide-react";
import { useTemplates } from "@/features/admin/templates/hooks/useTemplates";
import { useDebounce } from "@/shared/hooks/useDebounce";
import Pagination from "@/components/ui/Pagination";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { TemplatePostsModal } from "@/features/admin/templates/components/TemplatePostsModal";

/**
 * CategoryTemplatesModal Component
 * Enterprise modal displaying all master templates associated with a specific template category.
 * Features server-side pagination, live debounced search, responsive grid previews, and full-resolution lightbox inspect.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal dialog is open
 * @param {Function} props.onClose - Modal dismissal callback
 * @param {Object|null} props.category - Active category object ({ id, name, slug, description, ... })
 */
export const CategoryTemplatesModal = ({ isOpen, onClose, category }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [search, setSearch] = useState("");
  const [lightboxItem, setLightboxItem] = useState(null);
  const [viewingTemplatePosts, setViewingTemplatePosts] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  // Reset pagination state when modal opens or category changes
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setSearch("");
      setLightboxItem(null);
    }
  }, [isOpen, category?.id]);

  // Reset page to 1 on search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const {
    templates = [],
    meta,
    isLoading,
    error,
  } = useTemplates(
    {
      page,
      limit,
      search: debouncedSearch || undefined,
      templateCategoryId: category?.id,
    },
    { enabled: Boolean(isOpen && category?.id) }
  );

  if (!isOpen || !category) return null;

  const totalTemplates = meta?.totalItems ?? category.templatesCount ?? category._count?.templates ?? templates.length;

  return (
    <>
      <div
        className="modal-backdrop-overlay fixed inset-0 w-screen h-screen z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in bg-slate-950/80 backdrop-blur-sm overflow-hidden"
        onClick={onClose}
      >
        <div
          className="w-full max-w-5xl max-h-[90vh] bg-[#131B2A] border border-[#2C384E] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-[#2C384E] flex items-center justify-between gap-4 shrink-0 bg-[#0B0F17]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <FolderTree className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-extrabold text-lg text-white truncate">
                    Templates in {category.name}
                  </h3>
                  <span className="text-[11px] font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/30 font-semibold shrink-0">
                    /{category.slug}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono font-bold shrink-0">
                    {totalTemplates} {totalTemplates === 1 ? "Template" : "Templates"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                  {category.description || "Visual graphic templates linked to this master template category."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition cursor-pointer shrink-0"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Filter Header Bar */}
          <div className="px-5 py-3.5 border-b border-[#2C384E] bg-[#0E1522] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={`Search templates in ${category.name}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-[#131B2A] border border-[#2C384E] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>Showing:</span>
              <span className="text-teal-400 font-bold">{templates.length}</span>
              <span>of</span>
              <span className="text-white font-bold">{totalTemplates}</span>
            </div>
          </div>

          {/* Modal Scrollable Content Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: limit }).map((_, i) => (
                  <div
                    key={`skel-cat-tpl-${i}`}
                    className="border border-[#2C384E] rounded-2xl p-3 bg-[#0B0F17] space-y-3 animate-pulse"
                  >
                    <div className="aspect-square rounded-xl bg-slate-800" />
                    <div className="h-3.5 bg-slate-800 rounded w-3/4" />
                    <div className="h-2.5 bg-slate-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs">
                Failed to load templates for this category. Please try again.
              </div>
            ) : templates.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-2xl text-slate-400 text-xs space-y-2 bg-[#0B0F17]/40">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto">
                  <FileCode2 className="w-6 h-6 text-teal-400" />
                </div>
                <p className="font-heading font-bold text-sm text-white">
                  {search ? `No templates matching "${search}"` : "No templates in this category yet"}
                </p>
                <p className="text-slate-400 max-w-md mx-auto">
                  {search
                    ? "Try adjusting your search keywords to find the desired graphic templates."
                    : `Master graphic templates assigned to "${category.name}" will automatically appear here with high-resolution previews.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => setLightboxItem(tpl)}
                    className="group relative border border-[#2C384E] rounded-2xl overflow-hidden hover:border-teal-500/60 hover:shadow-xl transition-all cursor-pointer bg-[#0B0F17] flex flex-col justify-between"
                  >
                    {/* Image Preview Container */}
                    <div className="aspect-square relative overflow-hidden bg-slate-950 flex items-center justify-center">
                      <img
                        src={tpl.baseImageUrl}
                        alt={tpl.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-2 text-center">
                        <span className="px-3 py-1.5 rounded-lg bg-teal-500 text-slate-950 text-xs font-bold shadow-md transform translate-y-1 group-hover:translate-y-0 transition flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview Graphic</span>
                        </span>
                        <span className="text-[10px] text-slate-300 font-mono">
                          Click to inspect
                        </span>
                      </div>

                      {/* Subtle, Lightweight Festival Occasion Tag (Top Left) */}
                      {tpl.festival?.name && (
                        <div className="absolute top-2 left-2 max-w-[55%] pointer-events-none">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/75 backdrop-blur-md border border-slate-700/60 text-slate-300 text-[10px] font-medium shadow-sm truncate">
                            <span className="text-amber-400 text-[11px] shrink-0">🪔</span>
                            <span className="truncate">{tpl.festival.name}</span>
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
                        className="text-xs font-semibold text-white truncate group-hover:text-teal-400 transition-colors"
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
          </div>

          {/* Modal Footer with Pagination */}
          {templates.length > 0 && (
            <div className="p-4 border-t border-[#2C384E] bg-[#0B0F17] shrink-0">
              <Pagination
                meta={meta}
                currentPage={page}
                totalPages={meta?.totalPages || Math.max(1, Math.ceil(totalTemplates / limit))}
                onPageChange={(newPage) => setPage(newPage)}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
                pageSizeOptions={[8, 12, 16, 24]}
                className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300"
              />
            </div>
          )}
        </div>
      </div>

      {/* Full-resolution Image Lightbox Viewer */}
      {lightboxItem && (
        <ImageLightbox
          isOpen={Boolean(lightboxItem)}
          item={{
            title: lightboxItem.title,
            imageUrl: lightboxItem.baseImageUrl,
            caption: `${lightboxItem.title} • ${category.name}`,
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
    </>
  );
};

export default CategoryTemplatesModal;
