import { Queue } from "bullmq";
import { redisConnectionOptions } from "../config/redis.js";
import { logger } from "../config/logger.js";

/**
 * BullMQ High-Scale Post Queues
 * - instantPostQueue: Immediate social publishing jobs
 * - scheduledPostQueue: Future scheduled social publishing jobs
 */
let instantPostQueue = null;
let scheduledPostQueue = null;

const isRedisConfigured = Boolean(process.env.REDIS_URL || process.env.REDIS_HOST);

if (isRedisConfigured) {
  try {
    instantPostQueue = new Queue("instant-post-queue", {
      connection: redisConnectionOptions,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    });

    scheduledPostQueue = new Queue("scheduled-post-queue", {
      connection: redisConnectionOptions,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    });

    let hasLoggedQueueWarning = false;
    const quietErrorHandler = () => {
      if (!hasLoggedQueueWarning) {
        logger.info("ℹ️ [BullMQ Engine] Redis server offline. Operating in direct DB fallback mode.");
        hasLoggedQueueWarning = true;
      }
    };

    instantPostQueue.on("error", quietErrorHandler);
    scheduledPostQueue.on("error", quietErrorHandler);

    logger.info("📦 [BullMQ] Instant & Scheduled Post Queues Initialized.");
  } catch (err) {
    logger.warn("⚠️ [BullMQ] Failed to initialize BullMQ Redis queues. Direct DB execution active.");
  }
}

export { instantPostQueue, scheduledPostQueue };
