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

// POST /api/v1/posts (Save generated post)
router.post('/', validate(createPostSchema), postController.createPost);

// DELETE /api/v1/posts/:id
router.delete('/:id', postController.deletePost);

export default router;
