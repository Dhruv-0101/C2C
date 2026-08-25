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
    logger.info(`📢 [FacebookPublisher] Publishing photo to Facebook Page ID: ${pageId || 'me'}...`);

    if (!graphicUrl) {
      throw new Error('Valid public graphic image URL is required for Facebook posting.');
    }

    const targetNode = pageId || 'me';

    try {
      const response = await axios.post(
        `${META_GRAPH_URL}/${targetNode}/photos`,
        null,
        {
          params: {
            url: graphicUrl,
            caption: caption || 'Created with BrandFlow 🚀',
            message: caption || 'Created with BrandFlow 🚀',
            access_token: accessToken,
          },
        }
      );

      const postId = response.data?.post_id || response.data?.id;
      const cleanPostId = postId ? String(postId).split('_')[1] || postId : null;
      const postUrl = pageId && cleanPostId
        ? `https://facebook.com/${pageId}/posts/${cleanPostId}`
        : `https://facebook.com/${postId || ''}`;

      logger.info(`🎉 [FacebookPublisher] Successfully published post to Facebook Page! Post ID: ${postId}`);

      return {
        status: 'SUCCESS',
        platform: 'FACEBOOK',
        postId,
        postUrl,
        publishedAt: new Date().toISOString(),
      };
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message;
      logger.error(`❌ [FacebookPublisher] Facebook publishing error: ${errorMsg}`);
      throw new Error(`Facebook API error: ${errorMsg}`);
    }
  },
};
