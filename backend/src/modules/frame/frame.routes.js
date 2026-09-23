import { Router } from 'express';
import * as frameController from './frame.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { uploadSingleImage } from '../../common/middleware/upload.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireTabPermission } from '../../common/middleware/role.middleware.js';
import { FRAME_TAB_PERMISSION } from './frame.constants.js';
import {
  createFrameSchema,
  getFramesQuerySchema,
  frameIdParamSchema,
} from './frame.validator.js';

const router = Router();

// All frame endpoints require authenticated session
router.use(authenticate);

// GET /api/v1/frames (Accessible by all authenticated users with pagination)
router.get('/', validate(getFramesQuerySchema), frameController.getFrames);

// GET /api/v1/frames/:id (Accessible by all authenticated users)
router.get('/:id', validate(frameIdParamSchema), frameController.getFrameById);

// Admin / SubAdmin endpoints for creating dynamic frame presets or uploading PNG frames
router.post(
  '/',
  requireTabPermission(FRAME_TAB_PERMISSION),
  uploadSingleImage('overlay'),
  validate(createFrameSchema),
  frameController.createFrame
);

// Admin / SubAdmin endpoint for deleting frames
router.delete(
  '/:id',
  requireTabPermission(FRAME_TAB_PERMISSION),
  validate(frameIdParamSchema),
  frameController.deleteFrame
);

export default router;
