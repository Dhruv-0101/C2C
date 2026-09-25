import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Accessible Select / Dropdown input primitive
 */
export const Select = ({
  label,
  options = [],
  value,
  onChange,
  error,
  placeholder = 'Select option...',
  className = '',
  ...props
}) => {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-xs font-semibold text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className={`w-full appearance-none bg-[#0B0F17] border border-[#2C384E] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition ${
            error ? 'border-rose-500' : ''
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
      </div>
      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
    </div>
  );
};

export default Select;
