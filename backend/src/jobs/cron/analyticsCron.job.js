import cron from 'node-cron';
import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import { addAnalyticsSyncJob } from '../../queues/analytics.queue.js';
import { processAnalyticsJob } from '../workers/analytics.worker.js';

/**
 * ⏰ HIGH-SCALE ANALYTICS CRON DISPATCHER (DECAY LIFECYCLE MODEL)
 * 
 * Instead of running slow synchronous HTTP loops in a single thread,
 * this dispatcher selects posts that are due for metric refresh according
 * to an engagement decay schedule and pushes lightweight jobs into the BullMQ
 * Analytics Queue for parallel worker processing.
 * 
 * 📊 Decay Schedule:
 * - Tier 1: Fresh Posts (0 - 48 hrs)   -> Sync if lastSyncedAt older than 2 hours
 * - Tier 2: Active Posts (3 - 7 days)   -> Sync if lastSyncedAt older than 12 hours
 * - Tier 3: Mature Posts (8 - 30 days)  -> Sync if lastSyncedAt older than 24 hours
 * - Tier 4: Archived Posts (30+ days)   -> Auto-sync stopped (On-demand UI refresh only)
 */
export const syncAnalyticsMetrics = async () => {
  try {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Fetch eligible posts matching the Engagement Decay Lifecycle
    const eligiblePosts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        createdAt: { gte: thirtyDaysAgo },
        OR: [
          // Never synced before
          { postAnalytics: { none: {} } },
          // Tier 1: Fresh (0 - 48 hours old)
          {
            createdAt: { gte: twoDaysAgo },
            postAnalytics: { some: { lastSyncedAt: { lte: twoHoursAgo } } },
          },
          // Tier 2: Active (3 - 7 days old)
          {
            createdAt: { gte: sevenDaysAgo, lt: twoDaysAgo },
            postAnalytics: { some: { lastSyncedAt: { lte: twelveHoursAgo } } },
          },
          // Tier 3: Mature (8 - 30 days old)
          {
            createdAt: { gte: thirtyDaysAgo, lt: sevenDaysAgo },
            postAnalytics: { some: { lastSyncedAt: { lte: twentyFourHoursAgo } } },
          },
        ],
      },
      include: {
        scheduledPost: true,
      },
      take: 100, // Batch limit per 15-minute cycle
    });

    if (eligiblePosts.length === 0) {
      return { count: 0, message: 'All post analytics are up to date.' };
    }

    let enqueuedCount = 0;

    // 2. Dispatch jobs to BullMQ Analytics Queue (or fallback direct execution)
    for (const post of eligiblePosts) {
      const latestSchedule = post.scheduledPost;
      const platformResults = latestSchedule?.platformResults || {};
      const targetPlatforms = latestSchedule?.targetPlatforms?.length > 0
        ? latestSchedule.targetPlatforms
        : Object.keys(platformResults).length > 0
        ? Object.keys(platformResults)
        : ['INSTAGRAM', 'FACEBOOK', 'LINKEDIN'];

      const jobPayload = {
        postId: post.id,
        userId: post.userId,
        targetPlatforms,
        platformResults,
      };

      // Try BullMQ queue first, fallback to async background worker execution if Redis is offline
      const queuedJob = await addAnalyticsSyncJob(jobPayload);
      if (!queuedJob) {
        // Direct async fallback (unawaited to prevent blocking dispatcher)
        processAnalyticsJob(jobPayload).catch((err) => {
          logger.warn(`⚠️ [AnalyticsCron] Direct fallback sync error for Post #${post.id}:`, err.message);
        });
      }
      enqueuedCount++;
    }

    logger.info(`⚡ [AnalyticsCron] Dispatched ${enqueuedCount} post analytics sync jobs to BullMQ Queue.`);
    return { count: enqueuedCount };
  } catch (error) {
    logger.error('💥 [AnalyticsCron] Error during analytics dispatch cycle:', error.message);
    return { count: 0, error: error.message };
  }
};

let isAnalyticsRunning = false;
let analyticsCronTask = null;

/**
 * Initialize 15-minute Analytics Cron Dispatcher using node-cron (default: *\/15 * * * *)
 */
export const initAnalyticsCron = (cronExpression = '*/15 * * * *') => {
  logger.info(`⏰ [AnalyticsCron] Starting periodic social analytics sync dispatcher (${cronExpression})...`);

  if (analyticsCronTask) {
    logger.warn('⚠️ [AnalyticsCron] Analytics cron task is already active.');
    return analyticsCronTask;
  }

  analyticsCronTask = cron.schedule(cronExpression, async () => {
    if (isAnalyticsRunning) {
      logger.warn('⚠️ [AnalyticsCron] Previous analytics dispatch cycle still running. Skipping.');
      return;
    }

    isAnalyticsRunning = true;
    try {
      await syncAnalyticsMetrics();
    } catch (err) {
      logger.error('💥 [AnalyticsCron] Analytics dispatch cycle error:', err.message);
    } finally {
      isAnalyticsRunning = false;
    }
  });

  return analyticsCronTask;
};

/**
 * Gracefully stop the analytics cron dispatcher
 */
export const stopAnalyticsCron = () => {
  if (analyticsCronTask) {
    analyticsCronTask.stop();
    analyticsCronTask = null;
    logger.info('🛑 [AnalyticsCron] Analytics cron task stopped successfully.');
  }
};
