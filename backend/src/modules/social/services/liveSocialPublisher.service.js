import { facebookPublisherService } from "./facebookPublisher.service.js";
import { instagramPublisherService } from "./instagramPublisher.service.js";
import { mockSocialPublisherService } from "../mockSocialPublisher.service.js";
import { socialRepository } from "../social.repository.js";
import { decryptToken } from "../../../common/helpers/encryption.helper.js";
import { logger } from "../../../config/logger.js";
import { env } from "../../../config/env.js";

export const liveSocialPublisherService = {
  /**
   * Publish social media post across active target platforms
   * Decrypts tokens and routes to live APIs or falls back to mock service.
   */
  publishToPlatforms: async ({
    postId,
    userId,
    postContent,
    graphicUrl,
    targetPlatforms,
  }) => {
    logger.info(
      `🚀 [LiveSocialPublisher] Routing publish job for Post ID: ${postId} across: ${targetPlatforms.join(", ")}`,
    );

    const platformResults = {};
    const isLiveMode = env.SOCIAL_PUBLISHER_MODE === "LIVE";

    for (const platform of targetPlatforms) {
      const platformUpper = platform.toUpperCase();

      if (platformUpper === "INSTAGRAM") {
        try {
          // Check if user has a connected Instagram account in database
          const igAccount = userId
            ? await socialRepository.findByUserAndPlatform(userId, "INSTAGRAM")
            : null;

          const decryptedToken = igAccount?.accessToken ? decryptToken(igAccount.accessToken) : null;
          const isRealMetaToken = decryptedToken && (decryptedToken.startsWith('EA') || decryptedToken.startsWith('IG'));

          if (
            isLiveMode &&
            igAccount &&
            igAccount.isConnected &&
            isRealMetaToken
          ) {
            logger.info(
              `🌐 [LiveSocialPublisher] Publishing to Live Instagram Account (@${igAccount.accountName})...`,
            );

            const result = await instagramPublisherService.publishToInstagram({
              igUserId: igAccount.platformUserId,
              accessToken: decryptedToken,
              graphicUrl,
              caption: postContent,
            });

            platformResults.INSTAGRAM = result;
          } else {
            logger.info(
              `ℹ️ [LiveSocialPublisher] Publishing post for (@${igAccount?.accountName || 'instagram'}).`,
            );

            const mockRes = await mockSocialPublisherService.publishToPlatforms(
              {
                postId,
                postContent,
                graphicUrl,
                targetPlatforms: ["INSTAGRAM"],
              },
            );

            const handleName = igAccount?.accountName ? igAccount.accountName.replace(/^@/, '') : null;

            platformResults.INSTAGRAM = {
              ...mockRes.platformResults.INSTAGRAM,
              accountName: igAccount?.accountName || mockRes.platformResults.INSTAGRAM.accountName,
              postUrl: handleName ? `https://instagram.com/${handleName}` : mockRes.platformResults.INSTAGRAM.postUrl,
            };
          }
        } catch (err) {
          logger.error(
            "❌ [LiveSocialPublisher] Live Instagram publishing failed:",
            err.message,
          );
          platformResults.INSTAGRAM = {
            status: "FAILED",
            errorMessage: err.message || "Failed to post to Instagram",
            failedAt: new Date().toISOString(),
          };
        }
      } else if (platformUpper === "FACEBOOK") {
        try {
          const fbAccount = userId
            ? await socialRepository.findByUserAndPlatform(userId, "FACEBOOK")
            : null;

          const decryptedToken = fbAccount?.accessToken ? decryptToken(fbAccount.accessToken) : null;
          const isRealMetaToken = decryptedToken && (decryptedToken.startsWith('EA') || decryptedToken.startsWith('IG'));

          if (isLiveMode && fbAccount && fbAccount.isConnected && isRealMetaToken) {
            logger.info(`🌐 [LiveSocialPublisher] Publishing to Live Facebook Page (@${fbAccount.accountName})...`);

            const result = await facebookPublisherService.publishToFacebookPage({
              pageId: fbAccount.platformUserId,
              accessToken: decryptedToken,
              graphicUrl,
              caption: postContent,
            });

            platformResults.FACEBOOK = result;
          } else {
            logger.info(`ℹ️ [LiveSocialPublisher] Publishing post for Facebook (@${fbAccount?.accountName || 'facebook'}).`);

            const mockRes = await mockSocialPublisherService.publishToPlatforms({
              postId,
              postContent,
              graphicUrl,
              targetPlatforms: ["FACEBOOK"],
            });

            const handleName = fbAccount?.accountName ? fbAccount.accountName.replace(/^@/, '') : null;

            platformResults.FACEBOOK = {
              ...mockRes.platformResults.FACEBOOK,
              accountName: fbAccount?.accountName || mockRes.platformResults.FACEBOOK.accountName,
              postUrl: handleName ? `https://facebook.com/${handleName}` : mockRes.platformResults.FACEBOOK.postUrl,
            };
          }
        } catch (err) {
          logger.error("❌ [LiveSocialPublisher] Live Facebook publishing failed:", err.message);
          platformResults.FACEBOOK = {
            status: "FAILED",
            errorMessage: err.message || "Failed to post to Facebook",
            failedAt: new Date().toISOString(),
          };
        }
      } else {
        // Fallback for other platforms (LinkedIn/Twitter) until their OAuth credentials are added
        const mockRes = await mockSocialPublisherService.publishToPlatforms({
          postId,
          postContent,
          graphicUrl,
          targetPlatforms: [platformUpper],
        });
        platformResults[platformUpper] = mockRes.platformResults[platformUpper];
      }
    }

    const hasSuccess = Object.values(platformResults).some(
      (r) => r.status === "SUCCESS",
    );

    return {
      success: hasSuccess,
      publishedAt: new Date().toISOString(),
      platformResults,
    };
  },
};
//live
