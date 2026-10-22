import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { logger } from '../config/logger.js';
import { PUSH_BATCH_CONFIG } from '../modules/notifications/notification.constants.js';

export const NOTIFICATION_QUEUE_NAME = 'notification-queue';

export const NOTIFICATION_JOB_NAMES = {
  BATCH_PUSH: 'DISPATCH_BATCH_PUSH',
  DIRECT_PUSH: 'DISPATCH_DIRECT_PUSH',
};

// Initialize Notification BullMQ Queue only if Redis is configured
const isRedisConfigured = Boolean(process.env.REDIS_URL || process.env.REDIS_HOST);

export const notificationQueue = isRedisConfigured
  ? new Queue(NOTIFICATION_QUEUE_NAME, {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: PUSH_BATCH_CONFIG.MAX_RETRIES,
        backoff: { type: 'exponential', delay: PUSH_BATCH_CONFIG.BACKOFF_DELAY_MS },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 200 },
      },
    })
  : null;

if (notificationQueue) {
  let hasLoggedWarning = false;
  notificationQueue.on('error', (err) => {
    if (!hasLoggedWarning) {
      logger.warn(`ℹ️ [BullMQ Notification Queue Info] Redis: ${err.message}. Fallback mode active.`);
      hasLoggedWarning = true;
    }
  });
}

/**
 * Producer: Dispatch a chunk of push subscriptions (up to 500) into Redis queue
 * Supports both object signature ({ subscriptions, payloadStr, ... }) and positional args
 */
export async function addPushBatchJob(arg1, arg2) {
  if (!notificationQueue) {
    logger.warn('⚠️ [BullMQ Notification] Redis queue not configured. Skipping push batch.');
    return null;
  }

  let subscriptions = [];
  let payloadStr = '';
  let batchIndex = 1;
  let festivalName = '';

  if (Array.isArray(arg1)) {
    subscriptions = arg1;
    payloadStr = typeof arg2 === 'string' ? arg2 : JSON.stringify(arg2 || {});
  } else if (arg1 && typeof arg1 === 'object') {
    subscriptions = Array.isArray(arg1.subscriptions) ? arg1.subscriptions : [];
    payloadStr = typeof arg1.payloadStr === 'string' ? arg1.payloadStr : JSON.stringify(arg1.payloadStr || {});
    batchIndex = arg1.batchIndex || 1;
    festivalName = arg1.festivalName || '';
  }

  if (subscriptions.length === 0) {
    return null;
  }

  try {
    const job = await notificationQueue.add(
      NOTIFICATION_JOB_NAMES.BATCH_PUSH,
      {
        subscriptions,
        payloadStr,
        batchIndex,
        festivalName,
        timestamp: Date.now(),
      },
      {
        priority: 2,
      }
    );

    logger.info(
      `🚀 [BullMQ Producer] Dispatched Push Batch #${batchIndex} with ${subscriptions.length} devices for ${festivalName || 'General Alert'}`
    );
    return job;
  } catch (err) {
    logger.error(`❌ [BullMQ Producer] Failed to enqueue push batch #${batchIndex}: ${err.message}`);
    return null;
  }
}

/**
 * Producer: Dispatch a single direct push notification (e.g. Test push or immediate alert)
 *
 * @param {Object} data
 * @param {Object} data.subscription - Single subscription record
 * @param {string} data.payloadStr - Push payload string
 */
export async function addDirectPushJob({ subscription, payloadStr }) {
  if (!notificationQueue) {
    logger.warn('⚠️ [BullMQ Notification] Redis queue not configured.');
    return null;
  }

  try {
    const job = await notificationQueue.add(
      NOTIFICATION_JOB_NAMES.DIRECT_PUSH,
      {
        subscription,
        payloadStr,
        timestamp: Date.now(),
      },
      {
        priority: 1, // High priority for instant delivery
      }
    );

    return job;
  } catch (err) {
    logger.error(`❌ [BullMQ Producer] Failed to enqueue direct push: ${err.message}`);
    return null;
  }
}
