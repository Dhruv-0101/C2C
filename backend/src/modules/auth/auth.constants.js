import { env } from '../../config/env.js';

export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

export const COOKIE_OPTIONS = Object.freeze({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days default in milliseconds
});

export function getCookieOptions(rememberMe = false) {
  return {
    ...COOKIE_OPTIONS,
    maxAge: rememberMe
      ? 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
      : 7 * 24 * 60 * 60 * 1000, // 7 days default in milliseconds
  };
}

/**
 * Permitted tabs that SuperAdmin can grant to SubAdmin accounts.
 * Restricted strictly to: Festival Calendar, Business Categories, Brand Frame Studio, Graphic Templates.
 */
export const SUBADMIN_PERMITTED_TABS = Object.freeze([
  'festivals',
  'categories',
  'frames',
  'templates',
]);

