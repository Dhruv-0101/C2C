import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';

/**
 * FilterSearchablePicker Component
 * Scalable, searchable, and paginated filter picker designed to handle 1000+ items efficiently.
 * Mirrors the Post Studio category & festival navigation pattern.
 *
 * @param {Object} props
 * @param {string} props.label - Display label (e.g. "Business Category")
 * @param {React.ElementType} props.icon - Lucide icon component
 * @param {Array} props.items - Array of items to filter ({ id, name or title })
 * @param {string} props.selectedId - Currently selected item ID
 * @param {Function} props.onSelect - Callback invoked with selected item ID (or empty string)
 * @param {string} [props.placeholder] - Custom search input placeholder
 * @param {string} [props.accentColor] - Badge accent color theme ("amber", "indigo", "emerald", "rose")
 * @param {number} [props.itemsPerPage=8] - Number of items shown per page
 */
export const FilterSearchablePicker = ({
  label,
  icon: Icon,
  items = [],
  selectedId = '',
  onSelect,
  placeholder,
  accentColor = 'amber',
  itemsPerPage = 8,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Find currently selected item
  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    return items.find((item) => String(item.id) === String(selectedId)) || null;
  }, [items, selectedId]);

  const selectedItemName = selectedItem?.name || selectedItem?.title || '';

  // Filter items based on local search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      const name = (item.name || item.title || '').toLowerCase();
      return name.includes(query);
    });
  }, [items, searchQuery]);

  // Paginate filtered items
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleSelect = (id) => {
    if (selectedId === id) {
      onSelect('');
    } else {
      onSelect(id);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelect('');
  };

  // Color mappings
  const colorStyles = {
    amber: {
      badge: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40',
      iconBox: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
      activePill: 'bg-amber-500 text-slate-950 font-bold shadow-xs',
    },
    indigo: {
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/40',
      iconBox: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30',
      activePill: 'bg-indigo-600 text-white font-bold shadow-xs',
    },
    emerald: {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40',
      iconBox: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
      activePill: 'bg-emerald-600 text-white font-bold shadow-xs',
    },
    rose: {
      badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40',
      iconBox: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30',
      activePill: 'bg-rose-600 text-white font-bold shadow-xs',
    },
  };

  const activeTheme = colorStyles[accentColor] || colorStyles.amber;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[#2C384E] bg-white dark:bg-[#0B0F17] overflow-hidden transition-all duration-200 shadow-xs">
      {/* Header Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-2.5 flex items-center justify-between gap-2 text-left hover:bg-slate-50 dark:hover:bg-[#131B2A]/60 transition cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          {Icon && (
            <div className={`p-1.5 rounded-lg border shrink-0 ${activeTheme.iconBox}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="font-bold text-xs text-slate-800 dark:text-white">
            {label}
          </span>

          {selectedItem ? (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 truncate max-w-[140px] ${activeTheme.badge}`}
              title={selectedItemName}
            >
              <span className="truncate">{selectedItemName}</span>
              <span
                onClick={handleClear}
                className="hover:opacity-80 cursor-pointer ml-0.5 text-xs font-black shrink-0"
                title={`Clear ${label} filter`}
              >
                ×
              </span>
            </span>
          ) : (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              ({items.length})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            {isOpen ? 'Close' : 'Browse'}
          </span>
          <div
            className={`p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/40' : ''
            }`}
          >
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      </button>

      {/* Expanded Search, Pagination & Pills Panel */}
      {isOpen && (
        <div className="p-3 border-t border-slate-200 dark:border-[#2C384E]/70 space-y-2.5 bg-slate-50/70 dark:bg-[#131B2A]/40 animate-in fade-in duration-150">
          {/* Subheader Toolbar: Search + Prev/Next Controls */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[140px]">
              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder={placeholder || `Search ${label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-7 pr-2 py-1 text-xs rounded-lg bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-[#2C384E] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setPage(1);
                  }}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2 py-1 rounded-lg bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-[#2C384E] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition text-xs flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                title="Previous page"
              >
                <ChevronLeft className="w-3 h-3" />
                <span className="hidden sm:inline text-[10px]">Prev</span>
              </button>

              <span className="text-[10px] text-slate-600 dark:text-slate-400 px-1 font-mono font-semibold">
                {currentPage}/{totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2 py-1 rounded-lg bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-[#2C384E] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition text-xs flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                title="Next page"
              >
                <span className="hidden sm:inline text-[10px]">Next</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Interactive Item Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {/* All Options Reset Pill */}
            <button
              type="button"
              onClick={() => onSelect('')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                !selectedId
                  ? activeTheme.activePill
                  : 'bg-white dark:bg-[#0B0F17] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#2C384E] hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All {label}s
            </button>

            {/* Paginated Items */}
            {paginatedItems.map((item) => {
              const isSelected = String(selectedId) === String(item.id);
              const itemName = item.name || item.title || 'Untitled';
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? activeTheme.activePill
                      : 'bg-white dark:bg-[#0B0F17] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#2C384E] hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={itemName}
                >
                  <span className="truncate max-w-[150px]">{itemName}</span>
                </button>
              );
            })}

            {paginatedItems.length === 0 && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 italic py-1">
                No matching {label.toLowerCase()} found for "{searchQuery}".
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSearchablePicker;
