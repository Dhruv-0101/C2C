import React from 'react';
import { Globe } from 'lucide-react';

/**
 * Dedicated Currency Sub-Tabs Navigator
 * Clean executive segmented control for switching financial ledgers.
 */
export const FinanceCurrencyTabs = ({ currency, onSelectCurrency }) => {
  const tabs = [
    {
      id: '',
      label: 'All Currencies',
      icon: <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
      badge: 'Combined',
    },
    {
      id: 'INR',
      label: 'INR Ledger (₹)',
      icon: <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-mono text-[11px] font-black shrink-0">₹</span>,
      badge: 'Razorpay • UPI',
    },
    {
      id: 'USD',
      label: 'USD Ledger ($)',
      icon: <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-mono text-[11px] font-black shrink-0">$</span>,
      badge: 'Stripe Global',
    },
  ];

  return (
    <div className="flex items-center gap-2 p-1.5 bg-[#131B2A] border border-[#2C384E] rounded-2xl overflow-x-auto text-xs">
      {tabs.map((tab) => {
        const isActive = currency === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectCurrency(tab.id)}
            className={`px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-slate-800/90 text-white font-bold border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0B0F17]/60 border border-transparent font-medium'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {tab.icon}
              <span>{tab.label}</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-semibold transition-colors ${
                isActive
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-[#0B0F17] text-slate-500 border border-[#2C384E]'
              }`}
            >
              {tab.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default FinanceCurrencyTabs;
