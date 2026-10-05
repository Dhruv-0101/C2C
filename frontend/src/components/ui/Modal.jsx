import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Universal Accessible Modal Component
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-backdrop-overlay fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 animate-in fade-in font-sans">
      <div
        className={`w-full ${maxWidth} bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#2C384E] rounded-2xl p-6 space-y-4 shadow-2xl my-auto text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200 ${className}`}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2C384E] pb-3">
            <div>
              {title && <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">{title}</h3>}
              {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
