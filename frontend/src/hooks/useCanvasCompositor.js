import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Enterprise HTML5 2D Canvas Compositor Hook
 * Merges Base Template Graphic + Admin Frame (PNG/JSON Vector) + User BrandKit & Custom Details
 */
export const useCanvasCompositor = (canvasRef, baseImageUrl, selectedFrame, brandKit, customDetails = {}) => {
  const [isRendering, setIsRendering] = useState(false);
  const [dataUrl, setDataUrl] = useState(null);

  // In-memory HTMLImageElement Cache to eliminate network requests during frame switching
  const imageCacheRef = useRef(new Map());

  const loadImageCached = useCallback((src) => {
    if (!src) return Promise.resolve(null);
    if (imageCacheRef.current.has(src)) {
      return Promise.resolve(imageCacheRef.current.get(src));
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
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

      // Check if frame contains JSON Config Schema
      const frameConfigElements = selectedFrame?.configJson?.elements || null;

      // Load cached image assets
      const [baseImg, logoImg, avatarImg, frameOverlayImg] = await Promise.all([
        loadImageCached(baseImageUrl),
        loadImageCached(showLogo ? activeLogoUrl : null),
        loadImageCached(showAvatar ? activeAvatarUrl : null),
        loadImageCached(selectedFrame?.overlayPngUrl),
      ]);

      // Clear previous canvas frame
      ctx.clearRect(0, 0, 1080, 1080);

      // 1. LAYER 1: Base Graphic Background (1080x1080)
      if (baseImg) {
        ctx.drawImage(baseImg, 0, 0, 1080, 1080);
      } else {
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, 1080, 1080);
      }

      // 2. LAYER 2: Transparent PNG Frame Overlay
      if (frameOverlayImg) {
        ctx.drawImage(frameOverlayImg, 0, 0, 1080, 1080);
      }

      // 3. LAYER 3: User Logo Rendering
      if (logoImg && showLogo) {
        // If Admin configured a specific LOGO_BOX slot in configJson, use its coordinates
        const logoSlot = frameConfigElements?.find((el) => el.dynamicSlot === 'LOGO_BOX');
        const lx = logoSlot ? logoSlot.x : 35;
        const ly = logoSlot ? logoSlot.y : 35;
        const logoSize = logoSlot ? logoSlot.width : 110;

        // Draw White Box background for contrast
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(lx - 8, ly - 8, logoSize + 16, logoSize + 16, 12);
        ctx.fill();
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
      }

      // 4. LAYER 4: Owner Profile Avatar Circle
      const avatarSlot = frameConfigElements?.find((el) => el.dynamicSlot === 'AVATAR_CIRCLE');
      const avatarSize = avatarSlot ? avatarSlot.width : 120;
      const radius = avatarSize / 2;
      const ax = avatarSlot ? avatarSlot.x + radius : radius + 35;
      const ay = avatarSlot ? avatarSlot.y + radius : 1080 - radius - 35;

      if (avatarImg && showAvatar) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(ax, ay, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, ax - radius, ay - radius, avatarSize, avatarSize);
        ctx.restore();

        // Avatar Outer Ring Border
        ctx.beginPath();
        ctx.arc(ax, ay, radius, 0, Math.PI * 2, true);
        ctx.lineWidth = 5;
        ctx.strokeStyle = avatarSlot?.borderColor || '#EAB308';
        ctx.stroke();
      }

      // 5. LAYER 5: Dynamic Text Details Overlay
      if (activeBusinessName || activePhone || activeAddress) {
        const hasAvatar = avatarImg && showAvatar;

        // If no frame PNG loaded, render a sleek semi-transparent dark footer bar
        if (!selectedFrame) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
          ctx.fillRect(0, 950, 1080, 130);
          ctx.fillStyle = '#EAB308';
          ctx.fillRect(0, 946, 1080, 4);
        }

        // If Admin configured vector text elements in configJson, render each dynamically
        if (frameConfigElements && frameConfigElements.some((el) => el.type === 'TEXT')) {
          frameConfigElements
            .filter((el) => el.type === 'TEXT')
            .forEach((textSlot) => {
              let textVal = '';
              const fieldKey = textSlot.fieldKey || textSlot.dynamicSlot || textSlot.id;
              const icon = textSlot.iconPrefix ? `${textSlot.iconPrefix} ` : '';

              if (textSlot.dynamicSlot === 'BUSINESS_NAME') {
                textVal = customDetails.businessName !== undefined && customDetails.businessName !== '' ? customDetails.businessName : activeBusinessName;
              } else if (textSlot.dynamicSlot === 'PHONE' && showPhone) {
                textVal = customDetails.phone ? `📞 ${customDetails.phone}` : (activePhone ? `📞 ${activePhone}` : '');
              } else if (textSlot.dynamicSlot === 'ADDRESS' && showAddress) {
                textVal = customDetails.address ? `📍 ${customDetails.address}` : (activeAddress ? `📍 ${activeAddress}` : '');
              } else if (textSlot.dynamicSlot === 'TAGLINE') {
                textVal = customDetails.tagline !== undefined && customDetails.tagline !== '' ? customDetails.tagline : activeTagline;
              } else {
                // Unlimited Custom Field resolution from customDetails
                const customVal = customDetails[fieldKey] !== undefined ? customDetails[fieldKey] : (customDetails[textSlot.customLabel] !== undefined ? customDetails[textSlot.customLabel] : (textSlot.text || ''));
                if (customVal) {
                  textVal = `${icon}${customVal}`;
                }
              }

              if (textVal) {
                const fontFamily = textSlot.fontFamily || 'Space Grotesk';
                const fontWeight = textSlot.fontWeight || 'bold';
                const fontSize = textSlot.fontSize || 24;
                ctx.fillStyle = textSlot.fontColor || textSlot.fillColor || '#FFFFFF';
                ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
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
            });
        } else {
          // Default Position Fallback
          const textX = hasAvatar ? 175 : 40;
          const textY = 1005;

          if (activeBusinessName) {
            ctx.textAlign = 'left';
            ctx.fillStyle = selectedFrame ? '#0B0F17' : '#FFFFFF';
            ctx.font = 'bold 24px "Space Grotesk", sans-serif';
            ctx.fillText(activeBusinessName, textX, textY);
          }

          if (activeTagline) {
            ctx.textAlign = 'left';
            ctx.fillStyle = selectedFrame ? '#475569' : '#94A3B8';
            ctx.font = '14px "Plus Jakarta Sans", sans-serif';
            ctx.fillText(activeTagline, textX, textY + 24);
          }

          ctx.textAlign = 'right';

          if (showPhone && activePhone) {
            ctx.fillStyle = selectedFrame ? '#0B0F17' : '#EAB308';
            ctx.font = 'bold 18px "Space Grotesk", sans-serif';
            ctx.fillText(`📞 ${activePhone}`, 1040, textY);
          }

          if (showAddress && activeAddress) {
            ctx.fillStyle = selectedFrame ? '#475569' : '#CBD5E1';
            ctx.font = '14px "Plus Jakarta Sans", sans-serif';
            ctx.fillText(`📍 ${activeAddress}`, 1040, textY + 24);
          }
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
