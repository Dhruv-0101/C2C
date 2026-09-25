/**
 * Admin Posts API Client
 */
import { api } from '@/shared/http/api.client';
import { API_ENDPOINTS } from '@/shared/http/api.endpoints';

export const adminPostsApi = {
  getAll: (params) => api.get(API_ENDPOINTS.POSTS.ALL, { params }),
  delete: (id) => api.delete(`${API_ENDPOINTS.POSTS.BASE}/${id}`),
};

export default adminPostsApi;
