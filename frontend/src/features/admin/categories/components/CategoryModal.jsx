import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderKanban, Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { categoryFormSchema } from '@/features/admin/categories/validations/category.validation';

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
 * CategoryModal Component
 * Reusable modal for creating or updating master business industry categories.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Modal close callback
 * @param {Object|null} [props.category=null] - Category object to edit (null for creation)
 * @param {Function} props.onSubmit - Submission handler called with { name, description }
 * @param {boolean} [props.isPending=false] - Mutation loading state
 */
export const CategoryModal = ({
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
    resolver: zodResolver(categoryFormSchema),
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
      className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2C384E] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              {isEditing ? (
                <Pencil className="w-4 h-4 text-amber-400" />
              ) : (
                <FolderKanban className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-white">
                {isEditing ? "Edit Business Category" : "Add Business Category"}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing
                  ? `Updating industry category "${category.name}"`
                  : "Create a system-wide category for business targeting."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Input
              label="Category Name *"
              placeholder="e.g. Jewelry & Gold, Real Estate, Dental Clinic"
              error={errors.name?.message}
              {...register("name")}
            />

            {/* Live Slug Preview */}
            {slugPreview && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="text-slate-500">Slug:</span>
                <span className="font-mono bg-[#0B0F17] px-2 py-0.5 rounded border border-[#2C384E] text-amber-300">
                  {slugPreview}
                </span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                Industry Description (Optional)
              </label>
              <span className="text-[10px] text-slate-500">
                {(watchedDescription || "").length}/300
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Provide a short description or business niche keywords for AI prompt guidance..."
              maxLength={300}
              {...register("description")}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 placeholder:text-slate-500 transition-colors resize-none"
            />
            {errors.description && (
              <p className="text-[11px] text-rose-400 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
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
              type="submit"
              variant="primary"
              size="md"
              icon={isEditing ? Pencil : Plus}
              isLoading={isPending}
            >
              {isEditing ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
