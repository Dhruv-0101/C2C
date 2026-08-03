import { prisma } from '../../config/database.js';

/**
 * Fetch all festivals ordered by date ascending
 */
export async function findAllFestivals(year) {
  const where = {};
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
 * Delete a festival by ID
 */
export async function deleteFestival(id) {
  return await prisma.festival.delete({
    where: { id },
  });
}
