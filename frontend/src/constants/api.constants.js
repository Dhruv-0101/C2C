/**
 * BrandFlow API Configuration Constants
 * Defines API Base URL resolution logic, structured route endpoints, and HTTP status codes.
 */

/**
 * Resolves the target API base URL dynamically based on environment configuration & browser hostname.
 * Priority Order:
 * 1. .env variable: VITE_API_BASE_URL (Primary explicit override)
 * 2. .env variable: VITE_API_BASE_URL_AWS, VITE_API_BASE_URL_PROD, VITE_API_BASE_URL_DEV
 * 3. Dynamic Browser Hostname Resolution (AWS EC2 vs Vercel/Render vs Localhost)
 *
 * @returns {string} Fully qualified API base URL
 */
const getApiBaseUrl = () => {
  // Helper validator for HTTP/HTTPS URLs
  const isValidUrl = (url) => {
    return (
      url &&
      typeof url === 'string' &&
      !url.includes('VITE_') &&
      (url.startsWith('http://') || url.startsWith('https://'))
    );
  };

  // 1. First Priority: Check main VITE_API_BASE_URL from .env
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (isValidUrl(envUrl)) {
    return envUrl.trim();
  }

  // Determine execution mode
  const isProduction = import.meta.env.PROD || import.meta.env.VITE_APP_ENV === 'production';

  // 2. Second Priority: Check environment-specific .env variables
  const envSpecificUrl = isProduction
    ? import.meta.env.VITE_API_BASE_URL_AWS || import.meta.env.VITE_API_BASE_URL_PROD
    : import.meta.env.VITE_API_BASE_URL_DEV;

  if (isValidUrl(envSpecificUrl)) {
    return envSpecificUrl.trim();
  }

  // 3. Third Priority: Dynamic Hostname Auto-Detection (AWS EC2 vs Vercel/Render vs Localhost)
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;

    // AWS EC2 Environment (sslip.io domain or Elastic IP)
    if (hostname.includes('sslip.io') || hostname === '52.87.37.2') {
      return 'https://52-87-37-2.sslip.io/api/v1';
    }

    // Vercel Production Environment -> Render Backend API
    if (hostname.includes('vercel.app')) {
      return 'https://c2c-negk.onrender.com/api/v1';
    }

    // Localhost Development / Docker Environment
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api/v1';
    }
  }

  // 4. Default Fallbacks
  if (isProduction) {
    return 'https://52-87-37-2.sslip.io/api/v1';
  }

  return 'http://localhost:5000/api/v1';
};

/**
 * Exported API Base URL singleton
 */
export const API_BASE_URL = getApiBaseUrl();

/**
 * Centralized API Route Endpoints mapping
 */
export const API_ENDPOINTS = {
  // Authentication & RBAC User Management Endpoints
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
    USERS: '/auth/users',
  },

  // AI BrandKit Domain Endpoints
  BRANDKIT: {
    BASE: '/brandkit',
  },

  // Business Category Endpoints
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id) => `/categories/${id}`,
  },

  // Design Style & Color Palette Endpoints
  DESIGN_STYLES: {
    BASE: '/design-styles',
    BY_ID: (id) => `/design-styles/${id}`,
  },

  // Event & Festival Calendar Endpoints
  FESTIVALS: {
    BASE: '/festivals',
    BY_ID: (id) => `/festivals/${id}`,
  },

  // Branded Vector Frames Endpoints
  FRAMES: {
    BASE: '/frames',
    BY_ID: (id) => `/frames/${id}`,
  },

  // Social Post Compositing & Scheduling Endpoints
  POSTS: {
    BASE: '/posts',
    SCHEDULED: '/posts/scheduled',
    PUBLISH_NOW: '/posts/publish-now',
    SCHEDULE: '/posts/schedule',
    TRIGGER_SCHEDULED: '/posts/trigger-scheduled-jobs',
    BY_ID: (id) => `/posts/${id}`,
  },

  // Base Master Templates Endpoints
  TEMPLATES: {
    BASE: '/templates',
    CATEGORIES: '/templates/categories',
    UPLOAD: '/templates/upload',
    BY_ID: (id) => `/templates/${id}`,
  },

  // User Vault Assets Directory Endpoints
  VAULT: {
    BASE: '/vault',
    BY_ID: (id) => `/vault/${id}`,
  },

  // Connected Social Accounts & OAuth Endpoints
  SOCIAL: {
    ACCOUNTS: '/social/accounts',
    AUTH_URL_INSTAGRAM: '/social/auth-url/instagram',
    AUTH_URL_LINKEDIN: '/social/auth-url/linkedin',
    CONNECT_MANUAL: '/social/connect-manual',
    DISCONNECT: (platform) => `/social/accounts/${platform}`,
  },
};

/**
 * Standard HTTP Status Codes enum for service level checks
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};
