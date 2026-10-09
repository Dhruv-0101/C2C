import { apiClient } from '@/shared/http/api.client';
import { API_ENDPOINTS } from '@/shared/http/api.endpoints';

/**
 * 🛰️ System Status API Service
 * Fetches real-time infrastructure metrics and sub-service health.
 */
export const getSystemStatusApi = async () => {
  const response = await apiClient.get(API_ENDPOINTS.SYSTEM.STATUS);
  return response.data?.data;
};
