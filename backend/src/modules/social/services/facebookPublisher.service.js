import axios from 'axios';
import { logger } from '../../../config/logger.js';

const META_GRAPH_URL = 'https://graph.facebook.com/v19.0';

export const facebookPublisherService = {
  /**
   * Publish Graphic Image & Caption to a Facebook Page via Meta Graph API /photos endpoint
   *
   * @param {Object} params
   * @param {string} params.pageId - Facebook Page ID
   * @param {string} params.accessToken - Page Access Token or Long-Lived Token
   * @param {string} params.graphicUrl - Public Cloudinary image URL
   * @param {string} params.caption - Post message caption & hashtags
   */
  publishToFacebookPage: async ({ pageId, accessToken, graphicUrl, caption }) => {
    const rawNode = pageId ? String(pageId).trim().replace(/^@/, '') : 'me';
    const targetNode = rawNode || 'me';

    logger.info(`📢 [FacebookPublisher] Publishing photo to Facebook Page Node: '${targetNode}'...`);

    if (!graphicUrl) {
      throw new Error('Valid public graphic image URL is required for Facebook posting.');
    }

    const postMessage = caption || 'Created with BrandFlow 🚀';

    // 1. Primary Attempt: /photos endpoint for direct Page image upload
    try {
      const response = await axios.post(
        `${META_GRAPH_URL}/${targetNode}/photos`,
        null,
        {
          params: {
            url: graphicUrl,
            caption: postMessage,
            message: postMessage,
            access_token: accessToken,
          },
        }
      );

      const postId = response.data?.post_id || response.data?.id;
      const cleanPostId = postId ? String(postId).split('_')[1] || postId : null;
      const postUrl = targetNode !== 'me' && cleanPostId
        ? `https://facebook.com/${targetNode}/posts/${cleanPostId}`
        : `https://facebook.com/${postId || ''}`;

      logger.info(`🎉 [FacebookPublisher] Published to Facebook Page via /photos! Post ID: ${postId}`);

      return {
        status: 'SUCCESS',
        platform: 'FACEBOOK',
        postId,
        postUrl,
        publishedAt: new Date().toISOString(),
      };
    } catch (err1) {
      logger.warn(`ℹ️ [FacebookPublisher] /photos endpoint failed (${err1.message}). Trying /feed fallback...`);

      // 2. Secondary Attempt: /feed endpoint for rich Page feed post with graphic link
      try {
        const response = await axios.post(
          `${META_GRAPH_URL}/${targetNode}/feed`,
          null,
          {
            params: {
              link: graphicUrl,
              message: postMessage,
              access_token: accessToken,
            },
          }
        );

        const postId = response.data?.id;
        const cleanPostId = postId ? String(postId).split('_')[1] || postId : null;
        const postUrl = targetNode !== 'me' && cleanPostId
          ? `https://facebook.com/${targetNode}/posts/${cleanPostId}`
          : `https://facebook.com/${postId || ''}`;

        logger.info(`🎉 [FacebookPublisher] Published to Facebook Page via /feed! Post ID: ${postId}`);

        return {
          status: 'SUCCESS',
          platform: 'FACEBOOK',
          postId,
          postUrl,
          publishedAt: new Date().toISOString(),
        };
      } catch (err2) {
        const errorMsg = err2.response?.data?.error?.message || err1.response?.data?.error?.message || err2.message;
        logger.error(`❌ [FacebookPublisher] Facebook publishing error: ${errorMsg}`);
        throw new Error(`Facebook API error: ${errorMsg}`);
      }
    }
  },
};
