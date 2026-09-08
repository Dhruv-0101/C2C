import { brandKitRepository } from './brandkit.repository.js';
import { uploadLogoBuffer, uploadAvatarBuffer, deleteFromCloudinary } from '../../config/cloudinary.js';

export const brandKitLogic = {
  /**
   * Get user's BrandKit (with default fallback if not created yet)
   */
  getBrandKit: async (userId) => {
    let brandKit = await brandKitRepository.findByUserId(userId);
    if (!brandKit) {
      return {
        userId,
        businessName: 'Sunrise Real Estate',
        phone: '+91 98765 43210',
        whatsapp: '+91 98765 43210',
        address: 'Business Park, MG Road, Mumbai',
        tagline: 'Premium Luxury Homes & Commercial Spaces',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        websiteUrl: 'https://sunriserealestate.com',
      };
    }
    return brandKit;
  },

  /**
   * Create or update user's BrandKit
   * Strictly enforces:
   * - Brand Logos -> Cloudinary 'brandflow/logos'
   * - User Avatars -> Cloudinary 'brandflow/avatars'
   * - Automatically deletes previous logo/avatar from Cloudinary storage upon replacement
   */
  updateBrandKit: async (userId, payload, fileBuffer) => {
    // Fetch existing BrandKit to check for previous logo/avatar for clean deletion
    const existingBrandKit = await brandKitRepository.findByUserId(userId);

    let logoUrl = payload.logoUrl || null;
    let avatarUrl = payload.avatarUrl || null;

    // 1. Process Brand Logo upload (fileBuffer or Base64 string) -> Cloudinary brandflow/logos
    if (fileBuffer) {
      const uploadResult = await uploadLogoBuffer(fileBuffer);
      logoUrl = uploadResult.url;
    } else if (payload.base64Logo) {
      let cleanBase64 = payload.base64Logo;
      if (cleanBase64.includes(';base64,')) {
        cleanBase64 = cleanBase64.split(';base64,').pop();
      }
      const buffer = Buffer.from(cleanBase64, 'base64');
      const uploadResult = await uploadLogoBuffer(buffer);
      logoUrl = uploadResult.url;
    }

    // Deletes previous old logo from Cloudinary if logo changed
    if (logoUrl && existingBrandKit?.logoUrl && existingBrandKit.logoUrl !== logoUrl) {
      deleteFromCloudinary(existingBrandKit.logoUrl).catch((err) =>
        console.warn(`⚠️ Failed to cleanup old logo from Cloudinary: ${err.message}`)
      );
    }

    // 2. Process User Avatar / Profile photo upload (Base64 string) -> Cloudinary brandflow/avatars
    if (payload.base64Avatar) {
      let cleanBase64 = payload.base64Avatar;
      if (cleanBase64.includes(';base64,')) {
        cleanBase64 = cleanBase64.split(';base64,').pop();
      }
      const buffer = Buffer.from(cleanBase64, 'base64');
      const uploadResult = await uploadAvatarBuffer(buffer);
      avatarUrl = uploadResult.url;
    }

    // Deletes previous old avatar photo from Cloudinary if avatar changed
    if (avatarUrl && existingBrandKit?.avatarUrl && existingBrandKit.avatarUrl !== avatarUrl) {
      deleteFromCloudinary(existingBrandKit.avatarUrl).catch((err) =>
        console.warn(`⚠️ Failed to cleanup old avatar from Cloudinary: ${err.message}`)
      );
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
