import axios from 'axios';
import { logger } from '../../../config/logger.js';
import { env } from '../../../config/env.js';

const TWITTER_API_V2_URL = 'https://api.twitter.com/2';
const TWITTER_AUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const TWITTER_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';

/**
 * Enterprise X (Twitter) Publisher Service
 * Handles OAuth 2.0 PKCE authentication, profile fetching, token refresh, and post publishing.
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
   * Refresh Expired OAuth 2.0 User Access Token using Refresh Token
   * @param {string} refreshToken - Decrypted Twitter refresh token
   * @returns {Promise<{accessToken: string, refreshToken?: string, tokenExpiresAt: Date|null}>}
   */
  refreshAccessToken: async (refreshToken) => {
    logger.info('🔄 [TwitterPublisher] Refreshing expired Twitter access token...');

    try {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: env.TWITTER_CLIENT_ID,
      });

      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      if (env.TWITTER_CLIENT_SECRET) {
        const credentials = `${env.TWITTER_CLIENT_ID}:${env.TWITTER_CLIENT_SECRET}`;
        headers.Authorization = `Basic ${Buffer.from(credentials).toString('base64')}`;
      }

      const response = await axios.post(TWITTER_TOKEN_URL, params.toString(), { headers });

      const newAccessToken = response.data?.access_token;
      const newRefreshToken = response.data?.refresh_token || refreshToken;
      const expiresIn = response.data?.expires_in;
      const tokenExpiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

      if (!newAccessToken) {
        throw new Error('Twitter token refresh response did not contain an access token.');
      }

      logger.info('✅ [TwitterPublisher] Successfully refreshed Twitter access token.');

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        tokenExpiresAt,
      };
    } catch (err) {
      const errorMsg = err.response?.data?.error_description || err.response?.data?.error || err.message;
      logger.error(`❌ [TwitterPublisher] Twitter token refresh failed: ${errorMsg}`);
      throw new Error(`Twitter token refresh failed: ${errorMsg}`);
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
      let errorMsg = err.message;
      if (err.response?.data) {
        const d = err.response.data;
        if (Array.isArray(d.errors) && d.errors.length > 0) {
          errorMsg = d.errors.map((e) => e.message || e.detail || JSON.stringify(e)).join('; ');
        } else {
          errorMsg = d.detail || d.title || d.message || JSON.stringify(d);
        }
      }
      logger.warn(`ℹ️ [TwitterPublisher] /users/me lookup error: ${errorMsg}`);
      throw new Error(`Failed to fetch Twitter profile: ${errorMsg}`);
    }
  },

  /**
   * Publish Tweet with optional image media/URL to X (Twitter)
   * Ensures tweet text length adheres strictly to Twitter's 280-character limit.
   * @param {object} params
   * @param {string} params.accessToken - Decrypted OAuth access token
   * @param {string} [params.graphicUrl] - Graphic / image URL to include in tweet
   * @param {string} params.caption - Tweet text content
   * @returns {Promise<{status: string, platform: string, postId: string, postUrl: string, publishedAt: string}>}
   */
  publishToTwitter: async ({ accessToken, graphicUrl, caption }) => {
    logger.info('📢 [TwitterPublisher] Publishing post to X (Twitter)...');

    const MAX_TWEET_LEN = 280;
    let baseText = (caption || 'Created with BrandFlow 🚀').trim();

    let tweetText = baseText;
    if (graphicUrl && !baseText.includes(graphicUrl)) {
      // In Twitter API, attached URLs consume 23 characters
      // Max caption text length = 280 - 23 - 2 (newlines) = 255 chars
      const maxCaptionLen = 255;
      if (baseText.length > maxCaptionLen) {
        baseText = baseText.slice(0, maxCaptionLen - 3) + '...';
      }
      tweetText = `${baseText}\n\n${graphicUrl}`;
    } else {
      if (tweetText.length > MAX_TWEET_LEN) {
        tweetText = tweetText.slice(0, MAX_TWEET_LEN - 3) + '...';
      }
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
      let errorMsg = err.message;
      const status = err.response?.status;
      if (err.response?.data) {
        const d = err.response.data;
        if (Array.isArray(d.errors) && d.errors.length > 0) {
          errorMsg = d.errors.map((e) => e.message || e.detail || JSON.stringify(e)).join('; ');
        } else {
          errorMsg = d.detail || d.title || d.message || JSON.stringify(d);
        }
      }
      logger.error(`❌ [TwitterPublisher] Twitter posting error (${status || 'unknown'}): ${errorMsg}`);
      const customErr = new Error(`Twitter API error (${status || 'unknown'}): ${errorMsg}`);
      customErr.status = status;
      throw customErr;
    }
  },
};
