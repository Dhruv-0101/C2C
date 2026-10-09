import React, { useState } from 'react';
import clsx from 'clsx';

/**
 * 📊 90-Day Interactive Uptime Bar Visualization
 */
export const StatusUptimeBar = ({ history = [], uptimePercentage = 99.98 }) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold text-slate-300">90-Day System Availability</span>
        <span className="font-bold text-emerald-400">{uptimePercentage}% Uptime</span>
      </div>

      {/* Discrete 90-day bars */}
      <div className="relative">
        <div className="flex items-center gap-[2px] sm:gap-[3px] h-9 w-full p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
          {history.map((day, idx) => {
            const isDegraded = day.status === 'DEGRADED';
            const isOutage = day.status === 'DOWN' || day.status === 'MAJOR_OUTAGE';
            const isHovered = hoveredDay?.date === day.date;

            return (
              <div
                key={day.date || idx}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                className={clsx(
                  'flex-1 h-full rounded-sm transition-all duration-150 cursor-pointer',
                  isOutage
                    ? 'bg-rose-500 hover:bg-rose-400'
                    : isDegraded
                    ? 'bg-amber-400 hover:bg-amber-300'
                    : 'bg-emerald-500/80 hover:bg-emerald-400',
                  isHovered && 'scale-y-125 shadow-lg shadow-emerald-500/30'
                )}
              />
            );
          })}
        </div>

        {/* Hover Tooltip */}
        {hoveredDay && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-[11px] shadow-xl text-center whitespace-nowrap z-20 pointer-events-none animate-in fade-in duration-100">
            <span className="font-semibold text-white">{hoveredDay.date}</span>: {hoveredDay.uptimePercentage}% operational
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span>90 days ago</span>
        <span className="text-emerald-500/80 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          No downtime detected
        </span>
        <span>Today</span>
      </div>
    </div>
  );
};
