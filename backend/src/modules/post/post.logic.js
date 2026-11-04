import * as postRepository from './post.repository.js';
import {
  uploadPostBuffer,
  uploadVideoToCloudinaryBuffer,
  CLOUDINARY_FOLDERS,
  deleteFromCloudinary,
} from '../../config/cloudinary.js';
import { addInstantPostJob, addScheduledPostJob } from '../../queues/post.queue.js';
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
import { deleteCachePattern } from '../../common/utils/cache.util.js';
import { CACHE_KEYS } from '../../common/constants/cache.constants.js';
import {
  POST_TYPE,
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
  const status = queryParams.status ? String(queryParams.status).trim() : undefined;

  const [{ posts, totalCount }, counts] = await Promise.all([
    postRepository.findPaginatedByUserId(userId, {
      ...pagination,
      status,
    }),
    postRepository.getPostStatusCountsByUserId(userId),
  ]);

  const paginatedResponse = buildPaginatedResponse({
    items: sanitizePosts(posts),
    totalCount,
    page: pagination.page,
    limit: pagination.limit,
  });

  return {
    data: {
      posts: paginatedResponse.data,
      counts,
    },
    meta: {
      ...paginatedResponse.meta,
      counts,
    },
  };
}

/**
 * Get user's scheduled queue with pagination
 * @param {string} userId
 * @param {Object} [queryParams={}]
 * @returns {Promise<{ data: { scheduledPosts: Array<Object>, counts: Object }, meta: Object }>}
 */
export async function getScheduledPosts(userId, queryParams = {}) {
  const pagination = parsePaginationParams(queryParams);
  const [{ scheduledPosts, totalCount }, counts] = await Promise.all([
    postRepository.findPaginatedScheduledByUserId(userId, pagination),
    postRepository.getPostStatusCountsByUserId(userId),
  ]);

  const paginatedResponse = buildPaginatedResponse({
    items: sanitizeScheduledPosts(scheduledPosts),
    totalCount,
    page: pagination.page,
    limit: pagination.limit,
  });

  return {
    data: {
      scheduledPosts: paginatedResponse.data,
      counts,
    },
    meta: {
      ...paginatedResponse.meta,
      counts,
    },
  };
}

/**
 * Instant Live Social Media Publishing (Non-blocking BullMQ Queue Dispatch)
 * @param {string} userId
 * @param {Object} payload
 * @returns {Promise<{ post: Object, isQueued: boolean, jobId?: string, publishResult?: Object }>}
 */
export async function publishNow(userId, payload) {
  const post = await createPost(userId, { ...payload, status: POST_STATUS.PUBLISHING });

  // Enforce Platform Video Specifications (Instagram: 15m/1GB, FB: 90s/500MB, LinkedIn: 10m/200MB)
  if (post.videoUrl || payload.videoUrl) {
    validatePlatformVideoSpecs(payload.targetPlatforms || [...POST_TARGET_PLATFORMS], {
      durationSeconds: post.durationSeconds || payload.durationSeconds,
      videoUrl: post.videoUrl || payload.videoUrl,
      fileSize: payload.fileSize,
    });
  }

  const jobPayload = {
    postId: post.id,
    userId,
    targetPlatforms: payload.targetPlatforms || [...POST_TARGET_PLATFORMS],
    postContent: payload.caption || payload.occasionName || 'Branded Graphic Post',
    graphicUrl: post.finalGraphicUrl || post.thumbnailUrl,
    videoUrl: post.videoUrl || payload.videoUrl || null,
    thumbnailUrl: post.thumbnailUrl || payload.thumbnailUrl || null,
    durationSeconds: post.durationSeconds || payload.durationSeconds || null,
    postType: post.postType || payload.postType || (post.videoUrl || payload.videoUrl ? 'REEL' : 'SINGLE'),
    mediaUrls: Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0 ? post.mediaUrls : (post.finalGraphicUrl ? [post.finalGraphicUrl] : []),
  };

  // Dispatch non-blocking background job via BullMQ instant queue
  const queueResult = await addInstantPostJob(jobPayload);

  return {
    post: sanitizePost(post),
    isQueued: queueResult.isQueued,
    jobId: queueResult.jobId || null,
    publishResult: queueResult.result || null,
  };
}

/**
 * Schedule Post for Future Date & Time (Persists in DB & Enqueues to BullMQ with delay)
 * @param {string} userId
 * @param {Object} payload
 * @returns {Promise<{ post: Object, scheduledPost: Object }>}
 */
export async function schedulePost(userId, payload) {
  const scheduledDate = new Date(payload.scheduledAt);
  if (Number.isNaN(scheduledDate.getTime()) || scheduledDate.getTime() <= Date.now()) {
    throw new BadRequestError('Scheduled date/time must be a valid timestamp in the future.');
  }

  const post = await createPost(userId, { ...payload, status: POST_STATUS.SCHEDULED });

  // Enforce Platform Video Specifications (Instagram: 15m/1GB, FB: 90s/500MB, LinkedIn: 10m/200MB)
  if (post.videoUrl || payload.videoUrl) {
    validatePlatformVideoSpecs(payload.targetPlatforms || [...POST_TARGET_PLATFORMS], {
      durationSeconds: post.durationSeconds || payload.durationSeconds,
      videoUrl: post.videoUrl || payload.videoUrl,
      fileSize: payload.fileSize,
    });
  }

  const scheduledPost = await postRepository.createScheduledPost({
    postId: post.id,
    scheduledAt: scheduledDate,
    targetPlatforms: payload.targetPlatforms || [...POST_TARGET_PLATFORMS],
    status: SCHEDULED_POST_STATUS.PENDING,
  });

  // Enqueue to BullMQ delayed queue (with cron safety net)
  await addScheduledPostJob(
    {
      scheduledPostId: scheduledPost.id,
      postId: post.id,
      userId,
      targetPlatforms: payload.targetPlatforms || [...POST_TARGET_PLATFORMS],
      postContent: payload.caption || payload.occasionName || 'Branded Graphic Post',
      graphicUrl: post.finalGraphicUrl || post.thumbnailUrl,
      videoUrl: post.videoUrl || payload.videoUrl || null,
      thumbnailUrl: post.thumbnailUrl || payload.thumbnailUrl || null,
      durationSeconds: post.durationSeconds || payload.durationSeconds || null,
      postType: post.postType || payload.postType || (post.videoUrl || payload.videoUrl ? 'REEL' : 'SINGLE'),
      mediaUrls: Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0 ? post.mediaUrls : (post.finalGraphicUrl ? [post.finalGraphicUrl] : []),
    },
    scheduledDate
  );

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

  const isVideo = Boolean(payload.videoUrl) || payload.postType === POST_TYPE.REEL || payload.postType === POST_TYPE.VIDEO;
  const postType = isVideo ? (payload.postType || POST_TYPE.REEL) : POST_TYPE.SINGLE;
  const videoUrl = payload.videoUrl || null;
  const thumbnailUrl = payload.thumbnailUrl || (videoUrl ? videoUrl.replace(/\.[a-zA-Z0-9]+$/, '.jpg') : null) || finalGraphicUrl || null;
  const durationSeconds = payload.durationSeconds || null;

  const mediaUrls = videoUrl ? [videoUrl] : (finalGraphicUrl ? [finalGraphicUrl] : []);

  // 1. Enforce post quota: Only deduct if credit was NOT already paid during AI visual generation (Option A)
  const isCreditAlreadyPaid = Boolean(payload.isCreditAlreadyPaid);
  if (!isCreditAlreadyPaid) {
    const deductionResult = await billingRepository.deductPostCreditAtomic(userId);
    if (!deductionResult.success) {
      throw new ForbiddenError(
        'Your post quota has been exhausted. Please purchase a plan or post credits to continue creating or scheduling posts.'
      );
    }
  } else {
    logger.info(`[Option A Protection] Post credit was already deducted during AI generation for user ${userId}. Skipping duplicate deduction.`);
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
    finalGraphicUrl: finalGraphicUrl || thumbnailUrl,
    videoUrl,
    thumbnailUrl,
    durationSeconds,
    postType,
    mediaUrls,
    slides: payload.slides || null,
    userConfigJson: payload.userConfigJson || null,
    status: payload.status || POST_STATUS.DRAFT,
  };

  const resolvedHashtags = Array.isArray(payload.hashtags) && payload.hashtags.length > 0
    ? payload.hashtags
    : (payload.caption ? extractHashtags(payload.caption) : []);

  let createdPost;
  try {
    createdPost = await postRepository.createWithVault(postData, {
      occasionName: payload.occasionName,
      categoryName: payload.categoryName,
      targetPlatforms: payload.targetPlatforms,
      caption: payload.caption || null,
      hashtags: resolvedHashtags,
    });
  } catch (postErr) {
    // Compensating transaction: refund post credit only if it was deducted in this transaction
    if (!isCreditAlreadyPaid) {
      await billingRepository.refundPostCreditAtomic(userId);
    }
    throw postErr;
  }

  // Purge user's cached billing status to reflect newly decremented quota in real time
  deleteCachePattern(CACHE_KEYS.BILLING_PATTERN(userId)).catch(() => {});

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
 * Supports both standard user self-deletion and enterprise admin deletion
 * @param {string} id - Post UUID
 * @param {Object|string} userOrUserId - Authenticated user object or userId
 * @returns {Promise<Object>}
 */
export async function deletePost(id, userOrUserId) {
  const userId = typeof userOrUserId === 'object' ? userOrUserId?.id : userOrUserId;
  const role = typeof userOrUserId === 'object' ? userOrUserId?.role : null;
  const isSuperAdmin = typeof userOrUserId === 'object' ? Boolean(userOrUserId?.isSuperAdmin) : false;
  const isSubAdmin = typeof userOrUserId === 'object' ? Boolean(userOrUserId?.isSubAdmin) : false;
  const allowedTabs = typeof userOrUserId === 'object' && Array.isArray(userOrUserId?.allowedTabs) ? userOrUserId.allowedTabs : [];

  const post = await postRepository.findById(id);
  if (!post) {
    throw new NotFoundError('Post not found');
  }

  // 🛡️ Authorization: Creator or Enterprise Admin with Posts clearance
  const canAdminDelete = isSuperAdmin || role === 'ADMIN' || (isSubAdmin && allowedTabs.includes('posts'));
  if (!canAdminDelete && post.userId !== userId) {
    throw new ForbiddenError('You do not have permission to delete this post');
  }

  if (post.finalGraphicUrl) {
    deleteFromCloudinary(post.finalGraphicUrl).catch((err) =>
      logger.warn(`Failed to cleanup post graphic from Cloudinary: ${err.message}`)
    );
  }

  return postRepository.deletePostById(id, canAdminDelete ? null : userId);
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

/**
 * Upload Reel / Video to Cloudinary Video Storage (Max 100MB)
 * Extracts video duration, dimensions, format, and poster thumbnail.
 *
 * @param {string} userId
 * @param {Buffer} fileBuffer
 * @param {string} originalName
 * @returns {Promise<{ videoUrl: string, thumbnailUrl: string, duration: number, width: number, height: number, format: string, public_id: string }>}
 */
export async function uploadVideo(userId, fileBuffer, originalName = 'reel.mp4') {
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
    throw new BadRequestError('Please provide a valid video file buffer for upload.');
  }

  try {
    const uploadResult = await uploadVideoToCloudinaryBuffer(
      fileBuffer,
      CLOUDINARY_FOLDERS.REELS,
      originalName
    );

    return {
      videoUrl: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl,
      duration: uploadResult.duration,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      public_id: uploadResult.public_id,
    };
  } catch (err) {
    logger.error(`❌ Video upload failed for user ${userId}: ${err.message}`);
    throw new BadRequestError(err.message || 'Failed to upload video to Cloudinary.');
  }
}

/**
 * Upload custom cover / thumbnail image (JPEG/PNG) or frame snapshot for Reels/Videos
 * @param {string} userId - User UUID
 * @param {Buffer} fileBuffer - Image buffer
 * @returns {Promise<{ thumbnailUrl: string, width: number, height: number }>}
 */
export async function uploadThumbnail(userId, fileBuffer) {
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
    throw new BadRequestError('Please provide a valid image buffer for thumbnail upload.');
  }

  try {
    const uploadResult = await uploadPostBuffer(fileBuffer);
    return {
      thumbnailUrl: uploadResult.url,
      width: uploadResult.width,
      height: uploadResult.height,
    };
  } catch (err) {
    logger.error(`❌ Thumbnail upload failed for user ${userId}: ${err.message}`);
    throw new BadRequestError(err.message || 'Failed to upload custom thumbnail to Cloudinary.');
  }
}

/**
 * Validate Platform Video Requirements according to Meta & LinkedIn specifications:
 * 1. Instagram Reels: .mp4, .mov (H.264 / AAC) | 9:16 | 3s - 15min (900s) | Max 1GB
 * 2. Facebook Reels: .mp4 | 9:16 | 3s - 90s | Max 500MB
 * 3. LinkedIn Video: .mp4 | 1:1, 16:9, 9:16 | 3s - 10min (600s) | Max 200MB
 */
export function validatePlatformVideoSpecs(targetPlatforms = [], videoMeta = {}) {
  const { durationSeconds, videoUrl, fileSize } = videoMeta;
  if (!videoUrl && !durationSeconds) return;

  const platforms = targetPlatforms.map((p) => p.toUpperCase());
  const isMov = videoUrl?.toLowerCase()?.includes('.mov');

  // Universal Minimum Duration: 3 seconds
  if (durationSeconds && durationSeconds < 3) {
    throw new BadRequestError('Video duration must be at least 3 seconds on all social networks.');
  }

  // 1. Instagram Reels Requirements: .mp4, .mov | Max 15 min (900s) | Max 1GB
  if (platforms.includes('INSTAGRAM')) {
    if (durationSeconds && durationSeconds > 900) {
      throw new BadRequestError('Instagram Reels allows a maximum duration of 15 minutes (900 seconds).');
    }
    if (fileSize && fileSize > 1024 * 1024 * 1024) {
      throw new BadRequestError('Instagram Reels allows a maximum file size of 1 GB.');
    }
  }

  // 2. Facebook Reels Requirements: .mp4 strictly | 3s - 90s | Max 500MB
  if (platforms.includes('FACEBOOK')) {
    if (isMov) {
      throw new BadRequestError('Facebook Reels strictly requires .mp4 format. Please upload an MP4 video or deselect Facebook.');
    }
    if (durationSeconds && durationSeconds > 90) {
      throw new BadRequestError(`Facebook Reels only supports videos up to 90 seconds (your video is ${durationSeconds}s). Please shorten your video or deselect Facebook.`);
    }
    if (fileSize && fileSize > 500 * 1024 * 1024) {
      throw new BadRequestError('Facebook Reels allows a maximum file size of 500 MB.');
    }
  }

  // 3. LinkedIn Video Requirements: .mp4 | 3s - 10 min (600s) | Max 200MB
  if (platforms.includes('LINKEDIN')) {
    if (isMov) {
      throw new BadRequestError('LinkedIn Video strictly requires .mp4 format. Please upload an MP4 video or deselect LinkedIn.');
    }
    if (durationSeconds && durationSeconds > 600) {
      throw new BadRequestError(`LinkedIn Video allows a maximum duration of 10 minutes (600 seconds). Your video is ${durationSeconds}s.`);
    }
    if (fileSize && fileSize > 200 * 1024 * 1024) {
      throw new BadRequestError('LinkedIn Video allows a maximum file size of 200 MB.');
    }
  }
}

// Backwards-compatible object export (strictly required by brandkit.logic.js)
export const postLogic = {
  getUserPosts,
  getScheduledPosts,
  publishNow,
  schedulePost,
  createPost,
  uploadVideo,
  uploadThumbnail,
  getAdminPosts,
  getAdminPostAnalytics,
  deletePost,
  syncPendingPostsWithBrandKit,
  updatePostGraphic,
};
