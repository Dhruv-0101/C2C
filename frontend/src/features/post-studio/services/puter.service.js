/**
 * 🍌 Puter.js Integration Service Facade
 * Backward-compatible barrel re-exporting from modular subservices in ./puter/
 *
 * Architecture:
 * - ./puter/puter.constants.js: Model definitions, timeouts, storage keys
 * - ./puter/puter.client.js: SDK script loader, auth session, modal suppressor
 * - ./puter/puter.usage.js: Microcents normalization, usage balance, quota tracking
 * - ./puter/puter.image.js: Txt2img diffusion engine, prompt styling, timeouts
 * - ./puter/puter.caption.js: Copywriting chat engine, JSON parser, fallback hashtags
 */

export * from './puter/index';
export { default } from './puter/index';
