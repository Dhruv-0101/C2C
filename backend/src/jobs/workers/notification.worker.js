import https from 'https';
import { Worker } from 'bullmq';
import webpush from 'web-push';
import { redisConnection } from '../../config/redis.js';
import { logger } from '../../config/logger.js';
import {
  NOTIFICATION_QUEUE_NAME,
  NOTIFICATION_JOB_NAMES,
} from '../../queues/notification.queue.js';
import { PUSH_BATCH_CONFIG } from '../../modules/notifications/notification.constants.js';
import { removePushSubscription } from '../../modules/notifications/notification.repository.js';
import { initVapid } from '../../modules/notifications/notification.helper.js';

initVapid();

const isRedisConfigured = Boolean(process.env.REDIS_URL || process.env.REDIS_HOST);

// Resilient HTTPS agent to handle local dev proxies, Docker bridge SSL inspection, and self-signed cert chains
const pushHttpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: process.env.NODE_ENV === 'production' && process.env.STRICT_SSL === 'true',
});

/**
 * Send Web Push to a single subscription
 *
 * @param {Object} subscription - { endpoint, p256dh, auth }
 * @param {string} payloadStr - Serialized JSON push payload
 * @returns {Promise<{ success: boolean, pruned: boolean, error?: string }>}
 */
async function deliverPush(subscription, payloadStr) {
  try {
    const pushSubscriptionObj = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    await webpush.sendNotification(pushSubscriptionObj, payloadStr, {
      TTL: 86400, // 24 hours retention on push servers if device is offline
      urgency: 'high',
      agent: pushHttpsAgent,
    });

    return { success: true, pruned: false };
  } catch (err) {
    const statusCode = err.statusCode;

    // HTTP 410 (Gone) or 404 (Not Found): Browser has unregistered or user revoked permission
    if (statusCode === 410 || statusCode === 404) {
      logger.info(`🧹 [WebPush Pruner] Device endpoint expired (HTTP ${statusCode}). Removing: ${subscription.endpoint.substring(0, 45)}...`);
      await removePushSubscription(subscription.endpoint);
      return { success: false, pruned: true, error: 'Expired endpoint pruned' };
    }

    logger.warn(`⚠️ [WebPush Delivery] Failed to send push: ${err.message}`);
    return { success: false, pruned: false, error: err.message };
  }
}

/**
 * BullMQ Notification Worker for parallel asynchronous push dispatching
 */
export const notificationWorker = isRedisConfigured
  ? new Worker(
      NOTIFICATION_QUEUE_NAME,
      async (job) => {
        const { name, data } = job;

        if (name === NOTIFICATION_JOB_NAMES.BATCH_PUSH) {
          const { subscriptions = [], payloadStr, batchIndex, festivalName } = data;
          logger.info(`⚙️ [NotificationWorker] Processing Push Batch #${batchIndex} (${subscriptions.length} devices) for ${festivalName || 'Festival'}...`);

          let successCount = 0;
          let prunedCount = 0;
          let failCount = 0;

          // Dispatch parallel deliveries with concurrency throttling
          const results = await Promise.allSettled(
            subscriptions.map((sub) => deliverPush(sub, payloadStr))
          );

          results.forEach((res) => {
            if (res.status === 'fulfilled') {
              if (res.value.success) successCount++;
              else if (res.value.pruned) prunedCount++;
              else failCount++;
            } else {
              failCount++;
            }
          });

          logger.info(
            `✅ [NotificationWorker] Push Batch #${batchIndex} finished: ${successCount} delivered, ${failCount} failed, ${prunedCount} expired tokens pruned.`
          );

          return { successCount, failCount, prunedCount };
        }

        if (name === NOTIFICATION_JOB_NAMES.DIRECT_PUSH) {
          const { subscription, payloadStr } = data;
          const result = await deliverPush(subscription, payloadStr);
          return result;
        }
      },
      {
        connection: redisConnection,
        concurrency: PUSH_BATCH_CONFIG.CONCURRENCY,
      }
    )
  : null;

if (notificationWorker) {
  notificationWorker.on('failed', (job, err) => {
    logger.error(`❌ [NotificationWorker] Job #${job?.id} failed permanently: ${err.message}`);
  });
}
