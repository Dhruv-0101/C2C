import { prisma } from '../../config/database.js';
import {
  TEMPLATE_CATEGORY_ALLOWED_SORT_FIELDS,
  DEFAULT_TEMPLATE_CATEGORY_SORT_BY,
  DEFAULT_TEMPLATE_CATEGORY_SORT_ORDER,
} from './template.constants.js';

const CREATOR_SELECT = Object.freeze({
  id: true,
  fullName: true,
  email: true,
  role: true,
});

const CATEGORY_INCLUDE = Object.freeze({
  creator: { select: CREATOR_SELECT },
  _count: {
    select: {
      templates: true,
    },
  },
});

/**
 * Create a new template category record
 */
export async function createTemplateCategory(data) {
  const slug =
    data.slug ||
    data.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  return prisma.templateCategory.create({
    data: {
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || null,
      isSystem: Boolean(data.isSystem),
      createdBy: data.createdBy || null,
    },
    include: CATEGORY_INCLUDE,
  });
}

/**
 * Fetch paginated template categories with search and sorting
 */
export async function findPaginatedTemplateCategories({
  skip = 0,
  take = 10,
  search,
  sortBy = DEFAULT_TEMPLATE_CATEGORY_SORT_BY,
  sortOrder = DEFAULT_TEMPLATE_CATEGORY_SORT_ORDER,
}) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const validSortBy = TEMPLATE_CATEGORY_ALLOWED_SORT_FIELDS.includes(sortBy)
    ? sortBy
    : DEFAULT_TEMPLATE_CATEGORY_SORT_BY;
  const validSortOrder = sortOrder === 'desc' ? 'desc' : DEFAULT_TEMPLATE_CATEGORY_SORT_ORDER;

  const [categories, totalCount] = await prisma.$transaction([
    prisma.templateCategory.findMany({
      where,
      skip,
      take,
      include: CATEGORY_INCLUDE,
      orderBy: { [validSortBy]: validSortOrder },
    }),
    prisma.templateCategory.count({ where }),
  ]);

  return { categories, totalCount };
}

/**
 * Fetch all template categories ordered by name
 */
export async function findManyTemplateCategories() {
  return prisma.templateCategory.findMany({
    include: CATEGORY_INCLUDE,
    orderBy: { name: 'asc' },
  });
}

/**
 * Find template category by primary key UUID
 */
export async function findTemplateCategoryById(id) {
  return prisma.templateCategory.findUnique({
    where: { id },
    include: CATEGORY_INCLUDE,
  });
}

/**
 * Find template category by Name or Slug
 */
export async function findTemplateCategoryByNameOrSlug(nameOrSlug) {
  if (!nameOrSlug) return null;
  const trimmed = nameOrSlug.trim();
  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return prisma.templateCategory.findFirst({
    where: {
      OR: [
        { name: { equals: trimmed, mode: 'insensitive' } },
        { slug: { equals: slug, mode: 'insensitive' } },
      ],
    },
    include: CATEGORY_INCLUDE,
  });
}

/**
 * Delete a template category
 */
export async function deleteTemplateCategory(id) {
  return prisma.templateCategory.delete({
    where: { id },
  });
}
