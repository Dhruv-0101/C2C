import { drawVectorShapePath } from '@/features/admin/frames/hooks/useFrameCanvasEngine';

export const drawImageAspectCover = (ctx, img, dx, dy, dWidth, dHeight) => {
  if (!img) return;
  const imgW = img.naturalWidth || img.width || dWidth;
  const imgH = img.naturalHeight || img.height || dHeight;
  const imgRatio = imgW / imgH;
  const targetRatio = dWidth / dHeight;

  let sx = 0, sy = 0, sW = imgW, sH = imgH;

  if (imgRatio > targetRatio) {
    sW = imgH * targetRatio;
    sx = (imgW - sW) / 2;
  } else {
    sH = imgW / targetRatio;
    sy = (imgH - sH) / 2;
  }

  ctx.drawImage(img, sx, sy, sW, sH, dx, dy, dWidth, dHeight);
};

export const drawImageAspectContain = (ctx, img, dx, dy, dWidth, dHeight) => {
  if (!img) return;
  const imgW = img.naturalWidth || img.width || dWidth;
  const imgH = img.naturalHeight || img.height || dHeight;
  const imgRatio = imgW / imgH;
  const targetRatio = dWidth / dHeight;

  let renderW = dWidth;
  let renderH = dHeight;
  let renderX = dx;
  let renderY = dy;

  if (imgRatio > targetRatio) {
    renderH = dWidth / imgRatio;
    renderY = dy + (dHeight - renderH) / 2;
  } else {
    renderW = dHeight * imgRatio;
    renderX = dx + (dWidth - renderW) / 2;
  }

  ctx.fillStyle = '#0B0F17';
  ctx.fillRect(dx, dy, dWidth, dHeight);
  ctx.drawImage(img, 0, 0, imgW, imgH, renderX, renderY, renderW, renderH);
};

export const loadImageAsync = (src) => {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
};

/**
 * Standalone asynchronous Canvas Compositor
 * Merges Base Template Graphic + Frame + BrandKit + Overrides onto an in-memory 1080x1080 canvas
 * and returns high-definition PNG base64 dataUrl.
 *
 * @param {Object} params
 * @param {HTMLCanvasElement} [params.canvas] - Optional existing canvas; creates an in-memory element if omitted
 * @param {string} params.baseImageUrl - Base graphic background URL
 * @param {Object} [params.selectedFrame] - Frame configuration object with overlayPngUrl and configJson
 * @param {Object} [params.brandKit] - BrandKit snapshot (businessName, phone, logoUrl, etc.)
 * @param {Object} [params.customDetails] - Any custom layout/text overrides
 * @param {Function} [params.loadImageFn] - Custom image loader / cache function
 * @returns {Promise<string|null>} Data URL string of composited 1080x1080 PNG graphic
 */
export async function renderCompositeGraphicToDataUrl({
  canvas,
  baseImageUrl,
  selectedFrame,
  brandKit,
  customDetails = {},
  loadImageFn = loadImageAsync,
}) {
  if (!baseImageUrl) return null;
  const targetCanvas = canvas || document.createElement('canvas');
  if (targetCanvas.width !== 1080 || targetCanvas.height !== 1080) {
    targetCanvas.width = 1080;
    targetCanvas.height = 1080;
  }

  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return null;

  // Effective brandkit data with live user overrides
  const activeBusinessName = customDetails.businessName !== undefined ? customDetails.businessName : (brandKit?.businessName || '');
  const activeTagline = customDetails.tagline !== undefined ? customDetails.tagline : (brandKit?.tagline || '');
  const activePhone = customDetails.phone !== undefined ? customDetails.phone : (brandKit?.phone || brandKit?.whatsapp || '');
  const activeAddress = customDetails.address !== undefined ? customDetails.address : (brandKit?.address ? `${brandKit.address}${brandKit.city ? `, ${brandKit.city}` : ''}` : '');
  const activeLogoUrl = customDetails.logoUrl || brandKit?.logoUrl;
  const activeAvatarUrl = customDetails.avatarUrl || brandKit?.avatarUrl;
  const activeUpiQrUrl = customDetails.upiQrUrl !== undefined ? customDetails.upiQrUrl : (brandKit?.upiQrUrl || null);

  const showLogo = customDetails.showLogo !== undefined ? customDetails.showLogo : true;
  const showAvatar = customDetails.showAvatar !== undefined ? customDetails.showAvatar : true;
  const showUpiQr = customDetails.showUpiQr !== undefined ? customDetails.showUpiQr : true;
  const showPhone = customDetails.showPhone !== undefined ? customDetails.showPhone : true;
  const showAddress = customDetails.showAddress !== undefined ? customDetails.showAddress : true;

  // Safely extract JSON config elements array across all API formats (stringified or object)
  let rawConfig = selectedFrame?.configJson || selectedFrame?.blueprint || selectedFrame?.layoutConfig || selectedFrame?.jsonConfig || selectedFrame?.config;
  if (typeof rawConfig === 'string') {
    try {
      rawConfig = JSON.parse(rawConfig);
    } catch (e) {
      console.warn('Failed to parse frame configJson string:', e);
    }
  }

  const parsedElements = Array.isArray(rawConfig)
    ? rawConfig
    : (rawConfig?.elements && Array.isArray(rawConfig.elements) ? rawConfig.elements : null);

  const DEFAULT_FRAME_ELEMENTS = [
    {
      id: 'el-footer-bg',
      name: 'Footer Bar Container',
      type: 'RECTANGLE',
      x: 0,
      y: 940,
      width: 1080,
      height: 140,
      fillColor: '#0B0F17',
      borderColor: '#EAB308',
      borderWidth: 3,
      borderRadius: 0,
      slotCategory: 'STATIC_SHAPE',
      dynamicSlot: 'NONE',
    },
    {
      id: 'el-logo-box',
      name: 'Logo Container Box',
      type: 'RECTANGLE',
      x: 35,
      y: 35,
      width: 120,
      height: 120,
      fillColor: '#FFFFFF',
      borderColor: '#CBD5E1',
      borderWidth: 2,
      borderRadius: 16,
      slotCategory: 'IMAGE_SLOT',
      dynamicSlot: 'LOGO_BOX',
    },
    {
      id: 'el-avatar-circle',
      name: 'Owner Headshot Ring',
      type: 'CIRCLE',
      x: 35,
      y: 890,
      width: 130,
      height: 130,
      fillColor: '#1E293B',
      borderColor: '#EAB308',
      borderWidth: 5,
      borderRadius: 65,
      slotCategory: 'IMAGE_SLOT',
      dynamicSlot: 'AVATAR_CIRCLE',
    },
    {
      id: 'el-business-name',
      name: 'Business Name Text',
      type: 'TEXT',
      x: 185,
      y: 965,
      width: 450,
      height: 40,
      fillColor: '#FFFFFF',
      fontSize: 28,
      fontFamily: 'Space Grotesk',
      fontWeight: 'bold',
      fontColor: '#FFFFFF',
      textAlign: 'left',
      slotCategory: 'TEXT_INPUT',
      dynamicSlot: 'BUSINESS_NAME',
      text: 'SUNRISE REAL ESTATE',
    },
    {
      id: 'el-phone-badge',
      name: 'Phone Badge',
      type: 'TEXT',
      x: 700,
      y: 965,
      width: 340,
      height: 40,
      fillColor: '#EAB308',
      fontSize: 22,
      fontFamily: 'Space Grotesk',
      fontWeight: 'bold',
      fontColor: '#EAB308',
      textAlign: 'right',
      slotCategory: 'TEXT_INPUT',
      dynamicSlot: 'PHONE',
      text: '+91 98765 43210',
    },
    {
      id: 'el-address-text',
      name: 'Address Text',
      type: 'TEXT',
      x: 700,
      y: 1010,
      width: 340,
      height: 30,
      fillColor: '#CBD5E1',
      fontSize: 15,
      fontFamily: 'Plus Jakarta Sans',
      fontWeight: 'normal',
      fontColor: '#CBD5E1',
      textAlign: 'right',
      slotCategory: 'TEXT_INPUT',
      dynamicSlot: 'ADDRESS',
      text: 'Business Park, MG Road, Mumbai',
    },
  ];

  const frameConfigElements = selectedFrame
    ? (parsedElements && parsedElements.length > 0
      ? parsedElements
      : DEFAULT_FRAME_ELEMENTS)
    : [];

  // Load image assets
  const [baseImg, logoImg, avatarImg, upiQrImg, frameOverlayImg] = await Promise.all([
    loadImageFn(baseImageUrl),
    loadImageFn(showLogo ? activeLogoUrl : null),
    loadImageFn(showAvatar ? activeAvatarUrl : null),
    loadImageFn(showUpiQr ? activeUpiQrUrl : null),
    loadImageFn(selectedFrame?.overlayPngUrl),
  ]);

  // Clear previous canvas frame
  ctx.clearRect(0, 0, 1080, 1080);

  // 1. LAYER 1: Base Graphic Background
  if (baseImg) {
    if (baseImageUrl.startsWith('data:') || baseImageUrl.startsWith('blob:')) {
      drawImageAspectContain(ctx, baseImg, 0, 0, 1080, 1080);
    } else {
      drawImageAspectCover(ctx, baseImg, 0, 0, 1080, 1080);
    }
  } else {
    ctx.fillStyle = '#0B0F17';
    ctx.fillRect(0, 0, 1080, 1080);
  }

  // 2. LAYER 2: Transparent PNG Frame Overlay & Static Vector Shapes
  const isOpaquePreviewUrl =
    selectedFrame?.overlayPngUrl &&
    selectedFrame?.previewUrl &&
    selectedFrame.overlayPngUrl === selectedFrame.previewUrl &&
    !selectedFrame.overlayPngUrl.startsWith('data:image/svg+xml');

  const staticShapes =
    frameConfigElements?.filter(
      (el) =>
        el.type !== 'TEXT' &&
        el.type !== 'DYNAMIC_TEXT' &&
        el.slotCategory !== 'TEXT_INPUT' &&
        el.slotCategory !== 'IMAGE_SLOT' &&
        el.slotCategory !== 'DYNAMIC_IMAGE' &&
        el.type !== 'IMAGE_SLOT' &&
        el.type !== 'IMAGE' &&
        el.dynamicSlot !== 'AVATAR_CIRCLE' &&
        el.dynamicSlot !== 'LOGO_BOX' &&
        el.dynamicSlot !== 'UPI_QR' &&
        el.dynamicSlot !== 'CUSTOM_IMAGE' &&
        el.dynamicSlot !== 'MANUAL_INPUT'
    ) || [];

  if (staticShapes.length > 0) {
    staticShapes.forEach((shape) => {
      ctx.save();
      const rotation = shape.rotation || 0;
      if (rotation) {
        const cx = shape.x + shape.width / 2;
        const cy = shape.y + (shape.height || shape.width) / 2;
        ctx.translate(cx, cy);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-cx, -cy);
      }

      drawVectorShapePath(ctx, shape);

      if (
        shape.type !== 'LINE' &&
        shape.type !== 'FRAME_BORDER' &&
        shape.fillColor &&
        shape.fillColor !== 'transparent'
      ) {
        ctx.fillStyle = shape.fillColor;
        ctx.fill();
      }

      if (shape.borderWidth > 0 || shape.type === 'FRAME_BORDER') {
        ctx.strokeStyle = shape.borderColor || '#EAB308';
        ctx.lineWidth = shape.borderWidth || (shape.type === 'FRAME_BORDER' ? 8 : 2);

        if (shape.borderStyle === 'DASHED') {
          ctx.setLineDash([ctx.lineWidth * 3, ctx.lineWidth * 2]);
        } else if (shape.borderStyle === 'DOTTED') {
          ctx.setLineDash([ctx.lineWidth, ctx.lineWidth]);
        } else {
          ctx.setLineDash([]);
        }

        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
    });
  } else if (frameOverlayImg && !isOpaquePreviewUrl) {
    ctx.drawImage(frameOverlayImg, 0, 0, 1080, 1080);
  }

  // 3. LAYER 3: Render All Configured Image Slots (Logos, Avatars, Image Slots)
  const imageSlots = frameConfigElements?.filter(
    (el) =>
      el.slotCategory === 'IMAGE_SLOT' ||
      el.slotCategory === 'DYNAMIC_IMAGE' ||
      el.type === 'IMAGE_SLOT' ||
      el.type === 'IMAGE' ||
      el.dynamicSlot === 'LOGO_BOX' ||
      el.dynamicSlot === 'AVATAR_CIRCLE' ||
      el.dynamicSlot === 'UPI_QR' ||
      el.dynamicSlot === 'CUSTOM_IMAGE' ||
      el.dynamicSlot === 'MANUAL_INPUT'
  ) || [];

  if (imageSlots.length > 0) {
    for (const slot of imageSlots) {
      const slotKey = slot.id || slot.fieldKey || slot.dynamicSlot;
      const isAvatarSlot = slot.dynamicSlot === 'AVATAR_CIRCLE' || slot.fieldKey === 'avatarUrl';
      const isLogoSlot = slot.dynamicSlot === 'LOGO_BOX' || slot.fieldKey === 'logoUrl';
      const isUpiSlot = slot.dynamicSlot === 'UPI_QR' || slot.fieldKey === 'upiQrUrl';

      if (isAvatarSlot && !showAvatar) continue;
      if (isLogoSlot && !showLogo) continue;
      if (isUpiSlot && !showUpiQr) continue;

      let slotUrl = null;
      if (isAvatarSlot) {
        slotUrl = activeAvatarUrl;
      } else if (isLogoSlot) {
        slotUrl = activeLogoUrl;
      } else if (isUpiSlot) {
        slotUrl = activeUpiQrUrl;
      } else {
        slotUrl =
          (typeof customDetails[slotKey] === 'string' ? customDetails[slotKey] : null) ||
          (typeof customDetails[slot.fieldKey] === 'string' ? customDetails[slot.fieldKey] : null) ||
          (typeof customDetails[slot.id] === 'string' ? customDetails[slot.id] : null) ||
          (typeof slot.src === 'string' ? slot.src : (typeof slot.url === 'string' ? slot.url : null));
      }

      const slotImg = slotUrl ? await loadImageFn(slotUrl) : null;

      if (slotImg) {
        const rotation = slot.rotation || 0;
        if (rotation) {
          const cx = slot.x + slot.width / 2;
          const cy = slot.y + (slot.height || slot.width) / 2;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.translate(-cx, -cy);
        }

        const targetH = slot.height || slot.width;
        ctx.save();
        drawVectorShapePath(ctx, slot);
        ctx.clip();
        drawImageAspectCover(ctx, slotImg, slot.x, slot.y, slot.width, targetH);
        ctx.restore();

        if (slot.borderWidth > 0 || slot.borderColor) {
          ctx.save();
          drawVectorShapePath(ctx, slot);
          ctx.lineWidth = slot.borderWidth || 4;
          ctx.strokeStyle = slot.borderColor || '#EAB308';
          ctx.stroke();
          ctx.restore();
        }

        if (rotation) ctx.restore();
      } else if (slot.dynamicSlot === 'AVATAR_CIRCLE') {
        if (showAvatar) {
          const cx = slot.x + slot.width / 2;
          const cy = slot.y + (slot.height || slot.width) / 2;
          const r = slot.width / 2;

          ctx.save();
          ctx.fillStyle = slot.fillColor || '#1E293B';
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#94A3B8';
          ctx.beginPath();
          ctx.arc(cx, cy - r * 0.2, r * 0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx, cy + r * 0.7, r * 0.6, Math.PI, 0);
          ctx.fill();

          if (slot.borderWidth || slot.borderColor) {
            ctx.lineWidth = slot.borderWidth || 5;
            ctx.strokeStyle = slot.borderColor || '#EAB308';
            ctx.stroke();
          }
          ctx.restore();
        }
      } else if (slot.dynamicSlot === 'LOGO_BOX') {
        if (showLogo) {
          ctx.save();
          ctx.fillStyle = slot.fillColor || '#FFFFFF';
          drawVectorShapePath(ctx, slot);
          ctx.fill();

          if (slot.borderWidth || slot.borderColor) {
            ctx.lineWidth = slot.borderWidth || 2;
            ctx.strokeStyle = slot.borderColor || '#CBD5E1';
            ctx.stroke();
          }

          ctx.fillStyle = '#64748B';
          ctx.font = 'bold 12px "Space Grotesk", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const cx = slot.x + slot.width / 2;
          const cy = slot.y + (slot.height || slot.width) / 2;
          ctx.fillText('🖼️ LOGO SLOT', cx, cy);
          ctx.restore();
        }
      } else if (slot.dynamicSlot === 'UPI_QR' || slot.fieldKey === 'upiQrUrl') {
        if (showUpiQr) {
          ctx.save();
          ctx.fillStyle = '#FFFFFF';
          drawVectorShapePath(ctx, slot);
          ctx.fill();

          if (slot.borderWidth || slot.borderColor) {
            ctx.lineWidth = slot.borderWidth || 2;
            ctx.strokeStyle = slot.borderColor || '#10B981';
            ctx.stroke();
          }

          ctx.fillStyle = '#065F46';
          ctx.font = 'bold 12px "Space Grotesk", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const cx = slot.x + slot.width / 2;
          const cy = slot.y + (slot.height || slot.width) / 2;
          ctx.fillText('📱 UPI QR', cx, cy);
          ctx.restore();
        }
      } else {
        ctx.save();
        if (slot.fillColor && slot.fillColor !== 'transparent') {
          ctx.fillStyle = slot.fillColor;
          drawVectorShapePath(ctx, slot);
          ctx.fill();
        }
        if (slot.borderWidth || slot.borderColor) {
          ctx.lineWidth = slot.borderWidth || 2;
          ctx.strokeStyle = slot.borderColor || '#EAB308';
          drawVectorShapePath(ctx, slot);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  // 4. LAYER 4: Dynamic Text Details & Elements Overlay
  const textElementsInConfig = frameConfigElements?.filter(
    (el) =>
      (el.type === 'TEXT' || el.type === 'DYNAMIC_TEXT' || el.slotCategory === 'TEXT_INPUT' || (el.dynamicSlot && el.dynamicSlot !== 'NONE' && el.dynamicSlot !== 'STATIC')) &&
      el.slotCategory !== 'IMAGE_SLOT' &&
      el.slotCategory !== 'DYNAMIC_IMAGE' &&
      el.dynamicSlot !== 'LOGO_BOX' &&
      el.dynamicSlot !== 'AVATAR_CIRCLE' &&
      el.dynamicSlot !== 'CUSTOM_IMAGE'
  ) || [];

  if (textElementsInConfig.length > 0) {
    textElementsInConfig.forEach((textSlot) => {
      let textVal = '';
      const fieldKey = textSlot.fieldKey || textSlot.dynamicSlot || textSlot.id;
      const frameText = textSlot.text || textSlot.defaultText || '';

      if (textSlot.dynamicSlot === 'BUSINESS_NAME') {
        textVal = customDetails.businessName || brandKit?.businessName || frameText || 'Sunrise Real Estate';
      } else if (textSlot.dynamicSlot === 'PHONE') {
        if (showPhone) {
          textVal = customDetails.phone || brandKit?.phone || brandKit?.whatsapp || frameText || '+91 98765 43210';
        }
      } else if (textSlot.dynamicSlot === 'WHATSAPP') {
        textVal = customDetails.whatsapp || brandKit?.whatsapp || brandKit?.phone || frameText || '+91 98765 43210';
      } else if (textSlot.dynamicSlot === 'EMAIL') {
        textVal = customDetails.email || brandKit?.email || frameText || 'contact@business.com';
      } else if (textSlot.dynamicSlot === 'INSTAGRAM') {
        textVal = customDetails.instagramHandle || brandKit?.instagramHandle || frameText || '@yourbrand';
      } else if (textSlot.dynamicSlot === 'FACEBOOK') {
        textVal = customDetails.facebookHandle || brandKit?.facebookHandle || frameText || 'yourbrand';
      } else if (textSlot.dynamicSlot === 'LINKEDIN') {
        textVal = customDetails.linkedinHandle || brandKit?.linkedinHandle || frameText || 'in/yourcompany';
      } else if (textSlot.dynamicSlot === 'TWITTER') {
        textVal = customDetails.twitterHandle || brandKit?.twitterHandle || frameText || '@yourbrand';
      } else if (textSlot.dynamicSlot === 'YOUTUBE') {
        textVal = customDetails.youtubeHandle || brandKit?.youtubeHandle || frameText || '@yourchannel';
      } else if (textSlot.dynamicSlot === 'ADDRESS') {
        if (showAddress) {
          textVal = customDetails.address || (brandKit?.address ? `${brandKit.address}${brandKit.city ? `, ${brandKit.city}` : ''}` : null) || frameText || 'Business Park, MG Road, Mumbai';
        }
      } else if (textSlot.dynamicSlot === 'CITY') {
        textVal = customDetails.city || brandKit?.city || frameText || 'Mumbai';
      } else if (textSlot.dynamicSlot === 'STATE') {
        textVal = customDetails.state || brandKit?.state || frameText || 'Maharashtra';
      } else if (textSlot.dynamicSlot === 'COUNTRY') {
        textVal = customDetails.country || brandKit?.country || frameText || 'India';
      } else if (textSlot.dynamicSlot === 'TAGLINE') {
        textVal = customDetails.tagline || brandKit?.tagline || frameText || '';
      } else if (textSlot.dynamicSlot === 'WORKING_HOURS') {
        textVal = customDetails.workingHours || brandKit?.workingHours || frameText || '';
      } else if (customDetails[fieldKey] !== undefined) {
        textVal = customDetails[fieldKey];
      } else if (textSlot.text !== undefined) {
        textVal = textSlot.text;
      }

      if (textVal && textVal.trim() !== '') {
        ctx.save();
        const rotation = textSlot.rotation || 0;
        if (rotation) {
          const cx = textSlot.x + textSlot.width / 2;
          const cy = textSlot.y + (textSlot.height || 40) / 2;
          ctx.translate(cx, cy);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.translate(-cx, -cy);
        }

        const isShape = textSlot.type === 'BADGE' || textSlot.type === 'TAG' || textSlot.type === 'PILL' || textSlot.type === 'BANNER' || textSlot.type === 'BUTTON';
        const elH = textSlot.height || (isShape ? 40 : 30);

        if (isShape) {
          if (textSlot.fillColor && textSlot.fillColor !== 'transparent') {
            ctx.save();
            ctx.fillStyle = textSlot.fillColor;
            drawVectorShapePath(ctx, textSlot);
            ctx.fill();

            if (textSlot.borderWidth > 0) {
              ctx.strokeStyle = textSlot.borderColor || '#EAB308';
              ctx.lineWidth = textSlot.borderWidth;
              ctx.stroke();
            }
            ctx.restore();
          }
          drawVectorShapePath(ctx, textSlot);
          ctx.clip();
        }

        const fontFamily = textSlot.fontFamily || 'Space Grotesk';
        const fontWeight = textSlot.fontWeight || 'bold';
        const fontSize = textSlot.fontSize || (isShape ? Math.min(24, Math.max(12, Math.floor(elH * 0.28))) : 24);

        let textColor = textSlot.fontColor || textSlot.textColor || textSlot.color;
        if (!textColor) {
          if (textSlot.fillColor && textSlot.fillColor !== 'transparent') {
            textColor = textSlot.fillColor;
          } else {
            textColor = '#000000';
          }
        }

        ctx.fillStyle = textColor;
        const isSerif = fontFamily === 'Playfair Display' || fontFamily === 'Cinzel';
        const fallback = isSerif ? 'serif' : 'sans-serif';
        ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", ${fallback}`;

        if (isShape) {
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const tx = textSlot.x + textSlot.width / 2;
          const ty = textSlot.y + elH / 2;
          ctx.fillText(textVal, tx, ty, textSlot.width * 0.85);
        } else {
          ctx.textAlign = textSlot.textAlign || 'left';
          ctx.textBaseline = 'top';
          const tx =
            textSlot.textAlign === 'center'
              ? textSlot.x + textSlot.width / 2
              : textSlot.textAlign === 'right'
              ? textSlot.x + textSlot.width
              : textSlot.x;
          ctx.fillText(textVal, tx, textSlot.y);
        }

        ctx.restore();
        if (rotation) ctx.restore();
      }
    });
  }

  return targetCanvas.toDataURL('image/png', 0.95);
}
