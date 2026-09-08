import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import { scheduledPostQueue } from '../../queues/post.queue.js';
import { processPostJob } from '../workers/post.worker.js';

/**
 * ⏰ CRON DISPATCHER JOB (POST POLLING TICKER)
 * 
 * Real World Analogy: Alarm Clock Sweeper.
 * Runs every 60 seconds to query PostgreSQL for scheduled posts whose 
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
        postContent: item.post?.customText || item.post?.occasionName,
        graphicUrl: item.post?.finalGraphicUrl || item.post?.customImageUrl,
      };

      try {
        if (scheduledPostQueue) {
          await scheduledPostQueue.add("publish-scheduled-post", jobPayload);
        } else {
          await processPostJob(jobPayload);
        }
      } catch (queueErr) {
        logger.warn(`ℹ️ [CronDispatcher] Redis Queue offline (${queueErr.message}). Executing direct DB publish fallback for post ${item.id}...`);
        await processPostJob(jobPayload);
      }

      processedPosts.push(item.id);
    }

    logger.info(`🎉 [CronDispatcher] Successfully dispatched ${processedPosts.length} posts.`);
    return { count: processedPosts.length, processedPosts };
  } catch (error) {
    logger.error("💥 [CronDispatcher] Error during scheduled posts dispatch cycle:", error);
    throw error;
  }
};

/**
 * Initialize 60-second Interval Cron Timer
 */
export const initCronDispatcher = () => {
  logger.info("⏰ [CronDispatcher] Starting 1-minute cron dispatcher timer...");
  setInterval(async () => {
    try {
      await triggerScheduledPostsNow();
    } catch (err) {
      // Silently catch error to maintain main loop stability
    }
  }, 60 * 1000);
};
