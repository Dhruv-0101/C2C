import React, { useState } from "react";
import { FolderTree, Plus, Trash2, User, Pencil, FileCode2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { SearchBar } from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';
import { TemplateCategoryModal } from "./components/TemplateCategoryModal";
import { DeleteTemplateCategoryModal } from "./components/DeleteTemplateCategoryModal";
import { TemplateCategoryTable } from "./components/TemplateCategoryTable";

/**
 * AdminTemplateCategoriesTab Component
 * Master Graphic Template Categories management interface providing full CRUD operations,
 * debounced search, and pagination.
 */
export const AdminTemplateCategoriesTab = ({
  templateCategories = [],
  templateCategoryMeta,
  isLoadingTemplateCategories,
  templateCategoryError,
  templateCategorySearch,
  setTemplateCategorySearch,
  templateCategoryPage,
  setTemplateCategoryPage,
  setTemplateCategoryLimit,
  createTemplateCategoryMutation,
  updateTemplateCategoryMutation,
  deleteTemplateCategoryMutation,
}) => {
  // Modal states for Create / Edit / Delete
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  /**
   * Opens the TemplateCategoryModal in creation mode
   */
  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  /**
   * Opens the TemplateCategoryModal in edit mode for a specific category
   * @param {Object} cat - Category to edit
   */
  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  /**
   * Handles submission from the TemplateCategoryModal (both Create & Edit)
   * @param {Object} data - { name, description }
   */
  const handleCategoryModalSubmit = (data) => {
    if (editingCategory) {
      updateTemplateCategoryMutation.mutate(
        { id: editingCategory.id, data },
        {
          onSuccess: () => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
          },
        }
      );
    } else {
      createTemplateCategoryMutation.mutate(data, {
        onSuccess: () => {
          setIsCategoryModalOpen(false);
        },
      });
    }
  };

  /**
   * Handles confirmed deletion from DeleteTemplateCategoryModal
   * @param {string} id - Category ID
   */
  const handleConfirmDelete = (id) => {
    deleteTemplateCategoryMutation.mutate(id, {
      onSuccess: () => {
        setCategoryToDelete(null);
      },
    });
  };

  return (
    <div className="animate-in fade-in duration-200 space-y-4">
      {/* Category Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
        <div>
          <h3 className="font-heading font-extrabold text-xl text-white flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-teal-400" />
            <span>Master Template Categories</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Manage visual themes and artwork classifications (e.g., Festival, Hiring, Mega Sale, Motivation).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <SearchBar
            value={templateCategorySearch}
            onChange={(val) => {
              const query = typeof val === "string" ? val : (val?.target?.value ?? "");
              setTemplateCategorySearch(query);
              setTemplateCategoryPage(1);
            }}
            placeholder="Search template categories..."
            className="w-full sm:w-64"
          />

          <Button
            type="button"
            variant="primary"
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 shadow-sm font-semibold shrink-0 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Template Category</span>
          </Button>
        </div>
      </div>

      {/* Error Feedback Display */}
      {templateCategoryError && (
        <Alert variant="destructive" className="border-rose-500/50 bg-rose-500/10 text-rose-300">
          <span>{templateCategoryError}</span>
        </Alert>
      )}

      {/* Main Categories Table Viewport */}
      <TemplateCategoryTable
        categories={templateCategories}
        isLoading={isLoadingTemplateCategories}
        categorySearch={templateCategorySearch}
        setCategorySearch={setTemplateCategorySearch}
        onOpenCreate={handleOpenCreateModal}
        onOpenEdit={handleOpenEditModal}
        onOpenDelete={setCategoryToDelete}
      />

      {templateCategoryMeta && templateCategoryMeta.totalPages > 1 && (
        <Pagination
          currentPage={templateCategoryPage}
          totalPages={templateCategoryMeta.totalPages}
          totalItems={templateCategoryMeta.totalItems}
          itemsPerPage={templateCategoryMeta.limit}
          onPageChange={(page) => setTemplateCategoryPage(page)}
          onItemsPerPageChange={(limit) => {
            setTemplateCategoryLimit(limit);
            setTemplateCategoryPage(1);
          }}
        />
      )}

      {/* Create / Edit Category Modal */}
      <TemplateCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSubmit={handleCategoryModalSubmit}
        isPending={
          createTemplateCategoryMutation.isPending ||
          updateTemplateCategoryMutation.isPending
        }
      />

      {/* Delete Confirmation Modal */}
      <DeleteTemplateCategoryModal
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        category={categoryToDelete}
        onConfirm={handleConfirmDelete}
        isPending={deleteTemplateCategoryMutation.isPending}
      />
    </div>
  );
};

export default AdminTemplateCategoriesTab;
