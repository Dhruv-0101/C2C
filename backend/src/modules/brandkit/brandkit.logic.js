import * as brandKitRepository from './brandkit.repository.js';
import {
  uploadLogoBuffer,
  uploadAvatarBuffer,
  deleteFromCloudinary,
} from '../../config/cloudinary.js';
import { logger } from '../../config/logger.js';
import { postLogic } from '../post/post.logic.js';
import { sanitizeBrandKit } from './brandkit.helper.js';
import {
  DEFAULT_COUNTRY,
  DEFAULT_CAPTION_LANGUAGE,
  DEFAULT_BRAND_KIT_FALLBACK,
} from './brandkit.constants.js';

/**
 * 🏢 BRANDKIT BUSINESS LOGIC
 * Encapsulates identity management, Cloudinary asset storage, and automatic post synchronization.
 */

/**
 * Get user's BrandKit (with structured default fallback if not created yet)
 * @param {string} userId - Authenticated user UUID
 * @returns {Promise<Object>} Sanitized BrandKit object
 */
export async function getBrandKit(userId) {
  const brandKit = await brandKitRepository.findBrandKitByUserId(userId);
  if (!brandKit) {
    return sanitizeBrandKit({
      userId,
      ...DEFAULT_BRAND_KIT_FALLBACK,
    });
  }
  return sanitizeBrandKit(brandKit);
}

/**
 * Create or update user's BrandKit
 * Strictly enforces:
 * - Brand Logos -> Cloudinary 'brandflow/logos'
 * - User Avatars -> Cloudinary 'brandflow/avatars'
 * - Automatically deletes previous logo/avatar from Cloudinary storage upon replacement
 * - Automatically syncs pending scheduled & draft posts with updated brand details
 * 
 * @param {string} userId - Authenticated user UUID
 * @param {Object} payload - Validated update payload
 * @param {Buffer} [fileBuffer] - Optional multipart file buffer for logo
 * @returns {Promise<Object>} Sanitized BrandKit object with synced post counts
 */
export async function updateBrandKit(userId, payload, fileBuffer) {
  // Fetch existing BrandKit to check for previous logo/avatar for clean deletion
  const existingBrandKit = await brandKitRepository.findBrandKitByUserId(userId);

  let logoUrl = payload.logoUrl?.trim() || null;
  let avatarUrl = payload.avatarUrl?.trim() || null;

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
      logger.warn(`Failed to cleanup old logo from Cloudinary: ${err.message}`)
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
      logger.warn(`Failed to cleanup old avatar from Cloudinary: ${err.message}`)
    );
  }

  let upiQrUrl = payload.upiQrUrl?.trim() || null;

  // 3. Process UPI QR Image upload (Base64 string) -> Cloudinary brandflow/logos
  if (payload.base64UpiQr) {
    let cleanBase64 = payload.base64UpiQr;
    if (cleanBase64.includes(';base64,')) {
      cleanBase64 = cleanBase64.split(';base64,').pop();
    }
    const buffer = Buffer.from(cleanBase64, 'base64');
    const uploadResult = await uploadLogoBuffer(buffer);
    upiQrUrl = uploadResult.url;
  }

  if (upiQrUrl && existingBrandKit?.upiQrUrl && existingBrandKit.upiQrUrl !== upiQrUrl) {
    deleteFromCloudinary(existingBrandKit.upiQrUrl).catch((err) =>
      logger.warn(`Failed to cleanup old UPI QR from Cloudinary: ${err.message}`)
    );
  }

  const dataToSave = {
    businessName: payload.businessName.trim(),
    categoryId: payload.categoryId?.trim() || null,
    logoUrl,
    avatarUrl,
    phone: payload.phone?.trim() || null,
    whatsapp: payload.whatsapp?.trim() || null,
    email: payload.email?.trim() || null,
    instagramHandle: payload.instagramHandle?.trim() || null,
    facebookHandle: payload.facebookHandle?.trim() || null,
    address: payload.address?.trim() || null,
    city: payload.city?.trim() || null,
    state: payload.state?.trim() || null,
    country: payload.country?.trim() || DEFAULT_COUNTRY,
    tagline: payload.tagline?.trim() || null,
    targetAudience: payload.targetAudience?.trim() || null,
    captionLanguage: payload.captionLanguage?.trim() || DEFAULT_CAPTION_LANGUAGE,
    businessUsps: payload.businessUsps?.trim() || null,
    linkedinHandle: payload.linkedinHandle?.trim() || null,
    gmbReviewUrl: payload.gmbReviewUrl?.trim() || null,
    upiVpa: payload.upiVpa?.trim() || null,
    upiQrUrl,
    workingHours: payload.workingHours?.trim() || null,
  };

  const updatedBrandKit = await brandKitRepository.upsertBrandKitByUserId(userId, dataToSave);

  // Auto-Sync pending draft & scheduled posts with updated BrandKit details
  let syncedCount = 0;
  try {
    const syncResult = await postLogic.syncPendingPostsWithBrandKit(userId, updatedBrandKit);
    syncedCount = syncResult?.updatedCount || 0;
  } catch (syncErr) {
    logger.warn(`Failed to auto-sync pending posts with updated BrandKit: ${syncErr.message}`);
  }

  return sanitizeBrandKit({
    ...updatedBrandKit,
    syncedPendingPostsCount: syncedCount,
  });
}
