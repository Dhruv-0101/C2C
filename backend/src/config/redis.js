import { env } from './env.js';

/**
 * Enterprise Redis Connection Options for BullMQ Queues and Workers
 * Supports standard local Redis, Upstash Redis URL (rediss://), and TLS security
 */
export const redisConnection = env.REDIS_URL
  ? {
      url: env.REDIS_URL,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
    }
  : {
      host: env.REDIS_HOST,
      port: Number(env.REDIS_PORT),
      password: env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: env.REDIS_TLS === 'true' ? {} : undefined,
      retryStrategy(times) {
        return Math.min(times * 2000, 30000);
      },
    };
