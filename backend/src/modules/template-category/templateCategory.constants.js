import { ADMIN_TABS } from '../auth/auth.constants.js';

/**
 * 🎨 TEMPLATE CATEGORY CONSTANTS:
 * Central single source of truth for master template category validation, sorting, and RBAC permissions.
 */

export const TEMPLATE_CATEGORY_TAB_PERMISSION = ADMIN_TABS.TEMPLATE_CATEGORIES;

export const TEMPLATE_CATEGORY_NAME_MIN_LENGTH = 2;
export const TEMPLATE_CATEGORY_NAME_MAX_LENGTH = 50;
export const TEMPLATE_CATEGORY_DESCRIPTION_MAX_LENGTH = 500;

export const TEMPLATE_CATEGORY_ALLOWED_SORT_FIELDS = Object.freeze(['name', 'createdAt', 'updatedAt']);
export const DEFAULT_TEMPLATE_CATEGORY_SORT_BY = 'createdAt';
export const DEFAULT_TEMPLATE_CATEGORY_SORT_ORDER = 'desc';
