import { ADMIN_TABS } from '../auth/auth.constants.js';

/**
 * 🎨 MASTER GRAPHIC TEMPLATES CONSTANTS:
 * Central single source of truth for template validation, sorting, limits, and RBAC permissions.
 * Dynamically linked to central ADMIN_TABS to prevent drift.
 */

// RBAC permission dynamically linked to central admin tabs
export const TEMPLATE_TAB_PERMISSION = ADMIN_TABS.TEMPLATES;

// Field Length & Content Validation Limits
export const TEMPLATE_LIMITS = Object.freeze({
  TITLE_MIN_LENGTH: 2,
  TITLE_MAX_LENGTH: 120,
  DESCRIPTION_MAX_LENGTH: 500,
  CATEGORY_NAME_MIN_LENGTH: 2,
  CATEGORY_NAME_MAX_LENGTH: 50,
  CATEGORY_DESCRIPTION_MAX_LENGTH: 300,
});

// Template Sorting Constraints
export const TEMPLATE_ALLOWED_SORT_FIELDS = Object.freeze(['createdAt', 'title', 'updatedAt']);
export const DEFAULT_TEMPLATE_SORT_BY = 'createdAt';
export const DEFAULT_TEMPLATE_SORT_ORDER = 'desc';

// Fallback category name when none provided
export const DEFAULT_TEMPLATE_CATEGORY_NAME = 'General Business';
