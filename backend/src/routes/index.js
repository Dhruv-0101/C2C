import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import categoryRoutes from '../modules/categories/category.routes.js';
import festivalRoutes from '../modules/festivals/festival.routes.js';
import designStyleRoutes from '../modules/design-styles/design-style.routes.js';
import templateRoutes from '../modules/templates/template.routes.js';
import brandKitRoutes from '../modules/brandkit/brandkit.routes.js';
import frameRoutes from '../modules/frames/frame.routes.js';
import postRoutes from '../modules/posts/post.routes.js';
import vaultRoutes from '../modules/vault/vault.routes.js';
import socialRoutes from '../modules/social/social.routes.js';

const router = Router();

// API Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Register Module Routes
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/festivals', festivalRoutes);
router.use('/design-styles', designStyleRoutes);
router.use('/templates', templateRoutes);
router.use('/brandkit', brandKitRoutes);
router.use('/frames', frameRoutes);
router.use('/posts', postRoutes);
router.use('/vault', vaultRoutes);
router.use('/social', socialRoutes);

export default router;
