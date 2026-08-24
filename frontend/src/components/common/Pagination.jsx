import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZE_OPTIONS } from '../../utils/pagination.util';

/**
 * Reusable Central Pagination Component
 * Follows BrandFlow SaaS theme system with numeric page buttons and per-page limits.
 */
export default function Pagination({
  meta,
  currentPage,
  totalPages,
  onPageChange,
  onLimitChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}) {
  const page = meta?.page || currentPage || 1;
  const limit = meta?.limit || 10;
  const total = meta?.totalItems ?? (meta ? 0 : (totalPages ? totalPages * limit : 0));
  const pages = meta?.totalPages || totalPages || 1;
  const hasNext = meta ? meta.hasNextPage : page < pages;
  const hasPrev = meta ? meta.hasPrevPage : page > 1;

  if (total === 0 && pages <= 1 && (!meta || meta.totalItems === 0)) {
    return null;
  }

  const startItem = Math.min((page - 1) * limit + 1, Math.max(total, 1));
  const endItem = Math.min(page * limit, Math.max(total, 1));

  // Generate numeric page buttons list (max 5 page buttons at once)
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxButtons = 5;
    let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
    let endPage = Math.min(pages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3.5 px-4 bg-[#0B0F17] border border-[#2C384E] rounded-xl text-xs text-slate-300 shadow-sm mt-4">
      {/* Items count summary & Per Page Selector */}
      <div className="flex items-center gap-3">
        <span className="text-slate-400">
          Showing <span className="font-semibold text-white">{startItem}</span> to{' '}
          <span className="font-semibold text-white">{endItem}</span> of{' '}
          <span className="font-bold text-amber-400">{total}</span> results
        </span>

        {/* Page size limit selector */}
        {onLimitChange && (
          <div className="flex items-center gap-1.5 border-l border-[#2C384E] pl-3">
            <label htmlFor="page-limit-select" className="text-slate-400 font-medium">
              Per page:
            </label>
            <select
              id="page-limit-select"
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="bg-[#131B2A] border border-[#2C384E] text-white text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination numeric buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange && onPageChange(page - 1)}
          disabled={!hasPrev}
          className="flex items-center justify-center px-2.5 py-1.5 rounded-lg border border-[#2C384E] bg-[#131B2A] hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((pNum) => {
          const isActive = pNum === page;
          return (
            <button
              key={pNum}
              onClick={() => onPageChange && onPageChange(pNum)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold scale-105'
                  : 'bg-[#131B2A] text-slate-300 border border-[#2C384E] hover:bg-slate-800 hover:text-white'
              }`}
            >
              {pNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange && onPageChange(page + 1)}
          disabled={!hasNext}
          className="flex items-center justify-center px-2.5 py-1.5 rounded-lg border border-[#2C384E] bg-[#131B2A] hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
