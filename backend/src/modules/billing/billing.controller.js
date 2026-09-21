import { HTTP_STATUS } from '../../common/constants/http-status.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';
import {
  getSubscriptionStatus as getSubscriptionStatusLogic,
  activateFreePlan as activateFreePlanLogic,
  createRazorpayOrder as createRazorpayOrderLogic,
  verifyRazorpayPayment as verifyRazorpayPaymentLogic,
  createStripeIntent as createStripeIntentLogic,
  verifyStripePayment as verifyStripePaymentLogic,
  topUpUserQuota as topUpUserQuotaLogic,
  getBillingHistory as getBillingHistoryLogic,
  generateInvoicePdf as generateInvoicePdfLogic,
} from './billing.logic.js';

/**
 * Get subscription status & quota
 * GET /api/v1/billing/status
 */
export const getStatus = async (req, res, next) => {
  try {
    const data = await getSubscriptionStatusLogic(req.user.id);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Subscription status fetched successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Activate / Select Free Plan
 * POST /api/v1/billing/free/activate
 */
export const activateFreePlan = async (req, res, next) => {
  try {
    const data = await activateFreePlanLogic(req.user.id);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: data.message,
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create Razorpay Order
 * POST /api/v1/billing/razorpay/create-order
 */
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { postCount } = req.body;
    const data = await createRazorpayOrderLogic(req.user.id, postCount);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Razorpay order created successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Verify Razorpay Payment API
 * POST /api/v1/billing/razorpay/verify
 */
export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const data = await verifyRazorpayPaymentLogic(req.user.id, req.body);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: data.message,
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create Stripe PaymentIntent
 * POST /api/v1/billing/stripe/create-intent
 */
export const createStripeIntent = async (req, res, next) => {
  try {
    const { postCount } = req.body;
    const data = await createStripeIntentLogic(req.user.id, postCount);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Stripe PaymentIntent created successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Verify Stripe Payment API
 * POST /api/v1/billing/stripe/verify
 */
export const verifyStripePayment = async (req, res, next) => {
  try {
    const data = await verifyStripePaymentLogic(req.user.id, req.body);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: data.message,
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin Top-Up: Grant bonus post quota to a business user
 * PUT /api/v1/billing/admin/topup/:userId
 */
export const adminTopUpQuota = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { bonusPosts = 10 } = req.body;
    const data = await topUpUserQuotaLogic(userId, Number(bonusPosts));
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: `Successfully granted +${bonusPosts} bonus post quota to user!`,
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get paginated billing & transaction history
 * GET /api/v1/billing/history
 */
export const getHistory = async (req, res, next) => {
  try {
    const data = await getBillingHistoryLogic(req.user.id, req.query);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Billing transaction history fetched successfully.',
      data: data.data,
      meta: data.meta,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Download PDF Invoice for a billing transaction
 * GET /api/v1/billing/invoice/:transactionId/download
 */
export const downloadInvoice = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const data = await generateInvoicePdfLogic(
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
};

/**
 * Billing Controller singleton for backward-compatible consumption
 */
export const billingController = {
  getStatus,
  activateFreePlan,
  createRazorpayOrder,
  verifyRazorpayPayment,
  createStripeIntent,
  verifyStripePayment,
  adminTopUpQuota,
  getHistory,
  downloadInvoice,
};
