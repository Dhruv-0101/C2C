import { prisma } from '../../config/database.js';

/**
 * Register or update a browser push subscription for a user
 *
 * @param {Object} data
 * @param {string} data.userId
 * @param {string} data.endpoint
 * @param {string} data.p256dh
 * @param {string} data.auth
 * @param {string} [data.userAgent]
 * @param {string} [data.deviceType]
 * @returns {Promise<Object>} Created/updated subscription
 */
export const upsertPushSubscription = async ({
  userId,
  endpoint,
  p256dh,
  auth,
  userAgent,
  deviceType = 'MOBILE',
}) => {
  return prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      userId,
      endpoint,
      p256dh,
      auth,
      userAgent,
      deviceType,
      isActive: true,
    },
    update: {
      userId,
      p256dh,
      auth,
      userAgent,
      deviceType,
      isActive: true,
    },
  });
};

/**
 * Deactivate or remove expired push subscription (called when web-push returns 410 Gone / 404)
 *
 * @param {string} endpoint
 */
export const removePushSubscription = async (endpoint) => {
  return prisma.pushSubscription
    .delete({
      where: { endpoint },
    })
    .catch(() => null);
};

/**
 * Fetch all active push subscriptions for a specific user
 *
 * @param {string} userId
 * @returns {Promise<Array>} List of active subscriptions
 */
export const findActiveSubscriptionsByUserId = async (userId) => {
  return prisma.pushSubscription.findMany({
    where: {
      userId,
      isActive: true,
    },
    select: {
      id: true,
      endpoint: true,
      p256dh: true,
      auth: true,
      deviceType: true,
    },
  });
};

/**
 * Cursor-based streaming pagination for batching 100,000+ subscriptions into Redis BullMQ jobs
 *
 * @param {Object} options
 * @param {string} [options.cursor] - Subscription ID cursor
 * @param {number} [options.take=500] - Batch size
 * @returns {Promise<Array>} List of subscriptions
 */
export const findBatchedSubscriptions = async ({ cursor = null, take = 500 }) => {
  const query = {
    take,
    where: { isActive: true },
    orderBy: { id: 'asc' },
    select: {
      id: true,
      userId: true,
      endpoint: true,
      p256dh: true,
      auth: true,
    },
  };

  if (cursor) {
    query.skip = 1;
    query.cursor = { id: cursor };
  }

  return prisma.pushSubscription.findMany(query);
};

/**
 * Count total active subscriptions
 * @returns {Promise<number>}
 */
export const countActiveSubscriptions = async () => {
  return prisma.pushSubscription.count({
    where: { isActive: true },
  });
};

/**
 * Create an in-app notification record
 *
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export const createInAppNotification = async ({
  userId,
  title,
  message,
  type = 'FESTIVAL_ALERT',
  linkUrl = null,
  metadata = null,
}) => {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      linkUrl,
      metadata,
    },
  });
};

/**
 * Bulk create in-app notifications for a batch of users
 *
 * @param {Array<Object>} records
 */
export const createBulkInAppNotifications = async (records) => {
  if (!records || records.length === 0) return;
  return prisma.notification.createMany({
    data: records,
    skipDuplicates: true,
  });
};

/**
 * Fetch upcoming festivals within a specific date range
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<Array>}
 */
export const findUpcomingFestivalsBetween = async (startDate, endDate) => {
  return prisma.festival.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      name: true,
      date: true,
      slug: true,
      description: true,
      bannerUrl: true,
    },
  });
};

/**
 * Fetch paginated in-app notifications for user bell menu
 *
 * @param {string} userId
 * @param {Object} options
 * @param {number} [options.skip=0]
 * @param {number} [options.take=20]
 * @param {boolean} [options.unreadOnly=false]
 * @returns {Promise<Array>}
 */
export const findUserNotifications = async (
  userId,
  { skip = 0, take = 20, unreadOnly = false }
) => {
  const where = { userId };
  if (unreadOnly) where.isRead = false;

  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });
};

/**
 * Get unread in-app notification count
 *
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const countUnreadNotifications = async (userId) => {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
};

/**
 * Mark a single notification as read
 *
 * @param {string} id
 * @param {string} userId
 */
export const markNotificationAsRead = async (id, userId) => {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
};

/**
 * Mark all notifications as read for a user
 *
 * @param {string} userId
 */
export const markAllNotificationsAsRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

/**
 * Fetch audience user IDs based on target segment (ALL, FREE_USERS, PRO_USERS)
 *
 * @param {string} targetAudience
 * @returns {Promise<Array<string>>}
 */
export const findTargetUserIdsByAudience = async (targetAudience = 'ALL') => {
  let where = { isActive: true };

  if (targetAudience === 'FREE_USERS') {
    where = {
      isActive: true,
      OR: [
        { subscriptions: { none: {} } },
        { subscriptions: { some: { plan: 'FREE' } } },
      ],
    };
  } else if (targetAudience === 'PRO_USERS') {
    where = {
      isActive: true,
      subscriptions: {
        some: {
          plan: 'PRO',
          status: 'ACTIVE',
        },
      },
    };
  }

  const users = await prisma.user.findMany({
    where,
    select: { id: true },
  });

  return users.map((u) => u.id);
};

/**
 * Streaming cursor pagination for subscriptions filtered by user IDs or audience
 *
 * @param {Object} options
 * @param {Array<string>|null} [options.userIds]
 * @param {string|null} [options.cursor]
 * @param {number} [options.take=500]
 * @returns {Promise<Array>}
 */
export const findBatchedSubscriptionsByUserIds = async ({
  userIds = null,
  cursor = null,
  take = 500,
}) => {
  const where = { isActive: true };
  if (userIds && userIds.length > 0) {
    where.userId = { in: userIds };
  }

  const query = {
    take,
    where,
    orderBy: { id: 'asc' },
    select: {
      id: true,
      userId: true,
      endpoint: true,
      p256dh: true,
      auth: true,
    },
  };

  if (cursor) {
    query.skip = 1;
    query.cursor = { id: cursor };
  }

  return prisma.pushSubscription.findMany(query);
};

/**
 * Get audience summary counts for live Admin preview
 *
 * @param {string} targetAudience
 * @returns {Promise<{ userCount: number, deviceCount: number }>}
 */
export const countAudienceStats = async (targetAudience = 'ALL') => {
  const userIds = await findTargetUserIdsByAudience(targetAudience);
  const userCount = userIds.length;

  if (userCount === 0) {
    return { userCount: 0, deviceCount: 0 };
  }

  const deviceCount = await prisma.pushSubscription.count({
    where: {
      userId: { in: userIds },
      isActive: true,
    },
  });

  return { userCount, deviceCount };
};

/**
 * Create a record in NotificationBroadcast
 *
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export const createNotificationBroadcast = async (data) => {
  return prisma.notificationBroadcast.create({
    data,
  });
};

/**
 * Fetch paginated admin broadcast history
 *
 * @param {Object} options
 * @param {number} [options.skip=0]
 * @param {number} [options.take=10]
 * @returns {Promise<Array>}
 */
export const findNotificationBroadcasts = async ({ skip = 0, take = 10 }) => {
  return prisma.notificationBroadcast.findMany({
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      admin: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Count total broadcast campaigns
 * @returns {Promise<number>}
 */
export const countNotificationBroadcasts = async () => {
  return prisma.notificationBroadcast.count();
};

