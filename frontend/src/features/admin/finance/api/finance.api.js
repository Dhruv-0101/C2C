import { api } from '@/shared/http/api.client';
import { API_ENDPOINTS } from '@/shared/http/api.endpoints';

export const adminFinanceApi = {
  /**
   * Get executive financial overview & revenue metrics
   */
  getOverview: async () => {
    return api.get(API_ENDPOINTS.BILLING.ADMIN_OVERVIEW);
  },

  /**
   * Get paginated transactions list with search and filtering
   */
  getTransactions: async (params) => {
    return api.get(API_ENDPOINTS.BILLING.ADMIN_TRANSACTIONS, { params });
  },

  /**
   * Record a manual payment / offline transaction
   */
  recordManualTransaction: async (data) => {
    return api.post(API_ENDPOINTS.BILLING.ADMIN_MANUAL_TRANSACTION, data);
  },

  /**
   * Export transactions CSV statement
   */
  exportTransactionsCsv: async (params) => {
    return api.get(API_ENDPOINTS.BILLING.ADMIN_EXPORT, {
      params,
      responseType: 'blob',
    });
  },
};

export default adminFinanceApi;
