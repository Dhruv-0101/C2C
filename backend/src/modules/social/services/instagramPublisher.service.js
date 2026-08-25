import axios from 'axios';
import { logger } from '../../../config/logger.js';
import { env } from '../../../config/env.js';

const META_GRAPH_URL = 'https://graph.facebook.com/v19.0';

export const instagramPublisherService = {
  /**
   * Generate Meta OAuth Login Authorization URL for Instagram Business
   */
  getOAuthUrl: (state) => {
    const scopes = [
      'public_profile',
      'instagram_basic',
      'instagram_content_publish',
      'pages_show_list',
      'pages_read_engagement',
      'business_management',
    ].join(',');

    const appId = env.META_APP_ID;
    const redirectUri = encodeURIComponent(env.META_REDIRECT_URI);

    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scopes}&state=${state}&response_type=code&auth_type=rerequest`;
  },

  /**
   * Exchange Auth Code for 60-day Long-Lived User Access Token
   */
  exchangeCodeForLongLivedToken: async (code) => {
    logger.info('🔑 [InstagramPublisher] Exchanging authorization code for access token...');

    // Clean code if Meta appended `#_`
    const cleanCode = code ? String(code).replace(/#_$/, '') : code;

    // 1. Exchange Auth Code for Access Token via Meta Graph API
    let shortLivedToken = null;
    try {
      const tokenRes = await axios.get(`${META_GRAPH_URL}/oauth/access_token`, {
        params: {
          client_id: env.META_APP_ID,
          client_secret: env.META_APP_SECRET,
          redirect_uri: env.META_REDIRECT_URI,
          code: cleanCode,
        },
      });

      shortLivedToken = tokenRes.data?.access_token;
    } catch (err) {
      const metaErrorMsg = err.response?.data?.error?.message || err.message;
      logger.error(`❌ Meta OAuth code exchange failed: ${metaErrorMsg}`);
      throw new Error(`Meta authorization failed: ${metaErrorMsg}`);
    }

    if (!shortLivedToken) {
      throw new Error('Failed to retrieve access token from Meta OAuth response.');
    }

    // 2. Exchange Short-Lived Token for 60-Day Long-Lived Token
    let longLivedToken = shortLivedToken;
    let expiresInSeconds = 60 * 24 * 60 * 60; // 60 days default

    try {
      const longLivedRes = await axios.get(`${META_GRAPH_URL}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: env.META_APP_ID,
          client_secret: env.META_APP_SECRET,
          fb_exchange_token: shortLivedToken,
        },
      });

      if (longLivedRes.data?.access_token) {
        longLivedToken = longLivedRes.data.access_token;
        expiresInSeconds = longLivedRes.data.expires_in || expiresInSeconds;
        logger.info('✅ Successfully upgraded to 60-day Long-Lived Access Token.');
      }
    } catch (err) {
      logger.info('ℹ️ Using short-lived Meta access token.');
    }

    const tokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    return {
      accessToken: longLivedToken,
      tokenExpiresAt,
    };
  },

  /**
   * Fetch connected Instagram Business Account details linked to User's Facebook Pages
   */
  getInstagramAccountDetails: async (accessToken) => {
    logger.info('🔍 [InstagramPublisher] Fetching Instagram Business Account details from Meta Graph...');

    let debugDetails = [];

    // 1. Check Facebook Pages managed by user and their linked instagram_business_account
    try {
      const pagesRes = await axios.get(`${META_GRAPH_URL}/me/accounts`, {
        params: {
          fields: 'id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}',
          access_token: accessToken,
        },
      });

      const pages = pagesRes.data?.data || [];
      if (pages.length === 0) {
        debugDetails.push('No Facebook Pages were returned for this account.');
      }

      for (const page of pages) {
        let igAccount = page.instagram_business_account;

        // Try direct page lookup if inline field was omitted by Graph API
        if (!igAccount && page.id) {
          try {
            const pageDetailRes = await axios.get(`${META_GRAPH_URL}/${page.id}`, {
              params: {
                fields: 'id,name,instagram_business_account{id,username,name,profile_picture_url}',
                access_token: page.access_token || accessToken,
              },
            });
            igAccount = pageDetailRes.data?.instagram_business_account;
          } catch (e) {
            // ignore
          }
        }

        if (igAccount && igAccount.id) {
          logger.info(`✅ Found Instagram Business Account (@${igAccount.username || page.name}) linked to Facebook Page '${page.name}'`);
          return {
            facebookPageId: page.id,
            facebookPageName: page.name,
            pageAccessToken: page.access_token || accessToken,
            igUserId: igAccount.id,
            igUsername: igAccount.username || page.name,
            igName: igAccount.name || page.name,
            igProfilePictureUrl: igAccount.profile_picture_url || null,
          };
        } else {
          debugDetails.push(`Facebook Page '${page.name}' has no Instagram account linked.`);
        }
      }
    } catch (err) {
      logger.warn('ℹ️ [InstagramPublisher] /me/accounts check warning:', err.response?.data || err.message);
    }

    // 2. Direct user query fallback using valid Meta User fields ('id,name')
    try {
      const userRes = await axios.get(`${META_GRAPH_URL}/me`, {
        params: {
          fields: 'id,name',
          access_token: accessToken,
        },
      });

      if (userRes.data?.id) {
        const cleanName = (userRes.data.name || 'meta_user')
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '_')
          .replace(/_+/g, '_');

        logger.info(`✅ [InstagramPublisher] Linking authenticated Meta identity (@${cleanName}) for user ID: ${userRes.data.id}`);
        return {
          igUserId: userRes.data.id,
          igUsername: cleanName,
          igName: userRes.data.name || 'Meta User',
          igProfilePictureUrl: null,
          isFallback: true,
        };
      }
    } catch (err) {
      logger.warn('ℹ️ [InstagramPublisher] /me direct query warning:', err.response?.data || err.message);
    }

    const detailText = debugDetails.length > 0 ? ` (${debugDetails.join(' ')})` : '';

    throw new Error(
      `No Instagram Business or Creator account found${detailText}. Please ensure your Instagram profile is converted to a Business/Creator account and linked to a Facebook Page.`
    );
  },

  /**
   * Publish Graphic Image & Caption to Instagram Business via Meta Graph Container API
   *
   * @param {Object} params
   * @param {string} params.igUserId - Instagram Business User ID
   * @param {string} params.accessToken - Page or Long-Lived User Access Token
   * @param {string} params.graphicUrl - Public Cloudinary PNG image URL
   * @param {string} params.caption - Post caption & hashtags
   */
  publishToInstagram: async ({ igUserId, accessToken, graphicUrl, caption }) => {
    logger.info(`📸 [InstagramPublisher] Publishing media container to IG User ID: ${igUserId}...`);

    if (!graphicUrl) {
      throw new Error('Valid public graphic image URL is required for Instagram posting.');
    }

    // Step 1: Create Instagram Media Container
    const containerRes = await axios.post(
      `${META_GRAPH_URL}/${igUserId}/media`,
      null,
      {
        params: {
          image_url: graphicUrl,
          caption: caption || 'Created with BrandFlow 🚀',
          access_token: accessToken,
        },
      }
    );

    const containerId = containerRes.data.id;
    logger.info(`📦 [InstagramPublisher] Container created successfully. ID: ${containerId}`);

    // Pause 3 seconds for Meta server-side media processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Step 2: Publish Container to Instagram Feed
    const publishRes = await axios.post(
      `${META_GRAPH_URL}/${igUserId}/media_publish`,
      null,
      {
        params: {
          creation_id: containerId,
          access_token: accessToken,
        },
      }
    );

    const mediaId = publishRes.data.id;
    const postUrl = `https://instagram.com/p/${mediaId}`;

    logger.info(`🎉 [InstagramPublisher] Successfully published post to Instagram! Post ID: ${mediaId}`);

    return {
      status: 'SUCCESS',
      platform: 'INSTAGRAM',
      mediaId,
      postUrl,
      publishedAt: new Date().toISOString(),
    };
  },
};
