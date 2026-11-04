/**
 * 🍌 Puter.js Quota, Credit Usage & Status Service
 * Handles microcents normalization, balance tracking, and auto-resetting quota flags.
 */

import { PUTER_EXHAUSTED_STORAGE_KEY } from './puter.constants';

/**
 * Check if Puter AI is reachable in current browser session
 * @returns {boolean}
 */
export function isPuterSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.puter && window.puter.ai);
}

/**
 * Check if the user has actively connected/authenticated their Puter account
 * @returns {boolean}
 */
export function isPuterConnected() {
  if (typeof window === 'undefined') return false;
  try {
    return Boolean(window.puter?.auth?.isSignedIn?.());
  } catch (err) {
    return false;
  }
}

/**
 * Check if Puter quota was previously flagged as exhausted in this monthly cycle
 * (Only applies if user is actually signed into Puter)
 * @returns {boolean}
 */
export function isPuterExhausted() {
  if (typeof window === 'undefined') return false;
  // If user is not connected, plan is NOT exhausted — they are simply not connected
  if (!isPuterConnected()) {
    try {
      localStorage.removeItem(PUTER_EXHAUSTED_STORAGE_KEY);
    } catch (_) { }
    return false;
  }
  try {
    const raw = localStorage.getItem(PUTER_EXHAUSTED_STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    const now = new Date();
    // Auto-reset when billing month changes
    if (data.month !== now.getMonth() || data.year !== now.getFullYear()) {
      localStorage.removeItem(PUTER_EXHAUSTED_STORAGE_KEY);
      return false;
    }
    return Boolean(data.exhausted);
  } catch (err) {
    return false;
  }
}

/**
 * Flag Puter as exhausted only when confirmed by zero balance or API quota error
 */
export function markPuterExhausted() {
  if (typeof window === 'undefined') return;
  try {
    const now = new Date();
    const payload = {
      exhausted: true,
      timestamp: now.getTime(),
      month: now.getMonth(),
      year: now.getFullYear(),
    };
    localStorage.setItem(PUTER_EXHAUSTED_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) { }
}

/**
 * Reset Puter quota memory flag manually if needed
 */
export function clearPuterExhausted() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PUTER_EXHAUSTED_STORAGE_KEY);
  } catch (err) { }
}

/**
 * Retrieve granular Puter usage, monthly allowance, and remaining balance
 * All metrics convert Puter microcents into human-readable credits and USD.
 *
 * @param {Function} getPuterInstance - Async loader for Puter SDK
 * @returns {Promise<{
 *   hasUsageData: boolean,
 *   remainingCredits: number,
 *   totalCredits: number,
 *   usedCredits: number,
 *   remainingDollars: string,
 *   totalDollars: string,
 *   percentage: number,
 *   imgCount: number,
 *   chatCount: number,
 *   isExhausted: boolean,
 *   estimatedImagesLeft: number,
 * } | null>}
 */
export async function fetchPuterUsage(getPuterInstance) {
  if (typeof window === 'undefined') return null;
  try {
    const instance = await getPuterInstance().catch(() => null);
    if (!instance?.auth?.isSignedIn?.()) return null;

    if (typeof instance.auth.getMonthlyUsage !== 'function') {
      return null;
    }

    const rawUsage = await instance.auth.getMonthlyUsage().catch(() => null);
    if (!rawUsage) return null;

    const allowanceInfo = rawUsage.allowanceInfo || {};
    const usage = rawUsage.usage || {};

    // Puter standard: 1,000 resource credits on Free Tier
    const rawAllowance = Number(allowanceInfo.monthUsageAllowance ?? 1000);
    const rawRemaining = Number(allowanceInfo.remaining ?? (isPuterExhausted() ? 0 : rawAllowance));

    // Determine normalized Credits (1,000 on Puter.com)
    let totalCredits = rawAllowance;
    let remainingCredits = rawRemaining;

    if (rawAllowance >= 50000000) {
      // Legacy microcents (100,000,000 = $1.00 = 1000 credits)
      totalCredits = Math.round(rawAllowance / 100000);
      remainingCredits = Math.round(rawRemaining / 100000);
    } else if (rawAllowance >= 100000) {
      // Legacy microdollars (1,000,000 = $1.00 = 1000 credits)
      totalCredits = Math.round(rawAllowance / 1000);
      remainingCredits = Math.round(rawRemaining / 1000);
    }

    totalCredits = Math.max(1, totalCredits);
    remainingCredits = Math.max(0, Math.min(totalCredits, remainingCredits));
    const usedCredits = Math.max(0, totalCredits - remainingCredits);

    const percentage = totalCredits > 0
      ? Math.max(0, Math.min(100, Math.round((remainingCredits / totalCredits) * 100)))
      : 0;

    const remainingDollars = (remainingCredits / 100).toFixed(2);
    const totalDollars = (totalCredits / 100).toFixed(2);

    const imgCount = usage['ai:txt2img']?.count || 0;
    const chatCount = usage['ai:chat']?.count || 0;

    // Approximate remaining image generations (~20 credits per visual on Puter)
    const estimatedImagesLeft = Math.max(0, Math.floor(remainingCredits / 20));

    const isExhausted = remainingCredits <= 0 || (percentage <= 0);

    if (isExhausted) {
      markPuterExhausted();
    } else {
      clearPuterExhausted();
    }

    return {
      hasUsageData: true,
      remainingCredits: Math.round(remainingCredits * 10) / 10,
      totalCredits: Math.round(totalCredits * 10) / 10,
      usedCredits: Math.round(usedCredits * 10) / 10,
      remainingDollars,
      totalDollars,
      percentage,
      imgCount,
      chatCount,
      isExhausted,
      estimatedImagesLeft,
    };
  } catch (err) {
    console.warn('Could not retrieve Puter usage balance:', err);
    return null;
  }
}
