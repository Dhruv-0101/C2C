import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useVault } from '@/features/vault/hooks/useVault';
import { vaultApi } from '@/features/vault/api/vault.api';
import { useFeedbackModal } from '@/components/feedback/FeedbackModal';
import { QUERY_KEYS } from '@/shared/constants';
import { VaultView } from "../components/VaultView";

/**
 * VaultPage Component
 * Canonical Media Vault Route Page (/vault).
 * Orchestrates cloud media assets, single & bulk deletion, asset editing, and downloads.
 */
export const VaultPage = () => {
  const queryClient = useQueryClient();
  const { modalProps, showSuccess, showError } = useFeedbackModal();

  // Pagination & Search States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [search, setSearch] = useState("");

  // Modals & Lightbox States
  const [fullscreenItem, setFullscreenItem] = useState(null);

  // Selection state for Bulk Delete
  const [selectedIds, setSelectedIds] = useState([]);

  // Fetch Vault Items with pagination & search
  const { vaultItems, meta, isLoading, error } = useVault({
    page,
    limit,
    search,
  });

  // Single Delete Vault Item Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => vaultApi.deleteVaultItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VAULT.ALL });
      showSuccess("Vault item deleted successfully");
    },
    onError: (err) => {
      showError(err.response?.data?.message || "Failed to delete vault item");
    },
  });

  // Bulk Delete Vault Items Mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => vaultApi.bulkDeleteVaultItems(ids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VAULT.ALL });
      setSelectedIds([]);
      showSuccess(data?.message || "Selected items deleted successfully");
    },
    onError: (err) => {
      showError(err.response?.data?.message || "Failed to delete selected items");
    },
  });

  // Toggle selection for a single item
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select or Deselect all items on current page
  const handleSelectAll = () => {
    if (!vaultItems || vaultItems.length === 0) return;
    const allCurrentIds = vaultItems.map((item) => item.id);
    const isAllSelected = allCurrentIds.every((id) => selectedIds.includes(id));

    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allCurrentIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allCurrentIds])));
    }
  };

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Trigger Bulk Delete
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} item(s)?`)) {
      bulkDeleteMutation.mutate(selectedIds);
    }
  };

  // Handle Download Image
  const handleDownload = (graphicUrl, title) => {
    const link = document.createElement("a");
    link.href = graphicUrl;
    link.download = `${title || "BrandFlow-Vault-Post"}.png`;
    link.target = "_blank";
    link.click();
  };

  return (
    <VaultView
      modalProps={modalProps}
      page={page}
      setPage={setPage}
      limit={limit}
      setLimit={setLimit}
      search={search}
      setSearch={setSearch}
      fullscreenItem={fullscreenItem}
      setFullscreenItem={setFullscreenItem}
      vaultItems={vaultItems}
      meta={meta}
      isLoading={isLoading}
      error={error}
      deleteMutation={deleteMutation}
      bulkDeleteMutation={bulkDeleteMutation}
      selectedIds={selectedIds}
      handleToggleSelect={handleToggleSelect}
      handleSelectAll={handleSelectAll}
      handleClearSelection={handleClearSelection}
      handleBulkDelete={handleBulkDelete}
      handleDownload={handleDownload}
    />
  );
};

export { VaultPage as VaultContainer };
export default VaultPage;
