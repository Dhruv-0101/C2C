import { prisma } from "../config/database.js";
import { logger } from "../config/logger.js";
import { scheduledPostQueue } from "../queues/post.queue.js";
import { processPostJob } from "./postWorker.js";

/**
 * High-Scale Cron Dispatcher Engine
 * Polls PostgreSQL every 60 seconds for due scheduled posts in batches of 1,000.
 * Pushes jobs into BullMQ or triggers immediate direct processing fallback.
 */
export const triggerScheduledPostsNow = async () => {
  logger.info("🔍 [CronDispatcher] Polling database for due scheduled posts...");

  try {
    const duePosts = await prisma.scheduledPost.findMany({
      where: {
        status: "PENDING",
        scheduledAt: {
          lte: new Date(),
        },
      },
      include: {
        post: true,
      },
      take: 1000, // Batch limit per cycle for memory safety
    });

    if (duePosts.length === 0) {
      logger.info("ℹ️ [CronDispatcher] No due scheduled posts found.");
      return { count: 0, processedPosts: [] };
    }

    logger.info(`⚡ [CronDispatcher] Found ${duePosts.length} due scheduled posts. Dispatching...`);

    const processedPosts = [];

    for (const item of duePosts) {
      // Mark as PROCESSING to prevent duplicate pickup
      await prisma.scheduledPost.update({
        where: { id: item.id },
        data: { status: "PROCESSING" },
      });

      const jobPayload = {
        scheduledPostId: item.id,
        postId: item.postId,
        userId: item.post?.userId,
        targetPlatforms: item.targetPlatforms || ["INSTAGRAM", "FACEBOOK", "LINKEDIN", "TWITTER"],
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
