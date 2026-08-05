import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Upload, X, Check, Image as ImageIcon, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { templateApi } from '../../services/template.api';
import { festivalApi } from '../../services/festival.api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';

export const AdminTemplateUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [festivalId, setFestivalId] = useState('');
  const [festivals, setFestivals] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
      console.error('Failed to load festivals list:', err);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setBase64Image(null);
    setTitle('');
    setDescription('');
    setFestivalId('');
    setError('');
    setSuccessMessage('');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));

    const reader = new FileReader();
    reader.onloadend = () => {
      setBase64Image(reader.result);
      setError('');
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!base64Image) {
      setError('Please select an image file to upload.');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a title for this template.');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      setSuccessMessage('');

      await templateApi.createTemplate({
        title: title.trim(),
        description: description.trim(),
        festivalId: festivalId || undefined,
        baseImageUrl: base64Image,
      });

      setSuccessMessage('🎉 Template uploaded successfully to Cloudinary!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Upload Error:', err);
      setError(err.message || 'Failed to upload template. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#131B2A] border border-[#2C384E] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F17]/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Upload Base Festival Template</h3>
              <p className="text-xs text-slate-400">Admin Cloudinary Image Upload (No upload limits)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <Alert variant="error" title="Upload Failed" message={error} />}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* File Upload / Preview Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Base Festival Image (Cloudinary)
            </label>

            {previewUrl ? (
              <div className="relative aspect-square w-full max-w-xs mx-auto rounded-xl bg-[#0B0F17] border border-[#2C384E] overflow-hidden group">
                <img src={previewUrl} alt="Upload Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                    setBase64Image(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#2C384E] rounded-xl bg-[#0B0F17]/40 hover:bg-[#0B0F17] hover:border-amber-500/50 cursor-pointer transition">
                <ImageIcon className="w-10 h-10 text-slate-500 mb-2" />
                <p className="text-sm font-bold text-slate-200">Click to select image file</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          <Input
            label="Template Title"
            placeholder="e.g. Happy Independence Day Graphic Base"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Target Festival (Optional)
            </label>
            <select
              value={festivalId}
              onChange={(e) => setFestivalId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="">General (No specific festival)</option>
              {festivals.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({new Date(f.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Modern gold background graphic for SMB celebration posts..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} isDisabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Sparkles} isLoading={isUploading}>
              Upload to Cloudinary
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
