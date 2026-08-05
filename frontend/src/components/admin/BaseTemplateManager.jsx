import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileCode2,
  Plus,
  Upload,
  Trash2,
  Sparkles,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';
import { templateApi } from '../../services/template.api';
import { festivalApi } from '../../services/festival.api';
import { useTemplates } from '../../hooks/useTemplates';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { FeedbackModal } from '../common/FeedbackModal';
import Pagination from '../common/Pagination';
import { useFeedbackModal } from '../../hooks/useFeedbackModal';

export const BaseTemplateManager = () => {
  const queryClient = useQueryClient();
  const { modalProps, showSuccess, showError } = useFeedbackModal();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    festivalId: '',
    baseImageUrl: '',
  });

  // Pagination & Filter States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [search, setSearch] = useState('');
  const [selectedFestival, setSelectedFestival] = useState('');

  // Fetch Base Templates using central modular hook
  const {
    templates,
    meta: templateMeta,
    isLoading: isLoadingTemplates,
  } = useTemplates({
    page,
    limit,
    search,
    festivalId: selectedFestival,
  });

  // Fetch Festivals for dropdown selector
  const { data: festivalResponse } = useQuery({
    queryKey: ['allFestivals'],
    queryFn: () => festivalApi.getFestivals(),
  });

  const festivals = festivalResponse?.data?.festivals || [];

  // Handle local File Upload and convert to Base64 data URL
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, baseImageUrl: reader.result }));
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  // Create Template Mutation
  const createTemplateMutation = useMutation({
    mutationFn: (data) => templateApi.createTemplate(data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries(['templates']);
      setIsModalOpen(false);
      resetForm();
      showSuccess(
        'Base Template Published! 🎨',
        `Graphic background blueprint "${variables.title}" uploaded to Cloudinary and saved to database.`
      );
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to save system template.');
      showError('Upload Failed ⚠️', err.message || 'Failed to upload base template.');
    },
  });

  // Delete Template Mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => templateApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      showSuccess('Template Deleted 🗑️', 'Base graphic blueprint removed from database.');
    },
    onError: (err) => {
      showError('Delete Failed ⚠️', err.message || 'Failed to delete template.');
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#131B2A] border border-[#2C384E] p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-lg text-white">
              Master Graphic Base Templates Manager
            </h2>
            <p className="text-xs text-slate-400">
              Upload clean 1080x1080 graphic backgrounds that end-users composite with Canva-style transparent vector frames.
            </p>
          </div>
        </div>

        <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsModalOpen(true)}>
          Upload Base Graphic
        </Button>
      </div>

      {/* Filter and Template Grid Card */}
      <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-5">
        {/* Search & Festival Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search base templates by title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-sm focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="festival-filter" className="text-xs font-medium text-slate-400 whitespace-nowrap">
              Filter Festival:
            </label>
            <select
              id="festival-filter"
              value={selectedFestival}
              onChange={(e) => {
                setSelectedFestival(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="">All Templates</option>
              {festivals.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoadingTemplates ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading base templates...</div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-2xl space-y-3">
            <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-semibold text-sm">No base graphic templates found.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search criteria or click the button above to upload a new base template.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {templates.map((tpl) => (
                <Card
                  key={tpl.id}
                  className="p-3 border-[#2C384E] bg-[#0B0F17] hover:border-amber-500/50 transition group space-y-3 relative"
                >
                  {/* Image Preview Container */}
                  <div className="aspect-square rounded-xl bg-[#131B2A] overflow-hidden relative border border-[#2C384E]">
                    <img
                      src={tpl.baseImageUrl}
                      alt={tpl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {tpl.festival && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] uppercase shadow">
                        {tpl.festival.name}
                      </span>
                    )}
                  </div>

                  {/* Footer Meta Details */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="overflow-hidden pr-2">
                      <h4 className="font-heading font-bold text-xs text-white truncate">{tpl.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate">{tpl.description || 'System Graphic'}</p>
                    </div>
                    <button
                      onClick={() => deleteTemplateMutation.mutate(tpl.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white transition shrink-0"
                      title="Delete Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Central Modular Pagination */}
            <Pagination
              meta={templateMeta}
              onPageChange={(newPage) => setPage(newPage)}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              pageSizeOptions={[4, 8, 12, 24]}
            />
          </div>
        )}
      </Card>

      {/* Upload Base Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2C384E] pb-4">
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-400" />
                <span>Upload Base Graphic Template</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && <Alert variant="error" message={errorMsg} />}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Input
                label="Template Title"
                placeholder="e.g. Modern Real Estate Promo Background"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              {/* Associate with Festival Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Associate with Festival (Optional)</label>
                <select
                  value={formData.festivalId}
                  onChange={(e) => setFormData({ ...formData, festivalId: e.target.value })}
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

              {/* Upload Graphic Image Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Background Image (1080x1080 PNG/JPG)</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400"
                />
              </div>

              {/* Base64 Preview */}
              {formData.baseImageUrl && (
                <div className="aspect-square w-32 mx-auto rounded-xl bg-[#0B0F17] border border-amber-500/50 overflow-hidden relative shadow">
                  <img src={formData.baseImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 text-[9px] bg-emerald-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded">
                    Ready
                  </span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <Button type="button" variant="outline" className="w-full" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={createTemplateMutation.isPending}
                >
                  Upload & Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Global Feedback Modal */}
      <FeedbackModal {...modalProps} />
    </div>
  );
};

export default BaseTemplateManager;
