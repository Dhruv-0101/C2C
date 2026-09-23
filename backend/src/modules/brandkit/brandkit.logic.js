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
export async function updateBrandKit(userId, payload, fileBufferOrFiles) {
  // Fetch existing BrandKit to check for previous logo/avatar for clean deletion
  const existingBrandKit = await brandKitRepository.findBrandKitByUserId(userId);

  let logoUrl = payload.logoUrl?.trim() || null;
  let avatarUrl = payload.avatarUrl?.trim() || null;
  let upiQrUrl = payload.upiQrUrl?.trim() || null;

  // Resolve file buffers whether passed as single buffer or object
  const logoBuffer = Buffer.isBuffer(fileBufferOrFiles)
    ? fileBufferOrFiles
    : fileBufferOrFiles?.logo || null;
  const avatarBuffer = fileBufferOrFiles?.avatar || null;
  const upiQrBuffer = fileBufferOrFiles?.upiQr || null;

  // 1. Process Brand Logo upload from multipart buffer -> Cloudinary brandflow/logos
  if (logoBuffer) {
    const uploadResult = await uploadLogoBuffer(logoBuffer);
    logoUrl = uploadResult.url;
  }

  // Deletes previous old logo from Cloudinary if logo changed
  if (logoUrl && existingBrandKit?.logoUrl && existingBrandKit.logoUrl !== logoUrl) {
    deleteFromCloudinary(existingBrandKit.logoUrl).catch((err) =>
      logger.warn(`Failed to cleanup old logo from Cloudinary: ${err.message}`)
    );
  }

  // 2. Process User Avatar / Profile photo upload from multipart buffer -> Cloudinary brandflow/avatars
  if (avatarBuffer) {
    const uploadResult = await uploadAvatarBuffer(avatarBuffer);
    avatarUrl = uploadResult.url;
  }

  // Deletes previous old avatar photo from Cloudinary if avatar changed
  if (avatarUrl && existingBrandKit?.avatarUrl && existingBrandKit.avatarUrl !== avatarUrl) {
    deleteFromCloudinary(existingBrandKit.avatarUrl).catch((err) =>
      logger.warn(`Failed to cleanup old avatar from Cloudinary: ${err.message}`)
    );
  }

  // 3. Process UPI QR Image upload from multipart buffer -> Cloudinary brandflow/logos
  if (upiQrBuffer) {
    const uploadResult = await uploadLogoBuffer(upiQrBuffer);
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
