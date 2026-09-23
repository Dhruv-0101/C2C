import { ConflictError, NotFoundError, BadRequestError } from '../../common/errors/custom-errors.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../common/helpers/pagination.helper.js';
import * as categoryRepository from './category.repository.js';
import * as templateCategoryRepository from '../template/templateCategory.repository.js';
import { sanitizeCategory } from './category.helper.js';
import { DEFAULT_CATEGORY_SORT_BY, DEFAULT_CATEGORY_SORT_ORDER } from './category.constants.js';

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
 * Get business categories with pagination, searching, and sorting
 */
export async function getCategories(queryParams = {}) {
  const pagination = parsePaginationParams(queryParams, 100, 100);
  const { categories, totalCount } = await categoryRepository.findPaginatedCategories({
    ...pagination,
    sortBy: queryParams.sortBy || DEFAULT_CATEGORY_SORT_BY,
    sortOrder: queryParams.sortOrder ? (queryParams.sortOrder === 'asc' ? 'asc' : 'desc') : DEFAULT_CATEGORY_SORT_ORDER,
  });

  const sanitizedCategories = categories.map(sanitizeCategory);

  const paginatedResponse = buildPaginatedResponse({
    items: sanitizedCategories,
    totalCount,
    page: pagination.page,
    limit: pagination.limit,
  });

  return {
    data: {
      categories: paginatedResponse.data,
    },
    meta: paginatedResponse.meta,
  };
}

/**
 * Get a single business category by ID
 */
export async function getCategoryById(id) {
  const category = await categoryRepository.findCategoryById(id);
  if (!category) {
    throw new NotFoundError('Business category not found.');
  }
  return sanitizeCategory(category);
}

/**
 * Create a new business category (Admin & SubAdmin with permission)
 */
export async function createCategory({ name, description, createdBy }) {
  const cleanName = name.trim();
  const slug = slugify(cleanName);

  if (!slug) {
    throw new BadRequestError('Invalid category name.');
  }

  // 1. Check duplicate category name
  const existingCategoryByName = await categoryRepository.findCategoryByName(cleanName);
  if (existingCategoryByName) {
    throw new ConflictError(`Category "${cleanName}" already exists.`);
  }

  // 2. Check duplicate category slug (prevents Prisma P2002 unique constraint crashes)
  const existingCategoryBySlug = await categoryRepository.findCategoryBySlug(slug);
  if (existingCategoryBySlug) {
    throw new ConflictError(`A category with a similar name resulting in slug "${slug}" already exists.`);
  }

  const newCategory = await categoryRepository.createCategory({
    name: cleanName,
    slug,
    description: description?.trim() || null,
    createdBy: createdBy || null,
  });

  // Keep TemplateCategory in sync so newly created categories immediately appear in Graphic Template Manager
  try {
    const existingTemplateCat = await templateCategoryRepository.findTemplateCategoryByNameOrSlug(cleanName);
    if (!existingTemplateCat) {
      await templateCategoryRepository.createTemplateCategory({
        name: cleanName,
        slug,
        description: description?.trim() || null,
        isSystem: false,
        createdBy: createdBy || null,
      });
    }
  } catch (_syncErr) {
    // Non-blocking sync to avoid disrupting primary category creation
  }

  return sanitizeCategory(newCategory);
}

/**
 * Update an existing business category
 */
export async function updateCategory(id, { name, description }) {
  const existingCategory = await categoryRepository.findCategoryById(id);
  if (!existingCategory) {
    throw new NotFoundError('Business category not found.');
  }

  const updateData = {};

  if (name !== undefined) {
    const cleanName = name.trim();
    const slug = slugify(cleanName);

    if (!slug) {
      throw new BadRequestError('Invalid category name.');
    }

    // Check if another category already has this name
    const duplicateName = await categoryRepository.findCategoryByName(cleanName);
    if (duplicateName && duplicateName.id !== id) {
      throw new ConflictError(`Category "${cleanName}" already exists.`);
    }

    // Check if another category already has this slug
    const duplicateSlug = await categoryRepository.findCategoryBySlug(slug);
    if (duplicateSlug && duplicateSlug.id !== id) {
      throw new ConflictError(`A category with a similar name resulting in slug "${slug}" already exists.`);
    }

    updateData.name = cleanName;
    updateData.slug = slug;
  }

  if (description !== undefined) {
    updateData.description = description?.trim() || null;
  }

  const updatedCategory = await categoryRepository.updateCategory(id, updateData);

  // Sync update to corresponding TemplateCategory if exists
  try {
    const existingTemplateCat = await templateCategoryRepository.findTemplateCategoryByNameOrSlug(existingCategory.name);
    if (existingTemplateCat) {
      await templateCategoryRepository.updateTemplateCategory(existingTemplateCat.id, {
        ...(updateData.name && { name: updateData.name, slug: updateData.slug }),
        ...(updateData.description !== undefined && { description: updateData.description }),
      });
    }
  } catch (_syncErr) {
    // Non-blocking sync
  }

  return sanitizeCategory(updatedCategory);
}

/**
 * Delete a category by ID (Admin & SubAdmin with permission)
 */
export async function deleteCategory(id) {
  const category = await categoryRepository.findCategoryById(id);
  if (!category) {
    throw new NotFoundError('Business category not found.');
  }

  await categoryRepository.deleteCategory(id);

  // Sync deletion of corresponding TemplateCategory if not a system category
  try {
    const existingTemplateCat = await templateCategoryRepository.findTemplateCategoryByNameOrSlug(category.name);
    if (existingTemplateCat && !existingTemplateCat.isSystem) {
      await templateCategoryRepository.deleteTemplateCategory(existingTemplateCat.id);
    }
  } catch (_syncErr) {
    // Non-blocking sync
  }

  return {
    id,
    name: category.name,
  };
}
