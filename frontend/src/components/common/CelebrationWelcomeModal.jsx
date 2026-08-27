import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Zap, ArrowRight, X, Calendar, Flame } from "lucide-react";
import { Button } from "../ui/Button";
import { useFestivals } from "../../hooks/useFestivals";

// Fallback upcoming festivals starting from today onwards
const FALLBACK_UPCOMING_FESTIVALS = [
  {
    id: "diwali-upcoming",
    name: "Diwali Celebration Special",
    category: "Upcoming Festival",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Grand Festive Offer & Festive Greetings Templates",
    bannerUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "newyear-upcoming",
    name: "New Year Bash 2026",
    category: "Upcoming Event",
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    description: "New Year Special Offers & Celebration Frames",
    bannerUrl:
      "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "sale-upcoming",
    name: "Season Mega Sale",
    category: "Upcoming Promo",
    date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Exclusive Discount & Clearance Sale Overlays",
    bannerUrl:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop",
  },
];

/**
 * Helper to compute friendly countdown badge for upcoming dates
 */
const getRelativeDaysText = (dateString) => {
  if (!dateString) return "Upcoming Event";
  const targetDate = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffTime = targetDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "🔥 Today!";
  if (diffDays === 1) return "⚡ Tomorrow!";
  return `🗓️ In ${diffDays} Days`;
};

/**
 * CelebrationWelcomeModal
 * Dynamic Welcome Showcase Modal displaying upcoming festivals from today onwards added by Admin.
 * Renders an inline HTML5 Canvas confetti particle explosion and 1-click festival post launchers.
 */
export const CelebrationWelcomeModal = ({ isOpen, onClose, authType = "login", user }) => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Fetch festivals from API
  const { festivals, isLoading } = useFestivals();

  // Filter festivals occurring today onwards, sorted by closest upcoming date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAdminFestivals = festivals
    .filter((fest) => {
      if (!fest.date) return true;
      const festDate = new Date(fest.date);
      return festDate >= today;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const activeShowcase =
    upcomingAdminFestivals.length > 0 ? upcomingAdminFestivals : FALLBACK_UPCOMING_FESTIVALS;

  // Confetti Particle Explosion Effect
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = ["#F59E0B", "#10B981", "#6366F1", "#EC4899", "#3B82F6", "#FBBF24"];
    const particles = [];
    const particleCount = 75;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 3,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.7) * 14,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        gravity: 0.25,
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
        p.opacity -= 0.008;
        activeParticles++;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
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

  const handleSelectFestival = (festival) => {
    onClose();
    if (festival?.id && !festival.id.includes("preset") && !festival.id.includes("upcoming")) {
      navigate(`/calendar?festivalId=${festival.id}`);
    } else {
      navigate("/calendar");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Canvas Overlay for Confetti Burst */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Main Glassmorphism Modal Box */}
      <div className="relative z-20 w-full max-w-2xl bg-gradient-to-b from-[#131B2A] via-[#101726] to-[#0B0F17] border border-[#2C384E] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-left overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{isRegister ? "Welcome to BrandFlow! 🎉" : "Upcoming Festivals Ready! 🔥"}</span>
          </div>

          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            {isRegister ? `Hey ${userName}, Welcome Aboard!` : `Welcome Back, ${userName}!`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Here are the upcoming festivals added by Admin starting from today onwards. Prepare your posts in 1-click:
          </p>
        </div>

        {/* Dynamic Upcoming Admin Festivals Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          {isLoading ? (
            <div className="col-span-3 py-8 text-center text-xs text-slate-400 animate-pulse">
              Loading upcoming festivals...
            </div>
          ) : (
            activeShowcase.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectFestival(item)}
                className="group relative rounded-2xl bg-[#0B0F17] border border-[#2C384E] hover:border-amber-500/60 overflow-hidden shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Image Thumbnail */}
                <div className="w-full h-28 relative overflow-hidden bg-slate-900">
                  <img
                    src={
                      item.bannerUrl ||
                      item.imageUrl ||
                      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop"
                    }
                    alt={item.name || item.title || "Festival"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-black/30" />

                  {/* Top Relative Days Badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/80 border border-amber-500/40 text-amber-300 text-[9px] font-extrabold uppercase tracking-wider shadow-md">
                    {getRelativeDaysText(item.date)}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-3 space-y-1 text-left flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-heading font-extrabold text-xs text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {item.name || item.title || "Upcoming Festival"}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1">
                      {item.description || "Festival Templates & Custom Overlay"}
                    </p>
                  </div>

                  <div className="pt-2 text-[10px] font-bold text-amber-400 flex items-center justify-between border-t border-[#2C384E]/60">
                    <span>Create Festival Post</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-[#2C384E]">
          <Button
            variant="primary"
            size="lg"
            icon={Calendar}
            onClick={() => {
              onClose();
              navigate("/calendar");
            }}
            className="w-full sm:w-auto flex-1 font-extrabold shadow-lg shadow-amber-500/20"
          >
            Explore 365-Day Festival Calendar
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              onClose();
              navigate("/create-post");
            }}
            className="w-full sm:w-auto text-xs border-[#2C384E] text-slate-300 hover:text-white"
          >
            Custom Post Studio
          </Button>
        </div>
      </div>
    </div>
  );
};
