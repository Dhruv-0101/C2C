import { Router } from 'express';
import * as brandKitController from './brandkit.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { uploadBrandKitFiles } from '../../common/middleware/upload.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { updateBrandKitSchema } from './brandkit.validator.js';

const router = Router();

// ==============================================================================
// 🏢 AUTHENTICATED USER BRANDKIT ENDPOINTS
// ==============================================================================

// All BrandKit endpoints strictly require user authentication
router.use(authenticate);

// 🔍 Fetch active user's BrandKit
router.get('/', brandKitController.getBrandKit);

// ✏️ Create or update user's BrandKit (multipart/form-data with logo, avatar, upiQr)
router.put(
  '/',
  uploadBrandKitFiles,
  validate(updateBrandKitSchema),
  brandKitController.updateBrandKit
);

export default router;
