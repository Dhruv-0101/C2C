import { prisma } from '../../config/database.js';
import {
  FESTIVAL_ALLOWED_SORT_FIELDS,
  DEFAULT_FESTIVAL_SORT_BY,
  DEFAULT_FESTIVAL_SORT_ORDER,
} from './festival.constants.js';

const CREATOR_SELECT = Object.freeze({
  id: true,
  fullName: true,
  email: true,
  role: true,
});

/**
 * Fetch paginated festivals with search, year, and active status filtering
 */
export async function findPaginatedFestivals({
  skip = 0,
  take = 10,
  search,
  year,
  startDate,
  endDate,
  includeInactive = false,
  sortBy = DEFAULT_FESTIVAL_SORT_BY,
  sortOrder = DEFAULT_FESTIVAL_SORT_ORDER,
}) {
  const where = {};
  if (!includeInactive) {
    where.isActive = true;
  }

  if (year) {
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
    where.date = {
      gte: startOfYear,
      lte: endOfYear,
    };
  }

  if (startDate || endDate) {
    where.date = {
      ...(where.date || {}),
      ...(startDate ? { gte: new Date(startDate) } : {}),
      ...(endDate ? { lte: new Date(endDate) } : {}),
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { targetRegion: { contains: search, mode: 'insensitive' } },
    ];
  }

  const validSortBy = FESTIVAL_ALLOWED_SORT_FIELDS.includes(sortBy)
    ? sortBy
    : DEFAULT_FESTIVAL_SORT_BY;

  const [festivals, totalCount] = await prisma.$transaction([
    prisma.festival.findMany({
      where,
      skip,
      take,
      include: {
        creator: { select: CREATOR_SELECT },
        templates: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            baseImageUrl: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            templates: true,
            posts: true,
          },
        },
      },
      orderBy: { [validSortBy]: sortOrder },
    }),
    prisma.festival.count({ where }),
  ]);

  return { festivals, totalCount };
}

/**
 * Fetch all festivals ordered by date ascending
 */
export async function findAllFestivals(year, includeInactive = false) {
  const where = {};
  if (!includeInactive) {
    where.isActive = true;
  }

  if (year) {
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
    where.date = {
      gte: startOfYear,
      lte: endOfYear,
    };
  }

  return await prisma.festival.findMany({
    where,
    include: {
      creator: { select: CREATOR_SELECT },
      templates: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          templates: true,
          posts: true,
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  });
}

/**
 * Find festival by ID with creator details and templates
 */
export async function findFestivalById(id) {
  return await prisma.festival.findUnique({
    where: { id },
    include: {
      creator: { select: CREATOR_SELECT },
      templates: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          templates: true,
          posts: true,
        },
      },
    },
  });
}

/**
 * Find festival by exact slug
 */
export async function findFestivalBySlug(slug) {
  return await prisma.festival.findUnique({
    where: { slug },
  });
}

/**
 * Create a new festival / special day
 */
export async function createFestival({ name, slug, description, date, targetRegion, bannerUrl, isActive, createdBy }) {
  return await prisma.festival.create({
    data: {
      name,
      slug,
      description,
      date: new Date(date),
      targetRegion: targetRegion || 'India',
      bannerUrl: bannerUrl || null,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: createdBy || null,
    },
    include: {
      creator: { select: CREATOR_SELECT },
      _count: {
        select: {
          templates: true,
          posts: true,
        },
      },
    },
  });
}

/**
 * Update an existing festival by ID
 */
export async function updateFestival(id, data) {
  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.date !== undefined) updateData.date = new Date(data.date);
  if (data.targetRegion !== undefined) updateData.targetRegion = data.targetRegion;
  if (data.bannerUrl !== undefined) updateData.bannerUrl = data.bannerUrl;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return await prisma.festival.update({
    where: { id },
    data: updateData,
    include: {
      creator: { select: CREATOR_SELECT },
      _count: {
        select: {
          templates: true,
          posts: true,
        },
      },
    },
  });
}

/**
 * Delete a festival by ID
 */
export async function deleteFestival(id) {
  return await prisma.festival.delete({
    where: { id },
  });
}
