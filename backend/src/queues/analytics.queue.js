import { Queue } from "bullmq";
import { redisConnectionOptions, isRedisConfigured } from "../config/redis.js";
import { logger } from "../config/logger.js";

export const ANALYTICS_QUEUE_NAME = "analytics-queue";

export const ANALYTICS_JOB_NAMES = {
  SYNC_POST_ANALYTICS: "sync-post-analytics",
};

/**
 * 📊 BullMQ High-Scale Analytics Queue
 * Distributes social media metrics synchronization across parallel worker processes.
 */
let analyticsQueue = null;

if (isRedisConfigured) {
  try {
    analyticsQueue = new Queue(ANALYTICS_QUEUE_NAME, {
      connection: redisConnectionOptions,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });

    let hasLoggedQueueWarning = false;
    analyticsQueue.on("error", () => {
      if (!hasLoggedQueueWarning) {
        logger.info("ℹ️ [BullMQ Analytics] Redis server offline. Operating in direct DB fallback mode.");
        hasLoggedQueueWarning = true;
      }
    });

    logger.info("📦 [BullMQ] Analytics Synchronization Queue Initialized.");
  } catch (err) {
    logger.warn("⚠️ [BullMQ] Failed to initialize BullMQ Analytics queue. Direct execution fallback active.");
  }
}

/**
 * Enqueue a post analytics synchronization job
 * @param {Object} jobData - { postId, userId, targetPlatforms, platformResults }
 */
export const addAnalyticsSyncJob = async (jobData) => {
  if (analyticsQueue) {
    return analyticsQueue.add(
      ANALYTICS_JOB_NAMES.SYNC_POST_ANALYTICS,
      jobData,
      {
        jobId: `analytics_${jobData.postId}_${Date.now()}`,
      }
    );
  }
  return null;
};

export { analyticsQueue };
