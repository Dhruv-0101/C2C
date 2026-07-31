/**
 * Dynamic API Base URL resolver based on Vite environment mode (Development vs Production)
 */
const getApiBaseUrl = () => {
  // 1. Explicit override if set
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 2. Resolve environment mode (from VITE_APP_ENV or Vite PROD build mode)
  const appEnv = import.meta.env.VITE_APP_ENV || (import.meta.env.PROD ? 'production' : 'development');

  if (appEnv === 'production') {
    return import.meta.env.VITE_API_BASE_URL_PROD || 'https://c2c-negk.onrender.com/api/v1';
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
