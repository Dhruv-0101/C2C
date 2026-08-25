import { Router } from 'express';
import { socialController } from './social.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

// Callback endpoint allows state-based user lookup
router.get(['/meta/callback', '/meta/callback/'], socialController.handleMetaCallback);

// All other social account endpoints require authentication
router.use(authenticate);

// GET /api/v1/social/accounts
router.get('/accounts', socialController.getUserAccounts);

// GET /api/v1/social/auth-url/instagram
router.get('/auth-url/instagram', socialController.getInstagramAuthUrl);

// POST /api/v1/social/connect-manual
router.post('/connect-manual', socialController.connectManualHandle);

// DELETE /api/v1/social/accounts/:platform
router.delete('/accounts/:platform', socialController.disconnectAccount);

export default router;
