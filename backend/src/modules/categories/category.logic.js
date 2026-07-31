import { ConflictError, NotFoundError, BadRequestError } from '../../common/errors/custom-errors.js';
import * as categoryRepository from './category.repository.js';

/**
 * Generate a clean URL slug from category name
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get all active business categories
 */
export async function getCategories() {
  return await categoryRepository.findAllCategories();
}

/**
 * Create a new business category (SuperAdmin Privilege)
 */
export async function createCategory({ name, description, icon }) {
  const cleanName = name.trim();
  const slug = slugify(cleanName);

  if (!slug) {
    throw new BadRequestError('Invalid category name.');
  }

  const existingCategory = await categoryRepository.findCategoryByName(cleanName);
  if (existingCategory) {
    throw new ConflictError(`Category "${cleanName}" already exists.`);
  }

  const newCategory = await categoryRepository.createCategory({
    name: cleanName,
    slug,
    description: description?.trim() || null,
    icon: icon?.trim() || null,
  });

  return newCategory;
}

/**
 * Delete a category by ID (SuperAdmin Privilege)
 */
export async function deleteCategory(id) {
  const category = await categoryRepository.findCategoryById(id);
  if (!category) {
    throw new NotFoundError('Category not found.');
  }

  await categoryRepository.deleteCategory(id);
  return { id };
}
