import { prisma } from '../../config/database.js';
import {
  CATEGORY_ALLOWED_SORT_FIELDS,
  DEFAULT_CATEGORY_SORT_BY,
  DEFAULT_CATEGORY_SORT_ORDER,
} from './category.constants.js';

const CREATOR_SELECT = Object.freeze({
  id: true,
  fullName: true,
  email: true,
  role: true,
});

/**
 * Fetch all business categories ordered by name
 */
export async function findAllCategories() {
  return await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      creator: { select: CREATOR_SELECT },
      _count: {
        select: {
          brandKits: true,
          posts: true,
        },
      },
    },
  });
}

/**
 * Fetch paginated business categories with optional search and sorting
 */
export async function findPaginatedCategories({
  skip,
  take,
  search,
  sortBy = DEFAULT_CATEGORY_SORT_BY,
  sortOrder = DEFAULT_CATEGORY_SORT_ORDER,
}) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const validSortBy = CATEGORY_ALLOWED_SORT_FIELDS.includes(sortBy)
    ? sortBy
    : DEFAULT_CATEGORY_SORT_BY;

  const [categories, totalCount] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      skip,
      take,
      include: {
        creator: { select: CREATOR_SELECT },
        _count: {
          select: {
            brandKits: true,
            posts: true,
          },
        },
      },
      orderBy: {
        [validSortBy]: sortOrder,
      },
    }),
    prisma.category.count({ where }),
  ]);

  return { categories, totalCount };
}

/**
 * Find category by ID
 */
export async function findCategoryById(id) {
  return await prisma.category.findUnique({
    where: { id },
    include: {
      creator: { select: CREATOR_SELECT },
      _count: {
        select: {
          brandKits: true,
          posts: true,
        },
      },
    },
  });
}

/**
 * Find category by exact Name (case-insensitive)
 */
export async function findCategoryByName(name) {
  return await prisma.category.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
    },
  });
}

/**
 * Find category by Slug
 */
export async function findCategoryBySlug(slug) {
  return await prisma.category.findUnique({
    where: { slug },
  });
}

/**
 * Create a new business category
 */
export async function createCategory({ name, slug, description, createdBy }) {
  return await prisma.category.create({
    data: {
      name,
      slug,
      description,
      createdBy: createdBy || null,
    },
    include: {
      creator: { select: CREATOR_SELECT },
      _count: {
        select: {
          brandKits: true,
          posts: true,
        },
      },
    },
  });
}

/**
 * Update an existing business category
 */
export async function updateCategory(id, data) {
  return await prisma.category.update({
    where: { id },
    data,
    include: {
      creator: { select: CREATOR_SELECT },
      _count: {
        select: {
          brandKits: true,
          posts: true,
        },
      },
    },
  });
}

/**
 * Delete a category by ID
 */
export async function deleteCategory(id) {
  return await prisma.category.delete({
    where: { id },
  });
}
