/**
 * Utility functions for client-side file reading and image processing.
 */

/**
 * Reads a local browser File object and converts it to a Base64 data URL.
 * Includes automatic file size validation.
 *
 * @param {File} file - The file selected from an <input type="file"> element.
 * @param {number} [maxSizeMB=5] - Maximum allowed file size in Megabytes (default: 5MB).
 * @returns {Promise<string>} Promise resolving to the Base64 data URL string.
 * @throws {Error} Throws error if file exceeds maxSizeMB or fails to read.
 *
 * @example
 * try {
 *   const base64Image = await readImageAsBase64(file, 5);
 *   setLogoUrl(base64Image);
 * } catch (err) {
 *   console.error(err.message);
 * }
 */
export const readImageAsBase64 = (file, maxSizeMB = 5) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("No file provided."));
    }

    // Validate maximum file size limit
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return reject(
        new Error(`Image size must be smaller than ${maxSizeMB}MB.`),
      );
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read image as Base64 string."));
      }
    };

    reader.onerror = () => {
      reject(new Error("An error occurred while reading the image file."));
    };

    reader.readAsDataURL(file);
  });
};
