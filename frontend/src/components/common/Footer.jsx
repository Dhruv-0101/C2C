import React from 'react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800/60 py-6 px-4 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} BrandFlow Platform. Enterprise Social Media Management.</p>
        <div className="flex items-center gap-4 text-slate-400">
          <a href="#privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-amber-400 transition-colors">Terms of Service</a>
          <a href="#support" className="hover:text-amber-400 transition-colors">System Status</a>
        </div>
      </div>
    </footer>
  );
};
