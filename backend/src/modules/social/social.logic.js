import axios from 'axios';
import { instagramPublisherService } from './services/instagramPublisher.service.js';
import { linkedinPublisherService } from './services/linkedinPublisher.service.js';
import { twitterPublisherService } from './services/twitterPublisher.service.js';
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
   * Get LinkedIn OAuth Authorization URL
   */
  getLinkedinAuthUrl: async (userId) => {
    if (!env.LINKEDIN_CLIENT_ID) {
      return {
        configured: false,
        message: 'LinkedIn Client ID is not configured in backend environment variables (.env).',
        authUrl: null,
      };
    }

    const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');
    const authUrl = linkedinPublisherService.getOAuthUrl(state);

    return {
      configured: true,
      authUrl,
    };
  },

  /**
   * Get X (Twitter) OAuth Authorization URL
   */
  getTwitterAuthUrl: async (userId) => {
    if (!env.TWITTER_CLIENT_ID) {
      return {
        configured: false,
        message: 'Twitter Client ID is not configured in backend environment variables (.env).',
        authUrl: null,
      };
    }

    const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');
    const authUrl = twitterPublisherService.getOAuthUrl(state);

    return {
      configured: true,
      authUrl,
    };
  },

  /**
   * Handle Twitter / X OAuth Callback
   */
  handleTwitterCallback: async (code, userId) => {
    // 1. Exchange code for access token
    const { accessToken, refreshToken, tokenExpiresAt } = await twitterPublisherService.exchangeCodeForToken(code);

    // 2. Fetch Twitter user profile
    const profile = await twitterPublisherService.getTwitterProfile(accessToken);

    // 3. Encrypt access token before storing
    const encryptedToken = encryptToken(accessToken);
    const encryptedRefreshToken = refreshToken ? encryptToken(refreshToken) : null;

    // 4. Save to SocialAccount table
    const socialAccount = await socialRepository.upsertAccount({
      userId,
      platform: 'TWITTER',
      platformUserId: profile.platformUserId,
      accountName: `@${profile.username || 'Twitter User'}`,
      accessToken: encryptedToken,
      refreshToken: encryptedRefreshToken,
      tokenExpiresAt,
    });

    return {
      success: true,
      account: {
        id: socialAccount.id,
        platform: socialAccount.platform,
        accountName: socialAccount.accountName,
        isConnected: socialAccount.isConnected,
        profile,
      },
    };
  },

  /**
   * Handle LinkedIn OAuth Callback
   */
  handleLinkedinCallback: async (code, userId) => {
    // 1. Exchange code for access token
    const { accessToken, tokenExpiresAt } = await linkedinPublisherService.exchangeCodeForToken(code);

    // 2. Fetch LinkedIn user profile
    const profile = await linkedinPublisherService.getLinkedinProfile(accessToken);

    // 3. Encrypt access token before storing
    const encryptedToken = encryptToken(accessToken);

    // 4. Save to SocialAccount table
    const socialAccount = await socialRepository.upsertAccount({
      userId,
      platform: 'LINKEDIN',
      platformUserId: profile.personUrn,
      accountName: `@${profile.name || 'LinkedIn User'}`,
      accessToken: encryptedToken,
      tokenExpiresAt,
    });

    return {
      success: true,
      account: {
        id: socialAccount.id,
        platform: socialAccount.platform,
        accountName: socialAccount.accountName,
        isConnected: socialAccount.isConnected,
        profile,
      },
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

        const fbAccount = await socialRepository.upsertAccount({
          userId,
          platform: 'FACEBOOK',
          platformUserId: page.id,
          accountName: `@${page.name || 'Facebook Page'}`,
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
      throw new Error('Valid handle or URL is required.');
    }

    let cleanHandle = handle.trim();
    if (cleanHandle.includes('linkedin.com/in/')) {
      cleanHandle = cleanHandle.split('linkedin.com/in/')[1].split('/')[0].split('?')[0];
    } else if (cleanHandle.includes('linkedin.com/company/')) {
      cleanHandle = cleanHandle.split('linkedin.com/company/')[1].split('/')[0].split('?')[0];
    } else if (cleanHandle.includes('instagram.com/')) {
      cleanHandle = cleanHandle.split('instagram.com/')[1].split('/')[0].split('?')[0];
    } else if (cleanHandle.includes('facebook.com/')) {
      cleanHandle = cleanHandle.split('facebook.com/')[1].split('/')[0].split('?')[0];
    } else if (cleanHandle.includes('x.com/')) {
      cleanHandle = cleanHandle.split('x.com/')[1].split('/')[0].split('?')[0];
    } else if (cleanHandle.includes('twitter.com/')) {
      cleanHandle = cleanHandle.split('twitter.com/')[1].split('/')[0].split('?')[0];
    }
    cleanHandle = cleanHandle.replace(/^@/, '').trim();

    if (!cleanHandle) {
      throw new Error('Please enter a valid handle or profile URL.');
    }

    const formattedHandle = `@${cleanHandle}`;
    const encryptedToken = encryptToken('manual_connected_token');

    let targetPlatform = (platform || 'INSTAGRAM').toUpperCase();
    if (targetPlatform === 'X') targetPlatform = 'TWITTER';

    const socialAccount = await socialRepository.upsertAccount({
      userId,
      platform: targetPlatform,
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