import { BadRequestError } from '../errors/custom-errors.js';

/**
 * Middleware to parse base64 or multipart file buffers for template uploads
 */
export function validateImageUpload(req, res, next) {
  // 1. If uploaded as JSON base64 string
  if (req.body && req.body.base64Image) {
    let base64String = req.body.base64Image;
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

  // 2. If uploaded via file buffer attachment
  if (req.file && req.file.buffer) {
    req.fileBuffer = req.file.buffer;
    return next();
  }

  // If base64 or file buffer missing
  return next(new BadRequestError('Please provide an image file or base64 image string.'));
}
