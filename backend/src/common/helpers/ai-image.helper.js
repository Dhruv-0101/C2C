/**
 * AI Image Generator Helper
 * Uses FLUX.1 / Pollinations Engine for hyper-accurate, high-resolution AI template generation
 */

import axios from 'axios';

/**
 * Convert Hex code to plain English color description for AI vision model
 */
const getEnglishColorTerm = (hex) => {
  if (!hex) return '';
  const h = hex.replace('#', '').toUpperCase();
  if (h.startsWith('F59E') || h.startsWith('FFD7') || h.startsWith('EAB3')) return 'golden yellow';
  if (h.startsWith('0D94') || h.startsWith('10B9') || h.startsWith('0596')) return 'teal blue';
  if (h.startsWith('EC48') || h.startsWith('EF44') || h.startsWith('E11D')) return 'vibrant magenta red';
  if (h.startsWith('8B5C') || h.startsWith('7C3A') || h.startsWith('A855')) return 'royal purple';
  if (h.startsWith('0B0F') || h.startsWith('1E29') || h.startsWith('0000')) return 'dark dark background';
  return 'harmonious festive colors';
};

/**
 * Generate a festival or promotional base template image using FLUX.1 AI Model
 * @param {string} rawPrompt - User & Admin synthesized prompt
 * @param {Object} [styleDetails] - Design Style tokens
 * @param {number} width - Output width in px (default: 1080)
 * @param {number} height - Output height in px (default: 1080)
 * @returns {Promise<string>} Base64 data URL
 */
export const generateAiTemplateImage = async (rawPrompt, styleDetails = {}, width = 1080, height = 1080) => {
  try {
    // 1. Clean & Sanitize Prompt (Strip CSS noise, hex codes, and technical markup)
    let cleanedPrompt = rawPrompt
      .replace(/linear-gradient\([^)]+\)/gi, '') // Remove raw CSS gradient strings
      .replace(/#[0-[#0-9a-fA-F]{3,8}/g, '') // Remove hex codes
      .replace(/header font \w+/gi, '')
      .replace(/body font \w+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // 2. Add visual color term if style details provided
    if (styleDetails.primaryColor || styleDetails.secondaryColor) {
      const colorDesc1 = getEnglishColorTerm(styleDetails.primaryColor);
      const colorDesc2 = getEnglishColorTerm(styleDetails.secondaryColor);
      cleanedPrompt += `, in ${colorDesc1} and ${colorDesc2} color theme`;
    }

    // 3. Append high-accuracy visual keywords for FLUX.1 AI Model
    const finalPrompt = `${cleanedPrompt}, hyperrealistic social media template background, minimal empty center space for branding logo, studio lighting, 8k resolution, professional graphic design, no text, no letters`;

    const encodedPrompt = encodeURIComponent(finalPrompt);
    const seed = Math.floor(Math.random() * 1000000);

    // FLUX.1 Model URL parameter for high-fidelity prompt matching
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

    // Fetch image from FLUX.1 engine
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 45000,
    });
    const base64Image = Buffer.from(response.data, 'binary').toString('base64');

    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    // Fallback attempt without model parameter if FLUX times out
    try {
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(rawPrompt)}?width=${width}&height=${height}&nologo=true`;
      const response = await axios.get(fallbackUrl, { responseType: 'arraybuffer' });
      return `data:image/png;base64,${Buffer.from(response.data, 'binary').toString('base64')}`;
    } catch (fallbackErr) {
      throw new Error(`AI Image Generation failed: ${error.message}`);
    }
  }
};
