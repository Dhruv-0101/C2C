/**
 * Centralized API Route URL Constants & BaseURL Resolver
 */

const getApiBaseUrl = () => {
  const isValidUrl = (url) => {
    return (
      url &&
      typeof url === 'string' &&
      !url.includes('VITE_') &&
      (url.startsWith('http://') || url.startsWith('https://'))
    );
  };

  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (isValidUrl(envUrl)) {
    return envUrl.trim();
  }

  const isProduction = import.meta.env.PROD || import.meta.env.VITE_APP_ENV === 'production';
  const envSpecificUrl = isProduction
    ? import.meta.env.VITE_API_BASE_URL_AWS || import.meta.env.VITE_API_BASE_URL_PROD
    : import.meta.env.VITE_API_BASE_URL_DEV;

  if (isValidUrl(envSpecificUrl)) {
    return envSpecificUrl.trim();
  }

  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname.includes('sslip.io') || hostname === '13.234.177.70') {
      return 'https://13-234-177-70.sslip.io/api/v1';
    }
    if (hostname.includes('vercel.app')) {
      return 'https://c2c-negk.onrender.com/api/v1';
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api/v1';
    }
  }

  if (isProduction) {
    return 'https://13-234-177-70.sslip.io/api/v1';
  }

  return 'http://localhost:5000/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    GOOGLE: '/auth/google',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_2FA: '/auth/2fa/verify-login',
    SETUP_2FA: '/auth/2fa/setup',
    ENABLE_2FA: '/auth/2fa/enable',
    DISABLE_2FA: '/auth/2fa/disable',
    SUBADMIN: '/auth/subadmin',
    SUBADMINS: '/auth/subadmins',
    SUBADMIN_ACTIVITY: '/auth/subadmins/activity',
    USERS: '/auth/users',
    USER_STATUS: (userId) => `/auth/users/${userId}/status`,
  },
  BRANDKIT: {
    BASE: '/brandkit',
    UPLOAD_LOGO: '/brandkit/upload-logo',
  },
  BILLING: {
    BASE: '/billing',
    STATUS: '/billing/status',
    SUBSCRIPTION: '/billing/subscription',
    PLANS: '/billing/plans',
    HISTORY: '/billing/history',
    FREE_PLAN: '/billing/free-plan',
    FREE_ACTIVATE: '/billing/free/activate',
    CREATE_ORDER: '/billing/create-order',
    VERIFY_PAYMENT: '/billing/verify-payment',
    RAZORPAY_CREATE_ORDER: '/billing/razorpay/create-order',
    RAZORPAY_VERIFY: '/billing/razorpay/verify',
    CREATE_STRIPE_PAYMENT_INTENT: '/billing/create-stripe-payment-intent',
    STRIPE_CREATE_INTENT: '/billing/stripe/create-intent',
    CONFIRM_STRIPE_PAYMENT: '/billing/confirm-stripe-payment',
    STRIPE_VERIFY: '/billing/stripe/verify',
    ADMIN_OVERVIEW: '/billing/admin/overview',
    ADMIN_TRANSACTIONS: '/billing/admin/transactions',
    ADMIN_MANUAL_TRANSACTION: '/billing/admin/manual-transaction',
    ADMIN_EXPORT: '/billing/admin/export',
    ADMIN_TOPUP: (userId) => `/billing/admin/topup/${userId}`,
    INVOICE_DOWNLOAD: (transactionId) => `/billing/invoice/${transactionId}/download`,
  },
  ANALYTICS: {
    OVERVIEW: '/analytics/overview',
    TRENDS: '/analytics/trends',
    PLATFORMS: '/analytics/platform-breakdown',
    TOP_TEMPLATES: '/analytics/top-templates',
    DEMO_SEED: '/analytics/demo-seed',
  },
  AI: {
    GENERATE_CAPTION: '/ai/generate-caption',
  },
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id) => `/categories/${id}`,
  },
  TEMPLATE_CATEGORIES: {
    BASE: '/template-categories',
    BY_ID: (id) => `/template-categories/${id}`,
  },
  DESIGN_STYLES: {
    BASE: '/design-styles',
    BY_ID: (id) => `/design-styles/${id}`,
  },
  FESTIVALS: {
    BASE: '/festivals',
    BY_ID: (id) => `/festivals/${id}`,
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
    ROLE: (id) => `/users/${id}/role`,
    SUB_ADMINS: '/auth/subadmins',
  },
  AUDIT: {
    SUB_ADMINS: '/auth/subadmins/activity',
  },
  FRAMES: {
    BASE: '/frames',
    BY_ID: (id) => `/frames/${id}`,
  },
  POSTS: {
    BASE: '/posts',
    ALL: '/posts',
    SCHEDULED: '/posts/scheduled',
    PUBLISH_NOW: '/posts/publish-now',
    SCHEDULE: '/posts/schedule',
    ADMIN_ALL: '/posts/admin/all',
    ADMIN_ANALYTICS: '/posts/admin/analytics',
    BY_ID: (id) => `/posts/${id}`,
    UPDATE_GRAPHIC: (id) => `/posts/${id}/graphic`,
  },
  TEMPLATES: {
    BASE: '/templates',
    UPLOAD: '/templates/upload',
    BY_ID: (id) => `/templates/${id}`,
  },
  VAULT: {
    BASE: '/vault',
    BY_ID: (id) => `/vault/${id}`,
    BULK_DELETE: '/vault/bulk-delete',
  },
  SOCIAL: {
    ACCOUNTS: '/social/accounts',
    AUTH_URL_INSTAGRAM: '/social/auth-url/instagram',
    AUTH_URL_LINKEDIN: '/social/auth-url/linkedin',
    DISCONNECT: (platform) => `/social/accounts/${platform}`,
  },
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export default API_ENDPOINTS;
