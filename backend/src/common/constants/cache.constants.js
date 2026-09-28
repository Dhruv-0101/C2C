/**
 * ⚡ REDIS CACHE CONSTANTS & TTL POLICIES
 * Centralized Single Source of Truth for cache keys, prefixes, and expiration policies.
 */

export const CACHE_TTL = Object.freeze({
  ONE_MINUTE: 60,
  FIVE_MINUTES: 300,
  FIFTEEN_MINUTES: 900,
  THIRTY_MINUTES: 1800,
  ONE_HOUR: 3600,
  ONE_DAY: 86400,
});

export const CACHE_KEYS = Object.freeze({
  // Categories
  CATEGORIES_ALL: 'cache:categories:all',
  CATEGORIES_LIST: (params = {}) => `cache:categories:list:${JSON.stringify(params)}`,
  CATEGORY_BY_ID: (id) => `cache:categories:detail:${id}`,
  CATEGORY_PATTERN: 'cache:categories:*',

  // Template Categories
  TEMPLATE_CATEGORIES_ALL: 'cache:template-categories:all',
  TEMPLATE_CATEGORIES_LIST: (params = {}) => `cache:template-categories:list:${JSON.stringify(params)}`,
  TEMPLATE_CATEGORY_BY_ID: (id) => `cache:template-categories:detail:${id}`,
  TEMPLATE_CATEGORY_PATTERN: 'cache:template-categories:*',

  // Festivals
  FESTIVALS_ALL: (year = 'all') => `cache:festivals:${year}`,
  FESTIVALS_ACTIVE: 'cache:festivals:active',
  FESTIVALS_LIST: (params = {}) => `cache:festivals:list:${JSON.stringify(params)}`,
  FESTIVAL_BY_ID: (id) => `cache:festivals:detail:${id}`,
  FESTIVAL_PATTERN: 'cache:festivals:*',

  // Frames
  FRAMES_ACTIVE: 'cache:frames:active',
  FRAMES_LIST: (params = {}) => `cache:frames:list:${JSON.stringify(params)}`,
  FRAME_BY_ID: (id) => `cache:frames:detail:${id}`,
  FRAME_PATTERN: 'cache:frames:*',

  // Master Templates
  TEMPLATES_ACTIVE: 'cache:templates:active',
  TEMPLATES_LIST: (params = {}) => `cache:templates:list:${JSON.stringify(params)}`,
  TEMPLATES_BY_FESTIVAL: (festivalId) => `cache:templates:festival:${festivalId}`,
  TEMPLATES_BY_CATEGORY: (categoryId) => `cache:templates:category:${categoryId}`,
  TEMPLATE_BY_ID: (id) => `cache:templates:detail:${id}`,
  TEMPLATE_PATTERN: 'cache:templates:*',

  // BrandKit
  BRANDKIT_BY_USER_ID: (userId) => `cache:brandkit:${userId}`,
  BRANDKIT_PATTERN: (userId) => `cache:brandkit:${userId}*`,

  // Billing & Subscriptions
  BILLING_SUB_BY_USER_ID: (userId) => `cache:billing:sub:${userId}`,
  BILLING_PATTERN: (userId) => `cache:billing:*:${userId}*`,

  // Connected Social Accounts
  SOCIAL_ACCOUNTS_LIST: (userId, params = {}) => `cache:social:list:${userId}:${JSON.stringify(params)}`,
  SOCIAL_PATTERN: (userId) => `cache:social:*:${userId}*`,
});


