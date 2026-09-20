import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from '../../common/errors/custom-errors.js';
import * as templateRepository from './template.repository.js';
import * as templateCategoryRepository from './templateCategory.repository.js';
import {
  parsePaginationParams,
  buildPaginatedResponse,
} from '../../common/helpers/pagination.helper.js';
import { uploadTemplateBuffer, deleteFromCloudinary } from '../../config/cloudinary.js';
import { logger } from '../../config/logger.js';
import { sanitizeTemplate, sanitizeTemplateCategory } from './template.helper.js';
import { DEFAULT_TEMPLATE_CATEGORY_NAME } from './template.constants.js';

/**
 * 🎨 MASTER GRAPHIC TEMPLATE BUSINESS LOGIC
 * Encapsulates all domain validation, Cloudinary asset storage, category resolution, and data sanitization.
 */

/**
 * Unifying Template Creation: Handles File Attachments, Base64 strings, or Direct URLs
 * - Raw File Buffer / Base64 -> Uploads strictly to Cloudinary 'brandflow/festival-templates'
 * - Direct URL -> Saves URL directly to database
 */
export async function createTemplate(data, creatorId) {
  let imageUrl = null;

  // 1. If File Buffer attached (from multipart or auto-decoded base64 from middleware)
  if (data.fileBuffer) {
    const uploadResult = await uploadTemplateBuffer(data.fileBuffer);
    imageUrl = uploadResult.url;
  }
  // 2. If Direct CDN / Cloudinary image URL passed
  else if (data.baseImageUrl && typeof data.baseImageUrl === 'string' && !data.baseImageUrl.includes(';base64,')) {
    imageUrl = data.baseImageUrl.trim();
  }
  // 3. Fallback: Base64 data URL passed directly (e.g. in test suites bypassing middleware)
  else if (data.base64Image || (typeof data.baseImageUrl === 'string' && data.baseImageUrl.includes(';base64,'))) {
    let cleanBase64 = data.base64Image || data.baseImageUrl;
    if (cleanBase64.includes(';base64,')) {
      cleanBase64 = cleanBase64.split(';base64,').pop();
    }
    const buffer = Buffer.from(cleanBase64, 'base64');
    const uploadResult = await uploadTemplateBuffer(buffer);
    imageUrl = uploadResult.url;
  }

  if (!imageUrl) {
    throw new BadRequestError('Template image file, base64 string, or direct image URL is required.');
  }

  let catRecord = null;
  const targetCategoryId = data.templateCategoryId || data.categoryId;
  if (targetCategoryId) {
    catRecord = await templateCategoryRepository.findTemplateCategoryById(targetCategoryId);
  }

  if (!catRecord) {
    let catName = (
      data.newCategoryName ||
      (data.category !== 'NEW' ? data.category : '') ||
      DEFAULT_TEMPLATE_CATEGORY_NAME
    ).trim();

    if (catName === 'NEW') {
      catName = DEFAULT_TEMPLATE_CATEGORY_NAME;
    }

    catRecord = await templateCategoryRepository.findTemplateCategoryByNameOrSlug(catName);
    if (!catRecord && catName) {
      catRecord = await templateCategoryRepository.createTemplateCategory({
        name: catName,
        isSystem: false,
        createdBy: creatorId || null,
      });
    }
  }

  const createdTemplate = await templateRepository.createTemplate({
    title: data.title?.trim() || 'Festival Base Template',
    description: data.description?.trim() || null,
    templateCategoryId: catRecord ? catRecord.id : null,
    festivalId: data.festivalId || null,
    baseImageUrl: imageUrl,
    isCustomUpload: true,
    isActive: true,
    createdBy: creatorId || null,
  });

  return sanitizeTemplate(createdTemplate);
}

/**
 * Get paginated template categories
 */
export async function getCategories(queryParams = {}) {
  const pagination = parsePaginationParams(queryParams);
  const { search, sortBy, sortOrder } = queryParams;

  const { categories, totalCount } =
    await templateCategoryRepository.findPaginatedTemplateCategories({
      ...pagination,
      search: search ? search.trim() : undefined,
      sortBy,
      sortOrder,
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
 * Create a new master template category
 */
export async function createCategory(data, creatorId) {
  const catName = data.name?.trim();
  if (!catName) {
    throw new BadRequestError('Template category name is required.');
  }

  const existing = await templateCategoryRepository.findTemplateCategoryByNameOrSlug(catName);
  if (existing) {
    throw new ConflictError('A template category with this name already exists.');
  }

  const created = await templateCategoryRepository.createTemplateCategory({
    name: catName,
    description: data.description?.trim() || null,
    isSystem: data.isSystem ?? false,
    createdBy: creatorId || null,
  });

  return sanitizeTemplateCategory(created);
}

/**
 * Delete a master template category
 */
export async function deleteCategory(id) {
  const existing = await templateCategoryRepository.findTemplateCategoryById(id);
  if (!existing) {
    throw new NotFoundError('Template category not found.');
  }

  await templateCategoryRepository.deleteTemplateCategory(id);
  return {
    id,
    name: existing.name,
  };
}

/**
 * Get paginated system templates with optional filters
 */
export async function getTemplates(queryParams = {}) {
  const pagination = parsePaginationParams(queryParams);
  const { festivalId, category, categoryId, templateCategoryId, search, sortBy, sortOrder } =
    queryParams;

  const { templates, totalCount } = await templateRepository.findPaginatedTemplates({
    ...pagination,
    festivalId: festivalId || undefined,
    category: category || categoryId || undefined,
    templateCategoryId: templateCategoryId || undefined,
    search: search ? search.trim() : undefined,
    sortBy,
    sortOrder,
  });

  const sanitizedTemplates = templates.map(sanitizeTemplate);

  const paginatedResponse = buildPaginatedResponse({
    items: sanitizedTemplates,
    totalCount,
    page: pagination.page,
    limit: pagination.limit,
  });

  return {
    data: {
      templates: paginatedResponse.data,
    },
    meta: paginatedResponse.meta,
  };
}

/**
 * Get a single system template by ID
 */
export async function getTemplateById(id) {
  const template = await templateRepository.findTemplateById(id);
  if (!template) {
    throw new NotFoundError('System Template not found.');
  }
  return sanitizeTemplate(template);
}

/**
 * Delete a system template by ID (cleans up Cloudinary asset & soft deletes)
 */
export async function deleteTemplate(id) {
  const template = await templateRepository.findTemplateById(id);
  if (!template) {
    throw new NotFoundError('System Template not found.');
  }

  if (template.baseImageUrl) {
    deleteFromCloudinary(template.baseImageUrl).catch((err) =>
      logger.warn(`Failed to cleanup template image from Cloudinary: ${err.message}`)
    );
  }

  await templateRepository.deleteTemplate(id);
  return {
    id,
    title: template.title,
  };
}

