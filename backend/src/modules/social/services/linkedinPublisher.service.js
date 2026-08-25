import axios from 'axios';
import { logger } from '../../../config/logger.js';
import { env } from '../../../config/env.js';

const LINKEDIN_API_URL = 'https://api.linkedin.com/v2';
const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2';

export const linkedinPublisherService = {
  /**
   * Generate LinkedIn OAuth 2.0 Authorization URL
   */
  getOAuthUrl: (state) => {
    const clientId = env.LINKEDIN_CLIENT_ID;
    const redirectUri = encodeURIComponent(env.LINKEDIN_REDIRECT_URI);
    const scopes = encodeURIComponent('openid profile email w_member_social');

    return `${LINKEDIN_AUTH_URL}/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scopes}&prompt=login`;
  },

  /**
   * Exchange Auth Code for User Access Token
   */
  exchangeCodeForToken: async (code) => {
    logger.info('🔑 [LinkedinPublisher] Exchanging authorization code for LinkedIn access token...');

    try {
      const response = await axios.post(
        `${LINKEDIN_AUTH_URL}/accessToken`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: env.LINKEDIN_REDIRECT_URI,
          client_id: env.LINKEDIN_CLIENT_ID,
          client_secret: env.LINKEDIN_CLIENT_SECRET,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const accessToken = response.data?.access_token;
      const expiresIn = response.data?.expires_in; // seconds
      const tokenExpiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

      return {
        accessToken,
        tokenExpiresAt,
      };
    } catch (err) {
      const errorMsg = err.response?.data?.error_description || err.message;
      logger.error(`❌ [LinkedinPublisher] LinkedIn token exchange failed: ${errorMsg}`);
      throw new Error(`LinkedIn authorization failed: ${errorMsg}`);
    }
  },

  /**
   * Get authenticated user profile & LinkedIn URN (urn:li:person:xxx)
   */
  getLinkedinProfile: async (accessToken) => {
    logger.info('🔍 [LinkedinPublisher] Fetching LinkedIn user profile details...');

    try {
      const response = await axios.get(`${LINKEDIN_API_URL}/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const profile = response.data;
      const personUrn = `urn:li:person:${profile.sub}`;
      const name = profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || 'LinkedIn User';

      logger.info(`✅ [LinkedinPublisher] Resolved LinkedIn user profile: ${name} (${personUrn})`);

      return {
        personUrn,
        name,
        email: profile.email || null,
        picture: profile.picture || null,
      };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      logger.warn(`ℹ️ [LinkedinPublisher] /userinfo lookup error: ${errorMsg}`);
      throw new Error(`Failed to fetch LinkedIn profile: ${errorMsg}`);
    }
  },

  /**
   * Publish Photo & Post Caption to LinkedIn via Posts API / UGC Posts API
   */
  publishToLinkedin: async ({ personUrn, accessToken, graphicUrl, caption }) => {
    logger.info(`📢 [LinkedinPublisher] Publishing post for LinkedIn URN: ${personUrn}...`);

    if (!personUrn) {
      throw new Error('Valid LinkedIn person URN (urn:li:person:xxx) is required for posting.');
    }

    try {
      const payload = {
        author: personUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: caption || 'Created with BrandFlow 🚀',
            },
            shareMediaCategory: graphicUrl ? 'IMAGE' : 'NONE',
            media: graphicUrl
              ? [
                  {
                    status: 'READY',
                    description: { text: caption || 'BrandFlow Graphic' },
                    originalUrl: graphicUrl,
                    title: { text: 'BrandFlow Social Post' },
                  },
                ]
              : [],
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      };

      const response = await axios.post(`${LINKEDIN_API_URL}/ugcPosts`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json',
        },
      });

      const postId = response.data?.id;
      const cleanId = postId ? postId.replace('urn:li:share:', '').replace('urn:li:ugcPost:', '') : '';
      const postUrl = cleanId ? `https://www.linkedin.com/feed/update/${postId}` : 'https://www.linkedin.com/feed';

      logger.info(`🎉 [LinkedinPublisher] Successfully published post to LinkedIn! Post ID: ${postId}`);

      return {
        status: 'SUCCESS',
        platform: 'LINKEDIN',
        postId,
        postUrl,
        publishedAt: new Date().toISOString(),
      };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      logger.error(`❌ [LinkedinPublisher] LinkedIn posting error: ${errorMsg}`);
      throw new Error(`LinkedIn API error: ${errorMsg}`);
    }
  },
};
