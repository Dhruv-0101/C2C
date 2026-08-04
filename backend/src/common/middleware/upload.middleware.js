import { BadRequestError } from '../errors/custom-errors.js';

/**
 * Middleware to parse base64 or multipart file buffers for template uploads
 */
export function validateImageUpload(req, res, next) {
  // 1. If uploaded as JSON base64 string (supports base64Image or base64Overlay)
  const base64Input = req.body?.base64Image || req.body?.base64Overlay;
  if (base64Input) {
    let base64String = base64Input;
    if (base64String.includes(';base64,')) {
      base64String = base64String.split(';base64,').pop();
    }
    const buffer = Buffer.from(base64String, 'base64');
    if (buffer.length === 0) {
      return next(new BadRequestError('Invalid or corrupt image buffer provided.'));
    }
    req.fileBuffer = buffer;
    return next();
  }

  // 2. If direct URL passed
  if (req.body?.overlayPngUrl || req.body?.fileUrl) {
    return next();
  }

  // 2. If uploaded via file buffer attachment
  if (req.file && req.file.buffer) {
    req.fileBuffer = req.file.buffer;
    return next();
  }

  // If base64 or file buffer missing
  return next(new BadRequestError('Please provide an image file or base64 image string.'));
}
