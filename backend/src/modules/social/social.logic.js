import axios from 'axios';
import { instagramPublisherService } from './services/instagramPublisher.service.js';
import { linkedinPublisherService } from './services/linkedinPublisher.service.js';
import {
  upsertAccount,
  findPaginatedByUserId,
  deleteAccount,
} from './social.repository.js';
import {
  sanitizeSocialAccount,
  sanitizeSocialAccounts,
} from './social.helper.js';
import { SOCIAL_PLATFORMS } from './social.constants.js';
import { encryptToken } from '../../common/helpers/encryption.helper.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../common/helpers/pagination.helper.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

/**
 * Get Meta / Instagram OAuth Authorization URL
 *
 * @param {string} userId - User ID
 * @param {string} clientUrl - Client callback base URL
 * @returns {Promise<{ configured: boolean, authUrl: string|null, message?: string }>}
 */
export const getInstagramAuthUrl = async (userId, clientUrl) => {
  if (!env.META_APP_ID) {
    return {
      configured: false,
      message: 'Meta App ID is not configured in backend environment variables (.env).',
      authUrl: null,
    };
  }

  const state = Buffer.from(JSON.stringify({ userId, clientUrl, timestamp: Date.now() })).toString('base64');
  const authUrl = instagramPublisherService.getOAuthUrl(state);

  return {
    configured: true,
    authUrl,
  };
};

/**
 * Get LinkedIn OAuth Authorization URL
 *
 * @param {string} userId - User ID
 * @param {string} clientUrl - Client callback base URL
 * @returns {Promise<{ configured: boolean, authUrl: string|null, message?: string }>}
 */
export const getLinkedinAuthUrl = async (userId, clientUrl) => {
  if (!env.LINKEDIN_CLIENT_ID) {
    return {
      configured: false,
      message: 'LinkedIn Client ID is not configured in backend environment variables (.env).',
      authUrl: null,
    };
  }

  const state = Buffer.from(JSON.stringify({ userId, clientUrl, timestamp: Date.now() })).toString('base64');
  const authUrl = linkedinPublisherService.getOAuthUrl(state);

  return {
    configured: true,
    authUrl,
  };
};

/**
 * Handle LinkedIn OAuth Callback
 *
 * @param {string} code - OAuth authorization code
 * @param {string} userId - Authenticated user ID
 * @returns {Promise<{ success: boolean, account: Object }>}
 */
export const handleLinkedinCallback = async (code, userId) => {
  // 1. Exchange code for access token
  const { accessToken, tokenExpiresAt } = await linkedinPublisherService.exchangeCodeForToken(code);

  // 2. Fetch LinkedIn user profile
  const profile = await linkedinPublisherService.getLinkedinProfile(accessToken);

  // 3. Encrypt access token before storing
  const encryptedToken = encryptToken(accessToken);

  // 4. Save to SocialAccount table
  const socialAccount = await upsertAccount({
    userId,
    platform: SOCIAL_PLATFORMS.LINKEDIN,
    platformUserId: profile.personUrn,
    accountName: `@${profile.name || 'LinkedIn User'}`,
    accessToken: encryptedToken,
    tokenExpiresAt,
  });

  return {
    success: true,
    account: {
      ...sanitizeSocialAccount(socialAccount),
      profile,
    },
  };
};

/**
 * Handle Meta OAuth Redirect Callback & Store Encrypted Tokens
 *
 * @param {string} code - OAuth authorization code
 * @param {string} userId - Authenticated user ID
 * @returns {Promise<{ success: boolean, account: { accountName: string, savedCount: number } }>}
 */
export const handleMetaCallback = async (code, userId) => {
  // 1. Exchange code for long-lived 60-day token
  const { accessToken, tokenExpiresAt } = await instagramPublisherService.exchangeCodeForLongLivedToken(code);

  const savedAccounts = [];

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

      const fbAccount = await upsertAccount({
        userId,
        platform: SOCIAL_PLATFORMS.FACEBOOK,
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
      const igAccount = await upsertAccount({
        userId,
        platform: SOCIAL_PLATFORMS.INSTAGRAM,
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
};

/**
 * Get connected social accounts for logged-in user with pagination (strictly sanitized)
 *
 * @param {string} userId - User ID
 * @param {Object} [queryParams={}] - Query parameters for pagination and sorting
 * @returns {Promise<{ data: { accounts: Array }, meta: Object }>}
 */
export const getUserAccounts = async (userId, queryParams = {}) => {
  const pagination = parsePaginationParams(queryParams);
  const { accounts, totalCount } = await findPaginatedByUserId(userId, pagination);

  // Strict OWASP Data Minimization: Access tokens and secrets never leave backend
  const sanitizedAccounts = sanitizeSocialAccounts(accounts);

  const paginatedResponse = buildPaginatedResponse({
    items: sanitizedAccounts,
    totalCount,
    page: pagination.page,
    limit: pagination.limit,
  });

  return {
    data: {
      accounts: paginatedResponse.data,
    },
    meta: paginatedResponse.meta,
  };
};

/**
 * Disconnect social account platform
 *
 * @param {string} userId - User ID
 * @param {string} platform - Social platform to disconnect
 * @returns {Promise<{ success: boolean, platform: string }>}
 */
export const disconnectAccount = async (userId, platform) => {
  const platformUpper = platform.toUpperCase();
  await deleteAccount(userId, platformUpper);
  return { success: true, platform: platformUpper };
};

/**
 * Social Logic singleton for backward-compatible consumption
 */
export const socialLogic = {
  getInstagramAuthUrl,
  getLinkedinAuthUrl,
  handleLinkedinCallback,
  handleMetaCallback,
  getUserAccounts,
  disconnectAccount,
};