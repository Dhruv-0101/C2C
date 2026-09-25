import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, X, Calendar, Flame, CheckCircle2 } from "lucide-react";
import { useFestivals } from '@/features/calendar/hooks/useFestivals';

// Fallback upcoming festivals starting from today onwards
const FALLBACK_UPCOMING_FESTIVALS = [
  {
    id: "diwali-upcoming",
    name: "Diwali Celebration Special",
    category: "Upcoming Festival",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Grand Festive Offer & Greetings Templates",
    bannerUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "newyear-upcoming",
    name: "New Year Bash 2026",
    category: "Upcoming Event",
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    description: "New Year Special Offers & Frames",
    bannerUrl:
      "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "sale-upcoming",
    name: "Season Mega Sale",
    category: "Upcoming Promo",
    date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Exclusive Discount & Clearance Overlays",
    bannerUrl:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop",
  },
];

/**
 * Helper to compute friendly countdown badge with styling metadata
 */
const getCountdownMeta = (dateString) => {
  if (!dateString) {
    return {
      text: "Upcoming",
      badgeClass: "bg-slate-900/80 border-amber-400/40 text-amber-300",
      highlight: false,
    };
  }

  const targetDate = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffTime = targetDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      text: "🔥 Today!",
      badgeClass:
        "bg-gradient-to-r from-rose-500 to-amber-500 text-white border-rose-400/50 shadow-[0_0_12px_rgba(244,63,94,0.5)] font-black",
      highlight: true,
    };
  }

  if (diffDays === 1) {
    return {
      text: "⚡ Tomorrow!",
      badgeClass:
        "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-300/50 shadow-[0_0_12px_rgba(245,158,11,0.5)] font-black",
      highlight: true,
    };
  }

  return {
    text: `In ${diffDays} Days`,
    badgeClass:
      "bg-slate-950/85 backdrop-blur-md border-amber-400/40 text-amber-300 shadow-sm",
    highlight: false,
  };
};

/**
 * CelebrationWelcomeModal
 * Dynamic Welcome Showcase Modal displaying upcoming festivals from today onwards added by Admin.
 * Features luxury glassmorphism, animated confetti, glowing card showcases, and 1-click calendar actions.
 */
export const CelebrationWelcomeModal = ({ isOpen, onClose, authType = "login", user }) => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Fetch real festivals from database with high limit (up to 100)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { festivals, isLoading } = useFestivals({
    limit: 100,
    includeInactive: false,
    sortBy: "date",
    sortOrder: "asc",
  });

  // 1. Strictly prioritize real database festivals occurring today onwards
  const upcomingDbFestivals = (festivals || [])
    .filter((fest) => {
      if (!fest?.date || fest?.isActive === false) return false;
      const festDate = new Date(fest.date);
      return festDate >= today;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // 2. If no future dates exist, use the closest active database festivals
  const allDbFestivals = (festivals || [])
    .filter((fest) => fest?.isActive !== false)
    .sort((a, b) => Math.abs(new Date(a.date) - today) - Math.abs(new Date(b.date) - today));

  // 3. COMPULSORY: Database festivals always take precedence! Only fallback if DB has 0 records.
  const activeShowcase =
    upcomingDbFestivals.length > 0
      ? upcomingDbFestivals
      : allDbFestivals.length > 0
        ? allDbFestivals
        : FALLBACK_UPCOMING_FESTIVALS;

  // Rich Confetti Burst Particle Simulation
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = [
      "#F59E0B", // Amber
      "#FBBF24", // Yellow Gold
      "#FB7185", // Rose Coral
      "#10B981", // Emerald
      "#818CF8", // Indigo
      "#FFFFFF", // Shimmering White
    ];

    const particles = [];
    const particleCount = 85;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 80,
        y: canvas.height * 0.25,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.75) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.1 + 0.05,
        opacity: 1,
        gravity: 0.26,
        isRound: Math.random() > 0.6,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let activeParticles = 0;
      particles.forEach((p) => {
        if (p.opacity <= 0) return;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;
        p.x += Math.sin(p.wobble) * 0.8;
        p.opacity -= 0.0075;
        activeParticles++;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.isRound) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
        }
        ctx.restore();
      });

      if (activeParticles > 0) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isRegister = authType === "register";
  const userName = user?.fullName || user?.email?.split("@")[0] || "Creator";


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Canvas Overlay for Confetti Burst */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Ambient Lighting Accents behind the Card */}
      <div className="absolute -top-16 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-[110px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-16 right-1/4 w-80 h-80 bg-orange-600/15 rounded-full blur-[110px] pointer-events-none" />

      {/* Main Glassmorphism Modal Box */}
      <div className="relative z-20 w-full max-w-3xl bg-gradient-to-b from-[#131B2A] via-[#101726] to-[#0B0F17] border border-[#2C384E] rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.9),0_0_60px_rgba(245,158,11,0.12)] space-y-6 text-left overflow-hidden">
        {/* Specular Top Horizon Highlight Line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_rgba(245,158,11,0.8)]" />

        {/* Ambient Top Flare */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-44 bg-gradient-to-b from-amber-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Sleek Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm group"
          title="Close modal"
        >
          <X className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 text-center sm:text-left pr-8 sm:pr-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{isRegister ? "Welcome to BrandFlow! 🎉" : "Upcoming Festivals Ready! 🔥"}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          </div>

          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-tight">
            {isRegister ? (
              <>
                Hey{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400">
                  {userName}
                </span>
                , Welcome Aboard!
              </>
            ) : (
              <>
                Welcome Back,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400">
                  {userName}
                </span>
                !
              </>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-xl">
            High-engagement festivals are approaching. Launch ready-to-publish social media graphics with your custom brand frame &amp; AI captions in 1-click:
          </p>
        </div>

        {/* Dynamic Upcoming Admin Festivals Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {isLoading ? (
            <div className="col-span-3 py-12 text-center text-xs text-amber-300/70 animate-pulse flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
              Loading upcoming festivals...
            </div>
          ) : (
            activeShowcase.slice(0, 3).map((item) => {
              const countdown = getCountdownMeta(item.date);

              return (
                <div
                  key={item.id}
                  className="group relative rounded-2xl bg-gradient-to-b from-[#141C2E] via-[#0E1524] to-[#080C14] border border-slate-700/60 hover:border-amber-400/50 overflow-hidden shadow-xl shadow-black/30 hover:shadow-[0_16px_36px_-10px_rgba(245,158,11,0.2)] transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Specular Top Glow Highlight Accent */}
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent group-hover:via-amber-400 transition-all duration-500 z-10" />

                  {/* Image Thumbnail Container */}
                  <div className="w-full h-36 relative overflow-hidden bg-slate-950 rounded-t-2xl">
                    <img
                      src={
                        item.bannerUrl ||
                        item.imageUrl ||
                        item.banner ||
                        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop"
                      }
                      alt={item.name || item.title || "Festival"}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                    />

                    {/* Translucent Dark Scrim Overlay (Immune to light-mode white background overrides) */}
                    <div
                      className="image-scrim-overlay absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(14, 21, 36, 0.95) 0%, rgba(14, 21, 36, 0.35) 45%, transparent 100%)",
                      }}
                    />

                    {/* Top Relative Days Countdown Pill */}
                    <div
                      className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full border text-[10px] tracking-wide flex items-center gap-1.5 shadow-md backdrop-blur-md ${countdown.badgeClass}`}
                    >
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span>{countdown.text}</span>
                    </div>

                    {/* Region / Category Tag Top-Right */}
                    {(item.category || item.targetRegion) && (
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/15 text-[10px] font-semibold text-slate-200 tracking-wide flex items-center gap-1 shadow-md">
                        <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                        <span>{(item.category || item.targetRegion || "Festival").replace(/upcoming/i, "").trim() || "India"}</span>
                      </div>
                    )}
                  </div>

                  {/* Content Details */}
                  <div className="p-3.5 sm:p-4 space-y-2.5 text-left flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h4 className="font-heading font-extrabold text-sm sm:text-[15px] text-white group-hover:text-amber-300 transition-colors line-clamp-1 tracking-tight">
                        {item.name || item.title || "Upcoming Festival"}
                      </h4>
                      <p className="text-[11px] text-slate-300/80 line-clamp-2 leading-relaxed">
                        {item.description || "Festival celebration and special event"}
                      </p>
                    </div>

                    {/* Styled Festival Metadata Row */}
                    <div className="pt-2.5 flex items-center justify-between border-t border-white/[0.08] text-[11px]">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-400/25 text-amber-300 font-semibold text-[10px] tracking-wide">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        <span>
                          {item.date
                            ? new Date(item.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                            : "Upcoming"}
                        </span>
                      </div>

                      {/* <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-400/25 text-emerald-400 font-semibold text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>365 Days Ready</span>
                      </div> */}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="pt-3 border-t border-white/[0.08] space-y-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/calendar");
            }}
            className="group relative w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:via-amber-200 hover:to-amber-400 text-slate-950 font-extrabold text-sm sm:text-base border border-amber-300/40 shadow-[0_8px_25px_rgba(245,158,11,0.3)] hover:shadow-[0_12px_35px_rgba(245,158,11,0.45)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2.5 overflow-hidden cursor-pointer"
          >
            {/* Shimmer Light Reflection Sweep */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            <Calendar className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Explore 365-Day Festival Calendar</span>
            <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5] group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          {/* Micro Footer Row */}
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              100% automated with your brand logo &amp; contact frames
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer hover:underline"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CelebrationWelcomeModal;
