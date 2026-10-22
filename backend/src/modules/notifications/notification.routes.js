import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireAdmin } from '../../common/middleware/role.middleware.js';
import {
  getPublicKey,
  subscribe,
  unsubscribe,
  triggerTestPush,
  triggerFestivalAlerts,
  getFeed,
  markRead,
  markAllRead,
  broadcastMessage,
  getAudienceEstimateHandler,
  getBroadcastHistoryHandler,
} from './notification.controller.js';

const router = Router();

// All routes require authenticated session
router.use(authenticate);

// VAPID Public Key for client browser PushManager registration
router.get('/vapid-public-key', getPublicKey);

// Push subscription lifecycle
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.post('/test-send', triggerTestPush);

// In-App Notification Feed (Bell dropdown)
router.get('/', getFeed);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);

// Admin Broadcast & Festival Operations
router.post('/admin/dispatch-festival-alerts', requireAdmin, triggerFestivalAlerts);
router.post('/admin/broadcast', requireAdmin, broadcastMessage);
router.get('/admin/audience-estimate', requireAdmin, getAudienceEstimateHandler);
router.get('/admin/broadcasts', requireAdmin, getBroadcastHistoryHandler);

export default router;
