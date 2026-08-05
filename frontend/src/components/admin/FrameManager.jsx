import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Layers,
  Plus,
  Upload,
  Trash2,
  CheckCircle2,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Palette,
  Eye,
  Maximize2,
  Square,
  Circle,
  Move,
  CloudUpload,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
  Copy,
  Layout,
  RefreshCw,
  RotateCw,
  Search,
  X,
} from "lucide-react";
import { frameApi } from "../../services/frame.api";
import { useFrames } from "../../hooks/useFrames";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Alert } from "../ui/Alert";
import { FeedbackModal } from "../common/FeedbackModal";
import Pagination from "../common/Pagination";
import { useFeedbackModal } from "../../hooks/useFeedbackModal";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { FrameStudioHeader } from "./frame-studio/FrameStudioHeader";
import { FramePresetsDrawer } from "./frame-studio/FramePresetsDrawer";
import { FrameLayerInspector } from "./frame-studio/FrameLayerInspector";
import { FrameCanvasStage } from "./frame-studio/FrameCanvasStage";

/**
 * Canva-Style Interactive Vector Frame Studio with Plain White Canvas Stage
 * & Full Typography & Perfect Text Baseline Fitting Engine
 */
export const FrameManager = () => {
  const queryClient = useQueryClient();
  const canvasRef = useRef(null);
  const { modalProps, showSuccess, showError } = useFeedbackModal();
  const [activeTab, setActiveTab] = useState("canva"); // 'canva' | 'upload' | 'manage'
  const [fullscreenFrame, setFullscreenFrame] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Plain Canvas Background Style ('WHITE' | 'DARK' | 'TRANSPARENT')
  const [stageBgColor, setStageBgColor] = useState("WHITE");

  const sampleBrandKit = {
    businessName: "SUNRISE REAL ESTATE",
    tagline: "Premium Homes & Luxury Living",
    phone: "+91 98765 43210",
    address: "Business Park, MG Road, Mumbai",
  };

  // Frame Title & Metadata State
  const [frameMeta, setFrameMeta] = useState({
    title: "Custom Canva Frame Overlay",
    description:
      "Fully customizable Canva-style frame with shapes and dynamic slots",
  });

  // Upload Pre-made PNG State
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    base64Overlay: "",
    overlayPreview: "",
  });

  // CANVA ENGINE STATE: Array of Shape & Element Layer Objects
  const [elements, setElements] = useState([
    {
      id: "el-footer-bg",
      name: "Footer Bar Container",
      type: "RECTANGLE",
      x: 0,
      y: 940,
      width: 1080,
      height: 140,
      fillColor: "#0B0F17",
      borderColor: "#EAB308",
      borderWidth: 3,
      borderRadius: 0,
      dynamicSlot: "NONE",
    },
    {
      id: "el-logo-box",
      name: "Logo Container Box",
      type: "RECTANGLE",
      x: 35,
      y: 35,
      width: 120,
      height: 120,
      fillColor: "#FFFFFF",
      borderColor: "#CBD5E1",
      borderWidth: 2,
      borderRadius: 16,
      dynamicSlot: "LOGO_BOX",
    },
    {
      id: "el-avatar-circle",
      name: "Owner Headshot Ring",
      type: "CIRCLE",
      x: 35,
      y: 890,
      width: 130,
      height: 130,
      fillColor: "#1E293B",
      borderColor: "#EAB308",
      borderWidth: 5,
      borderRadius: 65,
      dynamicSlot: "AVATAR_CIRCLE",
    },
    {
      id: "el-business-name",
      name: "Business Name Text",
      type: "TEXT",
      x: 185,
      y: 965,
      width: 450,
      height: 40,
      fillColor: "#FFFFFF",
      fontSize: 28,
      fontFamily: "Space Grotesk",
      fontWeight: "bold",
      fontColor: "#FFFFFF",
      textAlign: "left",
      dynamicSlot: "BUSINESS_NAME",
      text: sampleBrandKit.businessName,
    },
    {
      id: "el-phone-badge",
      name: "Phone Badge",
      type: "TEXT",
      x: 700,
      y: 965,
      width: 340,
      height: 40,
      fillColor: "#EAB308",
      fontSize: 22,
      fontFamily: "Space Grotesk",
      fontWeight: "bold",
      fontColor: "#EAB308",
      textAlign: "right",
      dynamicSlot: "PHONE",
      text: `${sampleBrandKit.phone}`,
    },
    {
      id: "el-address-text",
      name: "Address Text",
      type: "TEXT",
      x: 700,
      y: 1010,
      width: 340,
      height: 30,
      fillColor: "#94A3B8",
      fontSize: 15,
      fontFamily: "Plus Jakarta Sans",
      fontWeight: "normal",
      fontColor: "#CBD5E1",
      textAlign: "right",
      dynamicSlot: "ADDRESS",
      text: `${sampleBrandKit.address}`,
    },
  ]);

  // Selected Element ID for Inspector
  const [selectedId, setSelectedId] = useState("el-footer-bg");
  const selectedElement =
    elements.find((el) => el.id === selectedId) || elements[0];

  // Dragging & Resizing State on Canvas Stage
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null); // 'BR' | 'BL' | 'TR' | 'TL'
  const dragStartRef = useRef({
    x: 0,
    y: 0,
    initialElX: 0,
    initialElY: 0,
    initialWidth: 0,
    initialHeight: 0,
  });

  // Pagination & Search State for Active Frames
  const [framePage, setFramePage] = useState(1);
  const [frameLimit, setFrameLimit] = useState(8);
  const [frameSearch, setFrameSearch] = useState("");

  // Fetch Existing Frames from DB using central modular hook
  const {
    frames,
    meta: framesPaginationMeta,
    isLoading: isLoadingFrames,
  } = useFrames({
    page: framePage,
    limit: frameLimit,
    search: frameSearch,
  });

  // Create Frame Mutation
  const createFrameMutation = useMutation({
    mutationFn: (data) => frameApi.createFrame(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FRAMES.ALL });
      setSuccessMsg(
        "🎉 Canva Frame converted to transparent PNG and saved to Cloud & DB!",
      );
      setErrorMsg("");
      setUploadData({
        title: "",
        description: "",
        base64Overlay: "",
        overlayPreview: "",
      });
      showSuccess(
        "Frame Published! 🖼️",
        "Canva Frame overlay and vector blueprints saved to database successfully.",
      );
    },
    onError: (err) => {
      setErrorMsg(err.message || "Failed to publish Canva frame.");
      showError(
        "Frame Creation Failed ⚠️",
        err.message || "Failed to publish Canva frame.",
      );
    },
  });

  // Delete Frame Mutation
  const deleteFrameMutation = useMutation({
    mutationFn: (id) => frameApi.deleteFrame(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FRAMES.ALL });
      showSuccess(
        "Frame Removed 🗑️",
        "Canva Frame template deleted from database.",
      );
    },
    onError: (err) => {
      showError("Delete Failed ⚠️", err.message || "Failed to delete frame.");
    },
  });

  // Render 1080x1080 Plain White Canva Stage Canvas
  const renderCanvaStage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1080;

    // Clear previous canvas
    ctx.clearRect(0, 0, 1080, 1080);

    // Render Plain Stage Background (Clean White Screen by default)
    if (stageBgColor === "WHITE") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 1080, 1080);
      // Subtle Grid Guidelines
      ctx.strokeStyle = "#F1F5F9";
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
    } else if (stageBgColor === "DARK") {
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, 0, 1080, 1080);
    }

    // Render Each Element Layer in order
    elements.forEach((el) => {
      ctx.save();
      const elH = el.type === "TEXT" ? (el.fontSize || 24) + 6 : el.height;
      const rotation = el.rotation || 0;
      if (rotation) {
        const cx = el.x + el.width / 2;
        const cy = el.y + elH / 2;
        ctx.translate(cx, cy);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-cx, -cy);
      }

      if (el.type === "RECTANGLE" || el.type === "CAPSULE") {
        ctx.fillStyle = el.fillColor || "#000000";
        ctx.beginPath();
        const r = el.type === "CAPSULE" ? el.height / 2 : el.borderRadius || 0;
        ctx.roundRect(el.x, el.y, el.width, el.height, r);
        ctx.fill();

        if (el.borderWidth > 0) {
          ctx.strokeStyle = el.borderColor || "#FFFFFF";
          ctx.lineWidth = el.borderWidth;
          ctx.stroke();
        }

        if (
          el.dynamicSlot === "LOGO_BOX" ||
          (el.slotCategory === "IMAGE_SLOT" && el.type !== "CIRCLE")
        ) {
          ctx.fillStyle =
            el.fillColor === "#FFFFFF" || !el.fillColor ? "#0B0F17" : "#FFFFFF";
          ctx.font = 'bold 20px "Space Grotesk", sans-serif';
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🏢 LOGO", el.x + el.width / 2, el.y + el.height / 2);
        }
      } else if (el.type === "CIRCLE") {
        const radius = el.width / 2;
        const cx = el.x + radius;
        const cy = el.y + radius;

        ctx.fillStyle = el.fillColor || "#1E293B";
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        if (el.borderWidth > 0) {
          ctx.strokeStyle = el.borderColor || "#EAB308";
          ctx.lineWidth = el.borderWidth;
          ctx.stroke();
        }

        if (
          el.dynamicSlot === "AVATAR_CIRCLE" ||
          (el.slotCategory === "IMAGE_SLOT" && el.type === "CIRCLE")
        ) {
          ctx.fillStyle = "#FFFFFF";
          ctx.font = 'bold 16px "Space Grotesk", sans-serif';
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("👤 PHOTO", cx, cy);
        }
      } else if (el.type === "TEXT") {
        const fontFamily = el.fontFamily || "Space Grotesk";
        const fontWeight = el.fontWeight || "bold";
        const fontSize = el.fontSize || 24;
        ctx.fillStyle = el.fontColor || el.fillColor || "#0B0F17";
        ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
        ctx.textAlign = el.textAlign || "left";
        ctx.textBaseline = "top"; // Set top baseline so text renders INSIDE bounding box rectangle!
        const tx =
          el.textAlign === "center"
            ? el.x + el.width / 2
            : el.textAlign === "right"
              ? el.x + el.width
              : el.x;
        ctx.fillText(el.text || "Sample Text", tx, el.y);
      }

      // Draw Selection Bounding Box & 4 Interactive Corner Resizing Handles
      if (el.id === selectedId) {
        const elH = el.type === "TEXT" ? (el.fontSize || 24) + 6 : el.height;
        ctx.strokeStyle = "#38BDF8";
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(el.x - 4, el.y - 4, el.width + 8, elH + 8);
        ctx.setLineDash([]);

        // Draw 4 Resizing Handles (Blue square with white border)
        const handleSize = 16;
        const halfH = handleSize / 2;
        const corners = [
          { x: el.x - halfH, y: el.y - halfH }, // Top-Left (TL)
          { x: el.x + el.width - halfH, y: el.y - halfH }, // Top-Right (TR)
          { x: el.x - halfH, y: el.y + elH - halfH }, // Bottom-Left (BL)
          { x: el.x + el.width - halfH, y: el.y + elH - halfH }, // Bottom-Right (BR)
        ];

        corners.forEach((c) => {
          ctx.fillStyle = "#38BDF8";
          ctx.fillRect(c.x, c.y, handleSize, handleSize);
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 2;
          ctx.strokeRect(c.x, c.y, handleSize, handleSize);
        });
      }

      ctx.restore();
    });
  }, [elements, selectedId, stageBgColor]);

  useEffect(() => {
    if (activeTab === "canva") {
      renderCanvaStage();
    }
  }, [activeTab, renderCanvaStage]);

  // CANVAS MOUSE DOWN (Check Handle Click for Resizing VS Dragging)
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scale = 1080 / rect.width;
    const clickX = (e.clientX - rect.left) * scale;
    const clickY = (e.clientY - rect.top) * scale;

    // Check if clicked inside a Corner Resize Handle of the currently selected element
    if (selectedElement) {
      const elH =
        selectedElement.type === "TEXT"
          ? (selectedElement.fontSize || 24) + 6
          : selectedElement.height;
      const hSize = 24; // hit box margin for resizing handle

      const corners = [
        { handle: "TL", x: selectedElement.x, y: selectedElement.y },
        {
          handle: "TR",
          x: selectedElement.x + selectedElement.width,
          y: selectedElement.y,
        },
        { handle: "BL", x: selectedElement.x, y: selectedElement.y + elH },
        {
          handle: "BR",
          x: selectedElement.x + selectedElement.width,
          y: selectedElement.y + elH,
        },
      ];

      const hitCorner = corners.find(
        (c) =>
          Math.abs(clickX - c.x) <= hSize && Math.abs(clickY - c.y) <= hSize,
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

    // Otherwise, check if clicked on any Element for Selection & Dragging
    const clickedEl = [...elements].reverse().find((el) => {
      const h = el.type === "TEXT" ? el.fontSize || 24 : el.height;
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

  // CANVAS MOUSE MOVE (Handle Resizing OR Dragging)
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

      if (resizeHandle === "BR") {
        newW = Math.max(30, Math.round(dragStartRef.current.initialWidth + dx));
        newH = Math.max(
          30,
          Math.round(dragStartRef.current.initialHeight + dy),
        );
      } else if (resizeHandle === "TR") {
        newW = Math.max(30, Math.round(dragStartRef.current.initialWidth + dx));
        newH = Math.max(
          30,
          Math.round(dragStartRef.current.initialHeight - dy),
        );
        newY = Math.round(dragStartRef.current.initialElY + dy);
      } else if (resizeHandle === "BL") {
        newW = Math.max(30, Math.round(dragStartRef.current.initialWidth - dx));
        newH = Math.max(
          30,
          Math.round(dragStartRef.current.initialHeight + dy),
        );
        newX = Math.round(dragStartRef.current.initialElX + dx);
      } else if (resizeHandle === "TL") {
        newW = Math.max(30, Math.round(dragStartRef.current.initialWidth - dx));
        newH = Math.max(
          30,
          Math.round(dragStartRef.current.initialHeight - dy),
        );
        newX = Math.round(dragStartRef.current.initialElX + dx);
        newY = Math.round(dragStartRef.current.initialElY + dy);
      }

      // If shape is CIRCLE, maintain aspect ratio 1:1
      if (selectedElement.type === "CIRCLE") {
        newH = newW;
      }

      updateSelectedElement({
        x: newX,
        y: newY,
        width: newW,
        height: newH,
        borderRadius:
          selectedElement.type === "CIRCLE"
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

  // ADD NEW SHAPES / ELEMENTS
  const handleAddElement = (type, slot = "NONE") => {
    const newId = `el-${Date.now()}`;
    let newEl = {
      id: newId,
      name: `New ${type.toLowerCase()}`,
      type,
      x: 100,
      y: 900,
      width: 300,
      height: 100,
      fillColor: "#0B0F17",
      borderColor: "#EAB308",
      borderWidth: 2,
      borderRadius: 12,
      dynamicSlot: slot,
    };

    if (type === "CIRCLE") {
      newEl.width = 120;
      newEl.height = 120;
      newEl.borderRadius = 60;
    } else if (type === "TEXT") {
      newEl.width = 300;
      newEl.height = 40;
      newEl.fontSize = 24;
      newEl.fontFamily = "Space Grotesk";
      newEl.fontWeight = "bold";
      newEl.fontColor = "#0B0F17";
      newEl.textAlign = "left";
      newEl.text = "Custom Text Label";
      newEl.name = "Custom Text Label";
      newEl.customLabel = "Custom Text Label";
      newEl.fieldKey = "custom_text_label";
      newEl.slotCategory = "TEXT_INPUT";
      newEl.dynamicSlot = "CUSTOM_FIELD";
    } else if (type === "CAPSULE") {
      newEl.width = 350;
      newEl.height = 60;
      newEl.fillColor = "#EAB308";
    }

    setElements([...elements, newEl]);
    setSelectedId(newId);
  };

  // UPDATE SELECTED ELEMENT PROPERTIES
  const updateSelectedElement = (props) => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id === selectedId) {
          const updated = { ...el, ...props };

          // Synchronize Element Layer Name (name) and Input Field Name (customLabel)
          if (props.name !== undefined || props.customLabel !== undefined) {
            const val =
              props.name !== undefined ? props.name : props.customLabel;
            updated.name = val;
            updated.customLabel = val;
            updated.fieldKey = val.toLowerCase().replace(/[^a-z0-9]/g, "_");
          }

          // Compulsory Dynamic Text Input category for Text elements
          if (updated.type === "TEXT") {
            updated.slotCategory = "TEXT_INPUT";
            if (!updated.dynamicSlot || updated.dynamicSlot === "NONE") {
              updated.dynamicSlot = "CUSTOM_FIELD";
            }
          }

          return updated;
        }
        return el;
      }),
    );
  };

  // DELETE SELECTED ELEMENT
  const handleDeleteSelected = () => {
    if (elements.length <= 1) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(elements[0]?.id || "");
  };

  // REORDER LAYERS (UP / DOWN)
  const handleMoveLayer = (direction) => {
    const index = elements.findIndex((el) => el.id === selectedId);
    if (index === -1) return;
    const newElements = [...elements];
    if (direction === "UP" && index < newElements.length - 1) {
      const temp = newElements[index];
      newElements[index] = newElements[index + 1];
      newElements[index + 1] = temp;
    } else if (direction === "DOWN" && index > 0) {
      const temp = newElements[index];
      newElements[index] = newElements[index - 1];
      newElements[index - 1] = temp;
    }
    setElements(newElements);
  };

  // LOAD CANVA PRESETS
  const loadPreset = (presetName) => {
    if (presetName === "BLANK") {
      setElements([]);
    } else if (presetName === "GOLD_REAL_ESTATE") {
      setElements([
        {
          id: "el-1",
          name: "Gold Footer Bar",
          type: "RECTANGLE",
          x: 0,
          y: 940,
          width: 1080,
          height: 140,
          fillColor: "#0B0F17",
          borderColor: "#EAB308",
          borderWidth: 3,
          borderRadius: 0,
          dynamicSlot: "NONE",
        },
        {
          id: "el-2",
          name: "Logo Slot Box",
          type: "RECTANGLE",
          x: 35,
          y: 35,
          width: 120,
          height: 120,
          fillColor: "#FFFFFF",
          borderColor: "#CBD5E1",
          borderWidth: 2,
          borderRadius: 16,
          dynamicSlot: "LOGO_BOX",
        },
        {
          id: "el-3",
          name: "Avatar Circle Ring",
          type: "CIRCLE",
          x: 35,
          y: 890,
          width: 130,
          height: 130,
          fillColor: "#1E293B",
          borderColor: "#EAB308",
          borderWidth: 5,
          borderRadius: 65,
          dynamicSlot: "AVATAR_CIRCLE",
        },
        {
          id: "el-4",
          name: "Business Title",
          type: "TEXT",
          x: 185,
          y: 965,
          width: 450,
          height: 40,
          fillColor: "#FFFFFF",
          fontSize: 26,
          fontFamily: "Space Grotesk",
          fontWeight: "bold",
          fontColor: "#FFFFFF",
          textAlign: "left",
          dynamicSlot: "BUSINESS_NAME",
          text: sampleBrandKit.businessName,
        },
        {
          id: "el-5",
          name: "Phone Badge",
          type: "TEXT",
          x: 700,
          y: 965,
          width: 340,
          height: 40,
          fillColor: "#EAB308",
          fontSize: 20,
          fontFamily: "Space Grotesk",
          fontWeight: "bold",
          fontColor: "#EAB308",
          textAlign: "right",
          dynamicSlot: "PHONE",
          text: `📞 ${sampleBrandKit.phone}`,
        },
      ]);
    } else if (presetName === "DOCTOR_CLINIC") {
      setElements([
        {
          id: "el-1",
          name: "Blue Capsule Footer",
          type: "CAPSULE",
          x: 40,
          y: 950,
          width: 1000,
          height: 100,
          fillColor: "#0D9488",
          borderColor: "#06B6D4",
          borderWidth: 2,
          borderRadius: 50,
          dynamicSlot: "NONE",
        },
        {
          id: "el-2",
          name: "Doctor Headshot Ring",
          type: "CIRCLE",
          x: 50,
          y: 935,
          width: 130,
          height: 130,
          fillColor: "#1E293B",
          borderColor: "#FFFFFF",
          borderWidth: 4,
          borderRadius: 65,
          dynamicSlot: "AVATAR_CIRCLE",
        },
        {
          id: "el-3",
          name: "Doctor Name",
          type: "TEXT",
          x: 200,
          y: 980,
          width: 450,
          height: 40,
          fillColor: "#FFFFFF",
          fontSize: 26,
          fontFamily: "Space Grotesk",
          fontWeight: "bold",
          fontColor: "#FFFFFF",
          textAlign: "left",
          dynamicSlot: "BUSINESS_NAME",
          text: "Dr. Parita Pandya",
        },
        {
          id: "el-4",
          name: "Clinic Phone",
          type: "TEXT",
          x: 680,
          y: 980,
          width: 340,
          height: 40,
          fillColor: "#FFFFFF",
          fontSize: 20,
          fontFamily: "Space Grotesk",
          fontWeight: "bold",
          fontColor: "#FFFFFF",
          textAlign: "right",
          dynamicSlot: "PHONE",
          text: `📞 ${sampleBrandKit.phone}`,
        },
      ]);
    }
  };

  // EXPORT CANVA FRAME TO TRANSPARENT PNG & SAVE TO DB
  const handlePublishCanvaFrame = (e) => {
    e.preventDefault();
    if (!frameMeta.title.trim()) {
      setErrorMsg("Please enter a frame title.");
      return;
    }

    try {
      // Offscreen canvas for pure transparent PNG frame export
      const offscreen = document.createElement("canvas");
      offscreen.width = 1080;
      offscreen.height = 1080;
      const ctx = offscreen.getContext("2d");

      // Render ONLY shapes and dynamic slots (transparent background!)
      elements.forEach((el) => {
        ctx.save();
        const elH = el.type === "TEXT" ? (el.fontSize || 24) + 6 : el.height;
        const rotation = el.rotation || 0;
        if (rotation) {
          const cx = el.x + el.width / 2;
          const cy = el.y + elH / 2;
          ctx.translate(cx, cy);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.translate(-cx, -cy);
        }

        if (el.type === "RECTANGLE" || el.type === "CAPSULE") {
          ctx.fillStyle = el.fillColor || "#000000";
          ctx.beginPath();
          const r =
            el.type === "CAPSULE" ? el.height / 2 : el.borderRadius || 0;
          ctx.roundRect(el.x, el.y, el.width, el.height, r);
          ctx.fill();

          if (el.borderWidth > 0) {
            ctx.strokeStyle = el.borderColor || "#FFFFFF";
            ctx.lineWidth = el.borderWidth;
            ctx.stroke();
          }
        } else if (el.type === "CIRCLE") {
          const radius = el.width / 2;
          const cx = el.x + radius;
          const cy = el.y + radius;

          ctx.fillStyle = el.fillColor || "#1E293B";
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();

          if (el.borderWidth > 0) {
            ctx.strokeStyle = el.borderColor || "#EAB308";
            ctx.lineWidth = el.borderWidth;
            ctx.stroke();
          }
        }
        // NOTE: Dynamic TEXT elements and logo/avatar placeholders are NOT drawn onto static PNG overlay.
        // They are rendered dynamically at 60 FPS in useCanvasCompositor from user's BrandKit & custom inputs.
        ctx.restore();
      });

      const base64Png = offscreen.toDataURL("image/png", 1.0);

      createFrameMutation.mutate({
        title: frameMeta.title,
        description: frameMeta.description,
        base64Overlay: base64Png,
        base64Image: base64Png,
        configJson: { elements },
      });
    } catch (err) {
      setErrorMsg("Failed to export Canva frame to PNG.");
    }
  };

  // Manual File Upload Handler
  const handleOverlayFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadData((prev) => ({
        ...prev,
        base64Overlay: reader.result,
        overlayPreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUploadFrame = (e) => {
    e.preventDefault();
    if (!uploadData.title.trim() || !uploadData.base64Overlay) {
      setErrorMsg(
        "Please enter a title and select a transparent PNG image file.",
      );
      return;
    }
    createFrameMutation.mutate({
      title: uploadData.title,
      description: uploadData.description,
      base64Overlay: uploadData.base64Overlay,
      base64Image: uploadData.base64Overlay,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#131B2A] border border-[#2C384E] p-6 rounded-2xl">
        <div>
          <h2 className="font-heading font-extrabold text-xl text-white flex items-center gap-2">
            <Layout className="w-5 h-5 text-amber-400" />
            <span>Canva-Style Interactive Frame Builder</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build frames visually on a plain white canvas stage! Add rectangles,
            circles, capsule pills & typography text slots with custom fonts &
            sizes!
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#0B0F17] p-1.5 rounded-xl border border-[#2C384E]">
          <button
            onClick={() => setActiveTab("canva")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "canva"
                ? "bg-amber-500 text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Canva Vector Builder</span>
          </button>

          <button
            onClick={() => setActiveTab("manage")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "manage"
                ? "bg-amber-500 text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Active Frames ({frames.length})</span>
          </button>
        </div>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: Canva Vector Builder */}
      {activeTab === "canva" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT TOOLBAR (4 Cols): Add Shapes & Element Layer Inspector */}
          <div className="lg:col-span-4 space-y-6">
            {/* Shape Add Toolbar */}
            <Card className="border-[#2C384E] bg-[#131B2A] p-5 space-y-4">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Add Canva Shapes & Input Slots</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleAddElement("RECTANGLE")}
                  className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs font-semibold hover:border-amber-500 transition flex items-center gap-2"
                >
                  <Square className="w-4 h-4 text-amber-400" />
                  <span>+ Rectangle</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddElement("CIRCLE", "AVATAR_CIRCLE")}
                  className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs font-semibold hover:border-amber-500 transition flex items-center gap-2"
                >
                  <Circle className="w-4 h-4 text-teal-400" />
                  <span>+ Circle Slot</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddElement("CAPSULE")}
                  className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs font-semibold hover:border-amber-500 transition flex items-center gap-2"
                >
                  <Maximize2 className="w-4 h-4 text-indigo-400" />
                  <span>+ Capsule Pill</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddElement("TEXT")}
                  className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs font-semibold hover:border-amber-500 transition flex items-center gap-2"
                >
                  <Type className="w-4 h-4 text-emerald-400" />
                  <span>+ Text Input</span>
                </button>
              </div>

              {/* Starter Presets */}
              <div className="pt-2 border-t border-[#2C384E] space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Starter Presets
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => loadPreset("GOLD_REAL_ESTATE")}
                    className="px-2.5 py-1 rounded bg-slate-800 text-[11px] text-amber-300 font-semibold hover:bg-slate-700"
                  >
                    Gold Estate
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset("DOCTOR_CLINIC")}
                    className="px-2.5 py-1 rounded bg-slate-800 text-[11px] text-teal-300 font-semibold hover:bg-slate-700"
                  >
                    Doctor Capsule
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset("BLANK")}
                    className="px-2.5 py-1 rounded bg-rose-500/10 text-[11px] text-rose-400 font-semibold hover:bg-rose-500/20"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </Card>

            {/* Selected Element Property Inspector */}
            {selectedElement && (
              <Card className="border-[#2C384E] bg-[#131B2A] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#2C384E] pb-2">
                  <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>Element Inspector</span>
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveLayer("UP")}
                      className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                      title="Move Layer Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveLayer("DOWN")}
                      className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                      title="Move Layer Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleDeleteSelected}
                      className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white"
                      title="Delete Element"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <Input
                  label="Element Layer Name"
                  placeholder="e.g. Phone Number, Instagram Handle, Branch 2 Address"
                  value={
                    selectedElement.name || selectedElement.customLabel || ""
                  }
                  onChange={(e) =>
                    updateSelectedElement({
                      name: e.target.value,
                      customLabel: e.target.value,
                    })
                  }
                />

                {/* 100% Free-form Dynamic Field Configuration */}
                <div className="space-y-3 p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                      Element Slot Category{" "}
                      {selectedElement.type === "TEXT"
                        ? "(Compulsory Text Input)"
                        : ""}
                    </label>
                    <select
                      value={
                        selectedElement.type === "TEXT"
                          ? "TEXT_INPUT"
                          : selectedElement.slotCategory ||
                            (selectedElement.dynamicSlot === "LOGO_BOX" ||
                            selectedElement.dynamicSlot === "AVATAR_CIRCLE"
                              ? "IMAGE_SLOT"
                              : selectedElement.dynamicSlot !== "NONE"
                                ? "TEXT_INPUT"
                                : "STATIC")
                      }
                      disabled={selectedElement.type === "TEXT"}
                      onChange={(e) => {
                        const cat = e.target.value;
                        if (cat === "STATIC") {
                          updateSelectedElement({
                            slotCategory: "STATIC",
                            dynamicSlot: "NONE",
                          });
                        } else if (cat === "TEXT_INPUT") {
                          updateSelectedElement({
                            slotCategory: "TEXT_INPUT",
                            type: "TEXT",
                            dynamicSlot:
                              selectedElement.dynamicSlot !== "NONE"
                                ? selectedElement.dynamicSlot
                                : "CUSTOM_FIELD",
                            customLabel:
                              selectedElement.customLabel ||
                              selectedElement.name ||
                              "Text Field",
                            name:
                              selectedElement.customLabel ||
                              selectedElement.name ||
                              "Text Field",
                            fieldKey:
                              selectedElement.fieldKey || `field_${Date.now()}`,
                          });
                        } else if (cat === "IMAGE_SLOT") {
                          updateSelectedElement({
                            slotCategory: "IMAGE_SLOT",
                            type:
                              selectedElement.type === "CIRCLE"
                                ? "CIRCLE"
                                : "RECTANGLE",
                            dynamicSlot:
                              selectedElement.dynamicSlot === "AVATAR_CIRCLE"
                                ? "AVATAR_CIRCLE"
                                : "LOGO_BOX",
                            customLabel:
                              selectedElement.customLabel ||
                              selectedElement.name ||
                              "Image Slot",
                            name:
                              selectedElement.customLabel ||
                              selectedElement.name ||
                              "Image Slot",
                            fieldKey:
                              selectedElement.fieldKey || `img_${Date.now()}`,
                          });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-xl bg-[#131B2A] border border-[#2C384E] text-white text-xs font-semibold focus:outline-none focus:border-amber-500 ${
                        selectedElement.type === "TEXT"
                          ? "opacity-80 cursor-not-allowed border-amber-500/50"
                          : ""
                      }`}
                    >
                      {selectedElement.type === "TEXT" ? (
                        <option value="TEXT_INPUT">
                          ✍️ Dynamic Text Input (Compulsory for Text)
                        </option>
                      ) : (
                        <>
                          <option value="STATIC">
                            🎨 Static Shape (Decorative Background / Bar)
                          </option>
                          <option value="TEXT_INPUT">
                            ✍️ Dynamic Text Input (User types text e.g. Phone,
                            Name, Handle)
                          </option>
                          <option value="IMAGE_SLOT">
                            🖼️ Dynamic PNG Image Slot (User uploads Logo,
                            Headshot, QR Code)
                          </option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* IF TEXT INPUT SLOT */}
                  {(selectedElement.slotCategory === "TEXT_INPUT" ||
                    selectedElement.type === "TEXT" ||
                    selectedElement.dynamicSlot !== "NONE") && (
                    <div className="space-y-2 pt-2 border-t border-[#2C384E]">
                      <Input
                        label="Input Field Name (What user sees)"
                        placeholder="e.g. Phone Number, Instagram Handle, Branch 2 Address"
                        value={
                          selectedElement.customLabel ||
                          selectedElement.name ||
                          ""
                        }
                        onChange={(e) =>
                          updateSelectedElement({
                            customLabel: e.target.value,
                            name: e.target.value,
                          })
                        }
                      />

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-300 font-semibold block">
                          BrandKit Auto-Fill
                        </label>
                        <select
                          value={selectedElement.dynamicSlot || "CUSTOM_FIELD"}
                          onChange={(e) =>
                            updateSelectedElement({
                              dynamicSlot: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#131B2A] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500"
                        >
                          <option value="CUSTOM_FIELD">
                            Custom Input Field (Manual User Entry)
                          </option>
                          <option value="BUSINESS_NAME">Business Name</option>
                          <option value="PHONE">Phone Number</option>
                          <option value="WHATSAPP">WhatsApp Number</option>
                          <option value="EMAIL">Email Address</option>
                          <option value="INSTAGRAM">
                            Instagram Handle (@username)
                          </option>
                          <option value="FACEBOOK">
                            Facebook Handle / Page
                          </option>
                          <option value="ADDRESS">Address / Street</option>
                          <option value="CITY">City</option>
                          <option value="STATE">State</option>
                          <option value="COUNTRY">Country</option>
                          <option value="WEBSITE">
                            Website URL (www.site.com)
                          </option>
                          <option value="TAGLINE">
                            Tagline / Designation / Slogan
                          </option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* IF IMAGE SLOT */}
                  {(selectedElement.slotCategory === "IMAGE_SLOT" ||
                    selectedElement.dynamicSlot === "LOGO_BOX" ||
                    selectedElement.dynamicSlot === "AVATAR_CIRCLE") && (
                    <div className="space-y-2 pt-2 border-t border-[#2C384E]">
                      <Input
                        label="Image Slot Name (What user uploads)"
                        placeholder="e.g. Business Logo, Profile Headshot, QR Code Photo"
                        value={
                          selectedElement.customLabel ||
                          selectedElement.name ||
                          ""
                        }
                        onChange={(e) =>
                          updateSelectedElement({
                            customLabel: e.target.value,
                            name: e.target.value,
                            fieldKey: e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]/g, "_"),
                          })
                        }
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-300 font-semibold block">
                            Image Shape
                          </label>
                          <select
                            value={
                              selectedElement.type === "CIRCLE"
                                ? "CIRCLE"
                                : "RECTANGLE"
                            }
                            onChange={(e) => {
                              const shapeType = e.target.value;
                              updateSelectedElement({
                                type: shapeType,
                                borderRadius:
                                  shapeType === "CIRCLE"
                                    ? Math.round(selectedElement.width / 2)
                                    : 16,
                              });
                            }}
                            className="w-full px-2 py-1.5 rounded-lg bg-[#131B2A] border border-[#2C384E] text-white text-xs font-semibold"
                          >
                            <option value="CIRCLE">
                              ⭕ Circle (Headshot Ring)
                            </option>
                            <option value="RECTANGLE">
                              🟦 Rectangle (Logo Box)
                            </option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-300 font-semibold block">
                            BrandKit Auto-Fill
                          </label>
                          <select
                            value={selectedElement.dynamicSlot || "LOGO_BOX"}
                            onChange={(e) => {
                              const slot = e.target.value;
                              updateSelectedElement({
                                dynamicSlot: slot,
                                type:
                                  slot === "AVATAR_CIRCLE"
                                    ? "CIRCLE"
                                    : selectedElement.type,
                              });
                            }}
                            className="w-full px-2 py-1.5 rounded-lg bg-[#131B2A] border border-[#2C384E] text-white text-xs"
                          >
                            <option value="LOGO_BOX">Business Logo</option>
                            <option value="AVATAR_CIRCLE">
                              Profile Headshot Avatar
                            </option>
                            <option value="CUSTOM_IMAGE">
                              Custom PNG Image
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Position & Customizable Dimensions */}
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block">
                      X Pos
                    </label>
                    <input
                      type="number"
                      value={selectedElement.x}
                      onChange={(e) =>
                        updateSelectedElement({ x: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1.5 rounded-lg bg-[#0B0F17] border border-[#2C384E] text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">
                      Y Pos
                    </label>
                    <input
                      type="number"
                      value={selectedElement.y}
                      onChange={(e) =>
                        updateSelectedElement({ y: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1.5 rounded-lg bg-[#0B0F17] border border-[#2C384E] text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">
                      Width
                    </label>
                    <input
                      type="number"
                      value={selectedElement.width}
                      onChange={(e) =>
                        updateSelectedElement({ width: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1.5 rounded-lg bg-[#0B0F17] border border-[#2C384E] text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">
                      Height
                    </label>
                    <input
                      type="number"
                      value={selectedElement.height}
                      onChange={(e) =>
                        updateSelectedElement({
                          height: Number(e.target.value),
                        })
                      }
                      className="w-full px-2 py-1.5 rounded-lg bg-[#0B0F17] border border-[#2C384E] text-white font-mono"
                    />
                  </div>
                </div>

                {/* Element Rotation Angle Configuration */}
                <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Element Rotation Angle</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateSelectedElement({
                            rotation:
                              (Number(selectedElement.rotation || 0) -
                                15 +
                                360) %
                              360,
                          })
                        }
                        className="px-1.5 py-0.5 rounded bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white font-bold text-[10px] transition"
                        title="-15 degrees"
                      >
                        -15°
                      </button>
                      <input
                        type="number"
                        min="-360"
                        max="360"
                        value={selectedElement.rotation || 0}
                        onChange={(e) =>
                          updateSelectedElement({
                            rotation: Number(e.target.value),
                          })
                        }
                        className="w-14 px-1 py-0.5 rounded bg-[#131B2A] border border-[#2C384E] text-amber-400 text-xs font-mono text-center font-extrabold focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-amber-400 font-bold text-xs">
                        °
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateSelectedElement({
                            rotation:
                              (Number(selectedElement.rotation || 0) + 15) %
                              360,
                          })
                        }
                        className="px-1.5 py-0.5 rounded bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white font-bold text-[10px] transition"
                        title="+15 degrees"
                      >
                        +15°
                      </button>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="5"
                    value={selectedElement.rotation || 0}
                    onChange={(e) =>
                      updateSelectedElement({
                        rotation: Number(e.target.value),
                      })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />

                  {/* Quick Angle Presets */}
                  <div className="flex flex-wrap gap-1">
                    {[0, 15, 30, 45, 90, 180, 270, 315, -15, -45].map((ang) => (
                      <button
                        key={ang}
                        type="button"
                        onClick={() => updateSelectedElement({ rotation: ang })}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono transition border ${
                          (selectedElement.rotation || 0) === ang
                            ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow"
                            : "bg-[#131B2A] text-slate-400 border-[#2C384E] hover:text-white hover:border-slate-600"
                        }`}
                      >
                        {ang}°
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fill & Border Colors */}
                {selectedElement.type !== "TEXT" && (
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E]">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300 uppercase block">
                        Fill Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedElement.fillColor}
                          onChange={(e) =>
                            updateSelectedElement({ fillColor: e.target.value })
                          }
                          className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                        />
                        <span className="font-mono text-xs text-white uppercase">
                          {selectedElement.fillColor}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300 uppercase block">
                        Border Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedElement.borderColor || "#FFFFFF"}
                          onChange={(e) =>
                            updateSelectedElement({
                              borderColor: e.target.value,
                            })
                          }
                          className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                        />
                        <span className="font-mono text-xs text-white uppercase">
                          {selectedElement.borderColor || "#FFFFFF"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Typography Controls for Text Inputs */}
                {selectedElement.type === "TEXT" && (
                  <div className="space-y-3 p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E]">
                    <Input
                      label="Sample Text Content"
                      value={selectedElement.text || ""}
                      onChange={(e) =>
                        updateSelectedElement({ text: e.target.value })
                      }
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-300 uppercase block">
                          Font Family
                        </label>
                        <select
                          value={selectedElement.fontFamily || "Space Grotesk"}
                          onChange={(e) =>
                            updateSelectedElement({
                              fontFamily: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1.5 rounded-lg bg-[#131B2A] border border-[#2C384E] text-white text-xs"
                        >
                          <option value="Space Grotesk">Space Grotesk</option>
                          <option value="Plus Jakarta Sans">
                            Plus Jakarta Sans
                          </option>
                          <option value="Outfit">Outfit</option>
                          <option value="Inter">Inter</option>
                          <option value="Playfair Display">
                            Playfair Display
                          </option>
                          <option value="Montserrat">Montserrat</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Cinzel">Cinzel (Luxury)</option>
                          <option value="Courier New">Courier Monospace</option>
                          <option value="Georgia">Georgia Serif</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-300 uppercase block">
                          Font Weight
                        </label>
                        <select
                          value={selectedElement.fontWeight || "bold"}
                          onChange={(e) =>
                            updateSelectedElement({
                              fontWeight: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1.5 rounded-lg bg-[#131B2A] border border-[#2C384E] text-white text-xs"
                        >
                          <option value="normal">Normal (400)</option>
                          <option value="semibold">SemiBold (600)</option>
                          <option value="bold">Bold (700)</option>
                          <option value="900">Black / Heavy (900)</option>
                        </select>
                      </div>
                    </div>

                    {/* Font Size & Text Color Controls */}
                    <div className="space-y-3 pt-2 border-t border-[#2C384E]">
                      <div className="grid grid-cols-2 gap-3">
                        {/* Interactive Font Size Picker */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-300 uppercase block">
                              Font Size
                            </label>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  updateSelectedElement({
                                    fontSize: Math.max(
                                      8,
                                      (selectedElement.fontSize || 24) - 2,
                                    ),
                                  })
                                }
                                className="w-5 h-5 rounded bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center transition"
                                title="Decrease Font Size"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="8"
                                max="200"
                                value={selectedElement.fontSize || 24}
                                onChange={(e) =>
                                  updateSelectedElement({
                                    fontSize: Math.min(
                                      200,
                                      Math.max(8, Number(e.target.value)),
                                    ),
                                  })
                                }
                                className="w-12 px-1 py-0.5 rounded bg-[#131B2A] border border-[#2C384E] text-amber-400 text-xs font-mono text-center font-extrabold focus:outline-none focus:border-amber-500"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateSelectedElement({
                                    fontSize: Math.min(
                                      200,
                                      (selectedElement.fontSize || 24) + 2,
                                    ),
                                  })
                                }
                                className="w-5 h-5 rounded bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center transition"
                                title="Increase Font Size"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <input
                            type="range"
                            min="8"
                            max="140"
                            value={selectedElement.fontSize || 24}
                            onChange={(e) =>
                              updateSelectedElement({
                                fontSize: Number(e.target.value),
                              })
                            }
                            className="w-full accent-amber-500 cursor-pointer"
                          />
                        </div>

                        {/* Text Color Picker */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-300 uppercase block">
                            Text Color
                          </label>
                          <div className="flex items-center gap-2 p-1.5 rounded-lg bg-[#131B2A] border border-[#2C384E]">
                            <input
                              type="color"
                              value={selectedElement.fontColor || "#0B0F17"}
                              onChange={(e) =>
                                updateSelectedElement({
                                  fontColor: e.target.value,
                                })
                              }
                              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                            />
                            <span className="font-mono text-xs text-white uppercase font-bold">
                              {selectedElement.fontColor || "#0B0F17"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Font Size Presets */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          Quick Font Sizes
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {[14, 18, 24, 32, 40, 48, 64, 80, 96, 120].map(
                            (sz) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() =>
                                  updateSelectedElement({ fontSize: sz })
                                }
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono transition border ${
                                  (selectedElement.fontSize || 24) === sz
                                    ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow"
                                    : "bg-[#131B2A] text-slate-400 border-[#2C384E] hover:text-white hover:border-slate-600"
                                }`}
                              >
                                {sz}px
                              </button>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* RIGHT CANVAS STAGE & PUBLISH BAR (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
                <div className="space-y-0.5">
                  <h3 className="font-heading font-extrabold text-base text-white flex items-center gap-2">
                    <Move className="w-4 h-4 text-amber-400" />
                    <span>1080x1080 Plain Stage Canvas</span>
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {/* Canvas Stage Background Selector */}
                  <div className="flex items-center gap-1 bg-[#0B0F17] p-1 rounded-xl border border-[#2C384E] text-[11px]">
                    <button
                      type="button"
                      onClick={() => setStageBgColor("WHITE")}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        stageBgColor === "WHITE"
                          ? "bg-white text-slate-950 font-bold"
                          : "text-slate-400"
                      }`}
                    >
                      White Canvas
                    </button>
                    <button
                      type="button"
                      onClick={() => setStageBgColor("DARK")}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        stageBgColor === "DARK"
                          ? "bg-slate-800 text-white font-bold"
                          : "text-slate-400"
                      }`}
                    >
                      Dark Canvas
                    </button>
                  </div>

                  <Button
                    variant="primary"
                    icon={CloudUpload}
                    onClick={handlePublishCanvaFrame}
                    isLoading={createFrameMutation.isPending}
                  >
                    Publish Canva Frame PNG
                  </Button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* 1080x1080 Interactive Stage */}
                <div className="relative aspect-square w-full max-w-lg rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-white shadow-2xl flex items-center justify-center cursor-move">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Metadata Sidebar Form */}
                <div className="w-full md:w-64 space-y-4 bg-[#0B0F17] p-4 rounded-xl border border-[#2C384E]">
                  <Input
                    label="Frame Package Title"
                    value={frameMeta.title}
                    onChange={(e) =>
                      setFrameMeta({ ...frameMeta, title: e.target.value })
                    }
                  />

                  <Input
                    label="Description"
                    value={frameMeta.description}
                    onChange={(e) =>
                      setFrameMeta({
                        ...frameMeta,
                        description: e.target.value,
                      })
                    }
                  />

                  <div className="pt-2 border-t border-[#2C384E] space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">
                      Layer Stack ({elements.length})
                    </label>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {elements.map((el) => (
                        <button
                          key={el.id}
                          type="button"
                          onClick={() => setSelectedId(el.id)}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition ${
                            el.id === selectedId
                              ? "bg-amber-500 text-slate-950 font-bold"
                              : "bg-[#131B2A] text-slate-300 hover:text-white border border-[#2C384E]"
                          }`}
                        >
                          <span className="truncate">{el.name}</span>
                          <span className="text-[9px] font-mono opacity-70 uppercase">
                            {el.type}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Active Frames Grid & Management */}
      {activeTab === "manage" && (
        <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-5">
          {/* Header and Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-400" />
              <span>Active Transparent PNG Frames</span>
            </h3>

            {/* Frame Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search frames by title..."
                value={frameSearch}
                onChange={(e) => {
                  setFrameSearch(e.target.value);
                  setFramePage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-sm focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
              />
            </div>
          </div>

          {isLoadingFrames ? (
            <div className="p-12 text-center text-slate-400">
              Loading frames...
            </div>
          ) : frames.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-2xl space-y-3">
              <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-semibold text-sm">
                No frames found.
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Use the Canva Vector Builder to design and publish your first
                frame overlay!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {frames.map((f) => (
                  <Card
                    key={f.id}
                    className="border-[#2C384E] bg-[#0B0F17] p-4 space-y-3 relative group hover:border-amber-500/50 transition"
                  >
                    <div
                      onClick={() => f.overlayPngUrl && setFullscreenFrame(f)}
                      className="aspect-square rounded-lg bg-[radial-gradient(#2C384E_1px,transparent_1px)] [background-size:12px_12px] bg-slate-950 border border-slate-800 p-2 flex items-center justify-center overflow-hidden relative cursor-pointer group/img"
                      title="Click for Full Screen Big View"
                    >
                      {f.overlayPngUrl ? (
                        <>
                          <img
                            src={f.overlayPngUrl}
                            alt={f.title}
                            className="w-full h-full object-contain group-hover/img:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 backdrop-blur-[2px]">
                            <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 transform scale-90 group-hover/img:scale-100 transition-transform">
                              <Maximize2 className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-700">
                              Full Screen Big View
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500">
                          No PNG Image
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="truncate pr-2">
                        <h4 className="text-xs font-bold text-white truncate">
                          {f.title}
                        </h4>
                        {f.description && (
                          <p className="text-[10px] text-slate-400 truncate">
                            {f.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteFrameMutation.mutate(f.id)}
                        className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white transition shrink-0"
                        title="Delete Frame"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Central Modular Pagination */}
              <Pagination
                meta={framesPaginationMeta}
                onPageChange={(newPage) => setFramePage(newPage)}
                onLimitChange={(newLimit) => {
                  setFrameLimit(newLimit);
                  setFramePage(1);
                }}
                pageSizeOptions={[4, 8, 12, 24]}
              />
            </div>
          )}
        </Card>
      )}

      {/* Reusable Feedback Modal */}
      <FeedbackModal {...modalProps} />

      {/* Full Screen High-Res Frame Lightbox Modal */}
      {fullscreenFrame &&
        createPortal(
          <div
            onClick={() => setFullscreenFrame(null)}
            className="fixed inset-0 w-screen h-screen z-[99999] flex flex-col items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-lg animate-in fade-in duration-200 select-none cursor-zoom-out"
          >
            {/* Top Bar */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-4 left-4 right-4 max-w-5xl mx-auto flex items-center justify-between z-10 bg-[#131B2A]/90 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-[#2C384E] shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-white truncate max-w-md">
                    {fullscreenFrame.title}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    {fullscreenFrame.description || 'Transparent PNG Frame Overlay'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setFullscreenFrame(null)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                title="Close Full Screen View"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checkerboard Background Image Container for Transparent PNGs */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl max-h-[80vh] aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-[#2C384E] bg-[radial-gradient(#2C384E_1px,transparent_1px)] [background-size:16px_16px] bg-[#0B0F17] flex items-center justify-center my-auto p-6 cursor-default"
            >
              <img
                src={fullscreenFrame.overlayPngUrl}
                alt={fullscreenFrame.title}
                className="w-full h-full object-contain filter drop-shadow-2xl"
              />
            </div>

            <p className="text-xs text-slate-400 mt-3 font-mono">
              Click anywhere outside or press X to exit full screen view
            </p>
          </div>,
          document.body
        )}
    </div>
  );
};

export default FrameManager;
