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
 * Permitted tabs that SuperAdmin can grant to SubAdmin accounts and admin console routing.
 */
export const ADMIN_TABS = Object.freeze({
  DASHBOARD: 'dashboard',
  TEMPLATES: 'templates',
  FESTIVALS: 'festivals',
  FRAMES: 'frames',
  CATEGORIES: 'categories',
  USERS: 'users',
  SUB_ADMINS: 'subadmins',
  SUB_ADMIN_ACTIVITY: 'subadmin-activity',
  FINANCE: 'finance',
  POSTS: 'posts',
});

export const ADMIN_TAB_LIST = Object.freeze(Object.values(ADMIN_TABS));

export const SUBADMIN_PERMITTED_TABS = Object.freeze([
  ADMIN_TABS.FESTIVALS,
  ADMIN_TABS.CATEGORIES,
  ADMIN_TABS.FRAMES,
  ADMIN_TABS.TEMPLATES,
  ADMIN_TABS.POSTS,
]);

