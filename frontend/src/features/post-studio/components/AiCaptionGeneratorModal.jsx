import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Sparkles,
  Wand2,
  Copy,
  Check,
  X,
  MessageSquare,
  Globe,
  Flame,
  Zap,
  CheckCircle2,
  Hash,
  Plus,
  Trash2,
  Edit3,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Alert } from "../../../components/ui/Alert";
import { useAiCaption } from "../../../hooks/useAiCaption";

const TONES = [
  { id: "PROMOTIONAL", label: "Promotional", icon: "🚀", desc: "High conversion & sales pitch" },
  { id: "FESTIVE", label: "Festive", icon: "🪔", desc: "Warm celebration & cultural greetings" },
  { id: "PROFESSIONAL", label: "Professional", icon: "💼", desc: "Corporate & trustworthy tone" },
  { id: "WITTY", label: "Witty / Catchy", icon: "🎯", desc: "Fun, relatable & viral hook" },
  { id: "URGENT", label: "Limited Time", icon: "⚡", desc: "Scarcity & urgency triggers" },
  { id: "FRIENDLY", label: "Friendly", icon: "😊", desc: "Casual & community building" },
];

const LANGUAGES = [
  { id: "ENGLISH", label: "English 🇬🇧" },
  { id: "HINGLISH", label: "Hinglish 🇮🇳" },
  { id: "HINDI", label: "Hindi 🟧" },
];

const PLATFORMS = [
  { id: "INSTAGRAM", label: "Instagram" },
  { id: "FACEBOOK", label: "Facebook" },
  { id: "LINKEDIN", label: "LinkedIn" },
  { id: "ALL", label: "All Platforms" },
];

export const AiCaptionGeneratorModal = ({
  isOpen,
  onClose,
  initialTopic = "",
  initialOffer = "",
  onSelectCaption,
}) => {
  const [topic, setTopic] = useState(initialTopic || "");
  const [offerText, setOfferText] = useState(initialOffer || "");
  const [customText, setCustomText] = useState("");
  const [tone, setTone] = useState("PROMOTIONAL");
  const [language, setLanguage] = useState("ENGLISH");
  const [platform, setPlatform] = useState("INSTAGRAM");

  // Local Editable State for Output
  const [editableCaption, setEditableCaption] = useState("");
  const [hashtagsList, setHashtagsList] = useState([]);
  const [variantsList, setVariantsList] = useState([]);
  const [newHashtagInput, setNewHashtagInput] = useState("");
  const [aiSource, setAiSource] = useState("");

  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const { generateCaption, isGenerating, captionError } = useAiCaption();

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e?.preventDefault();
    try {
      const resData = await generateCaption({
        topic: topic || "Business Special Offer",
        offerText,
        customText,
        tone,
        language,
        platform,
      });

      // API Response Envelope: resData = { success: true, message: "...", data: { source, captionText, hashtags, variants } }
      const data = resData?.data || resData;

      setAiSource(data?.source || "AI");
      setEditableCaption(data?.captionText || "");
      setHashtagsList(data?.hashtags || []);
      setVariantsList(data?.variants || [data?.captionText]);
      setActiveVariantIndex(0);
    } catch (err) {
      console.error("Failed to generate AI caption:", err);
    }
  };

  const handleVariantSelect = (idx) => {
    setActiveVariantIndex(idx);
    if (variantsList[idx]) {
      setEditableCaption(variantsList[idx]);
    }
  };

  // Add Hashtag Manually
  const handleAddHashtag = (e) => {
    e?.preventDefault();
    const cleanTag = newHashtagInput.trim().replace(/\s+/g, "");
    if (!cleanTag) return;

    const formattedTag = cleanTag.startsWith("#") ? cleanTag : `#${cleanTag}`;

    if (!hashtagsList.includes(formattedTag)) {
      setHashtagsList([...hashtagsList, formattedTag]);
    }
    setNewHashtagInput("");
  };

  // Remove Hashtag
  const handleRemoveHashtag = (tagToRemove) => {
    setHashtagsList(hashtagsList.filter((tag) => tag !== tagToRemove));
  };

  // Compute Full Combined Output for Copy / Insertion
  const fullCombinedText = editableCaption
    ? `${editableCaption.trim()}\n\n${hashtagsList.join(" ")}`
    : "";

  const handleCopy = () => {
    if (!fullCombinedText) return;
    navigator.clipboard.writeText(fullCombinedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!fullCombinedText) return;
    onSelectCaption(fullCombinedText);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto font-sans">
      <div className="w-full max-w-3xl bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-6 shadow-2xl my-auto text-slate-100 max-h-[92vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2C384E] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-indigo-600 text-white shadow-lg">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-white flex items-center gap-2">
                <span>AI Caption & Hashtag Studio</span>
                {aiSource && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30 uppercase">
                    {aiSource.replace(/_/g, " ")}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Craft viral, high-converting social media captions. Edit captions & manage hashtags in real-time.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {captionError && (
          <Alert variant="error" message={captionError.message || "Failed to generate AI caption."} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-1">
          {/* Left Column: Generator Form Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Topic / Occasion / Product Name
              </label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Ganesh Chaturthi, Diwali Offer, New Bakery Item"
                className="bg-[#0B0F17] border-[#2C384E] text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Special Offer / Discount (Optional)
              </label>
              <Input
                value={offerText}
                onChange={(e) => setOfferText(e.target.value)}
                placeholder="e.g. Buy 1 Get 1 Free, Flat 25% Off"
                className="bg-[#0B0F17] border-[#2C384E] text-xs text-white"
              />
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Select Tone of Voice</label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id)}
                    className={`p-2 rounded-xl border text-left transition flex items-center gap-2 text-xs font-semibold ${
                      tone === t.id
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-md"
                        : "bg-[#0B0F17] border-[#2C384E] text-slate-400 hover:border-slate-600 hover:text-white"
                    }`}
                  >
                    <span className="text-base">{t.icon}</span>
                    <span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language & Platform */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-[#2C384E] rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-amber-500"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-[#2C384E] rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-amber-500"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating AI Copy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Generate Caption with AI ✨</span>
                </>
              )}
            </Button>
          </div>

          {/* Right Column: Interactive Editor for Caption & Hashtags */}
          <div className="flex flex-col justify-between bg-[#0B0F17] border border-[#2C384E] rounded-2xl p-4 space-y-4">
            <div className="space-y-4">
              {/* Output Bar & Variants */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>Editable Caption Copy</span>
                </span>

                {variantsList.length > 1 && (
                  <div className="flex items-center gap-1">
                    {variantsList.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleVariantSelect(idx)}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition ${
                          activeVariantIndex === idx
                            ? "bg-amber-500 text-black border-amber-400"
                            : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                        }`}
                      >
                        Option {idx + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Editable Text Area for Caption */}
              <div>
                <textarea
                  rows={6}
                  value={editableCaption}
                  onChange={(e) => setEditableCaption(e.target.value)}
                  placeholder="Click 'Generate Caption with AI ✨' or start typing your custom caption here..."
                  className="w-full p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white font-sans placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed resize-y"
                />
                <span className="text-[10px] text-slate-500 block text-right mt-1 font-mono">
                  {editableCaption.length} chars
                </span>
              </div>

              {/* Hashtag Manager Section */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hashtags Manager ({hashtagsList.length})</span>
                  </span>
                </div>

                {/* Add Custom Hashtag Input */}
                <form onSubmit={handleAddHashtag} className="flex gap-2">
                  <Input
                    value={newHashtagInput}
                    onChange={(e) => setNewHashtagInput(e.target.value)}
                    placeholder="Type hashtag (e.g. #DiwaliOffer) & press Enter..."
                    className="bg-[#131B2A] border-[#2C384E] text-xs text-white py-1.5 flex-1"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    className="border-slate-700 text-amber-400 hover:bg-slate-800 text-xs px-3"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                </form>

                {/* Badges with Individual Delete Button */}
                <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto p-1 bg-slate-900/50 rounded-xl border border-slate-800/80">
                  {hashtagsList.length === 0 ? (
                    <span className="text-[11px] text-slate-500 italic p-1">
                      No hashtags added yet. Generate or add custom hashtags above!
                    </span>
                  ) : (
                    hashtagsList.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] rounded-lg font-semibold group transition hover:border-amber-400"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHashtag(tag)}
                          className="p-0.5 rounded text-amber-400/60 hover:text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                          title="Remove hashtag"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                disabled={!fullCombinedText}
                onClick={handleCopy}
                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 text-xs py-2"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Text</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                disabled={!fullCombinedText}
                onClick={handleApply}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs py-2 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Use This Caption</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AiCaptionGeneratorModal;
