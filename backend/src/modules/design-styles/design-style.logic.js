import { NotFoundError, BadRequestError, ConflictError } from '../../common/errors/custom-errors.js';
import * as designStyleRepository from './design-style.repository.js';

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
 * Get all master design styles
 */
export async function getDesignStyles() {
  return await designStyleRepository.findAllDesignStyles();
}

/**
 * Create a new master design style (SuperAdmin / SubAdmin)
 */
export async function createDesignStyle({
  name,
  description,
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor,
  gradient,
  fontHeader,
  fontBody,
  colors,
  rulesJson,
}) {
  const cleanName = name.trim();
  const slug = slugify(cleanName);

  if (!slug) {
    throw new BadRequestError('Invalid design style name.');
  }

  const existing = await designStyleRepository.findDesignStyleBySlug(slug);
  if (existing) {
    throw new ConflictError(`Design style "${cleanName}" already exists.`);
  }

  const designStyle = await designStyleRepository.createDesignStyle({
    name: cleanName,
    slug,
    description: description?.trim() || null,
    primaryColor: primaryColor || '#F59E0B',
    secondaryColor: secondaryColor || '#0D9488',
    accentColor: accentColor || '#EC4899',
    backgroundColor: backgroundColor || '#0B0F17',
    gradient: gradient?.trim() || null,
    fontHeader: fontHeader?.trim() || 'Space Grotesk',
    fontBody: fontBody?.trim() || 'Plus Jakarta Sans',
    colors: Array.isArray(colors) ? colors : [],
    rulesJson: rulesJson || null,
  });

  return designStyle;
}

/**
 * Delete a design style by ID
 */
export async function deleteDesignStyle(id) {
  const existing = await designStyleRepository.findDesignStyleById(id);
  if (!existing) {
    throw new NotFoundError('Design style not found.');
  }

  await designStyleRepository.deleteDesignStyle(id);
  return { id };
}
