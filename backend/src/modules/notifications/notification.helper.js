import webpush from 'web-push';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { DEVICE_TYPES } from './notification.constants.js';

let isVapidInitialized = false;

/**
 * Configure web-push library with VAPID credentials
 */
export const initVapid = () => {
  if (isVapidInitialized) return;

  if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
    try {
      webpush.setVapidDetails(
        env.VAPID_SUBJECT || 'mailto:support@brandflow.in',
        env.VAPID_PUBLIC_KEY,
        env.VAPID_PRIVATE_KEY
      );
      isVapidInitialized = true;
      logger.info('🔔 [WebPush] VAPID configuration initialized successfully.');
    } catch (err) {
      logger.error(`❌ [WebPush] Failed to initialize VAPID details: ${err.message}`);
    }
  } else {
    logger.warn('⚠️ [WebPush] Missing VAPID keys. Web push delivery will be unavailable.');
  }
};

// Initialize at module load
initVapid();

/**
 * Build rich push payload for browser service worker
 *
 * @param {Object} options
 * @param {string} options.title - Notification title (e.g. "Diwali 2026 Alert 🪔")
 * @param {string} options.body - Notification body
 * @param {string} [options.linkUrl='/studio'] - Target path when user taps notification
 * @param {string} [options.imageUrl] - High-res festival banner image
 * @param {string} [options.tag='brandflow-alert'] - Notification tag (replaces duplicates)
 * @returns {string} Stringified JSON payload
 */
export const buildPushPayload = ({
  title,
  body,
  linkUrl = '/studio',
  url,
  imageUrl = null,
  image,
  tag = 'brandflow-alert',
}) => {
  const targetUrl = linkUrl || url || '/studio';
  const targetImage = imageUrl || image || null;

  const payload = {
    title,
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      url: targetUrl,
      timestamp: Date.now(),
    },
    tag: `${tag}-${Date.now()}`,
    vibrate: [250, 100, 250, 100, 250],
    renotify: true,
    silent: false,
    requireInteraction: true,
  };

  if (targetImage && typeof targetImage === 'string' && targetImage.trim().length > 0) {
    payload.image = targetImage.trim();
  }

  return JSON.stringify(payload);
};

/**
 * Infer Device Type from User-Agent string
 *
 * @param {string} userAgent
 * @returns {string} 'MOBILE' | 'DESKTOP' | 'TABLET'
 */
export const detectDeviceType = (userAgent = '') => {
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return DEVICE_TYPES.TABLET;
  }
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
      ua
    )
  ) {
    return DEVICE_TYPES.MOBILE;
  }
  return DEVICE_TYPES.DESKTOP;
};

/**
 * Sanitize notification object for client response (OWASP Data Minimization)
 *
 * @param {Object} n - Raw Notification record
 * @returns {Object} Sanitized notification
 */
export const sanitizeNotification = (n) => {
  if (!n) return null;
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    linkUrl: n.linkUrl,
    metadata: n.metadata,
    isRead: n.isRead,
    createdAt: n.createdAt,
  };
};
