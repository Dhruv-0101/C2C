import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import {
  getAnalyticsQuerySchema,
  getTopTemplatesQuerySchema,
  getPostsAnalyticsQuerySchema,
} from './analytics.validator.js';
import {
  getOverview,
  getTrends,
  getPlatformBreakdown,
  getTopTemplates,
  getPostsAnalytics,
  syncAnalytics,
  seedDemo,
} from './analytics.controller.js';

const router = Router();

// All analytics endpoints require authentication
router.use(authenticate);

// Metric aggregation & trend routes with query parameter validation
router.get('/overview', validate(getAnalyticsQuerySchema, 'query'), getOverview);
router.get('/trends', validate(getAnalyticsQuerySchema, 'query'), getTrends);
router.get('/platform-breakdown', validate(getAnalyticsQuerySchema, 'query'), getPlatformBreakdown);
router.get('/top-templates', validate(getTopTemplatesQuerySchema, 'query'), getTopTemplates);

// Individual post analytics & real-time live sync
router.get('/posts', validate(getPostsAnalyticsQuerySchema, 'query'), getPostsAnalytics);
router.post('/sync', syncAnalytics);

// Development testing / sandbox seed route
router.post('/demo-seed', seedDemo);

export default router;

