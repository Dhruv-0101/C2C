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
      // 1. Upload photo asset directly to Meta with published=false
      let photoId = null;
      try {
        const photoRes = await axios.post(
          `${META_GRAPH_URL}/${targetNode}/photos`,
          null,
          {
            params: {
              url: graphicUrl,
              published: false,
              access_token: accessToken,
            },
            timeout: 10000,
          }
        );
        photoId = photoRes.data?.id;
      } catch (photoUploadErr) {
        logger.warn(`⚠️ [FacebookPublisher] Unpublished photo upload warning: ${photoUploadErr.message}`);
      }

      // 2. Publish as a Native Timeline Feed Post using attached_media
      let postId = null;
      if (photoId) {
        try {
          const feedRes = await axios.post(
            `${META_GRAPH_URL}/${targetNode}/feed`,
            null,
            {
              params: {
                message: caption || 'Created with BrandFlow 🚀',
                attached_media: JSON.stringify([{ media_fbid: photoId }]),
                access_token: accessToken,
              },
              timeout: 10000,
            }
          );
          postId = feedRes.data?.id;
        } catch (feedErr) {
          logger.warn(`⚠️ [FacebookPublisher] Native feed endpoint error: ${feedErr.message}. Falling back to direct /photos publishing.`);
        }
      }

      // 3. Fallback: Direct publish via /photos if feed creation was not possible
      if (!postId) {
        const directPhotoRes = await axios.post(
          `${META_GRAPH_URL}/${targetNode}/photos`,
          null,
          {
            params: {
              url: graphicUrl,
              caption: caption || 'Created with BrandFlow 🚀',
              message: caption || 'Created with BrandFlow 🚀',
              published: true,
              access_token: accessToken,
            },
            timeout: 10000,
          }
        );
        postId = directPhotoRes.data?.post_id || directPhotoRes.data?.id;
      }

      const cleanPostId = postId ? String(postId).split('_')[1] || postId : null;

      let postUrl = `https://facebook.com/${postId || ''}`;
      if (pageId && cleanPostId) {
        if (/^\d+$/.test(pageId)) {
          postUrl = `https://facebook.com/permalink.php?story_fbid=${cleanPostId}&id=${pageId}`;
        } else {
          postUrl = `https://facebook.com/${pageId}/posts/${cleanPostId}`;
        }
      }

      logger.info(`🎉 [FacebookPublisher] Successfully published native Timeline Post to Facebook Page! Post ID: ${postId} | URL: ${postUrl}`);

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
