import { postRepository } from './post.repository.js';
import { uploadToCloudinaryBuffer } from '../../config/cloudinary.js';

export const postLogic = {
  /**
   * Get all posts created by user
   */
  getUserPosts: async (userId) => {
    return postRepository.findByUserId(userId);
  },

  /**
   * Generate & Save new composited post (Template + PNG Frame + BrandKit)
   */
  createPost: async (userId, payload, fileBuffer) => {
    let finalGraphicUrl = payload.finalGraphicUrl || null;

    // Upload composited post image to Cloudinary if provided as buffer or base64
    if (fileBuffer) {
      const uploadResult = await uploadToCloudinaryBuffer(fileBuffer, 'brandflow/posts');
      finalGraphicUrl = uploadResult.url;
    } else if (payload.base64Graphic || payload.base64Image) {
      let cleanBase64 = payload.base64Graphic || payload.base64Image;
      if (cleanBase64.includes(';base64,')) {
        cleanBase64 = cleanBase64.split(';base64,').pop();
      }
      const buffer = Buffer.from(cleanBase64, 'base64');
      const uploadResult = await uploadToCloudinaryBuffer(buffer, 'brandflow/posts');
      finalGraphicUrl = uploadResult.url;
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

    return postRepository.create(postData);
  },

  /**
   * Delete user post
   */
  deletePost: async (id, userId) => {
    return postRepository.delete(id, userId);
  },
};
