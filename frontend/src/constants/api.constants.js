/**
 * Dynamic API Base URL resolver based on Vite environment mode (Development vs Production)
 */
const getApiBaseUrl = () => {
  // 1. Explicit override in .env
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 2. Production mode build selection
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL_PROD || 'https://brandflow-backend.onrender.com/api/v1';
  }

  // 3. Development mode fallback
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
