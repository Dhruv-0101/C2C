import { templateRepository } from './template.repository.js';
import { compositeBrandedGraphic } from '../../common/helpers/sharp-compositor.helper.js';

export const templateLogic = {
  createTemplate: async (data, creatorId) => {
    return templateRepository.create({
      title: data.title,
      description: data.description,
      categoryId: data.categoryId || null,
      festivalId: data.festivalId || null,
      styleId: data.styleId || null,
      baseImageUrl: data.baseImageUrl,
      coordinatesJson: data.coordinatesJson || {
        logoZone: { x: 50, y: 50, width: 140, height: 140 },
        headlineZone: { x: 540, y: 220, fontSize: 44, color: '#FFFFFF' },
        contactBarZone: { x: 0, y: 990, height: 90 },
      },
      isCustomUpload: true,
      createdBy: creatorId || null,
    });
  },

  getTemplates: async (query = {}) => {
    const filter = {};
    if (query.categoryId) filter.categoryId = query.categoryId;
    if (query.festivalId) filter.festivalId = query.festivalId;
    if (query.styleId) filter.styleId = query.styleId;

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
