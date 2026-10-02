import { HTTP_STATUS } from '../../common/constants/http-status.js';
import { sendSuccessResponse, sendErrorResponse } from '../../common/utils/response.util.js';
import {
  getInstagramAuthUrl as getInstagramAuthUrlLogic,
  getLinkedinAuthUrl as getLinkedinAuthUrlLogic,
  handleLinkedinCallback as handleLinkedinCallbackLogic,
  handleMetaCallback as handleMetaCallbackLogic,
  getUserAccounts as getUserAccountsLogic,
  disconnectAccount as disconnectAccountLogic,
  adminConnectUserToken as adminConnectUserTokenLogic,
  adminDisconnectUserAccount as adminDisconnectUserAccountLogic,
  submitPageLink as submitPageLinkLogic,
  getSocialOnboardingStatus as getSocialOnboardingStatusLogic,
  adminUpdateOnboardingStatus as adminUpdateOnboardingStatusLogic,
} from './social.logic.js';
import { resolveClientUrl } from './social.helper.js';

/**
 * GET /api/v1/social/auth-url/instagram
 */
export const getInstagramAuthUrl = async (req, res, next) => {
  try {
    const clientUrl = resolveClientUrl(req);
    const result = await getInstagramAuthUrlLogic(req.user.id, clientUrl);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.configured
        ? 'Instagram OAuth URL generated successfully'
        : 'Meta App configuration status retrieved',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/social/auth-url/linkedin
 */
export const getLinkedinAuthUrl = async (req, res, next) => {
  try {
    const clientUrl = resolveClientUrl(req);
    const result = await getLinkedinAuthUrlLogic(req.user.id, clientUrl);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.configured
        ? 'LinkedIn OAuth URL generated successfully'
        : 'LinkedIn App configuration status retrieved',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/social/linkedin/callback
 */
export const handleLinkedinCallback = async (req, res, next) => {
  const { code, state, error, error_description } = req.query;
  const clientUrl = resolveClientUrl(req, state);

  try {
    if (error) {
      return res.redirect(`${clientUrl}/brand-kit?error=${encodeURIComponent(error_description || error)}`);
    }

    let userId = req.user?.id;

    if (!userId && state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
        userId = decoded.userId;
      } catch {
        // ignore parse error
      }
    }

    if (!userId) {
      return sendErrorResponse(res, {
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: 'Unauthorized callback execution. Missing user context.',
      });
    }

    const result = await handleLinkedinCallbackLogic(code, userId);

    return res.redirect(`${clientUrl}/brand-kit?social_success=true&account=${encodeURIComponent(result.account.accountName)}`);
  } catch (err) {
    return res.redirect(`${clientUrl}/brand-kit?error=${encodeURIComponent(err.message || 'Failed to connect LinkedIn account')}`);
  }
};

/**
 * GET /api/v1/social/meta/callback
 */
export const handleMetaCallback = async (req, res, next) => {
  const { code, state, error, error_description } = req.query;
  const clientUrl = resolveClientUrl(req, state);

  try {
    if (error) {
      return res.redirect(`${clientUrl}/brand-kit?error=${encodeURIComponent(error_description || error)}`);
    }

    let userId = req.user?.id;

    if (!userId && state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
        userId = decoded.userId;
      } catch {
        // ignore parse error
      }
    }

    if (!userId) {
      return sendErrorResponse(res, {
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: 'Unauthorized callback execution. Missing user context.',
      });
    }

    const result = await handleMetaCallbackLogic(code, userId);

    return res.redirect(`${clientUrl}/brand-kit?social_success=true&account=${encodeURIComponent(result.account.accountName)}`);
  } catch (err) {
    return res.redirect(`${clientUrl}/brand-kit?error=${encodeURIComponent(err.message || 'Failed to connect Instagram account')}`);
  }
};

/**
 * GET /api/v1/social/accounts
 */
export const getUserAccounts = async (req, res, next) => {
  try {
    const result = await getUserAccountsLogic(req.user.id, req.query);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Social accounts retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/social/accounts/:platform
 */
export const disconnectAccount = async (req, res, next) => {
  try {
    const { platform } = req.params;
    const result = await disconnectAccountLogic(req.user.id, platform);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: `Disconnected ${platform} account successfully`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/social/admin/connect-user-token
 * Connect Meta System User / Page Token for a Specific Client Tenant (Admin Only)
 */
export const adminConnectUserToken = async (req, res, next) => {
  try {
    const { userId, token } = req.body;
    const result = await adminConnectUserTokenLogic({ userId, token });
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message || 'Client social accounts connected successfully',
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/social/admin/user/:userId/:platform
 * Disconnect a Specific User's Social Account (Admin Only)
 */
export const adminDisconnectUserAccount = async (req, res, next) => {
  try {
    const { userId, platform } = req.params;
    const result = await adminDisconnectUserAccountLogic(userId, platform);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: `Disconnected ${platform} account for user successfully`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/social/submit-page-link
 * Client submits their Facebook Page URL / name for managed agency onboarding
 */
export const submitPageLink = async (req, res, next) => {
  try {
    const { pageUrl } = req.body;
    const result = await submitPageLinkLogic(req.user.id, pageUrl);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/social/onboarding-status
 * Get current client's social onboarding status and submitted page
 */
export const getSocialOnboardingStatus = async (req, res, next) => {
  try {
    const result = await getSocialOnboardingStatusLogic(req.user.id);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Onboarding status retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/social/admin/update-status
 * Admin updates client's onboarding status (e.g. REQUEST_SENT)
 */
export const adminUpdateOnboardingStatus = async (req, res, next) => {
  try {
    const { userId, status } = req.body;
    const targetUserId = userId || req.user.id;
    const result = await adminUpdateOnboardingStatusLogic(targetUserId, status);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Social Controller singleton for backward-compatible consumption
 */
export const socialController = {
  getInstagramAuthUrl,
  getLinkedinAuthUrl,
  handleLinkedinCallback,
  handleMetaCallback,
  getUserAccounts,
  disconnectAccount,
  adminConnectUserToken,
  adminDisconnectUserAccount,
  submitPageLink,
  getSocialOnboardingStatus,
  adminUpdateOnboardingStatus,
};


