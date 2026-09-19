import { HTTP_STATUS } from '../../common/constants/http-status.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';
import { billingAdminLogic } from './billing.admin.logic.js';

export const billingAdminController = {
  /**
   * GET /api/v1/billing/admin/overview
   * Executive Financial Overview & Revenue Analytics
   */
  getOverview: async (req, res, next) => {
    try {
      const data = await billingAdminLogic.getOverview();
      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Financial overview retrieved successfully 💳',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/billing/admin/transactions
   * Paginated Billing Transactions with Search & Filtering
   */
  getTransactions: async (req, res, next) => {
    try {
      const result = await billingAdminLogic.getTransactions(req.query);
      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Admin billing transactions retrieved successfully 📊',
        data: result.data,
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/billing/admin/manual-transaction
   * Record a manual transaction or offline payment
   */
  recordManualTransaction: async (req, res, next) => {
    try {
      const transaction = await billingAdminLogic.recordManualTransaction(req.body);
      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.CREATED,
        message: 'Manual transaction recorded successfully ✨',
        data: transaction,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/billing/admin/export
   * Download CSV statement of matching billing transactions
   */
  exportTransactionsCsv: async (req, res, next) => {
    try {
      const csvData = await billingAdminLogic.exportTransactionsCsv(req.query);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=BrandFlow-Transactions-${Date.now()}.csv`);
      return res.status(HTTP_STATUS.OK).send(csvData);
    } catch (err) {
      next(err);
    }
  },
};
