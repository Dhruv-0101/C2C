/**
 * Admin Sub-Admins API Client
 */
import { api } from '@/shared/http/api.client';
import { API_ENDPOINTS } from '@/shared/http/api.endpoints';

export const subAdminsApi = {
  getAll: () => api.get(API_ENDPOINTS.USERS.SUB_ADMINS),
  create: (data) => api.post(API_ENDPOINTS.USERS.SUB_ADMINS, data),
  getActivity: (params) => api.get(API_ENDPOINTS.AUDIT.SUB_ADMINS, { params }),
};

export default subAdminsApi;
