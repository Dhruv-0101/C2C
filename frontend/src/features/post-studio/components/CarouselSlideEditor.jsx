import React from 'react';
import { Plus, Trash2, Tag, Type, AlignLeft, ListOrdered, Image, Sparkles } from 'lucide-react';

/**
 * 🎠 CarouselSlideEditor
 * In-place editor for customizing the active carousel slide's title, subtitle,
 * tag badge, bullet points, and background image.
 */
export const CarouselSlideEditor = ({
  activeSlide,
  activeSlideIndex,
  totalSlides,
  onChangeSlide,
  onOpenAiGenerator,
}) => {
  if (!activeSlide) return null;

  const handleFieldChange = (field, value) => {
    onChangeSlide({
      ...activeSlide,
      [field]: value,
    });
  };

  const handleAddBulletPoint = () => {
    const currentPoints = Array.isArray(activeSlide.bulletPoints) ? activeSlide.bulletPoints : [];
    if (currentPoints.length >= 4) return;
    onChangeSlide({
      ...activeSlide,
      bulletPoints: [...currentPoints, 'New actionable takeaway point'],
    });
  };

  const handleUpdateBulletPoint = (index, value) => {
    const currentPoints = [...(activeSlide.bulletPoints || [])];
    currentPoints[index] = value;
    onChangeSlide({
      ...activeSlide,
      bulletPoints: currentPoints,
    });
  };

  const handleDeleteBulletPoint = (index) => {
    const currentPoints = (activeSlide.bulletPoints || []).filter((_, idx) => idx !== index);
    onChangeSlide({
      ...activeSlide,
      bulletPoints: currentPoints,
    });
  };

  return (
    <div className="bg-[#131B2A]/90 border border-[#2C384E] rounded-2xl p-4 shadow-xl space-y-4">
      {/* Slide Header */}
      <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-bold font-mono text-xs flex items-center justify-center">
            {activeSlideIndex + 1}
          </span>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              Editing Slide {activeSlideIndex + 1} of {totalSlides}
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                {activeSlide.slideType || 'CONTENT'}
              </span>
            </h4>
          </div>
        </div>

        {onOpenAiGenerator && (
          <button
            type="button"
            onClick={onOpenAiGenerator}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Regenerate with AI</span>
          </button>
        )}
      </div>

      {/* Slide Tag / Pill Input */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Tag className="w-3 h-3 text-amber-400" />
          <span>Slide Pill Badge (Top Tag)</span>
        </label>
        <input
          type="text"
          value={activeSlide.tagText || ''}
          onChange={(e) => handleFieldChange('tagText', e.target.value)}
          placeholder="e.g. SWIPE TO LEARN 👉, STEP 1, HEALTH TIP"
          className="w-full px-3 py-1.5 bg-[#0B0F17] border border-[#2C384E] rounded-xl text-white text-xs font-medium focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Slide Main Title */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Type className="w-3 h-3 text-amber-400" />
          <span>Slide Title</span>
        </label>
        <input
          type="text"
          value={activeSlide.title || ''}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          placeholder="e.g. 1. Eat Antioxidant-Rich Superfoods"
          className="w-full px-3 py-2 bg-[#0B0F17] border border-[#2C384E] rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Slide Subtitle */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <AlignLeft className="w-3 h-3 text-amber-400" />
          <span>Slide Subtitle</span>
        </label>
        <input
          type="text"
          value={activeSlide.subtitle || ''}
          onChange={(e) => handleFieldChange('subtitle', e.target.value)}
          placeholder="e.g. Natural antioxidants neutralize harmful free radicals"
          className="w-full px-3 py-1.5 bg-[#0B0F17] border border-[#2C384E] rounded-xl text-white text-xs font-medium focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Bullet Points Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <ListOrdered className="w-3 h-3 text-amber-400" />
            <span>Key Takeaway Points ({activeSlide.bulletPoints?.length || 0}/4)</span>
          </label>
          {(!activeSlide.bulletPoints || activeSlide.bulletPoints.length < 4) && (
            <button
              type="button"
              onClick={handleAddBulletPoint}
              className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Point</span>
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {(activeSlide.bulletPoints || []).map((point, pIdx) => (
            <div key={pIdx} className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center justify-center shrink-0">
                ✓
              </span>
              <input
                type="text"
                value={point}
                onChange={(e) => handleUpdateBulletPoint(pIdx, e.target.value)}
                placeholder="Point takeaway text..."
                className="flex-1 px-2.5 py-1.5 bg-[#0B0F17] border border-[#2C384E] rounded-lg text-white text-xs font-normal focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => handleDeleteBulletPoint(pIdx)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                title="Remove point"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarouselSlideEditor;
