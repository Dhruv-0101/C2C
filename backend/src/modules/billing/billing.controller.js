import { billingLogic } from './billing.logic.js';

export const billingController = {
  /**
   * Get subscription status & quota
   */
  getStatus: async (req, res, next) => {
    try {
      const data = await billingLogic.getSubscriptionStatus(req.user.id);
      res.status(200).json({
        success: true,
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
      res.status(200).json({
        success: true,
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
      res.status(200).json({
        success: true,
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
      res.status(200).json({
        success: true,
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
      res.status(200).json({
        success: true,
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
      res.status(200).json({
        success: true,
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
      res.status(200).json({
        success: true,
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
      res.status(200).json({
        success: true,
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
      return res.send(data.pdfBuffer);
    } catch (err) {
      next(err);
    }
  },
};
