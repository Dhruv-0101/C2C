/**
 * 🍌 Puter.js Client & Connection Manager
 * Manages SDK script injection, authentication session, and low-balance modal suppression.
 */

import { PUTER_CDN_SCRIPT_URL } from './puter.constants';
import {
  isPuterConnected,
  isPuterExhausted,
  clearPuterExhausted,
  markPuterExhausted,
  fetchPuterUsage,
} from './puter.usage';

let isSuppressorActive = false;

/**
 * Get active Puter instance from window (CDN) or dynamically load if not yet initialized
 * @returns {Promise<Object>}
 */
export async function getPuter() {
  if (typeof window === 'undefined') {
    throw new Error('Puter AI is only available in browser environments.');
  }

  if (window.puter && window.puter.ai) {
    return window.puter;
  }

  // Ensure script is injected and wait for window.puter
  return new Promise((resolve, reject) => {
    let script = document.querySelector(`script[src*="js.puter.com"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = PUTER_CDN_SCRIPT_URL;
      script.async = true;
      document.head.appendChild(script);
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      if (window.puter && window.puter.ai) {
        clearInterval(interval);
        resolve(window.puter);
      } else if (Date.now() - startTime > 5000) {
        clearInterval(interval);
        reject(new Error('Timed out waiting for Puter AI SDK to initialize.'));
      }
    }, 100);

    script.addEventListener('error', () => {
      clearInterval(interval);
      reject(new Error('Failed to load Puter.js script from CDN.'));
    });
  });
}

/**
 * Retrieve connected Puter user profile (username, uuid)
 * @returns {Promise<Object|null>}
 */
export async function getPuterUser() {
  if (typeof window === 'undefined') return null;
  try {
    const instance = await getPuter().catch(() => null);
    if (!instance?.auth?.isSignedIn?.()) return null;
    return await instance.auth.getUser();
  } catch (err) {
    return null;
  }
}

/**
 * Convenience wrapper for usage with bound getPuter loader
 */
export async function getPuterUsage() {
  return fetchPuterUsage(getPuter);
}

/**
 * Connect Puter account via 1-click Puter sign-in popup
 * @returns {Promise<{ user: Object|null, usage: Object|null }>}
 */
export async function connectPuter() {
  const instance = await getPuter();
  if (!instance?.auth?.signIn) {
    throw new Error('Puter authentication is not available.');
  }
  await instance.auth.signIn();
  clearPuterExhausted();
  const user = await instance.auth.getUser().catch(() => null);
  const usage = await getPuterUsage().catch(() => null);
  return { user, usage };
}

/**
 * Disconnect/Sign-out from Puter account
 * @returns {Promise<void>}
 */
export async function disconnectPuter() {
  if (typeof window !== 'undefined' && window.puter?.auth?.signOut) {
    try {
      await window.puter.auth.signOut();
    } catch (e) { }
  }
}

/**
 * Get comprehensive Puter connection and plan status
 * @returns {Promise<{ isConnected: boolean, user: Object|null, usage: Object|null, planStatus: 'NOT_CONNECTED'|'ACTIVE'|'EXHAUSTED', planLabel: string }>}
 */
export async function getPuterStatus() {
  if (typeof window === 'undefined') {
    return {
      isConnected: false,
      user: null,
      usage: null,
      planStatus: 'NOT_CONNECTED',
      planLabel: 'Not Connected',
    };
  }

  const instance = await getPuter().catch(() => null);
  const connected = Boolean(instance?.auth?.isSignedIn?.());

  if (!connected) {
    clearPuterExhausted();
    return {
      isConnected: false,
      user: null,
      usage: null,
      planStatus: 'NOT_CONNECTED',
      planLabel: 'Not Connected',
    };
  }

  const user = await instance.auth.getUser().catch(() => null);
  const usage = await getPuterUsage().catch(() => null);
  const exhausted = usage?.isExhausted || (usage?.remainingCredits != null && usage.remainingCredits <= 0);

  if (exhausted) {
    return {
      isConnected: true,
      user,
      usage,
      planStatus: 'EXHAUSTED',
      planLabel: 'Free Plan Ended / Quota Used',
    };
  }

  // Active credits available
  clearPuterExhausted();

  return {
    isConnected: true,
    user,
    usage,
    planStatus: 'ACTIVE',
    planLabel: 'Free Plan Active 🎁',
  };
}

/**
 * Gracefully dismiss Puter 'Low Balance' modal dialogs only if the user has truly exhausted their allowance.
 * Never targets background driver iframes or ongoing generation requests.
 */
export function setupPuterModalSuppressor() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (isSuppressorActive) return;
  isSuppressorActive = true;

  const dismissIfQuotaModal = (node) => {
    if (!node || node.nodeType !== 1) return false;

    // Only target explicit usage limit dialog custom elements or explicit Low Balance alerts
    const isUsageDialog =
      node.tagName?.toLowerCase() === 'usage-limit-dialog' ||
      (node.getAttribute?.('role') === 'dialog' && (node.textContent || '').includes('Low Balance'));

    if (isUsageDialog) {
      node.style.setProperty('display', 'none', 'important');
      node.style.setProperty('pointer-events', 'none', 'important');
      const closeBtn = node.querySelector?.('button');
      if (closeBtn && typeof closeBtn.click === 'function') {
        try { closeBtn.click(); } catch (e) { }
      }
      setTimeout(() => {
        try { node.remove(); } catch (e) { }
      }, 50);
      markPuterExhausted();
      return true;
    }
    return false;
  };

  try {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          dismissIfQuotaModal(node);
        }
      }
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });
  } catch (err) {
    console.warn('Could not register Puter suppressor observer:', err);
  }
}

// Auto-run suppressor on client load
if (typeof window !== 'undefined') {
  setupPuterModalSuppressor();
}
