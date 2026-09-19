import { Router } from 'express';
import { aiController } from './ai.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { aiLimiter } from '../../common/middleware/rate-limiter.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { generateCaptionSchema, suggestHashtagsSchema } from './ai.validator.js';

const router = Router();

// Protect all AI endpoints with JWT authentication and AI rate limiting
router.use(authenticate);
router.use(aiLimiter);

router.post('/generate-caption', validate(generateCaptionSchema), aiController.generateCaption);
router.post('/suggest-hashtags', validate(suggestHashtagsSchema), aiController.suggestHashtags);

export default router;

