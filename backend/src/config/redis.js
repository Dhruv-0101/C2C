import Redis from "ioredis";
import { env } from "./env.js";
import { logger } from "./logger.js";

/**
 * ⚡ ENTERPRISE REDIS CONFIGURATION & CONNECTION POOL
 * 
 * Centralized Redis connection manager for:
 * 1. BullMQ Queues & Workers (requires dedicated connections with maxRetriesPerRequest: null)
 * 2. Standalone Application Caching, Rate Limiting & Health Checks (via getRedisClient)
 */

const isProd = env.NODE_ENV === "production";
const redisHost = env.REDIS_HOST || "127.0.0.1";
const redisPort = Number(env.REDIS_PORT) || 6379;
const redisUrl = env.REDIS_URL || undefined;

// Detect local/container Redis instance
const isLocalRedis = ["localhost", "127.0.0.1", "brandflow-redis"].includes(redisHost);

// Safe password resolution: Local container defaults to no password unless explicitly set
const redisPassword = isLocalRedis
  ? (process.env.REDIS_PASSWORD || undefined)
  : (env.REDIS_PASSWORD || undefined);

// TLS resolution: Enable for rediss:// URL or when REDIS_TLS=true for remote cloud hosts
const isTlsEnabled = Boolean(
  (redisUrl && redisUrl.startsWith("rediss://")) ||
  (!isLocalRedis && env.REDIS_TLS === "true")
);

/**
 * 🛡️ Resilient Retry Strategy:
 * - Local Dev (offline): Stops after 2 retries (400ms) so terminal is not spammed when Redis is not running locally.
 * - Production: Uses exponential backoff capped at 5s so cloud failovers (AWS ElastiCache/Render)
 *   automatically self-heal without permanently killing BullMQ workers or queues.
 */
const retryStrategy = (times) => {
  if (!isProd && times > 2) {
    return null; // Stops reconnect attempts cleanly during local offline development
  }
  // Production: Exponential backoff (200ms, 400ms, 600ms... capped at 5000ms)
  return Math.min(times * 200, 5000);
};

/**
 * Base connection options applied to both host/port and URL configurations
 */
const baseConnectionOptions = {
  maxRetriesPerRequest: null, // Mandatory for BullMQ queues and workers
  enableOfflineQueue: false,  // Fail-fast to prevent Node.js Out-Of-Memory (OOM) leaks when Redis drops offline
  connectTimeout: 10000,      // 10s initial connection timeout
  keepAlive: 10000,           // 10s TCP keep-alive to prevent cloud NAT/firewall idle socket drops
  retryStrategy,
  ...(isTlsEnabled ? { tls: { rejectUnauthorized: false } } : {}),
};

/**
 * BullMQ & ioredis Connection Configuration Object
 */
export const redisConnectionOptions = redisUrl
  ? { url: redisUrl, ...baseConnectionOptions }
  : {
      host: redisHost,
      port: redisPort,
      ...(redisPassword ? { password: redisPassword } : {}),
      ...baseConnectionOptions,
    };

// Backward-compatibility alias export for BullMQ workers & queues
export const redisConnection = redisConnectionOptions;

/**
 * Boolean flag indicating whether Redis is configured in the environment
 */
export const isRedisConfigured = Boolean(redisUrl || env.REDIS_HOST);

/**
 * Standalone Singleton Redis Client (For App Caching, Session Storage & Health Pings)
 */
let redisClient = null;

export const getRedisClient = () => {
  if (!isRedisConfigured) return null;

  if (!redisClient) {
    redisClient = redisUrl
      ? new Redis(redisUrl, baseConnectionOptions)
      : new Redis(redisConnectionOptions);

    redisClient.on("connect", () => {
      logger.info("🟢 [Redis] Successfully connected to Redis Server.");
    });

    redisClient.on("error", (err) => {
      if (isProd) {
        logger.error(`❌ [Redis Error] Connection failure: ${err.message}`);
      }
    });
  }
  return redisClient;
};

/**
 * 🔌 Redis Pre-flight / Health Check Utility
 * Pings Redis server and measures round-trip latency (ms)
 * @returns {Promise<{ status: 'UP' | 'DOWN', latencyMs?: number, error?: string }>}
 */
export const checkRedisHealth = async () => {
  if (!isRedisConfigured) {
    return { status: "DOWN", error: "Redis is not configured in environment" };
  }
  try {
    const client = getRedisClient();
    if (!client) return { status: "DOWN", error: "Redis client initialization failed" };

    if (client.status !== "ready") {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Redis connection timeout")), 3000);
        if (client.status === "ready") {
          clearTimeout(timer);
          return resolve();
        }
        client.once("ready", () => {
          clearTimeout(timer);
          resolve();
        });
        client.once("error", (err) => {
          clearTimeout(timer);
          reject(err);
        });
      });
    }

    const start = Date.now();
    await client.ping();
    return { status: "UP", latencyMs: Date.now() - start };
  } catch (error) {
    return { status: "DOWN", error: error.message };
  }
};

/**
 * 🔒 Graceful Disconnect Handler (Invoked during SIGINT / SIGTERM server shutdown)
 */
export const disconnectRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info("🔒 [Redis] Standalone Redis client disconnected cleanly.");
    } catch {
      redisClient.disconnect();
    } finally {
      redisClient = null;
    }
  }
};

