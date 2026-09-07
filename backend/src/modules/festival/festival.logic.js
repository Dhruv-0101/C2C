import { NotFoundError, BadRequestError, ConflictError } from '../../common/errors/custom-errors.js';
import * as festivalRepository from './festival.repository.js';

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
 * Get all festivals (optionally filtered by year and active status)
 */
export async function getFestivals(year, includeInactive = false) {
  return await festivalRepository.findAllFestivals(year, includeInactive);
}

/**
 * Create a new festival / special day
 */
export async function createFestival({ name, description, date, targetRegion, bannerUrl, isActive }) {
  const cleanName = name.trim();
  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    throw new BadRequestError('Invalid date format.');
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
    bannerUrl: bannerUrl?.trim() || null,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  return festival;
}

/**
 * Update an existing festival by ID
 */
export async function updateFestival(id, data) {
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
  if (data.bannerUrl !== undefined) {
    updatePayload.bannerUrl = data.bannerUrl ? data.bannerUrl.trim() : null;
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

  return await festivalRepository.updateFestival(id, updatePayload);
}

/**
 * Delete a festival by ID
 */
export async function deleteFestival(id) {
  const existing = await festivalRepository.findFestivalById(id);
  if (!existing) {
    throw new NotFoundError('Festival not found.');
  }

  await festivalRepository.deleteFestival(id);
  return { id };
}
