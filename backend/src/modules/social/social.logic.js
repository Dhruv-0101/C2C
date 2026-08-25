import axios from 'axios';
import { instagramPublisherService } from './services/instagramPublisher.service.js';
import { socialRepository } from './social.repository.js';
import { encryptToken } from '../../common/helpers/encryption.helper.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

export const socialLogic = {
  /**
   * Get Meta / Instagram OAuth Authorization URL
   */
  getInstagramAuthUrl: async (userId) => {
    if (!env.META_APP_ID) {
      return {
        configured: false,
        message: 'Meta App ID is not configured in backend environment variables (.env).',
        authUrl: null,
      };
    }

    const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');
    const authUrl = instagramPublisherService.getOAuthUrl(state);

    return {
      configured: true,
      authUrl,
    };
  },

  /**
   * Handle Meta OAuth Redirect Callback & Store Encrypted Tokens
   */
  handleMetaCallback: async (code, userId) => {
    // 1. Exchange code for long-lived 60-day token
    const { accessToken, tokenExpiresAt } = await instagramPublisherService.exchangeCodeForLongLivedToken(code);

    let savedAccounts = [];

    // 2. Fetch Facebook Pages managed by Meta User and save Facebook Page connection
    try {
      const pagesRes = await axios.get('https://graph.facebook.com/v19.0/me/accounts', {
        params: {
          fields: 'id,name,access_token',
          access_token: accessToken,
        },
      });

      const pages = pagesRes.data?.data || [];
      if (pages.length > 0) {
        const page = pages[0]; // first managed page
        const pageToken = page.access_token || accessToken;

        const cleanFbName = (page.name || 'facebook_page')
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '_')
          .replace(/_+/g, '_');

        const fbAccount = await socialRepository.upsertAccount({
          userId,
          platform: 'FACEBOOK',
          platformUserId: page.id,
          accountName: `@${cleanFbName}`,
          accessToken: encryptToken(pageToken),
          tokenExpiresAt,
        });

        savedAccounts.push(fbAccount);
        logger.info(`✅ [SocialLogic] Connected Facebook Page '${page.name}' (ID: ${page.id}) successfully!`);
      }
    } catch (err) {
      logger.warn('ℹ️ [SocialLogic] /me/accounts check warning:', err.response?.data || err.message);
    }

    // 3. Try to fetch connected Instagram Business account details
    try {
      const igDetails = await instagramPublisherService.getInstagramAccountDetails(accessToken);
      if (igDetails && igDetails.igUserId) {
        const igAccount = await socialRepository.upsertAccount({
          userId,
          platform: 'INSTAGRAM',
          platformUserId: igDetails.igUserId,
          accountName: `@${igDetails.igUsername}`,
          accessToken: encryptToken(accessToken),
          tokenExpiresAt,
        });
        savedAccounts.push(igAccount);
        logger.info(`✅ [SocialLogic] Connected Instagram Account (@${igDetails.igUsername}) successfully!`);
      }
    } catch (err) {
      logger.warn('ℹ️ [SocialLogic] Instagram lookup warning:', err.message);
    }

    const primaryAccount = savedAccounts[0];
    const accountName = primaryAccount ? primaryAccount.accountName : '@meta_account';

    return {
      success: true,
      account: {
        accountName,
        savedCount: savedAccounts.length,
      },
    };
  },

  /**
   * Get all connected social accounts for logged-in user (sanitized)
   */
  getUserAccounts: async (userId) => {
    const accounts = await socialRepository.findAllByUserId(userId);

    // Sanitize response so encrypted access tokens are never returned to frontend
    return accounts.map((acc) => ({
      id: acc.id,
      platform: acc.platform,
      accountName: acc.accountName,
      platformUserId: acc.platformUserId,
      isConnected: acc.isConnected,
      tokenExpiresAt: acc.tokenExpiresAt,
      createdAt: acc.createdAt,
    }));
  },

  /**
   * Disconnect social account platform
   */
  disconnectAccount: async (userId, platform) => {
    const platformUpper = platform.toUpperCase();
    await socialRepository.deleteAccount(userId, platformUpper);
    return { success: true, platform: platformUpper };
  },

  /**
   * Connect Social Account Manually by Handle (for Instant Setup / Direct Connection)
   */
  connectManualHandle: async (userId, handle, platform = 'INSTAGRAM') => {
    if (!handle || typeof handle !== 'string') {
      throw new Error('Valid Instagram handle is required.');
    }

    const cleanHandle = handle.trim().replace(/^@/, '');
    if (!cleanHandle) {
      throw new Error('Please enter a valid Instagram handle.');
    }

    const formattedHandle = `@${cleanHandle}`;
    const encryptedToken = encryptToken('manual_connected_token');

    const socialAccount = await socialRepository.upsertAccount({
      userId,
      platform: (platform || 'INSTAGRAM').toUpperCase(),
      platformUserId: `manual_${userId}_${cleanHandle}`,
      accountName: formattedHandle,
      accessToken: encryptedToken,
    });

    return {
      success: true,
      account: {
        id: socialAccount.id,
        platform: socialAccount.platform,
        accountName: socialAccount.accountName,
        isConnected: socialAccount.isConnected,
      },
    };
  },
};