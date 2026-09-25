/**
 * Admin Users API Client
 */
import { api } from '@/shared/http/api.client';
import { API_ENDPOINTS } from '@/shared/http/api.endpoints';

export const usersApi = {
  getAll: (params) => api.get(API_ENDPOINTS.USERS.BASE, { params }),
  getById: (id) => api.get(API_ENDPOINTS.USERS.BY_ID(id)),
  updateRole: (id, role) => api.patch(API_ENDPOINTS.USERS.ROLE(id), { role }),
  topUpQuota: (id, payload) => api.post(`${API_ENDPOINTS.USERS.BY_ID(id)}/quota`, payload),
};

export default usersApi;
