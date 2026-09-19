import { HTTP_STATUS } from '../constants/http-status.js';
import { sendErrorResponse } from '../utils/response.util.js';
import { billingRepository } from '../../modules/billing/billing.repository.js';
import { FREE_PLAN_LIMITS } from '../../modules/billing/billing.constants.js';

/**
 * Plan Guard Middleware: Ensures user has an active subscription plan & available post quota
 */
export const enforceActivePlanQuota = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendErrorResponse(res, {
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: 'Authentication required.',
      });
    }

    const sub = await billingRepository.findByUserId(userId);

    if (!sub) {
      return sendErrorResponse(res, {
        statusCode: HTTP_STATUS.FORBIDDEN,
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

    const planRemaining = Math.max(0, sub.totalPostsAllowed - sub.postsUsed);
    const bonusRemaining = Math.max(0, sub.bonusPostsAllowed - sub.bonusPostsUsed);
    const postsRemaining = planRemaining + bonusRemaining;

    if (sub.status === 'EXPIRED' || postsRemaining <= 0) {
      return sendErrorResponse(res, {
        statusCode: HTTP_STATUS.FORBIDDEN,
        code: 'PLAN_EXPIRED',
        message: 'Your post quota has been exhausted. Please purchase a plan or contact support to continue creating or scheduling posts.',
        data: {
          plan: sub.plan,
          status: 'EXPIRED',
          totalPostsAllowed: sub.totalPostsAllowed,
          postsUsed: sub.postsUsed,
          bonusPostsAllowed: sub.bonusPostsAllowed,
          bonusPostsUsed: sub.bonusPostsUsed,
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
