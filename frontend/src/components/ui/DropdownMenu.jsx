import React, { useState, useRef, useEffect } from 'react';

/**
 * Universal Accessible Dropdown Menu
 */
export const DropdownMenu = ({
  trigger,
  children,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const alignStyles = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right',
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute ${alignStyles[align] || alignStyles.right} mt-2 w-48 rounded-xl bg-[#131B2A] border border-[#2C384E] shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150 ${className}`}
        >
          {typeof children === 'function' ? children({ close: () => setIsOpen(false) }) : children}
        </div>
      )}
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick, className = '', danger = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left px-3.5 py-2 text-xs transition flex items-center gap-2 ${
      danger
        ? 'text-rose-400 hover:bg-rose-500/10'
        : 'text-slate-300 hover:text-white hover:bg-slate-800'
    } ${className}`}
  >
    {children}
  </button>
);

export default DropdownMenu;
