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
    <div className="modal-backdrop-overlay fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in font-sans">
      <div
        className={`w-full ${maxWidth} bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#2C384E] rounded-2xl p-4 sm:p-6 shadow-2xl my-auto text-slate-800 dark:text-slate-100 max-h-[92dvh] flex flex-col animate-in zoom-in-95 duration-200 ${className}`}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2C384E] pb-3 shrink-0">
            <div>
              {title && <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">{title}</h3>}
              {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition cursor-pointer shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 mt-3">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
