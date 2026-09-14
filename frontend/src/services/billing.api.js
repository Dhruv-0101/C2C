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

  /**
   * Admin Top-Up: Grant bonus post quota to a business user
   */
  adminTopUpQuota: async (userId, bonusPosts = 10) => {
    const response = await api.put(`/billing/admin/topup/${userId}`, { bonusPosts });
    return response.data;
  },

  /**
   * Get paginated billing transactions history
   */
  getHistory: async ({ page = 1, limit = 10 } = {}) => {
    const response = await api.get('/billing/history', {
      params: { page, limit },
    });
    return response;
  },

  /**
   * Download PDF Invoice for a billing transaction
   */
  downloadInvoice: async (transactionId) => {
    const responseData = await api.get(`/billing/invoice/${transactionId}/download`, {
      responseType: 'blob',
    });

    // Axios response interceptor returns response.data directly (which is the Blob object itself)
    const blob = responseData instanceof Blob
      ? responseData
      : new Blob([responseData], { type: 'application/pdf' });

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `BrandFlow_Invoice_${transactionId.substring(0, 8)}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};

export default billingApi;
