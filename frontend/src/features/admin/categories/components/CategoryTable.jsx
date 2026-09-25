import React from 'react';
import { FolderKanban, Plus, User, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

/**
 * CategoryTable Component
 * Renders master business category cards with creator badges, slugs, and actions.
 */
export const CategoryTable = ({
  categories = [],
  isLoading,
  categorySearch = '',
  setCategorySearch,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
}) => {
  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm">
        Loading categories...
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-2xl text-slate-400 text-sm space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <FolderKanban className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <p className="font-heading font-semibold text-white">No categories found</p>
          <p className="text-xs text-slate-400 mt-1">
            {categorySearch
              ? `No categories matching "${categorySearch}"`
              : 'Get started by adding your first master business category.'}
          </p>
        </div>
        {categorySearch ? (
          <button
            onClick={() => setCategorySearch && setCategorySearch('')}
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
            onClick={onOpenCreate}
            className="mx-auto mt-2"
          >
            Add Category
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {categories.map((cat) => {
        const createdDate = cat.createdAt
          ? new Date(cat.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
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
                    cat.creator.role === 'SUB_ADMIN'
                      ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                  title={`Author: ${cat.creator.fullName} (${cat.creator.email})`}
                >
                  <User className="w-3 h-3" />
                  <span className="truncate max-w-[130px]">
                    {cat.creator.role === 'SUB_ADMIN' ? 'SubAdmin: ' : 'Admin: '}
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
                <button
                  type="button"
                  onClick={() => onOpenEdit(cat)}
                  className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30 transition cursor-pointer"
                  title="Edit Category"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenDelete(cat)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition cursor-pointer"
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
  );
};

export default CategoryTable;
