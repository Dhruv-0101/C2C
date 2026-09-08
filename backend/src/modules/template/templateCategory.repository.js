import { prisma } from '../../config/database.js';

export const templateCategoryRepository = {
  create: async (data) => {
    const slug = data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return prisma.templateCategory.upsert({
      where: { slug },
      update: {
        name: data.name.trim(),
        description: data.description || null,
        icon: data.icon || '🎨',
      },
      create: {
        name: data.name.trim(),
        slug,
        description: data.description || null,
        icon: data.icon || '🎨',
        isSystem: data.isSystem || false,
      },
    });
  },

  findPaginated: async ({ skip = 0, take = 10, search, sortBy = 'name', sortOrder = 'asc' }) => {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [categories, totalCount] = await Promise.all([
      prisma.templateCategory.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.templateCategory.count({ where }),
    ]);

    return { categories, totalCount };
  },

  findMany: async () => {
    return prisma.templateCategory.findMany({
      orderBy: { name: 'asc' },
    });
  },

  findById: async (id) => {
    return prisma.templateCategory.findUnique({
      where: { id },
    });
  },

  findByNameOrSlug: async (nameOrSlug) => {
    const slug = nameOrSlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    return prisma.templateCategory.findFirst({
      where: {
        OR: [
          { name: { equals: nameOrSlug, mode: 'insensitive' } },
          { slug: { equals: slug, mode: 'insensitive' } },
        ],
      },
    });
  },
};
