import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useVault } from "../../../hooks/useVault";
import { vaultApi } from "../../../services/vault.api";
import { useFeedbackModal } from "../../../hooks/useFeedbackModal";
import { QUERY_KEYS } from "../../../constants/queryKeys";
import { VaultView } from "../components/VaultView";

/**
 * VaultContainer
 * Container component handling queries, mutations, search/pagination, and modal states for content vault.
 */
export const VaultContainer = () => {
  const queryClient = useQueryClient();
  const { modalProps, showSuccess, showError } = useFeedbackModal();

  // Pagination & Search States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [search, setSearch] = useState("");

  // Modals & Lightbox States
  const [fullscreenItem, setFullscreenItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    occasionName: "",
    categoryName: "",
  });

  // Fetch Vault Items with pagination & search
  const { vaultItems, meta, isLoading, error } = useVault({
    page,
    limit,
    search,
  });

  // Delete Vault Item Mutation
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

  // Update Vault Item Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => vaultApi.updateVaultItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VAULT.ALL });
      setEditingItem(null);
      showSuccess("Vault item updated successfully");
    },
    onError: (err) => {
      showError(err.response?.data?.message || "Failed to update vault item");
    },
  });

  // Handle Download Image
  const handleDownload = (graphicUrl, title) => {
    const link = document.createElement("a");
    link.href = graphicUrl;
    link.download = `${title || "BrandFlow-Vault-Post"}.png`;
    link.target = "_blank";
    link.click();
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditFormData({
      occasionName: item.occasionName || "",
      categoryName: item.categoryName || "",
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
      editingItem={editingItem}
      setEditingItem={setEditingItem}
      editFormData={editFormData}
      setEditFormData={setEditFormData}
      vaultItems={vaultItems}
      meta={meta}
      isLoading={isLoading}
      error={error}
      deleteMutation={deleteMutation}
      updateMutation={updateMutation}
      handleDownload={handleDownload}
      handleOpenEdit={handleOpenEdit}
      handleSaveEdit={handleSaveEdit}
    />
  );
};
