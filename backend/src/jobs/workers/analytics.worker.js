import { Worker } from 'bullmq';
import axios from 'axios';
import { redisConnectionOptions, isRedisConfigured, getRedisClient } from '../../config/redis.js';
import { ANALYTICS_QUEUE_NAME } from '../../queues/analytics.queue.js';
import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import { decryptToken } from '../../common/helpers/encryption.helper.js';

const META_GRAPH_URL = 'https://graph.facebook.com/v19.0';
const LINKEDIN_API_URL = 'https://api.linkedin.com/v2';

/**
 * Fetch real engagement metrics from Meta Graph API or LinkedIn API
 */
export async function fetchLivePlatformMetrics({ platform, platformPostId, accessToken }) {
  if (!accessToken || !platformPostId || platformPostId.startsWith('synced_') || platformPostId.startsWith('mock_')) {
    return null;
  }

  try {
    if (platform === 'INSTAGRAM') {
      const mediaRes = await axios.get(`${META_GRAPH_URL}/${platformPostId}`, {
        params: {
          fields: 'like_count,comments_count,media_type,timestamp',
          access_token: accessToken,
        },
        timeout: 5000,
      });

      const likes = mediaRes.data?.like_count ?? 0;
      const comments = mediaRes.data?.comments_count ?? 0;
      let reach = likes;
      let impressions = likes + comments;
      let shares = 0;
      let hasInsights = false;

      // Official Meta Insights API (Requires instagram_manage_insights permission)
      try {
        const insightsRes = await axios.get(`${META_GRAPH_URL}/${platformPostId}/insights`, {
          params: {
            metric: 'impressions,reach,saved,shares',
            access_token: accessToken,
          },
          timeout: 4000,
        });

        const metricsData = insightsRes.data?.data || [];
        for (const item of metricsData) {
          if (item.name === 'reach' && item.values?.[0]?.value !== undefined) {
            reach = item.values[0].value;
            hasInsights = true;
          }
          if (item.name === 'impressions' && item.values?.[0]?.value !== undefined) {
            impressions = item.values[0].value;
            hasInsights = true;
          }
          if (item.name === 'shares' && item.values?.[0]?.value !== undefined) {
            shares = item.values[0].value;
            hasInsights = true;
          }
        }
      } catch (igErr) {
        logger.debug(`ℹ️ [AnalyticsWorker] Live Instagram insights notice for ${platformPostId}:`, igErr.response?.data?.error?.message || igErr.message);
      }

      const totalInteractions = likes + comments + shares;
      const engagementRate = reach > 0
        ? Number(((totalInteractions / reach) * 100).toFixed(2))
        : (totalInteractions > 0 ? 100 : 0);

      return { likes, comments, shares, reach, impressions, engagementRate };
    }

    if (platform === 'FACEBOOK') {
      let likes = 0;
      let comments = 0;
      let shares = 0;
      let reach = 0;
      let impressions = 0;
      let hasInsights = false;

      // 1. Fetch exact live reactions, comments, shares from Facebook Page Post
      try {
        const fbRes = await axios.get(`${META_GRAPH_URL}/${platformPostId}`, {
          params: {
            fields: 'likes.summary(true),comments.summary(true),shares',
            access_token: accessToken,
          },
          timeout: 5000,
        });
        likes = fbRes.data?.likes?.summary?.total_count ?? 0;
        comments = fbRes.data?.comments?.summary?.total_count ?? 0;
        shares = fbRes.data?.shares?.count ?? 0;
      } catch (fbErr) {
        logger.debug(`ℹ️ [AnalyticsWorker] Direct FB likes/comments lookup notice for ${platformPostId}:`, fbErr.response?.data?.error?.message || fbErr.message);
      }

      reach = likes;
      impressions = likes + comments;

      // 2. Fetch exact official post insights from Meta Graph API
      try {
        const insightsRes = await axios.get(`${META_GRAPH_URL}/${platformPostId}/insights`, {
          params: {
            metric: 'post_impressions_unique,post_impressions',
            access_token: accessToken,
          },
          timeout: 4000,
        });

        const metricsData = insightsRes.data?.data || [];
        for (const item of metricsData) {
          if (item.name === 'post_impressions_unique' && item.values?.[0]?.value !== undefined) {
            reach = item.values[0].value;
            hasInsights = true;
          }
          if (item.name === 'post_impressions' && item.values?.[0]?.value !== undefined) {
            impressions = item.values[0].value;
            hasInsights = true;
          }
        }
      } catch (fbInsightsErr) {
        logger.debug(`ℹ️ [AnalyticsWorker] FB post insights lookup notice for ${platformPostId}:`, fbInsightsErr.response?.data?.error?.message || fbInsightsErr.message);
      }

      const totalInteractions = likes + comments + shares;
      const engagementRate = reach > 0
        ? Number(((totalInteractions / reach) * 100).toFixed(2))
        : (totalInteractions > 0 ? 100 : 0);

      return { likes, comments, shares, reach, impressions, engagementRate };
    }

    if (platform === 'LINKEDIN') {
      const shareUrn = platformPostId.startsWith('urn:') ? platformPostId : `urn:li:share:${platformPostId}`;
      const liRes = await axios.get(`${LINKEDIN_API_URL}/socialActions/${encodeURIComponent(shareUrn)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
        timeout: 5000,
      });

      const likes = liRes.data?.likesSummary?.totalLikes ?? 0;
      const comments = liRes.data?.commentsSummary?.totalComments ?? 0;
      const shares = 0;
      const reach = likes;
      const impressions = likes + comments;
      const totalInteractions = likes + comments + shares;
      const engagementRate = reach > 0
        ? Number(((totalInteractions / reach) * 100).toFixed(2))
        : (totalInteractions > 0 ? 100 : 0);

      return { likes, comments, shares, reach, impressions, engagementRate };
    }
  } catch (error) {
    const statusCode = error.response?.status;
    // Handle Rate Limiting with BullMQ Retry Backoff
    if (statusCode === 429 || error.response?.data?.error?.code === 32) {
      logger.warn(`⏳ [AnalyticsWorker] Rate limit detected for ${platform}. Triggering worker exponential backoff...`);
      throw new Error(`RATE_LIMIT_${platform}`);
    }

    logger.warn(`ℹ️ [AnalyticsWorker] Live ${platform} fetch notice for ${platformPostId}:`, error.response?.data?.error?.message || error.message);
    return null;
  }

  return null;
}

/**
 * Invalidate Redis analytics cache for a user
 */
export async function invalidateUserAnalyticsCache(userId) {
  try {
    const redis = getRedisClient();
    if (!redis || !userId) return;

    // Pattern search for user's analytics cache keys
    const stream = redis.scanStream({
      match: `analytics:*:${userId}:*`,
      count: 50,
    });

    const keysToDelete = [];
    stream.on('data', (resultKeys) => {
      keysToDelete.push(...resultKeys);
    });

    stream.on('end', async () => {
      if (keysToDelete.length > 0) {
        await redis.del(...keysToDelete);
        logger.info(`🧹 [AnalyticsWorker] Invalidated ${keysToDelete.length} cached analytics keys for user ${userId}`);
      }
    });
  } catch (err) {
    logger.warn(`⚠️ [AnalyticsWorker] Redis cache invalidation error for user ${userId}:`, err.message);
  }
}

/**
 * Process a single Post Analytics synchronization job
 * @param {Object} jobData - { postId, userId, targetPlatforms, platformResults }
 */
export async function processAnalyticsJob(jobData) {
  const { postId, userId, targetPlatforms = [], platformResults = {} } = jobData;

  if (!postId || !userId) {
    logger.warn('⚠️ [AnalyticsWorker] Missing required postId or userId in job data.');
    return { success: false };
  }

  // 1. Fetch connected social accounts for this user
  const socialAccounts = await prisma.socialAccount.findMany({
    where: {
      userId,
      isConnected: true,
    },
  });

  const tokenMap = {};
  for (const sa of socialAccounts) {
    if (sa.accessToken) {
      tokenMap[sa.platform] = decryptToken(sa.accessToken);
    }
  }

  // Determine platforms to sync
  const platforms = targetPlatforms.length > 0
    ? targetPlatforms
    : Object.keys(platformResults).length > 0
    ? Object.keys(platformResults)
    : ['INSTAGRAM', 'FACEBOOK', 'LINKEDIN'];

  let syncedAny = false;

  for (const platform of platforms) {
    const liveMediaInfo = platformResults[platform] || {};
    const platformPostId = liveMediaInfo.mediaId || liveMediaInfo.postId || liveMediaInfo.id || null;
    const accessToken = tokenMap[platform];

    const metrics = await fetchLivePlatformMetrics({
      platform,
      platformPostId,
      accessToken,
    });

    if (metrics) {
      const targetPlatformPostId = platformPostId || `${platform.toLowerCase()}_${postId}`;

      await prisma.postAnalytics.upsert({
        where: {
          postId_platform: {
            postId,
            platform,
          },
        },
        create: {
          postId,
          userId,
          platform,
          platformPostId: targetPlatformPostId,
          reach: metrics.reach,
          impressions: metrics.impressions,
          likes: metrics.likes,
          comments: metrics.comments,
          shares: metrics.shares,
          engagementRate: metrics.engagementRate,
          lastSyncedAt: new Date(),
        },
        update: {
          platformPostId: targetPlatformPostId,
          reach: metrics.reach,
          impressions: metrics.impressions,
          likes: metrics.likes,
          comments: metrics.comments,
          shares: metrics.shares,
          engagementRate: metrics.engagementRate,
          lastSyncedAt: new Date(),
        },
      });

      syncedAny = true;
    }
  }

  if (syncedAny) {
    await invalidateUserAnalyticsCache(userId);
  }

  return { success: true, synced: syncedAny };
}

/**
 * 🛠️ BULLMQ ANALYTICS WORKER INSTANCE
 * High-concurrency background consumer (10 concurrent jobs)
 */
let analyticsWorkerInstance = null;

if (isRedisConfigured) {
  try {
    analyticsWorkerInstance = new Worker(
      ANALYTICS_QUEUE_NAME,
      async (job) => {
        return processAnalyticsJob(job.data);
      },
      {
        connection: redisConnectionOptions,
        concurrency: 10, // 10 parallel post metric sync jobs
      }
    );

    analyticsWorkerInstance.on('completed', (job) => {
      logger.info(`✅ [AnalyticsWorker] Finished sync job ${job.id} for Post #${job.data?.postId}`);
    });

    analyticsWorkerInstance.on('failed', (job, err) => {
      logger.warn(`⚠️ [AnalyticsWorker] Job ${job?.id} failed (attempt ${job?.attemptsMade}): ${err.message}`);
    });

    logger.info('⚙️ [BullMQ Engine] High-Concurrency Analytics Worker Initialized (Concurrency: 10).');
  } catch (err) {
    logger.warn('⚠️ [BullMQ] Failed to initialize Analytics Worker instance.');
  }
}

export { analyticsWorkerInstance };
