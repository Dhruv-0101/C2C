import { instagramPublisherService } from './services/instagramPublisher.service.js';
import { socialRepository } from './social.repository.js';
import { encryptToken } from '../../common/helpers/encryption.helper.js';
import { env } from '../../config/env.js';

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

    // 2. Fetch connected Instagram account details
    const igDetails = await instagramPublisherService.getInstagramAccountDetails(accessToken);

    // 3. Encrypt access token before storing in database
    const encryptedAccessToken = encryptToken(accessToken);

    // 4. Save Instagram Account to database in SocialAccount table
    const socialAccount = await socialRepository.upsertAccount({
      userId,
      platform: 'INSTAGRAM',
      platformUserId: igDetails.igUserId,
      accountName: `@${igDetails.igUsername}`,
      accessToken: encryptedAccessToken,
      tokenExpiresAt,
    });

    // 5. Also save Facebook Page Account if managed page is present
    if (igDetails.facebookPageId && igDetails.facebookPageName) {
      const pageToken = igDetails.pageAccessToken || accessToken;
      const encryptedPageToken = encryptToken(pageToken);
      const cleanFbName = (igDetails.facebookPageName || 'Facebook Page')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_');

      await socialRepository.upsertAccount({
        userId,
        platform: 'FACEBOOK',
        platformUserId: igDetails.facebookPageId,
        accountName: `@${cleanFbName}`,
        accessToken: encryptedPageToken,
        tokenExpiresAt,
      });
    }

    return {
      success: true,
      account: {
        id: socialAccount.id,
        platform: socialAccount.platform,
        accountName: socialAccount.accountName,
        isConnected: socialAccount.isConnected,
        igDetails,
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