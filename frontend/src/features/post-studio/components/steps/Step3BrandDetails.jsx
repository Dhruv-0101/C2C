import React from "react";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/**
 * Step3BrandDetails
 * Renders Step 3: BrandKit Details & Dynamic Overrides based on selected frame's configJson.
 */
export const Step3BrandDetails = ({
  selectedFrame,
  setCurrentStep,
  customDetails = {},
  setCustomDetails,
  brandKit,
}) => {
  // Dynamically extract text input fields and image slot toggles configured in selectedFrame
  const getDynamicFrameFields = (frame) => {
    let rawConfig = frame?.configJson || frame?.blueprint || frame?.layoutConfig || frame?.jsonConfig || frame?.config;
    if (typeof rawConfig === "string") {
      try {
        rawConfig = JSON.parse(rawConfig);
      } catch (e) { }
    }
    let elements = Array.isArray(rawConfig)
      ? rawConfig
      : (rawConfig?.elements && Array.isArray(rawConfig.elements) ? rawConfig.elements : []);

    if (!elements || elements.length === 0) {
      elements = [
        { id: "el-logo-box", type: "RECTANGLE", slotCategory: "IMAGE_SLOT", dynamicSlot: "LOGO_BOX", name: "Brand Logo" },
        { id: "el-avatar-circle", type: "CIRCLE", slotCategory: "IMAGE_SLOT", dynamicSlot: "AVATAR_CIRCLE", customLabel: "Profile Photo", name: "Profile Photo" },
        { id: "el-business-name", type: "TEXT", slotCategory: "TEXT_INPUT", dynamicSlot: "BUSINESS_NAME", name: "Business Name", text: "SUNRISE REAL ESTATE" },
        { id: "el-phone-badge", type: "TEXT", slotCategory: "TEXT_INPUT", dynamicSlot: "PHONE", name: "Phone Number", text: "+91 98765 43210" },
        { id: "el-address-text", type: "TEXT", slotCategory: "TEXT_INPUT", dynamicSlot: "ADDRESS", name: "Address / Location", text: "Business Park, MG Road, Mumbai" },
      ];
    }

    const textFields = [];
    const imageToggles = [];
    const customImageSlots = [];
    const seenKeys = new Set();

    elements.forEach((el) => {
      const slot = el.dynamicSlot;
      const isImageCategory = el.slotCategory === "IMAGE_SLOT" || el.slotCategory === "DYNAMIC_IMAGE" || el.type === "IMAGE_SLOT";

      if (
        isImageCategory ||
        slot === "LOGO_BOX" ||
        slot === "AVATAR_CIRCLE" ||
        slot === "UPI_QR" ||
        slot === "CUSTOM_IMAGE" ||
        slot === "MANUAL_INPUT"
      ) {
        const isPrimaryAvatar = slot === "AVATAR_CIRCLE" || el.fieldKey === "avatarUrl";
        const isPrimaryLogo = slot === "LOGO_BOX" || el.fieldKey === "logoUrl";
        const isPrimaryUpi = slot === "UPI_QR" || el.fieldKey === "upiQrUrl";

        if (isPrimaryAvatar) {
          const fieldKey = "showAvatar";
          if (!seenKeys.has(fieldKey)) {
            seenKeys.add(fieldKey);
            imageToggles.push({
              id: el.id,
              key: "showAvatar",
              label: el.customLabel || el.name || "Render Profile Photo",
              type: "AVATAR",
              fieldKey,
              rawElement: el,
              previewUrl: customDetails.avatarUrl || brandKit?.avatarUrl,
            });
          }
        } else if (isPrimaryLogo) {
          const fieldKey = "showLogo";
          if (!seenKeys.has(fieldKey)) {
            seenKeys.add(fieldKey);
            imageToggles.push({
              id: el.id,
              key: "showLogo",
              label: el.customLabel || el.name || "Render Brand Logo",
              type: "LOGO",
              fieldKey,
              rawElement: el,
              previewUrl: customDetails.logoUrl || brandKit?.logoUrl,
            });
          }
        } else if (isPrimaryUpi) {
          const fieldKey = "showUpiQr";
          if (!seenKeys.has(fieldKey)) {
            seenKeys.add(fieldKey);
            imageToggles.push({
              id: el.id,
              key: "showUpiQr",
              label: el.customLabel || el.name || "Render UPI Payment QR",
              type: "UPI_QR",
              fieldKey,
              rawElement: el,
              previewUrl: customDetails.upiQrUrl || brandKit?.upiQrUrl,
            });
          }
        } else {
          const fieldKey = el.fieldKey || el.id || `custom_img_${el.type || 'slot'}`;
          const label = el.customLabel || el.name || `Upload Image for ${el.type || 'Shape'} Slot`;
          if (!seenKeys.has(fieldKey)) {
            seenKeys.add(fieldKey);
            customImageSlots.push({ id: el.id, key: fieldKey, label, type: "CUSTOM", fieldKey, rawElement: el });
          }
        }
      } else if (
        el.type === "TEXT" ||
        el.type === "DYNAMIC_TEXT" ||
        el.slotCategory === "TEXT_INPUT" ||
        (slot && slot !== "NONE" && slot !== "STATIC")
      ) {
        let fieldKey = "businessName";
        let label = "Business Name";

        if (slot === "BUSINESS_NAME") {
          fieldKey = "businessName";
          label = "Business Name";
        } else if (slot === "PHONE") {
          fieldKey = "phone";
          label = "Phone / WhatsApp Number";
        } else if (slot === "WHATSAPP") {
          fieldKey = "whatsapp";
          label = "WhatsApp Number";
        } else if (slot === "ADDRESS") {
          fieldKey = "address";
          label = "Address / Location";
        } else if (
          slot === "TAGLINE" ||
          slot === "SLOGAN" ||
          el.text?.toLowerCase().includes("slogan") ||
          el.name?.toLowerCase().includes("slogan")
        ) {
          fieldKey = "tagline";
          label = "Tagline / Slogan";
        } else if (slot === "EMAIL") {
          fieldKey = "email";
          label = "Email Address";
        } else if (slot === "WEBSITE") {
          fieldKey = "websiteUrl";
          label = "Website URL";
        } else if (slot === "INSTAGRAM") {
          fieldKey = "instagramHandle";
          label = "Instagram Handle";
        } else if (slot === "FACEBOOK") {
          fieldKey = "facebookHandle";
          label = "Facebook Handle";
        } else if (slot === "CITY") {
          fieldKey = "city";
          label = "City";
        } else if (slot === "STATE") {
          fieldKey = "state";
          label = "State";
        } else if (slot === "COUNTRY") {
          fieldKey = "country";
          label = "Country";
        } else if (slot === "UPI_VPA") {
          fieldKey = "upiVpa";
          label = "UPI Payment ID / VPA";
        } else {
          fieldKey = el.fieldKey || el.id || (el.name ? el.name.toLowerCase().replace(/[^a-z0-9]/g, "_") : "custom_text_field");
          label = el.customLabel || el.name || el.text || "Custom Text Field";
        }

        if (!seenKeys.has(fieldKey)) {
          seenKeys.add(fieldKey);
          textFields.push({ id: el.id, fieldKey, label, placeholder: el.text || el.defaultText || "", rawElement: el });
        }
      }
    });

    return { textFields, imageToggles, customImageSlots };
  };

  if (!selectedFrame) {
    return (
      <Card className="p-3.5 sm:p-5 bg-[#131B2A] border-[#2C384E] flex flex-col justify-between min-h-[500px] lg:h-[570px] lg:min-h-[570px] lg:max-h-[570px] overflow-hidden shrink-0 gap-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-[#2C384E] pb-2.5 shrink-0">
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">Step 3: Details</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              Template only (No frame selected).
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)} className="min-h-[34px]">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button variant="primary" size="sm" onClick={() => setCurrentStep(4)} className="shadow-lg font-bold min-h-[34px]">
              <span>Next: Export</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0B0F17] border border-[#2C384E] text-center space-y-3 my-auto">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
            ✨
          </div>
          <h4 className="font-heading font-extrabold text-white text-base">No Frame Selected</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            You are creating a post with the base graphic template only. Frame details (such as logo, phone, or location overlays) are not needed when no frame is selected.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)} className="min-h-[36px]">
              <Layers className="w-3.5 h-3.5 mr-1 text-amber-400" />
              Choose a Brand Frame
            </Button>
            <Button variant="primary" size="sm" onClick={() => setCurrentStep(4)} className="min-h-[36px]">
              <span>Proceed to Publish & Export</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const { textFields, imageToggles, customImageSlots } = getDynamicFrameFields(selectedFrame);

  return (
    <Card className="p-3.5 sm:p-5 bg-[#131B2A] border-[#2C384E] flex flex-col justify-between min-h-[500px] lg:h-[570px] lg:min-h-[570px] lg:max-h-[570px] overflow-hidden shrink-0 gap-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-[#2C384E] pb-2.5 shrink-0">
        <div className="min-w-0">
          <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2 truncate">
            <FileText className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">Step 3: Details</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            Edit text fields & image toggles.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 self-stretch sm:self-auto justify-end shrink-0">
          <button
            type="button"
            onClick={() => {
              const updated = { ...customDetails };
              textFields.forEach((tf) => {
                const fk = tf.fieldKey;
                if (fk === "businessName") updated.businessName = brandKit?.businessName || tf.placeholder || "Sunrise Real Estate";
                else if (fk === "phone") updated.phone = brandKit?.phone || brandKit?.whatsapp || tf.placeholder || "+91 98765 43210";
                else if (fk === "whatsapp") updated.whatsapp = brandKit?.whatsapp || tf.placeholder || "+91 98765 43210";
                else if (fk === "address") updated.address = brandKit?.address || tf.placeholder || "Business Park, MG Road, Mumbai";
                else if (fk === "tagline") {
                  updated.tagline = brandKit?.tagline || brandKit?.slogan || tf.placeholder || "Premium Luxury Homes & Commercial Spaces";
                  updated.slogan = brandKit?.slogan || brandKit?.tagline || tf.placeholder || "Premium Luxury Homes & Commercial Spaces";
                }
                else if (fk === "email") updated.email = brandKit?.email || tf.placeholder || "contact@business.com";
                else if (fk === "websiteUrl") updated.websiteUrl = tf.placeholder || "https://yourbusiness.com";
                else if (fk === "instagramHandle") updated.instagramHandle = brandKit?.instagramHandle || tf.placeholder || "@yourbrand";
                else if (fk === "facebookHandle") updated.facebookHandle = brandKit?.facebookHandle || tf.placeholder || "yourbrand";
                else if (fk === "city") updated.city = brandKit?.city || tf.placeholder || "Mumbai";
                else if (fk === "state") updated.state = brandKit?.state || tf.placeholder || "Maharashtra";
                else if (fk === "country") updated.country = brandKit?.country || tf.placeholder || "India";
                else if (fk === "upiVpa") updated.upiVpa = brandKit?.upiVpa || tf.placeholder || "";
                else updated[fk] = brandKit?.[fk] || tf.placeholder || "Sample Text";
              });
              if (brandKit?.upiQrUrl) {
                updated.upiQrUrl = brandKit.upiQrUrl;
                updated.showUpiQr = true;
              }
              if (brandKit?.upiVpa) {
                updated.upiVpa = brandKit.upiVpa;
              }
              setCustomDetails(updated);
            }}
            className="px-2 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition flex items-center gap-1 shrink-0 cursor-pointer min-h-[34px]"
            title="Auto fill fields from your active BrandKit"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>BrandKit</span>
          </button>
          <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)} className="min-h-[34px]">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button variant="primary" size="sm" onClick={() => setCurrentStep(4)} className="shadow-lg font-bold min-h-[34px]">
            <span>Next: Export</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* DYNAMIC FORM BODY CONTAINER (Flex Fill Scrollable Viewport) */}
      <div className="w-full flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar my-1 space-y-4">
        {/* DYNAMIC TEXT INPUT FIELDS BASED ON FRAME CONFIGJSON */}
        <div className="space-y-4">
          {textFields.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-slate-400 text-xs text-center font-medium">
              This frame has no dynamic text elements configured.
            </div>
          ) : (
            textFields.map((tf) => (
              <Input
                key={tf.fieldKey}
                label={tf.label}
                placeholder={tf.placeholder}
                value={customDetails[tf.fieldKey] !== undefined ? customDetails[tf.fieldKey] : tf.placeholder}
                onChange={(e) =>
                  setCustomDetails((prev) => ({
                    ...prev,
                    [tf.fieldKey]: e.target.value,
                  }))
                }
              />
            ))
          )}
        </div>

        {/* DYNAMIC IMAGE TOGGLES & CUSTOM UPLOADERS BASED ON FRAME CONFIGJSON */}
        {imageToggles.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#2C384E]">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Live Canvas Image & Badge Toggles
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {imageToggles.map((it) => (
                <div
                  key={it.fieldKey}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-slate-300 hover:border-slate-500 transition"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={customDetails[it.fieldKey] !== undefined ? customDetails[it.fieldKey] : true}
                      onChange={(e) =>
                        setCustomDetails((prev) => ({
                          ...prev,
                          [it.fieldKey]: e.target.checked,
                        }))
                      }
                      className="rounded accent-amber-500 shrink-0"
                    />
                    <span className="font-semibold truncate">{it.label}</span>
                  </label>
                  {it.previewUrl ? (
                    <img
                      src={it.previewUrl}
                      alt={it.label}
                      className="w-7 h-7 rounded-md object-contain bg-slate-900 border border-[#2C384E] shrink-0 ml-2"
                      title="Auto-filled from BrandKit"
                    />
                  ) : (
                    <span className="text-[10px] text-amber-400/80 font-medium px-1.5 py-0.5 rounded bg-amber-500/10 shrink-0 ml-2 border border-amber-500/20">
                      {it.type === 'UPI_QR' ? 'No QR in BrandKit' : 'Default'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CUSTOM IMAGE SLOT UPLOADERS */}
        {customImageSlots.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-[#2C384E]">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Custom Image Slots (Upload Graphic for Shapes / Frame Slots)
            </label>
            {customImageSlots.map((cis) => (
              <div key={cis.fieldKey} className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>{cis.label}</span>
                  {customDetails[cis.fieldKey] && (
                    <button
                      type="button"
                      onClick={() => setCustomDetails((prev) => ({ ...prev, [cis.fieldKey]: null }))}
                      className="text-[10px] text-red-400 hover:underline"
                    >
                      Clear Image
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {customDetails[cis.fieldKey] ? (
                    <img
                      src={customDetails[cis.fieldKey]}
                      alt={cis.label}
                      className="w-12 h-12 rounded-lg object-cover border border-[#2C384E]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#131B2A] border border-dashed border-[#2C384E] flex items-center justify-center text-slate-500 text-xs">
                      🖼️
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          setCustomDetails((prev) => ({
                            ...prev,
                            [cis.fieldKey]: evt.target.result,
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500/20 file:text-amber-400 hover:file:bg-amber-500/30 cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
