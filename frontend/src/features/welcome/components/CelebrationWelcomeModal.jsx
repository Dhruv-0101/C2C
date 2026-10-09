import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, X, Calendar, Flame, CheckCircle2 } from "lucide-react";
import { useFestivals } from '@/features/calendar/hooks/useFestivals';
import { useTheme } from '@/shared/hooks';
import { parseCalendarDate } from '@/shared/utils/date.util';

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

  const targetDate = parseCalendarDate(dateString);
  if (!targetDate) {
    return {
      text: "Upcoming",
      badgeClass: "bg-slate-900/80 border-amber-400/40 text-amber-300",
      highlight: false,
    };
  }

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = targetDate.getTime() - todayMidnight.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
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

  if (diffDays < 0) {
    return {
      text: diffDays === -1 ? "Yesterday" : `${Math.abs(diffDays)} Days Ago`,
      badgeClass: "bg-slate-800 text-slate-400 border-slate-700 font-semibold",
      highlight: false,
    };
  }

  return {
    text: `In ${diffDays} Days`,
    badgeClass:
      "bg-white/95 dark:bg-slate-950/85 backdrop-blur-md border-amber-400/50 dark:border-amber-400/40 text-amber-800 dark:text-amber-300 shadow-sm font-semibold",
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
  const { isDark } = useTheme();

  // Fetch real festivals from database with high limit (up to 100)
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

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
      const festDate = parseCalendarDate(fest.date);
      return festDate && festDate.getTime() >= todayMidnight.getTime();
    })
    .sort((a, b) => {
      const da = parseCalendarDate(a.date)?.getTime() || 0;
      const db = parseCalendarDate(b.date)?.getTime() || 0;
      return da - db;
    });

  // 2. If no future dates exist, use the closest active database festivals
  const allDbFestivals = (festivals || [])
    .filter((fest) => fest?.isActive !== false)
    .sort((a, b) => {
      const da = parseCalendarDate(a.date)?.getTime() || 0;
      const db = parseCalendarDate(b.date)?.getTime() || 0;
      return (
        Math.abs(da - todayMidnight.getTime()) -
        Math.abs(db - todayMidnight.getTime())
      );
    });

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
    <div className="modal-backdrop-overlay fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Canvas Overlay for Confetti Burst */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Ambient Lighting Accents behind the Card */}
      <div className="absolute -top-16 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-[110px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-16 right-1/4 w-80 h-80 bg-orange-600/15 rounded-full blur-[110px] pointer-events-none" />

      {/* Main Glassmorphism Modal Box */}
      <div className="relative z-20 w-full max-w-3xl bg-white dark:bg-gradient-to-b dark:from-[#131B2A] dark:via-[#101726] dark:to-[#0B0F17] border border-slate-200 dark:border-[#2C384E] rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.4),0_0_60px_rgba(245,158,11,0.08)] dark:shadow-[0_25px_80px_-15px_rgba(0,0,0,0.9),0_0_60px_rgba(245,158,11,0.12)] space-y-6 text-left overflow-hidden">
        {/* Specular Top Horizon Highlight Line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_rgba(245,158,11,0.8)]" />

        {/* Ambient Top Flare */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-44 bg-gradient-to-b from-amber-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Sleek Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs group cursor-pointer"
          title="Close modal"
        >
          <X className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 text-center sm:text-left pr-8 sm:pr-0">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold tracking-wide shadow-xs"
            style={{
              backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7",
              borderColor: isDark ? "rgba(245, 158, 11, 0.35)" : "#FCD34D",
              color: isDark ? "#FCD34D" : "#92400E",
            }}
          >
            <Flame
              className="w-3.5 h-3.5 animate-pulse"
              style={{
                color: isDark ? "#FBBF24" : "#D97706",
              }}
            />
            <span>{isRegister ? "Welcome to BrandFlow! 🎉" : "Upcoming Festivals Ready! 🔥"}</span>
            <span
              className="w-1.5 h-1.5 rounded-full animate-ping"
              style={{
                backgroundColor: isDark ? "#F59E0B" : "#D97706",
              }}
            />
          </div>

          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight leading-tight">
            {isRegister ? (
              <>
                Hey{" "}
                <span className="text-amber-600 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-amber-200 dark:via-amber-400 dark:to-orange-400">
                  {userName}
                </span>
                , Welcome Aboard!
              </>
            ) : (
              <>
                Welcome Back,{" "}
                <span className="text-amber-600 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-amber-200 dark:via-amber-400 dark:to-orange-400">
                  {userName}
                </span>
                !
              </>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300/90 leading-relaxed max-w-xl">
            High-engagement festivals are approaching. Launch ready-to-publish social media graphics with your custom brand frame &amp; AI captions in 1-click:
          </p>
        </div>

        {/* Dynamic Upcoming Admin Festivals Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {isLoading ? (
            <div className="col-span-3 py-12 text-center text-xs text-amber-600 dark:text-amber-300/70 animate-pulse flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-amber-500 dark:text-amber-400" />
              Loading upcoming festivals...
            </div>
          ) : (
            activeShowcase.slice(0, 3).map((item) => {
              const countdown = getCountdownMeta(item.date);

              return (
                <div
                  key={item.id}
                  className="welcome-festival-card group relative rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md"
                  style={{
                    backgroundColor: isDark ? "#141C2E" : "#FFFFFF",
                    borderColor: isDark ? "rgba(51, 65, 85, 0.6)" : "#CBD5E1",
                  }}
                >
                  {/* Specular Top Glow Highlight Accent */}
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent group-hover:via-amber-400 transition-all duration-500 z-10" />

                  {/* Image Thumbnail Container */}
                  <div
                    className="w-full h-36 relative overflow-hidden rounded-t-2xl"
                    style={{
                      backgroundColor: isDark ? "#020617" : "#F1F5F9",
                    }}
                  >
                    <img
                      src={
                        item.bannerUrl ||
                        item.imageUrl ||
                        item.banner ||
                        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop"
                      }
                      alt={item.name || item.title || "Festival"}
                      className="w-full h-full object-cover opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                    />

                    {/* Translucent Dark Scrim Overlay (Only in dark mode) */}
                    {isDark && (
                      <div
                        className="image-scrim-overlay absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(14, 21, 36, 0.95) 0%, rgba(14, 21, 36, 0.35) 45%, transparent 100%)",
                        }}
                      />
                    )}

                    {/* Top Relative Days Countdown Pill */}
                    <div
                      className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full border text-[10px] tracking-wide flex items-center gap-1.5 shadow-md backdrop-blur-md ${countdown.badgeClass}`}
                      style={
                        !countdown.highlight
                          ? {
                              backgroundColor: isDark ? "rgba(2, 6, 23, 0.85)" : "#FFFFFF",
                              borderColor: isDark ? "rgba(251, 191, 36, 0.4)" : "#F59E0B",
                              color: isDark ? "#FCD34D" : "#92400E",
                            }
                          : undefined
                      }
                    >
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span>{countdown.text}</span>
                    </div>

                    {/* Region / Category Tag Top-Right */}
                    {(item.category || item.targetRegion) && (
                      <div
                        className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full backdrop-blur-md border text-[10px] font-semibold tracking-wide flex items-center gap-1 shadow-md"
                        style={{
                          backgroundColor: isDark ? "rgba(2, 6, 23, 0.8)" : "#FFFFFF",
                          borderColor: isDark ? "rgba(255, 255, 255, 0.15)" : "#CBD5E1",
                          color: isDark ? "#E2E8F0" : "#0F172A",
                        }}
                      >
                        <Sparkles
                          className="w-2.5 h-2.5"
                          style={{
                            color: isDark ? "#FBBF24" : "#D97706",
                          }}
                        />
                        <span>{(item.category || item.targetRegion || "Festival").replace(/upcoming/i, "").trim() || "India"}</span>
                      </div>
                    )}
                  </div>

                  {/* Content Details */}
                  <div
                    className="welcome-card-body p-3.5 sm:p-4 space-y-2.5 text-left flex-1 flex flex-col justify-between"
                    style={{
                      backgroundColor: isDark ? "#141C2E" : "#FFFFFF",
                    }}
                  >
                    <div className="space-y-1">
                      <h4
                        className="font-heading font-extrabold text-sm sm:text-[15px] group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors line-clamp-1 tracking-tight"
                        style={{
                          color: isDark ? "#FFFFFF" : "#0F172A",
                        }}
                      >
                        {item.name || item.title || "Upcoming Festival"}
                      </h4>
                      <p
                        className="text-[11px] line-clamp-2 leading-relaxed"
                        style={{
                          color: isDark ? "rgba(203, 213, 225, 0.8)" : "#334155",
                        }}
                      >
                        {item.description || "Festival celebration and special event"}
                      </p>
                    </div>

                    {/* Styled Festival Metadata Row */}
                    <div
                      className="pt-2.5 flex items-center justify-between border-t text-[11px]"
                      style={{
                        borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                      }}
                    >
                      <div
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border font-bold text-[10px] tracking-wide"
                        style={{
                          backgroundColor: isDark ? "rgba(245, 158, 11, 0.1)" : "#FEF3C7",
                          borderColor: isDark ? "rgba(251, 191, 36, 0.25)" : "#FCD34D",
                          color: isDark ? "#FCD34D" : "#92400E",
                        }}
                      >
                        <Calendar
                          className="w-3 h-3"
                          style={{
                            color: isDark ? "#FBBF24" : "#D97706",
                          }}
                        />
                        <span>
                          {item.date
                            ? parseCalendarDate(item.date)?.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              }) || "Upcoming"
                            : "Upcoming"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-white/[0.08] space-y-3">
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
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              100% automated with your brand logo &amp; contact frames
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer hover:underline"
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
