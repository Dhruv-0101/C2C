import { api } from './api.service';

export const templateApi = {
  getTemplates: async (params = {}) => {
    return api.get('/templates', { params });
  },

  createTemplate: async (data) => {
    return api.post('/templates', data);
  },

  uploadAdminTemplate: async (data) => {
    return api.post('/templates/upload', data);
  },

  compositePost: async ({ templateId, brandKit, customText }) => {
    return api.post('/templates/composite-post', {
      templateId,
      brandKit,
      customText,
    });
  },

  deleteTemplate: async (id) => {
    return api.delete(`/templates/${id}`);
  },
};
