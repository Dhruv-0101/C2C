import { api } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

/**
 * AI BrandKit API Service
 * Manages the user's master business branding profile in PostgreSQL database (logos, business details, contact info, owner avatar, primary colors).
 */
export const brandKitApi = {
  /**
   * GET /api/v1/brandkit
   * Fetches the authenticated user's active AI BrandKit record from database.
   *
   * @returns {Promise<Object>} `{ success: boolean, data: { brandKit: Object } }`
   */
  getBrandKit: async () => {
    return api.get(API_ENDPOINTS.BRANDKIT.BASE);
  },

  /**
   * PUT /api/v1/brandkit
   * Creates or updates the authenticated user's Master BrandKit profile in database.
   * Uploads logo images / owner avatar to Cloudinary CDN and saves metadata parameters to DB.
   *
   * @param {Object} data - Business identity payload sent to backend & database
   * @param {string} [data.businessName] - Official business/company name
   * @param {string} [data.phone] - Primary phone number
   * @param {string} [data.whatsapp] - Official WhatsApp business contact
   * @param {string} [data.email] - Public business email
   * @param {string} [data.websiteUrl] - Business website URL
   * @param {string} [data.instagramHandle] - Instagram social handle
   * @param {string} [data.facebookHandle] - Facebook page handle/URL
   * @param {string} [data.address] - Physical business address
   * @param {string} [data.city] - City
   * @param {string} [data.state] - State / Region
   * @param {string} [data.country] - Country
   * @param {string} [data.tagline] - Business slogan or designation
   * @param {string} [data.logoUrl] - Cloudinary CDN URL for business logo
   * @param {string} [data.avatarUrl] - Cloudinary CDN URL for owner headshot avatar
   * @param {string} [data.primaryColor] - Hex primary color brand token
   * @param {string} [data.secondaryColor] - Hex secondary color brand token
   * @returns {Promise<Object>} Response containing updated BrandKit database record
   */
  updateBrandKit: async (data) => {
    return api.put(API_ENDPOINTS.BRANDKIT.BASE, data);
  },
};
