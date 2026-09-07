import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { createDesignStyleSchema } from './design-style.validator.js';
import * as designStyleController from './design-style.controller.js';

const router = Router();

// Public / Authenticated route to get all master design styles
router.get('/', designStyleController.getDesignStyles);

// Authenticated SuperAdmin / SubAdmin Routes
router.post(
  '/',
  authenticate,
  validate(createDesignStyleSchema),
  designStyleController.createDesignStyle
);

router.delete(
  '/:id',
  authenticate,
  designStyleController.deleteDesignStyle
);

export default router;
