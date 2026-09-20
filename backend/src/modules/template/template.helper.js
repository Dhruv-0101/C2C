import { DEFAULT_TEMPLATE_CATEGORY_NAME } from './template.constants.js';

/**
 * 🎨 MASTER GRAPHIC TEMPLATE & CATEGORY DATA SANITIZERS
 * 
 * Strict Whitelist (Allowlist) Projections for Template and TemplateCategory objects.
 * Enforces OWASP Data Minimization Principles:
 * 1. Only fields strictly required by the post editor, template picker, and admin manager UI are exposed.
 * 2. Nested relationships (creator, festival, templateCategory, counts) are strictly whitelisted with zero internal leakage.
 * 3. Never leak internal credentials, tokens, or unneeded database metadata.
 */

/**
 * Sanitize a single master template entity
 * @param {Object} template - Raw Prisma template entity
 * @returns {Object|null} Sanitized template object
 */
export function sanitizeTemplate(template) {
  if (!template) return null;

  return {
    id: template.id,
    title: template.title,
    description: template.description || null,
    baseImageUrl: template.baseImageUrl,
    category: template.templateCategory?.name || template.category || DEFAULT_TEMPLATE_CATEGORY_NAME,
    templateCategoryId: template.templateCategoryId || null,
    templateCategory: template.templateCategory
      ? {
          id: template.templateCategory.id,
          name: template.templateCategory.name,
          slug: template.templateCategory.slug,
          description: template.templateCategory.description || null,
          isSystem: Boolean(template.templateCategory.isSystem),
        }
      : null,
    festivalId: template.festivalId || null,
    festival: template.festival
      ? {
          id: template.festival.id,
          name: template.festival.name,
          slug: template.festival.slug,
          date: template.festival.date,
          bannerUrl: template.festival.bannerUrl || null,
        }
      : null,
    isCustomUpload: Boolean(template.isCustomUpload),
    isActive: template.isActive !== false,
    createdBy: template.createdBy || null,
    ...(template.creator
      ? {
          creator: {
            id: template.creator.id,
            fullName: template.creator.fullName,
            email: template.creator.email,
            role: template.creator.role,
          },
        }
      : {}),
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
    ...(template._count
      ? {
          _count: {
            posts: template._count.posts || 0,
          },
        }
      : {}),
  };
}

/**
 * Sanitize a single template category entity
 * @param {Object} category - Raw Prisma template category entity
 * @returns {Object|null} Sanitized template category object
 */
export function sanitizeTemplateCategory(category) {
  if (!category) return null;

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || null,
    isSystem: Boolean(category.isSystem),
    createdBy: category.createdBy || null,
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
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    ...(category._count
      ? {
          _count: {
            templates: category._count.templates || 0,
          },
        }
      : {}),
  };
}
