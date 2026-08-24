import { useState, useRef, useEffect, useCallback } from 'react';

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
 * Custom hook encapsulating the Canva Vector Stage Engine.
 * Manages layer element array, selection, mouse drag/resize interactions, and 2D canvas rendering loops.
 */
export const useFrameCanvasEngine = (activeTab = 'canva') => {
  const canvasRef = useRef(null);
  const [stageBgColor, setStageBgColor] = useState('WHITE');
  const [elements, setElements] = useState(defaultElements);
  const [selectedId, setSelectedId] = useState('el-footer-bg');

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

  // Render 1080x1080 Canva Stage Canvas
  const renderCanvaStage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1080;
    ctx.clearRect(0, 0, 1080, 1080);

    if (stageBgColor === 'WHITE') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 1080, 1080);
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
    } else if (stageBgColor === 'DARK') {
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

      if (el.type === 'RECTANGLE' || el.type === 'CAPSULE') {
        ctx.fillStyle = el.fillColor || '#000000';
        ctx.beginPath();
        const r = el.type === 'CAPSULE' ? el.height / 2 : el.borderRadius || 0;
        ctx.roundRect(el.x, el.y, el.width, el.height, r);
        ctx.fill();

        if (el.borderWidth > 0) {
          ctx.strokeStyle = el.borderColor || '#FFFFFF';
          ctx.lineWidth = el.borderWidth;
          ctx.stroke();
        }

        if (
          el.dynamicSlot === 'LOGO_BOX' ||
          (el.slotCategory === 'IMAGE_SLOT' && el.type !== 'CIRCLE')
        ) {
          ctx.fillStyle =
            el.fillColor === '#FFFFFF' || !el.fillColor ? '#0B0F17' : '#FFFFFF';
          ctx.font = 'bold 20px "Space Grotesk", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🏢 LOGO', el.x + el.width / 2, el.y + el.height / 2);
        }
      } else if (el.type === 'CIRCLE') {
        const radius = el.width / 2;
        const cx = el.x + radius;
        const cy = el.y + radius;

        ctx.fillStyle = el.fillColor || '#1E293B';
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        if (el.borderWidth > 0) {
          ctx.strokeStyle = el.borderColor || '#EAB308';
          ctx.lineWidth = el.borderWidth;
          ctx.stroke();
        }

        if (
          el.dynamicSlot === 'AVATAR_CIRCLE' ||
          (el.slotCategory === 'IMAGE_SLOT' && el.type === 'CIRCLE')
        ) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 16px "Space Grotesk", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('👤 PHOTO', cx, cy);
        }
      } else if (el.type === 'TEXT') {
        const fontFamily = el.fontFamily || 'Space Grotesk';
        const fontWeight = el.fontWeight || 'bold';
        const fontSize = el.fontSize || 24;
        ctx.fillStyle = el.fontColor || el.fillColor || '#0B0F17';
        ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
        ctx.textAlign = el.textAlign || 'left';
        ctx.textBaseline = 'top';
        const tx =
          el.textAlign === 'center'
            ? el.x + el.width / 2
            : el.textAlign === 'right'
              ? el.x + el.width
              : el.x;
        ctx.fillText(el.text || 'Sample Text', tx, el.y);
      }

      // Draw Selection Bounding Box & Resizing Handles
      if (el.id === selectedId) {
        const elH = el.type === 'TEXT' ? (el.fontSize || 24) + 6 : el.height;
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(el.x - 4, el.y - 4, el.width + 8, elH + 8);
        ctx.setLineDash([]);

        const handleSize = 16;
        const halfH = handleSize / 2;
        const corners = [
          { x: el.x - halfH, y: el.y - halfH },
          { x: el.x + el.width - halfH, y: el.y - halfH },
          { x: el.x - halfH, y: el.y + elH - halfH },
          { x: el.x + el.width - halfH, y: el.y + elH - halfH },
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
  }, [elements, selectedId, stageBgColor]);

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
      const elH =
        selectedElement.type === 'TEXT'
          ? (selectedElement.fontSize || 24) + 6
          : selectedElement.height;
      const hSize = 24;

      const corners = [
        { handle: 'TL', x: selectedElement.x, y: selectedElement.y },
        { handle: 'TR', x: selectedElement.x + selectedElement.width, y: selectedElement.y },
        { handle: 'BL', x: selectedElement.x, y: selectedElement.y + elH },
        { handle: 'BR', x: selectedElement.x + selectedElement.width, y: selectedElement.y + elH },
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
          initialWidth: selectedElement.width,
          initialHeight: selectedElement.height,
        };
        return;
      }
    }

    const clickedEl = [...elements].reverse().find((el) => {
      const h = el.type === 'TEXT' ? el.fontSize || 24 : el.height;
      return (
        clickX >= el.x &&
        clickX <= el.x + el.width &&
        clickY >= el.y &&
        clickY <= el.y + h
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
    } else if (type === 'TEXT') {
      newEl.width = 300;
      newEl.height = 40;
      newEl.fontSize = 24;
      newEl.fontFamily = 'Space Grotesk';
      newEl.fontWeight = 'bold';
      newEl.fontColor = '#0B0F17';
      newEl.textAlign = 'left';
      newEl.text = 'Custom Text Label';
      newEl.name = 'Custom Text Label';
      newEl.customLabel = 'Custom Text Label';
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
          if (updated.type === 'TEXT') {
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

  return {
    canvasRef,
    stageBgColor,
    setStageBgColor,
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
    bringForward,
    sendBackward,
  };
};
