import React from "react";
import { AlertTriangle, Trash2, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * DeleteSubAdminModal Component
 * Confirmation dialog before permanently revoking permissions and deleting a SubAdmin account.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Dismiss handler
 * @param {Object|null} props.subAdmin - SubAdmin user to delete
 * @param {Function} props.onConfirm - Confirm delete handler (receives subAdmin.id)
 * @param {boolean} [props.isPending=false] - Deletion pending state
 */
export const DeleteSubAdminModal = ({
  isOpen,
  onClose,
  subAdmin,
  onConfirm,
  isPending = false,
}) => {
  if (!isOpen || !subAdmin) return null;

  const counts = subAdmin._count || {};
  const totalCreated =
    (counts.templatesCreated || 0) +
    (counts.festivalsCreated || 0) +
    (counts.framesCreated || 0) +
    (counts.categoriesCreated || 0) +
    (counts.templateCategoriesCreated || 0);

  return (
    <div
      className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#131B2A] border border-rose-500/30 rounded-2xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#2C384E] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-white">
                Revoke SubAdmin Access?
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                This action will delete the SubAdmin account.
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

        {/* SubAdmin Details Card */}
        <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-sm text-white">
              {subAdmin.fullName || "SubAdmin"}
            </span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
              SUB_ADMIN
            </span>
          </div>

          <p className="text-xs text-slate-300 font-mono">
            {subAdmin.email}
          </p>

          <div className="pt-2 border-t border-[#2C384E]/60 space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center justify-between">
              <span>Allowed Admin Tabs:</span>
              <span className="text-slate-200 font-medium">
                {subAdmin.allowedTabs?.length || 0} tabs
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Items Created in System:</span>
              <span className="text-amber-300 font-medium">
                {totalCreated} items
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Revoking this account will permanently remove administrative credentials and dashboard access for this moderator. Any templates, categories, or frames created by them will be preserved safely.
        </p>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2C384E]">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            isDisabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            icon={Trash2}
            onClick={() => onConfirm(subAdmin.id)}
            isLoading={isPending}
          >
            Revoke Access
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSubAdminModal;
