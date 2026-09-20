import { HTTP_STATUS } from '../../common/constants/http-status.js';
import { sendSuccessResponse, sendErrorResponse } from '../../common/utils/response.util.js';
import {
  getInstagramAuthUrl as getInstagramAuthUrlLogic,
  getLinkedinAuthUrl as getLinkedinAuthUrlLogic,
  handleLinkedinCallback as handleLinkedinCallbackLogic,
  handleMetaCallback as handleMetaCallbackLogic,
  getUserAccounts as getUserAccountsLogic,
  disconnectAccount as disconnectAccountLogic,
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
export const handleLinkedinCallback = async (req, res) => {
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
export const handleMetaCallback = async (req, res) => {
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
 * Social Controller singleton for backward-compatible consumption
 */
export const socialController = {
  getInstagramAuthUrl,
  getLinkedinAuthUrl,
  handleLinkedinCallback,
  handleMetaCallback,
  getUserAccounts,
  disconnectAccount,
};
