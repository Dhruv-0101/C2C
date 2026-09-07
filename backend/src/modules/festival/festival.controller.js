import * as festivalLogic from './festival.logic.js';

/**
 * GET /api/v1/festivals - Get all festivals (optionally filtered by year and active status)
 */
export async function getFestivals(req, res, next) {
  try {
    const { year, includeInactive } = req.query;
    const festivals = await festivalLogic.getFestivals(year, includeInactive === 'true');
    res.status(200).json({
      success: true,
      message: 'Festivals retrieved successfully',
      data: {
        festivals,
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
    const festival = await festivalLogic.createFestival(req.body);
    res.status(201).json({
      success: true,
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
    const festival = await festivalLogic.updateFestival(req.params.id, req.body);
    res.status(200).json({
      success: true,
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
    await festivalLogic.deleteFestival(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Festival deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
