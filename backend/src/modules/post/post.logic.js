import { postRepository } from './post.repository.js';
import { uploadPostBuffer, deleteFromCloudinary } from '../../config/cloudinary.js';
import { processPostJob, triggerScheduledPostsNow } from '../../jobs/index.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../common/helpers/pagination.helper.js';
import { billingRepository } from '../billing/billing.repository.js';
import { brandKitRepository } from '../brandkit/brandkit.repository.js';
import { ForbiddenError } from '../../common/errors/custom-errors.js';
import { logger } from '../../config/logger.js';

export const postLogic = {
  /**
   * Get paginated posts created by user
   */
  getUserPosts: async (userId, queryParams = {}) => {
    const pagination = parsePaginationParams(queryParams);
    const { posts, totalCount } = await postRepository.findPaginatedByUserId(userId, pagination);

    const paginatedResponse = buildPaginatedResponse({
      items: posts,
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
  },

  /**
   * Get user's scheduled queue with pagination
   */
  getScheduledPosts: async (userId, queryParams = {}) => {
    const pagination = parsePaginationParams(queryParams);
    const { scheduledPosts, totalCount } = await postRepository.findPaginatedScheduledByUserId(userId, pagination);

    const paginatedResponse = buildPaginatedResponse({
      items: scheduledPosts,
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
  },

  /**
   * Instant Live Social Media Publishing
   */
  publishNow: async (userId, payload) => {
    const post = await postLogic.createPost(userId, { ...payload, status: 'PUBLISHING' });

    const jobPayload = {
      postId: post.id,
      userId,
      targetPlatforms: payload.targetPlatforms || ['INSTAGRAM', 'FACEBOOK', 'LINKEDIN'],
      postContent: payload.caption || payload.occasionName || 'Branded Graphic Post',
      graphicUrl: post.finalGraphicUrl,
    };

    const publishResult = await processPostJob(jobPayload);

    return {
      post,
      publishResult,
    };
  },

  /**
   * Schedule Post for Future Date & Time
   */
  schedulePost: async (userId, payload) => {
    const post = await postLogic.createPost(userId, { ...payload, status: 'SCHEDULED' });

    const scheduledDate = new Date(payload.scheduledAt);

    const scheduledPost = await postRepository.createScheduledPost({
      postId: post.id,
      scheduledAt: scheduledDate,
      targetPlatforms: payload.targetPlatforms || ['INSTAGRAM', 'FACEBOOK', 'LINKEDIN'],
      status: 'PENDING',
    });

    return {
      post,
      scheduledPost,
    };
  },

  /**
   * Manual Test Trigger for Cron Worker
   */
  triggerScheduledJobs: async () => {
    return await triggerScheduledPostsNow();
  },

  /**
   * Generate & Save new composited post (Template + PNG Frame + BrandKit)
   * Strictly uploads user created social graphics -> Cloudinary 'brandflow/posts'
   */
  createPost: async (userId, payload, fileBuffer) => {
    let finalGraphicUrl = payload.finalGraphicUrl || null;

    // Upload composited post image buffer or base64 to Cloudinary brandflow/posts
    if (fileBuffer) {
      try {
        const uploadResult = await uploadPostBuffer(fileBuffer);
        finalGraphicUrl = uploadResult.url;
      } catch (err) {
        console.warn(`⚠️ Cloudinary File Buffer Upload Warning: ${err.message}`);
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
        console.warn(`⚠️ Cloudinary Base64 Upload Warning: ${uploadErr.message}`);
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
      const userBrandKit = await brandKitRepository.findByUserId(userId);
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
      status: payload.status || 'DRAFT',
    };

    const createdPost = await postRepository.createWithVault(postData, {
      occasionName: payload.occasionName,
      categoryName: payload.categoryName,
      targetPlatforms: payload.targetPlatforms,
      caption: payload.caption || null,
    });

    // 2. Consume 1 post credit immediately upon post creation
    await billingRepository.incrementPostsUsed(userId).catch((err) => {
      logger.warn(`Failed to increment post quota for user ${userId}: ${err.message}`);
    });

    return createdPost;
  },

  /**
   * Enterprise Admin: Get all posts created across platform with multi-dimensional filters
   */
  getAdminPosts: async (queryParams = {}) => {
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
      items: posts,
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
  },

  /**
   * Enterprise Admin: Get aggregated volume analytics and distribution breakdowns
   * "Kitni bani hai" - Total count, by Category, by Frame, by Template, by Festival, by Status, Top Creators
   */
  getAdminPostAnalytics: async () => {
    const analytics = await postRepository.getPostAnalytics();
    return {
      data: analytics,
    };
  },

  /**
   * Delete user post and cleanup Cloudinary storage
   */
  deletePost: async (id, userId) => {
    const post = await postRepository.findById(id);
    if (post?.finalGraphicUrl) {
      deleteFromCloudinary(post.finalGraphicUrl).catch((err) =>
        logger.warn(`Failed to cleanup post graphic from Cloudinary: ${err.message}`)
      );
    }
    return postRepository.delete(id, userId);
  },

  /**
   * Auto-Sync user's pending scheduled & draft posts when BrandKit details are updated
   */
  syncPendingPostsWithBrandKit: async (userId, updatedBrandKit) => {
    const pendingPosts = await postRepository.findPendingPostsByUserId(userId);
    let updatedCount = 0;

    for (const post of pendingPosts) {
      let config = post.userConfigJson || {};
      if (typeof config === 'string') {
        try {
          config = JSON.parse(config);
        } catch (e) {}
      }

      // Update brand details inside userConfigJson
      config.brandKit = {
        businessName: updatedBrandKit.businessName,
        phone: updatedBrandKit.phone,
        whatsapp: updatedBrandKit.whatsapp,
        address: updatedBrandKit.address,
        city: updatedBrandKit.city,
        logoUrl: updatedBrandKit.logoUrl,
        avatarUrl: updatedBrandKit.avatarUrl,
        tagline: updatedBrandKit.tagline,
      };

      // Also update dynamicText and dynamicImages overrides inside userConfigJson if present
      if (config.dynamicText) {
        if (updatedBrandKit.phone && config.dynamicText.phone !== undefined) {
          config.dynamicText.phone = updatedBrandKit.phone;
        }
        if (updatedBrandKit.address && config.dynamicText.address !== undefined) {
          config.dynamicText.address = updatedBrandKit.address;
        }
        if (updatedBrandKit.businessName && config.dynamicText.businessName !== undefined) {
          config.dynamicText.businessName = updatedBrandKit.businessName;
        }
      }

      if (config.dynamicImages && updatedBrandKit.logoUrl) {
        if (config.dynamicImages.logo !== undefined) {
          config.dynamicImages.logo = updatedBrandKit.logoUrl;
        }
      }

      await postRepository.updatePostConfigAndGraphic(post.id, config, null);
      updatedCount++;
    }

    return { updatedCount };
  },
};

