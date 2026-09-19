import cron from 'node-cron';
import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import { scheduledPostQueue, POST_JOB_NAMES } from '../../queues/post.queue.js';
import { processPostJob } from '../workers/post.worker.js';

/**
 * ⏰ CRON DISPATCHER JOB (POST POLLING TICKER)
 * 
 * Real World Analogy: Alarm Clock Sweeper.
 * Runs every minute on the exact 00th second (* * * * *) to query PostgreSQL for scheduled posts whose 
 * scheduledAt time has arrived or passed (scheduledAt <= new Date()).
 * 
 * - In Redis Mode: Pushes jobs into BullMQ scheduledPostQueue for high-concurrency worker processing.
 * - In Direct Mode (Fallback): Directly triggers processPostJob for local dev or when Redis is offline.
 */
export const triggerScheduledPostsNow = async () => {
  logger.info("🔍 [CronDispatcher] Polling database for due scheduled posts...");

  try {
    // Query database for posts where status is PENDING & scheduledAt <= CURRENT TIME (lte = Less Than or Equal)
    const duePosts = await prisma.scheduledPost.findMany({
      where: {
        status: "PENDING",
        scheduledAt: {
          lte: new Date(), // Picks posts whose scheduled time has arrived or passed
        },
      },
      include: {
        post: true,
      },
      take: 1000, // Batch limit of 1,000 posts per cycle for memory safety
    });

    if (duePosts.length === 0) {
      logger.info("ℹ️ [CronDispatcher] No due scheduled posts found.");
      return { count: 0, processedPosts: [] };
    }

    logger.info(`⚡ [CronDispatcher] Found ${duePosts.length} due scheduled posts. Dispatching...`);

    const processedPosts = [];

    for (const item of duePosts) {
      try {
        // Mark as PROCESSING to prevent duplicate pickup by concurrent worker processes
        await prisma.scheduledPost.update({
          where: { id: item.id },
          data: { status: "PROCESSING" },
        });

        const jobPayload = {
          scheduledPostId: item.id,
          postId: item.postId,
          userId: item.post?.userId,
          targetPlatforms: item.targetPlatforms || ["INSTAGRAM", "FACEBOOK", "LINKEDIN"],
          postContent: item.post?.captions?.[0]?.captionText || item.post?.occasionName || item.post?.template?.title || 'Branded Social Post',
          graphicUrl: item.post?.finalGraphicUrl || item.post?.customImageUrl,
        };

        if (scheduledPostQueue) {
          try {
            await scheduledPostQueue.add(POST_JOB_NAMES.PUBLISH_SCHEDULED_POST, jobPayload);
          } catch (queueErr) {
            logger.warn(`ℹ️ [CronDispatcher] Redis Queue offline (${queueErr.message}). Executing direct DB publish fallback for post ${item.id}...`);
            await processPostJob(jobPayload);
          }
        } else {
          await processPostJob(jobPayload);
        }

        processedPosts.push(item.id);
      } catch (itemError) {
        logger.error(`💥 [CronDispatcher] Failed to dispatch due post #${item.id}:`, itemError.message);
        await prisma.scheduledPost.update({
          where: { id: item.id },
          data: {
            status: "FAILED",
            errorMessage: itemError.message || "Failed to dispatch post",
          },
        }).catch(() => {});
      }
    }

    logger.info(`🎉 [CronDispatcher] Successfully dispatched ${processedPosts.length} posts.`);
    return { count: processedPosts.length, processedPosts };
  } catch (error) {
    logger.error("💥 [CronDispatcher] Error during scheduled posts dispatch cycle:", error);
    throw error;
  }
};

let isDispatcherRunning = false;
let cronScheduledTask = null;

/**
 * Initialize 1-minute Cron Dispatcher using node-cron (* * * * *)
 * Features concurrency lock to prevent overlapping runs if database batches run long.
 */
export const initCronDispatcher = () => {
  logger.info("⏰ [CronDispatcher] Starting 1-minute node-cron schedule (* * * * *)...");

  if (cronScheduledTask) {
    logger.warn("⚠️ [CronDispatcher] Cron dispatcher task is already active.");
    return cronScheduledTask;
  }

  cronScheduledTask = cron.schedule("* * * * *", async () => {
    // Concurrency guard: Skip cycle if previous dispatch cycle is still busy
    if (isDispatcherRunning) {
      logger.warn("⚠️ [CronDispatcher] Previous dispatch cycle still running. Skipping this minute's trigger.");
      return;
    }

    isDispatcherRunning = true;
    try {
      await triggerScheduledPostsNow();
    } catch (err) {
      logger.error("💥 [CronDispatcher] Execution cycle error:", err.message);
    } finally {
      isDispatcherRunning = false;
    }
  });

  return cronScheduledTask;
};

/**
 * Gracefully stop the cron dispatcher
 */
export const stopCronDispatcher = () => {
  if (cronScheduledTask) {
    cronScheduledTask.stop();
    cronScheduledTask = null;
    logger.info("🛑 [CronDispatcher] Cron dispatcher task stopped successfully.");
  }
};
