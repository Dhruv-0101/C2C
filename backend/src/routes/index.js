import { Router } from 'express';
import { HTTP_STATUS } from '../common/constants/http-status.js';
import authRoutes from '../modules/auth/auth.routes.js';
import categoryRoutes from '../modules/category/category.routes.js';
import festivalRoutes from '../modules/festival/festival.routes.js';
import templateRoutes from '../modules/template/template.routes.js';
import brandKitRoutes from '../modules/brandkit/brandkit.routes.js';
import frameRoutes from '../modules/frame/frame.routes.js';
import postRoutes from '../modules/post/post.routes.js';
import vaultRoutes from '../modules/vault/vault.routes.js';
import socialRoutes from '../modules/social/social.routes.js';
import billingRoutes from '../modules/billing/billing.routes.js';
import aiRoutes from '../modules/ai/ai.routes.js';
import analyticsRoutes from '../modules/analytics/analytics.routes.js';

const router = Router();

// API Health Check
router.get('/health', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Register Module Routes
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/festivals', festivalRoutes);
router.use('/templates', templateRoutes);
router.use('/brandkit', brandKitRoutes);
router.use('/frames', frameRoutes);
router.use('/posts', postRoutes);
router.use('/vault', vaultRoutes);
router.use('/social', socialRoutes);
router.use('/billing', billingRoutes);
router.use('/ai', aiRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
