import { BadRequestError } from '../errors/custom-errors.js';

/**
 * Middleware to parse base64 or multipart file buffers for template uploads
 */
export function validateImageUpload(req, res, next) {
  // 1. If uploaded as JSON base64 string (supports base64Image, base64Overlay, base64Logo, base64Avatar)
  const base64Input =
    req.body?.base64Image ||
    req.body?.base64Overlay ||
    req.body?.base64Logo ||
    req.body?.base64Avatar;

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
  if (req.body?.overlayPngUrl || req.body?.fileUrl || req.body?.logoUrl || req.body?.avatarUrl) {
    return next();
  }

  // 3. If uploaded via file buffer attachment
  if (req.file && req.file.buffer) {
    req.fileBuffer = req.file.buffer;
    return next();
  }

  // 4. If route allows optional image uploads (e.g. BrandKit profile info updates)
  if (
    req.baseUrl?.includes('brandkit') ||
    req.path === '/brandkit' ||
    req.originalUrl?.includes('brandkit')
  ) {
    return next();
  }

  // If base64 or file buffer missing on mandatory endpoints
  return next(new BadRequestError('Please provide an image file or base64 image string.'));
}
