import React from 'react';
import { CreditCard, Download, Plus, CalendarRange, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const PRESET_BUTTONS = [
  { id: 'ALL', label: '🌐 All Time' },
  { id: 'TODAY', label: 'Today (1d)' },
  { id: '7_DAYS', label: 'Last 7 Days' },
  { id: '30_DAYS', label: 'Last 30 Days' },
  { id: '90_DAYS', label: 'Last 90 Days' },
  { id: 'YEAR', label: 'Past 1 Year' },
];

/**
 * Top executive financial banner with timeframe scope, presets, and action buttons
 */
export const FinanceScopeBanner = ({
  scopeInfo = { label: 'All Recorded History', daysText: 'All Time', isFiltered: false },
  activePreset = 'ALL',
  onApplyPreset = () => {},
  isExporting = false,
  onExport,
  onOpenManual,
}) => {
  return (
    <div className="space-y-4">
      {/* 1. Executive Console Header */}
      <div className="p-6 rounded-2xl border border-[#2C384E] bg-gradient-to-r from-[#131B2A] via-[#1a2538] to-[#0B0F17] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Executive Financial & Revenue Hub</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Finance & Revenue Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Isolated visual tracking for INR (Razorpay / UPI), USD (Stripe), and subscription ledgers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              disabled={isExporting}
              className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs py-2"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              <span>{isExporting ? 'Generating Statement...' : 'Export Statement (CSV)'}</span>
            </Button>
          )}

          {onOpenManual && (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenManual}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs py-2 shadow-lg"
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-slate-950 font-black" />
              <span>Log Offline Payment</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Reporting Horizon & Scope Presets Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#182335] via-[#131B2A] to-[#0F172A] border border-[#2C384E] flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-xl font-sans">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Reporting Data Scope:
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-extrabold flex items-center gap-1.5 shadow-sm">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>{scopeInfo.daysText}</span>
              </span>
              {scopeInfo.isFiltered && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono font-bold">
                  Filtered Period
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-heading font-extrabold text-white flex items-center gap-1.5">
              <span>{scopeInfo.label}</span>
            </p>
          </div>
        </div>

        {/* Quick Range Presets & Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESET_BUTTONS.map((preset) => {
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onApplyPreset(preset.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-extrabold'
                    : 'bg-[#0B0F17] text-slate-400 hover:text-white hover:bg-slate-800 border border-[#2C384E]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}

          {scopeInfo.isFiltered && (
            <button
              onClick={() => onApplyPreset('ALL')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceScopeBanner;
