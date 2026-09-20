import { ADMIN_TABS } from '../auth/auth.constants.js';

/**
 * 🖼️ FRAME MODULE CONSTANTS
 * Central single source of truth for Canvas Vector Frames, permissions, validation limits, and sorting.
 */

// Dynamically linked to central ADMIN_TABS to prevent permission drift
export const FRAME_TAB_PERMISSION = ADMIN_TABS.FRAMES;

export const FRAME_TITLE_MIN_LENGTH = 2;
export const FRAME_TITLE_MAX_LENGTH = 100;
export const FRAME_DESCRIPTION_MAX_LENGTH = 500;

export const FRAME_ALLOWED_SORT_FIELDS = Object.freeze(['createdAt', 'title', 'updatedAt']);
export const DEFAULT_FRAME_SORT_BY = 'createdAt';
export const DEFAULT_FRAME_SORT_ORDER = 'desc';

