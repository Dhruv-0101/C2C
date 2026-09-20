import * as postRepository from './post.repository.js';
import { uploadPostBuffer, deleteFromCloudinary } from '../../config/cloudinary.js';
import { processPostJob } from '../../jobs/index.js';
import {
  parsePaginationParams,
  buildPaginatedResponse,
} from '../../common/helpers/pagination.helper.js';
import { billingRepository } from '../billing/billing.repository.js';
import { findBrandKitByUserId } from '../brandkit/brandkit.repository.js';
import { BRAND_SYNC_KEYS } from '../brandkit/brandkit.constants.js';
import { extractHashtags } from '../ai/ai.helper.js';
import {
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from '../../common/errors/custom-errors.js';
import { logger } from '../../config/logger.js';
import {
  POST_STATUS,
  SCHEDULED_POST_STATUS,
  POST_TARGET_PLATFORMS,
} from './post.constants.js';
import {
  sanitizePost,
  sanitizePosts,
  sanitizeScheduledPost,
  sanitizeScheduledPosts,
} from './post.helper.js';

/**
 * 📝 POST BUSINESS LOGIC LAYER
 * Orchestrates post creation, Cloudinary asset uploads, subscription quota consumption,
 * social publisher dispatch, and dynamic BrandKit synchronization.
 * Zero Prisma code or HTTP response formatting exists in this layer.
 */

/**
 * Get paginated posts created by user
 * @param {string} userId
 * @param {Object} [queryParams={}]
 * @returns {Promise<{ data: { posts: Array<Object> }, meta: Object }>}
 */
export async function getUserPosts(userId, queryParams = {}) {
  const pagination = parsePaginationParams(queryParams);
  const { posts, totalCount } = await postRepository.findPaginatedByUserId(userId, pagination);

  const paginatedResponse = buildPaginatedResponse({
    items: sanitizePosts(posts),
    totalCount,
    page: pagination.page,
    limit: pagination.limit,
  });

  return {
    data: {
      posts: paginatedResponse.data,
    },
    meta: paginatedResponse.meta,
  };
}

/**
 * Get user's scheduled queue with pagination
 * @param {string} userId
 * @param {Object} [queryParams={}]
 * @returns {Promise<{ data: { scheduledPosts: Array<Object> }, meta: Object }>}
 */
export async function getScheduledPosts(userId, queryParams = {}) {
  const pagination = parsePaginationParams(queryParams);
  const { scheduledPosts, totalCount } = await postRepository.findPaginatedScheduledByUserId(
    userId,
    pagination
  );

  const paginatedResponse = buildPaginatedResponse({
    items: sanitizeScheduledPosts(scheduledPosts),
    totalCount,
    page: pagination.page,
    limit: pagination.limit,
  });

  return {
    data: {
      scheduledPosts: paginatedResponse.data,
    },
    meta: paginatedResponse.meta,
  };
}

/**
 * Instant Live Social Media Publishing
 * @param {string} userId
 * @param {Object} payload
 * @returns {Promise<{ post: Object, publishResult: Object }>}
 */
export async function publishNow(userId, payload) {
  const post = await createPost(userId, { ...payload, status: POST_STATUS.PUBLISHING });

  const jobPayload = {
    postId: post.id,
    userId,
    targetPlatforms: payload.targetPlatforms || [...POST_TARGET_PLATFORMS],
    postContent: payload.caption || payload.occasionName || 'Branded Graphic Post',
    graphicUrl: post.finalGraphicUrl,
  };

  const publishResult = await processPostJob(jobPayload);

  return {
    post: sanitizePost(post),
    publishResult,
  };
}

/**
 * Schedule Post for Future Date & Time
 * @param {string} userId
 * @param {Object} payload
 * @returns {Promise<{ post: Object, scheduledPost: Object }>}
 */
export async function schedulePost(userId, payload) {
  const post = await createPost(userId, { ...payload, status: POST_STATUS.SCHEDULED });

  const scheduledDate = new Date(payload.scheduledAt);

  const scheduledPost = await postRepository.createScheduledPost({
    postId: post.id,
    scheduledAt: scheduledDate,
    targetPlatforms: payload.targetPlatforms || [...POST_TARGET_PLATFORMS],
    status: SCHEDULED_POST_STATUS.PENDING,
  });

  return {
    post: sanitizePost(post),
    scheduledPost: sanitizeScheduledPost(scheduledPost),
  };
}

/**
 * Generate & Save new composited post (Template + PNG Frame + BrandKit)
 * Strictly uploads user created social graphics -> Cloudinary 'brandflow/posts'
 *
 * @param {string} userId
 * @param {Object} payload
 * @param {Buffer} [fileBuffer]
 * @returns {Promise<Object>}
 */
export async function createPost(userId, payload, fileBuffer) {
  let finalGraphicUrl = payload.finalGraphicUrl || null;

  // Upload composited post image buffer or base64 to Cloudinary brandflow/posts
  if (fileBuffer) {
    try {
      const uploadResult = await uploadPostBuffer(fileBuffer);
      finalGraphicUrl = uploadResult.url;
    } catch (err) {
      logger.warn(`Cloudinary File Buffer Upload Warning: ${err.message}`);
    }
  } else if (payload.base64Graphic || payload.base64Image) {
    try {
      let cleanBase64 = payload.base64Graphic || payload.base64Image;
      if (cleanBase64.includes(';base64,')) {
        cleanBase64 = cleanBase64.split(';base64,').pop();
      }
      const buffer = Buffer.from(cleanBase64, 'base64');
      const uploadResult = await uploadPostBuffer(buffer);
      finalGraphicUrl = uploadResult.url;
    } catch (uploadErr) {
      logger.warn(`Cloudinary Base64 Upload Warning: ${uploadErr.message}`);
      finalGraphicUrl = payload.base64Graphic || payload.base64Image;
    }
  }

  // 1. Enforce post quota: user must have available post credits (validity is based on remaining posts)
  const sub = await billingRepository.findByUserId(userId);
  const planRemaining = Math.max(0, (sub?.totalPostsAllowed || 0) - (sub?.postsUsed || 0));
  const bonusRemaining = Math.max(0, (sub?.bonusPostsAllowed || 0) - (sub?.bonusPostsUsed || 0));
  const postsRemaining = planRemaining + bonusRemaining;

  if (!sub || postsRemaining <= 0) {
    throw new ForbiddenError(
      'Your post quota has been exhausted. Please purchase a plan or post credits to continue creating or scheduling posts.'
    );
  }

  // Auto-resolve business category from active BrandKit if not explicitly passed
  let categoryId = payload.categoryId || null;
  if (!categoryId) {
    const userBrandKit = await findBrandKitByUserId(userId);
    categoryId = userBrandKit?.categoryId || null;
  }

  const postData = {
    userId,
    templateId: payload.templateId || null,
    festivalId: payload.festivalId || null,
    categoryId,
    frameId: payload.frameId || null,
    occasionName: payload.occasionName || null,
    customImageUrl: payload.customImageUrl || null,
    finalGraphicUrl: finalGraphicUrl,
    userConfigJson: payload.userConfigJson || null,
    status: payload.status || POST_STATUS.DRAFT,
  };

  const resolvedHashtags = Array.isArray(payload.hashtags) && payload.hashtags.length > 0
    ? payload.hashtags
    : (payload.caption ? extractHashtags(payload.caption) : []);

  const createdPost = await postRepository.createWithVault(postData, {
    occasionName: payload.occasionName,
    categoryName: payload.categoryName,
    targetPlatforms: payload.targetPlatforms,
    caption: payload.caption || null,
    hashtags: resolvedHashtags,
  });

  // 2. Consume 1 post credit immediately upon post creation
  await billingRepository.incrementPostsUsed(userId).catch((err) => {
    logger.warn(`Failed to increment post quota for user ${userId}: ${err.message}`);
  });

  return sanitizePost(createdPost);
}

/**
 * Enterprise Admin: Get all posts created across platform with multi-dimensional filters
 * @param {Object} [queryParams={}]
 * @returns {Promise<{ data: { posts: Array<Object> }, meta: Object }>}
 */
export async function getAdminPosts(queryParams = {}) {
  const pagination = parsePaginationParams(queryParams);
  const { posts, totalCount } = await postRepository.findPaginatedForAdmin({
    ...pagination,
    categoryId: queryParams.categoryId || undefined,
    frameId: queryParams.frameId || undefined,
    templateId: queryParams.templateId || undefined,
    templateCategoryId: queryParams.templateCategoryId || undefined,
    festivalId: queryParams.festivalId || undefined,
    userId: queryParams.userId || undefined,
    status: queryParams.status || undefined,
    startDate: queryParams.startDate || undefined,
    endDate: queryParams.endDate || undefined,
    search: queryParams.search || undefined,
  });

  const paginatedResponse = buildPaginatedResponse({
    items: sanitizePosts(posts),
    totalCount,
    page: pagination.page,
    limit: pagination.limit,
  });

  return {
    data: {
      posts: paginatedResponse.data,
    },
    meta: paginatedResponse.meta,
  };
}

/**
 * Enterprise Admin: Get aggregated volume analytics and distribution breakdowns
 * "Kitni bani hai" - Total count, by Category, by Frame, by Template, by Festival, by Status, Top Creators
 * @returns {Promise<{ data: Object }>}
 */
export async function getAdminPostAnalytics() {
  const analytics = await postRepository.getPostAnalytics();
  return {
    data: analytics,
  };
}

/**
 * Delete user post and cleanup Cloudinary storage
 * @param {string} id - Post UUID
 * @param {string} userId - User UUID
 * @returns {Promise<Object>}
 */
export async function deletePost(id, userId) {
  const post = await postRepository.findById(id);
  if (post?.finalGraphicUrl) {
    deleteFromCloudinary(post.finalGraphicUrl).catch((err) =>
      logger.warn(`Failed to cleanup post graphic from Cloudinary: ${err.message}`)
    );
  }
  return postRepository.delete(id, userId);
}

/**
 * Auto-Sync user's pending scheduled & draft posts when BrandKit details are updated
 * Dynamically inherits BRAND_SYNC_KEYS directly from central brandkit.constants.js (Zero Drift!)
 *
 * @param {string} userId
 * @param {Object} updatedBrandKit
 * @returns {Promise<{ updatedCount: number }>}
 */
export async function syncPendingPostsWithBrandKit(userId, updatedBrandKit) {
  const pendingPosts = await postRepository.findPendingPostsByUserId(userId);
  let updatedCount = 0;

  for (const post of pendingPosts) {
    let config = post.userConfigJson || {};
    if (typeof config === 'string') {
      try {
        config = JSON.parse(config);
      } catch (e) {}
    }

    // 1. Complete dynamic BrandKit snapshot (Single Source of Truth via BRAND_SYNC_KEYS)
    config.brandKit = config.brandKit || {};
    BRAND_SYNC_KEYS.forEach((key) => {
      config.brandKit[key] = updatedBrandKit[key] ?? null;
    });

    // 2. Sync root-level direct keys (used by Post Studio canvas customDetails)
    BRAND_SYNC_KEYS.forEach((key) => {
      if (config[key] !== undefined && updatedBrandKit[key] !== undefined) {
        config[key] = updatedBrandKit[key];
      }
    });

    // 3. Dynamic Text overrides (if customized in frame blueprint)
    if (config.dynamicText) {
      BRAND_SYNC_KEYS.forEach((key) => {
        if (config.dynamicText[key] !== undefined && updatedBrandKit[key] !== undefined) {
          config.dynamicText[key] = updatedBrandKit[key];
        }
      });
    }

    // 4. Dynamic Images overrides (Logo, Owner Avatar / Profile Photo, UPI QR)
    if (config.dynamicImages) {
      if (config.dynamicImages.logo !== undefined && updatedBrandKit.logoUrl !== undefined) {
        config.dynamicImages.logo = updatedBrandKit.logoUrl;
      }
      if (config.dynamicImages.avatar !== undefined && updatedBrandKit.avatarUrl !== undefined) {
        config.dynamicImages.avatar = updatedBrandKit.avatarUrl;
      }
      if (config.dynamicImages.upiQr !== undefined && updatedBrandKit.upiQrUrl !== undefined) {
        config.dynamicImages.upiQr = updatedBrandKit.upiQrUrl;
      }
    }

    // Flag this pending scheduled/draft post as needing graphic re-rendering so UI alerts the user
    config.brandKitNeedsReview = true;
    config.brandKitSyncedAt = new Date().toISOString();

    await postRepository.updatePostConfigAndGraphic(post.id, config);
    updatedCount++;
  }

  return { updatedCount };
}

/**
 * Re-render & update composited graphic for an existing post in place (e.g. after BrandKit update)
 * Deducts 0 post credits since quota was already consumed when the post was originally scheduled/created.
 *
 * @param {string} userId
 * @param {string} postId
 * @param {Object} payload
 * @param {Buffer} [fileBuffer]
 * @returns {Promise<Object>}
 */
export async function updatePostGraphic(userId, postId, payload = {}, fileBuffer = null) {
  const post = await postRepository.findById(postId);
  if (!post) {
    throw new NotFoundError('Post not found.');
  }

  if (post.userId !== userId) {
    throw new ForbiddenError('You are not authorized to update this post.');
  }

  if (post.status === POST_STATUS.PUBLISHED) {
    throw new BadRequestError('Cannot re-render a post that has already been published live.');
  }

  let finalGraphicUrl = payload.finalGraphicUrl || null;

  if (fileBuffer) {
    try {
      const uploadResult = await uploadPostBuffer(fileBuffer);
      finalGraphicUrl = uploadResult.url;
    } catch (err) {
      logger.warn(`Failed to upload re-rendered file buffer to Cloudinary: ${err.message}`);
    }
  } else if (payload.base64Graphic || payload.base64Image) {
    try {
      let cleanBase64 = payload.base64Graphic || payload.base64Image;
      if (cleanBase64.includes(';base64,')) {
        cleanBase64 = cleanBase64.split(';base64,').pop();
      }
      const buffer = Buffer.from(cleanBase64, 'base64');
      const uploadResult = await uploadPostBuffer(buffer);
      finalGraphicUrl = uploadResult.url;
    } catch (uploadErr) {
      logger.warn(`Failed to upload re-rendered base64 graphic to Cloudinary: ${uploadErr.message}`);
      finalGraphicUrl = payload.base64Graphic || payload.base64Image;
    }
  }

  if (!finalGraphicUrl) {
    throw new BadRequestError(
      'A valid image buffer, base64 graphic, or finalGraphicUrl is required to update.'
    );
  }

  // Cleanup old Cloudinary image if it was replaced
  if (post.finalGraphicUrl && post.finalGraphicUrl !== finalGraphicUrl) {
    deleteFromCloudinary(post.finalGraphicUrl).catch((err) =>
      logger.warn(`Failed to cleanup replaced post graphic from Cloudinary: ${err.message}`)
    );
  }

  // Update config JSON and clear brandKitNeedsReview flag
  let config = payload.userConfigJson !== undefined ? payload.userConfigJson : post.userConfigJson;
  if (typeof config === 'string') {
    try {
      config = JSON.parse(config);
    } catch (e) {}
  }
  if (config && typeof config === 'object') {
    config.brandKitNeedsReview = false;
    config.lastGraphicUpdatedAt = new Date().toISOString();
  }

  const updatedPost = await postRepository.updatePostGraphicById(postId, finalGraphicUrl, config);
  return sanitizePost(updatedPost);
}

// Backwards-compatible object export (strictly required by brandkit.logic.js)
export const postLogic = {
  getUserPosts,
  getScheduledPosts,
  publishNow,
  schedulePost,
  createPost,
  getAdminPosts,
  getAdminPostAnalytics,
  deletePost,
  syncPendingPostsWithBrandKit,
  updatePostGraphic,
};
