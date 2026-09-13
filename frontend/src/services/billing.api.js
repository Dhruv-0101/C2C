import api from './api.service';

export const billingApi = {
  /**
   * Get user subscription status and post quota
   */
  getStatus: async () => {
    const response = await api.get('/billing/status');
    return response.data;
  },

  /**
   * Activate / Select Free Plan (5 Posts Quota)
   */
  activateFreePlan: async () => {
    const response = await api.post('/billing/free/activate');
    return response.data;
  },

  /**
   * Create Razorpay Order for Pro Plan (INR)
   */
  createRazorpayOrder: async (postCount) => {
    const response = await api.post('/billing/razorpay/create-order', { postCount });
    return response.data;
  },

  /**
   * Verify Razorpay Payment API & Upgrade to Pro
   */
  verifyRazorpayPayment: async ({ orderId, paymentId, signature, postCount }) => {
    const response = await api.post('/billing/razorpay/verify', {
      orderId,
      paymentId,
      signature,
      postCount,
    });
    return response.data;
  },

  /**
   * Create Stripe PaymentIntent for Pro Plan (USD)
   */
  createStripeIntent: async (postCount) => {
    const response = await api.post('/billing/stripe/create-intent', { postCount });
    return response.data;
  },

  /**
   * Verify Stripe Payment API & Upgrade to Pro
   */
  verifyStripePayment: async ({ intentId, postCount }) => {
    const response = await api.post('/billing/stripe/verify', {
      intentId,
      postCount,
    });
    return response.data;
  },
};

export default billingApi;
