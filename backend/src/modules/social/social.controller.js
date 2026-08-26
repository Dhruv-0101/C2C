import { socialLogic } from './social.logic.js';
import { env } from '../../config/env.js';

export const socialController = {
  /**
   * GET /api/v1/social/auth-url/instagram
   */
  getInstagramAuthUrl: async (req, res, next) => {
    try {
      const result = await socialLogic.getInstagramAuthUrl(req.user.id);
      return res.status(200).json({
        success: true,
        message: result.configured
          ? 'Instagram OAuth URL generated successfully'
          : 'Meta App configuration status retrieved',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/social/auth-url/linkedin
   */
  getLinkedinAuthUrl: async (req, res, next) => {
    try {
      const result = await socialLogic.getLinkedinAuthUrl(req.user.id);
      return res.status(200).json({
        success: true,
        message: result.configured
          ? 'LinkedIn OAuth URL generated successfully'
          : 'LinkedIn App configuration status retrieved',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/social/auth-url/twitter
   */
  getTwitterAuthUrl: async (req, res, next) => {
    try {
      const result = await socialLogic.getTwitterAuthUrl(req.user.id);
      return res.status(200).json({
        success: true,
        message: result.configured
          ? 'Twitter OAuth URL generated successfully'
          : 'Twitter App configuration status retrieved',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/social/twitter/callback
   */
  handleTwitterCallback: async (req, res, next) => {
    try {
      const { code, state, error, error_description } = req.query;

      if (error) {
        return res.redirect(`${env.CLIENT_URL}/brand-kit?error=${encodeURIComponent(error_description || error)}`);
      }

      let userId = req.user?.id;

      if (!userId && state) {
        try {
          const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
          userId = decoded.userId;
        } catch (e) {
          // ignore parse error
        }
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized callback execution. Missing user context.',
        });
      }

      const result = await socialLogic.handleTwitterCallback(code, userId);

      return res.redirect(`${env.CLIENT_URL}/brand-kit?social_success=true&account=${encodeURIComponent(result.account.accountName)}`);
    } catch (err) {
      return res.redirect(`${env.CLIENT_URL}/brand-kit?error=${encodeURIComponent(err.message || 'Failed to connect Twitter account')}`);
    }
  },

  /**
   * GET /api/v1/social/linkedin/callback
   */
  handleLinkedinCallback: async (req, res, next) => {
    try {
      const { code, state, error, error_description } = req.query;

      if (error) {
        return res.redirect(`${env.CLIENT_URL}/brand-kit?error=${encodeURIComponent(error_description || error)}`);
      }

      let userId = req.user?.id;

      if (!userId && state) {
        try {
          const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
          userId = decoded.userId;
        } catch (e) {
          // ignore parse error
        }
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized callback execution. Missing user context.',
        });
      }

      const result = await socialLogic.handleLinkedinCallback(code, userId);

      return res.redirect(`${env.CLIENT_URL}/brand-kit?social_success=true&account=${encodeURIComponent(result.account.accountName)}`);
    } catch (err) {
      return res.redirect(`${env.CLIENT_URL}/brand-kit?error=${encodeURIComponent(err.message || 'Failed to connect LinkedIn account')}`);
    }
  },

  /**
   * GET /api/v1/social/meta/callback
   */
  handleMetaCallback: async (req, res, next) => {
    try {
      const { code, state, error, error_description } = req.query;

      if (error) {
        return res.redirect(`${env.CLIENT_URL}/brand-kit?error=${encodeURIComponent(error_description || error)}`);
      }

      let userId = req.user?.id;

      if (!userId && state) {
        try {
          const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
          userId = decoded.userId;
        } catch (e) {
          // ignore parse error
        }
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized callback execution. Missing user context.',
        });
      }

      const result = await socialLogic.handleMetaCallback(code, userId);

      // Redirect back to frontend settings page with success indicator
      return res.redirect(`${env.CLIENT_URL}/brand-kit?social_success=true&account=${encodeURIComponent(result.account.accountName)}`);
    } catch (err) {
      return res.redirect(`${env.CLIENT_URL}/brand-kit?error=${encodeURIComponent(err.message || 'Failed to connect Instagram account')}`);
    }
  },

  /**
   * GET /api/v1/social/accounts
   */
  getUserAccounts: async (req, res, next) => {
    try {
      const accounts = await socialLogic.getUserAccounts(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Social accounts retrieved successfully',
        data: { accounts },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/v1/social/accounts/:platform
   */
  disconnectAccount: async (req, res, next) => {
    try {
      const { platform } = req.params;
      const result = await socialLogic.disconnectAccount(req.user.id, platform);
      return res.status(200).json({
        success: true,
        message: `Disconnected ${platform} account successfully`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/social/connect-manual
   */
  connectManualHandle: async (req, res, next) => {
    try {
      const { handle, platform } = req.body;
      const result = await socialLogic.connectManualHandle(req.user.id, handle, platform);
      return res.status(200).json({
        success: true,
        message: `Connected ${result.account.accountName} successfully!`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
