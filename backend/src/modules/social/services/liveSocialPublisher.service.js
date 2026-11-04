import { facebookPublisherService } from './facebookPublisher.service.js';
import { instagramPublisherService } from './instagramPublisher.service.js';
import { linkedinPublisherService } from './linkedinPublisher.service.js';
import { socialRepository } from '../social.repository.js';
import { SOCIAL_PLATFORM_LIST } from '../social.constants.js';
import { decryptToken } from '../../../common/helpers/encryption.helper.js';
import { logger } from '../../../config/logger.js';

export const liveSocialPublisherService = {
  /**
   * Publish social media post across active target platforms via real third-party APIs
   * (Meta Graph API for Instagram & Facebook, RestLi API for LinkedIn).
   * Decrypts tokens from PostgreSQL and dispatches directly to official platform endpoints.
   *
   * @param {Object} params
   * @param {string} params.postId - Database ID of post
   * @param {string} params.userId - Owner user ID
   * @param {string} params.postContent - Caption / title text
   * @param {string} [params.graphicUrl] - Public Cloudinary image URL
   * @param {string[]} [params.mediaUrls] - Array of public Cloudinary image URLs
   * @param {string} [params.postType] - Format type: 'SINGLE'
   * @param {string[]} params.targetPlatforms - Array of target platforms e.g. ['INSTAGRAM', 'FACEBOOK', 'LINKEDIN']
   * @returns {Promise<{ success: boolean, publishedAt: string, platformResults: Object }>}
   */
  publishToPlatforms: async ({
    postId,
    userId,
    postContent,
    graphicUrl,
    videoUrl,
    thumbnailUrl,
    mediaUrls = [],
    postType = 'SINGLE',
    targetPlatforms,
  }) => {
    const isVideoOrReel = Boolean(videoUrl) || postType === 'REEL' || postType === 'VIDEO';

    logger.info(
      `🚀 [LiveSocialPublisher] Routing live publish job (${postType}${isVideoOrReel ? ' 🎬 REEL/VIDEO' : ''}) for Post ID: ${postId} across: ${targetPlatforms.join(', ')}`
    );

    const platformResults = {};

    for (const platform of targetPlatforms) {
      const platformUpper = platform.toUpperCase();

      if (!SOCIAL_PLATFORM_LIST.includes(platformUpper)) {
        platformResults[platformUpper] = {
          status: 'FAILED',
          platform: platformUpper,
          error: `Unsupported social platform '${platformUpper}'.`,
        };
        continue;
      }

      // 1. Verify user has an active connected account in database
      const account = userId
        ? await socialRepository.findByUserAndPlatform(userId, platformUpper)
        : null;

      if (!account || account.isConnected === false) {
        logger.warn(`⚠️ [LiveSocialPublisher] No active connected ${platformUpper} account found for user ${userId || 'anonymous'}.`);
        platformResults[platformUpper] = {
          status: 'FAILED',
          platform: platformUpper,
          error: `No connected ${platformUpper} account found for this user. Please connect your account in BrandKit.`,
        };
        continue;
      }

      // 2. Decrypt stored OAuth token
      const decryptedToken = account.accessToken ? decryptToken(account.accessToken) : null;
      if (!decryptedToken) {
        logger.warn(`⚠️ [LiveSocialPublisher] Missing or unreadable access token for ${platformUpper} (User: ${userId}).`);
        platformResults[platformUpper] = {
          status: 'FAILED',
          platform: platformUpper,
          accountName: account.accountName,
          error: `Missing or invalid access token for ${platformUpper}. Please reconnect your account in BrandKit.`,
        };
        continue;
      }

      // 3. Dispatch to platform-specific publisher service
      if (platformUpper === 'INSTAGRAM') {
        try {
          let result;
          if (isVideoOrReel && videoUrl) {
            logger.info(`🌐 [LiveSocialPublisher] Publishing REEL to Live Instagram Account (@${account.accountName})...`);
            result = await instagramPublisherService.publishReelToInstagram({
              igUserId: account.platformUserId,
              accessToken: decryptedToken,
              videoUrl,
              caption: postContent,
              thumbnailUrl: thumbnailUrl || graphicUrl,
            });
          } else {
            logger.info(`🌐 [LiveSocialPublisher] Publishing photo to Live Instagram Account (@${account.accountName})...`);
            result = await instagramPublisherService.publishToInstagram({
              igUserId: account.platformUserId,
              accessToken: decryptedToken,
              graphicUrl,
              mediaUrls,
              caption: postContent,
            });
          }
          platformResults.INSTAGRAM = {
            ...result,
            accountName: account.accountName,
          };
        } catch (err) {
          const errorMsg = err.message || 'Failed to publish to Instagram';
          logger.error(`❌ [LiveSocialPublisher] Instagram publishing failed: ${errorMsg}`);
          platformResults.INSTAGRAM = {
            status: 'FAILED',
            platform: 'INSTAGRAM',
            accountName: account.accountName,
            error: errorMsg,
          };
        }
      } else if (platformUpper === 'FACEBOOK') {
        try {
          let result;
          if (isVideoOrReel && videoUrl) {
            logger.info(`🌐 [LiveSocialPublisher] Publishing REEL/VIDEO to Live Facebook Page (@${account.accountName})...`);
            result = await facebookPublisherService.publishReelToFacebookPage({
              pageId: account.platformUserId,
              accessToken: decryptedToken,
              videoUrl,
              caption: postContent,
              title: postContent?.slice(0, 50) || 'BrandFlow Reel',
            });
          } else {
            logger.info(`🌐 [LiveSocialPublisher] Publishing photo to Live Facebook Page (@${account.accountName})...`);
            result = await facebookPublisherService.publishToFacebookPage({
              pageId: account.platformUserId,
              accessToken: decryptedToken,
              graphicUrl,
              caption: postContent,
            });
          }
          platformResults.FACEBOOK = {
            ...result,
            accountName: account.accountName,
          };
        } catch (err) {
          const errorMsg = err.message || 'Failed to publish to Facebook';
          logger.error(`❌ [LiveSocialPublisher] Facebook publishing failed: ${errorMsg}`);
          platformResults.FACEBOOK = {
            status: 'FAILED',
            platform: 'FACEBOOK',
            accountName: account.accountName,
            error: errorMsg,
          };
        }
      } else if (platformUpper === 'LINKEDIN') {
        try {
          let result;
          if (isVideoOrReel && videoUrl) {
            logger.info(`🌐 [LiveSocialPublisher] Publishing VIDEO to Live LinkedIn Profile (@${account.accountName})...`);
            result = await linkedinPublisherService.publishVideoToLinkedin({
              personUrn: account.platformUserId,
              accessToken: decryptedToken,
              videoUrl,
              caption: postContent,
              title: postContent?.slice(0, 50) || 'BrandFlow Video',
            });
          } else {
            logger.info(`🌐 [LiveSocialPublisher] Publishing to Live LinkedIn Profile (@${account.accountName})...`);
            result = await linkedinPublisherService.publishToLinkedin({
              personUrn: account.platformUserId,
              accessToken: decryptedToken,
              graphicUrl,
              caption: postContent,
            });
          }
          platformResults.LINKEDIN = {
            ...result,
            accountName: account.accountName,
          };
        } catch (err) {
          const errorMsg = err.message || 'Failed to publish to LinkedIn';
          logger.error(`❌ [LiveSocialPublisher] LinkedIn publishing failed: ${errorMsg}`);
          platformResults.LINKEDIN = {
            status: 'FAILED',
            platform: 'LINKEDIN',
            accountName: account.accountName,
            error: errorMsg,
          };
        }
      }
    }

    const hasSuccess = Object.values(platformResults).some(
      (r) => r.status === 'SUCCESS'
    );

    // If all requested platforms failed, throw an error with details to notify workers & jobs
    if (!hasSuccess) {
      const failureSummaries = Object.entries(platformResults)
        .map(([platform, res]) => `${platform}: ${res.error}`)
        .join(' | ');
      throw new Error(`Social publishing failed on all target platforms: ${failureSummaries}`);
    }

    return {
      success: true,
      publishedAt: new Date().toISOString(),
      platformResults,
    };
  },
};
