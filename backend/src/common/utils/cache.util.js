import { getRedisClient } from '../../config/redis.js';
import { logger } from '../../config/logger.js';
import { CACHE_TTL } from '../constants/cache.constants.js';

/**
 * ⚡ REDIS CACHING UTILITY HELPER
 * Production-ready, non-blocking, fail-safe caching utilities with graceful degradation.
 * If Redis is offline or disconnected, all functions fail silently and fall back to direct execution.
 */

/**
 * Retrieve cached JSON data by key
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Parsed JSON object or null if cache miss / Redis offline
 */
export async function getCache(key) {
  try {
    const client = getRedisClient();
    if (!client || client.status !== 'ready') return null;

    const data = await client.get(key);
    if (!data) return null;

    return JSON.parse(data);
  } catch (error) {
    logger.warn(`⚠️ [Redis Cache Get Warning] Failed to read key "${key}": ${error.message}`);
    return null;
  }
}

/**
 * Set data in Redis cache with expiration
 * @param {string} key - Cache key
 * @param {any} value - Value to cache (will be JSON-serialized)
 * @param {number} [ttlSeconds=CACHE_TTL.ONE_HOUR] - Time-to-live in seconds
 * @returns {Promise<boolean>}
 */
export async function setCache(key, value, ttlSeconds = CACHE_TTL.ONE_HOUR) {
  try {
    const client = getRedisClient();
    if (!client || client.status !== 'ready' || value === undefined) return false;

    const serialized = JSON.stringify(value);
    await client.set(key, serialized, 'EX', ttlSeconds);
    return true;
  } catch (error) {
    logger.warn(`⚠️ [Redis Cache Set Warning] Failed to set key "${key}": ${error.message}`);
    return false;
  }
}

/**
 * Delete a specific key from Redis cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>}
 */
export async function deleteCache(key) {
  try {
    const client = getRedisClient();
    if (!client || client.status !== 'ready') return false;

    await client.del(key);
    return true;
  } catch (error) {
    logger.warn(`⚠️ [Redis Cache Delete Warning] Failed to delete key "${key}": ${error.message}`);
    return false;
  }
}

/**
 * Non-blocking pattern deletion using Redis SCAN (Zero Event Loop Blocking)
 * Never uses dangerous 'KEYS *' in production.
 *
 * @param {string} pattern - Key match pattern e.g. "cache:categories:*"
 * @returns {Promise<number>} Number of deleted keys
 */
export async function deleteCachePattern(pattern) {
  try {
    const client = getRedisClient();
    if (!client || client.status !== 'ready') return 0;

    let cursor = '0';
    let totalDeleted = 0;

    do {
      // Scan 100 keys per iteration without blocking Redis single thread
      const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;

      if (keys.length > 0) {
        await client.del(...keys);
        totalDeleted += keys.length;
      }
    } while (cursor !== '0');

    if (totalDeleted > 0) {
      logger.info(`🧹 [Redis Cache Invalidation] Purged ${totalDeleted} key(s) matching "${pattern}"`);
    }

    return totalDeleted;
  } catch (error) {
    logger.warn(`⚠️ [Redis Pattern Invalidation Warning] Pattern "${pattern}" scan failed: ${error.message}`);
    return 0;
  }
}

/**
 * Higher-order Cache Wrapper: Checks cache first; on miss, executes fetcher and populates cache.
 *
 * @template T
 * @param {string} key - Cache key
 * @param {() => Promise<T>} fetcherFn - Database query or business logic function
 * @param {number} [ttlSeconds=CACHE_TTL.ONE_HOUR] - TTL in seconds
 * @returns {Promise<T>}
 */
export async function getOrSetCache(key, fetcherFn, ttlSeconds = CACHE_TTL.ONE_HOUR) {
  const cached = await getCache(key);
  if (cached !== null) {
    return cached;
  }

  const freshData = await fetcherFn();
  if (freshData !== null && freshData !== undefined) {
    await setCache(key, freshData, ttlSeconds);
  }

  return freshData;
}
