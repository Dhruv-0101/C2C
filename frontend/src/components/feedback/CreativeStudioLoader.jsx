import React, { useState, useEffect, useRef } from 'react';
import { TopProgressBar } from './TopProgressBar';

/**
 * CreativeStudioLoader Component
 *
 * Enterprise-grade, animated loading experience featuring BrandFlow's AI Fox Cartoon Mascot.
 * Supports multiple layout variants (fullscreen, modal, inline) and automatically adapts to
 * Midnight Dark Mode and SoHo Art Loft Light Mode via BrandFlow's CSS design tokens.
 *
 * @param {Object} props
 * @param {'fullscreen' | 'modal' | 'inline'} [props.variant='fullscreen'] - Display layout context.
 * @param {string} [props.title='Crafting Your Social Studio'] - Primary status headline.
 * @param {string} [props.subtitle] - Optional fixed subtitle. If omitted, cycles through dynamic AI status messages.
 * @param {number|null} [props.progress=null] - Optional numeric progress (0-100). If null, renders infinite Chameleon pulse.
 * @param {boolean} [props.interactive=true] - Whether to mount the interactive 4-point star particle canvas.
 * @param {boolean} [props.showSidebar=true] - Whether to render the ghost sidebar skeleton in fullscreen variant.
 * @param {string} [props.className=''] - Additional CSS classes.
 */
export const CreativeStudioLoader = ({
  variant = 'fullscreen',
  title = 'Crafting Your Social Studio',
  subtitle,
  progress = null,
  interactive = true,
  showSidebar = true,
  className = '',
}) => {
  const canvasRef = useRef(null);
  const cardRef = useRef(null);

  // Creative status messages synchronized with animation cadence (2.6s)
  const defaultMessages = [
    'Mixing your brand color palette & typography...',
    'Painting high-converting festive offer banners...',
    'Calibrating social layout & engagement reach...',
    'Sprinkling AI viral spark & hashtags...',
  ];

  const colorThemes = [
    { primary: '#F59E0B', light: '#FDE047', name: 'Brand Amber' },
    { primary: '#EC4899', light: '#F472B6', name: 'Viral Rose' },
    { primary: '#06B6D4', light: '#67E8F9', name: 'Cyan Glow' },
    { primary: '#8B5CF6', light: '#C4B5FD', name: 'Royal Studio' },
  ];

  const [activeThemeIdx, setActiveThemeIdx] = useState(0);
  const [activeMsgIdx, setActiveMsgIdx] = useState(0);

  // Cycle messages and accent colors
  useEffect(() => {
    if (subtitle) return; // Use fixed subtitle if provided

    const interval = setInterval(() => {
      setActiveMsgIdx((prev) => (prev + 1) % defaultMessages.length);
      setActiveThemeIdx((prev) => (prev + 1) % colorThemes.length);
    }, 2600);

    return () => clearInterval(interval);
  }, [subtitle, defaultMessages.length, colorThemes.length]);

  // Interactive 4-point star burst particle engine
  useEffect(() => {
    if (!interactive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    class SparkleParticle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 3;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = (Math.random() - 0.5) * 3 - 0.5;
        this.life = 1;
        this.decay = Math.random() * 0.03 + 0.015;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.15;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.size = Math.max(0, this.size - 0.04);
        this.rotation += this.rotSpeed;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.life);

        const r = this.size;
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.quadraticCurveTo(0, 0, 0, r);
        ctx.quadraticCurveTo(0, 0, -r, 0);
        ctx.quadraticCurveTo(0, 0, 0, -r);
        ctx.fill();
        ctx.restore();
      }
    }

    const addSparkles = (x, y, count = 2) => {
      const activeColor = colorThemes[activeThemeIdx].primary;
      const lightColor = colorThemes[activeThemeIdx].light;
      for (let i = 0; i < count; i++) {
        const col = Math.random() > 0.4 ? activeColor : lightColor;
        particles.push(new SparkleParticle(x, y, col));
      }
    };

    const onMouseMove = (e) => addSparkles(e.clientX, e.clientY, 2);
    const onTouchMove = (e) => {
      if (e.touches[0]) {
        addSparkles(e.touches[0].clientX, e.touches[0].clientY, 3);
      }
    };
    const onCardClick = (e) => {
      for (let i = 0; i < 18; i++) {
        addSparkles(e.clientX, e.clientY, 1);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    const cardEl = cardRef.current;
    if (cardEl) {
      cardEl.addEventListener('click', onCardClick);
    }

    const renderLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0 || particles[i].size <= 0.5) {
          particles.splice(i, 1);
        }
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      if (cardEl) {
        cardEl.removeEventListener('click', onCardClick);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [interactive, activeThemeIdx]);

  const activeTheme = colorThemes[activeThemeIdx];
  const displaySubtitle = subtitle || defaultMessages[activeMsgIdx];

  // =========================================================================
  // The Center Stage Art Studio Wall Card
  // =========================================================================
  const renderStudioWallCard = () => (
    <div
      ref={cardRef}
      className={`studio-wall-card cursor-pointer ${
        variant === 'modal' ? 'max-w-lg shadow-xl' : ''
      }`}
      role="status"
      aria-live="polite"
    >
      {/* Brick Loft Texture Overlay */}
      <div className="brick-wall-bg" />

      {/* Hanging Studio String Fairy Lights */}
      <div className="fairy-lights-container">
        <div className="string-wire" />
        <div className="fairy-bulb" />
        <div className="fairy-bulb" />
        <div className="fairy-bulb" />
        <div className="fairy-bulb" />
        <div className="fairy-bulb" />
      </div>

      {/* Scene Viewport: Mascot + Wall Painting Animation */}
      <div className="studio-scene-viewport">
        {/* Wipe & Reveal Social Post Card on the Wall */}
        <div className="studio-wall-post-card">
          {/* Post Header */}
          <div className="flex items-center gap-[1.5cqw]">
            <div className="w-[4.2cqw] h-[4.2cqw] rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center text-[2cqw] shrink-0 text-white">
              🦊
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[1.85cqw] font-bold text-[var(--c-loader-post-text)] truncate leading-tight">
                Chai & Co. Cafe
              </div>
              <div className="text-[1.45cqw] text-[var(--c-loader-post-subtext)] truncate">
                Sponsored · BrandFlow AI
              </div>
            </div>
          </div>

          {/* Post Body Visual Canvas */}
          <div className="h-[43%] rounded-[2cqw] bg-gradient-to-br from-amber-500/25 via-pink-500/20 to-blue-500/25 border border-dashed border-amber-500/40 flex flex-col items-center justify-center text-center p-[1cqw] relative overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{ animation: 'studio-wall-shimmer 2s infinite linear' }}
            />
            <div className="studio-post-headline font-heading">
              🪔 Happy Festive Flash Sale!
            </div>
            <div className="studio-post-tag">FLAT 50% OFF TODAY</div>
          </div>

          {/* Social Engagement Metrics */}
          <div className="flex items-center justify-between pt-[0.8cqw] border-t border-slate-700/20 text-[1.65cqw] text-slate-400 font-semibold">
            <span>❤️ 1.4k</span>
            <span>💬 98</span>
            <span>🚀 320</span>
            <span>⭐ 4.9</span>
          </div>
        </div>

        {/* Master Vector Graphic: Mascot & Painter Scene */}
        <svg
          className="studio-mascot-svg"
          viewBox="0 0 540 250"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="rollerGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <linearGradient id="paintStreamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={activeTheme.primary} />
              <stop offset="50%" stopColor={activeTheme.light} />
              <stop offset="100%" stopColor={activeTheme.primary} />
            </linearGradient>

            <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>

          {/* 1. The Wooden Step Stool & Studio Paint Cans */}
          <g id="studioFurniture">
            <ellipse cx="155" cy="242" rx="48" ry="7" fill="rgba(0,0,0,0.4)" />
            <line x1="130" y1="190" x2="118" y2="240" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
            <line x1="178" y1="190" x2="190" y2="240" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
            <line x1="125" y1="216" x2="183" y2="216" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
            <rect x="115" y="184" width="78" height="11" rx="4" fill="url(#woodGrad)" stroke="#D97706" strokeWidth="1.5" />

            <ellipse cx="132" cy="187" rx="7" ry="2.5" fill={activeTheme.primary} />
            <circle cx="174" cy="188" r="3" fill="#EC4899" />
            <circle cx="155" cy="186" r="2" fill="#06B6D4" />

            {/* Studio Paint Buckets on Floor */}
            <rect x="74" y="218" width="24" height="22" rx="3" fill="#334155" stroke="#475569" strokeWidth="1.5" />
            <ellipse cx="86" cy="218" rx="12" ry="3.5" fill={activeTheme.primary} />
            <text x="86" y="233" fontSize="7" fontWeight="900" fill="#FFF" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif">
              AI
            </text>
            <path d="M 76 220 Q 76 229, 78 229 Q 80 229, 80 220" fill={activeTheme.primary} />

            <rect x="202" y="222" width="20" height="18" rx="3" fill="#1E293B" stroke="#334155" strokeWidth="1" />
            <ellipse cx="212" cy="222" rx="10" ry="2.5" fill="#EC4899" />
            <text x="212" y="234" fontSize="6" fontWeight="900" fill="#FFF" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif">
              GLOW
            </text>
          </g>

          {/* 2. Dynamic Wall Paint Stroke Curve */}
          <path
            className="studio-dynamic-stroke"
            d="M 235 155 Q 310 80, 420 100 T 470 160"
            stroke="url(#paintStreamGrad)"
            strokeWidth="20"
            strokeLinecap="round"
            fill="none"
          />
          <path
            className="studio-dynamic-stroke"
            d="M 235 155 Q 310 80, 420 100 T 470 160"
            stroke="#FFFBEB"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />

          {/* Falling Wet Paint Drips */}
          <circle className="studio-paint-drip" cx="340" cy="105" r="3.5" fill={activeTheme.light} />
          <circle className="studio-paint-drip" cx="430" cy="125" r="3" fill={activeTheme.primary} />
          <circle className="studio-paint-drip" cx="290" cy="120" r="2.5" fill={activeTheme.primary} />

          {/* Floating Social Sparkles Released by Roller */}
          <g className="studio-floating-spark spark-delay-1" transform="translate(390, 65)">
            <path d="M 0 4 A 4 4 0 0 1 8 4 A 4 4 0 0 1 16 4 Q 16 10, 8 16 Q 0 10, 0 4 Z" fill="#F43F5E" filter="url(#rollerGlow)" />
          </g>
          <g className="studio-floating-spark spark-delay-2" transform="translate(450, 115)">
            <rect x="0" y="2" width="16" height="12" rx="3" fill={activeTheme.primary} filter="url(#rollerGlow)" />
            <circle cx="8" cy="8" r="3" fill="#0B111E" />
            <circle cx="8" cy="8" r="1.5" fill="#FFF" />
            <rect x="3" y="0" width="4" height="2" rx="0.5" fill={activeTheme.primary} />
          </g>
          <g className="studio-floating-spark spark-delay-3" transform="translate(320, 75)">
            <polygon points="8,0 10,6 16,8 10,10 8,16 6,10 0,8 6,6" fill={activeTheme.light} filter="url(#rollerGlow)" />
          </g>

          {/* 3. The Cute Fox Mascot (High-Fidelity 2.5D Vector) */}
          <g id="foxMascot">
            <g className="studio-fox-tail">
              <path d="M 125 168 C 90 160, 65 185, 75 145 C 82 120, 118 135, 138 152 Z" fill="#EA580C" stroke="#C2410C" strokeWidth="1.8" />
              <path d="M 75 145 C 78 135, 88 130, 98 138 C 90 148, 80 155, 75 145 Z" fill="#FFFBEB" />
            </g>

            {/* Legs & Sneakers */}
            <rect x="135" y="160" width="11" height="28" rx="5" fill="#EA580C" />
            <rect x="165" y="160" width="11" height="28" rx="5" fill="#EA580C" />
            <path d="M 132 186 L 149 186 C 151 186, 151 190, 149 190 L 132 190 Z" fill="#FFF" />
            <ellipse cx="140" cy="186" rx="8" ry="4" fill="#3B82F6" />
            <path d="M 162 186 L 179 186 C 181 186, 181 190, 179 190 L 162 190 Z" fill="#FFF" />
            <ellipse cx="170" cy="186" rx="8" ry="4" fill="#3B82F6" />

            {/* Mascot Body in Denim Painter Overalls */}
            <ellipse cx="155" cy="145" rx="23" ry="26" fill="#EA580C" />
            <path d="M 138 134 L 172 134 L 169 168 L 141 168 Z" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="1.5" />
            <line x1="144" y1="126" x2="144" y2="136" stroke="#1E3A8A" strokeWidth="3" />
            <circle cx="144" cy="136" r="2" fill="#CBD5E1" />
            <line x1="166" y1="126" x2="166" y2="136" stroke="#1E3A8A" strokeWidth="3" />
            <circle cx="166" cy="136" r="2" fill="#CBD5E1" />
            <rect x="148" y="144" width="14" height="12" rx="3" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1" />
            <line x1="151" y1="140" x2="149" y2="146" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
            <line x1="157" y1="138" x2="157" y2="146" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <circle cx="152" cy="150" r="2" fill="#F59E0B" />
            <circle cx="159" cy="152" r="1.5" fill="#10B981" />
            <circle cx="142" cy="160" r="1.8" fill="#EC4899" />

            {/* Mascot Head & Facial Expressions */}
            <g className="studio-fox-head">
              <polygon points="140,88 131,58 158,72" fill="#EA580C" stroke="#C2410C" strokeWidth="1.5" />
              <polygon points="143,84 137,67 154,75" fill="#FEE2E2" />
              <polygon points="174,80 198,62 186,88" fill="#EA580C" stroke="#C2410C" strokeWidth="1.5" />
              <polygon points="177,80 191,68 183,86" fill="#FEE2E2" />

              <ellipse cx="156" cy="74" rx="26" ry="10" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1.5" />
              <circle cx="156" cy="65" r="3.5" fill="#1E40AF" />

              <circle cx="160" cy="95" r="21" fill="#EA580C" />
              <path d="M 152 90 C 152 110, 180 110, 180 90 Z" fill="#FFFBEB" />
              <ellipse cx="174" cy="94" rx="3" ry="2.2" fill="#0F172A" />

              <g className="studio-eye-lid">
                <path d="M 148 90 Q 153 84, 158 90" stroke="#0F172A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
                <path d="M 163 88 Q 168 82, 173 88" stroke="#0F172A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
              </g>

              <path d="M 161 100 Q 168 108, 175 100" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" fill="#DC2626" />
              <circle cx="147" cy="97" r="4" fill="#FDA4AF" opacity="0.8" />
            </g>

            {/* 4. Painter Arm & Active Roller */}
            <g className="studio-arm-group">
              <path d="M 168 132 Q 200 118, 230 104" stroke="#EA580C" strokeWidth="9" strokeLinecap="round" />
              <circle cx="230" cy="104" r="5.5" fill="#C2410C" />
              <polyline points="230,104 242,98 238,76 254,72" stroke="#CBD5E1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="246" y="58" width="18" height="34" rx="6" fill={activeTheme.primary} stroke={activeTheme.light} strokeWidth="2.5" filter="url(#rollerGlow)" />
              <line x1="250" y1="63" x2="250" y2="87" stroke="#FFFBEB" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
            </g>
          </g>
        </svg>
      </div>

      {/* Dynamic Typography & Progress Box */}
      <div className="flex flex-col items-center text-center z-10 w-full">
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider mb-2.5 transition-colors duration-500"
          style={{
            background: `rgba(${activeTheme.primary === '#F59E0B' ? '245, 158, 11' : '236, 72, 153'}, 0.12)`,
            border: `1px solid ${activeTheme.primary}66`,
            color: activeTheme.primary,
          }}
        >
          <span>🎨</span> <span>BrandFlow Creative Studio</span>
        </div>

        <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[var(--c-loader-title-color)] mb-1 tracking-tight">
          {title}
        </h2>

        <p className="text-xs sm:text-sm text-[var(--c-loader-subtitle-color)] min-h-[20px] font-medium transition-all duration-300">
          {displaySubtitle}
        </p>

        {/* Glowing Progress Bar */}
        <div className="w-full max-w-[320px] h-[6px] bg-[var(--c-loader-track-bg)] rounded-full mt-4 overflow-hidden border border-[var(--c-loader-track-border)] relative">
          {progress !== null ? (
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                background: `linear-gradient(90deg, ${activeTheme.primary}, ${activeTheme.light})`,
                boxShadow: `0 0 12px ${activeTheme.primary}`,
              }}
            />
          ) : (
            <div
              className="studio-progress-slider"
              style={{
                background: `linear-gradient(90deg, ${activeTheme.primary}, ${activeTheme.light}, ${activeTheme.primary})`,
                boxShadow: `0 0 12px ${activeTheme.primary}`,
              }}
            />
          )}
        </div>

        {interactive && (
          <div className="mt-3 text-[11px] text-slate-400 font-medium flex items-center gap-1 opacity-75">
            <span>✨</span> Move cursor or tap to sprinkle sparkles
          </div>
        )}
      </div>
    </div>
  );

  // Modal or Inline Variant
  if (variant === 'modal' || variant === 'inline') {
    return (
      <div className={`w-full flex items-center justify-center p-2 sm:p-4 ${className}`}>
        {renderStudioWallCard()}
      </div>
    );
  }

  // Fullscreen Variant (App Boot / Route Transition Fallback)
  return (
    <div className={`min-h-screen w-full bg-[var(--c-loader-bg-page)] flex flex-col overflow-hidden relative ${className}`}>
      <TopProgressBar />

      {/* Interactive Particle Canvas */}
      {interactive && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-10"
        />
      )}

      {/* Ambient Radial Studio Orbs */}
      <div
        className="fixed -top-32 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-25 pointer-events-none transition-colors duration-1000"
        style={{ background: activeTheme.primary }}
      />
      <div
        className="fixed -bottom-32 -left-32 w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none bg-blue-600"
      />

      {/* Top Mock Navbar */}
      <header className="h-14 sm:h-16 border-b border-slate-800/40 bg-[var(--c-loader-card-bg)]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-heading font-extrabold text-base sm:text-lg text-[var(--c-loader-title-color)]">
            Brand<span className="text-amber-400">Flow</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Studio
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-8 w-32 sm:w-48 rounded-lg bg-[var(--c-loader-search-bg)] border border-[var(--c-loader-search-border)] hidden min-[480px]:block" />
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500" />
        </div>
      </header>

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden z-20">
        {/* Ghost Sidebar Skeleton (Hidden on Mobile < md) */}
        {showSidebar && (
          <aside className="w-60 border-r border-slate-800/30 bg-[var(--c-loader-card-bg)]/40 p-4 space-y-3 hidden md:flex md:flex-col shrink-0">
            <div className="h-4 w-24 rounded bg-[var(--c-loader-skeleton-start)] opacity-70 mb-4" />
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-9 w-full rounded-xl bg-[var(--c-loader-skeleton-start)] animate-pulse"
                style={{ animationDelay: `${idx * 0.15}s` }}
              />
            ))}
            <div className="mt-auto pt-6 space-y-2">
              <div className="h-3 w-16 rounded bg-[var(--c-loader-skeleton-start)] opacity-50" />
              <div className="h-9 w-full rounded-xl bg-[var(--c-loader-skeleton-start)] opacity-60" />
            </div>
          </aside>
        )}

        {/* Center Stage Area */}
        <main className="flex-1 p-3 sm:p-6 flex flex-col items-center justify-center overflow-y-auto">
          {renderStudioWallCard()}
        </main>
      </div>
    </div>
  );
};

export default CreativeStudioLoader;
