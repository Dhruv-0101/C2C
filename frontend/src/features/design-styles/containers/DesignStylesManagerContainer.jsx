import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { designStyleApi } from "../../../services/designStyle.api";
import { QUERY_KEYS } from "../../../constants/queryKeys";
import { DesignStylesManagerView } from "../components/DesignStylesManagerView";

export const FONT_HEADER_OPTIONS = [
  "Space Grotesk",
  "Outfit",
  "Plus Jakarta Sans",
  "Montserrat",
  "Playfair Display",
  "Cinzel",
];

export const FONT_BODY_OPTIONS = [
  "Plus Jakarta Sans",
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
];

export const GRADIENT_PRESETS = [
  { name: "Sunset Gold", c1: "#F59E0B", c2: "#EC4899", c3: "#8B5CF6", rule: "linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #8B5CF6 100%)" },
  { name: "Emerald Cyber", c1: "#10B981", c2: "#06B6D4", c3: "#3B82F6", rule: "linear-gradient(135deg, #10B981 0%, #06B6D4 50%, #3B82F6 100%)" },
  { name: "Neon Sunset", c1: "#FF007A", c2: "#9600FF", c3: "#00E1FF", rule: "linear-gradient(135deg, #FF007A 0%, #9600FF 50%, #00E1FF 100%)" },
  { name: "Royal Purple", c1: "#6366F1", c2: "#A855F7", c3: "#EC4899", rule: "linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)" },
  { name: "Dark Titan", c1: "#1E293B", c2: "#0F172A", c3: "#020617", rule: "linear-gradient(135deg, #1E293B 0%, #0F172A 50%, #020617 100%)" },
];

function loadGoogleFont(fontFamily) {
  if (!fontFamily) return;
  const fontId = `google-font-${fontFamily.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(fontId)) return;

  const link = document.createElement("link");
  link.id = fontId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    fontFamily
  )}:wght@400;600;700;800&display=swap`;
  document.head.appendChild(link);
}

export const DesignStylesManagerContainer = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);

  const [gradientAngle, setGradientAngle] = useState(135);
  const [blendColor1, setBlendColor1] = useState("#F59E0B");
  const [blendColor2, setBlendColor2] = useState("#EC4899");
  const [blendColor3, setBlendColor3] = useState("#8B5CF6");
  const [useThreeColors, setUseThreeColors] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    primaryColor: "#F59E0B",
    secondaryColor: "#0D9488",
    accentColor: "#EC4899",
    backgroundColor: "#0B0F17",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #8B5CF6 100%)",
    fontHeader: "Space Grotesk",
    fontBody: "Plus Jakarta Sans",
  });

  useEffect(() => {
    if (useThreeColors) {
      setFormData((prev) => ({
        ...prev,
        gradient: `linear-gradient(${gradientAngle}deg, ${blendColor1} 0%, ${blendColor2} 50%, ${blendColor3} 100%)`,
        primaryColor: blendColor1,
        secondaryColor: blendColor2,
        accentColor: blendColor3,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        gradient: `linear-gradient(${gradientAngle}deg, ${blendColor1} 0%, ${blendColor2} 100%)`,
        primaryColor: blendColor1,
        secondaryColor: blendColor2,
        accentColor: blendColor2,
      }));
    }
  }, [gradientAngle, blendColor1, blendColor2, blendColor3, useThreeColors]);

  useEffect(() => {
    loadGoogleFont(formData.fontHeader);
    loadGoogleFont(formData.fontBody);
  }, [formData.fontHeader, formData.fontBody]);

  const {
    data: designStyleResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: [...QUERY_KEYS.DESIGN_STYLES.ALL, page, limit],
    queryFn: () => designStyleApi.getDesignStyles({ page, limit }),
    staleTime: 5 * 60 * 1000,
  });

  const designStyles = designStyleResponse?.data?.designStyles || [];
  const meta = designStyleResponse?.meta;

  useEffect(() => {
    designStyles.forEach((style) => {
      if (style.fontHeader) loadGoogleFont(style.fontHeader);
      if (style.fontBody) loadGoogleFont(style.fontBody);
    });
  }, [designStyles]);

  const createDesignStyleMutation = useMutation({
    mutationFn: (data) => designStyleApi.createDesignStyle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DESIGN_STYLES.ALL });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      setErrorMsg(err.message || "Failed to save master design style.");
    },
  });

  const deleteDesignStyleMutation = useMutation({
    mutationFn: (id) => designStyleApi.deleteDesignStyle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DESIGN_STYLES.ALL });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      primaryColor: "#F59E0B",
      secondaryColor: "#0D9488",
      accentColor: "#EC4899",
      backgroundColor: "#0B0F17",
      gradient: "linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #8B5CF6 100%)",
      fontHeader: "Space Grotesk",
      fontBody: "Plus Jakarta Sans",
    });
    setGradientAngle(135);
    setBlendColor1("#F59E0B");
    setBlendColor2("#EC4899");
    setBlendColor3("#8B5CF6");
    setErrorMsg("");
  };

  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      gradient: preset.rule,
      primaryColor: preset.c1,
      secondaryColor: preset.c2,
      accentColor: preset.c3 || preset.c2,
    }));
    if (preset.c1) setBlendColor1(preset.c1);
    if (preset.c2) setBlendColor2(preset.c2);
    if (preset.c3) {
      setBlendColor3(preset.c3);
      setUseThreeColors(true);
    } else {
      setUseThreeColors(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!formData.name.trim()) return;

    const payload = {
      ...formData,
      colors: [
        formData.primaryColor,
        formData.secondaryColor,
        formData.accentColor,
        formData.backgroundColor,
      ],
      rulesJson: {
        gradientAngle,
        blendColor1,
        blendColor2,
        blendColor3,
        useThreeColors,
      },
    };

    createDesignStyleMutation.mutate(payload);
  };

  return (
    <DesignStylesManagerView
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      errorMsg={errorMsg}
      gradientAngle={gradientAngle}
      setGradientAngle={setGradientAngle}
      blendColor1={blendColor1}
      setBlendColor1={setBlendColor1}
      blendColor2={blendColor2}
      setBlendColor2={setBlendColor2}
      blendColor3={blendColor3}
      setBlendColor3={setBlendColor3}
      useThreeColors={useThreeColors}
      setUseThreeColors={setUseThreeColors}
      formData={formData}
      setFormData={setFormData}
      designStyles={designStyles}
      meta={meta}
      page={page}
      setPage={setPage}
      setLimit={setLimit}
      isLoading={isLoading}
      error={error}
      createDesignStyleMutation={createDesignStyleMutation}
      deleteDesignStyleMutation={deleteDesignStyleMutation}
      handleApplyPreset={handleApplyPreset}
      handleFormSubmit={handleFormSubmit}
    />
  );
};
