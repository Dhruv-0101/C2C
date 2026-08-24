import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  Building2,
  Calendar,
  ArrowRight,
  LogIn,
  UserPlus,
  Zap,
  CheckCircle2,
  Share2,
  XCircle,
  Wand2,
  Clock,
  Send,
  FolderKanban,
  Star,
  Check,
  TrendingUp,
  ChevronDown,
  ShieldCheck,
  Target,
  Sparkle,
  Pause,
  Play,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { InteractiveWorkflowDemo } from '../components/common/InteractiveWorkflowDemo';

const SECTIONS = [
  { id: 'hero-section', label: 'Overview' },
  { id: 'demo-section', label: 'Live Demo' },
  { id: 'steps-section', label: '3 Steps' },
  { id: 'features-section', label: 'Features' },
  { id: 'advantage-section', label: 'Advantage' },
  { id: 'categories-section', label: 'Categories' },
  { id: 'cta-section', label: 'Get Started' },
];

export const WelcomeSplashPage = () => {
  const navigate = useNavigate();

  // Typewriter Animation State
  const [typedText, setTypedText] = useState('');
  const phrases = [
    'In Under 30 Seconds',
    'For Festivals & Offers',
    'For Your Business',
    '100% Always On-Brand',
    'Across All Platforms',
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Active 3-Step Pipeline Spotlight State
  const [activeStep, setActiveStep] = useState(1);

  // Autonomous Presentation Tour State
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [isTourActive, setIsTourActive] = useState(false);

  // Auto-Cycle 3-Step Pipeline Spotlight
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev % 3) + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Typewriter Effect
  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const typingSpeed = isDeleting ? 35 : 75;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setTypedText(currentPhrase.substring(0, typedText.length + 1));
        if (typedText === currentPhrase) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setTypedText(currentPhrase.substring(0, typedText.length - 1));
        if (typedText === '') {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, phraseIndex]);

  // Autonomous Auto-Tour Section Navigation
  const scrollToSection = (idx) => {
    setCurrentSectionIdx(idx);
    const target = SECTIONS[idx];
    if (target) {
      const el = document.getElementById(target.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Auto-Tour interval (Every 7.5s)
  useEffect(() => {
    if (!isTourActive) return;

    const timer = setInterval(() => {
      setCurrentSectionIdx((prev) => {
        const nextIdx = (prev + 1) % SECTIONS.length;
        const target = SECTIONS[nextIdx];
        if (target) {
          document.getElementById(target.id)?.scrollIntoView({ behavior: 'smooth' });
        }
        return nextIdx;
      });
    }, 7500);

    return () => clearInterval(timer);
  }, [isTourActive]);

  return (
    <div className="h-screen w-full overflow-hidden bg-[#0B0F17] text-slate-100 font-body relative">
      {/* Ambient Radial Background Glows */}
      <div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-tr from-amber-500/15 via-teal-500/10 to-indigo-500/15 blur-[160px] pointer-events-none animate-pulse duration-[6000ms]" />
      <div className="fixed top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none" />

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#0B0F17]/95 backdrop-blur-md border-b border-[#2C384E]/40">
        <Header />
      </div>

      {/* Full Viewport Scroll Snap Container */}
      <div className="h-screen w-full overflow-y-auto snap-y snap-mandatory scroll-smooth">
        <main className="w-full">
          
          {/* ========================================================================= */}
          {/* 1. HERO SECTION & PITCH */}
          {/* ========================================================================= */}
          <section
            id="hero-section"
            className="h-screen min-h-screen snap-start snap-always flex flex-col items-center justify-center text-center pt-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full relative z-10 shrink-0 overflow-hidden"
          >
            <div className="space-y-5 max-w-4xl mx-auto my-auto pb-10">
              {/* Glowing Platform Pill */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#131B2A] border border-amber-500/40 text-amber-300 text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-amber-500/10 animate-in fade-in slide-in-from-top-4 duration-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Your Autonomous AI Social Media Manager</span>
              </div>

              {/* Typewriter Hero Heading */}
              <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]">
                Create Branded Posts{' '}
                <span className="text-gradient block sm:inline-block min-w-[300px] text-amber-400">
                  {typedText}
                  <span className="animate-pulse text-amber-400 font-normal ml-0.5">|</span>
                </span>
              </h1>

              {/* High-Converting Subtitle */}
              <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
                BrandFlow removes every step between <strong className="text-white font-bold">"I have something to promote"</strong> and <strong className="text-amber-400 font-bold">"it's live, on-brand, on every platform."</strong>
              </p>

              {/* Hero CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-1">
                <Button
                  variant="primary"
                  size="lg"
                  icon={UserPlus}
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-extrabold shadow-xl shadow-amber-500/20 hover:scale-105 transition-all duration-200"
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  icon={LogIn}
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-8 py-3.5 text-base border-[#2C384E] text-slate-200 hover:text-white hover:border-slate-500"
                >
                  Log In to Workspace
                </Button>
              </div>

              {/* Metric Highlights Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-[#2C384E]/60 max-w-3xl mx-auto">
                <div className="space-y-1">
                  <p className="font-heading font-extrabold text-2xl sm:text-3xl text-amber-400">&lt; 30s</p>
                  <p className="text-xs text-slate-400 font-medium">Average Post Creation</p>
                </div>
                <div className="space-y-1">
                  <p className="font-heading font-extrabold text-2xl sm:text-3xl text-teal-400">100%</p>
                  <p className="text-xs text-slate-400 font-medium">Always On-Brand</p>
                </div>
                <div className="space-y-1">
                  <p className="font-heading font-extrabold text-2xl sm:text-3xl text-indigo-400">1-Click</p>
                  <p className="text-xs text-slate-400 font-medium">Multi-Channel Publish</p>
                </div>
                <div className="space-y-1">
                  <p className="font-heading font-extrabold text-2xl sm:text-3xl text-emerald-400">365 Days</p>
                  <p className="text-xs text-slate-400 font-medium">Festival Calendar Ready</p>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 2. LIVE INTERACTIVE DEMO SHOWCASE */}
          {/* ========================================================================= */}
          <section
            id="demo-section"
            className="h-screen min-h-screen snap-start snap-always flex flex-col items-center justify-center text-center pt-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full relative z-10 shrink-0 overflow-hidden"
          >
            <div className="space-y-2 w-full my-auto pb-10">
              <div className="text-center space-y-1">
                <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                  <Sparkle className="w-3.5 h-3.5" /> Live Product Simulation
                </span>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                  See BrandFlow in Action
                </h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Watch auto-simulation live or hit pause to customize text & frame designs manually!
                </p>
              </div>

              <InteractiveWorkflowDemo />
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 3. 3-STEP PIPELINE: HOW BRANDFLOW WORKS (ANIMATED) */}
          {/* ========================================================================= */}
          <section
            id="steps-section"
            className="h-screen min-h-screen snap-start snap-always flex flex-col items-center justify-center text-center pt-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full relative z-10 shrink-0 overflow-hidden"
          >
            <div className="space-y-5 w-full my-auto pb-10">
              <div className="text-center space-y-1.5 max-w-xl mx-auto">
                <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-teal-400 bg-teal-500/10 border border-teal-500/30 px-3.5 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                  <Zap className="w-3.5 h-3.5 text-teal-400 animate-bounce" /> 3 Simple Automated Steps
                </span>
                <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
                  Zero Blank-Canvas Moments
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Never stare at an intimidating empty design editor again. Choose what to promote, and BrandFlow handles the rest.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10 text-left">
                {/* Step 1 Card */}
                <div
                  onClick={() => setActiveStep(1)}
                  className={`p-6 rounded-3xl border transition-all duration-500 cursor-pointer space-y-3.5 relative group ${
                    activeStep === 1
                      ? 'bg-[#131B2A] border-amber-400/90 shadow-2xl shadow-amber-500/20 -translate-y-2.5 scale-[1.02]'
                      : 'bg-[#131B2A]/70 border-[#2C384E] hover:border-amber-500/50 hover:-translate-y-1 opacity-90'
                  }`}
                >
                  {activeStep === 1 && (
                    <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
                  )}

                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center font-extrabold text-base font-mono group-hover:scale-110 transition-transform shadow-md">
                      01
                    </div>
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 group-hover:rotate-12 transition-transform">
                      <Zap className="w-4 h-4 animate-pulse" />
                    </div>
                  </div>

                  <h3 className="font-heading font-extrabold text-base text-white group-hover:text-amber-300 transition-colors">
                    1. Select Event or Offer
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Pick an upcoming festival (Diwali, New Year, Independence Day) or custom offer (30% Off Sale, New Service Launch).
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      ✨ Diwali
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      ☕ 30% OFF
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      💎 Launch
                    </span>
                  </div>

                  <div className="pt-2 text-[11px] font-mono text-amber-400 flex items-center gap-1.5 font-extrabold border-t border-amber-500/20">
                    <Check className="w-4 h-4" /> No design skills required
                  </div>
                </div>

                {/* Step 2 Card */}
                <div
                  onClick={() => setActiveStep(2)}
                  className={`p-6 rounded-3xl border transition-all duration-500 cursor-pointer space-y-3.5 relative group ${
                    activeStep === 2
                      ? 'bg-[#131B2A] border-teal-400/90 shadow-2xl shadow-teal-500/20 -translate-y-2.5 scale-[1.02]'
                      : 'bg-[#131B2A]/70 border-[#2C384E] hover:border-teal-500/50 hover:-translate-y-1 opacity-90'
                  }`}
                >
                  {activeStep === 2 && (
                    <div className="absolute -top-12 -left-12 w-36 h-36 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
                  )}

                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/40 text-teal-400 flex items-center justify-center font-extrabold text-base font-mono group-hover:scale-110 transition-transform shadow-md">
                      02
                    </div>
                    <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 group-hover:spin-slow transition-transform">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-heading font-extrabold text-base text-white group-hover:text-teal-300 transition-colors">
                    2. Auto-Brand Canva Overlay
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Your logo, business phone, address, and headshot rings auto-populate onto pixel-perfect Canva vector frames.
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                      🖼️ Logo Badge
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                      📞 Phone Pill
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                      🎨 Fonts
                    </span>
                  </div>

                  <div className="pt-2 text-[11px] font-mono text-teal-400 flex items-center gap-1.5 font-extrabold border-t border-teal-500/20">
                    <Check className="w-4 h-4" /> 100% Brand Consistency
                  </div>
                </div>

                {/* Step 3 Card */}
                <div
                  onClick={() => setActiveStep(3)}
                  className={`p-6 rounded-3xl border transition-all duration-500 cursor-pointer space-y-3.5 relative group ${
                    activeStep === 3
                      ? 'bg-[#131B2A] border-indigo-400/90 shadow-2xl shadow-indigo-500/20 -translate-y-2.5 scale-[1.02]'
                      : 'bg-[#131B2A]/70 border-[#2C384E] hover:border-indigo-500/50 hover:-translate-y-1 opacity-90'
                  }`}
                >
                  {activeStep === 3 && (
                    <div className="absolute -top-12 -left-12 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
                  )}

                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-extrabold text-base font-mono group-hover:scale-110 transition-transform shadow-md">
                      03
                    </div>
                    <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 group-hover:translate-x-1 transition-transform">
                      <Send className="w-4 h-4 animate-pulse" />
                    </div>
                  </div>

                  <h3 className="font-heading font-extrabold text-base text-white group-hover:text-indigo-300 transition-colors">
                    3. 1-Click Multi-Publish
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    AI generates engaging captions & hashtags, then schedules or publishes live to Instagram, Facebook, LinkedIn & X.
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                      📸 Instagram
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                      👥 Facebook
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                      💼 LinkedIn
                    </span>
                  </div>

                  <div className="pt-2 text-[11px] font-mono text-indigo-400 flex items-center gap-1.5 font-extrabold border-t border-indigo-500/20">
                    <Check className="w-4 h-4" /> Multi-Platform Automation
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 4. PRODUCT CAPABILITY PILLARS */}
          {/* ========================================================================= */}
          <section
            id="features-section"
            className="h-screen min-h-screen snap-start snap-always flex flex-col items-center justify-center text-center pt-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full relative z-10 shrink-0 overflow-hidden"
          >
            <div className="space-y-5 w-full my-auto pb-10">
              <div className="text-center space-y-1.5 max-w-xl mx-auto">
                <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-0.5 rounded-full">
                  Enterprise Suite Features
                </span>
                <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
                  Everything Your Business Needs to Grow
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5 text-left">
                {/* Capability 1 */}
                <Card className="p-5 border-[#2C384E] bg-[#131B2A]/80 hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300 space-y-2 shadow-xl">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-md">
                    <Building2 className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-heading font-extrabold text-sm text-white">Master AI BrandKit</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Save your business logo, primary colors, typography, phone, address, and social handles once for automatic insertion across all posts.
                  </p>
                </Card>

                {/* Capability 2 */}
                <Card className="p-5 border-[#2C384E] bg-[#131B2A]/80 hover:border-teal-500/50 hover:-translate-y-1 transition-all duration-300 space-y-2 shadow-xl">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center shadow-md">
                    <Layers className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-heading font-extrabold text-sm text-white">Canva Vector Frame Studio</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Overlay transparent Canva frames with custom headshot rings, logo containers, and vector badge overlays in 0ms real-time.
                  </p>
                </Card>

                {/* Capability 3 */}
                <Card className="p-5 border-[#2C384E] bg-[#131B2A]/80 hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-300 space-y-2 shadow-xl">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-md">
                    <Calendar className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-heading font-extrabold text-sm text-white">Interactive Festival Calendar</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Stay relevant all year round with automated festival prompts for Diwali, New Year, Eid, Christmas, and national celebration days.
                  </p>
                </Card>

                {/* Capability 4 */}
                <Card className="p-5 border-[#2C384E] bg-[#131B2A]/80 hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-300 space-y-2 shadow-xl">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-md">
                    <Wand2 className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-heading font-extrabold text-sm text-white">AI Caption & Copy Writer</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Generate high-converting post captions, promotional offers, call-to-actions, and trending hashtags tailored for your industry.
                  </p>
                </Card>

                {/* Capability 5 */}
                <Card className="p-5 border-[#2C384E] bg-[#131B2A]/80 hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-300 space-y-2 shadow-xl">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-md">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-heading font-extrabold text-sm text-white">Multi-Channel Queue Scheduler</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Queue and schedule your posts for peak engagement times across Instagram, Facebook, LinkedIn, X, and WhatsApp status.
                  </p>
                </Card>

                {/* Capability 6 */}
                <Card className="p-5 border-[#2C384E] bg-[#131B2A]/80 hover:border-rose-500/50 hover:-translate-y-1 transition-all duration-300 space-y-2 shadow-xl">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-md">
                    <FolderKanban className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-heading font-extrabold text-sm text-white">Graphic Vault & Portfolio</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Access all your past created graphics, published posts, and reusable design assets in one organized cloud repository.
                  </p>
                </Card>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 5. BEFORE VS AFTER TRANSFORMATION PITCH */}
          {/* ========================================================================= */}
          <section
            id="advantage-section"
            className="h-screen min-h-screen snap-start snap-always flex flex-col items-center justify-center text-center pt-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full relative z-10 shrink-0 overflow-hidden"
          >
            <div className="space-y-5 w-full my-auto pb-10">
              <div className="text-center space-y-1.5 max-w-xl mx-auto">
                <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3.5 py-0.5 rounded-full">
                  The BrandFlow Advantage
                </span>
                <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
                  Why Businesses Switch to BrandFlow
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto text-left">
                {/* Without BrandFlow */}
                <Card className="p-6 sm:p-7 border-rose-500/30 bg-rose-500/5 space-y-3.5 shadow-xl">
                  <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xs uppercase tracking-wider">
                    <XCircle className="w-4.5 h-4.5 shrink-0" />
                    <span>Without BrandFlow ❌</span>
                  </div>
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <span className="text-rose-400 font-extrabold text-base leading-none">✕</span>
                      <span>Hiring expensive graphic designers for simple festival posts ($500+/mo)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-rose-400 font-extrabold text-base leading-none">✕</span>
                      <span>Hours spent tweaking complex layers on traditional design tools</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-rose-400 font-extrabold text-base leading-none">✕</span>
                      <span>Inconsistent branding — logos and fonts look different every time</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-rose-400 font-extrabold text-base leading-none">✕</span>
                      <span>Manual logging in & uploading to 5 separate social media apps</span>
                    </li>
                  </ul>
                </Card>

                {/* With BrandFlow */}
                <Card className="p-6 sm:p-7 border-teal-500/40 bg-teal-500/10 space-y-3.5 shadow-2xl scale-[1.02]">
                  <div className="flex items-center gap-2 text-teal-400 font-extrabold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                    <span>With BrandFlow AI Hire ✅</span>
                  </div>
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-100">
                    <li className="flex items-start gap-2.5">
                      <span className="text-teal-400 font-extrabold text-base leading-none">✓</span>
                      <span>Create & schedule professional posts in under 30 seconds</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-teal-400 font-extrabold text-base leading-none">✓</span>
                      <span>Zero design skill required — logo & details auto-applied every time</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-teal-400 font-extrabold text-base leading-none">✓</span>
                      <span>AI writes high-converting captions & trending local hashtags</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-teal-400 font-extrabold text-base leading-none">✓</span>
                      <span>Single unified dashboard for multi-platform scheduling & publishing</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 6. BUSINESS CATEGORIES EMPOWERED */}
          {/* ========================================================================= */}
          <section
            id="categories-section"
            className="h-screen min-h-screen snap-start snap-always flex flex-col items-center justify-center text-center pt-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full relative z-10 shrink-0 overflow-hidden"
          >
            <div className="space-y-5 w-full my-auto pb-10">
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-teal-400 bg-teal-500/10 border border-teal-500/30 px-3.5 py-0.5 rounded-full">
                  Tailored Industry Systems
                </span>
                <h3 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
                  Built for Every Small Business Category
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Tailored templates & design systems for your specific industry tag.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto pt-2">
                {[
                  '🍽️ Restaurants & Cafes',
                  '💇 Salons & Beauty Spas',
                  '🏋️ Gyms & Fitness Centers',
                  '💎 Jewellery & Fashion Stores',
                  '🏢 Real Estate & Property',
                  '🏥 Clinics & Healthcare',
                  '✈️ Travel & Hospitality',
                  '🎓 Schools & Institutes',
                ].map((category) => (
                  <span
                    key={category}
                    className="px-4 py-2 rounded-2xl bg-[#131B2A] border border-[#2C384E] text-xs font-bold text-slate-200 hover:border-amber-500/50 hover:text-amber-300 hover:scale-105 transition-all duration-200 cursor-default shadow-md"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 7. FINAL HIGH-IMPACT CALL TO ACTION BANNER & FOOTER */}
          {/* ========================================================================= */}
          <section
            id="cta-section"
            className="h-screen min-h-screen snap-start snap-always flex flex-col items-center justify-between text-center pt-20 pb-4 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full relative z-10 shrink-0 overflow-hidden"
          >
            <div className="w-full my-auto">
              <Card className="p-8 sm:p-12 border-amber-500/40 bg-gradient-to-tr from-[#131B2A] via-[#1A2335] to-amber-500/10 text-center space-y-5 shadow-2xl relative overflow-hidden rounded-3xl">
                <div className="space-y-2.5 max-w-2xl mx-auto relative z-10">
                  <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
                    Ready to Put Your Social Media on Autopilot?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Join thousands of business owners using BrandFlow to create professional, on-brand promotional posts in under 30 seconds.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={UserPlus}
                    onClick={() => navigate('/register')}
                    className="w-full sm:w-auto px-8 py-3.5 text-base font-extrabold shadow-xl shadow-amber-500/30 hover:scale-105 transition-all duration-200"
                  >
                    Start Your Free Trial
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    icon={LogIn}
                    onClick={() => navigate('/login')}
                    className="w-full sm:w-auto px-8 py-3.5 text-base border-[#2C384E] text-slate-200 hover:text-white hover:border-slate-500"
                  >
                    Log In
                  </Button>
                </div>
              </Card>
            </div>

            <div className="w-full shrink-0 pb-16">
              <Footer />
            </div>
          </section>

        </main>
      </div>

      {/* Floating Presentation Dock Controller */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#131B2A]/90 border border-[#2C384E] backdrop-blur-md shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
        <button
          onClick={() => setIsTourActive(!isTourActive)}
          className={`p-2 rounded-full text-slate-950 font-bold transition-all shadow-md ${
            isTourActive ? 'bg-amber-400 hover:bg-amber-300 animate-pulse' : 'bg-slate-700 text-white hover:bg-slate-600'
          }`}
          title={isTourActive ? 'Pause Auto Presentation' : 'Start Auto Presentation'}
        >
          {isTourActive ? <Pause className="w-3.5 h-3.5 fill-slate-950" /> : <Play className="w-3.5 h-3.5 fill-white" />}
        </button>

        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-[280px] sm:max-w-none">
          {SECTIONS.map((sec, idx) => (
            <button
              key={sec.id}
              onClick={() => {
                setIsTourActive(false);
                scrollToSection(idx);
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all ${
                currentSectionIdx === idx
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
