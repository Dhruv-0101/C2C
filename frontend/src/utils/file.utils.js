/**
 * Utility functions for client-side file reading and image processing.
 */



/**
 * Creates an instant, zero-memory-copy object URL for previewing a local file.
 * Automatically validates maximum file size.
 *
 * @param {File} file - The file selected from an <input type="file"> element.
 * @param {number} [maxSizeMB=5] - Maximum allowed file size in Megabytes.
 * @returns {string} Temporary Object URL (blob:...)
 */
export const createImagePreview = (file, maxSizeMB = 5) => {
  if (!file) throw new Error("No file provided.");
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`Image size must be smaller than ${maxSizeMB}MB.`);
  }
  return URL.createObjectURL(file);
};

