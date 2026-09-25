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
  Palette,
  Bot,
  QrCode,
  Share2,
  Clock,
  Search,
  Check,
  Plus,
  Tag,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { SearchBar } from "@/components/ui/SearchBar";
import { useClickOutside } from "@/shared/hooks/useClickOutside";

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
  { id: "English", label: "English", flag: "🇬🇧", desc: "Global & Professional" },
  { id: "Hinglish", label: "Hinglish", flag: "🇮🇳", desc: "Urban, Viral & Relatable" },
  { id: "Hindi", label: "Hindi", flag: "🟧", desc: "Cultural & Shuddh Hindi" },
  { id: "Gujarati", label: "Gujarati", flag: "🟠", desc: "Commerce & Regional" },
  { id: "Marathi", label: "Marathi", flag: "🚩", desc: "Maharashtra Regional" },
  { id: "Bengali", label: "Bengali", flag: "🟣", desc: "Bengal Regional" },
  { id: "Tamil", label: "Tamil", flag: "🟡", desc: "Tamil Nadu Regional" },
  { id: "Telugu", label: "Telugu", flag: "🔵", desc: "Andhra & Telangana Regional" },
  { id: "Kannada", label: "Kannada", flag: "🟢", desc: "Karnataka Regional" },
  { id: "Malayalam", label: "Malayalam", flag: "🟤", desc: "Kerala Regional" },
  { id: "Punjabi", label: "Punjabi", flag: "🔶", desc: "Punjab Regional" },
];

/**
 * BrandKitView
 * Pure Presentational Component rendering the Master BrandKit setup UI forms,
 * scalable 1000+ category modal picker, and collapsible dropdowns for Target Audience,
 * Default AI Caption Language, and Business USPs.
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
  const categoryIdValue = watch ? watch("categoryId") : "";
  const captionLangValue = watch ? watch("captionLanguage") : "English";
  const rawTargetAudience = watch ? watch("targetAudience") : "";
  const rawBusinessUsps = watch ? watch("businessUsps") : "";

  // -------------------------------------------------------------
  // Dropdown Collapsible Toggles
  // -------------------------------------------------------------
  const [isAudienceDropdownOpen, setIsAudienceDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isUspDropdownOpen, setIsUspDropdownOpen] = useState(false);

  // Outside click listeners to automatically close dropdowns
  const audienceDropdownRef = useClickOutside(() => setIsAudienceDropdownOpen(false));
  const languageDropdownRef = useClickOutside(() => setIsLanguageDropdownOpen(false));
  const uspDropdownRef = useClickOutside(() => setIsUspDropdownOpen(false));

  // -------------------------------------------------------------
  // Target Audience Interactive Multi-Select & "Other" State
  // -------------------------------------------------------------
  const [customAudienceInput, setCustomAudienceInput] = useState("");
  const [showCustomAudienceField, setShowCustomAudienceField] = useState(false);

  // Parse currently selected audiences from form value
  const parsedAudiences = useMemo(() => {
    if (!rawTargetAudience || typeof rawTargetAudience !== "string") return [];
    return rawTargetAudience
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [rawTargetAudience]);

  // Check which presets are active and which are custom
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

  // Open custom audience field automatically if custom items exist
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

  // Parse currently selected USPs from form value
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

  // Open custom USP field automatically if custom items exist
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
  // Category & Language Helpers
  // -------------------------------------------------------------
  const totalCategoryPages = categoryMeta?.totalPages || 1;
  const currentCategoryDisplay =
    selectedCategoryObj?.name ||
    categories.find((c) => c.id === categoryIdValue)?.name;

  const selectedLangObj =
    CAPTION_LANGUAGES.find(
      (l) => l.id.toLowerCase() === (captionLangValue || "english").toLowerCase()
    ) || CAPTION_LANGUAGES[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[#2C384E] bg-gradient-to-r from-[#131B2A] via-[#1a2538] to-[#0B0F17]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
            <Sparkles className="w-3 h-3" />
            <span>AI Brand Engine Setup</span>
          </div>
          <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
            Configure Your <span className="text-gradient">BrandKit</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Set up your industry niche, visual identity, target audience, preferred language, and key USPs.
            Our AI uses these exact parameters to automatically brand and craft captions for all your posts.
          </p>
        </div>
      </div>

      {isLoadingBrandKit ? (
        <div className="p-16 text-center text-slate-400">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mb-3" />
          <p className="text-sm">Loading your BrandKit profile...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full space-y-6" noValidate>
          {errorMsg && <Alert variant="error" message={errorMsg} />}
          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {scheduledNotice && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#1a2538] to-[#131B2A] border border-amber-500/40 space-y-3 shadow-lg">
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
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
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

          {/* Section 1: Business Identity & Scalable Category Selector */}
          <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-6">
            <h3 className="font-heading font-bold text-lg text-white border-b border-[#2C384E] pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>1. Business Identity & Industry Niche</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Business / Brand Name"
                placeholder="e.g. Sunrise Real Estate, Sharma Sweets"
                error={errors?.businessName?.message}
                {...register("businessName")}
              />

              {/* Scalable Business Category Selector (Handles 1,000+ Categories) */}
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
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F17] border border-dashed border-[#2C384E] hover:border-amber-500/50 text-slate-300 hover:text-white transition text-xs cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition" />
                      <span>Select Industry Category (Browse 1,000+ Categories)</span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Browse
                    </span>
                  </button>
                )}
                <input type="hidden" {...register("categoryId")} />
                {errors?.categoryId && (
                  <p className="text-[11px] text-rose-400">{errors.categoryId.message}</p>
                )}
              </div>
            </div>

            <Input
              label="Slogan / Tagline (Optional)"
              placeholder="e.g. Quality & Trust Since 1998"
              error={errors?.tagline?.message}
              {...register("tagline")}
            />
          </Card>

          {/* Section 2: AI Copywriting & Intelligence Profile (Clean Dropdown Mode) */}
          <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-6">
            <div className="border-b border-[#2C384E] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-amber-400" />
                <span>2. AI Copywriting Profile (Captions & Hashtags)</span>
              </h3>
              <span className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full w-fit">
                Feeds into AI Caption Generator
              </span>
            </div>

            {/* Target Audience Dropdown */}
            <div ref={audienceDropdownRef} className="space-y-2 relative">
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

              {/* Collapsible Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setIsAudienceDropdownOpen((prev) => !prev)}
                className={`w-full p-3 rounded-xl bg-[#0B0F17] border transition flex items-center justify-between gap-3 text-left cursor-pointer ${
                  isAudienceDropdownOpen
                    ? "border-amber-500 shadow-md ring-1 ring-amber-500/30"
                    : "border-[#2C384E] hover:border-slate-500 hover:bg-[#151D2C]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="truncate flex-1">
                    {parsedAudiences.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5 truncate">
                        {parsedAudiences.slice(0, 3).map((a) => (
                          <span
                            key={a}
                            className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[11px] font-medium border border-amber-500/30 shrink-0"
                          >
                            {a}
                          </span>
                        ))}
                        {parsedAudiences.length > 3 && (
                          <span className="text-[11px] text-slate-400 font-semibold">
                            +{parsedAudiences.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Click to select target audiences (e.g. Working Professionals, Families)...
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-amber-400 font-semibold hidden sm:inline">
                    {isAudienceDropdownOpen ? "Close Menu" : "Choose Audiences"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isAudienceDropdownOpen ? "rotate-180 text-amber-400" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Dropdown Content - Rendered ONLY if open */}
              {isAudienceDropdownOpen && (
                <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#2C384E] shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-[#2C384E] pb-2">
                    <span className="text-xs font-bold text-slate-200">
                      Select audiences (Click to toggle):
                    </span>
                    <div className="flex items-center gap-2">
                      {parsedAudiences.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setValue("targetAudience", "", { shouldDirty: true })}
                          className="text-[11px] text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          Clear all
                        </button>
                      )}
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => setIsAudienceDropdownOpen(false)}
                        className="text-[11px] py-1 px-3"
                      >
                        Done
                      </Button>
                    </div>
                  </div>

                  {/* Predefined Audience Chips */}
                  <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
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
                            <Check className="w-3 h-3 text-amber-400" />
                          ) : (
                            <Plus className="w-3 h-3 text-slate-500" />
                          )}
                          <span>{audience}</span>
                        </button>
                      );
                    })}

                    {/* "Other" Audience Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setShowCustomAudienceField((prev) => !prev)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border ${
                        showCustomAudienceField || customAudiences.length > 0
                          ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold shadow-sm"
                          : "bg-[#131B2A] border-[#2C384E] text-slate-300 hover:text-white hover:border-indigo-400"
                      }`}
                    >
                      <Tag className="w-3 h-3 text-indigo-400" />
                      <span>+ Other (Custom Audience)</span>
                    </button>
                  </div>

                  {/* Custom Audience Tag Input (Revealed on 'Other') */}
                  {showCustomAudienceField && (
                    <div className="p-3.5 rounded-xl bg-[#131B2A] border border-[#2C384E] space-y-2.5 animate-in fade-in duration-200">
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
                          placeholder="Type custom audience (e.g. Pet Owners, NRI Investors, Wedding Planners)..."
                          className="flex-1 px-3.5 py-1.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-indigo-500"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddCustomAudience}
                          className="text-xs shrink-0 py-1.5"
                        >
                          Add Custom
                        </Button>
                      </div>

                      {customAudiences.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {customAudiences.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-medium"
                            >
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomAudience(tag)}
                                className="text-indigo-400 hover:text-white cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <input type="hidden" {...register("targetAudience")} />
              {errors?.targetAudience && (
                <p className="text-[11px] text-rose-400">{errors.targetAudience.message}</p>
              )}
            </div>

            {/* Default AI Caption Language Dropdown */}
            <div ref={languageDropdownRef} className="space-y-2 pt-3 border-t border-[#2C384E] relative">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                    Default AI Caption Language
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    The AI Caption Generator will craft captions in this selected language by default.
                  </p>
                </div>
                <span className="text-[11px] text-amber-400 font-bold bg-[#0B0F17] px-2.5 py-1 rounded-lg border border-[#2C384E]">
                  {selectedLangObj.label} ({selectedLangObj.flag})
                </span>
              </div>

              {/* Collapsible Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setIsLanguageDropdownOpen((prev) => !prev)}
                className={`w-full p-3 rounded-xl bg-[#0B0F17] border transition flex items-center justify-between gap-3 text-left cursor-pointer ${
                  isLanguageDropdownOpen
                    ? "border-amber-500 shadow-md ring-1 ring-amber-500/30"
                    : "border-[#2C384E] hover:border-slate-500 hover:bg-[#151D2C]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl">{selectedLangObj.flag}</span>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white">
                      {selectedLangObj.label}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {selectedLangObj.desc}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-amber-400 font-semibold hidden sm:inline">
                    {isLanguageDropdownOpen ? "Close Menu" : "Change Language"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isLanguageDropdownOpen ? "rotate-180 text-amber-400" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Dropdown Content - Rendered ONLY if open */}
              {isLanguageDropdownOpen && (
                <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#2C384E] shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-[#2C384E] pb-2">
                    <span className="text-xs font-bold text-slate-200">
                      Select caption language (11 languages supported):
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsLanguageDropdownOpen(false)}
                      className="text-[11px] py-1 px-3"
                    >
                      Close
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[240px] overflow-y-auto p-1 custom-scrollbar">
                    {CAPTION_LANGUAGES.map((lang) => {
                      const isSelected =
                        captionLangValue.toLowerCase() === lang.id.toLowerCase();
                      return (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => {
                            setValue("captionLanguage", lang.id, { shouldDirty: true });
                            setIsLanguageDropdownOpen(false);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-amber-500/15 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/50"
                              : "bg-[#131B2A] border-[#2C384E] text-slate-400 hover:text-white hover:border-slate-500 hover:bg-[#1A2538]"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-base">{lang.flag}</span>
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
                </div>
              )}

              <input type="hidden" {...register("captionLanguage")} />
            </div>

            {/* Business USPs & Key Features Dropdown */}
            <div ref={uspDropdownRef} className="space-y-2 pt-3 border-t border-[#2C384E] relative">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                    Business USPs & Key Features (AI Highlights)
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click to select the key selling propositions you want highlighted in promotional copy.
                  </p>
                </div>
                {parsedUsps.length > 0 && (
                  <span className="text-[11px] text-emerald-400 font-bold bg-[#0B0F17] px-2.5 py-1 rounded-lg border border-[#2C384E]">
                    {parsedUsps.length} Selected
                  </span>
                )}
              </div>

              {/* Collapsible Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setIsUspDropdownOpen((prev) => !prev)}
                className={`w-full p-3 rounded-xl bg-[#0B0F17] border transition flex items-center justify-between gap-3 text-left cursor-pointer ${
                  isUspDropdownOpen
                    ? "border-emerald-500 shadow-md ring-1 ring-emerald-500/30"
                    : "border-[#2C384E] hover:border-slate-500 hover:bg-[#151D2C]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="truncate flex-1">
                    {parsedUsps.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5 truncate">
                        {parsedUsps.slice(0, 3).map((u) => (
                          <span
                            key={u}
                            className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-medium border border-emerald-500/30 shrink-0"
                          >
                            {u}
                          </span>
                        ))}
                        {parsedUsps.length > 3 && (
                          <span className="text-[11px] text-slate-400 font-semibold">
                            +{parsedUsps.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Click to select business USPs & key highlights (e.g. 100% Genuine, Best Rates)...
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-emerald-400 font-semibold hidden sm:inline">
                    {isUspDropdownOpen ? "Close Menu" : "Choose USPs"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isUspDropdownOpen ? "rotate-180 text-emerald-400" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Dropdown Content - Rendered ONLY if open */}
              {isUspDropdownOpen && (
                <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#2C384E] shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-[#2C384E] pb-2">
                    <span className="text-xs font-bold text-slate-200">
                      Select business USPs (Click to toggle):
                    </span>
                    <div className="flex items-center gap-2">
                      {parsedUsps.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setValue("businessUsps", "", { shouldDirty: true })}
                          className="text-[11px] text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          Clear all
                        </button>
                      )}
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => setIsUspDropdownOpen(false)}
                        className="text-[11px] py-1 px-3"
                      >
                        Done
                      </Button>
                    </div>
                  </div>

                  {/* Predefined USP Chips */}
                  <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
                    {PRESET_USPS.map((usp) => {
                      const isSelected = activePresetUsps.includes(usp);
                      return (
                        <button
                          key={usp}
                          type="button"
                          onClick={() => handleTogglePresetUsp(usp)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 cursor-pointer border ${
                            isSelected
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-sm"
                              : "bg-[#131B2A] border-[#2C384E] text-slate-300 hover:text-white hover:border-slate-500"
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Plus className="w-3 h-3 text-slate-500" />
                          )}
                          <span>{usp}</span>
                        </button>
                      );
                    })}

                    {/* "Other" USP Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setShowCustomUspField((prev) => !prev)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border ${
                        showCustomUspField || customUsps.length > 0
                          ? "bg-purple-500/20 border-purple-500 text-purple-300 font-bold shadow-sm"
                          : "bg-[#131B2A] border-[#2C384E] text-slate-300 hover:text-white hover:border-purple-400"
                      }`}
                    >
                      <Tag className="w-3 h-3 text-purple-400" />
                      <span>+ Other (Custom USP)</span>
                    </button>
                  </div>

                  {/* Custom USP Tag Input (Revealed on 'Other') */}
                  {showCustomUspField && (
                    <div className="p-3.5 rounded-xl bg-[#131B2A] border border-[#2C384E] space-y-2.5 animate-in fade-in duration-200">
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
                          placeholder="Type custom USP (e.g. Free 1-Year AMC, Same-Day Urgent Dispatch, Made in India)..."
                          className="flex-1 px-3.5 py-1.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-purple-500"
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
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-medium"
                            >
                              <span>{usp}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomUsp(usp)}
                                className="text-purple-400 hover:text-white cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <input type="hidden" {...register("businessUsps")} />
              {errors?.businessUsps && (
                <p className="text-[11px] text-rose-400">{errors.businessUsps.message}</p>
              )}
            </div>
          </Card>

          {/* Section 3: Contact Details & Operating Hours */}
          <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-6">
            <h3 className="font-heading font-bold text-lg text-white border-b border-[#2C384E] pb-3 flex items-center gap-2">
              <Phone className="w-5 h-5 text-amber-400" />
              <span>3. Contact Details & Operating Hours</span>
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
                label="Working Hours / Store Timing (Optional)"
                placeholder="e.g. Mon - Sat: 10:00 AM - 9:00 PM"
                error={errors?.workingHours?.message}
                {...register("workingHours")}
              />
            </div>

            <div>
              <Input
                label="Full Office / Store Address"
                placeholder="e.g. Shop #12, MG Road, Commercial Complex"
                error={errors?.address?.message}
                {...register("address")}
              />
            </div>

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

          {/* Section 4: Social Media Handles & Reviews */}
          <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-6">
            <h3 className="font-heading font-bold text-lg text-white border-b border-[#2C384E] pb-3 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-amber-400" />
              <span>4. Social Media Handles & Google Review Link</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Instagram Username"
                placeholder="@yourbrand"
                error={errors?.instagramHandle?.message}
                {...register("instagramHandle")}
              />

              <Input
                label="Facebook Page URL or Handle"
                placeholder="facebook.com/yourbrand"
                error={errors?.facebookHandle?.message}
                {...register("facebookHandle")}
              />

              <Input
                label="LinkedIn Page Handle"
                placeholder="linkedin.com/company/yourbrand"
                error={errors?.linkedinHandle?.message}
                {...register("linkedinHandle")}
              />
            </div>

            <Input
              label="Google My Business (GMB) Review Link"
              placeholder="https://g.page/r/your-review-shortlink"
              error={errors?.gmbReviewUrl?.message}
              {...register("gmbReviewUrl")}
            />
          </Card>

          {/* Section 5: Brand Visual Assets (Logo, Owner Avatar & UPI QR) */}
          <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-6">
            <h3 className="font-heading font-bold text-lg text-white border-b border-[#2C384E] pb-3 flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-400" />
              <span>5. Visual Brand Assets (Logo, Avatar & QR Code)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Transparent Brand Logo */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Primary Transparent Logo
                </label>
                <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] text-center space-y-3">
                  {logoPreview ? (
                    <div className="relative aspect-square max-w-[160px] mx-auto rounded-xl overflow-hidden bg-slate-900 border border-[#2C384E] flex items-center justify-center p-2">
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
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-square max-w-[160px] mx-auto rounded-xl border border-dashed border-[#2C384E] flex flex-col items-center justify-center p-4 text-slate-500">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-[11px]">PNG Logo with Transparent Background</p>
                    </div>
                  )}

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C2638] hover:bg-[#253249] text-white text-xs font-semibold cursor-pointer border border-[#2C384E] transition">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Owner Portrait / Secondary Avatar */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Owner Photo / Avatar
                </label>
                <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] text-center space-y-3">
                  {avatarPreview ? (
                    <div className="relative aspect-square max-w-[160px] mx-auto rounded-xl overflow-hidden bg-slate-900 border border-[#2C384E] flex items-center justify-center p-2">
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
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-square max-w-[160px] mx-auto rounded-xl border border-dashed border-[#2C384E] flex flex-col items-center justify-center p-4 text-slate-500">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-[11px]">Profile / Owner Photo</p>
                    </div>
                  )}

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C2638] hover:bg-[#253249] text-white text-xs font-semibold cursor-pointer border border-[#2C384E] transition">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload Avatar</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Payment UPI QR Code */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Payment QR Code & VPA
                </label>
                <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] text-center space-y-3">
                  {upiQrPreview ? (
                    <div className="relative aspect-square max-w-[160px] mx-auto rounded-xl overflow-hidden bg-slate-900 border border-[#2C384E] flex items-center justify-center p-2">
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
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-square max-w-[160px] mx-auto rounded-xl border border-dashed border-[#2C384E] flex flex-col items-center justify-center p-4 text-slate-500">
                      <QrCode className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-[11px]">Payment UPI QR Code</p>
                    </div>
                  )}

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C2638] hover:bg-[#253249] text-white text-xs font-semibold cursor-pointer border border-[#2C384E] transition">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload QR</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpiQrChange}
                      className="hidden"
                    />
                  </label>

                  <Input
                    placeholder="shop@upi / 9876543210@paytm"
                    error={errors?.upiVpa?.message}
                    {...register("upiVpa")}
                    className="text-xs text-center"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Form Submit Footer */}
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

      {/* Scalable Business Category Modal (Handles 1,000+ Categories with Live Search & Pagination) */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Select Business Category"
        description="Choose your business niche from 1,000+ categories. This will tailor template recommendations and AI prompts."
        maxWidth="max-w-2xl"
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
            placeholder="Search categories (e.g. Restaurant, Jewellery, Salon, Real Estate, Clinic)..."
            className="w-full text-xs"
          />

          {/* Category Cards Grid with Loading & Empty States */}
          {isLoadingCategories ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <div className="inline-block animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mb-2" />
              <p>Searching business categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[#2C384E] rounded-xl text-slate-400 text-xs space-y-2">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto p-1 custom-scrollbar">
              {categories.map((cat) => {
                const isSelected =
                  categoryIdValue === cat.id ||
                  selectedCategoryObj?.id === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className={`p-3 rounded-xl border text-left transition flex items-center justify-between gap-2 cursor-pointer group ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/50"
                        : "bg-[#0B0F17] border-[#2C384E] text-slate-300 hover:text-white hover:border-slate-500 hover:bg-[#151D2C]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                          isSelected
                            ? "bg-amber-500 text-slate-950"
                            : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                        }`}
                      >
                        {cat.name?.[0]?.toUpperCase() || "C"}
                      </div>
                      <div className="truncate">
                        <p className={`text-xs font-bold truncate ${isSelected ? "text-amber-400" : "text-white"}`}>
                          {cat.name}
                        </p>
                        {cat.slug && (
                          <p className="text-[10px] text-slate-500 truncate font-mono">
                            #{cat.slug}
                          </p>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
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
