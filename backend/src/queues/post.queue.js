import { Queue } from "bullmq";
import { redisConnectionOptions, isRedisConfigured } from "../config/redis.js";
import { logger } from "../config/logger.js";

export const INSTANT_POST_QUEUE_NAME = "instant-post-queue";
export const SCHEDULED_POST_QUEUE_NAME = "scheduled-post-queue";

export const POST_JOB_NAMES = {
  PUBLISH_INSTANT_POST: "publish-instant-post",
  PUBLISH_SCHEDULED_POST: "publish-scheduled-post",
};

/**
 * BullMQ High-Scale Post Queues
 * - instantPostQueue: Immediate social publishing jobs
 * - scheduledPostQueue: Future scheduled social publishing jobs
 */
let instantPostQueue = null;
let scheduledPostQueue = null;

if (isRedisConfigured) {
  try {
    instantPostQueue = new Queue(INSTANT_POST_QUEUE_NAME, {
      connection: redisConnectionOptions,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    });

    scheduledPostQueue = new Queue(SCHEDULED_POST_QUEUE_NAME, {
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

/**
 * Producer: Add Instant Social Post Publishing Job to BullMQ Queue
 * @param {Object} jobData
 * @returns {Promise<{ isQueued: boolean, jobId?: string, result?: Object }>}
 */
export async function addInstantPostJob(jobData) {
  try {
    if (instantPostQueue) {
      const job = await instantPostQueue.add(POST_JOB_NAMES.PUBLISH_INSTANT_POST, jobData);
      logger.info(`🚀 [BullMQ Producer] Instant Post Publishing Job #${job.id} queued for Post ID: ${jobData.postId}`);
      return { isQueued: true, jobId: job.id };
    }
    throw new Error('Redis Post Queue is not initialized');
  } catch (error) {
    logger.warn(`⚠️ [BullMQ Fallback] Queue unavailable (${error.message}). Executing direct post publishing fallback...`);
    const { processPostJob } = await import('../jobs/workers/post.worker.js');
    const result = await processPostJob(jobData);
    return { isQueued: false, result };
  }
}

/**
 * Producer: Add Scheduled Social Post Publishing Job to BullMQ Queue
 * @param {Object} jobData
 * @param {Date|number} delayOrDate
 * @returns {Promise<{ isQueued: boolean, jobId?: string }>}
 */
export async function addScheduledPostJob(jobData, delayOrDate) {
  try {
    if (scheduledPostQueue) {
      const delay = typeof delayOrDate === 'number'
        ? Math.max(0, delayOrDate)
        : Math.max(0, new Date(delayOrDate).getTime() - Date.now());

      const job = await scheduledPostQueue.add(
        POST_JOB_NAMES.PUBLISH_SCHEDULED_POST,
        jobData,
        { delay }
      );
      logger.info(`⏰ [BullMQ Producer] Scheduled Post Job #${job.id} queued (delay: ${delay}ms) for Post ID: ${jobData.postId}`);
      return { isQueued: true, jobId: job.id };
    }
    throw new Error('Redis Scheduled Queue is not initialized');
  } catch (error) {
    logger.warn(`⚠️ [BullMQ Fallback] Scheduled Queue unavailable (${error.message}). Relying on DB Cron dispatcher.`);
    return { isQueued: false };
  }
}

export { instantPostQueue, scheduledPostQueue };
