import React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Edit, X, ImageIcon, CheckSquare, Square, Trash2 } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Alert } from "../../../components/ui/Alert";
import Pagination from "../../../components/common/Pagination";
import { FeedbackModal } from "../../../components/common/FeedbackModal";
import { SearchBar } from "../../../components/common/SearchBar";
import { GraphicCard } from "../../../components/common/GraphicCard";
import { ImageLightbox } from "../../../components/common/ImageLightbox";

/**
 * VaultView
 * Pure Presentational Component rendering Vault items grid, search bars, edit modals, and full-screen lightbox.
 */
export const VaultView = ({
  modalProps,
  page,
  setPage,
  limit,
  setLimit,
  search,
  setSearch,
  fullscreenItem,
  setFullscreenItem,
  editingItem,
  setEditingItem,
  editFormData,
  setEditFormData,
  vaultItems,
  meta,
  isLoading,
  error,
  deleteMutation,
  bulkDeleteMutation,
  updateMutation,
  selectedIds = [],
  handleToggleSelect,
  handleSelectAll,
  handleClearSelection,
  handleBulkDelete,
  handleDownload,
  handleOpenEdit,
  handleSaveEdit,
}) => {
  const navigate = useNavigate();
  const isAllCurrentSelected =
    vaultItems &&
    vaultItems.length > 0 &&
    vaultItems.every((item) => selectedIds.includes(item.id));

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative pb-16">
      {/* Top Header Card */}
      <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl text-white">
                Content Vault & Media Assets
              </h1>
              <p className="text-xs text-slate-400">
                Organize, inspect, edit, and download your final composited brand graphics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Select All Page Button */}
            {vaultItems && vaultItems.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#0B0F17] hover:bg-slate-800 border border-[#2C384E] rounded-xl flex items-center gap-2 transition cursor-pointer"
                title={isAllCurrentSelected ? "Deselect current page" : "Select all on current page"}
              >
                {isAllCurrentSelected ? (
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>{isAllCurrentSelected ? "Deselect Page" : "Select Page"}</span>
              </button>
            )}

            {/* Reusable Search Bar */}
            <SearchBar
              placeholder="Search by occasion, category..."
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              className="w-full md:w-64"
            />
          </div>
        </div>
      </Card>

      {/* Main Grid View */}
      {isLoading ? (
        <Card className="p-12 text-center text-slate-400 text-sm bg-[#131B2A] border-[#2C384E]">
          Loading your vault items...
        </Card>
      ) : error ? (
        <Alert variant="error" message="Failed to load vault items. Please try again." />
      ) : vaultItems.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-[#2C384E] bg-[#131B2A] rounded-2xl space-y-3">
          <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-slate-200 font-bold text-base">Your Vault is Empty</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            When you create post graphics in the Post Creator or Festival Studio, final PNG images are automatically saved to your Vault!
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {vaultItems.map((item) => (
              <GraphicCard
                key={item.id}
                imageUrl={item.graphicUrl}
                title={item.occasionName || "Social Graphic"}
                category={item.categoryName}
                date={new Date(item.createdAt).toLocaleDateString()}
                onPreview={() => setFullscreenItem(item)}
                onDownload={() => handleDownload(item.graphicUrl, item.occasionName)}
                onEdit={() => handleOpenEdit(item)}
                onDelete={() => deleteMutation.mutate(item.id)}
                isDeleting={deleteMutation.isPending}
                isSelected={selectedIds.includes(item.id)}
                onToggleSelect={() => handleToggleSelect(item.id)}
              />
            ))}
          </div>

          <Pagination
            meta={meta}
            onPageChange={(newPage) => setPage(newPage)}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            pageSizeOptions={[4, 8, 12, 24]}
          />
        </div>
      )}

      {/* Floating Sticky Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#131B2A]/95 border border-amber-500/40 shadow-2xl backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span>Selected</span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs text-slate-300 hover:text-amber-400 font-medium transition cursor-pointer flex items-center gap-1"
          >
            {isAllCurrentSelected ? "Deselect Page" : "Select All Page"}
          </button>

          <button
            type="button"
            onClick={handleClearSelection}
            className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
          >
            Clear
          </button>

          <div className="h-4 w-px bg-slate-700" />

          <Button
            variant="danger"
            onClick={handleBulkDelete}
            isLoading={bulkDeleteMutation?.isPending}
            className="py-1.5 px-4 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl flex items-center gap-1.5 shadow-lg shadow-rose-600/20 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Selected ({selectedIds.length})
          </Button>
        </div>
      )}

      {/* Edit Vault Item Modal */}
      {editingItem &&
        createPortal(
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
            <div className="w-full max-w-md bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-5 shadow-2xl my-auto">
              <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <Edit className="w-4 h-4 text-amber-400" />
                  <span>Edit Vault Item</span>
                </h3>
                <button
                  onClick={() => setEditingItem(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <Input
                  label="Occasion Name"
                  placeholder="e.g. Diwali Offer Promo"
                  value={editFormData.occasionName}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, occasionName: e.target.value })
                  }
                />
                <Input
                  label="Category Name"
                  placeholder="e.g. Festival / Real Estate / Retail"
                  value={editFormData.categoryName}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, categoryName: e.target.value })
                  }
                />

                <div className="flex justify-end gap-3 pt-3 border-t border-[#2C384E]">
                  <Button variant="ghost" type="button" onClick={() => setEditingItem(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    isLoading={updateMutation.isPending}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* Reusable High-Res Lightbox Modal */}
      <ImageLightbox
        isOpen={Boolean(fullscreenItem)}
        item={fullscreenItem}
        onClose={() => setFullscreenItem(null)}
        onDownload={handleDownload}
      />

      <FeedbackModal {...modalProps} />
    </div>
  );
};
