import React, { useState, useEffect } from "react";
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
  const { brandKit, isLoading: isLoadingBrandKit, saveBrandKit, isSaving, saveError } = useBrandKit();
  const { categories } = useCategories({ page: 1, limit: 20 });

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [base64Logo, setBase64Logo] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [base64Avatar, setBase64Avatar] = useState(null);

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
      websiteUrl: "",
      instagramHandle: "",
      facebookHandle: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      logoUrl: "",
      avatarUrl: "",
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
        websiteUrl: brandKit.websiteUrl || "",
        instagramHandle: brandKit.instagramHandle || "",
        facebookHandle: brandKit.facebookHandle || "",
        address: brandKit.address || "",
        city: brandKit.city || "",
        state: brandKit.state || "",
        country: brandKit.country || "India",
        logoUrl: brandKit.logoUrl || "",
        avatarUrl: brandKit.avatarUrl || "",
      });

      if (brandKit.logoUrl) setLogoPreview(brandKit.logoUrl);
      if (brandKit.avatarUrl) setAvatarPreview(brandKit.avatarUrl);
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

  const onSubmit = async (data) => {
    try {
      setErrorMsg("");
      await saveBrandKit({
        ...data,
        base64Logo: base64Logo || undefined,
        base64Avatar: base64Avatar || undefined,
      });
      setSuccessMsg("🎉 AI BrandKit saved successfully! All future posts will be branded automatically.");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setErrorMsg(err?.message || saveError?.message || "Failed to save AI BrandKit.");
    }
  };

  return (
    <BrandKitView
      isLoadingBrandKit={isLoadingBrandKit}
      successMsg={successMsg}
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
      handleLogoChange={handleLogoChange}
      handleAvatarChange={handleAvatarChange}
      handleSubmit={handleSubmit(onSubmit)}
      isSaving={isSaving}
    />
  );
};
