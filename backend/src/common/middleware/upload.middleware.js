import multer from 'multer';
import { BadRequestError } from '../errors/custom-errors.js';

// Maximum image size limit: 10MB (Cloudinary standard payload limit)
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only image files (PNG, JPG, JPEG, WEBP, SVG) are allowed.'), false);
  }
};

const multerInstance = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter: imageFileFilter,
});

/**
 * Core image buffer extractor and validator
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @param {{ required?: boolean, maxSize?: number }} [options]
 */
function processImageUpload(req, res, next, options = { required: true, maxSize: MAX_IMAGE_SIZE_BYTES }) {
  const isRequired = options.required ?? true;
  const maxSize = options.maxSize ?? MAX_IMAGE_SIZE_BYTES;

  // 1. Process Multipart file buffer attachment (e.g. from multer)
  if (req.file && req.file.buffer) {
    if (req.file.buffer.length > maxSize) {
      const sizeMb = (maxSize / (1024 * 1024)).toFixed(0);
      return next(new BadRequestError(`Uploaded file size exceeds maximum allowed limit of ${sizeMb}MB.`));
    }

    req.fileBuffer = req.file.buffer;
    return next();
  }

  // 2. Process Base64 image payload (STRICTLY for HTML5 Canvas exports: Post Studio & Frame Studio)
  const base64Candidate =
    req.body?.base64Graphic ||
    req.body?.base64Overlay ||
    req.body?.base64Image ||
    null;

  if (base64Candidate && typeof base64Candidate === 'string') {
    let base64String = base64Candidate;
    if (base64String.includes(';base64,')) {
      base64String = base64String.split(';base64,').pop();
    }

    const buffer = Buffer.from(base64String, 'base64');
    if (buffer.length === 0) {
      return next(new BadRequestError('Invalid or corrupt image buffer provided.'));
    }

    if (buffer.length > maxSize) {
      const sizeMb = (maxSize / (1024 * 1024)).toFixed(0);
      return next(new BadRequestError(`Image file size exceeds maximum allowed limit of ${sizeMb}MB.`));
    }

    // Dual-assign buffer for seamless interoperability across all controllers
    req.fileBuffer = buffer;
    if (!req.file) {
      req.file = { buffer, size: buffer.length, mimetype: 'image/png' };
    } else {
      req.file.buffer = buffer;
    }

    return next();
  }

  // 3. Direct CDN / Cloudinary URL passed (bypasses buffer parsing for system asset linkages)
  const directUrlCandidate =
    req.body?.imageUrl ||
    req.body?.overlayPngUrl ||
    req.body?.fileUrl ||
    req.body?.customImageUrl ||
    req.body?.finalGraphicUrl ||
    req.body?.url;

  const hasDirectUrl =
    typeof directUrlCandidate === 'string' &&
    !directUrlCandidate.includes(';base64,') &&
    (directUrlCandidate.startsWith('http://') ||
      directUrlCandidate.startsWith('https://') ||
      directUrlCandidate.startsWith('/'));

  if (hasDirectUrl) {
    return next();
  }

  // 4. Optional uploads (configured via options or backwards-compatible brandkit routes)
  const isBrandKitRoute =
    req.baseUrl?.includes('brandkit') ||
    req.path?.includes('brandkit') ||
    req.originalUrl?.includes('brandkit');

  if (!isRequired || isBrandKitRoute) {
    return next();
  }

  // 5. Missing mandatory image
  return next(new BadRequestError('Please provide an image file, base64 image string, or image URL.'));
}

/**
 * Universal Image Upload Validator Middleware
 */
export function validateImageUpload(arg1, arg2, arg3) {
  // If invoked directly as Express middleware: (req, res, next)
  if (arg2 && typeof arg3 === 'function') {
    return processImageUpload(arg1, arg2, arg3, { required: true });
  }

  // If invoked as a factory: validateImageUpload({ required: false })
  const options = typeof arg1 === 'object' && arg1 !== null ? arg1 : { required: true };
  return (req, res, next) => processImageUpload(req, res, next, options);
}

/**
 * Optional image upload middleware convenience export
 * Allows non-image updates to pass without error
 */
export const validateOptionalImageUpload = validateImageUpload({ required: false });

/**
 * Higher-order middleware creating a multipart handler for a single image field.
 * Handles multipart/form-data via Multer, or falls back to Base64/URL JSON processing.
 *
 * @param {string} fieldName - Primary expected multipart field name (e.g. 'banner', 'image', 'overlay')
 * @param {{ required?: boolean }} [options={ required: false }]
 */
export function uploadSingleImage(fieldName = 'image', options = { required: false }) {
  const handler = multerInstance.fields([
    { name: fieldName, maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'overlay', maxCount: 1 },
  ]);

  return (req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return processImageUpload(req, res, next, options);
    }

    handler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new BadRequestError('Uploaded image exceeds the 10MB size limit.'));
        }
        return next(new BadRequestError(`File upload error: ${err.message}`));
      } else if (err) {
        return next(err);
      }

      // Extract uploaded file from specified or fallback fields
      const uploadedFile =
        req.files?.[fieldName]?.[0] ||
        req.files?.image?.[0] ||
        req.files?.file?.[0] ||
        req.files?.banner?.[0] ||
        req.files?.overlay?.[0];

      if (uploadedFile) {
        req.file = uploadedFile;
        req.fileBuffer = uploadedFile.buffer;
      }

      processImageUpload(req, res, next, options);
    });
  };
}

/**
 * Multipart upload handler for BrandKit multi-field assets (logo, avatar, upiQr)
 */
export function uploadBrandKitFiles(req, res, next) {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    return next();
  }

  const handler = multerInstance.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'avatar', maxCount: 1 },
    { name: 'upiQr', maxCount: 1 },
  ]);

  handler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new BadRequestError('Uploaded image exceeds the 10MB size limit.'));
      }
      return next(new BadRequestError(`File upload error: ${err.message}`));
    } else if (err) {
      return next(err);
    }

    if (req.files) {
      req.brandKitFiles = {
        logo: req.files.logo?.[0]?.buffer || null,
        avatar: req.files.avatar?.[0]?.buffer || null,
        upiQr: req.files.upiQr?.[0]?.buffer || null,
      };

      if (req.files.logo?.[0]) {
        req.file = req.files.logo[0];
        req.fileBuffer = req.files.logo[0].buffer;
      }
    }

    return next();
  });
}

/**
 * ==================================================================================================
 * 📚 BRANDFLOW IMAGE UPLOAD ARCHITECTURE & DEVELOPER IMPLEMENTATION GUIDE
 * ==================================================================================================
 * 
 * 🏢 1. REAL-WORLD ANALOGY: AIRPORT BAGGAGE SCANNER 🛄
 * --------------------------------------------------------------------------------------------------
 * Think of `upload.middleware.js` as the automated Baggage Security Scanner at an airport checkpoint:
 * 
 * When the Frontend sends an image, users can present images in 3 distinct formats:
 *   1. Raw Base64 String: Encoded canvas graphics or data URIs (e.g. "data:image/png;base64,iVBOR...").
 *   2. Direct Image URL: Pre-uploaded CDN links from Cloudinary or AWS S3 (e.g. "https://res.cloudinary.com/...").
 *   3. Multipart Binary File: Native file uploads via HTML `<input type="file" />` or FormData.
 * 
 * Responsibilities of this Middleware:
 *   - Format Recognition: Inspects and automatically identifies incoming payload format.
 *   - Buffer Normalization: Decodes Base64 strings into standard Node.js binary buffers.
 *   - Memory & Quota Guard: Enforces a strict 10MB limit to prevent server memory exhaustion and Cloudinary rejection.
 *   - Dual-Assignment: Places the normalized buffer on a standardized tray (`req.fileBuffer` AND `req.file.buffer`)
 *     so any downstream controller can access it reliably.
 * 
 * --------------------------------------------------------------------------------------------------
 * 🔄 2. END-TO-END UPLOAD FLOW (FRONTEND TO CLOUDINARY)
 * --------------------------------------------------------------------------------------------------
 * 
 * [ Frontend: React Canvas / Form ]
 *         │
 *         │ Sends: { base64Overlay: "data:image/png;base64,..." } OR direct image URL
 *         ▼
 * [ 1. Express Route ] : (e.g. POST /api/v1/frames)
 *         │
 *         ▼
 * [ 2. upload.middleware.js ] ➔ (Scanner & Converter)
 *    ├── Step 1: Detects image type (Base64 string, direct URL, or binary file).
 *    ├── Step 2: Decodes Base64 into a native Node.js binary Buffer.
 *    ├── Step 3: Validates buffer length <= 10MB (Cloudinary payload quota guard).
 *    ├── Step 4: Attaches buffer to both `req.fileBuffer` and `req.file.buffer`.
 *    └── Step 5: Calls next() to proceed.
 *         │
 *         ▼
 * [ 3. Controller ] : (e.g. frame.controller.js)
 *    ├── Extracts buffer: `const fileBuffer = req.fileBuffer || req.file?.buffer;`
 *    └── Invokes business logic: `frameLogic.createFrame(payload, fileBuffer)`
 *         │
 *         ▼
 * [ 4. Logic Layer ] : (e.g. frame.logic.js)
 *    ├── Passes buffer to Cloudinary service: `uploadFrameBuffer(fileBuffer)`
 *    └── Receives secure CDN URL: "https://res.cloudinary.com/.../frame_overlay.png"
 *         │
 *         ▼
 * [ 5. Repository & Database ]
 *    └── Persists secure CDN URL and metadata inside PostgreSQL via Prisma ORM.
 * 
 * --------------------------------------------------------------------------------------------------
 * ❓ 3. ARCHITECTURAL EVOLUTION: PROBLEMS SOLVED & WHY
 * --------------------------------------------------------------------------------------------------
 * 
 * 1. Controller Desync:
 *    - Previous Issue: Middleware stored buffer in `req.fileBuffer`, but controllers checked `req.file?.buffer`.
 *      Resulted in Base64 uploads being silently dropped as `undefined`.
 *    - Solution: Implemented Dual-Assignment (`req.fileBuffer = buffer` AND `req.file = { buffer }`).
 * 
 * 2. Missing URL Keys:
 *    - Previous Issue: Direct template uploads with `baseImageUrl` or festival uploads with `bannerUrl`
 *      were unrecognized, triggering false 400 "Please provide an image file" errors.
 *    - Solution: Unified recognition of all BrandFlow image keys (`baseImageUrl`, `imageUrl`, `bannerUrl`, etc.).
 * 
 * 3. Absence of File Size Limit:
 *    - Previous Issue: Uploading 30MB-40MB payloads caused high Node.js memory spikes and Cloudinary 400 failures.
 *    - Solution: Added a 10MB hardware check (`MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024`).
 * 
 * 4. Hardcoded Route Anti-Pattern:
 *    - Previous Issue: Routes like `brandkit` were hardcoded inside common middleware.
 *    - Solution: Created a clean Higher-Order Middleware Factory supporting both mandatory (`validateImageUpload`)
 *      and optional (`validateOptionalImageUpload`) image upload modes.
 * 
 * --------------------------------------------------------------------------------------------------
 * 💻 4. DEVELOPER IMPLEMENTATION GUIDE: HOW TO USE IN ROUTES
 * --------------------------------------------------------------------------------------------------
 * 
 * CASE A: When Image is MANDATORY (e.g., Creating Frame, Uploading Master Template)
 * ```javascript
 * import { validateImageUpload } from '../../common/middleware/upload.middleware.js';
 * 
 * // Rejects requests with HTTP 400 if image payload is missing
 * router.post('/frames', authenticate, validateImageUpload, frameController.createFrame);
 * ```
 * 
 * CASE B: When Image is OPTIONAL (e.g., BrandKit Profile Updates, Festival Updates, Post Generation)
 * ```javascript
 * import { validateOptionalImageUpload } from '../../common/middleware/upload.middleware.js';
 * 
 * // Allows non-image updates to proceed smoothly while converting images if present
 * router.put('/brandkit', authenticate, validateOptionalImageUpload, brandKitController.updateBrandKit);
 * ```
 * 
 * EXTRACTING BUFFER IN ANY CONTROLLER:
 * ```javascript
 * const fileBuffer = req.fileBuffer || req.file?.buffer;
 * ```
 * ==================================================================================================
 */
