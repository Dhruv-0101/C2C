import {
  getFinancialOverview,
  getPaginatedTransactions,
  recordManualTransaction as recordManualTransactionRepo,
  getAllMatchingTransactionsForExport,
} from './billing.admin.repository.js';
import { sanitizeTransaction, sanitizeTransactions } from './billing.helper.js';
import {
  BILLING_CURRENCIES,
  BILLING_PLANS,
  PAYMENT_GATEWAYS,
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
} from './billing.constants.js';
import { BadRequestError } from '../../common/errors/custom-errors.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../common/helpers/pagination.helper.js';

/**
 * Get executive financial overview & revenue statistics
 *
 * @returns {Promise<Object>} Overview metrics
 */
export const getOverview = async () => {
  const overview = await getFinancialOverview();
  return overview;
};

/**
 * Get paginated transactions list with search and filtering
 *
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>} Paginated transactions
 */
export const getTransactions = async (queryParams = {}) => {
  const pagination = parsePaginationParams(queryParams);

  const result = await getPaginatedTransactions({
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

  const sanitizedItems = sanitizeTransactions(result.items);

  const paginatedResponse = buildPaginatedResponse({
    items: sanitizedItems,
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
};

/**
 * Record a manual payment / offline transaction
 *
 * @param {Object} data - Transaction input
 * @returns {Promise<Object>} Sanitized recorded transaction
 */
export const recordManualTransaction = async (data = {}) => {
  if (!data.userId) {
    throw new BadRequestError('User ID is required to record a manual transaction.');
  }

  const transaction = await recordManualTransactionRepo({
    userId: data.userId,
    plan: data.plan || BILLING_PLANS.PRO,
    transactionType: data.transactionType || TRANSACTION_TYPES.PLAN_PURCHASE,
    paymentGateway: data.paymentGateway || PAYMENT_GATEWAYS.ADMIN_MANUAL,
    pricePaid: Number(data.pricePaid) || 0,
    currency: data.currency || BILLING_CURRENCIES.INR,
    postCount: Number(data.postCount) || 100,
    paymentId: data.paymentId || `MANUAL_PAY_${Date.now()}`,
    orderId: data.orderId || `MANUAL_ORD_${Date.now()}`,
    status: data.status || TRANSACTION_STATUSES.COMPLETED,
  });

  return sanitizeTransaction(transaction);
};

/**
 * Export transactions as CSV statement string
 *
 * @param {Object} queryParams - Filter parameters
 * @returns {Promise<string>} CSV formatted string
 */
export const exportTransactionsCsv = async (queryParams = {}) => {
  const items = await getAllMatchingTransactionsForExport({
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
    Number(tx.pricePaid || 0).toFixed(2),
    tx.currency || BILLING_CURRENCIES.INR,
    tx.status,
    `"${tx.paymentId || ''}"`,
    `"${tx.orderId || ''}"`,
  ]);

  const csvString = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  return csvString;
};

/**
 * Billing Admin Logic singleton for backward-compatible consumption
 */
export const billingAdminLogic = {
  getOverview,
  getTransactions,
  recordManualTransaction,
  exportTransactionsCsv,
};
