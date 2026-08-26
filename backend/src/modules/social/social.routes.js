import { Router } from 'express';
import { socialController } from './social.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

// Callback endpoints allow state-based user lookup
router.get(['/meta/callback', '/meta/callback/'], socialController.handleMetaCallback);
router.get(['/linkedin/callback', '/linkedin/callback/'], socialController.handleLinkedinCallback);
router.get(['/twitter/callback', '/twitter/callback/'], socialController.handleTwitterCallback);

// All other social account endpoints require authentication
router.use(authenticate);

// GET /api/v1/social/accounts
router.get('/accounts', socialController.getUserAccounts);

// GET /api/v1/social/auth-url/instagram
router.get('/auth-url/instagram', socialController.getInstagramAuthUrl);

// GET /api/v1/social/auth-url/linkedin
router.get('/auth-url/linkedin', socialController.getLinkedinAuthUrl);

// GET /api/v1/social/auth-url/twitter
router.get('/auth-url/twitter', socialController.getTwitterAuthUrl);

// POST /api/v1/social/connect-manual
router.post('/connect-manual', socialController.connectManualHandle);

// DELETE /api/v1/social/accounts/:platform
router.delete('/accounts/:platform', socialController.disconnectAccount);

export default router;
