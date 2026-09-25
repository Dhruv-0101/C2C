import api from '../../../shared/http/api.client';
import { API_ENDPOINTS } from '@/shared/http/api.endpoints';

export const billingApi = {
  /**
   * Get user subscription status and post quota
   */
  getStatus: async () => {
    const response = await api.get(API_ENDPOINTS.BILLING.STATUS);
    return response.data;
  },

  /**
   * Activate / Select Free Plan (5 Posts Quota)
   */
  activateFreePlan: async () => {
    const response = await api.post(API_ENDPOINTS.BILLING.FREE_ACTIVATE);
    return response.data;
  },

  /**
   * Create Razorpay Order for Pro Plan (INR)
   */
  createRazorpayOrder: async (postCount) => {
    const response = await api.post(API_ENDPOINTS.BILLING.RAZORPAY_CREATE_ORDER, { postCount });
    return response.data;
  },

  /**
   * Verify Razorpay Payment API & Upgrade to Pro
   */
  verifyRazorpayPayment: async ({ orderId, paymentId, signature, postCount }) => {
    const response = await api.post(API_ENDPOINTS.BILLING.RAZORPAY_VERIFY, {
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
    const response = await api.post(API_ENDPOINTS.BILLING.STRIPE_CREATE_INTENT, { postCount });
    return response.data;
  },

  /**
   * Verify Stripe Payment API & Upgrade to Pro
   */
  verifyStripePayment: async ({ intentId, postCount }) => {
    const response = await api.post(API_ENDPOINTS.BILLING.STRIPE_VERIFY, {
      intentId,
      postCount,
    });
    return response.data;
  },

  /**
   * Admin Top-Up: Grant bonus post quota to a business user
   */
  adminTopUpQuota: async (userId, bonusPosts = 10) => {
    const response = await api.put(API_ENDPOINTS.BILLING.ADMIN_TOPUP(userId), { bonusPosts });
    return response.data;
  },

  /**
   * Get paginated billing transactions history
   */
  getHistory: async ({ page = 1, limit = 10 } = {}) => {
    const response = await api.get(API_ENDPOINTS.BILLING.HISTORY, {
      params: { page, limit },
    });
    return response;
  },

  /**
   * Download PDF Invoice for a billing transaction
   */
  downloadInvoice: async (transactionId) => {
    const responseData = await api.get(API_ENDPOINTS.BILLING.INVOICE_DOWNLOAD(transactionId), {
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
