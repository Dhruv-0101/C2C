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
  connectSocialToken: (userId, token) => api.post('/social/admin/connect-user-token', { userId, token }),
  disconnectSocialAccount: (userId, platform) => api.delete(`/social/admin/user/${userId}/${platform}`),
};

export default usersApi;
