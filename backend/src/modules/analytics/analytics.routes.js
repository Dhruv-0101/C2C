import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { analyticsController } from './analytics.controller.js';

const router = Router();

// All analytics endpoints require authentication
router.use(authenticate);

router.get('/overview', analyticsController.getOverview);
router.get('/trends', analyticsController.getTrends);
router.get('/platform-breakdown', analyticsController.getPlatformBreakdown);
router.get('/top-templates', analyticsController.getTopTemplates);
router.post('/demo-seed', analyticsController.seedDemo);

export default router;
