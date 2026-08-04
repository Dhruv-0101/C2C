import { Router } from 'express';
import { frameController } from './frame.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { validateImageUpload } from '../../common/middleware/upload.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { authorize } from '../../common/middleware/role.middleware.js';
import { createFrameSchema } from './frame.validator.js';

const router = Router();

// All frame routes require authentication
router.use(authenticate);

// GET /api/frames (Accessible by all users for post compositing)
router.get('/', frameController.getFrames);

// Admin-only endpoints for creating dynamic frame presets or uploading PNG frames
router.post(
  '/',
  authorize(['ADMIN', 'SUB_ADMIN']),
  validateImageUpload,
  validate(createFrameSchema),
  frameController.createFrame
);

router.delete(
  '/:id',
  authorize(['ADMIN', 'SUB_ADMIN']),
  frameController.deleteFrame
);

export default router;
