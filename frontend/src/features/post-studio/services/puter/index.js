/**
 * 🍌 Puter.js Service Barrel Index
 * Re-exports all Puter client, usage, image, caption, and constant APIs.
 */

export * from './puter.constants';
export * from './puter.usage';
export * from './puter.client';
export * from './puter.image';
export * from './puter.caption';

import {
  PUTER_IMAGE_MODELS,
  PUTER_EXHAUSTED_STORAGE_KEY,
  PUTER_CDN_SCRIPT_URL,
  PUTER_IMAGE_TIMEOUT_MS,
  PUTER_CHAT_TIMEOUT_MS,
} from './puter.constants';

import {
  isPuterSupported,
  isPuterConnected,
  isPuterExhausted,
  markPuterExhausted,
  clearPuterExhausted,
  fetchPuterUsage,
} from './puter.usage';

import {
  getPuter,
  getPuterUser,
  getPuterUsage,
  connectPuter,
  disconnectPuter,
  getPuterStatus,
  setupPuterModalSuppressor,
} from './puter.client';

import { generatePuterImage } from './puter.image';
import { generatePuterCaption } from './puter.caption';

export default {
  getPuter,
  isPuterSupported,
  isPuterConnected,
  getPuterUser,
  getPuterUsage,
  getPuterStatus,
  connectPuter,
  disconnectPuter,
  isPuterExhausted,
  markPuterExhausted,
  clearPuterExhausted,
  setupPuterModalSuppressor,
  PUTER_IMAGE_MODELS,
  generatePuterImage,
  generatePuterCaption,
};
