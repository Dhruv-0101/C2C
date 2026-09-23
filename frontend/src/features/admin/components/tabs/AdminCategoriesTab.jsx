import React, { useState } from "react";
import { FolderKanban, Plus, Trash2, User, Pencil } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Alert } from "../../../../components/ui/Alert";
import { SearchBar } from "../../../../components/common/SearchBar";
import Pagination from "../../../../components/common/Pagination";
import { CategoryModal } from "../modals/CategoryModal";
import { DeleteCategoryModal } from "../modals/DeleteCategoryModal";

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
      {isLoadingCategories ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-2xl text-slate-400 text-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <FolderKanban className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="font-heading font-semibold text-white">No categories found</p>
            <p className="text-xs text-slate-400 mt-1">
              {categorySearch
                ? `No categories matching "${categorySearch}"`
                : "Get started by adding your first master business category."}
            </p>
          </div>
          {categorySearch ? (
            <button
              onClick={() => setCategorySearch("")}
              className="text-xs text-amber-400 hover:underline cursor-pointer"
            >
              Clear search filter
            </button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleOpenCreateModal}
              className="mx-auto mt-2"
            >
              Add Category
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Vertical Category List Rows */}
          <div className="space-y-2.5">
            {categories.map((cat) => {
              const createdDate = cat.createdAt
                ? new Date(cat.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : null;

              return (
                <div
                  key={cat.id}
                  className="px-4 py-3 rounded-2xl bg-[#131B2A] border border-[#2C384E] hover:border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 group hover:shadow-lg shadow-sm"
                >
                  {/* Left: Category Icon, Name & Slug */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-amber-500/20 transition duration-200">
                      <FolderKanban className="w-5 h-5 text-amber-400" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-bold text-sm text-white truncate">
                          {cat.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-[#0B0F17] border border-[#2C384E] px-2 py-0.5 rounded-md">
                          {cat.slug}
                        </span>
                      </div>

                      {cat.description && (
                        <p className="text-xs text-slate-400 truncate max-w-xl mt-0.5">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Metadata Badges & Actions */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {/* Creator Badge */}
                    {cat.creator ? (
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg border ${
                          cat.creator.role === "SUB_ADMIN"
                            ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                            : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        }`}
                        title={`Author: ${cat.creator.fullName} (${cat.creator.email})`}
                      >
                        <User className="w-3 h-3" />
                        <span className="truncate max-w-[130px]">
                          {cat.creator.role === "SUB_ADMIN" ? "SubAdmin: " : "Admin: "}
                          {cat.creator.fullName}
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/60">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>System</span>
                      </span>
                    )}

                    {/* Date Created */}
                    {createdDate && (
                      <span className="text-[11px] text-slate-400 font-mono hidden md:inline-block">
                        {createdDate}
                      </span>
                    )}

                    {/* Action Buttons: Edit & Delete */}
                    <div className="flex items-center gap-1">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(cat)}
                        className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30 transition cursor-pointer"
                        title="Edit Category"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setCategoryToDelete(cat)}
                        className="p-2 rounded-xl text-rose-500 bg-rose-500/10 hover:bg-rose-600 hover:text-white border border-rose-500/20 hover:border-rose-600 transition cursor-pointer shadow-sm"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
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
        </div>
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
