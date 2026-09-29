import { Worker } from "bullmq";
import { redisConnectionOptions, isRedisConfigured, getRedisClient } from "../../config/redis.js";
import { SCHEDULED_POST_QUEUE_NAME } from "../../queues/post.queue.js";
import { liveSocialPublisherService } from "../../modules/social/services/liveSocialPublisher.service.js";
import { prisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";
import { sendPostPublishedEmail } from "../../common/services/email.service.js";

/**
 * 🛠️ BULLMQ SOCIAL POST WORKER (BACKGROUND PUBLISHING CONSUMER)
 * 
 * Real World Analogy: Automated Social Media Dispatch Team.
 * Consumes scheduled and instant social post jobs from the Redis Queue, executes Meta Graph & 
 * LinkedIn API calls, updates database statuses, and triggers email alerts.
 */
export const processPostJob = async (jobData) => {
  const { scheduledPostId, postId, userId, targetPlatforms, postContent, graphicUrl } = jobData;
  const targetId = scheduledPostId || postId;

  logger.info(`⚙️ [PostWorker] Processing publishing job for Target ID: ${targetId}`);

  // 1. Redis Distributed Lock to prevent concurrent duplicate execution (Mutex)
  const lockKey = `lock:publish:${targetId}`;
  let lockAcquired = false;
  const redis = isRedisConfigured ? getRedisClient() : null;

  if (redis) {
    try {
      // SET lockKey 'locked' NX (Not Exists) PX 180000 (3-minute auto-expiry)
      const lockRes = await redis.set(lockKey, 'locked', 'PX', 180000, 'NX');
      if (!lockRes) {
        logger.warn(`⚠️ [PostWorker] Job for ${targetId} is already being executed by another active worker. Skipping duplicate!`);
        return { duplicate: true, skipped: true };
      }
      lockAcquired = true;
    } catch (lockErr) {
      logger.debug(`[PostWorker] Redis lock check notice: ${lockErr.message}`);
    }
  }

  try {
    // 2. Database Idempotency Check: Prevent duplicate publishing if already SUCCESS / PUBLISHED
    if (scheduledPostId) {
      const existingSchedule = await prisma.scheduledPost.findUnique({
        where: { id: scheduledPostId },
        select: { status: true },
      });

      if (!existingSchedule) {
        logger.warn(`⚠️ [PostWorker] ScheduledPost ${scheduledPostId} not found in database. Skipping.`);
        return { duplicate: true, skipped: true };
      }

      if (existingSchedule.status === 'SUCCESS') {
        logger.warn(`⚠️ [PostWorker] ScheduledPost ${scheduledPostId} is ALREADY published (SUCCESS). Skipping duplicate execution!`);
        return { duplicate: true, skipped: true };
      }

      await prisma.scheduledPost.update({
        where: { id: scheduledPostId },
        data: { status: "PROCESSING" },
      }).catch(() => { });
    }

    if (postId) {
      const existingPost = await prisma.post.findUnique({
        where: { id: postId },
        select: { status: true },
      });

      if (existingPost && existingPost.status === 'PUBLISHED') {
        logger.warn(`⚠️ [PostWorker] Post ${postId} is ALREADY marked PUBLISHED. Skipping duplicate execution!`);
        return { duplicate: true, skipped: true };
      }

      await prisma.post.update({
        where: { id: postId },
        data: { status: "PUBLISHING" },
      }).catch(() => { });
    }
    // Check if user account has been deactivated by admin
    if (userId) {
      const userRecord = await prisma.user.findUnique({
        where: { id: userId },
        select: { isActive: true },
      });
      if (userRecord && userRecord.isActive === false) {
        logger.warn(`🚫 [PostWorker] Account ${userId} is deactivated. Blocking publishing execution.`);
        if (scheduledPostId) {
          await prisma.scheduledPost.update({
            where: { id: scheduledPostId },
            data: {
              status: "FAILED",
              errorMessage: "Account deactivated by admin due to policy violation",
            },
          }).catch(() => { });
        }
        if (postId) {
          await prisma.post.update({
            where: { id: postId },
            data: { status: "FAILED" },
          }).catch(() => { });
        }
        throw new Error("Account deactivated by admin due to policy violation.");
      }
    }

    // 2. Call Live Social Publisher Service (with Instagram Meta Graph API support)
    const publishResult = await liveSocialPublisherService.publishToPlatforms({
      postId: postId || scheduledPostId,
      userId,
      postContent,
      graphicUrl,
      targetPlatforms: targetPlatforms || ["INSTAGRAM", "FACEBOOK", "LINKEDIN"],
    });

    // 3. Mark as SUCCESS in Database
    const publishedAt = new Date();

    if (scheduledPostId) {
      try {
        await prisma.scheduledPost.update({
          where: { id: scheduledPostId },
          data: {
            status: "SUCCESS",
            publishedAt,
            platformResults: publishResult.platformResults,
          },
        });
      } catch (prismaClientErr) {
        await prisma.scheduledPost.update({
          where: { id: scheduledPostId },
          data: {
            status: "SUCCESS",
            publishedAt,
          },
        });
      }
    }

    if (postId) {
      await prisma.post.update({
        where: { id: postId },
        data: {
          status: "PUBLISHED",
          finalGraphicUrl: graphicUrl || undefined,
        },
      });
    }

    // 4. Send Email Alert
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, fullName: true },
      });

      if (user?.email) {
        sendPostPublishedEmail({
          email: user.email,
          fullName: user.fullName,
          postTitle: postContent || "Social Media Graphic",
          targetPlatforms: targetPlatforms || ["INSTAGRAM", "FACEBOOK", "LINKEDIN"],
          platformResults: publishResult.platformResults,
          publishedAt: publishedAt.toISOString(),
        }).catch((err) => {
          logger.error("Failed to send post published email notification", err);
        });
      }
    }

    logger.info(`✅ [PostWorker] Completed job & email alert for Post ID: ${postId || scheduledPostId}`);
    return publishResult;
  } catch (error) {
    logger.error(`💥 [PostWorker] Failed to publish Post ID: ${postId || scheduledPostId}`, error);

    if (scheduledPostId) {
      await prisma.scheduledPost.update({
        where: { id: scheduledPostId },
        data: {
          status: "FAILED",
          errorMessage: error.message || "Failed to publish social media post",
        },
      }).catch(() => { });
    }

    if (postId) {
      await prisma.post.update({
        where: { id: postId },
        data: { status: "FAILED" },
      }).catch(() => { });
    }

    throw error;
  } finally {
    if (lockAcquired && redis) {
      await redis.del(lockKey).catch(() => {});
    }
  }
};

let instantWorkerInstance = null;
let scheduledWorkerInstance = null;

if (isRedisConfigured) {
  try {
    const defaultWorkerConfig = {
      connection: redisConnectionOptions,
      concurrency: 5,
      limiter: {
        max: 100,
        duration: 60000,
      },
    };

    // 1. Instant Post Publishing Worker (Handles Live Immediate Publishing)
    const { INSTANT_POST_QUEUE_NAME } = await import("../../queues/post.queue.js");
    instantWorkerInstance = new Worker(
      INSTANT_POST_QUEUE_NAME,
      async (job) => {
        return await processPostJob(job.data);
      },
      defaultWorkerConfig
    );

    instantWorkerInstance.on("completed", (job) => {
      logger.info(`🏁 [InstantPostWorker] Job ${job.id} dispatched successfully.`);
    });

    instantWorkerInstance.on("failed", (job, err) => {
      logger.error(`❌ [InstantPostWorker] Job ${job?.id} failed:`, err.message || err);
    });

    // 2. Scheduled Post Publishing Worker (Handles Future Scheduled Publishing)
    scheduledWorkerInstance = new Worker(
      SCHEDULED_POST_QUEUE_NAME,
      async (job) => {
        return await processPostJob(job.data);
      },
      defaultWorkerConfig
    );

    scheduledWorkerInstance.on("completed", (job) => {
      logger.info(`🏁 [ScheduledPostWorker] Job ${job.id} completed successfully.`);
    });

    scheduledWorkerInstance.on("failed", (job, err) => {
      logger.error(`❌ [ScheduledPostWorker] Job ${job?.id} failed:`, err.message || err);
    });

    scheduledWorkerInstance.on("stalled", (jobId) => {
      logger.warn(`⚠️ [ScheduledPostWorker] Job #${jobId} stalled and will be re-processed.`);
    });

    let hasLoggedWorkerError = false;
    const quietErrorHandler = (err) => {
      if (!hasLoggedWorkerError) {
        logger.warn(`ℹ️ [PostWorker] Connection notice: ${err.message}. Direct execution fallback active.`);
        hasLoggedWorkerError = true;
      }
    };

    instantWorkerInstance.on("error", quietErrorHandler);
    scheduledWorkerInstance.on("error", quietErrorHandler);
  } catch (err) {
    logger.warn("⚠️ [PostWorker] BullMQ Worker initialization deferred:", err.message);
  }
}

// Backward compatibility alias for single worker import
const workerInstance = scheduledWorkerInstance;

export { workerInstance, instantWorkerInstance, scheduledWorkerInstance };
