import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Upload, X, Check, Image as ImageIcon, Sparkles } from "lucide-react";
import { templateApi } from "../../services/template.api";
import { festivalApi } from "../../services/festival.api";
import { readImageAsBase64 } from "../../utils/file.utils";
import { logger } from "../../utils/logger.util";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Alert } from "../ui/Alert";

export const AdminTemplateUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [festivalId, setFestivalId] = useState("");
  const [festivals, setFestivals] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchFestivals();
      resetForm();
    }
  }, [isOpen]);

  const fetchFestivals = async () => {
    try {
      const response = await festivalApi.getFestivals();
      if (response.data?.festivals) {
        setFestivals(response.data.festivals);
      }
    } catch (err) {
      logger.error("Failed to load festivals list", err);
    }
  };

  const resetForm = () => {
    setPreviewUrl(null);
    setBase64Image(null);
    setTitle("");
    setDescription("");
    setFestivalId("");
    setError("");
    setSuccessMessage("");
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      setError("");
      const base64 = await readImageAsBase64(selectedFile, 5);
      setPreviewUrl(base64);
      setBase64Image(base64);
    } catch (err) {
      setError(err.message || "Failed to read template image.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!base64Image) {
      setError("Please select an image file to upload.");
      return;
    }

    if (!title.trim()) {
      setError("Please provide a title for this template.");
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      setSuccessMessage("");

      await templateApi.createTemplate({
        title: title.trim(),
        description: description.trim(),
        festivalId: festivalId || undefined,
        baseImageUrl: base64Image,
      });

      setSuccessMessage("Template uploaded & published successfully! 🎉");
      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    } catch (err) {
      logger.error("Template Upload Error", err);
      setError(err.response?.data?.message || err.message || "Failed to upload template.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-5 shadow-2xl my-auto text-slate-100">
        <div className="flex items-center justify-between border-b border-[#2C384E] pb-4">
          <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-400" />
            <span>Upload Admin Template</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <Alert variant="error" message={error} />}
        {successMessage && <Alert variant="success" message={successMessage} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Template Title"
            placeholder="e.g. Modern Real Estate Promo Background"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Associate with Festival (Optional)</label>
            <select
              value={festivalId}
              onChange={(e) => setFestivalId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="">General Brand Background (No Festival)</option>
              {festivals.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({new Date(f.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Short description of the template background..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Background Image (1080×1080 PNG/JPG)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
            />
          </div>

          {previewUrl && (
            <div className="mt-2 rounded-xl overflow-hidden border border-[#2C384E]">
              <img src={previewUrl} alt="Template Preview" className="w-full h-44 object-cover" />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2C384E]">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isUploading} icon={Sparkles}>
              Upload & Publish
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
