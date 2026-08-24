import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { designStyleApi } from "../../../services/designStyle.api";
import { QUERY_KEYS } from "../../../constants/queryKeys";
import { DesignStylesManagerView } from "../components/DesignStylesManagerView";

export const FONT_HEADER_OPTIONS = [
  "Space Grotesk",
  "Playfair Display",
  "Outfit",
  "Cinzel",
  "Roboto",
  "Montserrat",
  "Poppins",
];

export const FONT_BODY_OPTIONS = [
  "Plus Jakarta Sans",
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
];

export const GRADIENT_PRESETS = [
  {
    name: "Sunset Gold",
    rule: "linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #8B5CF6 100%)",
    c1: "#F59E0B",
    c2: "#EC4899",
    c3: "#8B5CF6",
  },
  {
    name: "Cyber Neon",
    rule: "linear-gradient(135deg, #00F0FF 0%, #FF007A 100%)",
    c1: "#00F0FF",
    c2: "#FF007A",
    c3: "",
  },
  {
    name: "Emerald Teal",
    rule: "linear-gradient(135deg, #0D9488 0%, #10B981 50%, #059669 100%)",
    c1: "#0D9488",
    c2: "#10B981",
    c3: "#059669",
  },
  {
    name: "Royal Flame",
    rule: "linear-gradient(135deg, #EF4444 0%, #F59E0B 100%)",
    c1: "#EF4444",
    c2: "#F59E0B",
    c3: "",
  },
  {
    name: "Midnight Purple",
    rule: "linear-gradient(135deg, #1E1B4B 0%, #7C3AED 50%, #DB2777 100%)",
    c1: "#1E1B4B",
    c2: "#7C3AED",
    c3: "#DB2777",
  },
];

const loadGoogleFont = (fontName) => {
  if (!fontName) return;
  const fontSlug = fontName.replace(/\s+/g, "+");
  const linkId = `google-font-${fontSlug}`;
  if (!document.getElementById(linkId)) {
    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontSlug}:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap`;
    document.head.appendChild(link);
  }
};

/**
 * DesignStylesManagerContainer
 * Container component handling Master Design Styles, gradient math engine, Google Fonts injection, and mutations.
 */
export const DesignStylesManagerContainer = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
    let rule = "";
    if (useThreeColors && blendColor3) {
      rule = `linear-gradient(${gradientAngle}deg, ${blendColor1} 0%, ${blendColor2} 50%, ${blendColor3} 100%)`;
    } else {
      rule = `linear-gradient(${gradientAngle}deg, ${blendColor1} 0%, ${blendColor2} 100%)`;
    }

    setFormData((prev) => ({
      ...prev,
      gradient: rule,
      primaryColor: blendColor1,
      secondaryColor: blendColor2,
      accentColor: useThreeColors && blendColor3 ? blendColor3 : blendColor2,
    }));
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
    queryKey: QUERY_KEYS.DESIGN_STYLES.ALL,
    queryFn: () => designStyleApi.getDesignStyles(),
    staleTime: 5 * 60 * 1000,
  });

  const designStyles = designStyleResponse?.data?.designStyles || [];

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
      isLoading={isLoading}
      error={error}
      createDesignStyleMutation={createDesignStyleMutation}
      deleteDesignStyleMutation={deleteDesignStyleMutation}
      handleApplyPreset={handleApplyPreset}
      handleFormSubmit={handleFormSubmit}
    />
  );
};
