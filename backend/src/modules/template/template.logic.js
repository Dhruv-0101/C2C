import {
  BadRequestError,
  NotFoundError,
} from '../../common/errors/custom-errors.js';
import * as templateRepository from './template.repository.js';
import * as templateCategoryRepository from '../template-category/templateCategory.repository.js';
import {
  parsePaginationParams,
  buildPaginatedResponse,
} from '../../common/helpers/pagination.helper.js';
import { uploadTemplateBuffer, deleteFromCloudinary } from '../../config/cloudinary.js';
import { logger } from '../../config/logger.js';
import { sanitizeTemplate } from './template.helper.js';
import { DEFAULT_TEMPLATE_CATEGORY_NAME } from './template.constants.js';
import { getOrSetCache, deleteCachePattern } from '../../common/utils/cache.util.js';
import { CACHE_KEYS, CACHE_TTL } from '../../common/constants/cache.constants.js';

/**
 * 🎨 MASTER GRAPHIC TEMPLATE BUSINESS LOGIC
 * Encapsulates all domain validation, Cloudinary asset storage, category resolution, and data sanitization.
 */

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
 * Unifying Template Creation: Handles File Attachments, Base64 strings, or Direct URLs
 * - Raw File Buffer / Base64 -> Uploads strictly to Cloudinary 'brandflow/festival-templates'
 * - Direct URL -> Saves URL directly to database
 */
export async function createTemplate(data, creatorId) {
  let imageUrl = null;

  // Process File Buffer attached from multipart upload -> Cloudinary brandflow/festival-templates
  if (data.fileBuffer) {
    const uploadResult = await uploadTemplateBuffer(data.fileBuffer);
    imageUrl = uploadResult.url;
  }

  if (!imageUrl) {
    throw new BadRequestError('Template graphic image file is required.');
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
      let slug = slugify(catName);
      if (!slug) {
        slug = `category-${Date.now()}`;
      }
      const existingBySlug = await templateCategoryRepository.findTemplateCategoryBySlug(slug);
      if (existingBySlug) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }

      catRecord = await templateCategoryRepository.createTemplateCategory({
        name: catName,
        slug,
        isSystem: false,
        createdBy: creatorId || null,
      });

      // Purge template categories cache so dropdowns update immediately
      await deleteCachePattern(CACHE_KEYS.TEMPLATE_CATEGORY_PATTERN);
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

  // Invalidate templates and festival caches
  await Promise.all([
    deleteCachePattern(CACHE_KEYS.TEMPLATE_PATTERN),
    deleteCachePattern(CACHE_KEYS.FESTIVAL_PATTERN),
  ]);

  return sanitizeTemplate(createdTemplate);
}

/**
 * Get paginated system templates with optional filters (Redis Cached)
 */
export async function getTemplates(queryParams = {}) {
  const cacheKey = CACHE_KEYS.TEMPLATES_LIST(queryParams);

  return getOrSetCache(
    cacheKey,
    async () => {
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
    },
    CACHE_TTL.ONE_HOUR
  );
}

/**
 * Get a single system template by ID (Redis Cached)
 */
export async function getTemplateById(id) {
  const cacheKey = CACHE_KEYS.TEMPLATE_BY_ID(id);

  return getOrSetCache(
    cacheKey,
    async () => {
      const template = await templateRepository.findTemplateById(id);
      if (!template) {
        throw new NotFoundError('System Template not found.');
      }
      return sanitizeTemplate(template);
    },
    CACHE_TTL.ONE_HOUR
  );
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

  // Invalidate templates and festival caches
  await Promise.all([
    deleteCachePattern(CACHE_KEYS.TEMPLATE_PATTERN),
    deleteCachePattern(CACHE_KEYS.FESTIVAL_PATTERN),
  ]);

  return {
    id,
    title: template.title,
  };
}


