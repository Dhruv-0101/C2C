import { prisma } from '../../config/database.js';

/**
 * 🤖 AI REPOSITORY (Database Access Layer)
 * Strictly encapsulates all database queries for AI context retrieval.
 * Follows clean architecture: zero business logic or HTTP code exists here.
 */

const BRANDKIT_AI_CONTEXT_SELECT = Object.freeze({
  businessName: true,
  tagline: true,
  category: {
    select: {
      name: true,
      slug: true,
    },
  },
  address: true,
  city: true,
  state: true,
  country: true,
  phone: true,
  whatsapp: true,
  email: true,
  instagramHandle: true,
  facebookHandle: true,
  linkedinHandle: true,
  targetAudience: true,
  captionLanguage: true,
  businessUsps: true,
  workingHours: true,
  gmbReviewUrl: true,
  upiVpa: true,
});

/**
 * Fetch latest live BrandKit profile for AI context generation
 * Directly queries PostgreSQL to ensure zero caching drift when user updates BrandKit.
 *
 * @param {string} userId - Authenticated user UUID
 * @returns {Promise<Object|null>}
 */
export async function findBrandKitByUserId(userId) {
  return prisma.brandKit.findUnique({
    where: { userId },
    select: BRANDKIT_AI_CONTEXT_SELECT,
  });
}

// Backwards-compatible object export
export const aiRepository = {
  findBrandKitByUserId,
};
