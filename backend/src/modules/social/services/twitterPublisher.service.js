import axios from 'axios';
import { logger } from '../../../config/logger.js';
import { env } from '../../../config/env.js';

const TWITTER_API_V2_URL = 'https://api.twitter.com/2';
const TWITTER_AUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const TWITTER_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';

/**
 * Enterprise X (Twitter) Publisher Service
 * Handles OAuth 2.0 PKCE authentication, profile fetching, and post publishing.
 */
export const twitterPublisherService = {
  /**
   * Generate X (Twitter) OAuth 2.0 Authorization URL with PKCE
   * @param {string} state - Base64 encoded state string containing userId
   * @param {string} [codeChallenge='challenge'] - PKCE code challenge
   * @returns {string} Twitter OAuth authorization URL
   */
  getOAuthUrl: (state, codeChallenge = 'challenge') => {
    const clientId = env.TWITTER_CLIENT_ID;
    const redirectUri = encodeURIComponent(env.TWITTER_REDIRECT_URI);
    const scopes = encodeURIComponent('tweet.read tweet.write users.read offline.access');

    return `${TWITTER_AUTH_URL}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=plain`;
  },

  /**
   * Exchange Auth Code for User Access Token
   * @param {string} code - OAuth authorization code
   * @param {string} [codeVerifier='challenge'] - PKCE code verifier
   * @returns {Promise<{accessToken: string, refreshToken?: string, tokenExpiresAt: Date|null}>}
   */
  exchangeCodeForToken: async (code, codeVerifier = 'challenge') => {
    logger.info('🔑 [TwitterPublisher] Exchanging authorization code for Twitter User Access Token...');

    try {
      const params = new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: env.TWITTER_CLIENT_ID,
        redirect_uri: env.TWITTER_REDIRECT_URI,
        code_verifier: codeVerifier,
      });

      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      if (env.TWITTER_CLIENT_SECRET) {
        const credentials = `${env.TWITTER_CLIENT_ID}:${env.TWITTER_CLIENT_SECRET}`;
        headers.Authorization = `Basic ${Buffer.from(credentials).toString('base64')}`;
      }

      const response = await axios.post(TWITTER_TOKEN_URL, params.toString(), { headers });

      const accessToken = response.data?.access_token;
      const refreshToken = response.data?.refresh_token;
      const expiresIn = response.data?.expires_in; // seconds
      const tokenExpiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

      if (!accessToken) {
        throw new Error('Twitter API response did not contain an access token.');
      }

      return {
        accessToken,
        refreshToken,
        tokenExpiresAt,
      };
    } catch (err) {
      const errorMsg = err.response?.data?.error_description || err.response?.data?.error || err.message;
      logger.error(`❌ [TwitterPublisher] Twitter token exchange failed: ${errorMsg}`);
      throw new Error(`Twitter authorization failed: ${errorMsg}`);
    }
  },

  /**
   * Get authenticated X user profile details
   * @param {string} accessToken - Decrypted Twitter access token
   * @returns {Promise<{platformUserId: string, name: string, username: string}>}
   */
  getTwitterProfile: async (accessToken) => {
    logger.info('🔍 [TwitterPublisher] Fetching X (Twitter) user profile details...');

    try {
      const response = await axios.get(`${TWITTER_API_V2_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const user = response.data?.data;
      if (!user || !user.id) {
        throw new Error('Invalid user profile response from Twitter API.');
      }

      logger.info(`✅ [TwitterPublisher] Resolved X user profile: @${user.username} (${user.name})`);

      return {
        platformUserId: user.id,
        name: user.name,
        username: user.username,
      };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || err.message;
      logger.warn(`ℹ️ [TwitterPublisher] /users/me lookup error: ${errorMsg}`);
      throw new Error(`Failed to fetch Twitter profile: ${errorMsg}`);
    }
  },

  /**
   * Publish Tweet with optional image media/URL to X (Twitter)
   * @param {object} params
   * @param {string} params.accessToken - Decrypted OAuth access token
   * @param {string} [params.graphicUrl] - Graphic / image URL to include in tweet
   * @param {string} params.caption - Tweet text content
   * @returns {Promise<{status: string, platform: string, postId: string, postUrl: string, publishedAt: string}>}
   */
  publishToTwitter: async ({ accessToken, graphicUrl, caption }) => {
    logger.info('📢 [TwitterPublisher] Publishing post to X (Twitter)...');

    // Standardize tweet text content (Twitter 280 character limit note: URLs consume ~23 chars)
    let tweetText = caption || 'Created with BrandFlow 🚀';
    if (graphicUrl && !tweetText.includes(graphicUrl)) {
      tweetText = `${tweetText}\n\n${graphicUrl}`;
    }

    try {
      const payload = {
        text: tweetText,
      };

      const response = await axios.post(`${TWITTER_API_V2_URL}/tweets`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const tweetId = response.data?.data?.id;
      const postUrl = tweetId ? `https://x.com/i/status/${tweetId}` : 'https://x.com';

      logger.info(`🎉 [TwitterPublisher] Successfully published post to X! Tweet ID: ${tweetId}`);

      return {
        status: 'SUCCESS',
        platform: 'TWITTER',
        postId: tweetId || `tw_${Date.now()}`,
        postUrl,
        publishedAt: new Date().toISOString(),
      };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.title || err.message;
      logger.error(`❌ [TwitterPublisher] Twitter posting error: ${errorMsg}`);
      throw new Error(`Twitter API error: ${errorMsg}`);
    }
  },
};
