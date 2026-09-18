/**
 * Helper to generate 100% exact transparent SVG overlay Data URIs matching configJson elements
 */
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
