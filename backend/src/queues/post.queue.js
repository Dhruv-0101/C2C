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

try {
  instantPostQueue = new Queue("instant-post-queue", {
    connection: redisConnectionOptions,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: 100, // Keep last 100 completed jobs in memory
      removeOnFail: 500,     // Keep last 500 failed jobs for debugging
    },
  });

  scheduledPostQueue = new Queue("scheduled-post-queue", {
    connection: redisConnectionOptions,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  });

  let hasLoggedQueueWarning = false;
  const quietErrorHandler = () => {
    if (!hasLoggedQueueWarning) {
      logger.info("ℹ️ [BullMQ Engine] Redis server offline locally. Platform operating seamlessly in direct DB scheduler fallback mode.");
      hasLoggedQueueWarning = true;
    }
  };

  instantPostQueue.on("error", quietErrorHandler);
  scheduledPostQueue.on("error", quietErrorHandler);

  logger.info("📦 [BullMQ] Instant & Scheduled Post Queues Initialized.");
} catch (err) {
  logger.warn("⚠️ [BullMQ] Failed to initialize BullMQ Redis queues. Direct DB execution fallback active.");
}

export { instantPostQueue, scheduledPostQueue };
