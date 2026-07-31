/**
 * Server-Side Image Compositor Helper using Sharp
 * Takes base template + BrandKit + anchor coordinates and renders final branded graphic
 */

import sharp from 'sharp';
import axios from 'axios';

/**
 * Convert URL or DataURL to image Buffer
 */
const getImageBuffer = async (imageInput) => {
  if (Buffer.isBuffer(imageInput)) return imageInput;

  if (imageInput.startsWith('data:image')) {
    const base64Data = imageInput.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  }

  const response = await axios.get(imageInput, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
};

/**
 * Composite SMB Brand details onto a Base Template using Sharp
 * @param {Object} params
 * @param {string|Buffer} params.baseImageUrl - Base template graphic
 * @param {Object} params.coordinatesJson - Anchors metadata (logoZone, headlineZone, contactBarZone)
 * @param {Object} params.brandKit - User's brand kit (businessName, phone, website, logoUrl, colors)
 * @param {string} [params.customText] - Headline text greeting
 * @returns {Promise<string>} Base64 Data URL of rendered PNG
 */
export const compositeBrandedGraphic = async ({
  baseImageUrl,
  coordinatesJson,
  brandKit = {},
  customText = '',
}) => {
  try {
    const baseBuffer = await getImageBuffer(baseImageUrl);
    const metadata = await sharp(baseBuffer).metadata();
    const canvasWidth = metadata.width || 1080;
    const canvasHeight = metadata.height || 1080;

    const {
      logoZone = { x: 50, y: 50, width: 140, height: 140 },
      headlineZone = { x: 540, y: 200, fontSize: 42, color: '#FFFFFF' },
      contactBarZone = { x: 0, y: canvasHeight - 100, height: 100 },
    } = coordinatesJson || {};

    const compositeLayers = [];

    // 1. Composite Brand Logo if available
    if (brandKit.logoUrl) {
      try {
        const logoBuffer = await getImageBuffer(brandKit.logoUrl);
        const resizedLogo = await sharp(logoBuffer)
          .resize(logoZone.width || 140, logoZone.height || 140, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .toBuffer();

        compositeLayers.push({
          input: resizedLogo,
          top: Math.round(logoZone.y || 50),
          left: Math.round(logoZone.x || 50),
        });
      } catch (err) {
        console.warn('Failed to composite brand logo:', err.message);
      }
    }

    // 2. Render SVG Text Overlay for Headline & Contact Bar
    const textHeadline = customText || brandKit.businessName || '';
    const phone = brandKit.phone || brandKit.whatsapp || '';
    const website = brandKit.websiteUrl || '';
    const primaryColor = brandKit.primaryColor || '#F59E0B';
    const secondaryColor = brandKit.secondaryColor || '#0D9488';

    const svgOverlay = `
      <svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .headline {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 800;
            font-size: ${headlineZone.fontSize || 42}px;
            fill: ${headlineZone.color || primaryColor};
            text-anchor: middle;
            dominant-baseline: middle;
          }
          .contact-bg {
            fill: ${secondaryColor};
            opacity: 0.95;
          }
          .contact-text {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-weight: 700;
            font-size: 22px;
            fill: #FFFFFF;
            dominant-baseline: middle;
          }
        </style>

        <!-- Headline Greeting -->
        ${
          textHeadline
            ? `<text x="${headlineZone.x || canvasWidth / 2}" y="${headlineZone.y || 200}" class="headline">${textHeadline}</text>`
            : ''
        }

        <!-- Contact Info Bar -->
        <rect x="0" y="${contactBarZone.y || canvasHeight - 90}" width="${canvasWidth}" height="${contactBarZone.height || 90}" class="contact-bg" />
        
        <text x="60" y="${(contactBarZone.y || canvasHeight - 90) + 45}" class="contact-text">
          ${brandKit.businessName ? `🏢 ${brandKit.businessName}` : ''}
        </text>

        <text x="${canvasWidth - 60}" y="${(contactBarZone.y || canvasHeight - 90) + 45}" class="contact-text" text-anchor="end">
          ${phone ? `📞 ${phone}` : ''} ${website ? ` | 🌐 ${website}` : ''}
        </text>
      </svg>
    `;

    compositeLayers.push({
      input: Buffer.from(svgOverlay),
      top: 0,
      left: 0,
    });

    // Composite layers onto Base Template
    const finalBuffer = await sharp(baseBuffer)
      .composite(compositeLayers)
      .png()
      .toBuffer();

    return `data:image/png;base64,${finalBuffer.toString('base64')}`;
  } catch (error) {
    throw new Error(`Sharp compositing failed: ${error.message}`);
  }
};
