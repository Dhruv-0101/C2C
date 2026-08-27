import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Building2,
  Phone,
  Type,
  Wand2,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Pause,
  Play,
  Zap,
} from 'lucide-react';

const DEMO_PRESETS = [
  {
    name: '✨ Diwali Special',
    businessName: 'Royal Sweets & Bakery',
    headline: 'Grand Festive Offer 30% OFF',
    phone: '+91 98765 43210',
    bgImage:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
    frameStyle: 'classic_gold',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: '☕ Cafe Promo',
    businessName: 'Sunrise Artisan Cafe',
    headline: 'Buy 1 Coffee Get 1 Free',
    phone: '+91 99887 76655',
    bgImage:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop',
    frameStyle: 'top_bottom',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: '💎 Jewellery Sale',
    businessName: 'Ornate Gold & Diamonds',
    headline: 'Zero Making Charges Week',
    phone: '+91 91234 56789',
    bgImage:
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
    frameStyle: 'corner_glass',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
  },
];

const FRAME_OPTIONS = [
  { id: 'classic_gold', label: 'Classic Gold Frame' },
  { id: 'top_bottom', label: 'Top & Bottom Banner' },
  { id: 'corner_glass', label: 'Corner Glass Footer' },
];

export const InteractiveWorkflowDemo = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [presetIndex, setPresetIndex] = useState(0);

  const [businessName, setBusinessName] = useState(DEMO_PRESETS[0].businessName);
  const [headline, setHeadline] = useState(DEMO_PRESETS[0].headline);
  const [phone, setPhone] = useState(DEMO_PRESETS[0].phone);
  const [bgImage, setBgImage] = useState(DEMO_PRESETS[0].bgImage);
  const [frameStyle, setFrameStyle] = useState(DEMO_PRESETS[0].frameStyle);
  const [avatarUrl, setAvatarUrl] = useState(DEMO_PRESETS[0].avatar);
  const [liked, setLiked] = useState(false);

  // Auto-Cycle Preset Simulation when playing
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setPresetIndex((prev) => {
        const nextIdx = (prev + 1) % DEMO_PRESETS.length;
        const preset = DEMO_PRESETS[nextIdx];
        setBusinessName(preset.businessName);
        setHeadline(preset.headline);
        setPhone(preset.phone);
        setBgImage(preset.bgImage);
        setFrameStyle(preset.frameStyle);
        setAvatarUrl(preset.avatar);
        return nextIdx;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // Pause auto-play when user interacts manually
  const pauseOnInteraction = () => {
    if (isPlaying) {
      setIsPlaying(false);
    }
  };

  const applyPreset = (preset) => {
    pauseOnInteraction();
    setBusinessName(preset.businessName);
    setHeadline(preset.headline);
    setPhone(preset.phone);
    setBgImage(preset.bgImage);
    setFrameStyle(preset.frameStyle);
    setAvatarUrl(preset.avatar);
  };

  return (
    <div className="w-full glass-panel p-4 sm:p-5 rounded-3xl border border-[#2C384E] bg-gradient-to-b from-[#131B2A] via-[#101726] to-[#0B0F17] shadow-2xl relative overflow-hidden text-left">
      {/* Background Glows */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Compact Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#2C384E] pb-2.5 mb-3.5">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Live Simulator
          </div>
          <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
            {isPlaying ? 'Auto-Simulating Post Creation...' : 'Manual Control Active'}
          </h3>
        </div>

        {/* Play/Pause Control & Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-slate-950" />
                <span>Pause Auto-Demo</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Play Auto-Demo</span>
              </>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-1.5 border-l border-[#2C384E] pl-2">
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#0B0F17] border border-[#2C384E] text-slate-300 hover:text-white hover:border-amber-500/50 transition-all"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Compact Form Controls (Fits without scroll) */}
        <div className="lg:col-span-6 space-y-3">
          {/* Row 1: Business Name & Phone Inputs side-by-side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1 uppercase tracking-wider">
                <Building2 className="w-3 h-3 text-amber-400" /> Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onFocus={pauseOnInteraction}
                onChange={(e) => {
                  pauseOnInteraction();
                  setBusinessName(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1 uppercase tracking-wider">
                <Phone className="w-3 h-3 text-indigo-400" /> Phone Contact
              </label>
              <input
                type="text"
                value={phone}
                onFocus={pauseOnInteraction}
                onChange={(e) => {
                  pauseOnInteraction();
                  setPhone(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs font-mono font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Row 2: Headline Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1 uppercase tracking-wider">
              <Type className="w-3 h-3 text-teal-400" /> Headline / Offer Text
            </label>
            <input
              type="text"
              value={headline}
              onFocus={pauseOnInteraction}
              onChange={(e) => {
                pauseOnInteraction();
                setHeadline(e.target.value);
              }}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Row 3: Canva Frame Style Selector */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1 uppercase tracking-wider">
              <Layers className="w-3 h-3 text-amber-400" /> Select Canva Frame Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FRAME_OPTIONS.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => {
                    pauseOnInteraction();
                    setFrameStyle(frame.id);
                  }}
                  className={`py-2 px-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                    frameStyle === frame.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-[#0B0F17] border-[#2C384E] text-slate-400 hover:text-white'
                  }`}
                >
                  {frame.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-[11px] text-amber-300 font-semibold">
            <Wand2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>0ms Real-Time Preview — Simple, clean & 100% achievable designs.</span>
          </div>
        </div>

        {/* Right Column: Simulated Social Post Canvas Container */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-xs rounded-2xl bg-[#0B0F17] border border-[#2C384E] p-3 shadow-2xl space-y-2.5">
            {/* Social Header */}
            <div className="flex items-center justify-between border-b border-[#2C384E] pb-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                  {businessName.charAt(0) || 'B'}
                </div>
                <span className="font-bold text-white truncate max-w-[150px]">
                  {businessName || 'Your Business Name'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {isPlaying && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
                <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase border border-amber-500/40">
                  Live Preview
                </span>
              </div>
            </div>

            {/* Graphic Post Canvas Area */}

            {/* FRAME STYLE 1: Classic Gold Frame */}
            {frameStyle === 'classic_gold' && (
              <div className="w-full aspect-square rounded-xl bg-slate-950 relative overflow-hidden border-2 border-amber-400/80 flex flex-col justify-between p-3.5 shadow-xl">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(11, 15, 23, 0.2), rgba(11, 15, 23, 0.75)), url("${bgImage}")`,
                  }}
                />

                <div className="relative z-10 text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-black/80 text-amber-300 text-[10px] font-extrabold border border-amber-400/50">
                    ✨ Special Offer
                  </span>
                </div>

                <div className="relative z-10 text-center space-y-1 my-auto px-2">
                  <h4 className="font-heading font-extrabold text-lg sm:text-xl text-white drop-shadow-md leading-snug">
                    {headline || 'Headline Here'}
                  </h4>
                </div>

                {/* Bottom Bar */}
                <div className="relative z-10 p-2.5 rounded-lg bg-slate-900/90 border border-amber-400/80 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded-full border border-amber-400 bg-slate-800 overflow-hidden shrink-0">
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left text-[11px] overflow-hidden">
                      <p className="font-bold text-white truncate max-w-[120px]">{businessName}</p>
                      <p className="text-[9px] text-amber-300 font-mono font-bold">📞 {phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FRAME STYLE 2: Top & Bottom Banner */}
            {frameStyle === 'top_bottom' && (
              <div className="w-full aspect-square rounded-xl bg-slate-950 relative overflow-hidden border-2 border-teal-400/80 flex flex-col justify-between shadow-xl">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(11, 15, 23, 0.25), rgba(11, 15, 23, 0.75)), url("${bgImage}")`,
                  }}
                />

                {/* Top Banner */}
                <div className="relative z-10 p-2 bg-slate-950/90 border-b border-teal-400/80 text-center">
                  <span className="text-[10px] font-extrabold text-teal-300 uppercase tracking-wider">
                    ⚡ {businessName || 'Business Name'}
                  </span>
                </div>

                {/* Center Headline */}
                <div className="relative z-10 text-center space-y-1 my-auto px-3">
                  <h4 className="font-heading font-extrabold text-lg sm:text-xl text-white drop-shadow-md leading-snug">
                    {headline || 'Headline Here'}
                  </h4>
                </div>

                {/* Bottom Strip */}
                <div className="relative z-10 p-2 bg-slate-950/90 border-t border-teal-400/80 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full border border-teal-400 overflow-hidden shrink-0">
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-bold text-white truncate max-w-[120px]">{businessName}</span>
                  </div>
                  <span className="font-mono text-[9px] font-bold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                    📞 {phone}
                  </span>
                </div>
              </div>
            )}

            {/* FRAME STYLE 3: Corner Glass Footer */}
            {frameStyle === 'corner_glass' && (
              <div className="w-full aspect-square rounded-xl bg-slate-950 relative overflow-hidden border-2 border-indigo-400/80 flex flex-col justify-between p-3.5 shadow-xl">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(11, 15, 23, 0.25), rgba(11, 15, 23, 0.75)), url("${bgImage}")`,
                  }}
                />

                {/* Top Corner Badge */}
                <div className="relative z-10 flex justify-between items-center">
                  <div className="px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-300 text-indigo-300 text-[10px] font-bold shadow-md">
                    👑 Premium Promo
                  </div>
                </div>

                {/* Middle Headline */}
                <div className="relative z-10 text-center space-y-1 my-auto px-2">
                  <h4 className="font-heading font-extrabold text-lg sm:text-xl text-white drop-shadow-md leading-snug">
                    {headline || 'Headline Here'}
                  </h4>
                </div>

                {/* Frosted Glass Footer */}
                <div className="relative z-10 p-2.5 rounded-xl backdrop-blur-md bg-indigo-950/80 border border-indigo-300/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg border border-indigo-300 overflow-hidden shrink-0">
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left text-[11px]">
                      <p className="font-bold text-white truncate max-w-[120px]">{businessName}</p>
                      <p className="text-[9px] font-mono font-bold text-indigo-300">📞 {phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Social Interactive Footer */}
            <div className="flex items-center justify-between text-slate-400 pt-0.5 text-[11px] px-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-1 transition ${liked ? 'text-rose-500 font-bold' : 'hover:text-white'}`}
                >
                  <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500' : ''}`} />
                  <span>{liked ? '1,249' : '1,248'}</span>
                </button>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>84</span>
                </div>
                <Share2 className="w-3.5 h-3.5" />
              </div>
              <Bookmark className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
