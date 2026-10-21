import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800/60 py-5 sm:py-6 px-3 sm:px-4 text-center text-[11px] sm:text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
        <p className="order-2 sm:order-1">© {new Date().getFullYear()} BrandFlow Platform. Enterprise Social Media Management.</p>
        <div className="order-1 sm:order-2 flex items-center gap-4 text-slate-400">
          <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
