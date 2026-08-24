import React from "react";
import { Search, X } from "lucide-react";

/**
 * SearchBar
 * Reusable search input component styled with dark glassmorphism.
 *
 * @param {Object} props
 * @param {string} props.value - Search string state value.
 * @param {Function} props.onChange - Handler called when input value changes.
 * @param {string} [props.placeholder="Search..."] - Input placeholder text.
 * @param {string} [props.className=""] - Additional container CSS classes.
 */
export const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) => {
  return (
    <div className={`relative flex-1 ${className}`}>
      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 placeholder:text-slate-500 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
