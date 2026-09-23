import React, { useState } from "react";
import { FolderTree, Plus, Trash2, User, Pencil, FileCode2 } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Alert } from "../../../../components/ui/Alert";
import { SearchBar } from "../../../../components/common/SearchBar";
import Pagination from "../../../../components/common/Pagination";
import { TemplateCategoryModal } from "../modals/TemplateCategoryModal";
import { DeleteTemplateCategoryModal } from "../modals/DeleteTemplateCategoryModal";

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
      <div className="bg-[#131B2A] border border-[#2C384E] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Table Column Headers */}
            <thead className="bg-[#0B0F17] text-slate-400 font-mono uppercase text-[11px] border-b border-[#2C384E]">
              <tr>
                <th className="py-3 px-4 font-bold">Category Title & Slug</th>
                <th className="py-3 px-4 font-bold">Theme Description</th>
                <th className="py-3 px-4 font-bold text-center">Linked Templates</th>
                <th className="py-3 px-4 font-bold">Created By</th>
                <th className="py-3 px-4 font-bold">Date Created</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Row Content */}
            <tbody className="divide-y divide-[#2C384E]/60">
              {isLoadingTemplateCategories ? (
                /* Loading State Skeleton Rows */
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-800 rounded w-36 mb-2"></div>
                      <div className="h-3 bg-slate-900 rounded w-24"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3.5 bg-slate-800 rounded w-48"></div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 bg-slate-800 rounded w-16 mx-auto"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3.5 bg-slate-800 rounded w-28"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3.5 bg-slate-800 rounded w-20"></div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-8 bg-slate-800 rounded w-16 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : templateCategories.length > 0 ? (
                /* Dynamic Category Rows */
                templateCategories.map((cat) => {
                  const templatesCount = cat.templatesCount ?? cat._count?.templates ?? 0;
                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-slate-900/40 transition-colors group"
                    >
                      {/* Name & Slug */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                            <FolderTree className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-heading font-bold text-white text-sm group-hover:text-teal-400 transition-colors block">
                              {cat.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800/80 inline-block mt-0.5">
                              /{cat.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="text-slate-300 line-clamp-2">
                          {cat.description || (
                            <span className="text-slate-500 italic">No description provided</span>
                          )}
                        </span>
                      </td>

                      {/* Linked Templates Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            templatesCount > 0
                              ? "bg-teal-500/10 text-teal-300 border-teal-500/30 font-bold"
                              : "bg-slate-800/60 text-slate-400 border-slate-700/60"
                          }`}
                        >
                          <FileCode2 className="w-3 h-3 text-teal-400" />
                          <span>{templatesCount} {templatesCount === 1 ? "Template" : "Templates"}</span>
                        </span>
                      </td>

                      {/* Creator */}
                      <td className="py-3.5 px-4">
                        {cat.creator ? (
                          <div className="flex items-center gap-2">
                            {cat.creator.avatarUrl ? (
                              <img
                                src={cat.creator.avatarUrl}
                                alt={cat.creator.fullName}
                                className="w-6 h-6 rounded-full object-cover border border-[#2C384E]"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-[#2C384E]">
                                <User className="w-3 h-3" />
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-white font-medium text-xs leading-tight">
                                {cat.creator.fullName || "Admin"}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {cat.creator.role || "ADMIN"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-mono">System</span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap text-[11px] font-mono">
                        {new Date(cat.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(cat)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors border border-transparent hover:border-[#2C384E]"
                            title="Edit Category"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCategoryToDelete(cat)}
                            disabled={Boolean(cat.isSystem)}
                            className={`p-1.5 rounded-lg transition-colors border border-transparent ${
                              cat.isSystem
                                ? "text-slate-600 cursor-not-allowed"
                                : "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/30"
                            }`}
                            title={cat.isSystem ? "System categories cannot be deleted" : "Delete Category"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                /* Empty Results State */
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                        <FolderTree className="w-6 h-6 text-teal-400/50" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-heading font-bold text-sm text-white">
                          No Template Categories Found
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          {templateCategorySearch
                            ? `No categories matching "${templateCategorySearch}". Try a different keyword.`
                            : "Create your first template category to organize visual themes for graphic templates."}
                        </p>
                      </div>
                      {!templateCategorySearch && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleOpenCreateModal}
                          className="mt-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          <span>Add First Category</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {templateCategoryMeta && templateCategoryMeta.totalPages > 1 && (
          <div className="p-4 border-t border-[#2C384E] bg-[#0B0F17]/50">
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
          </div>
        )}
      </div>

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
