import { logger } from '../../../config/logger.js';

/**
 * Enterprise WhatsApp Status & Business Publisher Service
 * Generates formatted WhatsApp web/mobile deep links (https://api.whatsapp.com/send?text=...)
 * for instant 1-click status posting and chat sharing of branded graphics & captions.
 */
export const whatsappPublisherService = {
  /**
   * Format and generate WhatsApp Status Share Payload & Deep Link
   * @param {object} params
   * @param {string} [params.phone] - User WhatsApp phone number
   * @param {string} [params.graphicUrl] - Cloudinary image URL of generated graphic
   * @param {string} params.caption - Post text / caption
   * @returns {Promise<{status: string, platform: string, postId: string, postUrl: string, shareText: string, publishedAt: string}>}
   */
  publishToWhatsapp: async ({ phone, graphicUrl, caption }) => {
    logger.info('💬 [WhatsappPublisher] Generating WhatsApp Status share link...');

    let textContent = (caption || 'Check out our latest update! 🚀').trim();
    if (graphicUrl && !textContent.includes(graphicUrl)) {
      textContent = `${textContent}\n\n📲 Graphic Link: ${graphicUrl}`;
    }

    const encodedText = encodeURIComponent(textContent);
    
    // Clean target phone number if provided (strip spaces, dashes, parentheses)
    let cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    
    // Generate WhatsApp Web & Mobile App Universal Share Link
    let postUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    if (cleanPhone) {
      postUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    }

    const postId = `wa_${Date.now()}`;

    logger.info(`🎉 [WhatsappPublisher] Successfully generated WhatsApp Status link: ${postUrl.slice(0, 80)}...`);

    return {
      status: 'SUCCESS',
      platform: 'WHATSAPP',
      postId,
      postUrl,
      shareText: textContent,
      publishedAt: new Date().toISOString(),
    };
  },
};
