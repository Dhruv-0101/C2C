import { Router } from 'express';
import * as aiController from './ai.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { aiLimiter } from '../../common/middleware/rate-limiter.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { generateCaptionSchema } from './ai.validator.js';

const router = Router();

// Protect all AI endpoints with JWT authentication and AI rate limiting
router.use(authenticate);
router.use(aiLimiter);

// POST /api/v1/ai/generate-caption
router.post('/generate-caption', validate(generateCaptionSchema), aiController.generateCaption);

export default router;
