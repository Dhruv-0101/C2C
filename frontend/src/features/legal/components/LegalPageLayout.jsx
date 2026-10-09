import React, { useState } from 'react';
import { Search, Printer, Shield, ArrowUp, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * 📜 LegalPageLayout
 * Reusable shell for legal documents featuring interactive Table of Contents,
 * keyword search filter, print trigger, and high-readability typography.
 */
export const LegalPageLayout = ({
  title,
  subtitle,
  lastUpdated,
  version = '2.1',
  sections = [],
  children,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');

  // Ensure page always opens from the very top (start)
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-body py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Document Header Banner */}
        <div className="p-6 sm:p-10 rounded-3xl border border-[#2C384E] bg-[#131B2A]/90 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Shield className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Legal Documentation • v{version}
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-4xl font-black text-white tracking-tight">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              <div className="text-left md:text-right text-xs text-slate-400">
                <p className="font-semibold text-slate-300">Effective Date</p>
                <p className="text-slate-500">{lastUpdated}</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="text-xs flex items-center gap-1.5 print:hidden"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content Layout: Sticky TOC + Main Article */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Left Sidebar: Table of Contents */}
          <aside className="lg:col-span-4 sticky top-6 hidden lg:block print:hidden">
            <div className="p-5 rounded-2xl border border-[#2C384E] bg-[#131B2A]/90 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Table of Contents</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  {sections.length} Sections
                </span>
              </div>

              {/* Quick Jump List */}
              <nav className="space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto pr-1 custom-scrollbar">
                {sections.map((section, idx) => {
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 flex items-center justify-between gap-2 ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="line-clamp-1">
                        {idx + 1}. {section.title}
                      </span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Enterprise Compliance</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> GDPR & Meta Ready
                </span>
              </div>
            </div>
          </aside>

          {/* Main Article Body */}
          <main className="lg:col-span-8 space-y-8">
            <div className="prose prose-invert max-w-none space-y-8 text-slate-300 text-sm leading-relaxed">
              {children}
            </div>

            {/* Back to Top */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 print:hidden">
              <p>BrandFlow Legal Department • legal@brandflow.io</p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
              >
                <span>Back to top</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </main>
        </div>

      </div>
    </div>
  );
};

export default LegalPageLayout;
