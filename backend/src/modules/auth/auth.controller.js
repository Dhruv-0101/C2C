import { HTTP_STATUS } from '../../common/constants/http-status.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';
import { COOKIE_OPTIONS, REFRESH_TOKEN_COOKIE_NAME } from './auth.constants.js';
import * as authLogic from './auth.logic.js';

export async function signup(req, res, next) {
  try {
    const result = await authLogic.signupUser(req.body);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Account registered successfully.',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authLogic.loginUser(req.body);

    if (result.require2FA) {
      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Two-factor authentication required. Please enter 6-digit code.',
        data: {
          require2FA: true,
          mfaToken: result.mfaToken,
        },
      });
    }

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Logged in successfully.',
      data: {
        require2FA: false,
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const result = await authLogic.loginWithGoogle(req.body);

    if (result.require2FA) {
      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Two-factor authentication required. Please enter 6-digit code.',
        data: {
          require2FA: true,
          mfaToken: result.mfaToken,
        },
      });
    }

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Authenticated with Google successfully.',
      data: {
        require2FA: false,
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyLogin2FA(req, res, next) {
  try {
    const result = await authLogic.verifyLogin2FA(req.body);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: '2FA verification successful. Logged in.',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function setup2FA(req, res, next) {
  try {
    const data = await authLogic.setup2FA(req.user.id);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Scan the QR Code with Google Authenticator or Authy.',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function enable2FA(req, res, next) {
  try {
    const data = await authLogic.enable2FA(req.user.id, req.body.code);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Two-factor authentication enabled successfully. Save your backup codes.',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function disable2FA(req, res, next) {
  try {
    const data = await authLogic.disable2FA(req.user.id);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Two-factor authentication disabled successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function createSubAdmin(req, res, next) {
  try {
    const subAdmin = await authLogic.createSubAdmin(req.body);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'SubAdmin account created successfully.',
      data: { subAdmin },
    });
  } catch (error) {
    next(error);
  }
}

export async function getSubAdmins(req, res, next) {
  try {
    const subAdmins = await authLogic.getSubAdmins();

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'SubAdmin list retrieved successfully.',
      data: { subAdmins },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSubAdmin(req, res, next) {
  try {
    await authLogic.removeSubAdmin(req.params.id);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'SubAdmin account deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME] || req.body?.refreshToken;

    const result = await authLogic.refreshSession(refreshToken);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Token refreshed successfully.',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME] || req.body?.refreshToken;

    await authLogic.logoutUser(refreshToken);

    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, COOKIE_OPTIONS);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req, res, next) {
  try {
    const user = await authLogic.getUserProfile(req.user.id);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'User profile retrieved successfully.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const result = await authLogic.requestPasswordReset({ email: req.body.email });
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const result = await authLogic.resetPassword({
      token: req.body.token,
      newPassword: req.body.newPassword,
    });
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}
