/**
 * Helper to generate valid transparent SVG overlay Data URIs for frame seeds
 */
const createSvgOverlayUri = ({
  barFill = '#0F172A',
  barBorder = '#EAB308',
  barY = 920,
  barHeight = 160,
  isCapsule = false,
  hasAvatarRing = true,
}) => {
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

const createSvgPreviewUri = ({
  barFill = '#0F172A',
  barBorder = '#EAB308',
  barY = 920,
  barHeight = 160,
  isCapsule = false,
  hasAvatarRing = true,
  sampleName = 'Sample Business Name',
  samplePhone = '📞 +91 98765 43210',
}) => {
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
 * Seed Master Preset Frames (30 Complex & Unique Vector Blueprints)
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export async function seedFrames(prisma) {
  console.log('🖼️ Seeding 30 Master Complex PNG Frames with Vector Config Blueprints...');

  const masterFrames = [
    // 1. Gold Luxury Border Frame
    {
      id: 'frame-gold-border-png',
      title: 'Gold Luxury Border Frame',
      description: 'Elegant golden transparent border overlay suitable for premium business posts.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#1E1B4B', barBorder: '#EAB308', isCapsule: true, barY: 920, barHeight: 120 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_gold_bar', type: 'CAPSULE', slotCategory: 'STATIC_SHAPE', x: 140, y: 920, width: 800, height: 120, fillColor: '#EAB308', borderColor: '#FFFFFF', borderWidth: 3 },
          { id: 'avatar_gold_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', customLabel: 'Profile Photo', x: 160, y: 930, width: 100, height: 100, borderColor: '#EAB308', borderWidth: 4 },
          { id: 'text_gold_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Sunrise Real Estate', x: 280, y: 940, width: 600, height: 40, fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
          { id: 'text_gold_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '📞', text: '+91 98765 43210', x: 280, y: 980, width: 600, height: 35, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FEF08A', textAlign: 'left' },
        ],
      },
    },

    // 2. Classic Corporate Minimal
    {
      id: 'frame-classic-corporate-png',
      title: 'Classic Corporate Minimal Overlay',
      description: 'Clean transparent footer and corner badge overlay for business announcements.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#0F172A', barBorder: '#38BDF8', isCapsule: false, barY: 940, barHeight: 140 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_corp_footer', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 940, width: 1080, height: 140, fillColor: '#0F172A', borderColor: '#38BDF8', borderWidth: 2 },
          { id: 'avatar_corp_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 40, y: 955, width: 110, height: 110, borderColor: '#38BDF8', borderWidth: 3 },
          { id: 'text_corp_biz_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Apex Financial Services', x: 180, y: 960, width: 500, height: 40, fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
          { id: 'text_corp_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '📞', text: '+91 99999 88888', x: 180, y: 1005, width: 400, height: 35, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#38BDF8', textAlign: 'left' },
        ],
      },
    },

    // 3. Royal Festive Garland Overlay
    {
      id: 'frame-festival-royal-diwali',
      title: 'Royal Festive Garland Overlay',
      description: 'Traditional crimson and gold ornamental garland footer for Diwali, Dussehra & Eid.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#881337', barBorder: '#F59E0B', isCapsule: false, barY: 920, barHeight: 160 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_fest_bar', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 920, width: 1080, height: 160, fillColor: '#881337', borderColor: '#F59E0B', borderWidth: 3 },
          { id: 'avatar_fest_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 50, y: 935, width: 130, height: 130, borderColor: '#F59E0B', borderWidth: 4 },
          { id: 'text_fest_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Royal Sweets & Bakery', x: 210, y: 950, width: 550, height: 45, fontSize: 30, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FEF08A', textAlign: 'left' },
          { id: 'text_fest_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '📞', text: '+91 98765 43210', x: 210, y: 1000, width: 500, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 4. Cyber Neon Tech Pill
    {
      id: 'frame-modern-neon-cyber',
      title: 'Cyber Neon Tech Pill',
      description: 'Futuristic glowing neon cyan and violet rounded container for modern brands.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#1E1B4B', barBorder: '#06B6D4', isCapsule: true, barY: 930, barHeight: 110, hasAvatarRing: false }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_neon_pill', type: 'CAPSULE', slotCategory: 'STATIC_SHAPE', x: 60, y: 930, width: 960, height: 110, fillColor: '#1E1B4B', borderColor: '#06B6D4', borderWidth: 3 },
          { id: 'text_neon_title', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Nexus Cyber Solutions', x: 100, y: 950, width: 500, height: 35, fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#22D3EE', textAlign: 'left' },
          { id: 'text_neon_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '⚡', text: '+91 91234 56789', x: 620, y: 950, width: 360, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#A7F3D0', textAlign: 'right' },
        ],
      },
    },

    // 5. Emerald Royale Premium Frame
    {
      id: 'frame-emerald-wealth',
      title: 'Emerald Royale Premium Frame',
      description: 'Deep emerald green with polished gold trim overlay for wealth & luxury brands.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#064E3B', barBorder: '#F59E0B', isCapsule: false, barY: 920, barHeight: 125 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_emerald_box', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 40, y: 920, width: 1000, height: 125, fillColor: '#064E3B', borderColor: '#F59E0B', borderWidth: 2 },
          { id: 'avatar_emerald_ring', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 70, y: 935, width: 95, height: 95, borderColor: '#F59E0B', borderWidth: 3 },
          { id: 'text_emerald_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Verdant Wealth Management', x: 190, y: 945, width: 550, height: 38, fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
          { id: 'text_emerald_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '📞', text: '+91 98888 77777', x: 190, y: 988, width: 400, height: 32, fontSize: 19, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#6EE7B7', textAlign: 'left' },
        ],
      },
    },

    // 6. Frosted Glass Corner Card
    {
      id: 'frame-corner-glassmorphism',
      title: 'Frosted Glass Corner Card',
      description: 'Modern glassmorphism translucent floating card anchored in bottom-left corner.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#1E293B', barBorder: '#94A3B8', isCapsule: false, barY: 880, barHeight: 160 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_glass_card', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 40, y: 880, width: 600, height: 160, fillColor: '#1E293B', borderColor: '#94A3B8', borderWidth: 2 },
          { id: 'avatar_glass_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 65, y: 905, width: 110, height: 110, borderColor: '#38BDF8', borderWidth: 3 },
          { id: 'text_glass_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Studio Lumina Architecture', x: 200, y: 920, width: 420, height: 40, fontSize: 24, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
          { id: 'text_glass_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '📱', text: '+91 97777 66666', x: 200, y: 970, width: 420, height: 35, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#7DD3FC', textAlign: 'left' },
        ],
      },
    },

    // 7. Gourmet Restaurant Banner
    {
      id: 'frame-restaurant-gourmet',
      title: 'Gourmet Restaurant Banner',
      description: 'Warm espresso and golden amber footer ribbon tailored for restaurants & cafes.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#451A03', barBorder: '#F59E0B', isCapsule: false, barY: 920, barHeight: 160 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_gourmet_bar', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 920, width: 1080, height: 160, fillColor: '#451A03', borderColor: '#F59E0B', borderWidth: 2 },
          { id: 'avatar_gourmet_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 50, y: 935, width: 130, height: 130, borderColor: '#F59E0B', borderWidth: 4 },
          { id: 'text_gourmet_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Spice Route Bistro & Bar', x: 210, y: 950, width: 550, height: 45, fontSize: 30, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FDE68A', textAlign: 'left' },
          { id: 'text_gourmet_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🍽️', text: '+91 94444 33333', x: 210, y: 1000, width: 500, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 8. Rose Gold Elegance Spa Frame
    {
      id: 'frame-salon-beauty-spa',
      title: 'Rose Gold Elegance Spa Frame',
      description: 'Soft rose gold accent arch for beauty parlors, salons, and wellness spas.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#831843', barBorder: '#F472B6', isCapsule: true, barY: 920, barHeight: 120 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_spa_bar', type: 'CAPSULE', slotCategory: 'STATIC_SHAPE', x: 100, y: 920, width: 880, height: 120, fillColor: '#831843', borderColor: '#F472B6', borderWidth: 2 },
          { id: 'avatar_spa_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 130, y: 930, width: 100, height: 100, borderColor: '#F472B6', borderWidth: 3 },
          { id: 'text_spa_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Glow Beauty Lounge & Spa', x: 250, y: 945, width: 500, height: 40, fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FCE7F3', textAlign: 'left' },
          { id: 'text_spa_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '💇‍♀️', text: '+91 93333 22222', x: 250, y: 985, width: 450, height: 35, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 9. Prime Property Real Estate Banner
    {
      id: 'frame-realestate-luxury',
      title: 'Prime Property Luxury Overlay',
      description: 'Split navy and gold bottom strip overlay for real estate brokers & property listings.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#0F172A', barBorder: '#D97706', isCapsule: false, barY: 920, barHeight: 160 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_re_bar', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 920, width: 1080, height: 160, fillColor: '#0F172A', borderColor: '#D97706', borderWidth: 3 },
          { id: 'avatar_re_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 40, y: 935, width: 130, height: 130, borderColor: '#D97706', borderWidth: 4 },
          { id: 'text_re_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Skyline Luxury Homes', x: 200, y: 950, width: 550, height: 45, fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FEF3C7', textAlign: 'left' },
          { id: 'text_re_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🏢', text: '+91 92222 11111', x: 200, y: 1000, width: 500, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 10. Bold Athletic Fitness Punch Frame
    {
      id: 'frame-fitness-gym-bold',
      title: 'Voltage Athletic Gym Frame',
      description: 'High-contrast voltage yellow and dark charcoal overlay for gyms & fitness trainers.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#18181B', barBorder: '#EAB308', isCapsule: false, barY: 930, barHeight: 150 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_gym_bar', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 930, width: 1080, height: 150, fillColor: '#18181B', borderColor: '#EAB308', borderWidth: 4 },
          { id: 'avatar_gym_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 40, y: 945, width: 120, height: 120, borderColor: '#EAB308', borderWidth: 4 },
          { id: 'text_gym_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Iron Core Fitness Club', x: 190, y: 955, width: 550, height: 40, fontSize: 30, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FACC15', textAlign: 'left' },
          { id: 'text_gym_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🏋️‍♂️', text: '+91 91111 00000', x: 190, y: 1005, width: 450, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 11. MedCare Professional Doctor Overlay
    {
      id: 'frame-healthcare-medical',
      title: 'MedCare Medical Professional Banner',
      description: 'Clean medical teal and white footer banner for clinics, doctors, & hospitals.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#0F766E', barBorder: '#CCFBF1', isCapsule: false, barY: 930, barHeight: 150 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_med_bar', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 930, width: 1080, height: 150, fillColor: '#0F766E', borderColor: '#CCFBF1', borderWidth: 2 },
          { id: 'avatar_med_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 40, y: 945, width: 120, height: 120, borderColor: '#FFFFFF', borderWidth: 4 },
          { id: 'text_med_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Dr. Sharma Super Care Clinic', x: 190, y: 955, width: 550, height: 40, fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
          { id: 'text_med_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🏥', text: '+91 90000 12345', x: 190, y: 1005, width: 450, height: 35, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#CCFBF1', textAlign: 'left' },
        ],
      },
    },

    // 12. Diamond Platinum Royale Jewellery Frame
    {
      id: 'frame-jewellery-diamond',
      title: 'Diamond Platinum Royale Overlay',
      description: 'Platinum white and gold ornamental border overlay for luxury jewellery & fashion brands.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#1E1B4B', barBorder: '#F59E0B', isCapsule: true, barY: 920, barHeight: 120 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_jewel_bar', type: 'CAPSULE', slotCategory: 'STATIC_SHAPE', x: 100, y: 920, width: 880, height: 120, fillColor: '#1E1B4B', borderColor: '#F59E0B', borderWidth: 2 },
          { id: 'avatar_jewel_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 130, y: 930, width: 100, height: 100, borderColor: '#F59E0B', borderWidth: 3 },
          { id: 'text_jewel_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Ornate Gold & Diamonds', x: 250, y: 945, width: 500, height: 40, fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FEF08A', textAlign: 'left' },
          { id: 'text_jewel_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '💎', text: '+91 98989 89898', x: 250, y: 985, width: 450, height: 35, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 13. Futuristic Tech Startup Bar
    {
      id: 'frame-tech-startup',
      title: 'Futuristic Tech Startup Pill Bar',
      description: 'Indigo to violet gradient floating pill bar for tech platforms & agency posts.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#312E81', barBorder: '#818CF8', isCapsule: true, barY: 930, barHeight: 110, hasAvatarRing: false }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_tech_bar', type: 'CAPSULE', slotCategory: 'STATIC_SHAPE', x: 80, y: 930, width: 920, height: 110, fillColor: '#312E81', borderColor: '#818CF8', borderWidth: 2 },
          { id: 'text_tech_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'CloudScale AI Innovations', x: 130, y: 950, width: 500, height: 35, fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#C7D2FE', textAlign: 'left' },
          { id: 'text_tech_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🚀', text: '+91 95555 44444', x: 640, y: 950, width: 320, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'right' },
        ],
      },
    },

    // 14. Ultra Minimal Soft White Frame
    {
      id: 'frame-minimal-white-accent',
      title: 'Ultra Minimal Soft Line Overlay',
      description: 'Crisp clean white footer border overlay for modern minimalist creators & freelancers.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#020617', barBorder: '#E2E8F0', isCapsule: false, barY: 950, barHeight: 130 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_min_footer', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 950, width: 1080, height: 130, fillColor: '#020617', borderColor: '#E2E8F0', borderWidth: 1 },
          { id: 'avatar_min_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 40, y: 960, width: 100, height: 100, borderColor: '#F8FAFC', borderWidth: 2 },
          { id: 'text_min_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Aria Chen Photography', x: 160, y: 970, width: 500, height: 35, fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#F8FAFC', textAlign: 'left' },
          { id: 'text_min_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '📞', text: '+91 97777 00000', x: 160, y: 1010, width: 400, height: 30, fontSize: 18, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#94A3B8', textAlign: 'left' },
        ],
      },
    },

    // 15. Traditional Mandala Cultural Frame
    {
      id: 'frame-festival-rangoli-mandala',
      title: 'Traditional Mandala Cultural Frame',
      description: 'Marigold orange and gold mandala corner overlay for traditional Indian festivals & cultural events.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#7C2D12', barBorder: '#F97316', isCapsule: false, barY: 920, barHeight: 160 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_mandala_bar', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 920, width: 1080, height: 160, fillColor: '#7C2D12', borderColor: '#F97316', borderWidth: 3 },
          { id: 'avatar_mandala_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 50, y: 935, width: 130, height: 130, borderColor: '#FB923C', borderWidth: 4 },
          { id: 'text_mandala_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Heritage Silk & Crafts', x: 210, y: 950, width: 550, height: 45, fontSize: 30, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FED7AA', textAlign: 'left' },
          { id: 'text_mandala_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🪔', text: '+91 98888 12345', x: 210, y: 1000, width: 500, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 16. Automobile Showroom Showcase
    {
      id: 'frame-automobile-showroom',
      title: 'Turbo Motors Luxury Showcase',
      description: 'Metallic silver and crimson split accent container for auto dealerships & car launches.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#991B1B', barBorder: '#E2E8F0', isCapsule: false, barY: 910, barHeight: 170 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_auto_footer', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 910, width: 1080, height: 170, fillColor: '#991B1B', borderColor: '#E2E8F0', borderWidth: 3 },
          { id: 'avatar_auto_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 45, y: 925, width: 140, height: 140, borderColor: '#FFFFFF', borderWidth: 5 },
          { id: 'text_auto_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Turbo Motors Luxury Hub', x: 215, y: 940, width: 550, height: 45, fontSize: 30, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
          { id: 'text_auto_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🏎️', text: '+91 97777 99999', x: 215, y: 995, width: 500, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FCA5A5', textAlign: 'left' },
        ],
      },
    },

    // 17. Political & Civic Campaign Frame
    {
      id: 'frame-political-campaign',
      title: 'Electoral Pride & Public Service Frame',
      description: 'Saffron and emerald tri-color ribbon footer for political leaders & public service campaigns.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#C2410C', barBorder: '#FACC15', isCapsule: false, barY: 910, barHeight: 170 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_pol_footer', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 910, width: 1080, height: 170, fillColor: '#C2410C', borderColor: '#FACC15', borderWidth: 3 },
          { id: 'avatar_pol_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 50, y: 925, width: 140, height: 140, borderColor: '#FACC15', borderWidth: 5 },
          { id: 'text_pol_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Rajesh Kumar (Public Leader)', x: 220, y: 940, width: 600, height: 45, fontSize: 32, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
          { id: 'text_pol_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🇮🇳', text: '+91 96666 55555', x: 220, y: 995, width: 500, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FEF08A', textAlign: 'left' },
        ],
      },
    },

    // 18. Education & Coaching Academy
    {
      id: 'frame-education-academy',
      title: 'Excellence Study & Skill Academy',
      description: 'Deep navy and scholar gold footer for schools, coaching institutes & online academies.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#1E3A8A', barBorder: '#F59E0B', isCapsule: false, barY: 930, barHeight: 150 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_edu_bar', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 930, width: 1080, height: 150, fillColor: '#1E3A8A', borderColor: '#F59E0B', borderWidth: 3 },
          { id: 'avatar_edu_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 40, y: 945, width: 120, height: 120, borderColor: '#F59E0B', borderWidth: 4 },
          { id: 'text_edu_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Pinnacle IAS & Skill Academy', x: 190, y: 955, width: 550, height: 40, fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
          { id: 'text_edu_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🎓', text: '+91 94444 11111', x: 190, y: 1005, width: 450, height: 35, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#93C5FD', textAlign: 'left' },
        ],
      },
    },

    // 19. Solitaire Diamond Jewellery Frame
    {
      id: 'frame-jewelry-diamond-luxury',
      title: 'Royal Solitaire Diamond Filigree',
      description: 'Deep plum and filigree gold frame border for high-end solitaire & bridal jewellery.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#4C1D95', barBorder: '#F59E0B', isCapsule: false, barY: 910, barHeight: 140 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_dia_bar', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 50, y: 910, width: 980, height: 140, fillColor: '#4C1D95', borderColor: '#F59E0B', borderWidth: 3 },
          { id: 'avatar_dia_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 80, y: 925, width: 110, height: 110, borderColor: '#F59E0B', borderWidth: 3 },
          { id: 'text_dia_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Eternia Solitaire Jewels', x: 220, y: 938, width: 550, height: 40, fontSize: 28, fontFamily: 'Cinzel', fontWeight: 'bold', fontColor: '#FDE68A', textAlign: 'left' },
          { id: 'text_dia_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '💎', text: '+91 98989 00000', x: 220, y: 988, width: 450, height: 35, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 20. High-Fashion Vogue Editorial
    {
      id: 'frame-fashion-boutique',
      title: 'High-Fashion Vogue Editorial Strip',
      description: 'Monochrome noir and champagne gold border strip for haute couture & fashion labels.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#000000', barBorder: '#D4AF37', isCapsule: false, barY: 940, barHeight: 140 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_fash_bar', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 940, width: 1080, height: 140, fillColor: '#000000', borderColor: '#D4AF37', borderWidth: 2 },
          { id: 'avatar_fash_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 40, y: 955, width: 110, height: 110, borderColor: '#D4AF37', borderWidth: 3 },
          { id: 'text_fash_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Maison de Couture Label', x: 180, y: 965, width: 500, height: 40, fontSize: 26, fontFamily: 'Playfair Display', fontWeight: 'bold', fontColor: '#F3E5AB', textAlign: 'left' },
          { id: 'text_fash_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '👠', text: '+91 93333 11111', x: 180, y: 1010, width: 400, height: 30, fontSize: 18, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 21. Cyberpunk Gaming & Esports
    {
      id: 'frame-gaming-esports',
      title: 'Cyberpunk Gaming & Esports Capsule',
      description: 'Electric purple & neon lime angled capsule pill for streamers & gaming teams.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#581C87', barBorder: '#84CC16', isCapsule: true, barY: 930, barHeight: 110, hasAvatarRing: false }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_game_pill', type: 'CAPSULE', slotCategory: 'STATIC_SHAPE', x: 60, y: 930, width: 960, height: 110, fillColor: '#581C87', borderColor: '#84CC16', borderWidth: 3 },
          { id: 'text_game_title', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Vortex Esports League', x: 110, y: 950, width: 500, height: 35, fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#BEF264', textAlign: 'left' },
          { id: 'text_game_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🎮', text: 'Live @vortex_gaming', x: 630, y: 950, width: 350, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'right' },
        ],
      },
    },

    // 22. Happy Paws Vet Clinic
    {
      id: 'frame-pet-care-vet',
      title: 'Happy Paws Vet & Pet Clinic',
      description: 'Warm honey amber and teal paw accent container for pet clinics & grooming salons.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#115E59', barBorder: '#F59E0B', isCapsule: false, barY: 930, barHeight: 150 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_pet_bar', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 930, width: 1080, height: 150, fillColor: '#115E59', borderColor: '#F59E0B', borderWidth: 3 },
          { id: 'avatar_pet_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 40, y: 945, width: 120, height: 120, borderColor: '#F59E0B', borderWidth: 4 },
          { id: 'text_pet_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Happy Paws Pet Care Hospital', x: 190, y: 955, width: 550, height: 40, fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FEF08A', textAlign: 'left' },
          { id: 'text_pet_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🐾', text: '+91 92222 33333', x: 190, y: 1005, width: 450, height: 35, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 23. Eco Organic Bio Store
    {
      id: 'frame-eco-organic-store',
      title: 'Earth Organic & Bio Store',
      description: 'Forest green and sage eco leaf ribbon for organic foods & wellness stores.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#14532D', barBorder: '#86EFAC', isCapsule: false, barY: 920, barHeight: 160 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_eco_bar', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 920, width: 1080, height: 160, fillColor: '#14532D', borderColor: '#86EFAC', borderWidth: 2 },
          { id: 'avatar_eco_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 45, y: 935, width: 130, height: 130, borderColor: '#86EFAC', borderWidth: 4 },
          { id: 'text_eco_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Fresh Earth Organic Superstore', x: 200, y: 950, width: 550, height: 45, fontSize: 30, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#DCFCE7', textAlign: 'left' },
          { id: 'text_eco_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🌿', text: '+91 91111 22222', x: 200, y: 1000, width: 500, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 24. Crypto & Web3 Fintech Frame
    {
      id: 'frame-fintech-crypto',
      title: 'Blockchain & Modern Wealth Pill',
      description: 'Dark charcoal & electric cyan gradient pill for fintech apps & crypto platforms.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#0F172A', barBorder: '#38BDF8', isCapsule: true, barY: 930, barHeight: 110, hasAvatarRing: false }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_crypto_pill', type: 'CAPSULE', slotCategory: 'STATIC_SHAPE', x: 80, y: 930, width: 920, height: 110, fillColor: '#0F172A', borderColor: '#38BDF8', borderWidth: 3 },
          { id: 'text_crypto_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Zenith Pay Fintech Hub', x: 130, y: 950, width: 500, height: 35, fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#38BDF8', textAlign: 'left' },
          { id: 'text_crypto_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🌐', text: '+91 90000 90000', x: 640, y: 950, width: 320, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'right' },
        ],
      },
    },

    // 25. Wedding & Marriage Planner
    {
      id: 'frame-wedding-planner',
      title: 'Eternia Royal Marriage Banner',
      description: 'Blush pink and vintage gold floral ribbon for wedding planners & banquet halls.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#831843', barBorder: '#F59E0B', isCapsule: false, barY: 920, barHeight: 160 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_wed_bar', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 920, width: 1080, height: 160, fillColor: '#831843', borderColor: '#F59E0B', borderWidth: 3 },
          { id: 'avatar_wed_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 50, y: 935, width: 130, height: 130, borderColor: '#F59E0B', borderWidth: 4 },
          { id: 'text_wed_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Royal Event & Wedding Planners', x: 210, y: 950, width: 550, height: 45, fontSize: 30, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FDE68A', textAlign: 'left' },
          { id: 'text_wed_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '💒', text: '+91 98888 99999', x: 210, y: 1000, width: 500, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 26. Sweet Craving Pastry Studio
    {
      id: 'frame-bakery-confectionery',
      title: 'Sweet Craving Pastry Studio Pill',
      description: 'Warm chocolate and berry pink pill for cake shops & home bakers.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#451A03', barBorder: '#EC4899', isCapsule: true, barY: 920, barHeight: 120 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_bake_pill', type: 'CAPSULE', slotCategory: 'STATIC_SHAPE', x: 100, y: 920, width: 880, height: 120, fillColor: '#451A03', borderColor: '#EC4899', borderWidth: 2 },
          { id: 'avatar_bake_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 130, y: 930, width: 100, height: 100, borderColor: '#EC4899', borderWidth: 3 },
          { id: 'text_bake_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Sweet Cravings Artisanal Bakery', x: 250, y: 945, width: 500, height: 40, fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FBCFE8', textAlign: 'left' },
          { id: 'text_bake_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🎂', text: '+91 97777 44444', x: 250, y: 985, width: 450, height: 35, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 27. Live Stage DJ Concert
    {
      id: 'frame-music-concert-fest',
      title: 'Live Stage Beats & DJ Event Banner',
      description: 'Electric magenta and dark violet angled banner for concerts & DJ night events.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#701A75', barBorder: '#F43F5E', isCapsule: false, barY: 920, barHeight: 160 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_music_bar', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 920, width: 1080, height: 160, fillColor: '#701A75', borderColor: '#F43F5E', borderWidth: 3 },
          { id: 'avatar_music_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 50, y: 935, width: 130, height: 130, borderColor: '#F43F5E', borderWidth: 4 },
          { id: 'text_music_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Sunburn Beats Live Concert', x: 210, y: 950, width: 550, height: 45, fontSize: 30, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FECDD3', textAlign: 'left' },
          { id: 'text_music_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🎵', text: '+91 96666 11111', x: 210, y: 1000, width: 500, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 28. Construction Builders Industrial Frame
    {
      id: 'frame-construction-builders',
      title: 'Heavy Structural Infra Frame',
      description: 'Safety yellow and industrial black striped border bar for builders & civil engineers.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#09090B', barBorder: '#EAB308', isCapsule: false, barY: 930, barHeight: 150 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_build_bar', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 0, y: 930, width: 1080, height: 150, fillColor: '#09090B', borderColor: '#EAB308', borderWidth: 4 },
          { id: 'avatar_build_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 40, y: 945, width: 120, height: 120, borderColor: '#EAB308', borderWidth: 4 },
          { id: 'text_build_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Titan Infra & Construction', x: 190, y: 955, width: 550, height: 40, fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FACC15', textAlign: 'left' },
          { id: 'text_build_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🏗️', text: '+91 95555 88888', x: 190, y: 1005, width: 450, height: 35, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
        ],
      },
    },

    // 29. SunPower Green Solar Energy
    {
      id: 'frame-solar-clean-energy',
      title: 'SunPower Green Tech Solar Pill',
      description: 'Solar gold and emerald sky capsule pill for green energy & solar panel installers.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#065F46', barBorder: '#FACC15', isCapsule: true, barY: 930, barHeight: 110, hasAvatarRing: false }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_solar_pill', type: 'CAPSULE', slotCategory: 'STATIC_SHAPE', x: 80, y: 930, width: 920, height: 110, fillColor: '#065F46', borderColor: '#FACC15', borderWidth: 3 },
          { id: 'text_solar_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'SunPower Green Tech Energy', x: 130, y: 950, width: 500, height: 35, fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FACC15', textAlign: 'left' },
          { id: 'text_solar_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '☀️', text: '+91 94444 77777', x: 640, y: 950, width: 320, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'right' },
        ],
      },
    },

    // 30. Modernist Interior Design Studio
    {
      id: 'frame-interior-design',
      title: 'Modernist Habitat Interiors Frame',
      description: 'Warm terracotta and sandstone minimal card for interior designers & home decor.',
      overlayPngUrl: createSvgOverlayUri({ barFill: '#7C2D12', barBorder: '#FED7AA', isCapsule: false, barY: 880, barHeight: 160 }),
      isSystem: true,
      isActive: true,
      configJson: {
        elements: [
          { id: 'shape_int_card', type: 'RECTANGLE', slotCategory: 'STATIC_SHAPE', x: 40, y: 880, width: 600, height: 160, fillColor: '#7C2D12', borderColor: '#FED7AA', borderWidth: 2 },
          { id: 'avatar_int_circle', type: 'CIRCLE', slotCategory: 'IMAGE_SLOT', dynamicSlot: 'AVATAR_CIRCLE', x: 65, y: 905, width: 110, height: 110, borderColor: '#FED7AA', borderWidth: 3 },
          { id: 'text_int_name', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'BUSINESS_NAME', text: 'Habitat Modernist Interiors', x: 200, y: 920, width: 420, height: 40, fontSize: 24, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FFFFFF', textAlign: 'left' },
          { id: 'text_int_phone', type: 'TEXT', slotCategory: 'TEXT_INPUT', dynamicSlot: 'PHONE', iconPrefix: '🛋️', text: '+91 93333 55555', x: 200, y: 970, width: 420, height: 35, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 'bold', fontColor: '#FED7AA', textAlign: 'left' },
        ],
      },
    },
  ];

  for (const frame of masterFrames) {
    if (!frame.previewUrl) {
      frame.previewUrl = createSvgPreviewUri({
        sampleName: frame.title || 'Sample Business Name',
        samplePhone: '📞 +91 98765 43210',
      });
    }
    await prisma.frame.upsert({
      where: { id: frame.id },
      update: frame,
      create: frame,
    });
  }

  console.log(`✅ Seeded ${masterFrames.length} Master Complex PNG Frames with Vector Config Blueprints.`);
}
