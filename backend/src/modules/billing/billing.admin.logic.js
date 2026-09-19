import { billingAdminRepository } from './billing.admin.repository.js';
import { BadRequestError } from '../../common/errors/custom-errors.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../common/helpers/pagination.helper.js';

export const billingAdminLogic = {
  /**
   * Get executive financial overview & revenue statistics
   */
  getOverview: async () => {
    const overview = await billingAdminRepository.getFinancialOverview();
    return overview;
  },

  /**
   * Get paginated transactions list with search and filtering
   */
  getTransactions: async (queryParams) => {
    const pagination = parsePaginationParams(queryParams);

    const result = await billingAdminRepository.getPaginatedTransactions({
      page: pagination.page,
      limit: pagination.limit,
      search: queryParams.search || pagination.search || '',
      status: queryParams.status || '',
      paymentGateway: queryParams.paymentGateway || '',
      currency: queryParams.currency || '',
      plan: queryParams.plan || '',
      startDate: queryParams.startDate || '',
      endDate: queryParams.endDate || '',
    });

    const paginatedResponse = buildPaginatedResponse({
      items: result.items,
      totalCount: result.totalCount,
      page: pagination.page,
      limit: pagination.limit,
    });

    return {
      data: {
        ...result,
        items: paginatedResponse.data,
      },
      meta: paginatedResponse.meta,
    };
  },


  /**
   * Record a manual payment / offline transaction
   */
  recordManualTransaction: async (data) => {
    if (!data.userId) {
      throw new BadRequestError('User ID is required to record a manual transaction.');
    }

    const transaction = await billingAdminRepository.recordManualTransaction({
      userId: data.userId,
      plan: data.plan || 'PRO',
      transactionType: data.transactionType || 'PLAN_PURCHASE',
      paymentGateway: data.paymentGateway || 'ADMIN_MANUAL',
      pricePaid: Number(data.pricePaid) || 0,
      currency: data.currency || 'INR',
      postCount: Number(data.postCount) || 100,
      paymentId: data.paymentId || `MANUAL_PAY_${Date.now()}`,
      orderId: data.orderId || `MANUAL_ORD_${Date.now()}`,
      status: data.status || 'COMPLETED',
    });

    return transaction;
  },

  /**
   * Export transactions as CSV statement string
   */
  exportTransactionsCsv: async (queryParams) => {
    const items = await billingAdminRepository.getAllMatchingTransactionsForExport({
      search: queryParams.search || '',
      status: queryParams.status || '',
      paymentGateway: queryParams.paymentGateway || '',
      currency: queryParams.currency || '',
      plan: queryParams.plan || '',
      startDate: queryParams.startDate || '',
      endDate: queryParams.endDate || '',
    });

    const headers = [
      'Transaction ID',
      'Date & Time',
      'User Name',
      'User Email',
      'Business Name',
      'Plan',
      'Gateway',
      'Amount',
      'Currency',
      'Status',
      'Payment ID',
      'Order ID',
    ];

    const rows = items.map((tx) => [
      tx.id,
      `"${new Date(tx.createdAt).toLocaleString()}"`,
      `"${(tx.user?.fullName || '').replace(/"/g, '""')}"`,
      `"${tx.user?.email || ''}"`,
      `"${(tx.user?.brandKit?.businessName || 'N/A').replace(/"/g, '""')}"`,
      tx.plan,
      tx.paymentGateway,
      tx.pricePaid,
      tx.currency || 'INR',
      tx.status,
      `"${tx.paymentId || ''}"`,
      `"${tx.orderId || ''}"`,
    ]);

    const csvString = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    return csvString;
  },
};
