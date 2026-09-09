import { useState, useEffect, useCallback, useRef } from 'react';
import { drawVectorShapePath } from './useFrameCanvasEngine';

const drawImageAspectCover = (ctx, img, dx, dy, dWidth, dHeight) => {
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

const drawImageAspectContain = (ctx, img, dx, dy, dWidth, dHeight) => {
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

/**
 * Enterprise HTML5 2D Canvas Compositor Hook
 * Merges Base Template Graphic + Admin Frame (PNG/JSON Vector) + User BrandKit & Custom Details
 */
export const useCanvasCompositor = (canvasRef, baseImageUrl, selectedFrame, brandKit, customDetails = {}) => {
  const [isRendering, setIsRendering] = useState(false);
  const [dataUrl, setDataUrl] = useState(null);

  // In-memory HTMLImageElement Cache to eliminate network requests during frame switching
  const imageCacheRef = useRef(new Map());
  const MAX_CACHE_SIZE = 50;

  const loadImageCached = useCallback((src) => {
    if (!src) return Promise.resolve(null);
    if (imageCacheRef.current.has(src)) {
      return Promise.resolve(imageCacheRef.current.get(src));
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        // Enforce MAX_CACHE_SIZE cap (50 items) to prevent browser memory leaks
        if (imageCacheRef.current.size >= MAX_CACHE_SIZE) {
          const firstKey = imageCacheRef.current.keys().next().value;
          if (firstKey) imageCacheRef.current.delete(firstKey);
        }
        imageCacheRef.current.set(src, img);
        resolve(img);
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }, []);

  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !baseImageUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsRendering(true);

    // Set canvas dimensions to standard high-res square (1080x1080)
    if (canvas.width !== 1080 || canvas.height !== 1080) {
      canvas.width = 1080;
      canvas.height = 1080;
    }

    try {
      // Effective brandkit data with live user overrides
      const activeBusinessName = customDetails.businessName !== undefined ? customDetails.businessName : (brandKit?.businessName || '');
      const activeTagline = customDetails.tagline !== undefined ? customDetails.tagline : (brandKit?.tagline || '');
      const activePhone = customDetails.phone !== undefined ? customDetails.phone : (brandKit?.phone || brandKit?.whatsapp || '');
      const activeAddress = customDetails.address !== undefined ? customDetails.address : (brandKit?.address ? `${brandKit.address}${brandKit.city ? `, ${brandKit.city}` : ''}` : '');
      const activeLogoUrl = customDetails.logoUrl || brandKit?.logoUrl;
      const activeAvatarUrl = customDetails.avatarUrl || brandKit?.avatarUrl;

      const showLogo = customDetails.showLogo !== undefined ? customDetails.showLogo : true;
      const showAvatar = customDetails.showAvatar !== undefined ? customDetails.showAvatar : true;
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

      const frameConfigElements = (parsedElements && parsedElements.length > 0)
        ? parsedElements
        : DEFAULT_FRAME_ELEMENTS;

      // Load cached image assets
      const [baseImg, logoImg, avatarImg, frameOverlayImg] = await Promise.all([
        loadImageCached(baseImageUrl),
        loadImageCached(showLogo ? activeLogoUrl : null),
        loadImageCached(showAvatar ? activeAvatarUrl : null),
        loadImageCached(selectedFrame?.overlayPngUrl),
      ]);

      // Clear previous canvas frame
      ctx.clearRect(0, 0, 1080, 1080);

      // 1. LAYER 1: Base Graphic Background (Aspect Cover for templates, Aspect Contain for custom uploaded images)
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

      // 2. LAYER 2: Transparent PNG Frame Overlay & Static Shapes Fallback
      if (frameOverlayImg) {
        ctx.drawImage(frameOverlayImg, 0, 0, 1080, 1080);
      } else {
        // Fallback: Render static vector shapes directly onto canvas if PNG overlay image is missing
        const staticShapes = frameConfigElements?.filter(
          (el) =>
            el.slotCategory === 'STATIC_SHAPE' ||
            el.dynamicSlot === 'NONE' ||
            (el.type !== 'TEXT' &&
              el.type !== 'IMAGE_SLOT' &&
              el.dynamicSlot !== 'AVATAR_CIRCLE' &&
              el.dynamicSlot !== 'LOGO_BOX' &&
              el.dynamicSlot !== 'CUSTOM_IMAGE')
        ) || [];

        staticShapes.forEach((shape) => {
          ctx.save();
          drawVectorShapePath(ctx, shape);
          if (shape.fillColor && shape.fillColor !== 'transparent') {
            ctx.fillStyle = shape.fillColor;
            ctx.fill();
          }
          if (shape.borderWidth > 0) {
            ctx.strokeStyle = shape.borderColor || '#EAB308';
            ctx.lineWidth = shape.borderWidth;
            ctx.stroke();
          }
          ctx.restore();
        });
      }

      // 3. LAYER 3: Render All Configured Image Slots (Logos, Avatars, Image Slots)
      const imageSlots = frameConfigElements?.filter(
        (el) =>
          el.slotCategory === 'IMAGE_SLOT' ||
          el.type === 'IMAGE_SLOT' ||
          el.dynamicSlot === 'LOGO_BOX' ||
          el.dynamicSlot === 'AVATAR_CIRCLE'
      ) || [];

      let hasRenderedAvatarSlot = false;

      if (imageSlots.length > 0) {
        for (const slot of imageSlots) {
          const slotKey = slot.id || slot.fieldKey || slot.dynamicSlot;
          const slotUrl =
            customDetails[slotKey] ||
            (slot.dynamicSlot === 'AVATAR_CIRCLE'
              ? (showAvatar ? activeAvatarUrl : null)
              : slot.dynamicSlot === 'LOGO_BOX'
              ? (showLogo ? activeLogoUrl : null)
              : customDetails[slot.fieldKey]);

          const slotImg = slotUrl ? await loadImageCached(slotUrl) : null;

          if (slotImg) {
            hasRenderedAvatarSlot = true;
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
            hasRenderedAvatarSlot = true;
            // Render clean default avatar placeholder inside avatar slot when user has not uploaded photo yet
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
          } else if (slot.dynamicSlot === 'LOGO_BOX') {
            // Render clean default logo placeholder box when user has not uploaded logo yet
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
            ctx.fillText('🖼️ IMAGE SLOT', cx, cy);
            ctx.restore();
          }
        }
      } else if (!selectedFrame) {
        // Fallback Default Logo & Avatar rendering ONLY when no frame is selected
        if (logoImg && showLogo) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.roundRect(35 - 8, 35 - 8, 110 + 16, 110 + 16, 12);
          ctx.fill();
          ctx.strokeStyle = '#E2E8F0';
          ctx.lineWidth = 2;
          ctx.stroke();
          drawImageAspectCover(ctx, logoImg, 35, 35, 110, 110);
        }

        if (showAvatar) {
          const avatarSize = 120;
          const radius = avatarSize / 2;
          const ax = radius + 35;
          const ay = 1080 - radius - 35;

          if (avatarImg) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(ax, ay, radius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            drawImageAspectCover(ctx, avatarImg, ax - radius, ay - radius, avatarSize, avatarSize);
            ctx.restore();
          } else {
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.arc(ax, ay, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#94A3B8';
            ctx.beginPath();
            ctx.arc(ax, ay - radius * 0.2, radius * 0.35, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ax, ay + radius * 0.7, radius * 0.6, Math.PI, 0);
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(ax, ay, radius, 0, Math.PI * 2, true);
          ctx.lineWidth = 5;
          ctx.strokeStyle = '#EAB308';
          ctx.stroke();
        }
      }

      // 4. LAYER 4: Dynamic Text Details & Elements Overlay
      const textElementsInConfig = frameConfigElements?.filter(
        (el) =>
          el.type === 'TEXT' ||
          el.slotCategory === 'TEXT_INPUT' ||
          (el.dynamicSlot &&
            el.dynamicSlot !== 'NONE' &&
            el.dynamicSlot !== 'AVATAR_CIRCLE' &&
            el.dynamicSlot !== 'LOGO_BOX' &&
            el.dynamicSlot !== 'CUSTOM_IMAGE')
      ) || [];

      if (textElementsInConfig.length > 0) {
        textElementsInConfig.forEach((textSlot) => {
          let textVal = '';
          const fieldKey = textSlot.fieldKey || textSlot.dynamicSlot || textSlot.id;
          const icon = textSlot.iconPrefix ? `${textSlot.iconPrefix} ` : '';

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
          } else if (textSlot.dynamicSlot === 'WEBSITE') {
            textVal = customDetails.websiteUrl || brandKit?.websiteUrl || frameText || 'www.yourbusiness.com';
          } else if (textSlot.dynamicSlot === 'TAGLINE') {
            textVal = customDetails.tagline || brandKit?.tagline || frameText || 'Luxury Homes & Commercial Spaces';
          } else {
            const customVal = (customDetails[fieldKey] && customDetails[fieldKey] !== '') ? customDetails[fieldKey] : ((customDetails[textSlot.customLabel] && customDetails[textSlot.customLabel] !== '') ? customDetails[textSlot.customLabel] : '');
            textVal = customVal || frameText || textSlot.label || '';
          }

          if (textVal) {
            if (icon && !textVal.startsWith(icon.trim())) {
              textVal = `${icon}${textVal}`;
            }

            const rotation = textSlot.rotation || 0;
            const isShape = textSlot.type !== 'TEXT';
            const elH = isShape ? textSlot.height || textSlot.width : (textSlot.fontSize || 24) + 6;

            if (rotation) {
              const cx = textSlot.x + textSlot.width / 2;
              const cy = textSlot.y + elH / 2;
              ctx.save();
              ctx.translate(cx, cy);
              ctx.rotate((rotation * Math.PI) / 180);
              ctx.translate(-cx, -cy);
            }

            ctx.save();
            if (isShape) {
              drawVectorShapePath(ctx, textSlot);
              ctx.clip();
            }

            const fontFamily = textSlot.fontFamily || 'Space Grotesk';
            const fontWeight = textSlot.fontWeight || 'bold';
            const fontSize = textSlot.fontSize || (isShape ? Math.min(24, Math.max(12, Math.floor(elH * 0.28))) : 24);
            ctx.fillStyle = textSlot.fontColor || textSlot.textColor || (isShape ? '#FFFFFF' : textSlot.fillColor || '#FFFFFF');
            ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;

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
      } else if (!selectedFrame) {
        // Fallback default details rendering ONLY when no frame is selected
        const defaultBizName = activeBusinessName || 'Sunrise Real Estate';
        const defaultPhone = showPhone ? (activePhone || '+91 98765 43210') : '';
        const defaultAddress = showAddress ? (activeAddress || 'MG Road, Mumbai') : '';
        const defaultTagline = activeTagline || 'Luxury Homes & Commercial Spaces';

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(0, 950, 1080, 130);
        ctx.fillStyle = '#EAB308';
        ctx.fillRect(0, 946, 1080, 4);

        const textX = (avatarImg || showAvatar || hasRenderedAvatarSlot) ? 175 : 40;
        const textY = 985;

        if (defaultBizName) {
          ctx.textAlign = 'left';
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 24px "Space Grotesk", sans-serif';
          ctx.fillText(defaultBizName, textX, textY);
        }

        if (defaultTagline) {
          ctx.textAlign = 'left';
          ctx.fillStyle = '#94A3B8';
          ctx.font = '14px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(defaultTagline, textX, textY + 28);
        }

        if (defaultPhone) {
          ctx.textAlign = 'right';
          ctx.fillStyle = '#EAB308';
          ctx.font = 'bold 18px "Space Grotesk", sans-serif';
          ctx.fillText(`📞 ${defaultPhone}`, 1040, textY);
        }

        if (defaultAddress) {
          ctx.textAlign = 'right';
          ctx.fillStyle = '#CBD5E1';
          ctx.font = '14px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(`📍 ${defaultAddress}`, 1040, textY + 28);
        }
      }

      // Update dataURL asynchronously for export
      const url = canvas.toDataURL('image/png', 0.95);
      setDataUrl(url);
    } catch (err) {
      console.error('Canvas compositing error:', err);
    } finally {
      setIsRendering(false);
    }
  }, [canvasRef, baseImageUrl, selectedFrame, brandKit, customDetails, loadImageCached]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  return { isRendering, dataUrl, reRender: renderCanvas };
};
