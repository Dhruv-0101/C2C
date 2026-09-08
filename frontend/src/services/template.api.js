import api from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

export const templateApi = {
  getTemplates: async (params = {}) => {
    return api.get(API_ENDPOINTS.TEMPLATES.BASE, { params });
  },

  createTemplate: async (data) => {
    return api.post(API_ENDPOINTS.TEMPLATES.BASE, data);
  },

  uploadAdminTemplate: async (data) => {
    return api.post(API_ENDPOINTS.TEMPLATES.UPLOAD, data);
  },

  deleteTemplate: async (id) => {
    return api.delete(API_ENDPOINTS.TEMPLATES.BY_ID(id));
  },

  getCategories: async () => {
    return api.get(API_ENDPOINTS.TEMPLATES.CATEGORIES);
  },
};
