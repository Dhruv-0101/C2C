import { Router } from 'express';
import { brandKitController } from './brandkit.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { validateOptionalImageUpload } from '../../common/middleware/upload.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { updateBrandKitSchema } from './brandkit.validator.js';

const router = Router();

// All brandkit endpoints require authentication
router.use(authenticate);

router.get('/', brandKitController.getBrandKit);
router.put(
  '/',
  validateOptionalImageUpload,
  validate(updateBrandKitSchema),
  brandKitController.updateBrandKit
);

export default router;
