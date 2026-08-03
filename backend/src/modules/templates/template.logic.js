import { templateRepository } from './template.repository.js';
import { compositeBrandedGraphic } from '../../common/helpers/sharp-compositor.helper.js';
import { uploadToCloudinaryBuffer } from '../../config/cloudinary.js';

export const templateLogic = {
  uploadAdminTemplate: async ({ fileBuffer, base64Image, title, description, festivalId, creatorId }) => {
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

    return templateRepository.create({
      title: title || 'Festival Base Template',
      description: description || null,
      festivalId: festivalId || null,
      baseImageUrl: imageUrl,
      isCustomUpload: true,
      createdBy: creatorId || null,
    });
  },

  createTemplate: async (data, creatorId) => {
    return templateRepository.create({
      title: data.title,
      description: data.description,
      festivalId: data.festivalId || null,
      baseImageUrl: data.baseImageUrl,
      isCustomUpload: true,
      createdBy: creatorId || null,
    });
  },

  getTemplates: async (query = {}) => {
    const filter = {};
    if (query.festivalId) filter.festivalId = query.festivalId;

    return templateRepository.findMany(filter);
  },

  getTemplateById: async (id) => {
    const template = await templateRepository.findById(id);
    if (!template) {
      throw new Error('System Template not found.');
    }
    return template;
  },

  compositePost: async ({ templateId, brandKit, customText }) => {
    const template = await templateRepository.findById(templateId);
    if (!template) {
      throw new Error('System template not found for compositing.');
    }

    const finalGraphicUrl = await compositeBrandedGraphic({
      baseImageUrl: template.baseImageUrl,
      coordinatesJson: template.coordinatesJson,
      brandKit: brandKit || {},
      customText: customText || '',
    });

    return {
      templateId,
      finalGraphicUrl,
    };
  },

  deleteTemplate: async (id) => {
    return templateRepository.delete(id);
  },
};
