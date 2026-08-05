/**
 * Centralized Query Keys Factory for TanStack Query
 * Prevents string typos and standardizes cache invalidation across the frontend application.
 */
export const QUERY_KEYS = {
  POSTS: {
    ALL: ['posts'],
    LIST: (params = {}) => ['posts', 'list', params],
    BY_ID: (id) => ['posts', id],
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
};
