import React, { useState } from "react";
import { FolderKanban, Plus, Trash2, User, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { SearchBar } from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';
import { CategoryModal } from "./components/CategoryModal";
import { DeleteCategoryModal } from "./components/DeleteCategoryModal";
import { CategoryTable } from "./components/CategoryTable";

/**
 * AdminCategoriesTab Component
 * Business Categories management interface providing full CRUD operations (Create, Read, Update, Delete),
 * live search, and pagination.
 */
export const AdminCategoriesTab = ({
  categories = [],
  categoryMeta,
  isLoadingCategories,
  categoryError,
  categorySearch,
  setCategorySearch,
  newCategory,
  setNewCategory,
  categoryPage,
  setCategoryPage,
  setCategoryLimit,
  handleAddCategory,
  createCategoryMutation,
  updateCategoryMutation,
  deleteCategoryMutation,
}) => {
  // Modal states for Create / Edit / Delete
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  /**
   * Opens the CategoryModal in creation mode
   */
  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  /**
   * Opens the CategoryModal in edit mode for a specific category
   * @param {Object} cat - Category to edit
   */
  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  /**
   * Handles submission from the CategoryModal (both Create & Edit)
   * @param {Object} data - { name, description }
   */
  const handleCategoryModalSubmit = (data) => {
    if (editingCategory) {
      updateCategoryMutation.mutate(
        { id: editingCategory.id, data },
        {
          onSuccess: () => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
          },
        }
      );
    } else {
      createCategoryMutation.mutate(data, {
        onSuccess: () => {
          setIsCategoryModalOpen(false);
        },
      });
    }
  };

  /**
   * Handles confirmed deletion from DeleteCategoryModal
   * @param {string} id - Category ID
   */
  const handleConfirmDelete = (id) => {
    deleteCategoryMutation.mutate(id, {
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
            <FolderKanban className="w-5 h-5 text-amber-400" />
            <span>Master Business Categories</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Manage system-wide industry categories used for template filtering and business targeting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Search Bar */}
          <SearchBar
            value={categorySearch}
            onChange={(val) => {
              const query = typeof val === "string" ? val : val?.target?.value ?? "";
              setCategorySearch(query);
              setCategoryPage(1);
            }}
            placeholder="Search categories..."
            className="w-full sm:w-72"
          />

          {/* Add Category Modal Trigger Button */}
          <Button
            type="button"
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenCreateModal}
            className="shrink-0"
          >
            Add Category
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {categoryError && <Alert variant="error" message={categoryError} />}

      {/* Categories List View */}
      <CategoryTable
        categories={categories}
        isLoading={isLoadingCategories}
        categorySearch={categorySearch}
        setCategorySearch={setCategorySearch}
        onOpenCreate={handleOpenCreateModal}
        onOpenEdit={handleOpenEditModal}
        onOpenDelete={setCategoryToDelete}
      />

      {categories.length > 0 && (
        <Pagination
          meta={categoryMeta}
          currentPage={categoryPage}
          totalPages={categoryMeta?.totalPages || 1}
          onPageChange={setCategoryPage}
          onLimitChange={(newLimit) => {
            setCategoryLimit(newLimit);
            setCategoryPage(1);
          }}
          pageSizeOptions={[10, 20, 30, 50]}
        />
      )}

      {/* Create / Edit Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSubmit={handleCategoryModalSubmit}
        isPending={
          createCategoryMutation.isPending || updateCategoryMutation?.isPending
        }
      />

      {/* Delete Confirmation Modal */}
      <DeleteCategoryModal
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        category={categoryToDelete}
        onConfirm={handleConfirmDelete}
        isPending={deleteCategoryMutation.isPending}
      />
    </div>
  );
};

export default AdminCategoriesTab;
