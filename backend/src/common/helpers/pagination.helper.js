import { z } from "zod";

/**
 * Reusable Zod schema for validating pagination, search, and sorting query parameters.
 */
export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive("Page must be a positive integer")),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().positive("Limit must be a positive integer")),
  search: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z
    .enum(["asc", "desc"], {
      errorMap: () => ({ message: "sortOrder must be 'asc' or 'desc'" }),
    })
    .optional(),
});

/**
 * Parses and normalizes raw query parameters into Prisma-ready pagination values.
 *
 * @param {Object} query - The req.query object.
 * @param {number} [defaultLimit=10] - Default item limit per page if not specified.
 * @param {number} [maxLimit=100] - Hard cap limit per page.
 * @returns {Object} Normalized pagination parameters (page, limit, skip, take, search, sortBy, sortOrder).
 */
export function parsePaginationParams(
  query = {},
  defaultLimit = 10,
  maxLimit = 100,
) {
  // Parse page number (minimum 1)
  const page = Math.max(1, parseInt(query.page, 10) || 1);

  // Example 1: Normal request (query.limit = "25")
  // parseInt("25", 10) ➔ 25
  // 25 || 10 ➔ 25
  // Math.max(1, 25) ➔ 25 (at least 1)
  // Math.min(100, 25) ➔ 25
  // Final limit = 25

  // Example 2: Requesting too many (query.limit = "500")
  // parseInt("500", 10) ➔ 500
  // 500 || 10 ➔ 500
  // Math.max(1, 500) ➔ 500
  // Math.min(100, 500) ➔ 100 (capped at maxLimit)
  // Final limit = 100 (Prevents server memory overload)

  // Example 3: Passing a negative number (query.limit = "-50")
  // parseInt("-50", 10) ➔ -50
  // -50 || 10 ➔ -50
  // Math.max(1, -50) ➔ 1 (forces minimum of 1)
  // Math.min(100, 1) ➔ 1
  // Final limit = 1 (Prevents negative limit SQL/Prisma errors)

  // Example 4: No limit passed in URL (query.limit = undefined)
  // parseInt(undefined, 10) ➔ NaN
  // NaN || 10 ➔ 10 (fallback to default)
  // Math.max(1, 10) ➔ 10
  // Math.min(100, 10) ➔ 10
  // Final limit = 10
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(query.limit, 10) || defaultLimit),
  );
  const skip = (page - 1) * limit;
  const take = limit;

  const search = query.search ? String(query.search).trim() : undefined;
  const sortBy = query.sortBy ? String(query.sortBy).trim() : undefined;
  const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";

  return {
    page,
    limit,
    skip,
    take,
    search,
    sortBy,
    sortOrder,
  };
}

/**
 * Formats data and pagination stats into a standard paginated response payload.
 *
 * @param {Object} params
 * @param {Array} params.items - Array of records for the current page.
 * @param {number} params.totalCount - Total number of matching records in the database.
 * @param {number} params.page - Current page number.
 * @param {number} params.limit - Page size limit.
 * @returns {Object} Standardized object containing items data and meta pagination details.
 */
export function buildPaginatedResponse({
  items = [],
  totalCount = 0,
  page = 1,
  limit = 10,
}) {
  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    data: items,
    meta: {
      page,
      limit,
      totalItems: totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
