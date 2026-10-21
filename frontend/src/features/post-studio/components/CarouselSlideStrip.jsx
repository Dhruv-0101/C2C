import React from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Sparkles, Layers } from 'lucide-react';

/**
 * 🎠 CarouselSlideStrip
 * Bottom interactive thumbnail strip displaying all slides in the carousel deck.
 * Supports switching active slide, adding slides (up to 10), deleting slides (min 2),
 * and reordering slides left and right.
 */
export const CarouselSlideStrip = ({
  slides = [],
  activeSlideIndex = 0,
  onSelectSlide,
  onAddSlide,
  onDeleteSlide,
  onMoveSlide,
  onOpenAiGenerator,
}) => {
  return (
    <div className="w-full bg-[#0F172A]/90 border border-[#2C384E] rounded-2xl p-3 shadow-xl backdrop-blur-md space-y-2.5">
      {/* Top Header of the Strip */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-heading font-extrabold text-white flex items-center gap-1.5">
              Carousel Slides
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] border border-amber-500/30">
                {slides.length} / 10
              </span>
            </span>
            <p className="text-[10px] text-slate-400">
              Active: Slide {activeSlideIndex + 1} • Swipeable Instagram & Facebook Carousel
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onOpenAiGenerator && (
            <button
              type="button"
              onClick={onOpenAiGenerator}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition hover:scale-105 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>AI Deck Generator</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAddSlide}
            disabled={slides.length >= 10}
            className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] flex items-center gap-1 transition ${
              slides.length >= 10
                ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-sm cursor-pointer'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>Add Slide</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Thumbnails */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar">
        {slides.map((slide, idx) => {
          const isActive = idx === activeSlideIndex;
          const isFirst = idx === 0;
          const isLast = idx === slides.length - 1;

          return (
            <div
              key={slide.id || `slide-${idx}`}
              onClick={() => onSelectSlide(idx)}
              className={`group relative shrink-0 w-36 h-28 rounded-xl border p-2 cursor-pointer transition-all duration-200 flex flex-col justify-between select-none ${
                isActive
                  ? 'bg-slate-800/90 border-amber-500 ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10'
                  : 'bg-[#131B2A]/70 border-[#2C384E] hover:border-slate-500 hover:bg-slate-800/50'
              }`}
            >
              {/* Slide Top Row: Badge + Delete */}
              <div className="flex items-center justify-between">
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider ${
                    isActive
                      ? 'bg-amber-500 text-slate-950'
                      : isFirst
                      ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/30'
                      : isLast
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isFirst ? '1. HOOK' : isLast ? `${idx + 1}. CTA` : `${idx + 1}. CONTENT`}
                </span>

                {/* Reorder & Delete controls */}
                <div
                  className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  {!isFirst && (
                    <button
                      type="button"
                      title="Move Left"
                      onClick={() => onMoveSlide(idx, idx - 1)}
                      className="p-1 rounded bg-slate-900/80 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 text-[10px]"
                    >
                      <ChevronLeft className="w-2.5 h-2.5" />
                    </button>
                  )}
                  {!isLast && (
                    <button
                      type="button"
                      title="Move Right"
                      onClick={() => onMoveSlide(idx, idx + 1)}
                      className="p-1 rounded bg-slate-900/80 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 text-[10px]"
                    >
                      <ChevronRight className="w-2.5 h-2.5" />
                    </button>
                  )}
                  {slides.length > 2 && (
                    <button
                      type="button"
                      title="Delete Slide"
                      onClick={() => onDeleteSlide(idx)}
                      className="p-1 rounded bg-slate-900/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-[10px]"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Slide Title Teaser */}
              <div className="space-y-0.5 my-auto">
                <p className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
                  {slide.title || `Slide ${idx + 1}`}
                </p>
                {slide.tagText && (
                  <p className="text-[9px] text-amber-400/90 font-medium truncate">
                    {slide.tagText}
                  </p>
                )}
              </div>

              {/* Bottom Info: Bullet count */}
              <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-700/50">
                <span>{slide.bulletPoints?.length || 0} points</span>
                {isActive && (
                  <span className="text-amber-400 font-bold flex items-center gap-0.5">
                    ● Active
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Quick Add Slide Button */}
        {slides.length < 10 && (
          <button
            type="button"
            onClick={onAddSlide}
            className="shrink-0 w-24 h-28 rounded-xl border border-dashed border-[#2C384E] hover:border-amber-500/60 bg-[#131B2A]/40 hover:bg-slate-800/40 text-slate-400 hover:text-amber-300 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <div className="p-2 rounded-full bg-slate-800 text-slate-300 group-hover:bg-amber-500/20 group-hover:text-amber-400">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold">Add Slide</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CarouselSlideStrip;
