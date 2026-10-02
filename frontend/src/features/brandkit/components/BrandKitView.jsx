import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Upload,
  Phone,
  Globe,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  X,
  Bot,
  QrCode,
  Share2,
  Clock,
  Check,
  Plus,
  Tag,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  Users,
  Mail,
  MapPin,
  Instagram,
  Star,
  MessageSquare,
  Layers,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { SearchBar } from "@/components/ui/SearchBar";
import { SkeletonForm } from "@/components/feedback/SkeletonLoader";

// Curated high-converting target audiences for small businesses
export const PRESET_AUDIENCES = [
  "Local Walk-ins & Neighbors",
  "Families & Parents",
  "Working Professionals (25-45)",
  "Youth & Gen-Z (18-25)",
  "Small Business Owners & MSMEs",
  "B2B Corporates & Clients",
  "Homeowners & Property Seekers",
  "Foodies & Dining Lovers",
  "Fitness & Health Enthusiasts",
  "Fashion & Lifestyle Shoppers",
  "Tech Enthusiasts & Founders",
  "Senior Citizens & Elders",
  "Budget & Deal Seekers",
  "Luxury & High-End Buyers",
];

// Curated high-converting business USPs / Key Features
export const PRESET_USPS = [
  "100% Genuine & Authentic",
  "Best Quality Guaranteed",
  "Affordable & Best Market Rates",
  "Fast & Free Doorstep Delivery",
  "24x7 Customer Support",
  "100% Organic & Chemical-Free",
  "Handcrafted & Artisanal",
  "ISO Certified & Verified",
  "Trusted Since 10+ Years",
  "Special Festive Offers & Discounts",
  "Easy 7-Day Returns & Exchange",
  "Money-Back Guarantee",
  "Free Expert Consultation",
  "Locally Owned & Family Operated",
];

// All 11 Supported Regional & National Indian Caption Languages
export const CAPTION_LANGUAGES = [
  { id: "English", label: "English", flag: "🇬🇧", desc: "Global & Professional Tone" },
  { id: "Hinglish", label: "Hinglish", flag: "🇮🇳", desc: "Urban, Viral & Relatable" },
  { id: "Hindi", label: "Hindi", flag: "🟧", desc: "Cultural & Shuddh Hindi" },
  { id: "Gujarati", label: "Gujarati", flag: "🟠", desc: "Commerce & Regional Pride" },
  { id: "Marathi", label: "Marathi", flag: "🚩", desc: "Maharashtra Regional Tone" },
  { id: "Bengali", label: "Bengali", flag: "🟣", desc: "Artistic & Bengal Regional" },
  { id: "Tamil", label: "Tamil", flag: "🟡", desc: "Tamil Nadu Regional" },
  { id: "Telugu", label: "Telugu", flag: "🔵", desc: "Andhra & Telangana Regional" },
  { id: "Kannada", label: "Kannada", flag: "🟢", desc: "Karnataka Regional" },
  { id: "Malayalam", label: "Malayalam", flag: "🟤", desc: "Kerala Regional" },
  { id: "Punjabi", label: "Punjabi", flag: "🔶", desc: "Vibrant & Punjab Regional" },
];

// Navigation Tabs Configuration (Consistent with BrandFlow theme)
const TABS = [
  { id: "identity", label: "Identity & Niche", icon: Building2 },
  { id: "ai", label: "AI Copywriting", icon: Bot },
  { id: "contact", label: "Contact & Location", icon: Phone },
  { id: "social", label: "Social Media", icon: Share2 },
  { id: "assets", label: "Visual Assets & QR", icon: Upload },
  { id: "all", label: "All Sections", icon: Layers },
];

/**
 * BrandKitView
 * Consistent BrandFlow UI:
 * - Purely clean form with ZERO prefilled defaults
 * - 100% symmetrical visual asset upload cards (Logo, Avatar, QR Code) with UPI VPA input below
 * - Unified #131B2A card backgrounds & #2C384E borders
 * - Preserves all UX, form bindings, and file upload functionality
 */
export const BrandKitView = ({
  isLoadingBrandKit,
  successMsg,
  scheduledNotice,
  onDismissNotice,
  navigate,
  errorMsg,
  register,
  errors,
  setValue,
  watch,
  // Scalable Category Picker
  categories = [],
  categoryMeta,
  isLoadingCategories,
  categorySearch,
  setCategorySearch,
  categoryPage,
  setCategoryPage,
  isCategoryModalOpen,
  setIsCategoryModalOpen,
  selectedCategoryObj,
  handleSelectCategory,
  // Assets Upload Props
  logoPreview,
  setLogoPreview,
  setLogoFile,
  avatarPreview,
  setAvatarPreview,
  setAvatarFile,
  upiQrPreview,
  setUpiQrPreview,
  setUpiQrFile,
  handleLogoChange,
  handleAvatarChange,
  handleUpiQrChange,
  handleSubmit,
  isSaving,
}) => {
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState("identity");

  // Watched Form Values
  const businessNameValue = watch ? watch("businessName") : "";
  const categoryIdValue = watch ? watch("categoryId") : "";
  const taglineValue = watch ? watch("tagline") : "";
  const phoneValue = watch ? watch("phone") : "";
  const whatsappValue = watch ? watch("whatsapp") : "";
  const emailValue = watch ? watch("email") : "";
  const workingHoursValue = watch ? watch("workingHours") : "";
  const addressValue = watch ? watch("address") : "";
  const cityValue = watch ? watch("city") : "";
  const stateValue = watch ? watch("state") : "";
  const countryValue = watch ? watch("country") : "";
  const instagramHandleValue = watch ? watch("instagramHandle") : "";
  const facebookHandleValue = watch ? watch("facebookHandle") : "";
  const linkedinHandleValue = watch ? watch("linkedinHandle") : "";
  const gmbReviewUrlValue = watch ? watch("gmbReviewUrl") : "";
  const upiVpaValue = watch ? watch("upiVpa") : "";
  const captionLangValue = watch ? watch("captionLanguage") : "";
  const rawTargetAudience = watch ? watch("targetAudience") : "";
  const rawBusinessUsps = watch ? watch("businessUsps") : "";


  // -------------------------------------------------------------
  // Target Audience Interactive Multi-Select & "Other" State
  // -------------------------------------------------------------
  const [customAudienceInput, setCustomAudienceInput] = useState("");
  const [showCustomAudienceField, setShowCustomAudienceField] = useState(false);

  const parsedAudiences = useMemo(() => {
    if (!rawTargetAudience || typeof rawTargetAudience !== "string") return [];
    return rawTargetAudience
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [rawTargetAudience]);

  const { activePresetAudiences, customAudiences } = useMemo(() => {
    const activePresets = [];
    const customs = [];
    parsedAudiences.forEach((aud) => {
      const match = PRESET_AUDIENCES.find(
        (p) => p.toLowerCase() === aud.toLowerCase()
      );
      if (match) {
        activePresets.push(match);
      } else {
        customs.push(aud);
      }
    });
    return { activePresetAudiences: activePresets, customAudiences: customs };
  }, [parsedAudiences]);

  useEffect(() => {
    if (customAudiences.length > 0) {
      setShowCustomAudienceField(true);
    }
  }, [customAudiences.length]);

  const handleTogglePresetAudience = (preset) => {
    let updated;
    if (activePresetAudiences.includes(preset)) {
      updated = parsedAudiences.filter(
        (a) => a.toLowerCase() !== preset.toLowerCase()
      );
    } else {
      updated = [...parsedAudiences, preset];
    }
    setValue("targetAudience", updated.join(", "), { shouldDirty: true });
  };

  const handleAddCustomAudience = () => {
    const trimmed = customAudienceInput.trim();
    if (!trimmed) return;
    if (!parsedAudiences.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...parsedAudiences, trimmed];
      setValue("targetAudience", updated.join(", "), { shouldDirty: true });
    }
    setCustomAudienceInput("");
  };

  const handleRemoveCustomAudience = (tagToRemove) => {
    const updated = parsedAudiences.filter(
      (a) => a.toLowerCase() !== tagToRemove.toLowerCase()
    );
    setValue("targetAudience", updated.join(", "), { shouldDirty: true });
  };

  // -------------------------------------------------------------
  // Business USPs Interactive Multi-Select & "Other" State
  // -------------------------------------------------------------
  const [customUspInput, setCustomUspInput] = useState("");
  const [showCustomUspField, setShowCustomUspField] = useState(false);

  const parsedUsps = useMemo(() => {
    if (!rawBusinessUsps || typeof rawBusinessUsps !== "string") return [];
    return rawBusinessUsps
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [rawBusinessUsps]);

  const { activePresetUsps, customUsps } = useMemo(() => {
    const activePresets = [];
    const customs = [];
    parsedUsps.forEach((usp) => {
      const match = PRESET_USPS.find(
        (p) => p.toLowerCase() === usp.toLowerCase()
      );
      if (match) {
        activePresets.push(match);
      } else {
        customs.push(usp);
      }
    });
    return { activePresetUsps: activePresets, customUsps: customs };
  }, [parsedUsps]);

  useEffect(() => {
    if (customUsps.length > 0) {
      setShowCustomUspField(true);
    }
  }, [customUsps.length]);

  const handleTogglePresetUsp = (preset) => {
    let updated;
    if (activePresetUsps.includes(preset)) {
      updated = parsedUsps.filter(
        (u) => u.toLowerCase() !== preset.toLowerCase()
      );
    } else {
      updated = [...parsedUsps, preset];
    }
    setValue("businessUsps", updated.join(", "), { shouldDirty: true });
  };

  const handleAddCustomUsp = () => {
    const trimmed = customUspInput.trim();
    if (!trimmed) return;
    if (!parsedUsps.some((u) => u.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...parsedUsps, trimmed];
      setValue("businessUsps", updated.join(", "), { shouldDirty: true });
    }
    setCustomUspInput("");
  };

  const handleRemoveCustomUsp = (tagToRemove) => {
    const updated = parsedUsps.filter(
      (u) => u.toLowerCase() !== tagToRemove.toLowerCase()
    );
    setValue("businessUsps", updated.join(", "), { shouldDirty: true });
  };

  // -------------------------------------------------------------
  // Category Display Helper
  // -------------------------------------------------------------
  const totalCategoryPages = categoryMeta?.totalPages || 1;
  const currentCategoryDisplay =
    selectedCategoryObj?.name ||
    categories.find((c) => c.id === categoryIdValue)?.name;

  // Wizard tab next/prev helpers
  const tabKeys = ["identity", "ai", "contact", "social", "assets"];
  const currentTabIndex = tabKeys.indexOf(activeTab);
  const nextTabKey = currentTabIndex !== -1 && currentTabIndex < tabKeys.length - 1 ? tabKeys[currentTabIndex + 1] : null;
  const prevTabKey = currentTabIndex > 0 ? tabKeys[currentTabIndex - 1] : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 animate-in fade-in duration-300">
      {/* ========================================================= */}
      {/* 1. HERO HEADER                                            */}
      {/* ========================================================= */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[#2C384E] bg-gradient-to-r from-[#131B2A] via-[#1a2538] to-[#0B0F17] shadow-xl">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>AI Brand Identity Engine</span>
          </div>

          <h1 className="font-heading font-extrabold text-xl sm:text-2xl lg:text-3xl text-white">
            Configure Your <span className="text-amber-400">BrandKit</span>
          </h1>

          <p className="text-xs text-slate-300 leading-relaxed">
            Set up your brand profile, AI copywriting voice, contact coordinates, and visual assets.
            Everything entered here automatically brands your social media posts and templates.
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. ALERTS & NOTIFICATIONS                                 */}
      {/* ========================================================= */}
      {errorMsg && <Alert variant="error" message={errorMsg} />}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {scheduledNotice && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#1a2538] to-[#131B2A] border border-amber-500/40 space-y-3 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  BrandKit Saved & Scheduled Posts Preserved
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-semibold border border-amber-500/30">
                    {scheduledNotice.count} Post{scheduledNotice.count > 1 ? "s" : ""} Scheduled
                  </span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {scheduledNotice.message}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onDismissNotice}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate("/calendar")}
              className="text-xs"
            >
              Go to Calendar & Scheduled Posts
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onDismissNotice}
              className="text-xs"
            >
              Keep Existing Layouts & Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. HORIZONTAL NAVIGATION TABS                             */}
      {/* ========================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 p-1.5 rounded-2xl bg-[#131B2A] border border-[#2C384E] custom-scrollbar shadow-inner">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "bg-transparent text-slate-300 hover:text-white hover:bg-[#1A2538]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-amber-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 4. FORM BODY                                              */}
      {/* ========================================================= */}
      {isLoadingBrandKit ? (
        <SkeletonForm fields={8} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* TAB 1: IDENTITY & NICHE */}
          {(activeTab === "identity" || activeTab === "all") && (
            <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-6 rounded-2xl shadow-xl">
              <div className="border-b border-[#2C384E] pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-white">
                      1. Business Identity & Industry Niche
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Define your brand name, trade category, and official business slogan.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full hidden sm:inline">
                  Step 1 of 5
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Business / Brand Name"
                  placeholder="Enter business or brand name"
                  icon={Building2}
                  error={errors?.businessName?.message}
                  {...register("businessName")}
                />

                {/* Scalable Business Category Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Business Category
                  </label>

                  {currentCategoryDisplay ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F17] border border-amber-500/40 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                          <FolderKanban className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-white truncate text-xs">
                            {currentCategoryDisplay}
                          </p>
                          <p className="text-[10px] text-amber-400 font-mono">
                            Selected Category
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsCategoryModalOpen(true)}
                          className="text-[11px] py-1 px-2.5"
                        >
                          Change
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleSelectCategory(null)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Clear Category"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="w-full p-2.5 rounded-xl border border-dashed border-[#2C384E] hover:border-amber-500/50 bg-[#0B0F17] transition flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 hover:text-amber-400 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>Select Business Category (1,000+ Categories)</span>
                    </button>
                  )}
                  <input type="hidden" {...register("categoryId")} />
                </div>
              </div>

              {/* Tagline / Business Slogan */}
              <div>
                <Input
                  label="Official Slogan / Brand Tagline (Optional)"
                  placeholder="Enter official slogan or brand tagline (optional)"
                  icon={Sparkles}
                  error={errors?.tagline?.message}
                  {...register("tagline")}
                />
              </div>
            </Card>
          )}

          {/* TAB 2: AI COPYWRITING */}
          {(activeTab === "ai" || activeTab === "all") && (
            <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-6 rounded-2xl shadow-xl">
              <div className="border-b border-[#2C384E] pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-white">
                      2. AI Copywriting Profile & Voice
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Demographic targeting, preferred caption language, and key selling propositions.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full hidden sm:inline">
                  Step 2 of 5
                </span>
              </div>

              {/* A. Target Audience Interactive Chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                      Target Audience (Select Applicable Demographics)
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Click to choose the audience demographics that best describe your buyers.
                    </p>
                  </div>
                  {parsedAudiences.length > 0 && (
                    <span className="text-[11px] text-amber-400 font-bold bg-[#0B0F17] px-2.5 py-1 rounded-lg border border-[#2C384E]">
                      {parsedAudiences.length} Selected
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E]">
                  {PRESET_AUDIENCES.map((audience) => {
                    const isSelected = activePresetAudiences.includes(audience);
                    return (
                      <button
                        key={audience}
                        type="button"
                        onClick={() => handleTogglePresetAudience(audience)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 cursor-pointer border ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-sm"
                            : "bg-[#131B2A] border-[#2C384E] text-slate-300 hover:text-white hover:border-slate-500"
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span>{audience}</span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setShowCustomAudienceField((prev) => !prev)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border ${
                      showCustomAudienceField || customAudiences.length > 0
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-sm"
                        : "bg-[#131B2A] border-[#2C384E] text-slate-300 hover:text-white hover:border-amber-400"
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span>+ Other (Custom Audience)</span>
                  </button>
                </div>

                {/* Custom Audience Tag Input */}
                {showCustomAudienceField && (
                  <div className="p-3 rounded-xl bg-[#131B2A] border border-[#2C384E] space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customAudienceInput}
                        onChange={(e) => setCustomAudienceInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomAudience();
                          }
                        }}
                        placeholder="Type custom audience and press Enter..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddCustomAudience}
                        className="text-xs shrink-0 py-1.5"
                      >
                        Add Tag
                      </Button>
                    </div>

                    {customAudiences.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {customAudiences.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-medium"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomAudience(tag)}
                              className="text-amber-400 hover:text-white cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <input type="hidden" {...register("targetAudience")} />
              </div>

              {/* B. Default AI Caption Language (Flag Grid Cards) */}
              <div className="space-y-2 pt-3 border-t border-[#2C384E]">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                      Default AI Caption Language (11 Regional & National Options)
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      The AI Caption Generator will craft captions in this selected language by default.
                    </p>
                  </div>
                  {captionLangValue && (
                    <button
                      type="button"
                      onClick={() => setValue("captionLanguage", "", { shouldDirty: true })}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer underline"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {CAPTION_LANGUAGES.map((lang) => {
                    const isSelected =
                      captionLangValue &&
                      captionLangValue.toLowerCase() === lang.id.toLowerCase();
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() =>
                          setValue("captionLanguage", lang.id, { shouldDirty: true })
                        }
                        className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/50"
                            : "bg-[#0B0F17] border-[#2C384E] text-slate-400 hover:text-white hover:border-slate-500 hover:bg-[#1A2538]"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-lg">{lang.flag}</span>
                          <div className="truncate">
                            <p className={`text-xs font-bold truncate ${isSelected ? "text-amber-400" : "text-white"}`}>
                              {lang.label}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {lang.desc}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <input type="hidden" {...register("captionLanguage")} />
              </div>

              {/* C. Business USPs & Highlights */}
              <div className="space-y-2 pt-3 border-t border-[#2C384E]">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                      Business USPs & Key Features (AI Highlights - Optional)
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Optional: Select key selling propositions highlighted in promotional copy.
                    </p>
                  </div>
                  {parsedUsps.length > 0 && (
                    <span className="text-[11px] text-amber-400 font-bold bg-[#0B0F17] px-2.5 py-1 rounded-lg border border-[#2C384E]">
                      {parsedUsps.length} Selected
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E]">
                  {PRESET_USPS.map((usp) => {
                    const isSelected = activePresetUsps.includes(usp);
                    return (
                      <button
                        key={usp}
                        type="button"
                        onClick={() => handleTogglePresetUsp(usp)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 cursor-pointer border ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-sm"
                            : "bg-[#131B2A] border-[#2C384E] text-slate-300 hover:text-white hover:border-slate-500"
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span>{usp}</span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setShowCustomUspField((prev) => !prev)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border ${
                      showCustomUspField || customUsps.length > 0
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-sm"
                        : "bg-[#131B2A] border-[#2C384E] text-slate-300 hover:text-white hover:border-amber-400"
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span>+ Other (Custom USP)</span>
                  </button>
                </div>

                {/* Custom USP Tag Input */}
                {showCustomUspField && (
                  <div className="p-3 rounded-xl bg-[#131B2A] border border-[#2C384E] space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customUspInput}
                        onChange={(e) => setCustomUspInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomUsp();
                          }
                        }}
                        placeholder="Type custom USP and press Enter..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddCustomUsp}
                        className="text-xs shrink-0 py-1.5"
                      >
                        Add Custom
                      </Button>
                    </div>

                    {customUsps.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {customUsps.map((usp) => (
                          <span
                            key={usp}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-medium"
                          >
                            <span>{usp}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomUsp(usp)}
                              className="text-amber-400 hover:text-white cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <input type="hidden" {...register("businessUsps")} />
              </div>
            </Card>
          )}

          {/* TAB 3: CONTACT & LOCATION */}
          {(activeTab === "contact" || activeTab === "all") && (
            <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-6 rounded-2xl shadow-xl">
              <div className="border-b border-[#2C384E] pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-white">
                      3. Contact Details & Operating Hours
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Official phone, WhatsApp, email address, store timing, and physical location.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full hidden sm:inline">
                  Step 3 of 5
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Primary Phone Number"
                  placeholder="Enter primary phone number"
                  icon={Phone}
                  error={errors?.phone?.message}
                  {...register("phone")}
                />

                <Input
                  label="WhatsApp Business Number"
                  placeholder="Enter WhatsApp business number"
                  icon={MessageSquare}
                  error={errors?.whatsapp?.message}
                  {...register("whatsapp")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Official Email Address"
                  type="email"
                  placeholder="Enter official email address"
                  icon={Mail}
                  error={errors?.email?.message}
                  {...register("email")}
                />

                <Input
                  label="Working Hours / Store Timing"
                  placeholder="Enter store timings (e.g. Mon - Sat: 10:00 AM - 9:00 PM)"
                  icon={Clock}
                  error={errors?.workingHours?.message}
                  {...register("workingHours")}
                />
              </div>

              <div>
                <Input
                  label="Full Office / Store Address"
                  placeholder="Enter full office or store address"
                  icon={MapPin}
                  error={errors?.address?.message}
                  {...register("address")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="City"
                  placeholder="Enter city"
                  error={errors?.city?.message}
                  {...register("city")}
                />

                <Input
                  label="State"
                  placeholder="Enter state"
                  error={errors?.state?.message}
                  {...register("state")}
                />

                <Input
                  label="Country"
                  placeholder="Enter country"
                  icon={Globe}
                  error={errors?.country?.message}
                  {...register("country")}
                />
              </div>
            </Card>
          )}

          {/* TAB 4: SOCIAL MEDIA */}
          {(activeTab === "social" || activeTab === "all") && (
            <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-6 rounded-2xl shadow-xl">
              <div className="border-b border-[#2C384E] pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-white">
                      4. Social Media Handles & Reviews
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Public profile handles and Google review link to embed on published graphics.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full hidden sm:inline">
                  Step 4 of 5
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Instagram Username (Optional)"
                  placeholder="Enter Instagram handle (e.g. @yourbrand)"
                  icon={Instagram}
                  error={errors?.instagramHandle?.message}
                  {...register("instagramHandle")}
                />

                <Input
                  label="Facebook Page URL or Handle (Optional)"
                  placeholder="Enter Facebook page link or handle"
                  icon={Share2}
                  error={errors?.facebookHandle?.message}
                  {...register("facebookHandle")}
                />

                <Input
                  label="LinkedIn Page Handle (Optional)"
                  placeholder="Enter LinkedIn page handle"
                  icon={Globe}
                  error={errors?.linkedinHandle?.message}
                  {...register("linkedinHandle")}
                />
              </div>

              <div>
                <Input
                  label="Google My Business (GMB) Review Link (Optional)"
                  placeholder="Enter Google review link"
                  icon={Star}
                  error={errors?.gmbReviewUrl?.message}
                  {...register("gmbReviewUrl")}
                />
              </div>
            </Card>
          )}

          {/* TAB 5: VISUAL ASSETS & QR (100% Symmetrical Cards + UPI VPA below) */}
          {(activeTab === "assets" || activeTab === "all") && (
            <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-6 rounded-2xl shadow-xl">
              <div className="border-b border-[#2C384E] pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-white">
                      5. Visual Brand Assets (Logo, Avatar & QR Code)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Transparent brand logo, owner photo, and payment QR code for post composite frames.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full hidden sm:inline">
                  Step 5 of 5
                </span>
              </div>

              {/* 3 Perfectly Symmetrical Upload Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Primary Transparent Logo */}
                <div className="p-5 rounded-2xl bg-[#0B0F17] border border-[#2C384E] flex flex-col items-center justify-between text-center space-y-4 h-full">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Primary Transparent Logo (Optional)
                  </label>

                  <div className="w-full flex-1 flex items-center justify-center">
                    {logoPreview ? (
                      <div className="relative w-40 h-40 max-w-[160px] aspect-square mx-auto rounded-xl overflow-hidden bg-slate-900 border border-[#2C384E] flex items-center justify-center p-2">
                        <img
                          src={logoPreview}
                          alt="Logo Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoPreview(null);
                            setLogoFile(null);
                            setValue("logoUrl", "");
                          }}
                          className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-rose-400 hover:text-white transition cursor-pointer"
                          title="Remove Logo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-40 h-40 max-w-[160px] aspect-square mx-auto rounded-xl border border-dashed border-[#2C384E] flex flex-col items-center justify-center p-4 text-slate-500 bg-slate-950/40">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-[11px]">PNG Logo with Transparent Background</p>
                      </div>
                    )}
                  </div>

                  <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C2638] hover:bg-[#253249] text-white text-xs font-semibold cursor-pointer border border-[#2C384E] transition w-full max-w-[160px]">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>{logoPreview ? "Change Logo" : "Upload Logo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* 2. Owner Portrait / Secondary Avatar */}
                <div className="p-5 rounded-2xl bg-[#0B0F17] border border-[#2C384E] flex flex-col items-center justify-between text-center space-y-4 h-full">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Owner Photo / Avatar (Optional)
                  </label>

                  <div className="w-full flex-1 flex items-center justify-center">
                    {avatarPreview ? (
                      <div className="relative w-40 h-40 max-w-[160px] aspect-square mx-auto rounded-xl overflow-hidden bg-slate-900 border border-[#2C384E] flex items-center justify-center p-2">
                        <img
                          src={avatarPreview}
                          alt="Avatar Preview"
                          className="max-h-full max-w-full object-cover rounded-full"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarPreview(null);
                            setAvatarFile(null);
                            setValue("avatarUrl", "");
                          }}
                          className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-rose-400 hover:text-white transition cursor-pointer"
                          title="Remove Avatar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-40 h-40 max-w-[160px] aspect-square mx-auto rounded-xl border border-dashed border-[#2C384E] flex flex-col items-center justify-center p-4 text-slate-500 bg-slate-950/40">
                        <Users className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-[11px]">Profile / Owner Photo</p>
                      </div>
                    )}
                  </div>

                  <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C2638] hover:bg-[#253249] text-white text-xs font-semibold cursor-pointer border border-[#2C384E] transition w-full max-w-[160px]">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>{avatarPreview ? "Change Photo" : "Upload Avatar"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* 3. Payment UPI QR Code */}
                <div className="p-5 rounded-2xl bg-[#0B0F17] border border-[#2C384E] flex flex-col items-center justify-between text-center space-y-4 h-full">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Payment UPI QR Code (Optional)
                  </label>

                  <div className="w-full flex-1 flex items-center justify-center">
                    {upiQrPreview ? (
                      <div className="relative w-40 h-40 max-w-[160px] aspect-square mx-auto rounded-xl overflow-hidden bg-slate-900 border border-[#2C384E] flex items-center justify-center p-2">
                        <img
                          src={upiQrPreview}
                          alt="UPI QR Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setUpiQrPreview(null);
                            setUpiQrFile(null);
                            setValue("upiQrUrl", "");
                          }}
                          className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-rose-400 hover:text-white transition cursor-pointer"
                          title="Remove QR"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-40 h-40 max-w-[160px] aspect-square mx-auto rounded-xl border border-dashed border-[#2C384E] flex flex-col items-center justify-center p-4 text-slate-500 bg-slate-950/40">
                        <QrCode className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-[11px]">Payment UPI QR Code</p>
                      </div>
                    )}
                  </div>

                  <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C2638] hover:bg-[#253249] text-white text-xs font-semibold cursor-pointer border border-[#2C384E] transition w-full max-w-[160px]">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>{upiQrPreview ? "Change QR" : "Upload QR"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpiQrChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Dedicated UPI VPA Input Field Below 3 Cards */}
              <div className="pt-3 border-t border-[#2C384E]">
                <Input
                  label="UPI VPA / Payment ID (Optional)"
                  placeholder="Enter UPI VPA (e.g. shop@upi or 9876543210@paytm)"
                  icon={QrCode}
                  error={errors?.upiVpa?.message}
                  {...register("upiVpa")}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Optional: Displayed on promotional festival graphics when payment details are included.
                </p>
              </div>
            </Card>
          )}

          {/* ========================================================= */}
          {/* 5. TAB STEPPER / WIZARD FOOTER NAVIGATION                */}
          {/* ========================================================= */}
          {activeTab !== "all" && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#131B2A] border border-[#2C384E]">
              <div>
                {prevTabKey ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab(prevTabKey)}
                    className="text-xs gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Previous Step
                  </Button>
                ) : (
                  <div />
                )}
              </div>

              <div>
                {nextTabKey ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab(nextTabKey)}
                    className="text-xs gap-1.5"
                  >
                    Next Step
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <span className="text-xs font-bold text-amber-400">
                    Final Section Reached
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 6. STICKY SUBMIT FOOTER                                   */}
          {/* ========================================================= */}
          <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-[#0B0F17]/95 border border-[#2C384E] backdrop-blur-md flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                All changes synchronize across Post Studio, Canvas overlays & AI generator.
              </span>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSaving}
              className="px-6 shadow-glow"
            >
              {isSaving ? "Saving BrandKit Profile..." : "Save BrandKit"}
            </Button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* 7. SCALABLE 1000+ CATEGORY MODAL                          */}
      {/* ========================================================= */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Select Business Category"
        description="Choose your business niche from 1,000+ categories. This will tailor template recommendations and AI prompts."
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          {/* Live Search Bar */}
          <SearchBar
            value={categorySearch}
            onChange={(val) => {
              const query = typeof val === "string" ? val : (val?.target?.value ?? "");
              setCategorySearch(query);
              setCategoryPage(1);
            }}
            placeholder="Search categories (e.g. Restaurant, Sweets, Jewellery, Salon, Real Estate, Clinic)..."
            className="w-full text-xs"
          />

          {/* Category Cards Grid with Loading & Empty States */}
          {isLoadingCategories ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 py-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-16 rounded-xl border border-slate-700/40 p-3 space-y-2 bg-[#131B2A]/60">
                  <div className="h-3.5 w-3/4 rounded skeleton-shimmer" />
                  <div className="h-2.5 w-1/2 rounded skeleton-shimmer opacity-60" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[#2C384E] rounded-xl text-slate-400 text-xs space-y-2 bg-[#0B0F17]">
              <FolderKanban className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-white">No categories found</p>
              <p className="text-slate-400">
                {categorySearch
                  ? `No results matching "${categorySearch}"`
                  : "No categories available."}
              </p>
              {categorySearch && (
                <button
                  type="button"
                  onClick={() => {
                    setCategorySearch("");
                    setCategoryPage(1);
                  }}
                  className="text-amber-400 hover:underline cursor-pointer text-xs"
                >
                  Clear search query
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto p-1 custom-scrollbar">
              {categories.map((cat) => {
                const isSelected =
                  categoryIdValue === cat.id ||
                  selectedCategoryObj?.id === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className={`p-3 rounded-xl border text-left transition flex items-start justify-between gap-2.5 cursor-pointer group min-h-[64px] ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/50"
                        : "bg-[#0B0F17] border-[#2C384E] text-slate-300 hover:text-white hover:border-slate-500 hover:bg-[#151D2C]"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                          isSelected
                            ? "bg-amber-500 text-slate-950"
                            : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                        }`}
                      >
                        {cat.name?.[0]?.toUpperCase() || "C"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold leading-snug break-words ${isSelected ? "text-amber-400" : "text-white"}`}>
                          {cat.name}
                        </p>
                        {cat.slug && (
                          <p className="text-[10px] text-slate-500 break-all font-mono mt-0.5">
                            #{cat.slug}
                          </p>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Modal Pagination Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-[#2C384E] text-xs">
            <span className="text-slate-400 text-[11px]">
              Page <span className="font-bold text-white">{categoryPage}</span> of{" "}
              <span className="font-bold text-white">{totalCategoryPages}</span>
              {(categoryMeta?.totalItems || categoryMeta?.totalCount) && (
                <span className="text-slate-500 ml-1">
                  ({categoryMeta?.totalItems || categoryMeta?.totalCount} total categories)
                </span>
              )}
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={categoryPage <= 1 || isLoadingCategories}
                onClick={() => setCategoryPage((p) => Math.max(1, p - 1))}
                className="text-xs py-1 px-3"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={categoryPage >= totalCategoryPages || isLoadingCategories}
                onClick={() => setCategoryPage((p) => Math.min(totalCategoryPages, p + 1))}
                className="text-xs py-1 px-3"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BrandKitView;
