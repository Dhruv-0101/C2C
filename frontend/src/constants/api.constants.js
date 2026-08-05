/**
 * Dynamic API Base URL resolver based on Vite environment mode (Development vs Production)
 */
const getApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_BASE_URL;

  // Sanitize: If VITE_API_BASE_URL is not a valid HTTP URL, discard invalid env string
  if (url && (url.includes('VITE_') || (!url.startsWith('http://') && !url.startsWith('https://')))) {
    url = null;
  }

  if (url) {
    return url;
  }

  // Resolve environment mode (from VITE_APP_ENV or Vite PROD build mode)
  const appEnv = import.meta.env.VITE_APP_ENV || (import.meta.env.PROD ? 'production' : 'development');

  if (appEnv === 'production') {
    let prodUrl = import.meta.env.VITE_API_BASE_URL_PROD;
    if (!prodUrl || (!prodUrl.startsWith('http://') && !prodUrl.startsWith('https://'))) {
      prodUrl = 'https://c2c-negk.onrender.com/api/v1';
    }
    return prodUrl;
  }

  return import.meta.env.VITE_API_BASE_URL_DEV || 'http://localhost:5000/api/v1';
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
    USERS: '/auth/users',
  },
  BRANDKIT: {
    BASE: '/brandkit',
  },
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id) => `/categories/${id}`,
  },
  DESIGN_STYLES: {
    BASE: '/design-styles',
    BY_ID: (id) => `/design-styles/${id}`,
  },
  FESTIVALS: {
    BASE: '/festivals',
    BY_ID: (id) => `/festivals/${id}`,
  },
  FRAMES: {
    BASE: '/frames',
    BY_ID: (id) => `/frames/${id}`,
  },
  POSTS: {
    BASE: '/posts',
    BY_ID: (id) => `/posts/${id}`,
  },
  TEMPLATES: {
    BASE: '/templates',
    UPLOAD: '/templates/upload',
    COMPOSITE_POST: '/templates/composite-post',
    BY_ID: (id) => `/templates/${id}`,
  },
  VAULT: {
    BASE: '/vault',
    BY_ID: (id) => `/vault/${id}`,
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
