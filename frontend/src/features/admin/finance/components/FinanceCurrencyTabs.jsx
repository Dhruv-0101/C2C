import React from 'react';

/**
 * Dedicated Currency Sub-Tabs Navigator
 */
export const FinanceCurrencyTabs = ({ currency, onSelectCurrency }) => {
  const tabs = [
    { id: '', label: '🌐 All Currencies', badge: 'Combined Overview' },
    { id: 'INR', label: '🇮🇳 INR Ledger (₹)', badge: 'Razorpay & UPI' },
    { id: 'USD', label: '🇺🇸 USD Ledger ($)', badge: 'Stripe International' },
  ];

  return (
    <div className="flex items-center gap-2 p-1.5 bg-[#131B2A] border border-[#2C384E] rounded-2xl overflow-x-auto text-xs font-bold">
      {tabs.map((tab) => {
        const isActive = currency === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectCurrency(tab.id)}
            className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              isActive
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-[#0B0F17]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-[#0B0F17] text-slate-400 border border-[#2C384E]'
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
