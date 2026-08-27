import { templateRepository } from './template.repository.js';
import { templateCategoryRepository } from './templateCategory.repository.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../common/helpers/pagination.helper.js';
import { uploadToCloudinaryBuffer } from '../../config/cloudinary.js';

export const templateLogic = {
  uploadAdminTemplate: async ({ fileBuffer, base64Image, title, description, category, newCategoryName, festivalId, creatorId }) => {
    let imageUrl = null;

    if (fileBuffer) {
      const uploadResult = await uploadToCloudinaryBuffer(fileBuffer, 'brandflow/festival-templates');
      imageUrl = uploadResult.url;
    } else if (base64Image) {
      let cleanBase64 = base64Image;
      if (cleanBase64.includes(';base64,')) {
        cleanBase64 = cleanBase64.split(';base64,').pop();
      }
      const buffer = Buffer.from(cleanBase64, 'base64');
      const uploadResult = await uploadToCloudinaryBuffer(buffer, 'brandflow/festival-templates');
      imageUrl = uploadResult.url;
    } else {
      throw new Error('Image file or base64 image data is required.');
    }

    let catName = (newCategoryName || (category !== 'NEW' ? category : '') || 'General Business').trim();
    if (catName === 'NEW') catName = 'General Business';

    let catRecord = await templateCategoryRepository.findByNameOrSlug(catName);
    if (!catRecord && catName) {
      catRecord = await templateCategoryRepository.create({ name: catName, isSystem: false });
    }

    return templateRepository.create({
      title: title || 'Festival Base Template',
      description: description || null,
      category: catRecord ? catRecord.name : catName,
      templateCategoryId: catRecord ? catRecord.id : null,
      festivalId: festivalId || null,
      baseImageUrl: imageUrl,
      isCustomUpload: true,
      createdBy: creatorId || null,
    });
  },

  createTemplate: async (data, creatorId) => {
    let catName = (data.newCategoryName || (data.category !== 'NEW' ? data.category : '') || 'General Business').trim();
    if (catName === 'NEW') catName = 'General Business';

    let catRecord = await templateCategoryRepository.findByNameOrSlug(catName);
    if (!catRecord && catName) {
      catRecord = await templateCategoryRepository.create({ name: catName, isSystem: false });
    }

    return templateRepository.create({
      title: data.title,
      description: data.description,
      category: catRecord ? catRecord.name : catName,
      templateCategoryId: catRecord ? catRecord.id : null,
      festivalId: data.festivalId || null,
      baseImageUrl: data.baseImageUrl,
      isCustomUpload: true,
      createdBy: creatorId || null,
    });
  },

  getCategories: async () => {
    return templateCategoryRepository.findMany();
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

  compositePost: async ({ templateId, brandKit, customText, base64Graphic, base64Image }) => {
    let rawBase64 = base64Graphic || base64Image;

    // If frontend sent pre-rendered canvas graphic, upload directly to Cloudinary (0 CPU server load)
    if (rawBase64) {
      if (rawBase64.includes(';base64,')) {
        rawBase64 = rawBase64.split(';base64,').pop();
      }
      const buffer = Buffer.from(rawBase64, 'base64');
      const uploadResult = await uploadToCloudinaryBuffer(buffer, 'brandflow/posts');
      return {
        templateId: templateId || null,
        finalGraphicUrl: uploadResult.url,
      };
    }

    if (!templateId) {
      throw new Error('Template ID or pre-rendered graphic is required.');
    }

    const template = await templateRepository.findById(templateId);
    if (!template) {
      throw new Error('System template not found.');
    }

    return {
      templateId,
      finalGraphicUrl: template.baseImageUrl,
    };
  },

  deleteTemplate: async (id) => {
    return templateRepository.delete(id);
  },
};
