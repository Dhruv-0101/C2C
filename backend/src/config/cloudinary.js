import https from 'node:https';
import { env } from './env.js';
import { logger } from './logger.js';
import axios from 'axios';
import crypto from 'crypto';

/**
 * Tuned HTTPS Agent for Cloudinary API requests
 * - keepAlive maintains open connections while keepAliveMsecs ensures stale edge connections are recycled
 * - timeout: 60s avoids dangling requests
 */
const cloudinaryHttpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 10000,
  timeout: 60000,
  maxSockets: 25,
});

/**
 * 📁 STRICT CLOUDINARY FOLDER ARCHITECTURE CONSTANTS
 * Single Source of Truth for Cloudinary Storage Folders.
 * 
 * Rules Enforced:
 * 1. AVATARS ('brandflow/avatars'): Strictly for User Profile Photos & User Avatars.
 * 2. LOGOS ('brandflow/logos'): Strictly for Brand Kit / Business Brand Logos.
 * 3. FESTIVAL_TEMPLATES ('brandflow/festival-templates'): Strictly for Admin Festival Base Graphic Templates.
 * 4. FRAMES ('brandflow/frames'): Strictly for Transparent PNG Frames & Blueprint Overlays.
 *    - FRAMES_OVERLAYS ('brandflow/frames/overlays'): Frame WITHOUT text (raw transparent PNG shape for live user text rendering).
 *    - FRAMES_PREVIEWS ('brandflow/frames/previews'): Frame WITH sample text (full frame preview for thumbnail display).
 * 5. POSTS ('brandflow/posts'): Strictly for Final User Created / Composited Social Media Posts.
 */
export const CLOUDINARY_FOLDERS = Object.freeze({
  AVATARS: 'brandflow/avatars',
  LOGOS: 'brandflow/logos',
  FESTIVAL_TEMPLATES: 'brandflow/festival-templates',
  FESTIVAL_BANNERS: 'brandflow/festivals',
  FRAMES: 'brandflow/frames',
  FRAMES_OVERLAYS: 'brandflow/frames/overlays',
  FRAMES_PREVIEWS: 'brandflow/frames/previews',
  POSTS: 'brandflow/posts',
});

/**
 * Extract Cloudinary public_id from full Cloudinary CDN URL
 * @param {string} url - Full Cloudinary URL
 * @returns {string|null} - Extracted public_id e.g. "brandflow/logos/sample_id"
 */
export function extractPublicIdFromUrl(url) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
    return null;
  }
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    let path = parts[1]; // e.g. "v1725700000/brandflow/logos/abc123xyz.png"
    // Remove version prefix if present (e.g. v1234567/)
    path = path.replace(/^v\d+\//, '');
    // Remove file extension (.png, .jpg, .jpeg, .webp)
    const lastDotIndex = path.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      path = path.substring(0, lastDotIndex);
    }
    return path; // "brandflow/logos/abc123xyz"
  } catch (err) {
    return null;
  }
}

/**
 * Delete an image asset from Cloudinary storage by public_id or full URL
 * @param {string} publicIdOrUrl - Cloudinary public_id or secure_url
 * @returns {Promise<boolean>}
 */
export async function deleteFromCloudinary(publicIdOrUrl) {
  if (!publicIdOrUrl) return false;

  const publicId = publicIdOrUrl.startsWith('http')
    ? extractPublicIdFromUrl(publicIdOrUrl)
    : publicIdOrUrl;

  if (!publicId) return false;

  const cloudName = env.CLOUDINARY_CLOUD_NAME || 'dksdc3q6y';
  const apiKey = env.CLOUDINARY_API_KEY || '116287269373311';
  const apiSecret = env.CLOUDINARY_API_SECRET || 'qlLxvVZDj1CCj1HyoAw7shuxdRM';

  const timestamp = Math.floor(Date.now() / 1000);
  const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

  const formData = new URLSearchParams();
  formData.append('public_id', publicId);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        httpsAgent: cloudinaryHttpsAgent,
        timeout: 30000,
      }
    );

    return response.data.result === 'ok';
  } catch (error) {
    logger.warn(`⚠️ Cloudinary Deletion Warning (Public ID: ${publicId}): ${error?.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Upload an image buffer directly to Cloudinary using secure SHA-1 REST signed upload
 * Includes automated retry mechanism with exponential backoff against transient TLS / socket disconnects
 * @param {Buffer} buffer - Raw file buffer from Multer or Base64 conversion
 * @param {string} folder - Target Cloudinary folder path
 * @returns {Promise<{ url: string, public_id: string, width: number, height: number, format: string }>}
 */
export async function uploadToCloudinaryBuffer(buffer, folder = CLOUDINARY_FOLDERS.FESTIVAL_TEMPLATES) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid image buffer provided for Cloudinary upload.');
  }

  const cloudName = env.CLOUDINARY_CLOUD_NAME || 'dksdc3q6y';
  const apiKey = env.CLOUDINARY_API_KEY || '116287269373311';
  const apiSecret = env.CLOUDINARY_API_SECRET || 'qlLxvVZDj1CCj1HyoAw7shuxdRM';

  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);

      // Generate SHA-1 Signature for Cloudinary REST API on each attempt
      const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

      // Re-create binary multipart payload using fresh FormData & Blob for every attempt
      // (Stream cannot be rewound if disconnected mid-flight)
      const formData = new FormData();
      const blob = new Blob([buffer], { type: 'image/png' });
      formData.append('file', blob, 'upload.png');
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        {
          headers: {},
          httpsAgent: cloudinaryHttpsAgent,
          timeout: 60000,
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );

      return {
        url: response.data.secure_url,
        public_id: response.data.public_id,
        width: response.data.width,
        height: response.data.height,
        format: response.data.format,
      };
    } catch (error) {
      lastError = error;
      const errorMsg = error?.response?.data?.error?.message || error?.message || 'Unknown network error';

      const isTransient =
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNABORTED' ||
        error.code === 'EPIPE' ||
        errorMsg.toLowerCase().includes('socket disconnected') ||
        errorMsg.toLowerCase().includes('tls') ||
        errorMsg.toLowerCase().includes('timeout') ||
        error?.response?.status >= 500 ||
        error?.response?.status === 429;

      if (attempt < maxRetries && isTransient) {
        const backoffMs = attempt * 1000;
        logger.warn(`⚠️ Cloudinary Upload Attempt ${attempt}/${maxRetries} failed (${errorMsg}). Retrying in ${backoffMs}ms with fresh TLS connection...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }

      logger.error(`❌ Cloudinary Upload Error after ${attempt} attempts: ${errorMsg}`);
      throw new Error(errorMsg || 'Failed to upload image to Cloudinary storage.');
    }
  }

  throw lastError || new Error('Failed to upload image to Cloudinary storage after maximum retries.');
}

/**
 * Dedicated helper functions enforcing mandatory target folders for all media assets
 */
export const uploadAvatarBuffer = (buffer) => uploadToCloudinaryBuffer(buffer, CLOUDINARY_FOLDERS.AVATARS);
export const uploadLogoBuffer = (buffer) => uploadToCloudinaryBuffer(buffer, CLOUDINARY_FOLDERS.LOGOS);
export const uploadTemplateBuffer = (buffer) => uploadToCloudinaryBuffer(buffer, CLOUDINARY_FOLDERS.FESTIVAL_TEMPLATES);
export const uploadFestivalBannerBuffer = (buffer) => uploadToCloudinaryBuffer(buffer, CLOUDINARY_FOLDERS.FESTIVAL_BANNERS);
export const uploadFrameBuffer = (buffer, subfolder = '') => {
  const targetFolder = subfolder ? `${CLOUDINARY_FOLDERS.FRAMES}/${subfolder}` : CLOUDINARY_FOLDERS.FRAMES;
  return uploadToCloudinaryBuffer(buffer, targetFolder);
};
export const uploadFrameOverlayBuffer = (buffer) => uploadToCloudinaryBuffer(buffer, CLOUDINARY_FOLDERS.FRAMES_OVERLAYS);
export const uploadFramePreviewBuffer = (buffer) => uploadToCloudinaryBuffer(buffer, CLOUDINARY_FOLDERS.FRAMES_PREVIEWS);
export const uploadPostBuffer = (buffer) => uploadToCloudinaryBuffer(buffer, CLOUDINARY_FOLDERS.POSTS);



