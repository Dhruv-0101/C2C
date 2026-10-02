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
import { getOrSetCache, deleteCachePattern } from '../../common/utils/cache.util.js';
import { CACHE_KEYS, CACHE_TTL } from '../../common/constants/cache.constants.js';
import { findUserById } from '../auth/auth.repository.js';
import { BadRequestError, NotFoundError } from '../../common/errors/custom-errors.js';


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

  // Invalidate user's social accounts cache
  await deleteCachePattern(CACHE_KEYS.SOCIAL_PATTERN(userId));

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
      const igToken = igDetails.pageAccessToken || accessToken;
      const igAccount = await upsertAccount({
        userId,
        platform: SOCIAL_PLATFORMS.INSTAGRAM,
        platformUserId: igDetails.igUserId,
        accountName: `@${igDetails.igUsername}`,
        accessToken: encryptToken(igToken),
        tokenExpiresAt,
      });
      savedAccounts.push(igAccount);
      logger.info(`✅ [SocialLogic] Connected Instagram Account (@${igDetails.igUsername}) successfully!`);
    }
  } catch (err) {
    logger.warn('ℹ️ [SocialLogic] Instagram lookup warning:', err.message);
  }

  // Invalidate user's social accounts cache
  await deleteCachePattern(CACHE_KEYS.SOCIAL_PATTERN(userId));

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
 * Get connected social accounts for logged-in user with pagination (Redis Cached)
 *
 * @param {string} userId - User ID
 * @param {Object} [queryParams={}] - Query parameters for pagination and sorting
 * @returns {Promise<{ data: { accounts: Array }, meta: Object }>}
 */
export const getUserAccounts = async (userId, queryParams = {}) => {
  const cacheKey = CACHE_KEYS.SOCIAL_ACCOUNTS_LIST(userId, queryParams);

  return getOrSetCache(
    cacheKey,
    async () => {
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
    },
    CACHE_TTL.ONE_HOUR
  );
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

  // Invalidate user's social accounts cache
  await deleteCachePattern(CACHE_KEYS.SOCIAL_PATTERN(userId));

  return { success: true, platform: platformUpper };
};

/**
 * Admin Connect Meta System User / Page Token for a Specific Client Tenant
 *
 * @param {Object} params
 * @param {string} params.userId - Target client user ID
 * @param {string} params.token - Meta System User or Page Access Token
 * @returns {Promise<{ success: boolean, message: string, data: Object }>}
 */
export const adminConnectUserToken = async ({ userId, token }) => {
  const targetUser = await findUserById(userId);
  if (!targetUser) {
    throw new NotFoundError(`Target user with ID '${userId}' not found.`);
  }

  // 1. Verify token with Meta Graph API
  let metaProfile = null;
  try {
    const meRes = await axios.get('https://graph.facebook.com/v19.0/me', {
      params: { access_token: token },
    });
    metaProfile = meRes.data;
  } catch (err) {
    logger.error('❌ [AdminConnectMeta] Token verification failed:', err.response?.data || err.message);
    const metaErrorMsg = err.response?.data?.error?.message || err.message;
    throw new BadRequestError(`Invalid Meta Token: ${metaErrorMsg}`);
  }

  // 2. Fetch Facebook Pages assigned to this token
  const pages = [];
  try {
    const pagesRes = await axios.get('https://graph.facebook.com/v19.0/me/accounts', {
      params: {
        fields: 'id,name,access_token,tasks',
        access_token: token,
      },
    });
    if (Array.isArray(pagesRes.data?.data) && pagesRes.data.data.length > 0) {
      pages.push(...pagesRes.data.data);
    }
  } catch (err) {
    logger.warn('ℹ️ [AdminConnectMeta] /me/accounts check warning:', err.response?.data || err.message);
  }

  // If no pages returned via /me/accounts, check if token directly belongs to a page
  if (pages.length === 0 && metaProfile?.id) {
    try {
      const directPageRes = await axios.get(`https://graph.facebook.com/v19.0/${metaProfile.id}`, {
        params: {
          fields: 'id,name,category',
          access_token: token,
        },
      });
      if (directPageRes.data?.id && directPageRes.data?.name) {
        pages.push({
          id: directPageRes.data.id,
          name: directPageRes.data.name,
          access_token: token,
        });
      }
    } catch {}
  }

  if (pages.length === 0) {
    throw new BadRequestError(
      'No Facebook Page found for this token. Please ensure the System User has been assigned the client Page asset in Meta Business Suite.'
    );
  }

  const primaryPage = pages[0];
  const pageToken = primaryPage.access_token || token;

  // 3. Fetch linked Instagram Business account
  let igAccount = null;
  try {
    const pageDetailsRes = await axios.get(`https://graph.facebook.com/v19.0/${primaryPage.id}`, {
      params: {
        fields: 'id,name,instagram_business_account{id,username,name}',
        access_token: pageToken,
      },
    });
    igAccount = pageDetailsRes.data?.instagram_business_account || null;
  } catch (igErr) {
    logger.warn('ℹ️ [AdminConnectMeta] Linked Instagram check warning:', igErr.response?.data || igErr.message);
  }

  // 4. Save to SocialAccount table (Encrypted)
  const savedAccounts = [];

  // Upsert Facebook Page
  const fbAccount = await upsertAccount({
    userId,
    platform: SOCIAL_PLATFORMS.FACEBOOK,
    platformUserId: primaryPage.id,
    accountName: `@${primaryPage.name}`,
    accessToken: encryptToken(pageToken),
    isConnected: true,
    tokenExpiresAt: null,
  });
  savedAccounts.push(sanitizeSocialAccount(fbAccount));

  // Upsert Instagram if linked
  if (igAccount?.id) {
    const igRecord = await upsertAccount({
      userId,
      platform: SOCIAL_PLATFORMS.INSTAGRAM,
      platformUserId: igAccount.id,
      accountName: `@${igAccount.username || igAccount.name}`,
      accessToken: encryptToken(pageToken),
      isConnected: true,
      tokenExpiresAt: null,
    });
    savedAccounts.push(sanitizeSocialAccount(igRecord));
  }

  // Invalidate Redis cache for user's social accounts
  await deleteCachePattern(CACHE_KEYS.SOCIAL_PATTERN(userId));

  logger.info(
    `✅ [AdminConnectMeta] Successfully connected Meta assets for user ${targetUser.email} (Page: ${primaryPage.name}, IG: ${igAccount?.username || 'None'})`
  );

  return {
    success: true,
    message: igAccount
      ? `Connected Facebook Page '${primaryPage.name}' and Instagram '@${igAccount.username}' for ${targetUser.fullName || targetUser.email}!`
      : `Connected Facebook Page '${primaryPage.name}' for ${targetUser.fullName || targetUser.email}! (No Instagram account was linked to this page)`,
    data: {
      page: {
        id: primaryPage.id,
        name: primaryPage.name,
      },
      instagram: igAccount
        ? {
            id: igAccount.id,
            username: igAccount.username,
            name: igAccount.name,
          }
        : null,
      accounts: savedAccounts,
    },
  };
};

/**
 * Admin Disconnect a Specific User's Social Platform
 *
 * @param {string} userId - Target client user ID
 * @param {string} platform - Social platform to disconnect
 * @returns {Promise<{ success: boolean, platform: string, userId: string }>}
 */
export const adminDisconnectUserAccount = async (userId, platform) => {
  const targetUser = await findUserById(userId);
  if (!targetUser) {
    throw new NotFoundError(`Target user with ID '${userId}' not found.`);
  }

  const platformUpper = platform.toUpperCase();
  await deleteAccount(userId, platformUpper);

  // Invalidate user's social accounts cache
  await deleteCachePattern(CACHE_KEYS.SOCIAL_PATTERN(userId));

  return { success: true, platform: platformUpper, userId };
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
  adminConnectUserToken,
  adminDisconnectUserAccount,
};