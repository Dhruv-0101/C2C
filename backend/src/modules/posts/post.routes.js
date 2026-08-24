import { Router } from 'express';
import { postController } from './post.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { createPostSchema } from './post.validator.js';

const router = Router();

// All post endpoints require authentication
router.use(authenticate);

// GET /api/v1/posts
router.get('/', postController.getUserPosts);

// GET /api/v1/posts/scheduled (Scheduled Queue)
router.get('/scheduled', postController.getScheduledPosts);

// POST /api/v1/posts/publish-now (Instant Mock Publishing)
router.post('/publish-now', postController.publishNow);

// POST /api/v1/posts/schedule (Schedule for Future Date/Time)
router.post('/schedule', postController.schedulePost);

// POST /api/v1/posts/trigger-scheduled-jobs (Manual Test Trigger)
router.post('/trigger-scheduled-jobs', postController.triggerScheduledJobs);

// POST /api/v1/posts (Save generated post)
router.post('/', validate(createPostSchema), postController.createPost);

// DELETE /api/v1/posts/:id
router.delete('/:id', postController.deletePost);

export default router;
