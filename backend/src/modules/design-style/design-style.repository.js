import { prisma } from '../../config/database.js';

/**
 * Fetch design styles with pagination and search
 */
export async function findPaginatedDesignStyles({ skip = 0, take = 10, search, sortBy = 'name', sortOrder = 'asc' }) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [designStyles, totalCount] = await Promise.all([
    prisma.designStyle.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.designStyle.count({ where }),
  ]);

  return { designStyles, totalCount };
}

/**
 * Fetch all master design styles ordered by name
 */
export async function findAllDesignStyles() {
  return await prisma.designStyle.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

/**
 * Find design style by ID
 */
export async function findDesignStyleById(id) {
  return await prisma.designStyle.findUnique({
    where: { id },
  });
}

/**
 * Find design style by Slug
 */
export async function findDesignStyleBySlug(slug) {
  return await prisma.designStyle.findUnique({
    where: { slug },
  });
}

/**
 * Create a new master design style
 */
export async function createDesignStyle({
  name,
  slug,
  description,
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor,
  gradient,
  fontHeader,
  fontBody,
  colors,
  rulesJson,
}) {
  return await prisma.designStyle.create({
    data: {
      name,
      slug,
      description,
      primaryColor: primaryColor || '#F59E0B',
      secondaryColor: secondaryColor || '#0D9488',
      accentColor: accentColor || '#EC4899',
      backgroundColor: backgroundColor || '#0B0F17',
      gradient: gradient || null,
      fontHeader: fontHeader || 'Space Grotesk',
      fontBody: fontBody || 'Plus Jakarta Sans',
      colors: colors || [],
      rulesJson: rulesJson || null,
      isSystem: true,
    },
  });
}

/**
 * Delete a design style by ID
 */
export async function deleteDesignStyle(id) {
  return await prisma.designStyle.delete({
    where: { id },
  });
}
