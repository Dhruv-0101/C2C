import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { BadRequestError, NotFoundError } from '../../common/errors/custom-errors.js';
import {
  upsertPushSubscription,
  removePushSubscription,
  findActiveSubscriptionsByUserId,
  findBatchedSubscriptions,
  findBatchedSubscriptionsByUserIds,
  findUpcomingFestivalsBetween,
  findTargetUserIdsByAudience,
  countAudienceStats,
  createInAppNotification,
  createBulkInAppNotifications,
  createNotificationBroadcast,
  findNotificationBroadcasts,
  countNotificationBroadcasts,
  findUserNotifications,
  countUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from './notification.repository.js';
import {
  buildPushPayload,
  detectDeviceType,
  sanitizeNotification,
} from './notification.helper.js';
import {
  NOTIFICATION_TYPES,
  PUSH_BATCH_CONFIG,
  NOTIFICATION_PAGINATION,
} from './notification.constants.js';
import { addPushBatchJob, addDirectPushJob } from '../../queues/notification.queue.js';

/**
 * Get server VAPID Public Key for client browser registration
 *
 * @returns {string} Base64 VAPID Public Key
 */
export const getVapidPublicKey = () => {
  if (!env.VAPID_PUBLIC_KEY) {
    throw new BadRequestError('VAPID public key is not configured on server.');
  }
  return env.VAPID_PUBLIC_KEY;
};

/**
 * Register or update browser push subscription for a user
 *
 * @param {string} userId
 * @param {Object} subscriptionPayload - { endpoint, keys: { p256dh, auth } }
 * @param {string} [userAgent='']
 * @returns {Promise<Object>}
 */
export const subscribeUser = async (userId, subscriptionPayload, userAgent = '') => {
  const { endpoint, keys, deviceType } = subscriptionPayload;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    throw new BadRequestError('Invalid push subscription format. Endpoint and keys are required.');
  }

  const detectedDevice = deviceType || detectDeviceType(userAgent);

  const sub = await upsertPushSubscription({
    userId,
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
    userAgent,
    deviceType: detectedDevice,
  });

  logger.info(`📱 [NotificationLogic] User ${userId} registered push device (${detectedDevice}).`);

  return {
    message: 'Mobile web push notifications enabled successfully!',
    subscriptionId: sub.id,
    deviceType: sub.deviceType,
  };
};

/**
 * Unsubscribe a device endpoint
 *
 * @param {string} endpoint
 * @returns {Promise<Object>}
 */
export const unsubscribeUser = async (endpoint) => {
  if (!endpoint) {
    throw new BadRequestError('Subscription endpoint is required to unsubscribe.');
  }

  await removePushSubscription(endpoint);
  return { message: 'Push notifications disabled for this device.' };
};

/**
 * Send test push notification to user's registered devices
 *
 * @param {string} userId
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export const sendTestPush = async (userId, { title, body, linkUrl, imageUrl }) => {
  const activeSubs = await findActiveSubscriptionsByUserId(userId);

  if (!activeSubs || activeSubs.length === 0) {
    throw new BadRequestError(
      'No active push subscription found for your account. Please enable notifications in your browser first.'
    );
  }

  const payloadStr = buildPushPayload({
    title: title || 'BrandFlow Mobile Alert 🔔',
    body: body || 'Your mobile push notifications are configured and active!',
    linkUrl: linkUrl || '/studio',
    imageUrl,
    tag: `test-push-${Date.now()}`,
  });

  // Dispatch direct jobs for all active devices of this user
  await Promise.all(
    activeSubs.map((sub) =>
      addDirectPushJob({
        subscription: sub,
        payloadStr,
      })
    )
  );

  // Also create in-app notification record
  await createInAppNotification({
    userId,
    title: title || 'BrandFlow Mobile Alert 🔔',
    message: body || 'Your mobile push notifications are configured and active!',
    type: NOTIFICATION_TYPES.SYSTEM,
    linkUrl: linkUrl || '/studio',
  }).catch(() => {});

  return {
    message: `Test notification dispatched to ${activeSubs.length} registered device(s)!`,
    deviceCount: activeSubs.length,
  };
};

/**
 * High-Scale Daily Festival Dispatcher Engine
 * Automatically called 1 day before any festival to alert all subscribed businesses.
 * Uses cursor streaming in 500-subscription batches to handle 100,000+ users safely.
 *
 * @returns {Promise<Object>} Summary of dispatched batches
 */
export const dispatchTomorrowFestivalAlerts = async () => {
  // 1. Calculate Tomorrow's exact date window (00:00:00 to 23:59:59)
  const tomorrowStart = new Date();
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  // 2. Query festivals occurring tomorrow
  const festivals = await findUpcomingFestivalsBetween(tomorrowStart, tomorrowEnd);

  if (!festivals || festivals.length === 0) {
    logger.info('ℹ️ [FestivalNotifier] No festivals scheduled for tomorrow.');
    return { dispatched: false, reason: 'No festivals scheduled for tomorrow.' };
  }

  const results = [];

  for (const festival of festivals) {
    logger.info(`🎆 [FestivalNotifier] Preparing 1-day advance push notifications for: ${festival.name}`);

    const title = `🎆 Tomorrow is ${festival.name}!`;
    const body = `Your branded ${festival.name} festival posters are ready. Tap to customize & post in 1 click!`;
    const linkUrl = `/studio?festivalId=${festival.id}`;

    const payloadStr = buildPushPayload({
      title,
      body,
      linkUrl,
      imageUrl: festival.bannerUrl,
      tag: `festive-${festival.id}`,
    });

    // 3. Cursor-based streaming pagination through all active subscriptions
    let cursor = null;
    let batchIndex = 1;
    let totalDevicesQueued = 0;

    while (true) {
      const subs = await findBatchedSubscriptions({
        cursor,
        take: PUSH_BATCH_CONFIG.CHUNK_SIZE,
      });

      if (!subs || subs.length === 0) break;

      // Dispatch 500-subscription chunk into Redis BullMQ
      await addPushBatchJob({
        subscriptions: subs,
        payloadStr,
        batchIndex,
        festivalName: festival.name,
      });

      // Deduplicate userIds to avoid redundant in-app notifications
      const uniqueUserIds = [...new Set(subs.map((s) => s.userId))];
      const inAppRecords = uniqueUserIds.map((uId) => ({
        userId: uId,
        title,
        message: body,
        type: NOTIFICATION_TYPES.FESTIVAL_ALERT,
        linkUrl,
        metadata: { festivalId: festival.id, festivalName: festival.name },
      }));

      await createBulkInAppNotifications(inAppRecords).catch((e) => {
        logger.warn(`Failed to bulk create in-app records for batch #${batchIndex}: ${e.message}`);
      });

      totalDevicesQueued += subs.length;
      cursor = subs[subs.length - 1].id;
      batchIndex++;
    }

    results.push({
      festival: festival.name,
      totalBatches: batchIndex - 1,
      totalDevicesQueued,
    });
  }

  return {
    dispatched: true,
    festivalsCount: festivals.length,
    results,
  };
};

/**
 * Get paginated in-app notifications for bell menu
 *
 * @param {string} userId
 * @param {Object} query
 * @returns {Promise<Object>}
 */
export const getUserNotificationFeed = async (userId, query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(
    NOTIFICATION_PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || NOTIFICATION_PAGINATION.DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;
  const unreadOnly = query.unreadOnly === 'true' || query.unreadOnly === true;

  const [notifications, unreadCount] = await Promise.all([
    findUserNotifications(userId, { skip, take: limit, unreadOnly }),
    countUnreadNotifications(userId),
  ]);

  return {
    notifications: notifications.map(sanitizeNotification),
    unreadCount,
    page,
    limit,
  };
};

/**
 * Mark a single in-app notification as read
 *
 * @param {string} notificationId
 * @param {string} userId
 */
export const markNotificationRead = async (notificationId, userId) => {
  await markNotificationAsRead(notificationId, userId);
  const unreadCount = await countUnreadNotifications(userId);
  return { success: true, unreadCount };
};

/**
 * Mark all user notifications as read
 *
 * @param {string} userId
 */
export const markAllNotificationsRead = async (userId) => {
  await markAllNotificationsAsRead(userId);
  return { success: true, unreadCount: 0 };
};

/**
 * Broadcast manual announcement or promotional campaign to user audience segment
 *
 * @param {string} adminId
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export const broadcastToAudience = async (
  adminId,
  { title, message, type = 'PROMOTION', targetAudience = 'ALL', linkUrl = '/plan', imageUrl = null }
) => {
  // 1. Fetch audience user IDs
  const targetUserIds = await findTargetUserIdsByAudience(targetAudience);

  if (!targetUserIds || targetUserIds.length === 0) {
    return {
      recipientCount: 0,
      deliveredCount: 0,
      message: 'No active users found matching the selected audience segment.',
    };
  }

  // 2. Bulk insert in-app notifications in chunks of 1000
  const inAppRecords = targetUserIds.map((userId) => ({
    userId,
    title,
    message,
    type,
    linkUrl: linkUrl || '/plan',
    metadata: { broadcast: true, imageUrl: imageUrl || null },
    isRead: false,
  }));

  for (let i = 0; i < inAppRecords.length; i += 1000) {
    await createBulkInAppNotifications(inAppRecords.slice(i, i + 1000));
  }

  // 3. Stream push subscriptions in chunks of 500 into BullMQ
  let cursor = null;
  let totalQueuedDevices = 0;
  const pushPayload = buildPushPayload({
    title,
    body: message,
    url: linkUrl || '/plan',
    image: imageUrl || null,
    tag: `broadcast-${Date.now()}`,
  });

  while (true) {
    const batch = await findBatchedSubscriptionsByUserIds({
      userIds: targetUserIds,
      cursor,
      take: PUSH_BATCH_CONFIG.CHUNK_SIZE,
    });

    if (!batch || batch.length === 0) break;

    await addPushBatchJob({
      subscriptions: batch,
      payloadStr: pushPayload,
      festivalName: title,
    });
    totalQueuedDevices += batch.length;

    if (batch.length < PUSH_BATCH_CONFIG.CHUNK_SIZE) break;
    cursor = batch[batch.length - 1].id;
  }

  // 4. Record broadcast campaign in database
  const broadcast = await createNotificationBroadcast({
    adminId,
    title,
    message,
    type,
    targetAudience,
    linkUrl,
    imageUrl,
    recipientCount: targetUserIds.length,
    deliveredCount: totalQueuedDevices,
  });

  logger.info(
    `📢 [BroadcastLogic] Admin ${adminId} broadcasted "${title}" to ${targetUserIds.length} users (${totalQueuedDevices} push devices).`
  );

  return {
    broadcast,
    recipientCount: targetUserIds.length,
    deliveredCount: totalQueuedDevices,
  };
};

/**
 * Get audience summary estimate (user count & registered push devices)
 *
 * @param {string} targetAudience
 * @returns {Promise<{ userCount: number, deviceCount: number }>}
 */
export const getAudienceEstimate = async (targetAudience = 'ALL') => {
  return countAudienceStats(targetAudience);
};

/**
 * Fetch paginated admin broadcast history
 *
 * @param {Object} options
 * @param {number} [options.page=1]
 * @param {number} [options.limit=10]
 * @returns {Promise<Object>}
 */
export const getBroadcastHistory = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [broadcasts, total] = await Promise.all([
    findNotificationBroadcasts({ skip, take: limit }),
    countNotificationBroadcasts(),
  ]);

  return {
    broadcasts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

