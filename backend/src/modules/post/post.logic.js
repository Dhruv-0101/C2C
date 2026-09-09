import { postRepository } from './post.repository.js';
import { uploadPostBuffer, deleteFromCloudinary } from '../../config/cloudinary.js';
import { processPostJob, triggerScheduledPostsNow } from '../../jobs/index.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../common/helpers/pagination.helper.js';

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
   * Instant Mock Social Media Publishing
   */
  publishNow: async (userId, payload) => {
    const post = await postLogic.createPost(userId, { ...payload, status: 'PUBLISHING' });

    const jobPayload = {
      postId: post.id,
      userId,
      targetPlatforms: payload.targetPlatforms || ['INSTAGRAM', 'FACEBOOK', 'LINKEDIN'],
      postContent: payload.customText || payload.occasionName || 'Branded Graphic Post',
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

    const postData = {
      userId,
      templateId: payload.templateId || null,
      festivalId: payload.festivalId || null,
      customText: payload.customText || null,
      offerText: payload.offerText || null,
      finalGraphicUrl: finalGraphicUrl,
      userConfigJson: payload.userConfigJson || null,
      status: payload.status || 'DRAFT',
    };

    return postRepository.createWithVault(postData, {
      occasionName: payload.occasionName,
      categoryName: payload.categoryName,
    });
  },

  /**
   * Delete user post and cleanup Cloudinary storage
   */
  deletePost: async (id, userId) => {
    const post = await postRepository.findById(id);
    if (post?.finalGraphicUrl) {
      deleteFromCloudinary(post.finalGraphicUrl).catch((err) =>
        console.warn(`⚠️ Failed to cleanup post graphic from Cloudinary: ${err.message}`)
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
        websiteUrl: updatedBrandKit.websiteUrl,
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

