import React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { FolderKanban, X, ImageIcon, CheckSquare, Square, Trash2 } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import Pagination from '@/components/ui/Pagination';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { SearchBar } from '@/components/ui/SearchBar';
import { GraphicCard } from "./VaultAssetGrid";
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { VaultAssetGrid } from "./VaultAssetGrid";

/**
 * VaultView
 * Pure Presentational Component rendering Vault items grid, search bars, and full-screen lightbox.
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
  vaultItems,
  meta,
  isLoading,
  error,
  deleteMutation,
  bulkDeleteMutation,
  selectedIds = [],
  handleToggleSelect,
  handleSelectAll,
  handleClearSelection,
  handleBulkDelete,
  handleDownload,
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
                Organize, inspect, and download your final composited brand graphics.
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
      {error ? (
        <Alert variant="error" message="Failed to load vault items. Please try again." />
      ) : (
        <VaultAssetGrid
          vaultItems={vaultItems || []}
          meta={meta}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onPreview={setFullscreenItem}
          onDownload={handleDownload}
          onDelete={(id) => deleteMutation.mutate(id)}
          isDeleting={deleteMutation.isPending}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
        />
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
