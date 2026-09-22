import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Reusable helper to draw vector shape paths onto 2D Canvas context.
 * Supports RECTANGLE, CAPSULE, CIRCLE, STAR, DIAMOND, TRIANGLE, HEXAGON, SHIELD, RIBBON, LINE, and IMAGE_SLOT.
 */
export const drawVectorShapePath = (ctx, el) => {
  const { x, y, width: w, height: h, type, borderRadius } = el;
  ctx.beginPath();

  if (type === 'RECTANGLE' || type === 'CAPSULE') {
    const r = type === 'CAPSULE' ? h / 2 : borderRadius || 0;
    ctx.roundRect(x, y, w, h, r);
  } else if (type === 'CIRCLE') {
    const radius = w / 2;
    ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
  } else if (type === 'STAR') {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const outerR = Math.min(w, h) / 2;
    const innerR = outerR * 0.4;
    const spikes = 5;
    let rot = (Math.PI / 2) * 3;
    let step = Math.PI / spikes;

    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      let px = cx + Math.cos(rot) * outerR;
      let py = cy + Math.sin(rot) * outerR;
      ctx.lineTo(px, py);
      rot += step;

      px = cx + Math.cos(rot) * innerR;
      py = cy + Math.sin(rot) * innerR;
      ctx.lineTo(px, py);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
  } else if (type === 'DIAMOND') {
    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.moveTo(cx, y);
    ctx.lineTo(x + w, cy);
    ctx.lineTo(cx, y + h);
    ctx.lineTo(x, cy);
    ctx.closePath();
  } else if (type === 'TRIANGLE') {
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
  } else if (type === 'HEXAGON') {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.min(w, h) / 2;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else if (type === 'SHIELD') {
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h * 0.25);
    ctx.quadraticCurveTo(x + w, y + h * 0.75, x + w / 2, y + h);
    ctx.quadraticCurveTo(x, y + h * 0.75, x, y + h * 0.25);
    ctx.closePath();
  } else if (type === 'RIBBON') {
    ctx.moveTo(x, y);
    ctx.lineTo(x + w - 20, y);
    ctx.lineTo(x + w, y + h / 2);
    ctx.lineTo(x + w - 20, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
  } else if (type === 'LINE') {
    ctx.moveTo(x, y + h / 2);
    ctx.lineTo(x + w, y + h / 2);
  } else if (type === 'IMAGE_SLOT') {
    ctx.roundRect(x, y, w, h, borderRadius || 8);
  } else if (type === 'FRAME_BORDER') {
    ctx.roundRect(x, y, w, h, borderRadius || 16);
  }
};

const defaultElements = [
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
    fillColor: '#94A3B8',
    fontSize: 15,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: 'normal',
    fontColor: '#CBD5E1',
    textAlign: 'right',
    dynamicSlot: 'ADDRESS',
    text: 'Business Park, MG Road, Mumbai',
  },
];

/**
 * Standard typography font families supported by BrandFlow Studio.
 */
export const STUDIO_FONTS = [
  'Space Grotesk',
  'Plus Jakarta Sans',
  'Outfit',
  'Inter',
  'Playfair Display',
  'Montserrat',
  'Roboto',
  'Cinzel',
];

/**
 * Helper to get a font family string with appropriate generic fallback (serif vs sans-serif).
 */
export const getFontFamilyWithFallback = (fontFamily = 'Space Grotesk') => {
  const isSerif = fontFamily === 'Playfair Display' || fontFamily === 'Cinzel';
  const fallback = isSerif ? 'serif' : 'sans-serif';
  return `"${fontFamily}", ${fallback}`;
};

/**
 * Accurately measures text dimensions using an offscreen canvas context.
 */
let _measureCtx = null;
export const measureCanvasText = (text, fontSize = 28, fontFamily = 'Space Grotesk', fontWeight = 'bold') => {
  if (typeof document === 'undefined') {
    return { width: Math.max(40, (text || '').length * fontSize * 0.6), height: Math.ceil(fontSize * 1.25) };
  }
  try {
    if (!_measureCtx) {
      const c = document.createElement('canvas');
      _measureCtx = c.getContext('2d');
    }
    const isSerif = fontFamily === 'Playfair Display' || fontFamily === 'Cinzel';
    const fallback = isSerif ? 'serif' : 'sans-serif';
    _measureCtx.font = `${fontWeight} ${fontSize}px "${fontFamily}", ${fallback}`;
    const metrics = _measureCtx.measureText(text || 'Sample Text');
    const width = Math.ceil(metrics.width);
    const height = Math.ceil(fontSize * 1.25);
    return { width, height };
  } catch {
    return { width: Math.max(40, (text || '').length * fontSize * 0.6), height: Math.ceil(fontSize * 1.25) };
  }
};

/**
 * Custom hook encapsulating the Canva Vector Stage Engine.
 * Manages layer element array, selection, mouse drag/resize interactions, and 2D canvas rendering loops.
 */
export const useFrameCanvasEngine = (activeTab = 'canva') => {
  const canvasRef = useRef(null);
  const [stageBgColor, setStageBgColor] = useState('WHITE');
  const [showSelectionBox, setShowSelectionBox] = useState(true);
  const [elements, setElements] = useState(defaultElements);
  const [selectedId, setSelectedId] = useState('el-footer-bg');
  const [fontsLoadedVersion, setFontsLoadedVersion] = useState(0);

  // Preload all studio typography fonts into browser memory so canvas renders them immediately
  useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts?.load) {
      Promise.all(
        STUDIO_FONTS.flatMap((font) => [
          document.fonts.load(`bold 28px "${font}"`),
          document.fonts.load(`normal 28px "${font}"`),
          document.fonts.load(`600 28px "${font}"`),
          document.fonts.load(`900 28px "${font}"`),
        ])
      )
        .then(() => {
          setFontsLoadedVersion((v) => v + 1);
        })
        .catch(() => {});
    }
  }, []);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);

  const dragStartRef = useRef({
    x: 0,
    y: 0,
    initialElX: 0,
    initialElY: 0,
    initialWidth: 0,
    initialHeight: 0,
  });

  const selectedElement =
    elements.find((el) => el.id === selectedId) || elements[0];

  // Core rendering logic that can output to visible stage or pristine clean offscreen canvas
  const renderCanvaStageToContext = useCallback(
    (ctx, drawSelection = true, background = stageBgColor) => {
      ctx.clearRect(0, 0, 1080, 1080);

      if (background === 'WHITE') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 1080, 1080);
        if (drawSelection) {
          ctx.strokeStyle = '#F1F5F9';
          ctx.lineWidth = 1;
          for (let g = 108; g < 1080; g += 108) {
            ctx.beginPath();
            ctx.moveTo(g, 0);
            ctx.lineTo(g, 1080);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, g);
            ctx.lineTo(1080, g);
            ctx.stroke();
          }
        }
      } else if (background === 'DARK') {
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, 1080, 1080);
      }

      elements.forEach((el) => {
        ctx.save();
        const elH = el.type === 'TEXT' ? (el.fontSize || 24) + 6 : el.height;
        const rotation = el.rotation || 0;
        if (rotation) {
          const cx = el.x + el.width / 2;
          const cy = el.y + elH / 2;
          ctx.translate(cx, cy);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.translate(-cx, -cy);
        }

        if (el.type === 'TEXT') {
          const fontFamily = el.fontFamily || 'Space Grotesk';
          const fontWeight = el.fontWeight || 'bold';
          const fontSize = el.fontSize || 28;
          ctx.fillStyle = el.fontColor || el.textColor || el.fillColor || '#FFFFFF';
          const isSerif = fontFamily === 'Playfair Display' || fontFamily === 'Cinzel';
          const fallback = isSerif ? 'serif' : 'sans-serif';
          ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", ${fallback}`;

          const metrics = ctx.measureText(el.text || 'Sample Text');
          const textActualW = Math.ceil(metrics.width);
          const effectiveW = Math.max(el.width || 0, textActualW);

          ctx.textAlign = el.textAlign || 'left';
          ctx.textBaseline = 'top';
          const tx =
            el.textAlign === 'center'
              ? el.x + effectiveW / 2
              : el.textAlign === 'right'
                ? el.x + effectiveW
                : el.x;
          ctx.fillText(el.text || 'Sample Text', tx, el.y);
        } else {
          // Draw Vector Shape (RECTANGLE, CAPSULE, CIRCLE, STAR, DIAMOND, TRIANGLE, HEXAGON, SHIELD, RIBBON, LINE, IMAGE_SLOT, FRAME_BORDER)
          drawVectorShapePath(ctx, el);

          if (el.type !== 'LINE' && el.type !== 'FRAME_BORDER' && el.fillColor && el.fillColor !== 'transparent') {
            ctx.fillStyle = el.fillColor;
            ctx.fill();
          }

          if (el.borderWidth > 0) {
            ctx.strokeStyle = el.borderColor || '#FFFFFF';
            ctx.lineWidth = el.borderWidth;

            if (el.borderStyle === 'DASHED') {
              ctx.setLineDash([el.borderWidth * 3, el.borderWidth * 2]);
            } else if (el.borderStyle === 'DOTTED') {
              ctx.setLineDash([el.borderWidth, el.borderWidth]);
            } else {
              ctx.setLineDash([]);
            }

            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Draw Dynamic Slot Labels, Icons, & Inside-Shape Text
          if (
            el.slotCategory === 'IMAGE_SLOT' ||
            el.type === 'IMAGE_SLOT' ||
            el.dynamicSlot === 'LOGO_BOX' ||
            el.dynamicSlot === 'AVATAR_CIRCLE'
          ) {
            ctx.fillStyle =
              el.fillColor === '#FFFFFF' || !el.fillColor ? '#0B0F17' : '#FFFFFF';
            ctx.font = 'bold 16px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const label = el.dynamicSlot === 'AVATAR_CIRCLE' ? '👤 PHOTO' : '🖼️ IMAGE SLOT';
            ctx.fillText(label, el.x + el.width / 2, el.y + (el.height || el.width) / 2);
          } else if (el.slotCategory === 'TEXT_INPUT' || el.text) {
            ctx.save();
            // Clip text path to shape bounds so text never spills outside the circle or shape
            drawVectorShapePath(ctx, el);
            ctx.clip();

            const fontFamily = el.fontFamily || 'Space Grotesk';
            const fontWeight = el.fontWeight || 'bold';
            const fontSize = el.fontSize || Math.min(24, Math.max(12, Math.floor((el.height || el.width) * 0.28)));

            // High contrast contrast color if font color is default
            ctx.fillStyle = el.fontColor || el.textColor || '#FFFFFF';
            const isSerif = fontFamily === 'Playfair Display' || fontFamily === 'Cinzel';
            const fallback = isSerif ? 'serif' : 'sans-serif';
            ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", ${fallback}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const textVal = el.text || el.customLabel || el.name || 'Sample Text';
            const cx = el.x + el.width / 2;
            const cy = el.y + (el.height || el.width) / 2;

            // Render text centered inside shape with max width limit
            ctx.fillText(textVal, cx, cy, el.width * 0.82);
            ctx.restore();
          }
        }

        // Draw Selection Bounding Box & Resizing Handles ONLY if drawSelection is true and el.id === selectedId
        if (drawSelection && el.id === selectedId) {
          let boxX = el.x;
          let boxY = el.y;
          let boxW = el.width;
          let boxH = el.height;

          if (el.type === 'TEXT') {
            const fontFamily = el.fontFamily || 'Space Grotesk';
            const fontWeight = el.fontWeight || 'bold';
            const fontSize = el.fontSize || 28;
            const isSerif = fontFamily === 'Playfair Display' || fontFamily === 'Cinzel';
            const fallback = isSerif ? 'serif' : 'sans-serif';
            ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", ${fallback}`;
            const metrics = ctx.measureText(el.text || 'Sample Text');
            const actualTextW = Math.ceil(metrics.width);
            boxW = Math.max(el.width, actualTextW);
            boxH = Math.max(el.height, Math.ceil(fontSize * 1.25));

            if (el.textAlign === 'center') {
              const textCenter = el.x + (Math.max(el.width, actualTextW) / 2);
              boxX = textCenter - boxW / 2;
            } else if (el.textAlign === 'right') {
              boxX = el.x + el.width - boxW;
            }
          }

          const pad = 12;

          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(boxX - pad, boxY - pad, boxW + pad * 2, boxH + pad * 2);
          ctx.setLineDash([]);

          const handleSize = 14;
          const halfH = handleSize / 2;
          const corners = [
            { x: boxX - pad - halfH, y: boxY - pad - halfH },
            { x: boxX + boxW + pad - halfH, y: boxY - pad - halfH },
            { x: boxX - pad - halfH, y: boxY + boxH + pad - halfH },
            { x: boxX + boxW + pad - halfH, y: boxY + boxH + pad - halfH },
          ];

          corners.forEach((c) => {
            ctx.fillStyle = '#38BDF8';
            ctx.fillRect(c.x, c.y, handleSize, handleSize);
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(c.x, c.y, handleSize, handleSize);
          });
        }

        ctx.restore();
      });
    },
    [elements, selectedId, stageBgColor, fontsLoadedVersion]
  );

  // Render on interactive visible stage canvas
  const renderCanvaStage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1080;
    renderCanvaStageToContext(ctx, showSelectionBox, stageBgColor);
  }, [renderCanvaStageToContext, showSelectionBox, stageBgColor]);

  /**
   * Generates a 100% clean 1080x1080 PNG data URL without ANY blue edit outlines or handles.
   * Defaults to TRANSPARENT background so frames never bake an opaque white box.
   */
  const exportCleanPreviewDataUrl = useCallback((background = 'TRANSPARENT') => {
    if (typeof document === 'undefined') return '';
    const offscreen = document.createElement('canvas');
    offscreen.width = 1080;
    offscreen.height = 1080;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return '';
    renderCanvaStageToContext(ctx, false, background);
    return offscreen.toDataURL('image/png');
  }, [renderCanvaStageToContext]);

  /**
   * Centers the selected element on the 1080x1080 canvas stage.
   * mode: 'BOTH' (horizontal & vertical - dead center), 'HORIZONTAL' (X only), 'VERTICAL' (Y only)
   * Ensures element is perfectly aligned from top, bottom, left, and right.
   */
  const centerSelectedElement = useCallback((mode = 'BOTH') => {
    if (!selectedId) return;

    setElements((prev) =>
      prev.map((el) => {
        if (el.id !== selectedId) return el;

        let elW = el.width;
        let elH = el.height;

        if (el.type === 'TEXT') {
          const currentText = el.text || el.customLabel || el.name || 'Sample Text';
          const dims = measureCanvasText(
            currentText,
            el.fontSize || 28,
            el.fontFamily || 'Space Grotesk',
            el.fontWeight || 'bold',
          );
          elW = Math.max(el.width, dims.width);
          elH = Math.max(el.height, dims.height);
        }

        const updated = { ...el };
        if (mode === 'BOTH' || mode === 'HORIZONTAL') {
          // Upar, niche, right, left: X Center on 1080 canvas
          updated.x = Math.round((1080 - elW) / 2);
        }
        if (mode === 'BOTH' || mode === 'VERTICAL') {
          // Y Center on 1080 canvas
          updated.y = Math.round((1080 - elH) / 2);
        }
        if (el.type === 'TEXT') {
          updated.textAlign = 'center';
        }

        return updated;
      })
    );
  }, [selectedId]);

  useEffect(() => {
    if (activeTab === 'canva') {
      renderCanvaStage();
    }
  }, [activeTab, renderCanvaStage]);

  // Canvas Mouse Interaction Handlers
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scale = 1080 / rect.width;
    const clickX = (e.clientX - rect.left) * scale;
    const clickY = (e.clientY - rect.top) * scale;

    if (selectedElement) {
      let selX = selectedElement.x;
      let selY = selectedElement.y;
      let selW = selectedElement.width;
      let selH = selectedElement.height;

      if (selectedElement.type === 'TEXT') {
        const dims = measureCanvasText(
          selectedElement.text || 'Sample Text',
          selectedElement.fontSize,
          selectedElement.fontFamily,
          selectedElement.fontWeight,
        );
        selW = Math.max(selectedElement.width, dims.width);
        selH = Math.max(selectedElement.height, dims.height);
        if (selectedElement.textAlign === 'center') {
          selX = selectedElement.x + (Math.max(selectedElement.width, dims.width) / 2) - selW / 2;
        } else if (selectedElement.textAlign === 'right') {
          selX = selectedElement.x + selectedElement.width - selW;
        }
      }

      const hSize = 24;
      const pad = 12;

      const corners = [
        { handle: 'TL', x: selX - pad, y: selY - pad },
        { handle: 'TR', x: selX + selW + pad, y: selY - pad },
        { handle: 'BL', x: selX - pad, y: selY + selH + pad },
        { handle: 'BR', x: selX + selW + pad, y: selY + selH + pad },
      ];

      const hitCorner = corners.find(
        (c) => Math.abs(clickX - c.x) <= hSize && Math.abs(clickY - c.y) <= hSize,
      );

      if (hitCorner) {
        setIsResizing(true);
        setResizeHandle(hitCorner.handle);
        dragStartRef.current = {
          x: clickX,
          y: clickY,
          initialElX: selectedElement.x,
          initialElY: selectedElement.y,
          initialWidth: selW,
          initialHeight: selH,
          initialFontSize: selectedElement.fontSize || 28,
        };
        return;
      }
    }

    const clickedEl = [...elements].reverse().find((el) => {
      let elX = el.x;
      let elW = el.width;
      let elH = el.height;

      if (el.type === 'TEXT') {
        const dims = measureCanvasText(el.text || 'Sample Text', el.fontSize, el.fontFamily, el.fontWeight);
        elW = Math.max(el.width, dims.width);
        elH = Math.max(el.height, dims.height);
        if (el.textAlign === 'center') {
          elX = el.x + (Math.max(el.width, dims.width) / 2) - elW / 2;
        } else if (el.textAlign === 'right') {
          elX = el.x + el.width - elW;
        }
      }

      return (
        clickX >= elX - 16 &&
        clickX <= elX + elW + 16 &&
        clickY >= el.y - 16 &&
        clickY <= el.y + elH + 16
      );
    });

    if (clickedEl) {
      setSelectedId(clickedEl.id);
      setIsDragging(true);
      dragStartRef.current = {
        x: clickX,
        y: clickY,
        initialElX: clickedEl.x,
        initialElY: clickedEl.y,
        initialWidth: clickedEl.width,
        initialHeight: clickedEl.height,
      };
    }
  };

  const handleCanvasMouseMove = (e) => {
    if ((!isDragging && !isResizing) || !selectedElement) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scale = 1080 / rect.width;
    const currentX = (e.clientX - rect.left) * scale;
    const currentY = (e.clientY - rect.top) * scale;

    const dx = currentX - dragStartRef.current.x;
    const dy = currentY - dragStartRef.current.y;

    if (isResizing) {
      let newW = dragStartRef.current.initialWidth;
      let newH = dragStartRef.current.initialHeight;
      let newX = dragStartRef.current.initialElX;
      let newY = dragStartRef.current.initialElY;

      if (resizeHandle === 'BR') {
        newW = Math.max(30, Math.round(dragStartRef.current.initialWidth + dx));
        newH = Math.max(30, Math.round(dragStartRef.current.initialHeight + dy));
      } else if (resizeHandle === 'TR') {
        newW = Math.max(30, Math.round(dragStartRef.current.initialWidth + dx));
        newH = Math.max(30, Math.round(dragStartRef.current.initialHeight - dy));
        newY = Math.round(dragStartRef.current.initialElY + dy);
      } else if (resizeHandle === 'BL') {
        newW = Math.max(30, Math.round(dragStartRef.current.initialWidth - dx));
        newH = Math.max(30, Math.round(dragStartRef.current.initialHeight + dy));
        newX = Math.round(dragStartRef.current.initialElX + dx);
      } else if (resizeHandle === 'TL') {
        newW = Math.max(30, Math.round(dragStartRef.current.initialWidth - dx));
        newH = Math.max(30, Math.round(dragStartRef.current.initialHeight - dy));
        newX = Math.round(dragStartRef.current.initialElX + dx);
        newY = Math.round(dragStartRef.current.initialElY + dy);
      }

      if (selectedElement.type === 'CIRCLE') {
        newH = newW;
      }

      if (selectedElement.type === 'TEXT') {
        // Dragging corner handle scales the text size smoothly
        const initialSize = dragStartRef.current.initialFontSize || selectedElement.fontSize || 28;
        const initialW = dragStartRef.current.initialWidth || 100;
        const scale = Math.max(0.2, newW / initialW);
        const scaledSize = Math.max(12, Math.min(120, Math.round(initialSize * scale)));
        updateSelectedElement({
          fontSize: scaledSize,
          ...(selectedElement.textAlign !== 'center' ? { x: newX, y: newY } : { y: newY }),
        });
        return;
      }

      updateSelectedElement({
        x: newX,
        y: newY,
        width: newW,
        height: newH,
        borderRadius:
          selectedElement.type === 'CIRCLE'
            ? Math.round(newW / 2)
            : selectedElement.borderRadius,
      });
    } else if (isDragging) {
      const newX = Math.round(dragStartRef.current.initialElX + dx);
      const newY = Math.round(dragStartRef.current.initialElY + dy);
      updateSelectedElement({ x: newX, y: newY });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Element Layer CRUD operations
  const handleAddElement = (type, slot = 'NONE') => {
    const newId = `el-${Date.now()}`;
    let newEl = {
      id: newId,
      name: `New ${type.toLowerCase()}`,
      type,
      x: 100,
      y: 900,
      width: 300,
      height: 100,
      fillColor: '#0B0F17',
      borderColor: '#EAB308',
      borderWidth: 2,
      borderRadius: 12,
      dynamicSlot: slot,
    };

    if (type === 'CIRCLE') {
      newEl.width = 120;
      newEl.height = 120;
      newEl.borderRadius = 60;
    } else if (type === 'STAR') {
      newEl.width = 100;
      newEl.height = 100;
      newEl.fillColor = '#EAB308';
      newEl.borderColor = '#FFFFFF';
    } else if (type === 'DIAMOND') {
      newEl.width = 110;
      newEl.height = 110;
      newEl.fillColor = '#38BDF8';
    } else if (type === 'TRIANGLE') {
      newEl.width = 120;
      newEl.height = 100;
      newEl.fillColor = '#F43F5E';
    } else if (type === 'HEXAGON') {
      newEl.width = 120;
      newEl.height = 120;
      newEl.fillColor = '#8B5CF6';
    } else if (type === 'SHIELD') {
      newEl.width = 100;
      newEl.height = 130;
      newEl.fillColor = '#10B981';
    } else if (type === 'RIBBON') {
      newEl.width = 300;
      newEl.height = 70;
      newEl.fillColor = '#D97706';
    } else if (type === 'LINE') {
      newEl.width = 400;
      newEl.height = 10;
      newEl.borderWidth = 4;
      newEl.borderColor = '#EAB308';
    } else if (type === 'IMAGE_SLOT') {
      newEl.width = 140;
      newEl.height = 140;
      newEl.fillColor = '#1E293B';
      newEl.borderColor = '#94A3B8';
      newEl.slotCategory = 'IMAGE_SLOT';
      newEl.dynamicSlot = 'CUSTOM_IMAGE';
    } else if (type === 'FRAME_BORDER') {
      newEl.x = 25;
      newEl.y = 25;
      newEl.width = 1030;
      newEl.height = 1030;
      newEl.fillColor = 'transparent';
      newEl.borderColor = '#EAB308';
      newEl.borderWidth = 6;
      newEl.borderRadius = 16;
      newEl.borderStyle = 'SOLID';
      newEl.name = 'Full Canvas Frame Border';
    } else if (type === 'TEXT') {
      const initialText = 'Custom Text Label';
      const initialSize = 28;
      const initialFont = 'Space Grotesk';
      const dims = measureCanvasText(initialText, initialSize, initialFont, 'bold');
      newEl.x = 240;
      newEl.y = 500;
      newEl.width = dims.width + 16;
      newEl.height = dims.height;
      newEl.fontSize = initialSize;
      newEl.fontFamily = initialFont;
      newEl.fontWeight = 'bold';
      newEl.fontColor = '#FFFFFF';
      newEl.textColor = '#FFFFFF';
      newEl.fillColor = '#FFFFFF';
      newEl.textAlign = 'center';
      newEl.text = initialText;
      newEl.name = initialText;
      newEl.customLabel = initialText;
      newEl.fieldKey = 'custom_text_label';
      newEl.slotCategory = 'TEXT_INPUT';
      newEl.dynamicSlot = 'CUSTOM_FIELD';
    } else if (type === 'CAPSULE') {
      newEl.width = 350;
      newEl.height = 60;
      newEl.fillColor = '#EAB308';
    }

    setElements([...elements, newEl]);
    setSelectedId(newId);
  };

  const updateSelectedElement = (props) => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id === selectedId) {
          const updated = { ...el, ...props };
          if (props.name !== undefined || props.customLabel !== undefined) {
            const val = props.name !== undefined ? props.name : props.customLabel;
            updated.name = val;
            updated.customLabel = val;
            updated.fieldKey = val.toLowerCase().replace(/[^a-z0-9]/g, '_');
          }
          if (props.fontColor !== undefined) {
            updated.fontColor = props.fontColor;
            updated.textColor = props.fontColor;
            if (updated.type === 'TEXT') {
              updated.fillColor = props.fontColor;
            }
          }
          if (props.fontSize !== undefined) {
            const sizeNum = Number(props.fontSize);
            updated.fontSize = sizeNum;
            if (updated.type === 'TEXT') {
              updated.height = Math.max(24, sizeNum + 10);
            }
          }
          if (props.fontFamily !== undefined) {
            updated.fontFamily = props.fontFamily;
            // Preload specific font and immediately force canvas redraw when font file arrives
            if (typeof document !== 'undefined' && document.fonts?.load) {
              const weight = props.fontWeight || el.fontWeight || 'bold';
              const size = props.fontSize || el.fontSize || 28;
              document.fonts.load(`${weight} ${size}px "${props.fontFamily}"`).then(() => {
                setFontsLoadedVersion((v) => v + 1);
              }).catch(() => {});
            }
          }
          if (props.fontWeight !== undefined) {
            updated.fontWeight = props.fontWeight;
            if (typeof document !== 'undefined' && document.fonts?.load) {
              const family = props.fontFamily || el.fontFamily || 'Space Grotesk';
              const size = props.fontSize || el.fontSize || 28;
              document.fonts.load(`${props.fontWeight} ${size}px "${family}"`).then(() => {
                setFontsLoadedVersion((v) => v + 1);
              }).catch(() => {});
            }
          }
          if (updated.type === 'TEXT') {
            const currentText = updated.text || updated.customLabel || updated.name || 'Sample Text';
            const currentSize = Number(updated.fontSize) || 28;
            const currentFont = updated.fontFamily || 'Space Grotesk';
            const currentWeight = updated.fontWeight || 'bold';

            const dims = measureCanvasText(currentText, currentSize, currentFont, currentWeight);
            const autoW = dims.width + 16;
            const autoH = dims.height;

            if (updated.textAlign === 'center' && el.width !== autoW && !props.width && !props.x) {
              const prevCenter = updated.x + el.width / 2;
              updated.x = Math.round(prevCenter - autoW / 2);
            }
            if (!props.width) {
              updated.width = Math.max(40, autoW);
            }
            if (!props.height) {
              updated.height = Math.max(24, autoH);
            }

            updated.slotCategory = 'TEXT_INPUT';
            if (!updated.dynamicSlot || updated.dynamicSlot === 'NONE') {
              updated.dynamicSlot = 'CUSTOM_FIELD';
            }
          }
          return updated;
        }
        return el;
      }),
    );
  };

  const deleteSelectedElement = () => {
    if (elements.length <= 1) return;
    const filtered = elements.filter((el) => el.id !== selectedId);
    setElements(filtered);
    setSelectedId(filtered[0]?.id || '');
  };

  const bringForward = () => {
    const idx = elements.findIndex((el) => el.id === selectedId);
    if (idx < elements.length - 1) {
      const copy = [...elements];
      const temp = copy[idx];
      copy[idx] = copy[idx + 1];
      copy[idx + 1] = temp;
      setElements(copy);
    }
  };

  const sendBackward = () => {
    const idx = elements.findIndex((el) => el.id === selectedId);
    if (idx > 0) {
      const copy = [...elements];
      const temp = copy[idx];
      copy[idx] = copy[idx - 1];
      copy[idx - 1] = temp;
      setElements(copy);
    }
  };

  const clearAllElements = () => {
    setElements([]);
    setSelectedId(null);
  };

  return {
    canvasRef,
    stageBgColor,
    setStageBgColor,
    showSelectionBox,
    setShowSelectionBox,
    elements,
    setElements,
    selectedId,
    setSelectedId,
    selectedElement,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleAddElement,
    updateSelectedElement,
    deleteSelectedElement,
    clearAllElements,
    bringForward,
    sendBackward,
    centerSelectedElement,
    exportCleanPreviewDataUrl,
  };
};
