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
    ].join(',');

    const appId = env.META_APP_ID;
    const redirectUri = encodeURIComponent(env.META_REDIRECT_URI);

    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scopes}&state=${state}&response_type=code`;
  },

  /**
   * Exchange Auth Code for 60-day Long-Lived User Access Token
   */
  exchangeCodeForLongLivedToken: async (code) => {
    logger.info('🔑 [InstagramPublisher] Exchanging authorization code for access token...');

    let shortLivedToken = null;

    // 1. Try Exchange via Instagram API Form Payload
    try {
      const formData = new URLSearchParams();
      formData.append('client_id', env.META_APP_ID);
      formData.append('client_secret', env.META_APP_SECRET);
      formData.append('grant_type', 'authorization_code');
      formData.append('redirect_uri', env.META_REDIRECT_URI);
      formData.append('code', code);

      const igTokenRes = await axios.post('https://api.instagram.com/oauth/access_token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      shortLivedToken = igTokenRes.data.access_token;
    } catch (err) {
      logger.warn('ℹ️ Instagram API token exchange fallback to Meta Graph API...');
      const tokenRes = await axios.get(`${META_GRAPH_URL}/oauth/access_token`, {
        params: {
          client_id: env.META_APP_ID,
          client_secret: env.META_APP_SECRET,
          redirect_uri: env.META_REDIRECT_URI,
          code,
        },
      });
      shortLivedToken = tokenRes.data.access_token;
    }

    // 2. Exchange Short-Lived Token for 60-Day Long-Lived Token
    let longLivedToken = shortLivedToken;
    let expiresInSeconds = 60 * 24 * 60 * 60; // 60 days default

    try {
      const longLivedRes = await axios.get(`${META_GRAPH_URL}/access_token`, {
        params: {
          grant_type: 'ig_exchange_token',
          client_secret: env.META_APP_SECRET,
          access_token: shortLivedToken,
        },
      });

      if (longLivedRes.data?.access_token) {
        longLivedToken = longLivedRes.data.access_token;
        expiresInSeconds = longLivedRes.data.expires_in || expiresInSeconds;
      }
    } catch (err) {
      logger.info('ℹ️ Using initial Instagram access token.');
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

    try {
      const pagesRes = await axios.get(`${META_GRAPH_URL}/me/accounts`, {
        params: {
          fields: 'id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}',
          access_token: accessToken,
        },
      });

      const pages = pagesRes.data?.data || [];
      for (const page of pages) {
        if (page.instagram_business_account) {
          return {
            facebookPageId: page.id,
            facebookPageName: page.name,
            pageAccessToken: page.access_token,
            igUserId: page.instagram_business_account.id,
            igUsername: page.instagram_business_account.username || page.name,
            igName: page.instagram_business_account.name || page.name,
            igProfilePictureUrl: page.instagram_business_account.profile_picture_url || null,
          };
        }
      }
    } catch (err) {
      logger.warn('ℹ️ [InstagramPublisher] /me/accounts check deferred, attempting direct /me query...');
    }

    // Fallback: Direct IG user lookup
    try {
      const meRes = await axios.get(`${META_GRAPH_URL}/me`, {
        params: {
          fields: 'id,username,name,profile_picture_url',
          access_token: accessToken,
        },
      });

      if (meRes.data && meRes.data.id) {
        return {
          igUserId: meRes.data.id,
          igUsername: meRes.data.username || meRes.data.name || 'instagram_user',
          igName: meRes.data.name || meRes.data.username || 'Instagram User',
          igProfilePictureUrl: meRes.data.profile_picture_url || null,
        };
      }
    } catch (err) {
      // ignore
    }

    throw new Error(
      'No Instagram Business or Creator account found. Please ensure your Instagram profile is linked to a Facebook Page or configured as a Business account.'
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
