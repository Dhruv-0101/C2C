import Redis from "ioredis";
import { logger } from "./logger.js";

/**
 * Enterprise Redis Connection Configuration
 * Connects to REDIS_URL or defaults to localhost:6379 with safe offline fallback mode for local development.
 */
const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = Number(process.env.REDIS_PORT) || 6379;
const redisPassword = process.env.REDIS_PASSWORD || undefined;

const safeRetryStrategy = (times) => {
  if (times > 3) {
    return null; // Stop retrying after 3 attempts to prevent memory leaks
  }
  return 1000;
};

export const redisConnectionOptions = process.env.REDIS_URL
  ? {
      url: process.env.REDIS_URL,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      retryStrategy: safeRetryStrategy,
    }
  : {
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      retryStrategy: safeRetryStrategy,
    };

// Alias export for backward compatibility
export const redisConnection = redisConnectionOptions;

let redisClient = null;

export const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL || redisConnectionOptions);

    redisClient.on("connect", () => {
      logger.info("🟢 [Redis] Successfully connected to Redis Server.");
    });

    redisClient.on("error", () => {
      // Quiet warning for local dev when Redis server is offline
    });
  }
  return redisClient;
};
