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
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { InteractiveWorkflowDemo } from '../components/common/InteractiveWorkflowDemo';

export const WelcomeSplashPage = () => {
  const navigate = useNavigate();

  // Typewriter Animation State
  const [typedText, setTypedText] = useState('');
  const phrases = ['In Seconds', 'For Festivals', 'For Your Business', 'In 0ms Real-Time'];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const typingSpeed = isDeleting ? 40 : 80;

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

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 font-body relative overflow-hidden">
      {/* Animated Ambient Radial Glow Background */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-amber-500/15 via-teal-500/10 to-indigo-500/15 blur-[140px] pointer-events-none animate-pulse duration-[6000ms]" />

      <Header />

      <main className="flex-1 relative z-10 flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-12">
        {/* Short & Punchy Animated Hero */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Animated Platform Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/10 animate-in fade-in slide-in-from-top-4 duration-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Branded Social Media Platform</span>
          </div>

          {/* High-Impact Animated Typewriter Title */}
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
            Create Branded Posts{' '}
            <span className="text-gradient inline-block min-w-[240px] text-left">
              {typedText}
              <span className="animate-pulse text-amber-400 font-normal ml-0.5">|</span>
            </span>
          </h1>

          {/* Short Subtitle */}
          <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Composite custom Canva-style frame overlays, auto-fill your business BrandKit, and generate 1080x1080 festival marketing posts instantly.
          </p>

          {/* Action CTAs */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              icon={UserPlus}
              onClick={() => navigate('/register')}
              className="px-8 shadow-xl shadow-amber-500/20 hover:scale-105 transition-transform"
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              size="lg"
              icon={LogIn}
              onClick={() => navigate('/login')}
              className="px-8 border-[#2C384E] text-slate-200 hover:text-white hover:border-slate-600"
            >
              Log In
            </Button>
          </div>
        </section>

        {/* Live Animated Interactive Workflow Simulation Stage */}
        <section className="w-full max-w-5xl">
          <InteractiveWorkflowDemo />
        </section>

        {/* 3 High-Level Capability Pillars */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Pillar 1 */}
          <Card className="p-6 border-[#2C384E] bg-[#131B2A]/80 hover:border-amber-500/50 transition duration-300 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-white">Canva-Style Frames</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Overlay dynamic logo boxes, headshot photo rings, and custom vector text fields seamlessly.
            </p>
          </Card>

          {/* Pillar 2 */}
          <Card className="p-6 border-[#2C384E] bg-[#131B2A]/80 hover:border-teal-500/50 transition duration-300 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-white">Master BrandKit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fill your logo, business phone, address, and tagline once for instant auto-fill across all posts.
            </p>
          </Card>

          {/* Pillar 3 */}
          <Card className="p-6 border-[#2C384E] bg-[#131B2A]/80 hover:border-indigo-500/50 transition duration-300 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-white">Festival Marketing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Access pre-designed graphics for Diwali, New Year, and annual marketing campaigns in one click.
            </p>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};
