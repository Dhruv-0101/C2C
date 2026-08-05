import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireSuperAdmin, requireAdmin } from '../../common/middleware/role.middleware.js';
import { authLimiter } from '../../common/middleware/rate-limiter.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import * as authController from './auth.controller.js';
import {
  loginSchema,
  signupSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  createSubAdminSchema,
  verifyLogin2FASchema,
  enable2FASchema,
  getSubAdminsQuerySchema,
  getUsersQuerySchema,
} from './auth.validator.js';

const router = Router();

// Public Authentication Endpoints
router.post('/signup', authLimiter, validate(signupSchema), authController.signup);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/google', authLimiter, validate(googleAuthSchema), authController.googleLogin);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/2fa/verify-login', authLimiter, validate(verifyLogin2FASchema), authController.verifyLogin2FA);
router.post('/refresh', authLimiter, validate(refreshTokenSchema), authController.refresh);
router.post('/logout', authController.logout);

// Authenticated Profile & 2FA Management Endpoints
router.get('/me', authenticate, authController.getProfile);
router.post('/2fa/setup', authenticate, authController.setup2FA);
router.post('/2fa/enable', authenticate, validate(enable2FASchema), authController.enable2FA);
router.post('/2fa/disable', authenticate, authController.disable2FA);

// Admin Directory Endpoints
router.post('/subadmin', authenticate, requireSuperAdmin, validate(createSubAdminSchema), authController.createSubAdmin);
router.get('/subadmins', authenticate, requireSuperAdmin, validate(getSubAdminsQuerySchema), authController.getSubAdmins);
router.delete('/subadmin/:id', authenticate, requireSuperAdmin, authController.deleteSubAdmin);
router.get('/users', authenticate, requireAdmin, validate(getUsersQuerySchema), authController.getUsers);

export default router;
