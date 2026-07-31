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
 * Get all festivals (optionally filtered by year)
 */
export async function getFestivals(year) {
  return await festivalRepository.findAllFestivals(year);
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
