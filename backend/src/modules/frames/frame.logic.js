import { frameRepository } from './frame.repository.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../common/helpers/pagination.helper.js';
import { uploadToCloudinaryBuffer } from '../../config/cloudinary.js';

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
   */
  createFrame: async (payload, fileBuffer) => {
    let overlayPngUrl = payload.overlayPngUrl || null;
    let previewUrl = payload.previewUrl || null;

    if (fileBuffer) {
      const uploadResult = await uploadToCloudinaryBuffer(fileBuffer, 'brandflow/frames');
      overlayPngUrl = uploadResult.url;
      previewUrl = uploadResult.url;
    } else {
      // 1. Upload transparent overlay WITHOUT text (only shapes)
      if (payload.base64Overlay) {
        let cleanOverlayBase64 = payload.base64Overlay;
        if (cleanOverlayBase64.includes(';base64,')) {
          cleanOverlayBase64 = cleanOverlayBase64.split(';base64,').pop();
        }
        const overlayBuffer = Buffer.from(cleanOverlayBase64, 'base64');
        const overlayResult = await uploadToCloudinaryBuffer(overlayBuffer, 'brandflow/frames/overlays');
        overlayPngUrl = overlayResult.url;
      }

      // 2. Upload full frame preview WITH sample text
      if (payload.base64Image) {
        let cleanImageBase64 = payload.base64Image;
        if (cleanImageBase64.includes(';base64,')) {
          cleanImageBase64 = cleanImageBase64.split(';base64,').pop();
        }
        const imageBuffer = Buffer.from(cleanImageBase64, 'base64');
        const imageResult = await uploadToCloudinaryBuffer(imageBuffer, 'brandflow/frames/previews');
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
   * Delete frame
   */
  deleteFrame: async (id) => {
    return frameRepository.delete(id);
  },
};
