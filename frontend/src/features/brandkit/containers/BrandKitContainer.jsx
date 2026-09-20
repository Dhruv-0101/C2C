import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { brandKitSchema } from "@/validations/brandkit.validation";
import { useBrandKit } from "@/hooks/useBrandKit";
import { useCategories } from "@/hooks/useCategories";
import { readImageAsBase64 } from "@/utils/file.utils";
import { BrandKitView } from "../components/BrandKitView";

/**
 * BrandKitContainer
 * Container component handling brand kit query/mutation state via custom hooks and React Hook Form + Zod validation.
 */
export const BrandKitContainer = () => {
  const navigate = useNavigate();
  const { brandKit, isLoading: isLoadingBrandKit, saveBrandKit, isSaving, saveError } = useBrandKit();
  const { categories } = useCategories({ page: 1, limit: 20 });

  const [successMsg, setSuccessMsg] = useState("");
  const [scheduledNotice, setScheduledNotice] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [base64Logo, setBase64Logo] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [base64Avatar, setBase64Avatar] = useState(null);
  const [upiQrPreview, setUpiQrPreview] = useState(null);
  const [base64UpiQr, setBase64UpiQr] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(brandKitSchema),
    defaultValues: {
      businessName: "",
      categoryId: "",
      tagline: "",
      phone: "",
      whatsapp: "",
      email: "",
      instagramHandle: "",
      facebookHandle: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      logoUrl: "",
      avatarUrl: "",
      targetAudience: "",
      captionLanguage: "English",
      businessUsps: "",
      linkedinHandle: "",
      gmbReviewUrl: "",
      upiVpa: "",
      upiQrUrl: "",
      workingHours: "",
    },
  });

  // Populate form when brandkit query resolves
  useEffect(() => {
    if (brandKit) {
      reset({
        businessName: brandKit.businessName || "",
        categoryId: brandKit.categoryId || "",
        tagline: brandKit.tagline || "",
        phone: brandKit.phone || "",
        whatsapp: brandKit.whatsapp || "",
        email: brandKit.email || "",
        instagramHandle: brandKit.instagramHandle || "",
        facebookHandle: brandKit.facebookHandle || "",
        address: brandKit.address || "",
        city: brandKit.city || "",
        state: brandKit.state || "",
        country: brandKit.country || "India",
        logoUrl: brandKit.logoUrl || "",
        avatarUrl: brandKit.avatarUrl || "",
        targetAudience: brandKit.targetAudience || "",
        captionLanguage: brandKit.captionLanguage || "English",
        businessUsps: brandKit.businessUsps || "",
        linkedinHandle: brandKit.linkedinHandle || "",
        gmbReviewUrl: brandKit.gmbReviewUrl || "",
        upiVpa: brandKit.upiVpa || "",
        upiQrUrl: brandKit.upiQrUrl || "",
        workingHours: brandKit.workingHours || "",
      });

      if (brandKit.logoUrl) setLogoPreview(brandKit.logoUrl);
      if (brandKit.avatarUrl) setAvatarPreview(brandKit.avatarUrl);
      if (brandKit.upiQrUrl) setUpiQrPreview(brandKit.upiQrUrl);
    }
  }, [brandKit, reset]);

  // Handle Logo Upload
  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMsg("");
      const base64 = await readImageAsBase64(file, 5);
      setLogoPreview(base64);
      setBase64Logo(base64);
    } catch (err) {
      setErrorMsg(err.message || "Failed to read logo image.");
    }
  };

  // Handle Avatar Upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMsg("");
      const base64 = await readImageAsBase64(file, 5);
      setAvatarPreview(base64);
      setBase64Avatar(base64);
    } catch (err) {
      setErrorMsg(err.message || "Failed to read profile photo.");
    }
  };

  // Handle UPI QR Upload
  const handleUpiQrChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMsg("");
      const base64 = await readImageAsBase64(file, 5);
      setUpiQrPreview(base64);
      setBase64UpiQr(base64);
    } catch (err) {
      setErrorMsg(err.message || "Failed to read UPI QR image.");
    }
  };

  const onSubmit = async (data) => {
    try {
      setErrorMsg("");
      setScheduledNotice(null);
      const res = await saveBrandKit({
        ...data,
        base64Logo: base64Logo || undefined,
        base64Avatar: base64Avatar || undefined,
        base64UpiQr: base64UpiQr || undefined,
      });

      const syncedCount = res?.data?.syncedPostsCount ?? res?.syncedPostsCount ?? 0;
      if (syncedCount > 0) {
        setScheduledNotice({
          count: syncedCount,
          message: `Aapki ${syncedCount} post(s) currently scheduled/pending hain. Unke visual designs ko preserve rakha gaya hai taaki layout change na ho. Agar aapko unka visual graphic bhi update karna hai, toh aap unhe Scheduled Posts me jakar review & re-save kar sakte hain.`,
        });
      } else {
        setSuccessMsg("🎉 BrandKit saved successfully! All future posts will be branded automatically.");
        setTimeout(() => setSuccessMsg(""), 5000);
      }
    } catch (err) {
      setErrorMsg(err?.message || saveError?.message || "Failed to save BrandKit.");
    }
  };

  return (
    <BrandKitView
      isLoadingBrandKit={isLoadingBrandKit}
      successMsg={successMsg}
      scheduledNotice={scheduledNotice}
      onDismissNotice={() => setScheduledNotice(null)}
      navigate={navigate}
      errorMsg={errorMsg || (saveError ? saveError.message : "")}
      register={register}
      errors={errors}
      setValue={setValue}
      watch={watch}
      categories={categories}
      logoPreview={logoPreview}
      setLogoPreview={setLogoPreview}
      setBase64Logo={setBase64Logo}
      avatarPreview={avatarPreview}
      setAvatarPreview={setAvatarPreview}
      setBase64Avatar={setBase64Avatar}
      upiQrPreview={upiQrPreview}
      setUpiQrPreview={setUpiQrPreview}
      setBase64UpiQr={setBase64UpiQr}
      handleLogoChange={handleLogoChange}
      handleAvatarChange={handleAvatarChange}
      handleUpiQrChange={handleUpiQrChange}
      handleSubmit={handleSubmit(onSubmit)}
      isSaving={isSaving}
    />
  );
};
