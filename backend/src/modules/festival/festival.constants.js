import { ADMIN_TABS } from '../auth/auth.constants.js';

/**
 * 🎆 FESTIVAL & EVENT CALENDAR CONSTANTS:
 * Central single source of truth for festival validation, sorting, and permissions.
 */

export const FESTIVAL_TAB_PERMISSION = ADMIN_TABS.FESTIVALS;

export const FESTIVAL_NAME_MIN_LENGTH = 2;
export const FESTIVAL_NAME_MAX_LENGTH = 100;
export const FESTIVAL_DESCRIPTION_MAX_LENGTH = 1000;
export const FESTIVAL_TARGET_REGION_MAX_LENGTH = 100;

export const DEFAULT_TARGET_REGION = 'India';

export const FESTIVAL_ALLOWED_SORT_FIELDS = Object.freeze(['date', 'name', 'createdAt', 'updatedAt']);
export const DEFAULT_FESTIVAL_SORT_BY = 'date';
export const DEFAULT_FESTIVAL_SORT_ORDER = 'asc';
