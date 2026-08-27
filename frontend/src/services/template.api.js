import { api } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

export const templateApi = {
  getTemplateCategories: async () => {
    return api.get('/templates/categories');
  },

  getTemplates: async (params = {}) => {
    return api.get(API_ENDPOINTS.TEMPLATES.BASE, { params });
  },

  createTemplate: async (data) => {
    return api.post(API_ENDPOINTS.TEMPLATES.BASE, data);
  },

  uploadAdminTemplate: async (data) => {
    return api.post(API_ENDPOINTS.TEMPLATES.UPLOAD, data);
  },

  compositePost: async ({ templateId, brandKit, customText }) => {
    return api.post(API_ENDPOINTS.TEMPLATES.COMPOSITE_POST, {
      templateId,
      brandKit,
      customText,
    });
  },

  deleteTemplate: async (id) => {
    return api.delete(API_ENDPOINTS.TEMPLATES.BY_ID(id));
  },
};
