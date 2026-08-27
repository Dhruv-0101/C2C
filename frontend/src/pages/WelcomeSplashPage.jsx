import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Layers,
  Building2,
  Calendar,
  UserPlus,
  LogIn,
  Wand2,
  Clock,
  Send,
  FolderKanban,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Header } from "../components/common/Header";
import { Footer } from "../components/common/Footer";
import { InteractiveWorkflowDemo } from "../components/common/InteractiveWorkflowDemo";

export const WelcomeSplashPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);

  // Typewriter Animation State
  const [typedText, setTypedText] = useState("");
  const phrases = [
    "In Under 30 Seconds",
    "For Festivals & Offers",
    "For Your Business",
    "100% Always On-Brand",
    "Across All Platforms",
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter Animation Effect
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
        if (typedText === "") {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, phraseIndex]);

  return (
    <div className="min-h-screen w-full bg-[#0B0F17] text-slate-100 font-body relative overflow-x-hidden">
      {/* Ambient Radial Background Glows */}
      <div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-tr from-amber-500/10 via-teal-500/5 to-indigo-500/10 blur-[160px] pointer-events-none" />
      <div className="fixed top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[150px] pointer-events-none" />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b border-[#2C384E]/40">
        <Header />
      </div>

      <main className="w-full">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION */}
        {/* ========================================================================= */}
        <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-8 relative z-10">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#131B2A] border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-wider shadow-lg">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Autonomous Social Media Manager</span>
          </div>

          {/* Clean Main Headline with Auto-Typing Effect */}
          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Create Branded Social Posts{" "}
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-teal-400 bg-clip-text text-transparent block sm:inline-block min-w-[280px]">
              {typedText}
              <span className="animate-pulse text-amber-400 font-normal ml-0.5">
                |
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Turn your business offers, festival greetings, and promotions into
            professional, on-brand social media graphics with instant
            multi-platform scheduling.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              icon={UserPlus}
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto px-8 py-3.5 text-base font-extrabold shadow-xl shadow-amber-500/20 hover:scale-105 transition-all duration-200"
            >
              Start Free Trial
            </Button>
            <Button
              variant="outline"
              size="lg"
              icon={LogIn}
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto px-8 py-3.5 text-base border-[#2C384E] text-slate-200 hover:text-white hover:border-slate-500"
            >
              Log In to Workspace
            </Button>
          </div>

          {/* Metric Highlights Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-[#2C384E]/60 max-w-3xl mx-auto">
            <div className="space-y-1 p-3 rounded-2xl bg-[#131B2A]/40 border border-[#2C384E]/40">
              <p className="font-heading font-extrabold text-2xl sm:text-3xl text-amber-400">
                &lt; 30s
              </p>
              <p className="text-xs text-slate-400 font-medium">
                Post Creation
              </p>
            </div>
            <div className="space-y-1 p-3 rounded-2xl bg-[#131B2A]/40 border border-[#2C384E]/40">
              <p className="font-heading font-extrabold text-2xl sm:text-3xl text-teal-400">
                100%
              </p>
              <p className="text-xs text-slate-400 font-medium">
                Always On-Brand
              </p>
            </div>
            <div className="space-y-1 p-3 rounded-2xl bg-[#131B2A]/40 border border-[#2C384E]/40">
              <p className="font-heading font-extrabold text-2xl sm:text-3xl text-indigo-400">
                1-Click
              </p>
              <p className="text-xs text-slate-400 font-medium">
                Multi-Publish
              </p>
            </div>
            <div className="space-y-1 p-3 rounded-2xl bg-[#131B2A]/40 border border-[#2C384E]/40">
              <p className="font-heading font-extrabold text-2xl sm:text-3xl text-emerald-400">
                365 Days
              </p>
              <p className="text-xs text-slate-400 font-medium">
                Festival Ready
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. LIVE INTERACTIVE DEMO */}
        {/* ========================================================================= */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
          <div className="text-center space-y-2 mb-4">
            <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Preview
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              See BrandFlow in Action
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Test how business details seamlessly auto-populate onto vector
              frames in real-time.
            </p>
          </div>

          <InteractiveWorkflowDemo />
        </section>

        {/* ========================================================================= */}
        {/* 3. 3-STEP WORKFLOW */}
        {/* ========================================================================= */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-10 relative z-10">
          <div className="space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-teal-400 bg-teal-500/10 border border-teal-500/30 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-teal-400" /> How It Works
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Simple 3-Step Content Creation
            </h2>
            <p className="text-sm text-slate-400">
              No complex design software needed. Pick your event, auto-brand,
              and publish.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Step 1 */}
            <div
              onClick={() => setActiveStep(1)}
              className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer space-y-4 ${
                activeStep === 1
                  ? "bg-[#131B2A] border-amber-400/80 shadow-xl shadow-amber-500/10"
                  : "bg-[#131B2A]/60 border-[#2C384E] hover:border-amber-500/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center font-extrabold text-sm font-mono">
                  01
                </div>
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-heading font-extrabold text-lg text-white">
                1. Select Event or Offer
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Choose an upcoming festival (Diwali, New Year, Independence Day)
                or custom business promotion.
              </p>
              <div className="pt-2 text-xs font-mono text-amber-400 flex items-center gap-1.5 font-bold border-t border-amber-500/20">
                <Check className="w-4 h-4" /> Ready-made templates
              </div>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => setActiveStep(2)}
              className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer space-y-4 ${
                activeStep === 2
                  ? "bg-[#131B2A] border-teal-400/80 shadow-xl shadow-teal-500/10"
                  : "bg-[#131B2A]/60 border-[#2C384E] hover:border-teal-500/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/40 text-teal-400 flex items-center justify-center font-extrabold text-sm font-mono">
                  02
                </div>
                <Layers className="w-5 h-5 text-teal-400" />
              </div>
              <h3 className="font-heading font-extrabold text-lg text-white">
                2. Auto-Brand Frame
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your logo, phone number, address, and headshot automatically
                overlay onto Canva vector frames.
              </p>
              <div className="pt-2 text-xs font-mono text-teal-400 flex items-center gap-1.5 font-bold border-t border-teal-500/20">
                <Check className="w-4 h-4" /> 100% Brand consistency
              </div>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => setActiveStep(3)}
              className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer space-y-4 ${
                activeStep === 3
                  ? "bg-[#131B2A] border-indigo-400/80 shadow-xl shadow-indigo-500/10"
                  : "bg-[#131B2A]/60 border-[#2C384E] hover:border-indigo-500/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-extrabold text-sm font-mono">
                  03
                </div>
                <Send className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-heading font-extrabold text-lg text-white">
                3. Multi-Platform Publish
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generate engaging captions and hashtags, then publish or
                schedule directly to your channels.
              </p>
              <div className="pt-2 text-xs font-mono text-indigo-400 flex items-center gap-1.5 font-bold border-t border-indigo-500/20">
                <Check className="w-4 h-4" /> Instagram, FB, LinkedIn
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. KEY FEATURES */}
        {/* ========================================================================= */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10 relative z-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1 rounded-full">
              Platform Capabilities
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Built for Modern Small Businesses
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
            <Card className="p-5 border-[#2C384E] bg-[#131B2A]/80 hover:border-amber-500/50 transition-all duration-200 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Building2 className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-heading font-extrabold text-base text-white">
                Master BrandKit
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Save your business logo, primary colors, contact details, and
                handles once for automatic placement.
              </p>
            </Card>

            <Card className="p-5 border-[#2C384E] bg-[#131B2A]/80 hover:border-teal-500/50 transition-all duration-200 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
                <Layers className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-heading font-extrabold text-base text-white">
                Vector Frame Studio
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Overlay transparent vector frames with headshot rings and logo
                containers dynamically in real-time.
              </p>
            </Card>

            <Card className="p-5 border-[#2C384E] bg-[#131B2A]/80 hover:border-indigo-500/50 transition-all duration-200 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-heading font-extrabold text-base text-white">
                Festival Calendar
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Never miss key dates with automated festival prompts for
                holidays and national celebrations.
              </p>
            </Card>

            <Card className="p-5 border-[#2C384E] bg-[#131B2A]/80 hover:border-emerald-500/50 transition-all duration-200 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Wand2 className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-heading font-extrabold text-base text-white">
                Caption & Copy Writer
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generate high-converting post captions, promotional copy, and
                trending hashtags for your niche.
              </p>
            </Card>

            <Card className="p-5 border-[#2C384E] bg-[#131B2A]/80 hover:border-cyan-500/50 transition-all duration-200 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-heading font-extrabold text-base text-white">
                Multi-Channel Queue
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Queue and schedule posts for peak audience engagement across
                Instagram, Facebook, and LinkedIn.
              </p>
            </Card>

            <Card className="p-5 border-[#2C384E] bg-[#131B2A]/80 hover:border-rose-500/50 transition-all duration-200 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <FolderKanban className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-heading font-extrabold text-base text-white">
                Asset Vault
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Store and organize your graphics, published posts, and reusable
                design assets in one place.
              </p>
            </Card>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. CALL TO ACTION BANNER */}
        {/* ========================================================================= */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
          <Card className="p-8 sm:p-12 border-amber-500/30 bg-gradient-to-tr from-[#131B2A] via-[#1A2335] to-amber-500/10 text-center space-y-6 shadow-2xl rounded-3xl">
            <div className="space-y-3 max-w-2xl mx-auto">
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                Ready to Automate Your Social Media?
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Join business owners using BrandFlow to create professional,
                on-brand promotional posts in under 30 seconds.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                icon={UserPlus}
                onClick={() => navigate("/register")}
                className="w-full sm:w-auto px-8 py-3.5 text-base font-extrabold shadow-xl shadow-amber-500/30 hover:scale-105 transition-all duration-200"
              >
                Start Your Free Trial
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon={LogIn}
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-8 py-3.5 text-base border-[#2C384E] text-slate-200 hover:text-white hover:border-slate-500"
              >
                Log In to Account
              </Button>
            </div>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
