import React from 'react';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card } from '../../../../components/ui/Card';
import { formatCurrency } from '../../../../shared/utils/currency.util';

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
 * Payment Gateway Donut Chart & Subscription Plan Distribution Charts
 */
export const FinanceBreakdownCharts = ({ gatewayChartData, planChartData, currency }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Payment Gateways Distribution Donut / Pie Chart */}
      <Card className="p-5 bg-[#131B2A] border-[#2C384E] space-y-4 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
          <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-blue-400" />
            <span>Payment Gateway Breakdown Chart</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Gateway Share</span>
        </div>

        {gatewayChartData.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-xs text-slate-500 italic">
            No gateway transactions available.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center py-2">
            <div className="h-52 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gatewayChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="revenue"
                  >
                    {gatewayChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#131B2A" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xs text-slate-400 font-mono">Gateways</span>
                <span className="text-sm font-extrabold text-white font-mono">
                  {gatewayChartData.reduce((acc, curr) => acc + curr.count, 0)} Tx
                </span>
              </div>
            </div>

            {/* Dynamic Legend List with Currency Badges */}
            <div className="space-y-2.5">
              {gatewayChartData.map((item) => (
                <div
                  key={`${item.name}-${item.currency}`}
                  className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-bold text-white uppercase font-mono">{item.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                      {item.currency}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 shrink-0">
                    {formatCurrency(item.revenue, item.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Subscription Plan Distribution Visual Bar Chart */}
      <Card className="p-5 bg-[#131B2A] border-[#2C384E] space-y-4 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
          <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>Subscription Plan Distribution Chart</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Tier Breakdown</span>
        </div>

        {planChartData.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-xs text-slate-500 italic">
            No plan distribution data available.
          </div>
        ) : (
          <div className="space-y-4 py-1">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={planChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2C384E" opacity={0.5} />
                  <XAxis dataKey="plan" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomChartTooltip />} />
                  {(!currency || currency === 'INR') && (
                    <Bar dataKey="inr" name="INR Revenue (₹)" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={22} />
                  )}
                  {(!currency || currency === 'USD') && (
                    <Bar dataKey="usd" name="USD Revenue ($)" fill="#A855F7" radius={[6, 6, 0, 0]} barSize={22} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sub-Legend with Account Counts */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {planChartData.map((p) => (
                <div
                  key={p.plan}
                  className="p-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] flex items-center justify-between"
                >
                  <span className="font-mono font-bold text-amber-400 uppercase text-[11px]">{p.plan} Tier</span>
                  <span className="text-slate-300 font-bold font-mono text-[11px]">
                    {p.accounts} Account{p.accounts !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
