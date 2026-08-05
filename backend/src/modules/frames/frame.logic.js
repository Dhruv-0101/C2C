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
   * Upload new transparent PNG frame (Admin restricted)
   */
  createFrame: async (payload, fileBuffer) => {
    let overlayPngUrl = payload.overlayPngUrl || null;

    if (fileBuffer) {
      const uploadResult = await uploadToCloudinaryBuffer(fileBuffer, 'brandflow/frames');
      overlayPngUrl = uploadResult.url;
    } else if (payload.base64Overlay || payload.base64Image) {
      let cleanBase64 = payload.base64Overlay || payload.base64Image;
      if (cleanBase64.includes(';base64,')) {
        cleanBase64 = cleanBase64.split(';base64,').pop();
      }
      const buffer = Buffer.from(cleanBase64, 'base64');
      const uploadResult = await uploadToCloudinaryBuffer(buffer, 'brandflow/frames');
      overlayPngUrl = uploadResult.url;
    }

    if (!overlayPngUrl) {
      throw new Error('A transparent PNG frame image is required.');
    }

    const frameData = {
      title: payload.title,
      description: payload.description || null,
      overlayPngUrl: overlayPngUrl,
      configJson: payload.configJson || null,
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
