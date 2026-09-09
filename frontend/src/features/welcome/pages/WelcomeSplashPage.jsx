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
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Header } from "../../../components/common/Header";
import { Footer } from "../../../components/common/Footer";
import { InteractiveWorkflowDemo } from "../../../components/common/InteractiveWorkflowDemo";
import { ScrollReveal } from "../../../components/common/ScrollReveal";

/**
 * WelcomeSplashPage Component
 * High-converting public landing page showcasing BrandFlow features & interactive demo
 * with scroll-triggered animations and dynamic visual feedback.
 */
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
      {/* Ambient Animated Radial Background Glows */}
      <div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-tr from-amber-500/10 via-teal-500/5 to-indigo-500/10 blur-[160px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="fixed top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[140px] pointer-events-none" />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b border-[#2C384E]/40">
        <Header />
      </div>

      <main className="w-full">
        {/* HERO SECTION */}
        <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-8 relative z-10">
          <ScrollReveal animation="fade-up" delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#131B2A] border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-wider shadow-lg hover:border-amber-400/50 transition-colors cursor-default">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>Autonomous Social Media Manager</span>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={100}>
            <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-white tracking-tight leading-tight max-w-4xl mx-auto">
              Create Branded Social Posts{" "}
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-teal-400 bg-clip-text text-transparent block sm:inline-block min-w-[280px]">
                {typedText}
                <span className="animate-pulse text-amber-400 font-normal ml-0.5">
                  |
                </span>
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={200}>
            <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
              Turn your business offers, festival greetings, and promotions into
              professional, on-brand social media graphics with instant
              multi-platform scheduling.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                icon={UserPlus}
                onClick={() => navigate("/register")}
                className="w-full sm:w-auto px-8 py-3.5 text-base font-extrabold shadow-xl shadow-amber-500/20 hover:scale-105 hover:shadow-amber-500/30 transition-all duration-300"
              >
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon={LogIn}
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-8 py-3.5 text-base border-[#2C384E] text-slate-200 hover:text-white hover:border-slate-500 hover:scale-105 transition-all duration-300"
              >
                Log In to Workspace
              </Button>
            </div>
          </ScrollReveal>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-[#2C384E]/60 max-w-3xl mx-auto">
            <ScrollReveal animation="zoom-in" delay={350}>
              <div className="space-y-1 p-3.5 rounded-2xl bg-[#131B2A]/40 border border-[#2C384E]/40 hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300">
                <p className="font-heading font-extrabold text-2xl sm:text-3xl text-amber-400">
                  &lt; 30s
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  Post Creation
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="zoom-in" delay={450}>
              <div className="space-y-1 p-3.5 rounded-2xl bg-[#131B2A]/40 border border-[#2C384E]/40 hover:border-teal-500/40 hover:-translate-y-1 transition-all duration-300">
                <p className="font-heading font-extrabold text-2xl sm:text-3xl text-teal-400">
                  100%
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  Always On-Brand
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="zoom-in" delay={550}>
              <div className="space-y-1 p-3.5 rounded-2xl bg-[#131B2A]/40 border border-[#2C384E]/40 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300">
                <p className="font-heading font-extrabold text-2xl sm:text-3xl text-indigo-400">
                  1-Click
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  Multi-Publish
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="zoom-in" delay={650}>
              <div className="space-y-1 p-3.5 rounded-2xl bg-[#131B2A]/40 border border-[#2C384E]/40 hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300">
                <p className="font-heading font-extrabold text-2xl sm:text-3xl text-emerald-400">
                  365 Days
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  Festival Ready
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* LIVE INTERACTIVE DEMO SECTION */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
          <ScrollReveal animation="fade-up" delay={0}>
            <div className="text-center space-y-2 mb-6">
              <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-lg shadow-amber-500/5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: "6s" }} /> Interactive Preview
              </span>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                See BrandFlow in Action
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Test how business details seamlessly auto-populate onto custom brand
                frames in real-time.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="glow-pulse" delay={150} duration={800}>
            <div className="p-1 rounded-3xl bg-gradient-to-b from-amber-500/20 via-[#2C384E]/40 to-teal-500/20 border border-amber-500/30 shadow-2xl shadow-amber-500/5">
              <InteractiveWorkflowDemo />
            </div>
          </ScrollReveal>
        </section>

        {/* 3-STEP WORKFLOW SECTION */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-12 relative z-10">
          <ScrollReveal animation="fade-up" delay={0}>
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
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left relative">

            <ScrollReveal animation="fade-up" delay={100} className="z-10">
              <div
                onClick={() => setActiveStep(1)}
                className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer space-y-4 relative group ${activeStep === 1
                  ? "bg-[#131B2A] border-amber-400/80 shadow-2xl shadow-amber-500/15 -translate-y-2"
                  : "bg-[#131B2A]/60 border-[#2C384E] hover:border-amber-500/40 hover:-translate-y-1"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center font-extrabold text-sm font-mono group-hover:scale-110 transition-transform">
                    01
                  </div>
                  <Zap className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
                </div>
                <h3 className="font-heading font-extrabold text-lg text-white">
                  1. Select Event or Offer
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Choose from upcoming festivals, seasonal holidays, or custom business promotions.
                </p>
                <div className="pt-2 text-xs font-mono text-amber-400 flex items-center gap-1.5 font-bold border-t border-amber-500/20">
                  <Check className="w-4 h-4" /> Ready-made templates
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={250} className="z-10">
              <div
                onClick={() => setActiveStep(2)}
                className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer space-y-4 relative group ${activeStep === 2
                  ? "bg-[#131B2A] border-teal-400/80 shadow-2xl shadow-teal-500/15 -translate-y-2"
                  : "bg-[#131B2A]/60 border-[#2C384E] hover:border-teal-500/40 hover:-translate-y-1"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/40 text-teal-400 flex items-center justify-center font-extrabold text-sm font-mono group-hover:scale-110 transition-transform">
                    02
                  </div>
                  <Layers className="w-5 h-5 text-teal-400 group-hover:rotate-12 transition-transform" />
                </div>
                <h3 className="font-heading font-extrabold text-lg text-white">
                  2. Auto-Brand Frame
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your logo, phone number, address, and headshot automatically
                  overlay onto custom brand frames.
                </p>
                <div className="pt-2 text-xs font-mono text-teal-400 flex items-center gap-1.5 font-bold border-t border-teal-500/20">
                  <Check className="w-4 h-4" /> 100% Brand consistency
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={400} className="z-10">
              <div
                onClick={() => setActiveStep(3)}
                className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer space-y-4 relative group ${activeStep === 3
                  ? "bg-[#131B2A] border-indigo-400/80 shadow-2xl shadow-indigo-500/15 -translate-y-2"
                  : "bg-[#131B2A]/60 border-[#2C384E] hover:border-indigo-500/40 hover:-translate-y-1"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-extrabold text-sm font-mono group-hover:scale-110 transition-transform">
                    03
                  </div>
                  <Send className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
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
            </ScrollReveal>
          </div>
        </section>

        {/* KEY FEATURES SECTION */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10 relative z-10">
          <ScrollReveal animation="fade-up" delay={0}>
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1 rounded-full">
                Platform Capabilities
              </span>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                Built for Modern Small Businesses
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-5 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <ScrollReveal animation="fade-up" delay={100}>
                <Card className="p-5 border-[#2C384E] bg-[#131B2A]/80 hover:border-amber-500/50 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 space-y-2.5 group">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-heading font-extrabold text-base text-white">
                    Master BrandKit
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Save your business logo, contact details, and
                    handles once for automatic placement.
                  </p>
                </Card>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={200}>
                <Card className="p-5 border-[#2C384E] bg-[#131B2A]/80 hover:border-teal-500/50 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300 space-y-2.5 group">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wand2 className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-heading font-extrabold text-base text-white">
                    Post Creator Studio
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Design 1080x1080 high-res branded posts with dynamic business overlays in real-time.
                  </p>
                </Card>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={300}>
                <Card className="p-5 border-[#2C384E] bg-[#131B2A]/80 hover:border-indigo-500/50 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 space-y-2.5 sm:col-span-2 lg:col-span-1 group">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
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
              </ScrollReveal>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-stretch gap-5">
              <ScrollReveal animation="fade-up" delay={400} className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]">
                <Card className="p-5 border-[#2C384E] bg-[#131B2A]/80 hover:border-emerald-500/50 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 space-y-2.5 h-full group">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
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
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={500} className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]">
                <Card className="p-5 border-[#2C384E] bg-[#131B2A]/80 hover:border-cyan-500/50 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 space-y-2.5 h-full group">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
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
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION BANNER */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
          <ScrollReveal animation="glow-pulse" delay={100} duration={800}>
            <Card className="p-8 sm:p-12 border-amber-500/30 bg-gradient-to-tr from-[#131B2A] via-[#1A2335] to-amber-500/10 text-center space-y-6 shadow-2xl rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-3 max-w-2xl mx-auto relative z-10">
                {/* <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Join 1,000+ Active Businesses
                </div> */}
                <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                  Ready to Automate Your Social Media?
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Join business owners using BrandFlow to create professional,
                  on-brand promotional posts in under 30 seconds.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 relative z-10">
                <Button
                  variant="primary"
                  size="lg"
                  icon={UserPlus}
                  onClick={() => navigate("/register")}
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-extrabold shadow-xl shadow-amber-500/30 hover:scale-105 transition-all duration-300"
                >
                  Start Your Free Trial
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  icon={LogIn}
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto px-8 py-3.5 text-base border-[#2C384E] text-slate-200 hover:text-white hover:border-slate-500 hover:scale-105 transition-all duration-300"
                >
                  Log In to Account
                </Button>
              </div>

              {/* <div className="flex items-center justify-center gap-6 pt-4 text-xs text-slate-400 font-medium relative z-10">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> No credit card required
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Instant setup
                </span>
              </div> */}
            </Card>
          </ScrollReveal>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default WelcomeSplashPage;
