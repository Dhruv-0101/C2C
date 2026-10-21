import React from 'react';
import {
  FolderTree,
  FileCode2,
  User,
  Pencil,
  Trash2,
  Plus,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { SkeletonTable } from '@/components/feedback/SkeletonLoader';

/**
 * TemplateCategoryTable Component
 * Enterprise table viewport for Template Theme Categories with creator badges and linked counts.
 */
export const TemplateCategoryTable = ({
  categories = [],
  isLoading,
  categorySearch = '',
  setCategorySearch,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
  onOpenViewTemplates,
}) => {
  if (isLoading) {
    return (
      <div className="py-2">
        <SkeletonTable rows={5} cols={6} />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-2xl text-slate-400 text-sm space-y-3 bg-[#131B2A]/40">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto">
          <FolderTree className="w-6 h-6 text-teal-400" />
        </div>
        <div>
          <p className="font-heading font-semibold text-white">No categories found</p>
          <p className="text-xs text-slate-400 mt-1">
            {categorySearch
              ? `No template categories matching "${categorySearch}"`
              : 'Organize design templates by creating your first template theme category.'}
          </p>
        </div>
        {categorySearch ? (
          <button
            onClick={() => setCategorySearch && setCategorySearch('')}
            className="text-xs text-teal-400 hover:underline cursor-pointer"
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
            className="mx-auto mt-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold"
          >
            Add Template Category
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 1. Mobile & Small Tablet Card Stack View (hidden on md+) */}
      <div className="block md:hidden space-y-3">
        {categories.map((cat) => {
          const templatesCount = cat.templatesCount ?? cat._count?.templates ?? 0;
          const formattedDate = cat.createdAt
            ? new Date(cat.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : '—';

          return (
            <div
              key={`mob-${cat.id}`}
              className="p-4 rounded-2xl bg-[#131B2A] border border-[#2C384E] hover:border-teal-500/40 space-y-3 transition shadow-sm"
            >
              {/* Header: Icon, Name, Slug & Actions */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-heading font-bold text-white text-sm truncate">
                      {cat.name}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800/80 inline-block mt-0.5">
                      /{cat.slug}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenViewTemplates && onOpenViewTemplates(cat)}
                    className="p-2 rounded-xl text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 border border-transparent hover:border-teal-500/30 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="View Templates"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenEdit(cat)}
                    className="p-2 rounded-xl text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 border border-transparent hover:border-teal-500/30 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="Edit Category"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenDelete(cat)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {cat.description ? (
                <p className="text-xs text-slate-300 line-clamp-2 pl-0.5">
                  {cat.description}
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic pl-0.5">
                  No description provided
                </p>
              )}

              {/* Bottom Meta Row */}
              <div className="pt-2.5 border-t border-[#2C384E]/60 flex items-center justify-between gap-2 flex-wrap text-xs">
                {/* Linked Templates Count Button */}
                <button
                  type="button"
                  onClick={() => onOpenViewTemplates && onOpenViewTemplates(cat)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition cursor-pointer ${
                    templatesCount > 0
                      ? 'bg-teal-500/10 text-teal-300 border-teal-500/30 font-bold'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700/60'
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>{templatesCount} {templatesCount === 1 ? 'Template' : 'Templates'}</span>
                  <ExternalLink className="w-3 h-3 text-teal-400/60 ml-0.5" />
                </button>

                {/* Creator and Date */}
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  {cat.creator ? (
                    <span className="truncate max-w-[120px]">
                      {cat.creator.fullName || cat.creator.email}
                    </span>
                  ) : (
                    <span>System</span>
                  )}
                  <span>•</span>
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Desktop Full Table View (hidden on mobile, visible on md+) */}
      <div className="hidden md:block bg-[#131B2A] border border-[#2C384E] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs min-w-[760px]">
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
            <tbody className="divide-y divide-[#2C384E]/60">
              {categories.map((cat) => {
                const templatesCount = cat.templatesCount ?? cat._count?.templates ?? 0;
                const formattedDate = cat.createdAt
                  ? new Date(cat.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—';

                return (
                  <tr key={cat.id} className="hover:bg-slate-900/40 transition-colors group">
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

                    {/* Linked Templates Count - Clickable to open CategoryTemplatesModal */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onOpenViewTemplates && onOpenViewTemplates(cat)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer group/btn ${
                          templatesCount > 0
                            ? 'bg-teal-500/10 text-teal-300 border-teal-500/30 hover:bg-teal-500/20 hover:border-teal-500/50 hover:scale-105 shadow-sm font-bold'
                            : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-300'
                        }`}
                        title={`Click to view all ${templatesCount} templates in ${cat.name}`}
                      >
                        <FileCode2 className="w-3.5 h-3.5 text-teal-400 group-hover/btn:scale-110 transition-transform" />
                        <span>
                          {templatesCount} {templatesCount === 1 ? 'Template' : 'Templates'}
                        </span>
                        <ExternalLink className="w-3 h-3 text-teal-400/60 group-hover/btn:text-teal-300 ml-0.5" />
                      </button>
                    </td>

                    {/* Created By Badge */}
                    <td className="py-3.5 px-4">
                      {cat.creator ? (
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border ${
                            cat.creator.role === 'SUB_ADMIN'
                              ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          }`}
                          title={`Author: ${cat.creator.fullName} (${cat.creator.email})`}
                        >
                          <User className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">
                            {cat.creator.role === 'SUB_ADMIN' ? 'SubAdmin: ' : 'Admin: '}
                            {cat.creator.fullName}
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-lg border border-slate-700/60">
                          <User className="w-3 h-3 text-slate-500" />
                          <span>System</span>
                        </span>
                      )}
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {formattedDate}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenViewTemplates && onOpenViewTemplates(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 border border-transparent hover:border-teal-500/30 transition cursor-pointer"
                          title="View Templates in this Category"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenEdit(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 border border-transparent hover:border-teal-500/30 transition cursor-pointer"
                          title="Edit Template Category"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenDelete(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition cursor-pointer"
                          title="Delete Template Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TemplateCategoryTable;
