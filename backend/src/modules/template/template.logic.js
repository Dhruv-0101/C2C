import { templateRepository } from './template.repository.js';
import { templateCategoryRepository } from './templateCategory.repository.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../common/helpers/pagination.helper.js';
import { uploadTemplateBuffer, deleteFromCloudinary } from '../../config/cloudinary.js';

export const templateLogic = {
  /**
   * Unifying Template Creation: Handles File Attachments, Base64 strings, or Direct URLs
   * - Raw File Buffer / Base64 -> Uploads strictly to Cloudinary 'brandflow/festival-templates'
   * - Direct URL -> Saves URL directly to database
   */
  createTemplate: async (data, creatorId) => {
    let imageUrl = data.baseImageUrl || null;

    // 1. If File Buffer attached -> Upload to Cloudinary brandflow/festival-templates
    if (data.fileBuffer) {
      const uploadResult = await uploadTemplateBuffer(data.fileBuffer);
      imageUrl = uploadResult.url;
    } 
    // 2. If Base64 Image string attached -> Convert buffer & Upload to Cloudinary brandflow/festival-templates
    else if (data.base64Image || (data.baseImageUrl && data.baseImageUrl.includes(';base64,'))) {
      let cleanBase64 = data.base64Image || data.baseImageUrl;
      if (cleanBase64.includes(';base64,')) {
        cleanBase64 = cleanBase64.split(';base64,').pop();
      }
      const buffer = Buffer.from(cleanBase64, 'base64');
      const uploadResult = await uploadTemplateBuffer(buffer);
      imageUrl = uploadResult.url;
    }

    if (!imageUrl) {
      throw new Error('Template image file, base64 string, or direct image URL is required.');
    }

    let catName = (data.newCategoryName || (data.category !== 'NEW' ? data.category : '') || 'General Business').trim();
    if (catName === 'NEW') catName = 'General Business';

    let catRecord = await templateCategoryRepository.findByNameOrSlug(catName);
    if (!catRecord && catName) {
      catRecord = await templateCategoryRepository.create({ name: catName, isSystem: false });
    }

    return templateRepository.create({
      title: data.title || 'Festival Base Template',
      description: data.description || null,
      category: catRecord ? catRecord.name : catName,
      templateCategoryId: catRecord ? catRecord.id : null,
      festivalId: data.festivalId || null,
      baseImageUrl: imageUrl,
      isCustomUpload: true,
      createdBy: creatorId || data.creatorId || null,
    });
  },

  /**
   * Helper delegate wrapper for admin upload endpoint
   */
  uploadAdminTemplate: async (payload) => {
    return templateLogic.createTemplate(payload, payload.creatorId);
  },

  getCategories: async (queryParams = {}) => {
    const pagination = parsePaginationParams(queryParams);
    const { categories, totalCount } = await templateCategoryRepository.findPaginated(pagination);

    const paginatedResponse = buildPaginatedResponse({
      items: categories,
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
  },

  getTemplates: async (queryParams = {}) => {
    const pagination = parsePaginationParams(queryParams);
    const { festivalId, category } = queryParams;

    const { templates, totalCount } = await templateRepository.findPaginated({
      ...pagination,
      festivalId: festivalId || undefined,
      category: category || undefined,
    });

    const paginatedResponse = buildPaginatedResponse({
      items: templates,
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

  getTemplateById: async (id) => {
    const template = await templateRepository.findById(id);
    if (!template) {
      throw new Error('System Template not found.');
    }
    return template;
  },

  deleteTemplate: async (id) => {
    const template = await templateRepository.findById(id);
    if (template?.baseImageUrl) {
      deleteFromCloudinary(template.baseImageUrl).catch((err) =>
        console.warn(`⚠️ Failed to cleanup template image from Cloudinary: ${err.message}`)
      );
    }
    return templateRepository.delete(id);
  },
};
