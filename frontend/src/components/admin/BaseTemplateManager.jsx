import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Calendar,
  Layers,
  CheckCircle2,
  X,
  Sliders,
  Eye,
  Palette,
  FileCheck,
  Zap,
} from 'lucide-react';
import { templateApi } from '../../services/template.api';
import { festivalApi } from '../../services/festival.api';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';

export const BaseTemplateManager = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State for Custom System Template Upload
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    festivalId: '',
    baseImageUrl: '',
  });

  // Fetch Templates
  const { data: templateResponse, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templateApi.getTemplates(),
  });

  // Fetch Festivals
  const { data: festivalResponse } = useQuery({
    queryKey: ['festivals'],
    queryFn: () => festivalApi.getFestivals(),
  });

  const templates = templateResponse?.data?.templates || [];
  const festivals = festivalResponse?.data?.festivals || [];

  // Handle local system file upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, baseImageUrl: reader.result }));
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  // Create Template Mutation
  const createTemplateMutation = useMutation({
    mutationFn: (data) => templateApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to save system template.');
    },
  });

  // Delete Template Mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => templateApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      festivalId: '',
      baseImageUrl: '',
    });
    setErrorMsg('');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.baseImageUrl) {
      setErrorMsg('Please enter a template title and upload an image from your computer.');
      return;
    }

    createTemplateMutation.mutate(formData);
  };

  return (
    <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C384E] pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-xl text-white">System Templates Studio</h2>
            <p className="text-xs text-slate-400">
              Upload custom template graphics directly from your computer system and set Sharp compositing anchors for end-users.
            </p>
          </div>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Upload System Template
        </Button>
      </div>

      {/* Grid of Templates */}
      {isLoadingTemplates ? (
        <div className="p-8 text-center text-slate-400 text-sm">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-[#2C384E] rounded-xl text-slate-400 text-sm space-y-3">
          <p>No system templates uploaded yet.</p>
          <Button variant="primary" icon={Upload} onClick={() => setIsModalOpen(true)}>
            Upload Template from System
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-2xl bg-[#0B0F17] border border-[#2C384E] overflow-hidden hover:border-amber-500/50 transition group flex flex-col justify-between"
            >
              <div className="relative aspect-square w-full bg-slate-900 overflow-hidden">
                <img
                  src={tpl.baseImageUrl}
                  alt={tpl.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider">
                      {tpl.festival?.name || 'General Template'}
                    </span>

                    <button
                      onClick={() => deleteTemplateMutation.mutate(tpl.id)}
                      className="p-1.5 text-white/70 hover:text-rose-400 bg-black/50 hover:bg-rose-500/20 rounded-lg transition"
                      title="Delete Template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-heading font-extrabold text-base text-white drop-shadow-md">{tpl.title}</h3>
                </div>
              </div>

              <div className="p-4 border-t border-[#2C384E] bg-[#131B2A] flex items-center justify-between text-xs text-slate-400">
                <span className="truncate">
                  {tpl.description || 'Base Image Template'}
                </span>
                <span className="font-mono text-[10px] text-amber-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Cloudinary Ready
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload System Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-3xl bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#2C384E] pb-4">
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-400" />
                <span>Upload Template from Computer System</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && <Alert variant="error" message={errorMsg} />}

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Basic Metadata */}
              <Input
                label="Template Title"
                placeholder="e.g. Raksha Bandhan Festive Special Graphic"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <Input
                label="Description (Optional)"
                placeholder="Short description of this template..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              {/* SYSTEM IMAGE UPLOAD ZONE */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <ImageIcon className="w-4 h-4" /> Upload Template File from Computer
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-[#0B0F17] border border-dashed border-[#2C384E] hover:border-amber-500/50 transition">
                  <label className="cursor-pointer flex items-center justify-center px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs hover:bg-amber-500/20 transition gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Choose System File</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>

                  <span className="text-xs text-slate-400 font-mono">OR enter Image URL:</span>

                  <input
                    type="url"
                    placeholder="https://example.com/template-graphic.png"
                    value={formData.baseImageUrl.startsWith('data:') ? '' : formData.baseImageUrl}
                    onChange={(e) => setFormData({ ...formData, baseImageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#131B2A] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Context Selector (Festival / Day Only) */}
              <div className="pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Attach to Festival / Day</label>
                  <select
                    value={formData.festivalId}
                    onChange={(e) => setFormData({ ...formData, festivalId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="">None (General)</option>
                    {festivals.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Template Image Canvas Preview */}
              {formData.baseImageUrl && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Eye className="w-4 h-4" /> Uploaded Template Graphic Preview
                    </label>
                  </div>

                  <div className="relative aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
                    <img src={formData.baseImageUrl} alt="Uploaded Custom Template" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center gap-3">
                <Button type="button" variant="outline" className="w-full" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={createTemplateMutation.isPending}
                  isDisabled={!formData.title.trim() || !formData.baseImageUrl}
                >
                  Save System Template
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};
