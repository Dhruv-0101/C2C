/**
 * Central Frontend Pagination Utilities
 */

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

/**
 * Normalizes and sanitizes pagination query parameters for API calls.
 * Removes empty string, null, or undefined fields.
 *
 * @param {Object} params - Raw parameters ({ page, limit, search, sortBy, sortOrder })
 * @returns {Object} Cleaned parameter object.
 */
export function sanitizePaginationParams(params = {}) {
  const page = Math.max(1, parseInt(params.page, 10) || DEFAULT_PAGE);
  const limit = Math.max(1, parseInt(params.limit, 10) || DEFAULT_LIMIT);
  const search = typeof params.search === 'string' ? params.search.trim() : undefined;
  const sortBy = typeof params.sortBy === 'string' ? params.sortBy.trim() : undefined;
  const sortOrder = params.sortOrder === 'desc' ? 'desc' : 'asc';

  // Preserve custom domain filter params (e.g. festivalId, categoryId, styleId)
  const extraParams = {};
  Object.keys(params).forEach((key) => {
    if (!['page', 'limit', 'search', 'sortBy', 'sortOrder'].includes(key)) {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        extraParams[key] = params[key];
      }
    }
  });

  const cleaned = {
    page,
    limit,
    ...(search && { search }),
    ...(sortBy && { sortBy, sortOrder }),
    ...extraParams,
  };

  return cleaned;
}
