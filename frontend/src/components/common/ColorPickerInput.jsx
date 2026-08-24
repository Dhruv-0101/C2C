import React from "react";

/**
 * ColorPickerInput
 * Reusable color swatch picker input displaying real-time hex value text.
 *
 * @param {Object} props
 * @param {string} props.label - Label text for the color picker.
 * @param {string} props.value - Hex color string (e.g. '#F59E0B').
 * @param {Function} props.onChange - Handler called when color changes (passes hex string).
 * @param {string} [props.sublabel] - Optional sublabel text underneath.
 */
export const ColorPickerInput = ({ label, value, onChange, sublabel }) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-medium">{label}</span>
        {sublabel && <span className="text-[9px] text-slate-500">{sublabel}</span>}
      </div>
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#0B0F17] border border-[#2C384E]">
        <input
          type="color"
          value={value}
          onInput={(e) => onChange(e.target.value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
        />
        <span className="text-xs font-mono text-white font-semibold">{value}</span>
      </div>
    </div>
  );
};
