import { api } from './api.service';

export const adminFinanceApi = {
  /**
   * Get executive financial overview & revenue metrics
   */
  getOverview: async () => {
    return api.get('/billing/admin/overview');
  },

  /**
   * Get paginated transactions list with search and filtering
   */
  getTransactions: async (params) => {
    return api.get('/billing/admin/transactions', { params });
  },

  /**
   * Record a manual payment / offline transaction
   */
  recordManualTransaction: async (data) => {
    return api.post('/billing/admin/manual-transaction', data);
  },

  /**
   * Export transactions CSV statement
   */
  exportTransactionsCsv: async (params) => {
    return api.get('/billing/admin/export', {
      params,
      responseType: 'blob',
    });
  },
};
