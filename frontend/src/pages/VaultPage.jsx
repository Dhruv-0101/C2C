import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FolderKanban,
  Search,
  Trash2,
  Edit,
  Download,
  Maximize2,
  X,
  Sparkles,
  Calendar,
  Tag,
  ImageIcon,
} from 'lucide-react';
import { useVault } from '../hooks/useVault';
import { vaultApi } from '../services/vault.api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import Pagination from '../components/common/Pagination';
import { FeedbackModal } from '../components/common/FeedbackModal';
import { useFeedbackModal } from '../hooks/useFeedbackModal';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * Production-Grade User Content Vault & Media Assets Management Page
 */
export const VaultPage = () => {
  const queryClient = useQueryClient();
  const { modalProps, showSuccess, showError } = useFeedbackModal();

  // Pagination & Search States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [search, setSearch] = useState('');

  // Modals & Lightbox States
  const [fullscreenItem, setFullscreenItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({ occasionName: '', categoryName: '' });

  // Fetch Vault Items with pagination & search
  const { vaultItems, meta, isLoading, error, refetch } = useVault({
    page,
    limit,
    search,
  });

  // Delete Vault Item Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => vaultApi.deleteVaultItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VAULT.ALL });
      showSuccess('Vault item deleted successfully');
    },
    onError: (err) => {
      showError(err.response?.data?.message || 'Failed to delete vault item');
    },
  });

  // Update Vault Item Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => vaultApi.updateVaultItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VAULT.ALL });
      setEditingItem(null);
      showSuccess('Vault item updated successfully');
    },
    onError: (err) => {
      showError(err.response?.data?.message || 'Failed to update vault item');
    },
  });

  // Handle Download Image
  const handleDownload = (graphicUrl, title) => {
    const link = document.createElement('a');
    link.href = graphicUrl;
    link.download = `${title || 'BrandFlow-Vault-Post'}.png`;
    link.target = '_blank';
    link.click();
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditFormData({
      occasionName: item.occasionName || '',
      categoryName: item.categoryName || '',
    });
  };

  // Submit Edit Form
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingItem) return;
    updateMutation.mutate({
      id: editingItem.id,
      data: editFormData,
    });
  };

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

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by occasion, category..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
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
              <Card
                key={item.id}
                className="p-3 bg-[#0B0F17] border-[#2C384E] hover:border-amber-500/50 transition group space-y-3 flex flex-col justify-between"
              >
                {/* Image Container with Hover Zoom */}
                <div
                  onClick={() => setFullscreenItem(item)}
                  className="aspect-square rounded-xl bg-[#131B2A] overflow-hidden relative border border-[#2C384E] cursor-pointer group/img"
                  title="Click for Full Screen Big View"
                >
                  <img
                    src={item.graphicUrl}
                    alt={item.occasionName || 'Vault Post Graphic'}
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 backdrop-blur-[2px]">
                    <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 transform scale-90 group-hover/img:scale-100 transition-transform">
                      <Maximize2 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-white bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                      Full Screen Big View
                    </span>
                  </div>

                  {item.categoryName && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] uppercase shadow z-10">
                      {item.categoryName}
                    </span>
                  )}
                </div>

                {/* Info & Action Controls */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="truncate">
                      <h4 className="font-heading font-bold text-xs text-white truncate">
                        {item.occasionName || 'Social Graphic'}
                      </h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#2C384E]">
                    <Button
                      variant="outline"
                      onClick={() => handleDownload(item.graphicUrl, item.occasionName)}
                      className="flex-1 justify-center py-1.5 text-xs text-amber-400 border-[#2C384E] hover:bg-amber-500/10"
                      title="Download HD PNG"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> HD
                    </Button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-lg bg-[#131B2A] hover:bg-slate-800 text-slate-300 hover:text-white border border-[#2C384E] transition"
                      title="Edit Item Details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(item.id)}
                      disabled={deleteMutation.isPending}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white transition"
                      title="Delete from Vault"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Central Modular Pagination */}
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
          document.body
        )}

      {/* Full Screen High-Res Lightbox Modal */}
      {fullscreenItem &&
        createPortal(
          <div
            onClick={() => setFullscreenItem(null)}
            className="fixed inset-0 w-screen h-screen z-[99999] flex flex-col items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-lg animate-in fade-in duration-200 select-none cursor-zoom-out"
          >
            {/* Top Bar */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-4 left-4 right-4 max-w-5xl mx-auto flex items-center justify-between z-10 bg-[#131B2A]/90 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-[#2C384E] shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-white truncate max-w-md">
                    {fullscreenItem.occasionName || 'Social Graphic'}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    Category: {fullscreenItem.categoryName || 'General'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  icon={Download}
                  onClick={() =>
                    handleDownload(fullscreenItem.graphicUrl, fullscreenItem.occasionName)
                  }
                  className="py-1.5 text-xs font-bold"
                >
                  Download HD
                </Button>
                <button
                  onClick={() => setFullscreenItem(null)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Close Full Screen View"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* High Resolution Image Container */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[82vh] aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-[#2C384E] bg-[#0B0F17] flex items-center justify-center my-auto cursor-default"
            >
              <img
                src={fullscreenItem.graphicUrl}
                alt={fullscreenItem.occasionName}
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-xs text-slate-400 mt-3 font-mono">
              Click anywhere outside or press X to exit full screen view
            </p>
          </div>,
          document.body
        )}

      {/* Reusable Feedback Modal */}
      <FeedbackModal {...modalProps} />
    </div>
  );
};

export default VaultPage;
