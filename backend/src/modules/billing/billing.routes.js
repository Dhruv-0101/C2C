import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireSuperAdmin } from '../../common/middleware/role.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import {
  getStatus,
  getHistory,
  downloadInvoice,
  activateFreePlan,
  createRazorpayOrder,
  verifyRazorpayPayment,
  createStripeIntent,
  verifyStripePayment,
  adminTopUpQuota,
} from './billing.controller.js';
import {
  getOverview,
  getTransactions,
  recordManualTransaction,
  exportTransactionsCsv,
} from './billing.admin.controller.js';
import {
  createRazorpayOrderSchema,
  createStripeIntentSchema,
  verifyRazorpaySchema,
  verifyStripeSchema,
  adminTopUpSchema,
  recordManualTransactionSchema,
  downloadInvoiceParamSchema,
  getBillingHistoryQuerySchema,
  getAdminTransactionsQuerySchema,
} from './billing.validator.js';

const router = Router();

// All billing endpoints require authentication
router.use(authenticate);

// User Subscription & Quota
router.get('/status', getStatus);
router.get('/history', validate(getBillingHistoryQuerySchema), getHistory);
router.get('/invoice/:transactionId/download', validate(downloadInvoiceParamSchema), downloadInvoice);
router.post('/free/activate', activateFreePlan);

// Payment Gateways (Razorpay & Stripe)
router.post(
  '/razorpay/create-order',
  validate(createRazorpayOrderSchema),
  createRazorpayOrder
);
router.post(
  '/razorpay/verify',
  validate(verifyRazorpaySchema),
  verifyRazorpayPayment
);

router.post(
  '/stripe/create-intent',
  validate(createStripeIntentSchema),
  createStripeIntent
);
router.post(
  '/stripe/verify',
  validate(verifyStripeSchema),
  verifyStripePayment
);

// Admin-only Quota Top-Up Route (Strictly SuperAdmin Privilege)
router.put(
  '/admin/topup/:userId',
  requireSuperAdmin,
  validate(adminTopUpSchema),
  adminTopUpQuota
);

// Admin Finance & Executive Revenue Module Routes (Strictly SuperAdmin Privilege)
router.get('/admin/overview', requireSuperAdmin, getOverview);
router.get('/admin/transactions', requireSuperAdmin, validate(getAdminTransactionsQuerySchema), getTransactions);
router.post(
  '/admin/manual-transaction',
  requireSuperAdmin,
  validate(recordManualTransactionSchema),
  recordManualTransaction
);
router.get('/admin/export', requireSuperAdmin, validate(getAdminTransactionsQuerySchema), exportTransactionsCsv);

export default router;
