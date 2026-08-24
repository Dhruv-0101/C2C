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

          if (
            isLiveMode &&
            igAccount &&
            igAccount.isConnected &&
            igAccount.accessToken
          ) {
            logger.info(
              `🌐 [LiveSocialPublisher] Publishing to Live Instagram Account (@${igAccount.accountName})...`,
            );

            const decryptedToken = decryptToken(igAccount.accessToken);

            const result = await instagramPublisherService.publishToInstagram({
              igUserId: igAccount.platformUserId,
              accessToken: decryptedToken,
              graphicUrl,
              caption: postContent,
            });

            platformResults.INSTAGRAM = result;
          } else {
            logger.info(
              `ℹ️ [LiveSocialPublisher] No active live token found for Instagram (Mode: ${env.SOCIAL_PUBLISHER_MODE}). Executing mock publish.`,
            );

            const mockRes = await mockSocialPublisherService.publishToPlatforms(
              {
                postId,
                postContent,
                graphicUrl,
                targetPlatforms: ["INSTAGRAM"],
              },
            );

            platformResults.INSTAGRAM = mockRes.platformResults.INSTAGRAM;
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
      } else {
        // Fallback for other platforms (Facebook/LinkedIn/Twitter) until their OAuth credentials are added
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
