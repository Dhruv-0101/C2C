/**
 * 📝 POST MODULE CONSTANTS
 * Central single source of truth for Post status lifecycles, target platforms, and sorting options.
 */

// Post Asset Lifecycle Statuses (Prisma PostStatus Enum)
export const POST_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'PUBLISHED',
  PUBLISHING: 'PUBLISHING',
  ARCHIVED: 'ARCHIVED',
});
export const POST_STATUSES = Object.freeze(Object.values(POST_STATUS));

// Scheduled Publishing Queue Statuses (Prisma PublishStatus Enum)
export const SCHEDULED_POST_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PUBLISHED: 'PUBLISHED',
  FAILED: 'FAILED',
});
export const SCHEDULED_POST_STATUSES = Object.freeze(Object.values(SCHEDULED_POST_STATUS));

// Supported Social Media Target Platforms (Prisma SocialPlatform Enum)
export const POST_TARGET_PLATFORMS = Object.freeze(['INSTAGRAM', 'FACEBOOK', 'LINKEDIN']);

// Sorting & Pagination Constraints
export const POST_ALLOWED_SORT_FIELDS = Object.freeze([
  'createdAt',
  'updatedAt',
  'status',
  'occasionName',
]);
export const DEFAULT_POST_SORT_BY = 'createdAt';
export const DEFAULT_POST_SORT_ORDER = 'desc';
