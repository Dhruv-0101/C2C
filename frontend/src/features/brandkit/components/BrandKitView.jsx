import React from "react";
import {
  Building2,
  Upload,
  Phone,
  Globe,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { SocialAccountsManager } from "../../social/components/SocialAccountsManager";

/**
 * BrandKitView
 * Pure Presentational Component rendering the Master BrandKit setup UI forms and upload preview zones.
 */
export const BrandKitView = ({
  isLoadingBrandKit,
  successMsg,
  errorMsg,
  register,
  errors,
  setValue,
  watch,
  categories,
  logoPreview,
  setLogoPreview,
  setBase64Logo,
  avatarPreview,
  setAvatarPreview,
  setBase64Avatar,
  handleLogoChange,
  handleAvatarChange,
  handleSubmit,
  isSaving,
}) => {
  const categoryIdValue = watch ? watch("categoryId") : "";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131B2A] border border-[#2C384E] p-6 sm:p-8 rounded-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Brand Identity Engine</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Configure Your <span className="text-gradient">Master BrandKit</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Save your business details, phone, logo, website, and social handles once. BrandFlow will automatically embed them into all generated social graphics!
          </p>
        </div>
      </div>

      {/* Social Accounts Management Section */}
      <SocialAccountsManager />

      {isLoadingBrandKit ? (
        <div className="p-16 text-center text-slate-400">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mb-3" />
          <p className="text-sm">Loading your Master BrandKit profile...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-6" noValidate>
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
                        if (setValue) setValue("logoUrl", "");
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
                    <span>{logoPreview ? "Change Logo Image" : "Upload Business Logo"}</span>
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
                  <p className="text-xs text-slate-400">
                    Supports transparent PNG, WebP, or high-res JPG. This logo will be automatically composited on your posts.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Photo Upload Zone */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Business Owner / Founder / Agent Photo (Circular Avatar)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-[#0B0F17] border border-dashed border-[#2C384E] hover:border-amber-500/50 transition">
                {avatarPreview ? (
                  <div className="relative w-24 h-24 rounded-full border-2 border-amber-500/80 overflow-hidden flex items-center justify-center p-1 group shrink-0">
                    <img src={avatarPreview} alt="Owner Avatar" className="w-full h-full object-cover rounded-full" />
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarPreview(null);
                        setBase64Avatar(null);
                        if (setValue) setValue("avatarUrl", "");
                      }}
                      className="absolute top-0 right-0 p-1 rounded-full bg-black/80 hover:bg-rose-600 text-white transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full border border-dashed border-slate-700 bg-slate-900 flex flex-col items-center justify-center text-slate-500 shrink-0">
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span className="text-[9px]">No Photo</span>
                  </div>
                )}

                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 font-semibold text-xs hover:bg-teal-500/20 transition">
                    <Upload className="w-4 h-4" />
                    <span>{avatarPreview ? "Change Profile Photo" : "Upload Profile Photo"}</span>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                  <p className="text-xs text-slate-400">
                    Owner, founder, agent, or professional headshot. This photo will be rendered in circular badges on post frames.
                  </p>
                </div>
              </div>
            </div>

            {/* Business Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Business / Brand Name"
                placeholder="e.g. Sunrise Real Estate"
                error={errors?.businessName?.message}
                {...register("businessName")}
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Business Category
                </label>
                <select
                  value={categoryIdValue}
                  onChange={(e) => setValue("categoryId", e.target.value)}
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
              error={errors?.tagline?.message}
              {...register("tagline")}
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
                error={errors?.phone?.message}
                {...register("phone")}
              />

              <Input
                label="WhatsApp Business Number"
                placeholder="e.g. +91 98765 43210"
                error={errors?.whatsapp?.message}
                {...register("whatsapp")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official Email Address"
                type="email"
                placeholder="contact@business.com"
                error={errors?.email?.message}
                {...register("email")}
              />

              <Input
                label="Website URL"
                placeholder="e.g. www.mybusiness.com"
                error={errors?.websiteUrl?.message}
                {...register("websiteUrl")}
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
                error={errors?.instagramHandle?.message}
                {...register("instagramHandle")}
              />

              <Input
                label="Facebook Page Handle"
                placeholder="fb.com/mybusiness"
                error={errors?.facebookHandle?.message}
                {...register("facebookHandle")}
              />
            </div>

            <Input
              label="Full Office / Store Address"
              placeholder="e.g. Shop #12, MG Road, Commercial Complex"
              error={errors?.address?.message}
              {...register("address")}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="City"
                placeholder="Mumbai"
                error={errors?.city?.message}
                {...register("city")}
              />

              <Input
                label="State"
                placeholder="Maharashtra"
                error={errors?.state?.message}
                {...register("state")}
              />

              <Input
                label="Country"
                placeholder="India"
                error={errors?.country?.message}
                {...register("country")}
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
              isLoading={isSaving}
            >
              Save AI BrandKit
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
