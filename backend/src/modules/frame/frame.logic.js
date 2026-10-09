import { BadRequestError, NotFoundError } from '../../common/errors/custom-errors.js';
import * as frameRepository from './frame.repository.js';
import { sanitizeFrame, sanitizeFrames, createSvgOverlayUri } from './frame.helper.js';
import {
  DEFAULT_FRAME_SORT_BY,
  DEFAULT_FRAME_SORT_ORDER,
} from './frame.constants.js';
import {
  parsePaginationParams,
  buildPaginatedResponse,
} from '../../common/helpers/pagination.helper.js';
import {
  uploadFrameBuffer,
  uploadFrameOverlayBuffer,
  uploadFramePreviewBuffer,
  deleteFromCloudinary,
} from '../../config/cloudinary.js';
import { logger } from '../../config/logger.js';
import { getOrSetCache, deleteCachePattern } from '../../common/utils/cache.util.js';
import { CACHE_KEYS, CACHE_TTL } from '../../common/constants/cache.constants.js';

/**
 * 🖼️ FRAME BUSINESS LOGIC LAYER
 * Encapsulates all business rules, Cloudinary buffer uploads, and data sanitization for Frames.
 * Zero HTTP or Prisma code leaks into this layer.
 */

/**
 * Get active transparent PNG frames with pagination, search, and sorting (Redis Cached)
 * @param {Object} [queryParams={}]
 * @returns {Promise<{ data: { frames: Array<Object> }, meta: Object }>}
 */
export async function getFrames(queryParams = {}) {
  const cacheKey = CACHE_KEYS.FRAMES_LIST(queryParams);

  return getOrSetCache(
    cacheKey,
    async () => {
      const pagination = parsePaginationParams(queryParams, 100, 500);
      const { frames, totalCount } = await frameRepository.findPaginatedFrames({
        ...pagination,
        search: pagination.search || queryParams.search,
        sortBy: queryParams.sortBy || DEFAULT_FRAME_SORT_BY,
        sortOrder: queryParams.sortOrder
          ? queryParams.sortOrder === 'asc'
            ? 'asc'
            : 'desc'
          : DEFAULT_FRAME_SORT_ORDER,
      });

      const paginatedResponse = buildPaginatedResponse({
        items: sanitizeFrames(frames),
        totalCount,
        page: pagination.page,
        limit: pagination.limit,
      });

      return {
        data: {
          frames: paginatedResponse.data,
        },
        meta: paginatedResponse.meta,
      };
    },
    CACHE_TTL.ONE_HOUR
  );
}

/**
 * Get single frame by ID (Redis Cached)
 * @param {string} id - Frame UUID
 * @returns {Promise<Object>}
 */
export async function getFrameById(id) {
  const cacheKey = CACHE_KEYS.FRAME_BY_ID(id);

  return getOrSetCache(
    cacheKey,
    async () => {
      const frame = await frameRepository.findFrameById(id);
      if (!frame) {
        throw new NotFoundError('Frame not found');
      }
      return sanitizeFrame(frame);
    },
    CACHE_TTL.ONE_HOUR
  );
}

/**
 * Upload and create a new frame (Admin / SubAdmin restricted)
 * Strictly uploads transparent PNG frames & overlays to Cloudinary:
 * - WITHOUT Text Overlay -> Cloudinary 'brandflow/frames/overlays'
 * - WITH Text Preview   -> Cloudinary 'brandflow/frames/previews'
 * 
 * @param {Object} payload - Frame creation payload
 * @param {Buffer} [fileBuffer] - Optional multipart file buffer
 * @param {string} [createdBy] - User ID of creator
 * @returns {Promise<Object>}
 */
export async function createFrame(payload = {}, fileBuffer = null, createdBy = null) {
  const targetCreator = createdBy || payload.createdBy || null;

  let overlayPngUrl = payload.overlayPngUrl || null;
  let previewUrl = payload.previewUrl || null;

  // 1. WITHOUT TEXT: Upload transparent overlay PNG (vector shapes & badge graphics)
  // Saved to: Cloudinary 'brandflow/frames/overlays' (Used for live canvas rendering on frontend)
  if (payload.base64Overlay) {
    let cleanOverlayBase64 = payload.base64Overlay;
    if (cleanOverlayBase64.includes(';base64,')) {
      cleanOverlayBase64 = cleanOverlayBase64.split(';base64,').pop();
    }
    const overlayBuffer = Buffer.from(cleanOverlayBase64, 'base64');
    const overlayResult = await uploadFrameOverlayBuffer(overlayBuffer);
    overlayPngUrl = overlayResult.url;
  }

  // 2. WITH SAMPLE TEXT: Upload full frame preview PNG (sample text & details pre-rendered)
  // Saved to: Cloudinary 'brandflow/frames/previews' (Used for thumbnail/gallery preview)
  if (payload.base64Image) {
    let cleanImageBase64 = payload.base64Image;
    if (cleanImageBase64.includes(';base64,')) {
      cleanImageBase64 = cleanImageBase64.split(';base64,').pop();
    }
    const imageBuffer = Buffer.from(cleanImageBase64, 'base64');
    const imageResult = await uploadFramePreviewBuffer(imageBuffer);
    previewUrl = imageResult.url;
  }

  // 3. Fallback to multipart fileBuffer if no base64Overlay was sent (e.g. direct file upload form)
  if (!overlayPngUrl && (fileBuffer || payload.fileBuffer)) {
    const rawBuffer = fileBuffer || payload.fileBuffer;
    const uploadResult = await uploadFrameOverlayBuffer(rawBuffer);
    overlayPngUrl = uploadResult.url;
    if (!previewUrl) {
      previewUrl = uploadResult.url;
    }
  }

  // 4. Guaranteed Transparent Overlay: If no raster overlay exists, create transparent SVG overlay from blueprint
  const configElements = payload.blueprint || payload.configJson?.elements || payload.configJson;
  if (!overlayPngUrl && configElements) {
    overlayPngUrl = createSvgOverlayUri(configElements);
  }

  // 5. Preview defaults to overlay (never allow overlay to fall back to an opaque preview!)
  if (!previewUrl && overlayPngUrl) {
    previewUrl = overlayPngUrl;
  }

  if (!overlayPngUrl) {
    throw new BadRequestError('A transparent PNG or vector frame overlay is required.');
  }

  const frameData = {
    title: payload.title?.trim(),
    description: payload.description?.trim() || null,
    overlayPngUrl,
    previewUrl,
    configJson: payload.blueprint || payload.configJson || null,
    isActive: true,
    createdBy: targetCreator,
  };

  const created = await frameRepository.createFrame(frameData);

  // Purge frame caches
  await deleteCachePattern(CACHE_KEYS.FRAME_PATTERN);

  return sanitizeFrame(created);
}

/**
 * Soft delete frame and cleanup Cloudinary storage assets
 * @param {string} id - Frame UUID
 * @returns {Promise<{ success: boolean, id: string }>}
 */
export async function deleteFrame(id) {
  const frame = await frameRepository.findFrameById(id, { includeInactive: true });
  if (!frame) {
    throw new NotFoundError('Frame not found');
  }

  // Non-blocking Cloudinary assets cleanup with logged diagnostics
  if (frame.overlayPngUrl) {
    deleteFromCloudinary(frame.overlayPngUrl).catch((err) => {
      logger.warn(`Failed to cleanup frame overlay from Cloudinary: ${err.message}`);
    });
  }
  if (frame.previewUrl && frame.previewUrl !== frame.overlayPngUrl) {
    deleteFromCloudinary(frame.previewUrl).catch((err) => {
      logger.warn(`Failed to cleanup frame preview from Cloudinary: ${err.message}`);
    });
  }

  await frameRepository.softDeleteFrameById(id);

  // Purge frame caches
  await deleteCachePattern(CACHE_KEYS.FRAME_PATTERN);

  return { success: true, id };
}

// Backwards-compatible object export
export const frameLogic = {
  getFrames,
  getFrameById,
  createFrame,
  deleteFrame,
};

