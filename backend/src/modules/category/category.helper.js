/**
 * 🏬 BUSINESS CATEGORY DATA SANITIZER HELPER:
 * 
 * Strict Whitelist (Allowlist) Projections for Category objects returned to the client.
 * Enforces OWASP Data Minimization Principles:
 * 1. Only fields strictly required by the template picker, brand kit, and admin management UI are exposed.
 * 2. Nested relationships (creator, counts) are strictly whitelisted with zero internal leakage.
 */

export function sanitizeCategory(category) {
  if (!category) return null;

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || null,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    ...(category.creator
      ? {
          creator: {
            id: category.creator.id,
            fullName: category.creator.fullName,
            email: category.creator.email,
            role: category.creator.role,
          },
        }
      : {}),
    ...(category._count
      ? {
          _count: {
            brandKits: category._count.brandKits || 0,
            posts: category._count.posts || 0,
          },
        }
      : {}),
  };
}
