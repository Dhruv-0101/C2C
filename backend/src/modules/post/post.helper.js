/**
 * 📝 POST DATA SANITIZER HELPER
 * 
 * Strict Whitelist (Allowlist) Projections for Post and ScheduledPost objects.
 * Enforces OWASP Data Minimization Principles:
 * 1. Exposes only attributes needed by Post Studio, Your Posts, and Admin dashboards.
 * 2. Nested relationships (creator, relations) are strictly projected without leaking internal credentials or audit details.
 */

/**
 * Sanitize a single post record
 * @param {Object} post - Raw post record from database
 * @returns {Object|null} Sanitized post object
 */
export function sanitizePost(post) {
  if (!post) return null;

  return {
    id: post.id,
    userId: post.userId,
    templateId: post.templateId || null,
    festivalId: post.festivalId || null,
    categoryId: post.categoryId || null,
    frameId: post.frameId || null,
    occasionName: post.occasionName || null,
    customImageUrl: post.customImageUrl || null,
    finalGraphicUrl: post.finalGraphicUrl || null,
    userConfigJson: post.userConfigJson || null,
    status: post.status,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    ...(post.user
      ? {
          user: {
            id: post.user.id,
            fullName: post.user.fullName,
            email: post.user.email,
            avatarUrl: post.user.avatarUrl || null,
            role: post.user.role,
          },
        }
      : {}),
    ...(post.category
      ? {
          category: {
            id: post.category.id,
            name: post.category.name,
            slug: post.category.slug,
          },
        }
      : {}),
    ...(post.frame
      ? {
          frame: {
            id: post.frame.id,
            title: post.frame.title,
            previewUrl: post.frame.previewUrl || null,
            overlayPngUrl: post.frame.overlayPngUrl || null,
          },
        }
      : {}),
    ...(post.template
      ? {
          template: {
            id: post.template.id,
            title: post.template.title,
            baseImageUrl: post.template.baseImageUrl,
            templateCategoryId: post.template.templateCategoryId || null,
            ...(post.template.templateCategory
              ? {
                  templateCategory: {
                    id: post.template.templateCategory.id,
                    name: post.template.templateCategory.name,
                    slug: post.template.templateCategory.slug,
                  },
                }
              : {}),
          },
        }
      : {}),
    ...(post.festival
      ? {
          festival: {
            id: post.festival.id,
            name: post.festival.name,
            slug: post.festival.slug,
            date: post.festival.date,
            bannerUrl: post.festival.bannerUrl || null,
          },
        }
      : {}),
    ...(Array.isArray(post.captions)
      ? {
          captions: post.captions.map((cap) => ({
            id: cap.id,
            captionText: cap.captionText,
            hashtags: cap.hashtags || [],
          })),
        }
      : {}),
    ...(post.scheduledPost
      ? {
          scheduledPost: {
            id: post.scheduledPost.id,
            scheduledAt: post.scheduledPost.scheduledAt,
            status: post.scheduledPost.status,
            targetPlatforms: post.scheduledPost.targetPlatforms || [],
            publishedAt: post.scheduledPost.publishedAt || null,
          },
        }
      : {}),
  };
}

/**
 * Sanitize an array of post records
 * @param {Array<Object>} posts
 * @returns {Array<Object>}
 */
export function sanitizePosts(posts) {
  if (!Array.isArray(posts)) return [];
  return posts.map(sanitizePost);
}

/**
 * Sanitize a single scheduled post record
 * @param {Object} scheduledPost
 * @returns {Object|null}
 */
export function sanitizeScheduledPost(scheduledPost) {
  if (!scheduledPost) return null;

  return {
    id: scheduledPost.id,
    postId: scheduledPost.postId,
    scheduledAt: scheduledPost.scheduledAt,
    status: scheduledPost.status,
    targetPlatforms: scheduledPost.targetPlatforms || [],
    platformResults: scheduledPost.platformResults || null,
    errorMessage: scheduledPost.errorMessage || null,
    retryCount: scheduledPost.retryCount || 0,
    publishedAt: scheduledPost.publishedAt || null,
    createdAt: scheduledPost.createdAt,
    updatedAt: scheduledPost.updatedAt,
    ...(scheduledPost.post ? { post: sanitizePost(scheduledPost.post) } : {}),
  };
}

/**
 * Sanitize an array of scheduled post records
 * @param {Array<Object>} scheduledPosts
 * @returns {Array<Object>}
 */
export function sanitizeScheduledPosts(scheduledPosts) {
  if (!Array.isArray(scheduledPosts)) return [];
  return scheduledPosts.map(sanitizeScheduledPost);
}
