import { z } from "zod";

/**
 * ==============================================================================
 * 📄 BrandFlow Central Pagination & Query Normalizer Helper
 * ==============================================================================
 * Architectural Role:
 * 1. paginationQuerySchema  ➔ [GATEKEEPER - HTTP Layer]: Validates incoming URL query params.
 * 2. parsePaginationParams   ➔ [INPUT PROCESSOR - Logic Layer]: Calculates Prisma `skip`/`take` and enforces security limits.
 * 3. buildPaginatedResponse  ➔ [OUTPUT FORMATTER - Response Layer]: Formats records and UI pagination metadata for frontend.
 * ==============================================================================
 */

/**
 * 🛡️ USE CASE 1: HTTP Query Parameter Validation (Route / Middleware Layer)
 * ------------------------------------------------------------------------------
 * Where it is used:
 * - In Express route definitions wrapped by `validate(paginationQuerySchema)`.
 * - In module validators via `.extend({ ... })` to add module-specific filters
 *   (e.g., `getAdminPostsQuerySchema = z.object({ query: paginationQuerySchema.extend({ categoryId: ... }) })`).
 * 
 * Purpose & Why it exists:
 * - Acts as an entry gatekeeper at the HTTP boundary.
 * - Parses and validates client URL parameters like `?page=2&limit=25&sortBy=createdAt&sortOrder=desc`.
 * - Rejects malformed requests (like `?page=abc` or `?sortOrder=invalid`) with an immediate 400 Bad Request
 *   before any controller or database query is executed.
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
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().positive("Limit must be a positive integer").optional()),
  search: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z
    .enum(["asc", "desc"], {
      errorMap: () => ({ message: "sortOrder must be 'asc' or 'desc'" }),
    })
    .optional(),
});

/**
 * ⚙️ USE CASE 2: Query Normalizer & Database Input Calculator (Business Logic Layer)
 * ------------------------------------------------------------------------------
 * Where it is used:
 * - Inside service/logic functions (`*.logic.js`) right before querying the database
 *   (e.g., in `post.logic.js`, `festival.logic.js`, `category.logic.js`, `vault.logic.js`, etc.).
 * 
 * Purpose & Why it exists:
 * - Translates human-friendly pagination (`page: 2`, `limit: 10`) into SQL/Prisma offsets:
 *     skip = (page - 1) * limit;  // Prisma: skip 10 records
 *     take = limit;               // Prisma: fetch 10 records
 * - Defense-in-Depth Memory Protection (RAM exhaustion / DoS guard):
 *   Clamps `limit` to `maxLimit` (default 100) so a client requesting `?limit=1000000` cannot crash Node.js memory.
 * - Fault Tolerance: Always safely falls back to valid integers even if negative numbers or undefined params are passed.
 * - Trims search strings and normalizes sort order ("asc" / "desc").
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

  // Robust defensive guards: coerce defaultLimit & maxLimit to valid positive numbers
  const safeDefaultLimit =
    typeof defaultLimit === 'number' && !isNaN(defaultLimit) && defaultLimit > 0
      ? defaultLimit
      : 10;
  const safeMaxLimit =
    typeof maxLimit === 'number' && !isNaN(maxLimit) && maxLimit > 0
      ? maxLimit
      : 100;

  const parsedLimit = parseInt(query.limit, 10);
  const rawLimit = !isNaN(parsedLimit) && parsedLimit > 0 ? parsedLimit : safeDefaultLimit;
  const limit = Math.min(safeMaxLimit, Math.max(1, rawLimit));

  const skip = (page - 1) * limit;
  const take = limit;

  const search = query.search ? String(query.search).trim() : undefined;
  const sortBy = query.sortBy ? String(query.sortBy).trim() : undefined;
  const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

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
 * 📦 USE CASE 3: Standard Output Envelope Formatter (Response / Controller Layer)
 * ------------------------------------------------------------------------------
 * Where it is used:
 * - Inside service/logic functions (`*.logic.js`) right after Prisma returns query results.
 * - Used in combination with `sendSuccessResponse(res, { data: paginated.data, meta: paginated.meta })`.
 * 
 * Purpose & Why it exists:
 * - Bridges the raw database output with the client UI pagination controls:
 *   Prisma returns raw rows (`items`) and a scalar number (`totalCount`).
 *   Frontend UI pagination bars (Next, Previous, Total Pages) need computed metadata:
 *     - `totalPages`: Calculated dynamically as Math.ceil(totalCount / limit)
 *     - `hasNextPage`: Boolean indicating if user can click the "Next" button
 *     - `hasPrevPage`: Boolean indicating if user can click the "Previous" button
 * - Enforces enterprise consistency across all 12 modules so the frontend
 *   TanStack Query hook (`usePaginatedQuery`) receives an identical JSON shape everywhere.
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
