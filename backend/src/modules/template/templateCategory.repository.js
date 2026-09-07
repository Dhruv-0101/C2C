import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
