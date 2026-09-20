import { Router } from 'express';
import {
  getInstagramAuthUrl,
  getLinkedinAuthUrl,
  handleLinkedinCallback,
  handleMetaCallback,
  getUserAccounts,
  disconnectAccount,
} from './social.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import {
  disconnectAccountSchema,
  oauthCallbackQuerySchema,
  getAccountsQuerySchema,
} from './social.validator.js';

const router = Router();

// OAuth callback endpoints allow state-based user lookup
router.get(
  ['/meta/callback', '/meta/callback/'],
  validate(oauthCallbackQuerySchema),
  handleMetaCallback
);
router.get(
  ['/linkedin/callback', '/linkedin/callback/'],
  validate(oauthCallbackQuerySchema),
  handleLinkedinCallback
);

// All subsequent social account endpoints require user authentication
router.use(authenticate);

// GET /api/v1/social/accounts
router.get('/accounts', validate(getAccountsQuerySchema), getUserAccounts);

// GET /api/v1/social/auth-url/instagram
router.get('/auth-url/instagram', getInstagramAuthUrl);

// GET /api/v1/social/auth-url/linkedin
router.get('/auth-url/linkedin', getLinkedinAuthUrl);

// DELETE /api/v1/social/accounts/:platform
router.delete('/accounts/:platform', validate(disconnectAccountSchema), disconnectAccount);

export default router;
