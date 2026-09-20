import { prisma } from '../../config/database.js';
import {
  TEMPLATE_ALLOWED_SORT_FIELDS,
  DEFAULT_TEMPLATE_SORT_BY,
  DEFAULT_TEMPLATE_SORT_ORDER,
} from './template.constants.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CREATOR_SELECT = Object.freeze({
  id: true,
  fullName: true,
  email: true,
  role: true,
});

const TEMPLATE_CATEGORY_SELECT = Object.freeze({
  id: true,
  name: true,
  slug: true,
  description: true,
  isSystem: true,
});

const FESTIVAL_SELECT = Object.freeze({
  id: true,
  name: true,
  slug: true,
  date: true,
  bannerUrl: true,
});

const TEMPLATE_INCLUDE = Object.freeze({
  festival: { select: FESTIVAL_SELECT },
  templateCategory: { select: TEMPLATE_CATEGORY_SELECT },
  creator: { select: CREATOR_SELECT },
  _count: {
    select: {
      posts: true,
    },
  },
});

/**
 * Create a new master graphic template
 */
export async function createTemplate(data) {
  return prisma.template.create({
    data,
    include: TEMPLATE_INCLUDE,
  });
}

/**
 * Fetch all active templates matching optional filters
 */
export async function findManyTemplates(filter = {}) {
  return prisma.template.findMany({
    where: {
      isActive: true,
      ...filter,
    },
    include: TEMPLATE_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Fetch paginated templates with search, festival, and category filters
 */
export async function findPaginatedTemplates({
  skip,
  take,
  festivalId,
  category,
  templateCategoryId,
  search,
  sortBy = DEFAULT_TEMPLATE_SORT_BY,
  sortOrder = DEFAULT_TEMPLATE_SORT_ORDER,
}) {
  const where = {
    isActive: true,
  };

  if (festivalId && festivalId !== 'undefined' && festivalId !== 'null') {
    where.festivalId = festivalId;
  }

  const targetCategory = templateCategoryId || category;
  if (targetCategory && targetCategory !== 'undefined' && targetCategory !== 'null' && targetCategory !== 'ALL') {
    if (UUID_REGEX.test(targetCategory)) {
      where.templateCategoryId = targetCategory;
    } else {
      const slugified = targetCategory.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      where.templateCategory = {
        OR: [
          { slug: { equals: slugified, mode: 'insensitive' } },
          { name: { equals: targetCategory, mode: 'insensitive' } },
        ],
      };
    }
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { templateCategory: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const validSortBy = TEMPLATE_ALLOWED_SORT_FIELDS.includes(sortBy)
    ? sortBy
    : DEFAULT_TEMPLATE_SORT_BY;
  const validSortOrder = sortOrder === 'asc' ? 'asc' : DEFAULT_TEMPLATE_SORT_ORDER;

  const [templates, totalCount] = await prisma.$transaction([
    prisma.template.findMany({
      where,
      skip,
      take,
      include: TEMPLATE_INCLUDE,
      orderBy: {
        [validSortBy]: validSortOrder,
      },
    }),
    prisma.template.count({ where }),
  ]);

  return { templates, totalCount };
}

/**
 * Find an active template by ID
 */
export async function findTemplateById(id) {
  return prisma.template.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: TEMPLATE_INCLUDE,
  });
}

/**
 * Soft delete a template (sets isActive: false)
 */
export async function deleteTemplate(id) {
  return prisma.template.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
}
