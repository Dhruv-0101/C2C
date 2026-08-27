import Redis from "ioredis";
import { logger } from "./logger.js";

/**
 * Enterprise Redis Connection Configuration
 * Connects to REDIS_URL or defaults to localhost:6379 with safe offline fallback mode for local development.
 */
const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = Number(process.env.REDIS_PORT) || 6379;
const redisPassword = process.env.REDIS_PASSWORD || undefined;

export const redisConnectionOptions = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL, maxRetriesPerRequest: null }
  : {
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false, // Prevent queuing in memory when Redis is disconnected
      retryStrategy: (times) => {
        // Stop retrying after 2 attempts when running locally without a Redis server
        if (times > 2) {
          return null; // Stops reconnect attempts cleanly
        }
        return 200;
      },
    };

// Alias export for backward compatibility
export const redisConnection = redisConnectionOptions;

let redisClient = null;

export const getRedisClient = () => {
  const isRedisConfigured = Boolean(process.env.REDIS_URL || process.env.REDIS_HOST);
  if (!isRedisConfigured) return null;

  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL || redisConnectionOptions);

    redisClient.on("connect", () => {
      logger.info("🟢 [Redis] Successfully connected to Redis Server.");
    });

    redisClient.on("error", () => {});
  }
  return redisClient;
};
