import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZE_OPTIONS } from '../../utils/pagination.util';

/**
 * Reusable Central Pagination Component
 *
 * @param {Object} props
 * @param {Object} props.meta - Pagination metadata from backend API ({ page, limit, totalItems, totalPages, hasNextPage, hasPrevPage })
 * @param {Function} props.onPageChange - Handler called when user selects/changes page
 * @param {Function} [props.onLimitChange] - Optional handler called when user changes items per page limit
 * @param {Array<number>} [props.pageSizeOptions] - Custom array of page size choices
 */
export default function Pagination({
  meta,
  onPageChange,
  onLimitChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}) {
  if (!meta || meta.totalItems === 0) return null;

  const { page = 1, limit = 10, totalItems = 0, totalPages = 1, hasNextPage, hasPrevPage } = meta;

  const startItem = Math.min((page - 1) * limit + 1, totalItems);
  const endItem = Math.min(page * limit, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300">
      {/* Items count summary */}
      <div className="flex items-center gap-2">
        <span>
          Showing <span className="font-semibold text-white">{startItem}</span> to{' '}
          <span className="font-semibold text-white">{endItem}</span> of{' '}
          <span className="font-semibold text-white">{totalItems}</span> results
        </span>

        {/* Page size limit selector */}
        {onLimitChange && (
          <div className="ml-4 flex items-center gap-1.5">
            <label htmlFor="page-limit-select" className="text-xs text-gray-400">
              Per page:
            </label>
            <select
              id="page-limit-select"
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
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

      {/* Pagination control buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage && page <= 1}
          className="flex items-center justify-center p-1.5 rounded-md border border-gray-700 bg-gray-800/80 hover:bg-gray-700 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 py-1 text-xs font-medium bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-md">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage && page >= totalPages}
          className="flex items-center justify-center p-1.5 rounded-md border border-gray-700 bg-gray-800/80 hover:bg-gray-700 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
