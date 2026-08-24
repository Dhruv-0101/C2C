import { logger } from "../../config/logger.js";

/**
 * Enterprise Mock Social Publisher Service
 * Simulates real-world API requests, latency (1.5s), and response structures for Instagram, Facebook, LinkedIn, and Twitter.
 *
 * Provider Strategy Pattern:
 * Switch SOCIAL_PUBLISHER_MODE=LIVE in .env to swap this mock service with real Meta Graph API & LinkedIn API calls without changing any DB models or queues.
 */
export const mockSocialPublisherService = {
  /**
   * Publish a social media post across selected platforms
   *
   * @param {Object} params
   * @param {string} params.postId - Internal post database ID
   * @param {string} [params.postContent] - Caption or text content
   * @param {string} [params.graphicUrl] - Image URL to post
   * @param {Array<string>} params.targetPlatforms - Array of target platforms e.g. ["INSTAGRAM", "FACEBOOK", "LINKEDIN"]
   * @returns {Promise<{ success: boolean, publishedAt: string, platformResults: Object }>}
   */
  publishToPlatforms: async ({ postId, postContent, graphicUrl, targetPlatforms }) => {
    logger.info(`🚀 [MockSocialPublisher] Initiating mock publish request for Post ID: ${postId} across platforms: ${targetPlatforms.join(", ")}`);

    // Simulate real social media network latency (1.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const platformResults = {};
    const randomSuffix = () => Math.random().toString(36).substring(2, 9);

    for (const platform of targetPlatforms) {
      const platformUpper = platform.toUpperCase();
      const mockId = randomSuffix();

      switch (platformUpper) {
        case "INSTAGRAM":
          platformResults.INSTAGRAM = {
            status: "SUCCESS",
            postUrl: `https://instagram.com/p/mock_${mockId}`,
            publishedAt: new Date().toISOString(),
          };
          break;
        case "FACEBOOK":
          platformResults.FACEBOOK = {
            status: "SUCCESS",
            postUrl: `https://facebook.com/posts/mock_${mockId}`,
            publishedAt: new Date().toISOString(),
          };
          break;
        case "LINKEDIN":
          platformResults.LINKEDIN = {
            status: "SUCCESS",
            postUrl: `https://linkedin.com/feed/update/urn:li:activity:mock_${mockId}`,
            publishedAt: new Date().toISOString(),
          };
          break;
        case "TWITTER":
        case "X":
          platformResults.TWITTER = {
            status: "SUCCESS",
            postUrl: `https://x.com/brandflow/status/mock_${mockId}`,
            publishedAt: new Date().toISOString(),
          };
          break;
        default:
          platformResults[platformUpper] = {
            status: "SUCCESS",
            postUrl: `https://social.mock/${platformLower}/posts/mock_${mockId}`,
            publishedAt: new Date().toISOString(),
          };
          break;
      }
    }

    logger.info(`✅ [MockSocialPublisher] Successfully published Post ID: ${postId}. Results:`, platformResults);

    return {
      success: true,
      publishedAt: new Date().toISOString(),
      platformResults,
    };
  },
};
