import { env } from './env.js';
import axios from 'axios';
import crypto from 'crypto';

/**
 * Upload an image buffer directly to Cloudinary using secure signed upload
 * @param {Buffer} buffer - File buffer from Multer
 * @param {string} folder - Target Cloudinary folder (e.g. 'brandflow/festival-templates')
 * @returns {Promise<{ url: string, public_id: string }>}
 */
export async function uploadToCloudinaryBuffer(buffer, folder = 'brandflow/festival-templates') {
  const cloudName = env.CLOUDINARY_CLOUD_NAME || 'dksdc3q6y';
  const apiKey = env.CLOUDINARY_API_KEY || '116287269373311';
  const apiSecret = env.CLOUDINARY_API_SECRET || 'qlLxvVZDj1CCj1HyoAw7shuxdRM';

  const timestamp = Math.floor(Date.now() / 1000);
  const base64Data = `data:image/png;base64,${buffer.toString('base64')}`;

  // Generate SHA-1 Signature for Cloudinary REST API
  const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

  const formData = new URLSearchParams();
  formData.append('file', base64Data);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return {
      url: response.data.secure_url,
      public_id: response.data.public_id,
      width: response.data.width,
      height: response.data.height,
      format: response.data.format,
    };
  } catch (error) {
    console.error('❌ Cloudinary Upload Error:', error?.response?.data || error.message);
    throw new Error(
      error?.response?.data?.error?.message || 'Failed to upload image to Cloudinary storage.'
    );
  }
}
