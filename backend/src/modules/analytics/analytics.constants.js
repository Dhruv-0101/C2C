/**
 * 📊 Analytics Module Constants & Single Sources of Truth
 */

export const ANALYTICS_RANGES = Object.freeze({
  SEVEN_DAYS: '7d',
  THIRTY_DAYS: '30d',
  NINETY_DAYS: '90d',
});

export const ANALYTICS_RANGE_LIST = Object.freeze(Object.values(ANALYTICS_RANGES));

export const DEFAULT_ANALYTICS_RANGE = ANALYTICS_RANGES.THIRTY_DAYS;

export const ANALYTICS_PLATFORMS = Object.freeze({
  ALL: 'ALL',
  INSTAGRAM: 'INSTAGRAM',
  FACEBOOK: 'FACEBOOK',
  LINKEDIN: 'LINKEDIN',
});

export const ANALYTICS_PLATFORM_LIST = Object.freeze(Object.values(ANALYTICS_PLATFORMS));

export const DEFAULT_ANALYTICS_PLATFORM = ANALYTICS_PLATFORMS.ALL;

export const ANALYTICS_CACHE_TTL_SECONDS = 900; // 15 minutes TTL

export const ANALYTICS_TOP_TEMPLATES_LIMITS = Object.freeze({
  DEFAULT: 5,
  MIN: 1,
  MAX: 20,
});
