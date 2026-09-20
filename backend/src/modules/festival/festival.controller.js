import { HTTP_STATUS } from '../../common/constants/http-status.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';
import * as festivalLogic from './festival.logic.js';

/**
 * GET /api/v1/festivals - Get paginated festivals with search and year filtering
 */
export async function getFestivals(req, res, next) {
  try {
    const result = await festivalLogic.getFestivals(req.query);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Festivals retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/festivals/:id - Get a single festival by ID
 */
export async function getFestivalById(req, res, next) {
  try {
    const festival = await festivalLogic.getFestivalById(req.params.id);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Festival retrieved successfully',
      data: {
        festival,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/festivals - Create a new festival / special day
 */
export async function createFestival(req, res, next) {
  try {
    const festival = await festivalLogic.createFestival({
      ...req.body,
      createdBy: req.user?.id,
      fileBuffer: req.fileBuffer || req.file?.buffer,
    });
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Festival created successfully',
      data: {
        festival,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/festivals/:id - Update an existing festival by ID
 */
export async function updateFestival(req, res, next) {
  try {
    const fileBuffer = req.fileBuffer || req.file?.buffer;
    const festival = await festivalLogic.updateFestival(req.params.id, req.body, fileBuffer);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Festival updated successfully',
      data: {
        festival,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/festivals/:id - Delete a festival by ID
 */
export async function deleteFestival(req, res, next) {
  try {
    const result = await festivalLogic.deleteFestival(req.params.id);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Festival deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
