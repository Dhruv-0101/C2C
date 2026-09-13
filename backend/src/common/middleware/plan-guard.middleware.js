import { billingRepository } from '../../modules/billing/billing.repository.js';
import { FREE_PLAN_LIMITS } from '../../modules/billing/billing.constants.js';

/**
 * Plan Guard Middleware: Ensures user has an active subscription plan & available post quota
 */
export const enforceActivePlanQuota = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const sub = await billingRepository.findByUserId(userId);

    if (!sub) {
      return res.status(403).json({
        success: false,
        code: 'PLAN_REQUIRED',
        message: 'No active plan found. Please select or purchase a plan (Free 5 Posts or Pro Plan) to continue creating or scheduling posts.',
        data: {
          plan: null,
          status: 'NO_PLAN',
          totalPostsAllowed: 0,
          postsUsed: 0,
          postsRemaining: 0,
        },
      });
    }

    const postsRemaining = Math.max(0, sub.totalPostsAllowed - sub.postsUsed);

    if (sub.status === 'EXPIRED' || postsRemaining <= 0) {
      return res.status(403).json({
        success: false,
        code: 'PLAN_EXPIRED',
        message: 'Your plan post quota has been exhausted. Please purchase a plan to continue creating or scheduling posts.',
        data: {
          plan: sub.plan,
          status: 'EXPIRED',
          totalPostsAllowed: sub.totalPostsAllowed,
          postsUsed: sub.postsUsed,
          postsRemaining: 0,
        },
      });
    }

    req.subscription = sub;
    next();
  } catch (err) {
    next(err);
  }
};
