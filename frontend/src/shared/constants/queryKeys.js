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
    ADMIN_ALL: (params = {}) => ['posts', 'admin', params],
    ANALYTICS: ['posts', 'admin', 'analytics'],
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
  TEMPLATE_CATEGORIES: {
    ALL: ['templateCategories'],
    LIST: (params = {}) => ['templateCategories', 'list', params],
    BY_ID: (id) => ['templateCategories', id],
  },
  DESIGN_STYLES: {
    ALL: ['designStyles'],
    LIST: (params = {}) => ['designStyles', 'list', params],
  },
  SUB_ADMINS: {
    ALL: ['subadmins'],
    LIST: (params = {}) => ['subadmins', 'list', params],
    ACTIVITY: (params = {}) => ['subadmins', 'activity', params],
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
  SUBSCRIPTION: {
    ALL: ['subscription'],
    STATUS: ['subscription', 'status'],
  },
  BILLING: {
    ALL: ['billing'],
    HISTORY: (params = {}) => ['billing', 'history', params],
  },
  FINANCE: {
    ALL: ['admin', 'finance'],
    OVERVIEW: ['admin', 'finance', 'overview'],
    TRANSACTIONS: (params = {}) => ['admin', 'finance', 'transactions', params],
  },
  ANALYTICS: {
    ALL: ['analytics'],
    OVERVIEW: (range, platform) => ['analytics', 'overview', range, platform],
    TRENDS: (range, platform) => ['analytics', 'trends', range, platform],
    PLATFORMS: (range, platform) => ['analytics', 'platforms', range, platform],
    TOP_TEMPLATES: ['analytics', 'topTemplates'],
  },
};

export default QUERY_KEYS;
