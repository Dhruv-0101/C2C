/**
 * Centralized Query Keys Factory for TanStack Query
 * Standardizes cache keys and cache invalidation across the frontend application.
 */
export const QUERY_KEYS = {
  POSTS: {
    ALL: ['posts'],
    LIST: (params = {}) => ['posts', 'list', params],
    BY_ID: (id) => ['posts', id],
    SCHEDULED: ['scheduledPosts'],
  },
  FRAMES: {
    ALL: ['frames'],
    LIST: (params = {}) => ['frames', 'list', params],
    BY_ID: (id) => ['frames', id],
  },
  TEMPLATES: {
    ALL: ['templates'],
    LIST: (params = {}) => ['templates', 'list', params],
    BY_ID: (id) => ['templates', id],
    CATEGORIES: ['templateCategories'],
  },
  FESTIVALS: {
    ALL: ['festivals'],
    BY_YEAR: (year) => ['festivals', { year }],
  },
  CATEGORIES: {
    ALL: ['categories'],
    LIST: (params = {}) => ['categories', 'list', params],
  },
  DESIGN_STYLES: {
    ALL: ['designStyles'],
    LIST: (params = {}) => ['designStyles', 'list', params],
  },
  SUB_ADMINS: {
    ALL: ['subadmins'],
    LIST: (params = {}) => ['subadmins', 'list', params],
  },
  USERS: {
    ALL: ['users'],
    LIST: (params = {}) => ['users', 'list', params],
  },
  BRANDKIT: {
    MINE: ['brandKit'],
  },
  VAULT: {
    ALL: ['vault'],
    LIST: (params = {}) => ['vault', 'list', params],
    BY_ID: (id) => ['vault', id],
  },
  SOCIAL: {
    ALL: ['socialAccounts'],
    LIST: (params = {}) => ['socialAccounts', 'list', params],
    AUTH_URL: ['instagramAuthUrl'],
    LINKEDIN_AUTH_URL: ['linkedinAuthUrl'],
  },
};
