import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireTabPermission } from '../../common/middleware/role.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { uploadSingleImage } from '../../common/middleware/upload.middleware.js';
import { FESTIVAL_TAB_PERMISSION } from './festival.constants.js';
import {
  getFestivalsQuerySchema,
  getFestivalByIdSchema,
  createFestivalSchema,
  updateFestivalSchema,
  deleteFestivalSchema,
} from './festival.validator.js';
import * as festivalController from './festival.controller.js';

const router = Router();

// Public / Authenticated route to get all festivals with optional year / active filters
router.get('/', validate(getFestivalsQuerySchema), festivalController.getFestivals);

// Public / Authenticated route to get a single festival by ID
router.get('/:id', validate(getFestivalByIdSchema), festivalController.getFestivalById);

// Authenticated SuperAdmin / SubAdmin Routes with tab authorization
router.post(
  '/',
  authenticate,
  requireTabPermission(FESTIVAL_TAB_PERMISSION),
  uploadSingleImage('banner'),
  validate(createFestivalSchema),
  festivalController.createFestival
);

router.put(
  '/:id',
  authenticate,
  requireTabPermission(FESTIVAL_TAB_PERMISSION),
  uploadSingleImage('banner'),
  validate(updateFestivalSchema),
  festivalController.updateFestival
);

router.delete(
  '/:id',
  authenticate,
  requireTabPermission(FESTIVAL_TAB_PERMISSION),
  validate(deleteFestivalSchema),
  festivalController.deleteFestival
);

export default router;
