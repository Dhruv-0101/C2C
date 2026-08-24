import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { frameApi } from "@/services/frame.api";
import { useFrames } from "@/hooks/useFrames";
import { useFeedbackModal } from "@/hooks/useFeedbackModal";
import { useFrameCanvasEngine } from "@/hooks/useFrameCanvasEngine";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { FrameManagerView } from "../components/FrameManagerView";

/**
 * FrameManagerContainer
 * Container component orchestrating data fetching, frame publish mutations, and Canva vector stage engine via useFrameCanvasEngine hook.
 */
export const FrameManagerContainer = () => {
  const queryClient = useQueryClient();
  const { modalProps, showSuccess, showError } = useFeedbackModal();

  const [activeTab, setActiveTab] = useState("canva");
  const [fullscreenFrame, setFullscreenFrame] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Canvas Stage Engine Hook
  const {
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
  } = useFrameCanvasEngine(activeTab);

  // Frame Metadata State
  const [frameMeta, setFrameMeta] = useState({
    title: "Custom Canva Frame Overlay",
    description: "Fully customizable Canva-style frame with shapes and dynamic slots",
  });

  // Upload Pre-made PNG State
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    base64Overlay: "",
    overlayPreview: "",
  });

  // Pagination & Search State for Frames
  const [framePage, setFramePage] = useState(1);
  const [frameLimit, setFrameLimit] = useState(8);
  const [frameSearch, setFrameSearch] = useState("");

  const {
    frames,
    meta: framesPaginationMeta,
    isLoading: isLoadingFrames,
  } = useFrames({
    page: framePage,
    limit: frameLimit,
    search: frameSearch,
  });

  // Mutations
  const createFrameMutation = useMutation({
    mutationFn: (data) => frameApi.createFrame(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FRAMES.ALL });
      setSuccessMsg("🎉 Canva Frame converted to transparent PNG and saved to Cloud & DB!");
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
      showError("Frame Creation Failed ⚠️", err.message || "Failed to publish Canva frame.");
    },
  });

  const deleteFrameMutation = useMutation({
    mutationFn: (id) => frameApi.deleteFrame(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FRAMES.ALL });
      showSuccess("Frame Removed 🗑️", "Canva Frame template deleted from database.");
    },
    onError: (err) => {
      showError("Delete Failed ⚠️", err.message || "Failed to delete frame.");
    },
  });

  // Layer order actions
  const handleMoveLayer = (direction) => {
    if (direction === "UP") bringForward();
    else if (direction === "DOWN") sendBackward();
  };

  const handlePublishCanvaFrame = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setErrorMsg("");
      const offscreen = document.createElement("canvas");
      offscreen.width = 1080;
      offscreen.height = 1080;
      const ctx = offscreen.getContext("2d");
      ctx.clearRect(0, 0, 1080, 1080);

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
        } else if (el.type === "CIRCLE") {
          const radius = el.width / 2;
          const cx = el.x + radius;
          const cy = el.y + radius;

          if (el.dynamicSlot === "AVATAR_CIRCLE") {
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = "source-over";
          } else {
            ctx.fillStyle = el.fillColor || "#1E293B";
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
          }

          if (el.borderWidth > 0) {
            ctx.strokeStyle = el.borderColor || "#EAB308";
            ctx.lineWidth = el.borderWidth;
            ctx.stroke();
          }
        } else if (el.type === "TEXT") {
          const fontFamily = el.fontFamily || "Space Grotesk";
          const fontWeight = el.fontWeight || "bold";
          const fontSize = el.fontSize || 24;
          ctx.fillStyle = el.fontColor || el.fillColor || "#0B0F17";
          ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
          ctx.textAlign = el.textAlign || "left";
          ctx.textBaseline = "top";
          const tx =
            el.textAlign === "center"
              ? el.x + el.width / 2
              : el.textAlign === "right"
                ? el.x + el.width
                : el.x;
          ctx.fillText(el.text || "Sample Text", tx, el.y);
        }
        ctx.restore();
      });

      const transparentBase64 = offscreen.toDataURL("image/png");
      const previewBase64 = canvas.toDataURL("image/png");

      createFrameMutation.mutate({
        title: frameMeta.title || "Custom Canva Vector Frame",
        description: frameMeta.description || "Interactive vector overlay frame",
        base64Overlay: transparentBase64,
        base64Image: previewBase64,
        blueprint: elements,
      });
    } catch (err) {
      setErrorMsg("Failed to export Canva frame to PNG.");
    }
  };

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
      setErrorMsg("Please enter a title and select a transparent PNG image file.");
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
    <FrameManagerView
      canvasRef={canvasRef}
      modalProps={modalProps}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      fullscreenFrame={fullscreenFrame}
      setFullscreenFrame={setFullscreenFrame}
      successMsg={successMsg}
      errorMsg={errorMsg}
      stageBgColor={stageBgColor}
      setStageBgColor={setStageBgColor}
      frameMeta={frameMeta}
      setFrameMeta={setFrameMeta}
      uploadData={uploadData}
      setUploadData={setUploadData}
      elements={elements}
      selectedId={selectedId}
      setSelectedId={setSelectedId}
      selectedElement={selectedElement}
      frames={frames}
      framesPaginationMeta={framesPaginationMeta}
      isLoadingFrames={isLoadingFrames}
      framePage={framePage}
      setFramePage={setFramePage}
      frameLimit={frameLimit}
      setFrameLimit={setFrameLimit}
      frameSearch={frameSearch}
      setFrameSearch={setFrameSearch}
      createFrameMutation={createFrameMutation}
      deleteFrameMutation={deleteFrameMutation}
      handleCanvasMouseDown={handleCanvasMouseDown}
      handleCanvasMouseMove={handleCanvasMouseMove}
      handleCanvasMouseUp={handleCanvasMouseUp}
      handleAddElement={handleAddElement}
      updateSelectedElement={updateSelectedElement}
      handleDeleteSelected={deleteSelectedElement}
      handleMoveLayer={handleMoveLayer}
      loadPreset={(presetElements) => setElements(presetElements)}
      handlePublishCanvaFrame={handlePublishCanvaFrame}
      handleOverlayFileChange={handleOverlayFileChange}
      handleSaveUploadFrame={handleSaveUploadFrame}
    />
  );
};
