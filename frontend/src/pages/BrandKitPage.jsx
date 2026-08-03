import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Upload,
  Phone,
  Globe,
  Instagram,
  Facebook,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { brandKitApi } from '../services/brandkit.api';
import { categoryApi } from '../services/category.api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';

export const BrandKitPage = () => {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const [base64Logo, setBase64Logo] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    businessName: '',
    categoryId: '',
    tagline: '',
    phone: '',
    whatsapp: '',
    email: '',
    websiteUrl: '',
    instagramHandle: '',
    facebookHandle: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    logoUrl: '',
  });

  // Fetch Existing BrandKit
  const { data: brandKitResponse, isLoading: isLoadingBrandKit } = useQuery({
    queryKey: ['brandKit'],
    queryFn: () => brandKitApi.getBrandKit(),
  });

  // Fetch Business Categories
  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
  });

  const categories = categoriesResponse?.data?.categories || [];

  // Populate form when data is loaded
  useEffect(() => {
    if (brandKitResponse?.data?.brandKit) {
      const bk = brandKitResponse.data.brandKit;
      setFormData({
        businessName: bk.businessName || '',
        categoryId: bk.categoryId || '',
        tagline: bk.tagline || '',
        phone: bk.phone || '',
        whatsapp: bk.whatsapp || '',
        email: bk.email || '',
        websiteUrl: bk.websiteUrl || '',
        instagramHandle: bk.instagramHandle || '',
        facebookHandle: bk.facebookHandle || '',
        address: bk.address || '',
        city: bk.city || '',
        state: bk.state || '',
        country: bk.country || 'India',
        logoUrl: bk.logoUrl || '',
      });
      if (bk.logoUrl) {
        setLogoPreview(bk.logoUrl);
      }
    }
  }, [brandKitResponse]);

  // Handle Logo Upload
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file for your brand logo.');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
      setBase64Logo(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Save BrandKit Mutation
  const saveBrandKitMutation = useMutation({
    mutationFn: (data) => brandKitApi.updateBrandKit(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['brandKit']);
      setSuccessMsg('🎉 AI BrandKit saved successfully! All future posts will be branded automatically.');
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 5000);
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to save AI BrandKit.');
      setSuccessMsg('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.businessName.trim()) {
      setErrorMsg('Please enter your business or brand name.');
      return;
    }

    saveBrandKitMutation.mutate({
      ...formData,
      base64Logo: base64Logo || undefined,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131B2A] border border-[#2C384E] p-6 sm:p-8 rounded-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Brand Identity Engine</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Configure Your <span className="text-gradient">AI BrandKit</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Save your business details, phone, logo, website, and social handles once. BrandFlow will automatically embed them into all generated social graphics!
          </p>
        </div>
      </div>

      {isLoadingBrandKit ? (
        <div className="p-16 text-center text-slate-400">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mb-3" />
          <p className="text-sm">Loading your AI BrandKit profile...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
          {errorMsg && <Alert variant="error" message={errorMsg} />}
          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: Business Logo & Basic Info */}
          <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-6">
            <h3 className="font-heading font-bold text-lg text-white border-b border-[#2C384E] pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>1. Business Logo & Basic Identity</span>
            </h3>

            {/* Logo Upload Zone */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Official Business Logo
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-[#0B0F17] border border-dashed border-[#2C384E] hover:border-amber-500/50 transition">
                {logoPreview ? (
                  <div className="relative w-28 h-28 rounded-xl border border-slate-700 bg-slate-900 overflow-hidden flex items-center justify-center p-2 group shrink-0">
                    <img src={logoPreview} alt="Brand Logo" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview(null);
                        setBase64Logo(null);
                        setFormData((prev) => ({ ...prev, logoUrl: '' }));
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/80 hover:bg-rose-600 text-white transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-xl border border-dashed border-slate-700 bg-slate-900 flex flex-col items-center justify-center text-slate-500 shrink-0">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="text-[10px]">No Logo</span>
                  </div>
                )}

                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-xs hover:bg-amber-500/20 transition">
                    <Upload className="w-4 h-4" />
                    <span>{logoPreview ? 'Change Logo Image' : 'Upload Business Logo (Cloudinary)'}</span>
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
                  <p className="text-xs text-slate-400">
                    Supports transparent PNG, WebP, or high-res JPG. This logo will be automatically composited on your posts.
                  </p>
                </div>
              </div>
            </div>

            {/* Business Name & Tagline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Business / Brand Name"
                placeholder="e.g. Sunrise Real Estate"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Business Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Slogan / Tagline (Optional)"
              placeholder="e.g. Quality & Trust Since 1998"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            />
          </Card>

          {/* Section 2: Contact Info & Website */}
          <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-6">
            <h3 className="font-heading font-bold text-lg text-white border-b border-[#2C384E] pb-3 flex items-center gap-2">
              <Phone className="w-5 h-5 text-amber-400" />
              <span>2. Contact Details & Website</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Phone Number"
                placeholder="e.g. +91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <Input
                label="WhatsApp Business Number"
                placeholder="e.g. +91 98765 43210"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official Email Address"
                type="email"
                placeholder="contact@business.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <Input
                label="Website URL"
                placeholder="e.g. www.mybusiness.com"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              />
            </div>
          </Card>

          {/* Section 3: Social Media Handles & Address */}
          <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-6">
            <h3 className="font-heading font-bold text-lg text-white border-b border-[#2C384E] pb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-400" />
              <span>3. Social Media & Address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Instagram Handle"
                placeholder="@mybusiness"
                value={formData.instagramHandle}
                onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
              />

              <Input
                label="Facebook Page Handle"
                placeholder="fb.com/mybusiness"
                value={formData.facebookHandle}
                onChange={(e) => setFormData({ ...formData, facebookHandle: e.target.value })}
              />
            </div>

            <Input
              label="Full Office / Store Address"
              placeholder="e.g. Shop #12, MG Road, Commercial Complex"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="City"
                placeholder="Mumbai"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />

              <Input
                label="State"
                placeholder="Maharashtra"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />

              <Input
                label="Country"
                placeholder="India"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
          </Card>

          {/* Submit Bar */}
          <div className="flex items-center justify-end gap-4 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={Sparkles}
              isLoading={saveBrandKitMutation.isPending}
            >
              Save AI BrandKit
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BrandKitPage;
