import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireAdmin } from '../../common/middleware/role.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { billingController } from './billing.controller.js';
import {
  createRazorpayOrderSchema,
  createStripeIntentSchema,
  verifyRazorpaySchema,
  verifyStripeSchema,
  adminTopUpSchema,
} from './billing.validator.js';

const router = Router();

// All billing endpoints require authentication
router.use(authenticate);

router.get('/status', billingController.getStatus);
router.get('/history', billingController.getHistory);
router.get('/invoice/:transactionId/download', billingController.downloadInvoice);
router.post('/free/activate', billingController.activateFreePlan);

router.post(
  '/razorpay/create-order',
  validate(createRazorpayOrderSchema),
  billingController.createRazorpayOrder
);
router.post(
  '/razorpay/verify',
  validate(verifyRazorpaySchema),
  billingController.verifyRazorpayPayment
);

router.post(
  '/stripe/create-intent',
  validate(createStripeIntentSchema),
  billingController.createStripeIntent
);
router.post(
  '/stripe/verify',
  validate(verifyStripeSchema),
  billingController.verifyStripePayment
);

import { billingAdminController } from './billing.admin.controller.js';

// Admin-only quota top-up route
router.put(
  '/admin/topup/:userId',
  requireAdmin,
  validate(adminTopUpSchema),
  billingController.adminTopUpQuota
);

// Admin Finance & Executive Revenue Module Routes
router.get('/admin/overview', requireAdmin, billingAdminController.getOverview);
router.get('/admin/transactions', requireAdmin, billingAdminController.getTransactions);
router.post('/admin/manual-transaction', requireAdmin, billingAdminController.recordManualTransaction);
router.get('/admin/export', requireAdmin, billingAdminController.exportTransactionsCsv);

export default router;
