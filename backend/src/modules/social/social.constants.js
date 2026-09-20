/**
 * 🌐 SOCIAL MODULE CONSTANTS
 * Central single source of truth for social platforms, limits, and sorting constraints.
 */

export const SOCIAL_PLATFORMS = Object.freeze({
  INSTAGRAM: 'INSTAGRAM',
  FACEBOOK: 'FACEBOOK',
  LINKEDIN: 'LINKEDIN',
});

export const SOCIAL_PLATFORM_LIST = Object.freeze(Object.values(SOCIAL_PLATFORMS));


export const SOCIAL_ALLOWED_SORT_FIELDS = Object.freeze(['createdAt', 'platform', 'accountName']);

export const DEFAULT_SOCIAL_SORT_BY = 'createdAt';

export const DEFAULT_SOCIAL_SORT_ORDER = 'desc';
