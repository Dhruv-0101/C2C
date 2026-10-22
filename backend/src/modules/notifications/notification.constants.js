/**
 * 🔔 NOTIFICATION MODULE CONSTANTS
 * Single source of truth for push notifications, in-app alerts, batch sizes and device categories.
 */

export const NOTIFICATION_TYPES = Object.freeze({
  FESTIVAL_ALERT: 'FESTIVAL_ALERT',
  BILLING: 'BILLING',
  SYSTEM: 'SYSTEM',
  PROMOTION: 'PROMOTION',
  MAINTENANCE: 'MAINTENANCE',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  SOCIAL_PUBLISHED: 'SOCIAL_PUBLISHED',
});

export const NOTIFICATION_TYPE_LIST = Object.freeze(Object.values(NOTIFICATION_TYPES));

export const BROADCAST_AUDIENCES = Object.freeze({
  ALL: 'ALL',
  FREE_USERS: 'FREE_USERS',
  PRO_USERS: 'PRO_USERS',
});

export const BROADCAST_AUDIENCE_LIST = Object.freeze(Object.values(BROADCAST_AUDIENCES));

export const DEVICE_TYPES = Object.freeze({
  MOBILE: 'MOBILE',
  DESKTOP: 'DESKTOP',
  TABLET: 'TABLET',
  UNKNOWN: 'UNKNOWN',
});

export const PUSH_BATCH_CONFIG = Object.freeze({
  CHUNK_SIZE: 500, // 500 subscriptions per worker job for Redis RAM efficiency & FCM rate limits
  MAX_RETRIES: 3,
  BACKOFF_DELAY_MS: 3000,
  CONCURRENCY: 5, // 5 parallel BullMQ workers
});

export const NOTIFICATION_PAGINATION = Object.freeze({
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});
