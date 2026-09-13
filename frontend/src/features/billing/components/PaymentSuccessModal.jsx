import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Sparkles, Zap, ArrowRight, X } from 'lucide-react';
import Button from '../../../components/ui/Button';

export const PaymentSuccessModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const pricing = data.pricing || {};
  const subscription = data.subscription || {};

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#131B2A] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/20 text-center space-y-6 overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Celebration Badge Icon */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/30 flex items-center justify-center animate-bounce">
          <div className="w-full h-full bg-[#0B0F17] rounded-[22px] flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Payment Successful
          </span>
          <h2 className="text-2xl font-heading font-extrabold text-white">
            Plan Activated!
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {data.message || 'Your subscription plan has been successfully activated.'}
          </p>
        </div>

        {/* Quota Invoice Summary Box */}
        <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] space-y-3 text-xs text-left">
          <div className="flex justify-between items-center pb-2 border-b border-[#2C384E]">
            <span className="text-slate-400 font-medium">Activated Plan:</span>
            <span className="text-amber-400 font-extrabold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              {subscription.plan || 'PRO'} PLAN
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-[#2C384E]">
            <span className="text-slate-400 font-medium">Posts Quota Unlocked:</span>
            <span className="text-emerald-400 font-extrabold text-sm">
              {subscription.totalPostsAllowed || pricing.postCount || 5} Posts
            </span>
          </div>

          {pricing.finalTotal !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Total Paid:</span>
              <span className="text-white font-bold">
                {pricing.currencySymbol || '₹'} {pricing.finalTotal} ({pricing.currency || 'INR'})
              </span>
            </div>
          )}
        </div>

        <Button
          variant="primary"
          onClick={onClose}
          className="w-full justify-center py-3 text-sm font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-0 shadow-lg shadow-emerald-500/20"
        >
          <span>Continue to Post Studio</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>,
    document.body
  );
};
export default PaymentSuccessModal;
