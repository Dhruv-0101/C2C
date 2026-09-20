import { ADMIN_TABS } from '../auth/auth.constants.js';

/**
 * 🏬 BUSINESS CATEGORY CONSTANTS:
 * Central single source of truth for business category validation, sorting, and permissions.
 */

export const CATEGORY_TAB_PERMISSION = ADMIN_TABS.CATEGORIES;

export const CATEGORY_NAME_MIN_LENGTH = 2;
export const CATEGORY_NAME_MAX_LENGTH = 50;
export const CATEGORY_DESCRIPTION_MAX_LENGTH = 500;

export const CATEGORY_ALLOWED_SORT_FIELDS = Object.freeze(['name', 'createdAt', 'updatedAt']);
export const DEFAULT_CATEGORY_SORT_BY = 'name';
export const DEFAULT_CATEGORY_SORT_ORDER = 'asc';
