import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "../../../../components/ui/Button";

/**
 * DeleteTemplateCategoryModal Component
 * Confirmation dialog before permanently deleting a template category.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Dismiss handler
 * @param {Object|null} props.category - Category to delete
 * @param {Function} props.onConfirm - Confirm delete handler
 * @param {boolean} [props.isPending=false] - Deletion pending state
 */
export const DeleteTemplateCategoryModal = ({
  isOpen,
  onClose,
  category,
  onConfirm,
  isPending = false,
}) => {
  if (!isOpen || !category) return null;

  const linkedTemplatesCount = category.templatesCount ?? category._count?.templates ?? 0;

  return (
    <div
      className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#131B2A] border border-rose-500/30 rounded-2xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#2C384E] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-white">
                Delete Template Category?
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-sm text-white">
              {category.name}
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
              /{category.slug}
            </span>
          </div>

          {category.description && (
            <p className="text-xs text-slate-400 line-clamp-2">
              {category.description}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
            <span>Linked templates:</span>
            <span className="text-teal-300 font-semibold">
              {linkedTemplatesCount} Graphic {linkedTemplatesCount === 1 ? "Template" : "Templates"}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Deleting this template category will remove it from the master theme list. Any existing templates linked to this category will have their category field unlinked safely without deleting the artwork.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2C384E]">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="md"
            onClick={() => onConfirm(category.id)}
            isLoading={isPending}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            <span>Delete Category</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
