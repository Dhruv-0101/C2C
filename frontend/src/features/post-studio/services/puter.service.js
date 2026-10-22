/**
 * 🍌 Puter.js Integration Service for BrandFlow
 * Provides high-speed, keyless AI Image Generation (Nano Banana 2.1)
 * and AI Copywriting directly in the browser with seamless fallback to Google Gemini.
 */

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
    let script = document.querySelector('script[src*="js.puter.com"]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      document.head.appendChild(script);
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      if (window.puter && window.puter.ai) {
        clearInterval(interval);
        resolve(window.puter);
      } else if (Date.now() - startTime > 12000) {
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
 * Check if Puter AI is reachable in current browser session
 * @returns {boolean}
 */
export function isPuterSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.puter && window.puter.ai);
}

/**
 * Available Puter Image Models matching BrandFlow specs
 */
export const PUTER_IMAGE_MODELS = {
  NANO_BANANA_2_1: 'google/gemini-nano-banana-2.1',
  NANO_BANANA_PRO: 'gemini-3-pro-image',
  NANO_BANANA_2: 'gemini-3.1-flash-image',
  NANO_BANANA_2_LITE: 'google/gemini-3.1-flash-lite-image',
  FLUX_1_SCHNELL: 'black-forest-labs/FLUX.1-schnell',
};

const PUTER_EXHAUSTED_STORAGE_KEY = 'brandflow_puter_quota_exhausted';

/**
 * Check if Puter quota was previously flagged as exhausted in this monthly cycle
 * @returns {boolean}
 */
export function isPuterExhausted() {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(PUTER_EXHAUSTED_STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    const now = new Date();
    // Reset automatically when billing month changes
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
 * Flag Puter as exhausted so that neither Image nor Caption calls trigger 3rd party modals
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
  } catch (err) {}
}

/**
 * Reset Puter quota memory flag manually if needed
 */
export function clearPuterExhausted() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PUTER_EXHAUSTED_STORAGE_KEY);
  } catch (err) {}
}

let isSuppressorActive = false;

/**
 * Active MutationObserver that silently catches and destroys any Puter 'Low Balance' or 'Upgrade Now' modals
 * before the user ever sees them on screen.
 */
export function setupPuterModalSuppressor() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (isSuppressorActive) return;
  isSuppressorActive = true;

  const dismissPuterModalIfPresent = (node) => {
    if (!node || node.nodeType !== 1) return false;
    const text = node.textContent || '';
    const hasPuterKeywords =
      text.includes('Low Balance') ||
      text.includes('puter-image-generation') ||
      text.includes('not have enough funding') ||
      text.includes('Please upgrade to continue') ||
      (text.includes('Upgrade Now') && text.includes('Close'));

    const isPuterIframe =
      node.tagName === 'IFRAME' &&
      (node.src?.includes('puter.com') || node.src?.includes('js.puter.com'));

    if (hasPuterKeywords || isPuterIframe) {
      // 1. Immediately hide it completely from screen
      node.style.setProperty('display', 'none', 'important');
      node.style.setProperty('visibility', 'hidden', 'important');
      node.style.setProperty('opacity', '0', 'important');
      node.style.setProperty('pointer-events', 'none', 'important');
      node.style.setProperty('position', 'absolute', 'important');
      node.style.setProperty('top', '-9999px', 'important');

      // 2. Click the 'Close' button to cleanly reject the Puter Promise
      const buttons = node.querySelectorAll ? Array.from(node.querySelectorAll('button')) : [];
      const closeBtn =
        buttons.find((b) => b.textContent?.trim()?.toLowerCase() === 'close') ||
        node.querySelector?.('button[aria-label="Close"]') ||
        buttons[1] ||
        buttons[0];

      if (closeBtn && typeof closeBtn.click === 'function') {
        try {
          closeBtn.click();
        } catch (e) {}
      }

      // Safely remove the element from DOM
      setTimeout(() => {
        try {
          node.remove();
        } catch (e) {}
      }, 50);

      // 3. Mark Puter as exhausted so future generations bypass it directly to Gemini
      markPuterExhausted();
      return true;
    }
    return false;
  };

  // Check any existing elements immediately
  document.querySelectorAll('div, dialog, iframe').forEach(dismissPuterModalIfPresent);

  // Observe ongoing DOM insertions
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        dismissPuterModalIfPresent(node);
      }
    }
  });

  try {
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

/**
 * Generate AI Visual Image via Puter.js (Client-side, Zero Server Cost)
 *
 * @param {Object} options
 * @param {string} options.prompt - Prompt text describing the image
 * @param {string} [options.style] - Aesthetic style (e.g., Photorealistic, 3D Render)
 * @param {string} [options.model] - Model identifier from PUTER_IMAGE_MODELS
 * @returns {Promise<{ success: boolean, imageUrl: string, model: string, source: string }>}
 */
export async function generatePuterImage({
  prompt,
  style = 'Photorealistic',
  model = PUTER_IMAGE_MODELS.NANO_BANANA_2_1,
}) {
  // If Puter quota is exhausted for this monthly period, immediately reject to trigger Google Gemini fallback
  if (isPuterExhausted()) {
    throw new Error('Puter AI quota exhausted. Fast-tracking to Google Gemini.');
  }

  setupPuterModalSuppressor();

  const instance = await getPuter();
  if (!instance || !instance.ai || !instance.ai.txt2img) {
    throw new Error('Puter AI Engine is not available in this browser environment.');
  }

  // Engineer commercial social media prompt
  const styleFragment = (style && style !== 'None') ? `${style} style, ` : '';
  const styledPrompt = `${prompt}, ${styleFragment}professional commercial lighting, vibrant colors, 8k resolution, trending on instagram, high quality marketing visual`;

  // Race txt2img call with a safety timeout (8s) to prevent hanging if a background modal stalls
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Puter AI generation timed out. Falling back to Google Gemini.'));
    }, 8000);
  });

  try {
    const imgElement = await Promise.race([
      instance.ai.txt2img(styledPrompt, { model }),
      timeoutPromise,
    ]);

    if (!imgElement || !imgElement.src) {
      throw new Error('Puter did not return a valid image source.');
    }

    return {
      success: true,
      imageUrl: imgElement.src,
      model,
      source: 'PUTER_AI',
    };
  } catch (err) {
    // If low balance, quota, funding, or payment required, mark exhausted so next time Puter is skipped entirely
    const errText = (err.message || '').toLowerCase();
    if (
      errText.includes('balance') ||
      errText.includes('funding') ||
      errText.includes('quota') ||
      errText.includes('credit') ||
      errText.includes('upgrade') ||
      errText.includes('timed out') ||
      errText.includes('payment')
    ) {
      markPuterExhausted();
    }
    throw err;
  }
}

/**
 * Generate AI Caption & Hashtags via Puter.js (Client-side Chat AI)
 *
 * @param {Object} params
 * @param {string} params.topic - Post topic or business offer
 * @param {string} [params.offerText] - Discount/offer details
 * @param {string} [params.tone] - Tone of voice
 * @param {string} [params.language] - Language
 * @param {string} [params.platform] - Target social platform
 * @param {string} [params.targetAudience] - Target demographic
 * @param {string} [params.businessUsps] - Key selling points
 * @returns {Promise<{ captionText: string, hashtags: string[], source: string }>}
 */
export async function generatePuterCaption({
  topic,
  offerText = '',
  tone = 'PROMOTIONAL',
  language = 'ENGLISH',
  platform = 'INSTAGRAM',
  targetAudience = '',
  businessUsps = '',
}) {
  if (isPuterExhausted()) {
    throw new Error('Puter AI quota exhausted. Fast-tracking to Google Gemini.');
  }

  setupPuterModalSuppressor();

  const instance = await getPuter();
  if (!instance || !instance.ai || !instance.ai.chat) {
    throw new Error('Puter AI Chat is not available in this browser environment.');
  }

  const prompt = `You are a world-class social media copywriter for small businesses.
Create a high-converting, viral ${platform} caption and hashtags based on this input:
- Topic: ${topic}
${offerText ? `- Special Offer: ${offerText}` : ''}
${targetAudience ? `- Target Audience: ${targetAudience}` : ''}
${businessUsps ? `- Business USPs: ${businessUsps}` : ''}
- Tone: ${tone}
- Language: ${language}

Strict Output Format:
Output ONLY valid JSON with no markdown backticks, no code blocks:
{
  "captionText": "Full engaging caption with hooks, emojis, value proposition, and strong call to action.",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}`;

  // Race chat call with safety timeout (8s)
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Puter AI caption generation timed out. Falling back to Gemini.'));
    }, 8000);
  });

  let response;
  try {
    response = await Promise.race([
      instance.ai.chat(prompt, { model: 'claude-3-5-sonnet' }),
      timeoutPromise,
    ]);
  } catch (err) {
    const errText = (err.message || '').toLowerCase();
    if (
      errText.includes('balance') ||
      errText.includes('funding') ||
      errText.includes('quota') ||
      errText.includes('credit') ||
      errText.includes('upgrade') ||
      errText.includes('timed out') ||
      errText.includes('payment')
    ) {
      markPuterExhausted();
    }
    throw err;
  }

  const rawText = response?.message?.content || String(response || '');

  // Extract JSON payload
  let parsed = null;
  try {
    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    // Fallback parser if LLM wrapped in conversational text
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (err) {}
    }
  }

  if (parsed && parsed.captionText) {
    const hashtags = Array.isArray(parsed.hashtags)
      ? parsed.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`))
      : ['#business', '#marketing', '#viral'];

    return {
      captionText: parsed.captionText,
      hashtags,
      source: 'PUTER_AI',
    };
  }

  // Graceful fallback if unstructured
  return {
    captionText: rawText.replace(/#\w+/g, '').trim(),
    hashtags: rawText.match(/#\w+/g) || ['#business', '#viral', '#growth'],
    source: 'PUTER_AI',
  };
}

export default {
  getPuter,
  isPuterSupported,
  isPuterExhausted,
  markPuterExhausted,
  clearPuterExhausted,
  setupPuterModalSuppressor,
  PUTER_IMAGE_MODELS,
  generatePuterImage,
  generatePuterCaption,
};

