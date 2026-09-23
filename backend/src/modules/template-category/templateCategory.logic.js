import { ConflictError, NotFoundError, BadRequestError } from '../../common/errors/custom-errors.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../common/helpers/pagination.helper.js';
import * as templateCategoryRepository from './templateCategory.repository.js';
import { sanitizeTemplateCategory } from './templateCategory.helper.js';
import { DEFAULT_TEMPLATE_CATEGORY_SORT_BY, DEFAULT_TEMPLATE_CATEGORY_SORT_ORDER } from './templateCategory.constants.js';

/**
 * Generate a clean URL slug from string
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
 * Get template categories with pagination, live search, and sorting
 */
export async function getTemplateCategories(queryParams = {}) {
  const pagination = parsePaginationParams(queryParams, 100, 100);
  const { categories, totalCount } = await templateCategoryRepository.findPaginatedTemplateCategories({
    ...pagination,
    search: queryParams.search,
    sortBy: queryParams.sortBy || DEFAULT_TEMPLATE_CATEGORY_SORT_BY,
    sortOrder: queryParams.sortOrder ? (queryParams.sortOrder === 'desc' ? 'desc' : 'asc') : DEFAULT_TEMPLATE_CATEGORY_SORT_ORDER,
  });

  const sanitizedCategories = categories.map(sanitizeTemplateCategory);

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
 * Get a single template category by ID
 */
export async function getTemplateCategoryById(id) {
  const category = await templateCategoryRepository.findTemplateCategoryById(id);
  if (!category) {
    throw new NotFoundError('Template category not found.');
  }
  return sanitizeTemplateCategory(category);
}

/**
 * Create a new template category (Admin & SubAdmin with permission)
 */
export async function createTemplateCategory({ name, description, isSystem = false, createdBy }) {
  const cleanName = name.trim();
  const slug = slugify(cleanName);

  if (!slug) {
    throw new BadRequestError('Invalid template category name.');
  }

  // 1. Check duplicate category name
  const existingByName = await templateCategoryRepository.findTemplateCategoryByName(cleanName);
  if (existingByName) {
    throw new ConflictError(`Template category "${cleanName}" already exists.`);
  }

  // 2. Check duplicate slug
  const existingBySlug = await templateCategoryRepository.findTemplateCategoryBySlug(slug);
  if (existingBySlug) {
    throw new ConflictError(`A template category with a similar name resulting in slug "${slug}" already exists.`);
  }

  const newCategory = await templateCategoryRepository.createTemplateCategory({
    name: cleanName,
    slug,
    description: description?.trim() || null,
    isSystem: Boolean(isSystem),
    createdBy: createdBy || null,
  });

  return sanitizeTemplateCategory(newCategory);
}

/**
 * Update an existing template category
 */
export async function updateTemplateCategory(id, { name, description }) {
  const existingCategory = await templateCategoryRepository.findTemplateCategoryById(id);
  if (!existingCategory) {
    throw new NotFoundError('Template category not found.');
  }

  const updateData = {};

  if (name !== undefined) {
    const cleanName = name.trim();
    const slug = slugify(cleanName);

    if (!slug) {
      throw new BadRequestError('Invalid template category name.');
    }

    const duplicateName = await templateCategoryRepository.findTemplateCategoryByName(cleanName);
    if (duplicateName && duplicateName.id !== id) {
      throw new ConflictError(`Template category "${cleanName}" already exists.`);
    }

    const duplicateSlug = await templateCategoryRepository.findTemplateCategoryBySlug(slug);
    if (duplicateSlug && duplicateSlug.id !== id) {
      throw new ConflictError(`A template category with a similar name resulting in slug "${slug}" already exists.`);
    }

    updateData.name = cleanName;
    updateData.slug = slug;
  }

  if (description !== undefined) {
    updateData.description = description?.trim() || null;
  }

  const updatedCategory = await templateCategoryRepository.updateTemplateCategory(id, updateData);
  return sanitizeTemplateCategory(updatedCategory);
}

/**
 * Delete a template category by ID (Admin & SubAdmin with permission)
 */
export async function deleteTemplateCategory(id) {
  const category = await templateCategoryRepository.findTemplateCategoryById(id);
  if (!category) {
    throw new NotFoundError('Template category not found.');
  }

  if (category.isSystem) {
    throw new BadRequestError('System default template categories cannot be deleted.');
  }

  await templateCategoryRepository.deleteTemplateCategory(id);

  return {
    id,
    name: category.name,
  };
}
