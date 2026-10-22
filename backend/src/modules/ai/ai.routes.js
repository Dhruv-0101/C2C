import { Router } from 'express';
import * as aiController from './ai.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { aiLimiter } from '../../common/middleware/rate-limiter.middleware.js';
import { enforceActivePlanQuota } from '../../common/middleware/plan-guard.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import {
  generateCaptionSchema,
  generateImageSchema,
  getAiJobStatusSchema,
} from './ai.validator.js';

const router = Router();

// Protect all AI endpoints with JWT authentication and AI rate limiting
router.use(authenticate);
router.use(aiLimiter);

// 🔍 GET /api/v1/ai/jobs/:jobId/status - Poll queue position, countdown, & result
router.get(
  '/jobs/:jobId/status',
  validate(getAiJobStatusSchema),
  aiController.getJobStatus
);

// ✍️ POST /api/v1/ai/generate-caption (Adaptive smart execution / queue under load)
router.post(
  '/generate-caption',
  enforceActivePlanQuota,
  validate(generateCaptionSchema),
  aiController.generateCaption
);

// 🍌 POST /api/v1/ai/generate-image (Nano Banana 2.1 - BullMQ Queue with wait time)
router.post(
  '/generate-image',
  enforceActivePlanQuota,
  validate(generateImageSchema),
  aiController.generatePostImage
);

export default router;

