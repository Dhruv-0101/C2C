import { HTTP_STATUS } from '../../common/constants/http-status.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';
import {
  subscribePushSchema,
  unsubscribePushSchema,
  testPushSchema,
  adminBroadcastSchema,
  broadcastQuerySchema,
} from './notification.validator.js';
import {
  getVapidPublicKey,
  subscribeUser,
  unsubscribeUser,
  sendTestPush,
  dispatchTomorrowFestivalAlerts,
  getUserNotificationFeed,
  markNotificationRead,
  markAllNotificationsRead,
  broadcastToAudience,
  getAudienceEstimate,
  getBroadcastHistory,
} from './notification.logic.js';

/**
 * GET /api/v1/notifications/vapid-public-key
 * Fetch server VAPID public key
 */
export const getPublicKey = async (req, res, next) => {
  try {
    const publicKey = getVapidPublicKey();
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'VAPID public key retrieved successfully.',
      data: { publicKey },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/notifications/subscribe
 * Register device for mobile/desktop push notifications
 */
export const subscribe = async (req, res, next) => {
  try {
    const validatedData = subscribePushSchema.parse(req.body);
    const userAgent = req.headers['user-agent'] || '';
    const result = await subscribeUser(req.user.id, validatedData, userAgent);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: result.message,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/notifications/unsubscribe
 * Deregister device endpoint
 */
export const unsubscribe = async (req, res, next) => {
  try {
    const validatedData = unsubscribePushSchema.parse(req.body);
    const result = await unsubscribeUser(validatedData.endpoint);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/notifications/test-send
 * Send immediate test push to current user's registered devices
 */
export const triggerTestPush = async (req, res, next) => {
  try {
    const validatedData = testPushSchema.parse(req.body);
    const result = await sendTestPush(req.user.id, validatedData);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/notifications/admin/dispatch-festival-alerts
 * Admin/Cron endpoint to trigger 1-day advance festival alerts
 */
export const triggerFestivalAlerts = async (req, res, next) => {
  try {
    const result = await dispatchTomorrowFestivalAlerts();

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Festival advance alert dispatcher executed.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/notifications
 * Fetch user's in-app notification feed for Bell icon
 */
export const getFeed = async (req, res, next) => {
  try {
    const result = await getUserNotificationFeed(req.user.id, req.query);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Notifications fetched successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark notification as read
 */
export const markRead = async (req, res, next) => {
  try {
    const result = await markNotificationRead(req.params.id, req.user.id);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Notification marked as read.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all user notifications as read
 */
export const markAllRead = async (req, res, next) => {
  try {
    const result = await markAllNotificationsRead(req.user.id);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'All notifications marked as read.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/notifications/admin/broadcast
 * Send a manual broadcast announcement / promotion to target users
 */
export const broadcastMessage = async (req, res, next) => {
  try {
    const validatedData = adminBroadcastSchema.parse(req.body);
    const result = await broadcastToAudience(req.user.id, validatedData);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: `Broadcast dispatched to ${result.recipientCount} users (${result.deliveredCount} push devices queued).`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/notifications/admin/audience-estimate
 * Estimate recipient and push device count for selected target audience
 */
export const getAudienceEstimateHandler = async (req, res, next) => {
  try {
    const targetAudience = req.query.targetAudience || 'ALL';
    const result = await getAudienceEstimate(targetAudience);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Audience estimate calculated.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/notifications/admin/broadcasts
 * Fetch paginated broadcast history
 */
export const getBroadcastHistoryHandler = async (req, res, next) => {
  try {
    const validatedQuery = broadcastQuerySchema.parse(req.query);
    const result = await getBroadcastHistory(validatedQuery);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Broadcast history fetched successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

