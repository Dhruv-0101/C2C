import React from "react";
import { FolderKanban, Plus, Trash2 } from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Alert } from "../../../../components/ui/Alert";
import { SearchBar } from "../../../../components/common/SearchBar";
import Pagination from "../../../../components/common/Pagination";

/**
 * AdminCategoriesTab Component
 * Business Categories management interface providing industry category creation, search, and deletion.
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
  deleteCategoryMutation,
}) => {
  return (
    <div className="animate-in fade-in duration-200 space-y-4">
      {/* Category Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
        <div>
          <h3 className="font-heading font-extrabold text-xl text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-amber-400" />
            <span>Master Business Categories</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Manage system-wide industry categories used for template filtering.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SearchBar
            value={categorySearch}
            onChange={(e) => {
              setCategorySearch(e.target.value);
              setCategoryPage(1);
            }}
            placeholder="Search categories..."
            className="max-w-sm"
          />

          <form
            onSubmit={handleAddCategory}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <input
              type="text"
              placeholder="New category name..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Plus}
              isLoading={createCategoryMutation.isPending}
              className="shrink-0"
            >
              Add Category
            </Button>
          </form>
        </div>
      </div>

      {/* Error Alert */}
      {categoryError && <Alert variant="error" message={categoryError} />}

      {/* Categories Grid */}
      {isLoadingCategories ? (
        <div className="p-8 text-center text-slate-400 text-sm">
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-[#2C384E] rounded-xl text-slate-400 text-sm">
          No categories found.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Card
                key={cat.id}
                className="p-4 bg-[#131B2A] border-[#2C384E] flex items-center justify-between group hover:border-amber-500/50 transition"
              >
                <div>
                  <p className="font-bold text-sm text-white">{cat.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    slug: {cat.slug}
                  </p>
                </div>
                <button
                  onClick={() => deleteCategoryMutation.mutate(cat.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>

          <Pagination
            meta={categoryMeta}
            currentPage={categoryPage}
            totalPages={categoryMeta?.totalPages || 1}
            onPageChange={setCategoryPage}
            onLimitChange={(newLimit) => {
              setCategoryLimit(newLimit);
              setCategoryPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
};
