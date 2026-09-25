import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { brandKitSchema } from '@/features/brandkit/validations/brandkit.validation';
import { useBrandKit } from '@/features/brandkit/hooks/useBrandKit';
import { useCategories } from '@/features/admin/categories/hooks/useCategories';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { createImagePreview } from '@/shared/utils/file.util';
import { BrandKitView } from "../components/BrandKitView";

/**
 * BrandKitPage Component
 * Canonical Route Page (/brandkit) handling business brand profile, logo upload,
 * scalable 1000+ category search/pagination picker, predefined target audiences,
 * default AI caption language, and key business USPs.
 */
export const BrandKitPage = () => {
  const navigate = useNavigate();
  const { brandKit, isLoading: isLoadingBrandKit, saveBrandKit, isSaving, saveError } = useBrandKit();

  // Category Search & Server-Side Pagination State (Scales to 1,000+ categories)
  const [categorySearch, setCategorySearch] = useState("");
  const debouncedCategorySearch = useDebounce(categorySearch, 300);
  const [categoryPage, setCategoryPage] = useState(1);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategoryObj, setSelectedCategoryObj] = useState(null);

  const {
    categories: paginatedCategories,
    meta: categoryMeta,
    isLoading: isLoadingCategories,
  } = useCategories({
    page: categoryPage,
    limit: 12,
    search: debouncedCategorySearch,
  });

  // Reset category page when user searches
  useEffect(() => {
    setCategoryPage(1);
  }, [debouncedCategorySearch]);

  const [successMsg, setSuccessMsg] = useState("");
  const [scheduledNotice, setScheduledNotice] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [upiQrPreview, setUpiQrPreview] = useState(null);
  const [upiQrFile, setUpiQrFile] = useState(null);

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

      if (brandKit.category) {
        setSelectedCategoryObj(brandKit.category);
      }
      if (brandKit.logoUrl) setLogoPreview(brandKit.logoUrl);
      if (brandKit.avatarUrl) setAvatarPreview(brandKit.avatarUrl);
      if (brandKit.upiQrUrl) setUpiQrPreview(brandKit.upiQrUrl);
    }
  }, [brandKit, reset]);

  // Handle Category Selection from Paginated Search Modal
  const handleSelectCategory = (category) => {
    if (!category) {
      setValue("categoryId", "");
      setSelectedCategoryObj(null);
    } else {
      setValue("categoryId", category.id);
      setSelectedCategoryObj(category);
    }
    setIsCategoryModalOpen(false);
  };

  // Handle Logo Upload
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMsg("");
      const preview = createImagePreview(file, 5);
      setLogoPreview(preview);
      setLogoFile(file);
    } catch (err) {
      setErrorMsg(err.message || "Failed to process logo image.");
    }
  };

  // Handle Avatar Upload
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMsg("");
      const preview = createImagePreview(file, 5);
      setAvatarPreview(preview);
      setAvatarFile(file);
    } catch (err) {
      setErrorMsg(err.message || "Failed to process profile photo.");
    }
  };

  // Handle UPI QR Upload
  const handleUpiQrChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMsg("");
      const preview = createImagePreview(file, 5);
      setUpiQrPreview(preview);
      setUpiQrFile(file);
    } catch (err) {
      setErrorMsg(err.message || "Failed to process UPI QR image.");
    }
  };

  const onSubmit = async (data) => {
    try {
      setErrorMsg("");
      setScheduledNotice(null);

      let payload;
      if (logoFile || avatarFile || upiQrFile) {
        const fd = new FormData();
        Object.entries(data).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== "") {
            fd.append(key, val);
          }
        });
        if (logoFile) fd.append("logo", logoFile);
        if (avatarFile) fd.append("avatar", avatarFile);
        if (upiQrFile) fd.append("upiQr", upiQrFile);
        payload = fd;
      } else {
        payload = { ...data };
      }

      const res = await saveBrandKit(payload);

      const syncedCount = res?.data?.syncedPostsCount ?? res?.syncedPostsCount ?? 0;
      if (syncedCount > 0) {
        setScheduledNotice({
          count: syncedCount,
          message: `Aapki ${syncedCount} post(s) currently scheduled/pending hain. Unke visual designs ko preserve rakha gaya hai taaki layout change na ho. Agar aapko unka visual graphic bhi update karna hai, toh aap unhe Scheduled Posts me jakar review & re-save kar sakte hain.`,
        });
      } else {
        setSuccessMsg("🎉 BrandKit saved successfully! All future posts and AI captions will use this profile.");
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
      // Scalable Category Search & Paginated Selector Props
      categories={paginatedCategories}
      categoryMeta={categoryMeta}
      isLoadingCategories={isLoadingCategories}
      categorySearch={categorySearch}
      setCategorySearch={setCategorySearch}
      categoryPage={categoryPage}
      setCategoryPage={setCategoryPage}
      isCategoryModalOpen={isCategoryModalOpen}
      setIsCategoryModalOpen={setIsCategoryModalOpen}
      selectedCategoryObj={selectedCategoryObj}
      handleSelectCategory={handleSelectCategory}
      // Assets Upload Props
      logoPreview={logoPreview}
      setLogoPreview={setLogoPreview}
      setLogoFile={setLogoFile}
      avatarPreview={avatarPreview}
      setAvatarPreview={setAvatarPreview}
      setAvatarFile={setAvatarFile}
      upiQrPreview={upiQrPreview}
      setUpiQrPreview={setUpiQrPreview}
      setUpiQrFile={setUpiQrFile}
      handleLogoChange={handleLogoChange}
      handleAvatarChange={handleAvatarChange}
      handleUpiQrChange={handleUpiQrChange}
      handleSubmit={handleSubmit(onSubmit)}
      isSaving={isSaving}
    />
  );
};

export { BrandKitPage as BrandKitContainer };
export default BrandKitPage;
