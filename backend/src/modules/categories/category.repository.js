import { prisma } from '../../config/database.js';

/**
 * Fetch all business categories ordered by name
 */
export async function findAllCategories() {
  return await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

/**
 * Find category by ID
 */
export async function findCategoryById(id) {
  return await prisma.category.findUnique({
    where: { id },
  });
}

/**
 * Find category by exact Name
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
export async function createCategory({ name, slug, description, icon }) {
  return await prisma.category.create({
    data: {
      name,
      slug,
      description,
      icon,
      isSystem: true,
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
