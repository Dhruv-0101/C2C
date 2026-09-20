import { env } from '../../config/env.js';

export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

export const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days default
export const REMEMBER_ME_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;   // 30 days for remember me

export const COOKIE_OPTIONS = Object.freeze({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: REFRESH_TOKEN_EXPIRY_MS,
});

export function getCookieOptions(rememberMe = false) {
  return {
    ...COOKIE_OPTIONS,
    maxAge: rememberMe ? REMEMBER_ME_EXPIRY_MS : REFRESH_TOKEN_EXPIRY_MS,
  };
}

export function getRefreshTokenExpiryDate(rememberMe = false) {
  return new Date(Date.now() + (rememberMe ? REMEMBER_ME_EXPIRY_MS : REFRESH_TOKEN_EXPIRY_MS));
}

/**
 * Permitted tabs that SuperAdmin can grant to SubAdmin accounts.
 * Restricted strictly to: Festival Calendar, Business Categories, Brand Frame Studio, Graphic Templates.
 */
export const ADMIN_TABS = Object.freeze({
  FESTIVALS: 'festivals',
  CATEGORIES: 'categories',
  FRAMES: 'frames',
  TEMPLATES: 'templates',
});

export const SUBADMIN_PERMITTED_TABS = Object.freeze(Object.values(ADMIN_TABS));

