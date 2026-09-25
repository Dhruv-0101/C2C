import React from 'react';
import { Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card } from '../../../../components/ui/Card';
import { formatCurrency } from '../../../../shared/utils/currency.util';

/**
 * Custom dark tooltip for financial charts
 */
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B0F17]/95 border border-[#2C384E] p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs font-sans space-y-1">
        <p className="font-bold text-slate-200 border-b border-[#2C384E] pb-1 font-mono">{label}</p>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 font-mono">
            <span className="flex items-center gap-1.5" style={{ color: entry.color || entry.fill }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span>{entry.name}:</span>
            </span>
            <span className="font-bold text-white">
              {entry.name?.includes('USD') || entry.dataKey === 'usd'
                ? formatCurrency(entry.value, 'USD')
                : entry.name?.includes('INR') || entry.dataKey === 'inr'
                ? formatCurrency(entry.value, 'INR')
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Revenue Growth & Trajectory Graph component
 */
export const FinanceGrowthChart = ({ timelineChartData, currency, scopeInfo }) => {
  return (
    <Card className="p-5 bg-[#131B2A] border-[#2C384E] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2C384E] pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Revenue Growth & Trajectory Graph</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-semibold">
              {scopeInfo?.daysText}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-currency revenue trajectory over {scopeInfo?.label}.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono font-bold">
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>INR (₹) Volume</span>
          </span>
          <span className="flex items-center gap-1.5 text-purple-400">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
            <span>USD ($) Volume</span>
          </span>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timelineChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="inrGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="usdGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2C384E" opacity={0.6} />
            <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
            <Tooltip content={<CustomChartTooltip />} />
            {(!currency || currency === 'INR') && (
              <Area
                type="monotone"
                dataKey="inr"
                name="INR Revenue (₹)"
                stroke="#F59E0B"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#inrGradient)"
              />
            )}
            {(!currency || currency === 'USD') && (
              <Area
                type="monotone"
                dataKey="usd"
                name="USD Revenue ($)"
                stroke="#A855F7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#usdGradient)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
