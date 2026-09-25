import React from 'react';

export const PostQuotaSlider = ({ value, onChange, min = 10, max = 500, step = 10 }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400">Post Generation Quota:</span>
        <span className="font-bold text-amber-400 font-mono text-sm">{value} Posts</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
      />
      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
        <span>{min} Posts</span>
        <span>{max} Posts</span>
      </div>
    </div>
  );
};

export default PostQuotaSlider;
