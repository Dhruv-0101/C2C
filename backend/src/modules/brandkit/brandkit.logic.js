import { brandKitRepository } from './brandkit.repository.js';
import { uploadToCloudinaryBuffer } from '../../config/cloudinary.js';

export const brandKitLogic = {
  /**
   * Get user's BrandKit
   */
  getBrandKit: async (userId) => {
    return brandKitRepository.findByUserId(userId);
  },

  /**
   * Create or update user's BrandKit
   */
  updateBrandKit: async (userId, payload, fileBuffer) => {
    let logoUrl = payload.logoUrl || null;
    let avatarUrl = payload.avatarUrl || null;

    // Process file upload or base64 logo if provided
    if (fileBuffer) {
      const uploadResult = await uploadToCloudinaryBuffer(fileBuffer, 'brandflow/logos');
      logoUrl = uploadResult.url;
    } else if (payload.base64Logo) {
      let cleanBase64 = payload.base64Logo;
      if (cleanBase64.includes(';base64,')) {
        cleanBase64 = cleanBase64.split(';base64,').pop();
      }
      const buffer = Buffer.from(cleanBase64, 'base64');
      const uploadResult = await uploadToCloudinaryBuffer(buffer, 'brandflow/logos');
      logoUrl = uploadResult.url;
    }

    if (payload.base64Avatar) {
      let cleanBase64 = payload.base64Avatar;
      if (cleanBase64.includes(';base64,')) {
        cleanBase64 = cleanBase64.split(';base64,').pop();
      }
      const buffer = Buffer.from(cleanBase64, 'base64');
      const uploadResult = await uploadToCloudinaryBuffer(buffer, 'brandflow/avatars');
      avatarUrl = uploadResult.url;
    }

    const dataToSave = {
      businessName: payload.businessName,
      categoryId: payload.categoryId || null,
      logoUrl: logoUrl || payload.logoUrl || null,
      avatarUrl: avatarUrl || payload.avatarUrl || null,
      phone: payload.phone || null,
      whatsapp: payload.whatsapp || null,
      email: payload.email || null,
      instagramHandle: payload.instagramHandle || null,
      facebookHandle: payload.facebookHandle || null,
      address: payload.address || null,
      city: payload.city || null,
      state: payload.state || null,
      country: payload.country || 'India',
      websiteUrl: payload.websiteUrl || null,
      tagline: payload.tagline || null,
    };

    return brandKitRepository.upsertByUserId(userId, dataToSave);
  },
};
