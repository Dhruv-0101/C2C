import React from "react";
import { createPortal } from "react-dom";
import { FolderKanban, Edit, X, ImageIcon } from "lucide-react";
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
  setPage,
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
  updateMutation,
  handleDownload,
  handleOpenEdit,
  handleSaveEdit,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
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

          {/* Reusable Search Bar */}
          <SearchBar
            placeholder="Search by occasion, category..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            className="w-full md:w-72"
          />
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
