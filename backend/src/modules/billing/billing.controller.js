import { HTTP_STATUS } from '../../common/constants/http-status.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';
import { billingLogic } from './billing.logic.js';

export const billingController = {
  /**
   * Get subscription status & quota
   */
  getStatus: async (req, res, next) => {
    try {
      const data = await billingLogic.getSubscriptionStatus(req.user.id);
      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Subscription status fetched successfully.',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Activate / Select Free Plan
   */
  activateFreePlan: async (req, res, next) => {
    try {
      const data = await billingLogic.activateFreePlan(req.user.id);
      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.OK,
        message: data.message,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create Razorpay Order
   */
  createRazorpayOrder: async (req, res, next) => {
    try {
      const { postCount } = req.body;
      const data = await billingLogic.createRazorpayOrder(req.user.id, postCount);
      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Razorpay order created successfully.',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Verify Razorpay Payment API
   */
  verifyRazorpayPayment: async (req, res, next) => {
    try {
      const data = await billingLogic.verifyRazorpayPayment(req.user.id, req.body);
      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.OK,
        message: data.message,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create Stripe PaymentIntent
   */
  createStripeIntent: async (req, res, next) => {
    try {
      const { postCount } = req.body;
      const data = await billingLogic.createStripeIntent(req.user.id, postCount);
      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Stripe PaymentIntent created successfully.',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Verify Stripe Payment API
   */
  verifyStripePayment: async (req, res, next) => {
    try {
      const data = await billingLogic.verifyStripePayment(req.user.id, req.body);
      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.OK,
        message: data.message,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Admin Top-Up: Grant bonus post quota to a business user
   */
  adminTopUpQuota: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { bonusPosts = 10 } = req.body;
      const data = await billingLogic.topUpUserQuota(userId, Number(bonusPosts));
      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.OK,
        message: `Successfully granted +${bonusPosts} bonus post quota to user!`,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get paginated billing & transaction history
   */
  getHistory: async (req, res, next) => {
    try {
      const data = await billingLogic.getBillingHistory(req.user.id, req.query);
      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Billing transaction history fetched successfully.',
        data: data.data,
        meta: data.meta,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Download PDF Invoice for a billing transaction
   */
  downloadInvoice: async (req, res, next) => {
    try {
      const { transactionId } = req.params;
      const data = await billingLogic.generateInvoicePdf(
        req.user.id,
        transactionId,
        req.user?.role
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${data.fileName}"`);
      res.setHeader('Content-Length', data.pdfBuffer.length);
      return res.status(HTTP_STATUS.OK).send(data.pdfBuffer);
    } catch (err) {
      next(err);
    }
  },
};
