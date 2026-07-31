import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { createFestivalSchema } from './festival.validator.js';
import * as festivalController from './festival.controller.js';

const router = Router();

// Public / Authenticated route to get all festivals
router.get('/', festivalController.getFestivals);

// Authenticated SuperAdmin / SubAdmin Routes
router.post(
  '/',
  authenticate,
  validate(createFestivalSchema),
  festivalController.createFestival
);

router.delete(
  '/:id',
  authenticate,
  festivalController.deleteFestival
);

export default router;
