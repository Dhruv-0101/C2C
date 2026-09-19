import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireTabPermission } from '../../common/middleware/role.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { validateOptionalImageUpload } from '../../common/middleware/upload.middleware.js';
import { createFestivalSchema, updateFestivalSchema } from './festival.validator.js';
import * as festivalController from './festival.controller.js';

const router = Router();

// Public / Authenticated route to get all festivals
router.get('/', festivalController.getFestivals);

// Authenticated SuperAdmin / SubAdmin Routes with tab authorization
router.post(
  '/',
  authenticate,
  requireTabPermission('festivals'),
  validateOptionalImageUpload,
  validate(createFestivalSchema),
  festivalController.createFestival
);

router.put(
  '/:id',
  authenticate,
  requireTabPermission('festivals'),
  validateOptionalImageUpload,
  validate(updateFestivalSchema),
  festivalController.updateFestival
);

router.delete(
  '/:id',
  authenticate,
  requireTabPermission('festivals'),
  festivalController.deleteFestival
);

export default router;
