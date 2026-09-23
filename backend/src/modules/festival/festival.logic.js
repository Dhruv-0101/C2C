import { NotFoundError, BadRequestError, ConflictError } from '../../common/errors/custom-errors.js';
import { logger } from '../../config/logger.js';
import * as festivalRepository from './festival.repository.js';
import { uploadFestivalBannerBuffer, deleteFromCloudinary } from '../../config/cloudinary.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../common/helpers/pagination.helper.js';
import { sanitizeFestival } from './festival.helper.js';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get festivals with mandatory pagination (optionally filtered by year and active status)
 */
export async function getFestivals(queryParams = {}, includeInactive = false) {
  const params = typeof queryParams === 'object' && queryParams !== null ? queryParams : { year: queryParams };
  const pagination = parsePaginationParams(params, 100, 100);
  const year = params.year;
  const isInactive = params.includeInactive !== undefined ? Boolean(params.includeInactive) : includeInactive;
  const startDate = params.startDate;
  const endDate = params.endDate;

  const { festivals, totalCount } = await festivalRepository.findPaginatedFestivals({
    ...pagination,
    year,
    startDate,
    endDate,
    includeInactive: isInactive,
  });

  const sanitizedFestivals = festivals.map(sanitizeFestival);

  const paginatedResponse = buildPaginatedResponse({
    items: sanitizedFestivals,
    totalCount,
    page: pagination.page,
    limit: pagination.limit,
  });

  return {
    data: {
      festivals: paginatedResponse.data,
    },
    meta: paginatedResponse.meta,
  };
}

/**
 * Fetch a single festival by ID
 */
export async function getFestivalById(id) {
  const festival = await festivalRepository.findFestivalById(id);
  if (!festival) {
    throw new NotFoundError('Festival not found.');
  }
  return sanitizeFestival(festival);
}

/**
 * Create a new festival / special day
 * Strictly uploads festival cover banners -> Cloudinary 'brandflow/festivals'
 */
export async function createFestival({
  name,
  description,
  date,
  targetRegion,
  fileBuffer,
  isActive,
  createdBy,
}) {
  const cleanName = name.trim();
  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    throw new BadRequestError('Invalid date format.');
  }

  let finalBannerUrl = null;

  // Process File Buffer upload -> Cloudinary brandflow/festivals
  if (fileBuffer) {
    const uploadResult = await uploadFestivalBannerBuffer(fileBuffer);
    finalBannerUrl = uploadResult.url;
  }

  // Slug includes date year to allow recurring annual names
  const baseSlug = slugify(cleanName);
  const yearSuffix = dateObj.getFullYear();
  let slug = `${baseSlug}-${yearSuffix}`;

  // Ensure slug uniqueness
  const existing = await festivalRepository.findFestivalBySlug(slug);
  if (existing) {
    slug = `${baseSlug}-${yearSuffix}-${Date.now().toString().slice(-4)}`;
  }

  const festival = await festivalRepository.createFestival({
    name: cleanName,
    slug,
    description: description?.trim() || null,
    date: dateObj,
    targetRegion: targetRegion?.trim() || 'India',
    bannerUrl: finalBannerUrl,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    createdBy: createdBy || null,
  });

  return sanitizeFestival(festival);
}

/**
 * Update an existing festival by ID
 */
export async function updateFestival(id, data, fileBuffer) {
  const existing = await festivalRepository.findFestivalById(id);
  if (!existing) {
    throw new NotFoundError('Festival not found.');
  }

  const updatePayload = {};

  if (data.name !== undefined) {
    updatePayload.name = data.name.trim();
  }
  if (data.description !== undefined) {
    updatePayload.description = data.description ? data.description.trim() : null;
  }
  if (data.targetRegion !== undefined) {
    updatePayload.targetRegion = data.targetRegion ? data.targetRegion.trim() : 'India';
  }

  // Process Banner Image Upload -> Cloudinary brandflow/festivals
  if (fileBuffer) {
    const uploadResult = await uploadFestivalBannerBuffer(fileBuffer);
    updatePayload.bannerUrl = uploadResult.url;

    // Delete old festival banner from Cloudinary if replaced
    if (existing.bannerUrl && existing.bannerUrl !== uploadResult.url) {
      deleteFromCloudinary(existing.bannerUrl).catch((err) =>
        logger.warn(`Failed to cleanup old festival banner from Cloudinary: ${err.message}`)
      );
    }
  } else if (data.clearBanner) {
    if (existing.bannerUrl) {
      deleteFromCloudinary(existing.bannerUrl).catch((err) =>
        logger.warn(`Failed to cleanup removed festival banner from Cloudinary: ${err.message}`)
      );
    }
    updatePayload.bannerUrl = null;
  }

  if (data.isActive !== undefined) {
    updatePayload.isActive = Boolean(data.isActive);
  }
  if (data.date !== undefined) {
    const dateObj = new Date(data.date);
    if (isNaN(dateObj.getTime())) {
      throw new BadRequestError('Invalid date format.');
    }
    updatePayload.date = dateObj;
  }

  if (updatePayload.name || updatePayload.date) {
    const nameForSlug = updatePayload.name || existing.name;
    const dateForSlug = updatePayload.date || existing.date;
    const baseSlug = slugify(nameForSlug);
    const yearSuffix = new Date(dateForSlug).getFullYear();
    let slug = `${baseSlug}-${yearSuffix}`;

    const existingSlugMatch = await festivalRepository.findFestivalBySlug(slug);
    if (existingSlugMatch && existingSlugMatch.id !== id) {
      slug = `${baseSlug}-${yearSuffix}-${Date.now().toString().slice(-4)}`;
    }
    updatePayload.slug = slug;
  }

  const updatedFestival = await festivalRepository.updateFestival(id, updatePayload);
  return sanitizeFestival(updatedFestival);
}

/**
 * Delete a festival by ID
 */
export async function deleteFestival(id) {
  const existing = await festivalRepository.findFestivalById(id);
  if (!existing) {
    throw new NotFoundError('Festival not found.');
  }

  if (existing.bannerUrl) {
    deleteFromCloudinary(existing.bannerUrl).catch((err) =>
      logger.warn(`Failed to cleanup festival banner from Cloudinary: ${err.message}`)
    );
  }

  await festivalRepository.deleteFestival(id);
  return {
    id,
    name: existing.name,
  };
}
