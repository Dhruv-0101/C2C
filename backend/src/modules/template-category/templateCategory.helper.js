/**
 * 🏷️ TEMPLATE CATEGORY HELPER:
 * Sanitization and projection utilities for master template categories.
 */

export function sanitizeTemplateCategory(cat) {
  if (!cat) return null;

  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description || null,
    isSystem: Boolean(cat.isSystem),
    templatesCount: cat._count?.templates ?? 0,
    createdBy: cat.createdBy || null,
    creator: cat.creator
      ? {
          id: cat.creator.id,
          fullName: cat.creator.fullName,
          email: cat.creator.email,
          role: cat.creator.role,
          avatarUrl: cat.creator.avatarUrl || null,
        }
      : null,
    _count: {
      templates: cat._count?.templates ?? 0,
    },
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
  };
}
