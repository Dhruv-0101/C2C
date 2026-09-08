import { frameRepository } from './frame.repository.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../common/helpers/pagination.helper.js';
import { uploadFrameBuffer, uploadFrameOverlayBuffer, uploadFramePreviewBuffer, deleteFromCloudinary } from '../../config/cloudinary.js';

export const frameLogic = {
  /**
   * Get active transparent PNG frames with pagination
   */
  getFrames: async (queryParams = {}) => {
    const pagination = parsePaginationParams(queryParams);
    const { frames, totalCount } = await frameRepository.findPaginated(pagination);

    const paginatedResponse = buildPaginatedResponse({
      items: frames,
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

  getAllFrames: async () => {
    return frameRepository.findAllActive();
  },

  /**
   * Upload new frame (Admin restricted)
   * Strictly uploads transparent PNG frames & overlays to Cloudinary 'brandflow/frames':
   * - WITHOUT Text Overlay -> Cloudinary 'brandflow/frames/overlays'
   * - WITH Text Preview   -> Cloudinary 'brandflow/frames/previews'
   */
  createFrame: async (payload, fileBuffer) => {
    let overlayPngUrl = payload.overlayPngUrl || null;
    let previewUrl = payload.previewUrl || null;

    if (fileBuffer) {
      const uploadResult = await uploadFrameBuffer(fileBuffer);
      overlayPngUrl = uploadResult.url;
      previewUrl = uploadResult.url;
    } else {
      // 1. WITHOUT TEXT: Upload transparent overlay PNG (only vector shapes & badge graphics)
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

      // 2. WITH SAMPLE TEXT: Upload full frame preview PNG (with sample text & details pre-rendered)
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
    }

    if (!overlayPngUrl) {
      overlayPngUrl = previewUrl;
    }
    if (!previewUrl) {
      previewUrl = overlayPngUrl;
    }

    if (!overlayPngUrl) {
      throw new Error('A transparent PNG frame image is required.');
    }

    const frameData = {
      title: payload.title,
      description: payload.description || null,
      overlayPngUrl: overlayPngUrl,
      previewUrl: previewUrl,
      configJson: payload.blueprint || payload.configJson || null,
      isSystem: false,
      isActive: true,
    };

    return frameRepository.create(frameData);
  },

  /**
   * Delete frame and cleanup Cloudinary storage
   */
  deleteFrame: async (id) => {
    const frame = await frameRepository.findById(id);
    if (frame) {
      if (frame.overlayPngUrl) {
        deleteFromCloudinary(frame.overlayPngUrl).catch(() => {});
      }
      if (frame.previewUrl && frame.previewUrl !== frame.overlayPngUrl) {
        deleteFromCloudinary(frame.previewUrl).catch(() => {});
      }
    }
    return frameRepository.delete(id);
  },
};

