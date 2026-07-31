import React from 'react';
import clsx from 'clsx';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

/**
 * Reusable Alert Component for Errors, Success, and Warnings
 */
export const Alert = ({ variant = 'error', message, title, className = '' }) => {
  if (!message) return null;

  const variants = {
    error: {
      container: 'bg-rose-950/40 border-rose-500/40 text-rose-200',
      icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
    },
    success: {
      container: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
    },
    warning: {
      container: 'bg-amber-950/40 border-amber-500/40 text-amber-200',
      icon: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
    },
    info: {
      container: 'bg-teal-950/40 border-teal-500/40 text-teal-200',
      icon: <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />,
    },
  };

  const currentVariant = variants[variant] || variants.error;

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200',
        currentVariant.container,
        className
      )}
      role="alert"
    >
      {currentVariant.icon}
      <div className="text-sm leading-relaxed">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <p>{message}</p>
      </div>
    </div>
  );
};
