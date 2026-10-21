import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderTree, Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { templateCategoryFormSchema } from '@/features/admin/template-categories/validations/templateCategory.validation';

/**
 * Generate a slug preview string
 */
function toSlugPreview(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * TemplateCategoryModal Component
 * Reusable modal for creating or updating master template categories.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Modal close callback
 * @param {Object|null} [props.category=null] - Category object to edit (null for creation)
 * @param {Function} props.onSubmit - Submission handler called with { name, description }
 * @param {boolean} [props.isPending=false] - Mutation loading state
 */
export const TemplateCategoryModal = ({
  isOpen,
  onClose,
  category = null,
  onSubmit,
  isPending = false,
}) => {
  const isEditing = Boolean(category?.id);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(templateCategoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const watchedName = watch("name", "");
  const watchedDescription = watch("description", "");

  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({
          name: category.name || "",
          description: category.description || "",
        });
      } else {
        reset({
          name: "",
          description: "",
        });
      }
    }
  }, [isOpen, category, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  const slugPreview = toSlugPreview(watchedName);

  return (
    <div
      className="modal-backdrop-overlay fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#131B2A] border border-[#2C384E] rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 mx-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between border-b border-[#2C384E] pb-3.5 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              {isEditing ? (
                <Pencil className="w-4 h-4 text-teal-400" />
              ) : (
                <FolderTree className="w-4 h-4 text-teal-400" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-base text-white truncate">
                {isEditing ? "Edit Template Category" : "Create Template Category"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                {isEditing
                  ? "Update category details and descriptive theme metadata"
                  : "Define a visual classification theme for graphic poster templates"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Category Name */}
          <div className="space-y-1.5">
            <Input
              label="Category Name"
              placeholder="e.g. Festive & Celebrations, Mega Offers, Hiring"
              {...register("name")}
              error={errors.name?.message}
              autoFocus
            />

            {/* Live Slug Preview */}
            {watchedName.trim() && (
              <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 pl-0.5">
                <span className="text-slate-500">Auto Slug:</span>
                <span className="text-teal-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  /{slugPreview}
                </span>
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Description <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Provide context on when templates under this visual theme should be used..."
              className="w-full bg-[#0B0F17] border border-[#2C384E] rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors resize-none"
            />
            {errors.description && (
              <p className="text-[11px] text-rose-400 font-medium">
                {errors.description.message}
              </p>
            )}
            <p className="text-[11px] text-slate-500 text-right">
              {watchedDescription.length}/500
            </p>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-[#2C384E]">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isPending}
              className="w-full sm:w-auto min-h-[40px] justify-center text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isPending}
              className="w-full sm:w-auto min-h-[40px] justify-center bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
            >
              {isEditing ? (
                <>
                  <Pencil className="w-4 h-4 mr-1.5" />
                  <span>Update Category</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>Create Category</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateCategoryModal;
