import { Router } from 'express';
import { aiController } from './ai.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

// Protect all AI endpoints
router.use(authenticate);

router.post('/generate-caption', aiController.generateCaption);
router.post('/suggest-hashtags', aiController.suggestHashtags);

export default router;
