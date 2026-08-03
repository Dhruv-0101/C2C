import React, { useState, useEffect } from 'react';
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
      setError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setFile(selectedFile);
    setError('');

    // Generate local preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      setBase64Image(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!base64Image) {
      setError('Please select an image file to upload.');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccessMessage('');

    try {
      await templateApi.uploadAdminTemplate({
        base64Image,
        title: title || 'Festival Base Template',
        description,
        festivalId: festivalId || null,
      });

      setSuccessMessage('🎉 Base template uploaded to Cloudinary & linked successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to upload image to Cloudinary.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
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
              <div className="relative rounded-xl border border-slate-700 bg-slate-900 overflow-hidden group">
                <img
                  src={previewUrl}
                  alt="Template Preview"
                  className="w-full h-56 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                    setBase64Image(null);
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 hover:bg-red-600 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl bg-slate-900/60 cursor-pointer hover:bg-slate-900 transition-all text-center p-4">
                <ImageIcon className="w-10 h-10 text-amber-400 mb-2" />
                <span className="text-sm font-semibold text-white">Click or drag image file here</span>
                <span className="text-xs text-slate-400 mt-1">Supports PNG, JPG, WebP high quality templates</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Festival Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Link to Festival / Special Day
            </label>
            <select
              value={festivalId}
              onChange={(e) => setFestivalId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="">-- General / No Specific Festival --</option>
              {festivals.map((fest) => (
                <option key={fest.id} value={fest.id}>
                  {fest.name} ({new Date(fest.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <Input
            label="Template Title"
            id="template-title"
            placeholder="e.g. Diwali Grand Lights Banner #1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Deepawali festive greeting base background image."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isUploading} icon={Upload}>
              Upload to Cloudinary
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTemplateUploadModal;
