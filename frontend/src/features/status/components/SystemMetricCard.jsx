import React from 'react';

/**
 * 📈 SystemMetricCard
 * High-level KPI metric indicator with icon and subtext.
 */
export const SystemMetricCard = ({ title, value, subtitle, icon: Icon, valueColor = 'text-white' }) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-[#2C384E] bg-[#131B2A]/90 shadow-lg space-y-1.5">
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-1.5 rounded-lg bg-slate-800/60 text-amber-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className={`text-2xl sm:text-3xl font-heading font-extrabold tracking-tight ${valueColor}`}>
        {value}
      </div>
      {subtitle && (
        <p className="text-[11px] text-slate-400 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};
