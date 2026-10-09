import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader2,
} from 'lucide-react';

/**
 * FilterSearchablePicker Component
 * Scalable, enterprise-grade searchable combobox dropdown with server-side or client-side pagination.
 * Handles 1,000+ to 10,000+ items with ease by fetching lightweight pages, debounced search,
 * and maintaining active selection caching.
 *
 * @param {Object} props
 * @param {string} props.label - Display label (e.g. "Business Category")
 * @param {React.ElementType} props.icon - Lucide icon component
 * @param {string} [props.selectedId=''] - Currently selected item ID
 * @param {string} [props.selectedName=''] - Explicit selected item display name
 * @param {Function} props.onSelect - Callback invoked with `(id: string, item: Object|null)`
 * @param {string} [props.placeholder] - Search input placeholder
 * @param {string} [props.accentColor='amber'] - Accent color theme ("indigo" | "emerald" | "amber" | "rose")
 * @param {string} [props.queryKeyPrefix] - TanStack Query cache key prefix
 * @param {Function} [props.queryFn] - Async function `({ page, limit, search }) => Promise<{ items: Array, meta: Object }>`
 * @param {Function} [props.getSingleItemFn] - Async function `(id) => Promise<Object>` for single record resolution
 * @param {Array} [props.items=[]] - Fallback client-side items array
 * @param {number} [props.pageSize=10] - Number of items displayed per page
 */
export const FilterSearchablePicker = ({
  label,
  icon: Icon,
  selectedId = '',
  selectedName: externalSelectedName = '',
  onSelect,
  placeholder,
  accentColor = 'amber',
  queryKeyPrefix,
  queryFn,
  getSingleItemFn,
  items: staticItems = [],
  pageSize = 10,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [page, setPage] = useState(1);
  const [selectedCache, setSelectedCache] = useState({});
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Reset page index when search keyword changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Click outside and Escape key listeners
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // 1. Server-side paginated query
  const isServerQuery = typeof queryFn === 'function';
  const {
    data: serverData,
    isLoading: isLoadingServer,
    isFetching,
  } = useQuery({
    queryKey: [queryKeyPrefix || label, { page, limit: pageSize, search: debouncedSearch }],
    queryFn: () => queryFn({ page, limit: pageSize, search: debouncedSearch }),
    enabled: isServerQuery && isOpen,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

  // 2. Client-side fallback if queryFn is not provided
  const clientFilteredItems = useMemo(() => {
    if (isServerQuery) return [];
    if (!debouncedSearch.trim()) return staticItems;
    const query = debouncedSearch.toLowerCase().trim();
    return staticItems.filter((item) => {
      const name = (item.name || item.title || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      return name.includes(query) || desc.includes(query);
    });
  }, [isServerQuery, staticItems, debouncedSearch]);

  // Extract records & pagination metadata
  const currentItems = isServerQuery
    ? (serverData?.items || [])
    : clientFilteredItems.slice((page - 1) * pageSize, page * pageSize);

  const totalItems = isServerQuery
    ? (serverData?.meta?.totalItems ?? serverData?.items?.length ?? 0)
    : clientFilteredItems.length;

  const totalPages = isServerQuery
    ? Math.max(1, serverData?.meta?.totalPages || Math.ceil(totalItems / pageSize) || 1)
    : Math.max(1, Math.ceil(clientFilteredItems.length / pageSize) || 1);

  const hasNextPage = isServerQuery
    ? (serverData?.meta?.hasNextPage ?? page < totalPages)
    : page < totalPages;

  const hasPrevPage = isServerQuery
    ? (serverData?.meta?.hasPrevPage ?? page > 1)
    : page > 1;

  // 3. Lazy fetch for selected item name if selectedId exists but label is unknown
  const needsSingleItemFetch = Boolean(
    selectedId &&
    !externalSelectedName &&
    !selectedCache[selectedId] &&
    typeof getSingleItemFn === 'function'
  );

  const { data: fetchedSingleItem } = useQuery({
    queryKey: [queryKeyPrefix || label, 'single-record', selectedId],
    queryFn: () => getSingleItemFn(selectedId),
    enabled: needsSingleItemFetch,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (fetchedSingleItem && selectedId) {
      const name = fetchedSingleItem.name || fetchedSingleItem.title || '';
      if (name) {
        setSelectedCache((prev) => ({ ...prev, [selectedId]: fetchedSingleItem }));
      }
    }
  }, [fetchedSingleItem, selectedId]);

  // Find selected item label
  const resolvedSelectedItem = useMemo(() => {
    if (!selectedId) return null;
    if (selectedCache[selectedId]) return selectedCache[selectedId];
    return currentItems.find((item) => String(item.id) === String(selectedId)) || null;
  }, [selectedId, selectedCache, currentItems]);

  const selectedDisplayName =
    externalSelectedName ||
    resolvedSelectedItem?.name ||
    resolvedSelectedItem?.title ||
    selectedCache[selectedId]?.name ||
    selectedCache[selectedId]?.title ||
    '';

  const handleSelectItem = (item) => {
    if (!item) {
      onSelect('', null);
    } else {
      setSelectedCache((prev) => ({ ...prev, [item.id]: item }));
      onSelect(item.id, item);
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelect('', null);
    setSearchQuery('');
  };

  // Theme styling definitions
  const themeStyles = {
    indigo: {
      iconBox: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30',
      activeText: 'text-indigo-600 dark:text-indigo-400 font-bold',
      activeOption: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 font-bold',
      checkIcon: 'text-indigo-600 dark:text-indigo-400',
      triggerBorder: selectedId ? 'border-indigo-300 dark:border-indigo-500/50' : 'border-slate-200 dark:border-[#2C384E]',
    },
    emerald: {
      iconBox: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
      activeText: 'text-emerald-600 dark:text-emerald-400 font-bold',
      activeOption: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold',
      checkIcon: 'text-emerald-600 dark:text-emerald-400',
      triggerBorder: selectedId ? 'border-emerald-300 dark:border-emerald-500/50' : 'border-slate-200 dark:border-[#2C384E]',
    },
    amber: {
      iconBox: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
      activeText: 'text-amber-600 dark:text-amber-400 font-bold',
      activeOption: 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 font-bold',
      checkIcon: 'text-amber-600 dark:text-amber-400',
      triggerBorder: selectedId ? 'border-amber-300 dark:border-amber-500/50' : 'border-slate-200 dark:border-[#2C384E]',
    },
    rose: {
      iconBox: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30',
      activeText: 'text-rose-600 dark:text-rose-400 font-bold',
      activeOption: 'bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 font-bold',
      checkIcon: 'text-rose-600 dark:text-rose-400',
      triggerBorder: selectedId ? 'border-rose-300 dark:border-rose-500/50' : 'border-slate-200 dark:border-[#2C384E]',
    },
  };

  const currentTheme = themeStyles[accentColor] || themeStyles.amber;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Combobox Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-11 px-3 rounded-xl bg-white dark:bg-[#0B0F17] border ${currentTheme.triggerBorder} hover:border-slate-400 dark:hover:border-slate-500 transition-all flex items-center justify-between gap-2.5 text-left cursor-pointer shadow-xs group`}
        title={selectedDisplayName || `Filter by ${label}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {Icon && (
            <div className={`p-1.5 rounded-lg border shrink-0 ${currentTheme.iconBox}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider truncate">
              {label}
            </div>
            <div className={`text-xs truncate ${selectedId ? currentTheme.activeText : 'text-slate-700 dark:text-slate-300 font-medium'}`}>
              {selectedDisplayName ? (
                selectedDisplayName
              ) : (
                <span className="text-slate-500 dark:text-slate-400">
                  All {label}s {totalItems > 0 ? `(${totalItems})` : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Action: Clear 'X' if selected, plus Chevron */}
        <div className="flex items-center gap-1 shrink-0">
          {selectedId && (
            <span
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={`Clear ${label} filter`}
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <div
            className={`p-1 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-amber-500' : 'group-hover:text-slate-600 dark:group-hover:text-slate-300'
            }`}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
      </button>

      {/* Floating Popover Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 sm:min-w-[300px] mt-1.5 z-50 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#2C384E] shadow-2xl p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder || `Search ${label.toLowerCase()}...`}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#2C384E] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* List Header Status Bar */}
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              {isFetching ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                  <span>Loading...</span>
                </>
              ) : (
                <span>
                  {debouncedSearch ? `Matches (${totalItems})` : `Total items (${totalItems})`}
                </span>
              )}
            </span>
            {selectedId && (
              <button
                type="button"
                onClick={() => handleSelectItem(null)}
                className="text-[11px] text-amber-500 hover:underline cursor-pointer font-semibold"
              >
                Reset selection
              </button>
            )}
          </div>

          {/* Scrollable Items List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
            {/* Option 0: 'All [Label]s' */}
            <button
              type="button"
              onClick={() => handleSelectItem(null)}
              className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition cursor-pointer text-left ${
                !selectedId
                  ? 'bg-slate-100 dark:bg-[#1E293B] text-slate-900 dark:text-white font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1A2333]'
              }`}
            >
              <span>All {label}s</span>
              {!selectedId && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
            </button>

            {/* Loading Skeleton */}
            {isLoadingServer && currentItems.length === 0 ? (
              <div className="space-y-1.5 py-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-7 rounded-lg skeleton-shimmer bg-slate-100 dark:bg-[#1E293B]" />
                ))}
              </div>
            ) : (
              currentItems.map((item) => {
                const isSelected = String(selectedId) === String(item.id);
                const itemName = item.name || item.title || 'Untitled';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectItem(item)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between gap-2 transition cursor-pointer text-left ${
                      isSelected
                        ? currentTheme.activeOption
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1A2333]'
                    }`}
                    title={itemName}
                  >
                    <div className="min-w-0 flex-1 truncate">
                      <div className="truncate font-medium">{itemName}</div>
                      {item.description && (
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {item.description}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <Check className={`w-3.5 h-3.5 shrink-0 ${currentTheme.checkIcon}`} />
                    )}
                  </button>
                );
              })
            )}

            {/* Empty State */}
            {!isLoadingServer && currentItems.length === 0 && (
              <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                No matching {label.toLowerCase()} found{debouncedSearch ? ` for "${debouncedSearch}"` : ''}.
              </div>
            )}
          </div>

          {/* Pagination Footer Controls (Handles 1000+ items smoothly) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-[#2C384E] text-xs">
              <button
                type="button"
                disabled={!hasPrevPage || isFetching}
                onClick={(e) => {
                  e.stopPropagation();
                  setPage((p) => Math.max(1, p - 1));
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0B0F17] dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer font-medium text-[11px]"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                Page <span className="font-bold text-slate-900 dark:text-white">{page}</span> of{' '}
                <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
              </div>

              <button
                type="button"
                disabled={!hasNextPage || isFetching}
                onClick={(e) => {
                  e.stopPropagation();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0B0F17] dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer font-medium text-[11px]"
                title="Next page"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterSearchablePicker;
