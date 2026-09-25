/**
 * Central Frontend Pagination Utilities
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

export function sanitizePaginationParams(params = {}) {
  const page = Math.max(1, parseInt(params.page, 10) || DEFAULT_PAGE);
  const limit = Math.max(1, parseInt(params.limit, 10) || DEFAULT_LIMIT);
  const search = typeof params.search === 'string' ? params.search.trim() : undefined;
  const sortBy = typeof params.sortBy === 'string' ? params.sortBy.trim() : undefined;
  const sortOrder = params.sortOrder === 'desc' ? 'desc' : 'asc';

  const extraParams = {};
  Object.keys(params).forEach((key) => {
    if (!['page', 'limit', 'search', 'sortBy', 'sortOrder'].includes(key)) {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        extraParams[key] = params[key];
      }
    }
  });

  return {
    page,
    limit,
    ...(search && { search }),
    ...(sortBy && { sortBy, sortOrder }),
    ...extraParams,
  };
}

export const paginationUtil = {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  PAGE_SIZE_OPTIONS,
  sanitizePaginationParams,
};

export default paginationUtil;
