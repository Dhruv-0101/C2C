import { prisma } from '../../config/database.js';

/**
 * Fetch paginated festivals with search and year filtering
 */
export async function findPaginatedFestivals({
  skip = 0,
  take = 10,
  search,
  year,
  includeInactive = false,
  sortBy = 'date',
  sortOrder = 'asc',
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

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { targetRegion: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [festivals, totalCount] = await Promise.all([
    prisma.festival.findMany({
      where,
      skip,
      take,
      include: {
        templates: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { [sortBy]: sortOrder },
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
      templates: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: {
      date: 'asc',
    },
  });
}

/**
 * Find festival by ID
 */
export async function findFestivalById(id) {
  return await prisma.festival.findUnique({
    where: { id },
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
export async function createFestival({ name, slug, description, date, targetRegion, bannerUrl, isActive }) {
  return await prisma.festival.create({
    data: {
      name,
      slug,
      description,
      date: new Date(date),
      targetRegion: targetRegion || 'India',
      bannerUrl: bannerUrl || null,
      isActive: isActive !== undefined ? isActive : true,
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
