import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * Reusable Global Feedback Modal for Enterprise Admin Operations (DRY Principle)
 * Uses React createPortal to mount directly to document.body with z-[9999]
 * ensuring 100% full-viewport dark backdrop overlay above all headers and sidebars.
 */
export const FeedbackModal = ({
  isOpen,
  onClose,
  type = 'success',
  title,
  message,
  actionLabel,
  onAction,
}) => {
  if (!isOpen) return null;

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    onClose();
  };

  // Config mapping per notification type
  const typeConfig = {
    success: {
      icon: CheckCircle2,
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      glowColor: 'shadow-emerald-500/20',
      btnVariant: 'primary',
      defaultTitle: 'Operation Successful! 🎉',
      defaultAction: 'Great, Got it!',
    },
    error: {
      icon: AlertCircle,
      badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      glowColor: 'shadow-rose-500/20',
      btnVariant: 'secondary',
      defaultTitle: 'Operation Failed ⚠️',
      defaultAction: 'Try Again',
    },
    warning: {
      icon: AlertTriangle,
      badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      glowColor: 'shadow-amber-500/20',
      btnVariant: 'primary',
      defaultTitle: 'Attention Required 🔔',
      defaultAction: 'Proceed',
    },
    info: {
      icon: Info,
      badgeBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
      glowColor: 'shadow-indigo-500/20',
      btnVariant: 'outline',
      defaultTitle: 'System Notification',
      defaultAction: 'Understand',
    },
  };

  const config = typeConfig[type] || typeConfig.success;
  const IconComponent = config.icon;

  const modalContent = (
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-md bg-[#131B2A] border border-[#2C384E] rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Glow Accent Bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            type === 'success'
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500'
              : type === 'error'
              ? 'bg-gradient-to-r from-rose-500 via-red-400 to-rose-500'
              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500'
          }`}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Icon Badge & Titles */}
        <div className="text-center space-y-4 pt-2">
          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border shadow-xl ${config.badgeBg} ${config.glowColor}`}
          >
            <IconComponent className="w-8 h-8 animate-bounce duration-[1500ms]" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
              {title || config.defaultTitle}
            </h3>
            {message && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed px-2">
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            variant={config.btnVariant}
            size="lg"
            onClick={handleAction}
            className="w-full font-bold shadow-lg"
          >
            {actionLabel || config.defaultAction}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
