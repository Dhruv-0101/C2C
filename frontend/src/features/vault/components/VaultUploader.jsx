import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, FileImage, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

/**
 * VaultUploader
 * Drag-and-drop file upload zone for custom brand media & graphics
 */
export const VaultUploader = ({ onUploadSuccess, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WebP, SVG).');
      return;
    }
    setError(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);
    try {
      // Mock upload or call upload handler
      if (onUploadSuccess) {
        await onUploadSuccess(selectedFile);
      }
      handleClear();
    } catch (err) {
      setError(err?.message || 'Failed to upload asset.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`p-6 rounded-2xl bg-[#0B0F17] border border-[#2C384E] space-y-4 ${className}`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-amber-400 bg-amber-500/5'
            : 'border-slate-700 hover:border-slate-500 bg-slate-900/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        
        {previewUrl ? (
          <div className="space-y-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-48 mx-auto rounded-xl object-contain shadow-lg border border-slate-700"
            />
            <p className="text-xs text-slate-300 font-semibold">{selectedFile?.name}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Click or drag & drop media to upload
              </p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG, WebP, SVG up to 10MB</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {selectedFile && (
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={handleClear} disabled={isUploading}>
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleUpload}
            isLoading={isUploading}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
          >
            Upload to Vault
          </Button>
        </div>
      )}
    </div>
  );
};

export default VaultUploader;
