import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireAdmin } from '../../common/middleware/role.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { validateOptionalImageUpload } from '../../common/middleware/upload.middleware.js';
import {
  createPostSchema,
  getAdminPostsQuerySchema,
  publishNowSchema,
  schedulePostSchema,
  updatePostGraphicSchema,
  postIdParamSchema,
} from './post.validator.js';
import * as postController from './post.controller.js';

const router = Router();

// All post endpoints require authentication
router.use(authenticate);

// --- 🛡️ Enterprise Admin Post Tracking & Analytics Endpoints ---
router.get(
  '/admin/analytics',
  requireAdmin,
  postController.getAdminPostAnalytics
);

router.get(
  '/admin/all',
  requireAdmin,
  validate(getAdminPostsQuerySchema),
  postController.getAdminPosts
);

// --- 👤 User Endpoints ---
// GET /api/v1/posts
router.get('/', postController.getUserPosts);

// GET /api/v1/posts/scheduled (Scheduled Queue)
router.get('/scheduled', postController.getScheduledPosts);

// POST /api/v1/posts/publish-now (Instant Live Publishing)
router.post('/publish-now', validate(publishNowSchema), postController.publishNow);

// POST /api/v1/posts/schedule (Schedule for Future Date/Time)
router.post('/schedule', validate(schedulePostSchema), postController.schedulePost);

// POST /api/v1/posts (Save generated post)
router.post(
  '/',
  validateOptionalImageUpload,
  validate(createPostSchema),
  postController.createPost
);

// PUT /api/v1/posts/:id/graphic (Re-render & update post graphic in place without deducting extra quota)
router.put(
  '/:id/graphic',
  validate(postIdParamSchema),
  validateOptionalImageUpload,
  validate(updatePostGraphicSchema),
  postController.updatePostGraphic
);

// DELETE /api/v1/posts/:id
router.delete(
  '/:id',
  validate(postIdParamSchema),
  postController.deletePost
);

export default router;
