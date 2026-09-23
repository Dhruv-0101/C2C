import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CreditCard,
  TrendingUp,
  Download,
  Plus,
  Search,
  RefreshCw,
  CheckCircle2,
  FileSpreadsheet,
  X,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Alert } from "../../../../components/ui/Alert";
import Pagination from "../../../../components/common/Pagination";
import { useAdminFinance } from "../../../../hooks/useAdminFinance";
import { useDebounce } from "../../../../hooks/useDebounce";

export const AdminFinanceTab = () => {
  // Search & Filter State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [status, setStatus] = useState("");
  const [paymentGateway, setPaymentGateway] = useState("");
  const [currency, setCurrency] = useState("");
  const [plan, setPlan] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Auto-reset page to 1 whenever any filter or debounced search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, paymentGateway, currency, plan, startDate, endDate]);

  // Modal State for Manual Transaction Logging
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualData, setManualData] = useState({
    userId: "",
    userEmail: "",
    plan: "PRO",
    paymentGateway: "ADMIN_MANUAL",
    pricePaid: "999",
    currency: "INR",
    postCount: "100",
    paymentId: "",
    orderId: "",
    status: "COMPLETED",
  });
  const [manualError, setManualError] = useState("");

  const {
    overview,
    isLoadingOverview,
    refetchOverview,
    transactions,
    meta,
    isLoadingTransactions,
    refetchTransactions,
    recordManualMutation,
    handleExportCsv,
    isExporting,
  } = useAdminFinance({
    page,
    limit,
    search: debouncedSearch,
    status,
    paymentGateway,
    currency,
    plan,
    startDate,
    endDate,
  });

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualError("");

    if (!manualData.userId && !manualData.userEmail) {
      setManualError("Please provide User ID or User Email.");
      return;
    }

    try {
      await recordManualMutation.mutateAsync({
        userId: manualData.userId || manualData.userEmail,
        plan: manualData.plan,
        paymentGateway: manualData.paymentGateway,
        pricePaid: Number(manualData.pricePaid) || 0,
        currency: manualData.currency || "INR",
        postCount: Number(manualData.postCount) || 100,
        paymentId: manualData.paymentId || `MANUAL_${Date.now()}`,
        orderId: manualData.orderId || `ORD_${Date.now()}`,
        status: manualData.status,
      });

      setIsManualModalOpen(false);
      setManualData({
        userId: "",
        userEmail: "",
        plan: "PRO",
        paymentGateway: "ADMIN_MANUAL",
        pricePaid: "999",
        currency: "INR",
        postCount: "100",
        paymentId: "",
        orderId: "",
        status: "COMPLETED",
      });
    } catch (err) {
      setManualError(err?.response?.data?.message || err?.message || "Failed to record manual transaction.");
    }
  };

  const formatCurrency = (val, curr = "INR") => {
    const localeMap = {
      INR: "en-IN",
      USD: "en-US",
      EUR: "de-DE",
      GBP: "en-GB",
    };
    const targetCurrency = (curr || "INR").toUpperCase();
    const targetLocale = localeMap[targetCurrency] || "en-US";
    try {
      return new Intl.NumberFormat(targetLocale, {
        style: "currency",
        currency: targetCurrency,
        maximumFractionDigits: 0,
      }).format(val || 0);
    } catch (e) {
      return `${targetCurrency} ${val || 0}`;
    }
  };

  // Helper to extract specific currency totals from overview breakdown
  const getCurrencyRevenue = (currCode) => {
    if (!overview?.currencyBreakdown) return 0;
    const item = overview.currencyBreakdown.find(
      (c) => (c.currency || "").toUpperCase() === currCode.toUpperCase()
    );
    return item ? item.revenue : 0;
  };

  // --- Dynamic Visual Chart Datasets ---

  // 1. Revenue Timeline Chart Data (Grouped by Date/Time)
  const timelineChartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      // Fallback demo points based on current totals for aesthetic rendering
      return [
        { date: "Day 1", inr: 0, usd: 0 },
        { date: "Day 2", inr: (overview?.mrrINR || 540) * 0.3, usd: (overview?.mrrUSD || 29) * 0.2 },
        { date: "Day 3", inr: (overview?.mrrINR || 540) * 0.6, usd: (overview?.mrrUSD || 29) * 0.5 },
        { date: "Day 4", inr: overview?.mrrINR || 540, usd: overview?.mrrUSD || 29 },
      ];
    }

    const dateMap = {};
    const sortedTx = [...transactions].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    sortedTx.forEach((tx) => {
      const dateStr = new Date(tx.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = { date: dateStr, inr: 0, usd: 0, count: 0 };
      }
      if ((tx.currency || "").toUpperCase() === "USD") {
        dateMap[dateStr].usd += tx.pricePaid || 0;
      } else {
        dateMap[dateStr].inr += tx.pricePaid || 0;
      }
      dateMap[dateStr].count += 1;
    });

    const result = Object.values(dateMap);
    return result.length > 0
      ? result
      : [
          { date: "Sep 14", inr: 0, usd: 0 },
          { date: "Sep 15", inr: 200, usd: 10 },
          { date: "Sep 16", inr: 400, usd: 20 },
          { date: "Sep 17", inr: 540, usd: 29 },
        ];
  }, [transactions, overview]);

  // 2. Gateway Revenue Chart Data (Pie / Donut Chart)
  const gatewayChartData = useMemo(() => {
    if (!overview?.gatewayBreakdown || overview.gatewayBreakdown.length === 0) return [];
    
    const colorPalette = {
      RAZORPAY: "#3B82F6",
      STRIPE: "#A855F7",
      UPI: "#10B981",
      ADMIN_MANUAL: "#F59E0B",
      FREE: "#64748B",
    };

    return overview.gatewayBreakdown
      .filter((g) => !currency || g.currency === currency)
      .map((g) => ({
        name: g.gateway,
        revenue: g.revenue,
        count: g.count,
        currency: g.currency,
        color: colorPalette[g.gateway] || "#38BDF8",
      }));
  }, [overview, currency]);

  // 3. Subscription Plan Distribution Chart Data (Bar Chart)
  const planChartData = useMemo(() => {
    if (!overview?.planBreakdown || overview.planBreakdown.length === 0) return [];
    
    const planMap = {};
    overview.planBreakdown
      .filter((p) => !currency || p.currency === currency)
      .forEach((p) => {
        if (!planMap[p.plan]) {
          planMap[p.plan] = { plan: p.plan, inr: 0, usd: 0, accounts: 0 };
        }
        if (p.currency === "USD") {
          planMap[p.plan].usd += p.totalRevenue || 0;
        } else {
          planMap[p.plan].inr += p.totalRevenue || 0;
        }
        planMap[p.plan].accounts += p.userCount || 0;
      });

    return Object.values(planMap);
  }, [overview, currency]);

  // Custom Chart Tooltip for Dark Theme
  const CustomTooltip = ({ active, payload, label }) => {
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
                {entry.name.includes("USD") || entry.dataKey === "usd"
                  ? formatCurrency(entry.value, "USD")
                  : entry.name.includes("INR") || entry.dataKey === "inr"
                  ? formatCurrency(entry.value, "INR")
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full font-sans">
      {/* Top Banner & Primary Action Buttons */}
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs py-2"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            <span>{isExporting ? "Generating Statement..." : "Export Statement (CSV)"}</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsManualModalOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs py-2 shadow-lg"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Log Manual Transaction</span>
          </Button>
        </div>
      </div>

      {/* Dedicated Currency Sub-Tabs Navigator */}
      <div className="flex items-center gap-2 p-1.5 bg-[#131B2A] border border-[#2C384E] rounded-2xl overflow-x-auto text-xs font-bold">
        {[
          { id: "", label: "🌐 All Currencies", badge: "Combined Overview" },
          { id: "INR", label: "🇮🇳 INR Ledger (₹)", badge: "Razorpay & UPI" },
          { id: "USD", label: "🇺🇸 USD Ledger ($)", badge: "Stripe International" },
        ].map((tab) => {
          const isActive = currency === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setCurrency(tab.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-[#0B0F17]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isActive ? "bg-slate-950/20 text-slate-950" : "bg-[#0B0F17] text-slate-400 border border-[#2C384E]"
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Financial Executive KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* INR Revenue Card */}
        <div
          className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#182335] to-[#0F172A] border border-[#2C384E] border-t-2 border-t-amber-500 flex flex-col justify-between space-y-3 relative overflow-hidden transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg ${
            currency === "INR" ? "ring-1 ring-amber-500/60 shadow-amber-500/10 shadow-xl" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base shrink-0">🇮🇳</span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider truncate">
                INR Revenue
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold shrink-0 whitespace-nowrap">
              Razorpay / UPI
            </span>
          </div>
          <div>
            <h3 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight font-mono">
              {isLoadingOverview ? "..." : formatCurrency(getCurrencyRevenue("INR"), "INR")}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block shrink-0" />
              <span className="truncate">Domestic Volume</span>
            </p>
          </div>
        </div>

        {/* INR MRR Card */}
        <div
          className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#182335] to-[#0F172A] border border-[#2C384E] border-t-2 border-t-amber-500 flex flex-col justify-between space-y-3 relative overflow-hidden transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg ${
            currency === "INR" ? "ring-1 ring-amber-500/60 shadow-amber-500/10 shadow-xl" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base shrink-0">🇮🇳</span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider truncate">
                INR MRR
              </span>
            </div>
            <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl xl:text-3xl font-extrabold text-amber-400 tracking-tight font-mono">
              {isLoadingOverview ? "..." : formatCurrency(overview?.mrrINR, "INR")}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block shrink-0" />
              <span className="truncate">INR Run Rate</span>
            </p>
          </div>
        </div>

        {/* USD Revenue Card */}
        <div
          className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#182335] to-[#0F172A] border border-[#2C384E] border-t-2 border-t-purple-500 flex flex-col justify-between space-y-3 relative overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg ${
            currency === "USD" ? "ring-1 ring-purple-500/60 shadow-purple-500/10 shadow-xl" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base shrink-0">🇺🇸</span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider truncate">
                USD Revenue
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-mono font-bold shrink-0 whitespace-nowrap">
              Stripe Global
            </span>
          </div>
          <div>
            <h3 className="text-2xl xl:text-3xl font-extrabold text-purple-200 tracking-tight font-mono">
              {isLoadingOverview ? "..." : formatCurrency(getCurrencyRevenue("USD"), "USD")}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block shrink-0" />
              <span className="truncate">Int'l Volume</span>
            </p>
          </div>
        </div>

        {/* USD MRR Card */}
        <div
          className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#182335] to-[#0F172A] border border-[#2C384E] border-t-2 border-t-purple-500 flex flex-col justify-between space-y-3 relative overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg ${
            currency === "USD" ? "ring-1 ring-purple-500/60 shadow-purple-500/10 shadow-xl" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base shrink-0">🇺🇸</span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider truncate">
                USD MRR
              </span>
            </div>
            <div className="p-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl xl:text-3xl font-extrabold text-purple-300 tracking-tight font-mono">
              {isLoadingOverview ? "..." : formatCurrency(overview?.mrrUSD, "USD")}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block shrink-0" />
              <span className="truncate">USD Run Rate</span>
            </p>
          </div>
        </div>

        {/* Active Accounts Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#182335] to-[#0F172A] border border-[#2C384E] border-t-2 border-t-emerald-500 flex flex-col justify-between space-y-3 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider truncate">
              Active Accounts
            </span>
            <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl xl:text-3xl font-extrabold text-emerald-400 tracking-tight font-mono">
              {isLoadingOverview ? "..." : `${overview?.activeSubsCount || 0} Active`}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shrink-0" />
              <span className="truncate">
                {overview?.paidUsersCount || 0} Paid | {overview?.expiredSubsCount || 0} Expired
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* --- VISUAL GRAPH SECTION: Revenue Growth Timeline Area Chart --- */}
      <Card className="p-5 bg-[#131B2A] border-[#2C384E] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2C384E] pb-3">
          <div>
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Revenue Growth & Trajectory Graph</span>
            </h3>
            <p className="text-xs text-slate-400">
              Multi-currency revenue volume trajectory over time.
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
              <Tooltip content={<CustomTooltip />} />
              {(!currency || currency === "INR") && (
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
              {(!currency || currency === "USD") && (
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

      {/* --- VISUAL CHARTS GRID: Payment Gateway Donut Chart & Subscription Plan Bar Chart --- */}
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
                    <Tooltip content={<CustomTooltip />} />
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
                    <Tooltip content={<CustomTooltip />} />
                    {(!currency || currency === "INR") && (
                      <Bar dataKey="inr" name="INR Revenue (₹)" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={22} />
                    )}
                    {(!currency || currency === "USD") && (
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
                      {p.accounts} Account{p.accounts !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* --- Billing & Payment Transactions Ledger Table (UNTOUCHED / EXACT SAME) --- */}
      <Card className="p-5 bg-[#131B2A] border-[#2C384E] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C384E] pb-4">
          <div>
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <span>Billing & Payment Transactions Ledger</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-bold">
                {meta.totalItems} Total
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive transaction history with user accounts, gateway references, and payment status.
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetchTransactions()}
            className="text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 p-3 bg-[#0B0F17] border border-[#2C384E] rounded-xl text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search user, email, payment ID..."
              className="bg-[#131B2A] border-[#2C384E] text-xs text-white pl-8 py-1.5"
            />
          </div>

          {/* Currency Filter */}
          <select
            value={currency}
            onChange={(e) => {
              setCurrency(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#131B2A] border border-[#2C384E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
          >
            <option value="">All Currencies</option>
            <option value="INR">🇮🇳 INR (₹)</option>
            <option value="USD">🇺🇸 USD ($)</option>
          </select>

          {/* Gateway Filter */}
          <select
            value={paymentGateway}
            onChange={(e) => {
              setPaymentGateway(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#131B2A] border border-[#2C384E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
          >
            <option value="">All Gateways</option>
            <option value="RAZORPAY">Razorpay</option>
            <option value="STRIPE">Stripe</option>
            <option value="UPI">UPI Direct</option>
            <option value="FREE">Free Tier</option>
            <option value="ADMIN_MANUAL">Admin Manual</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#131B2A] border border-[#2C384E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          {/* Plan Filter */}
          <select
            value={plan}
            onChange={(e) => {
              setPlan(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#131B2A] border border-[#2C384E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">All Plans</option>
            <option value="FREE">Free</option>
            <option value="PRO">Pro</option>
          </select>

          {/* Date Start Filter */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#131B2A] border border-[#2C384E] rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto border border-[#2C384E] rounded-xl bg-[#0B0F17]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#2C384E] bg-[#131B2A]/80 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3">Date & Time</th>
                <th className="p-3">Customer / Email</th>
                <th className="p-3">Business</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Gateway</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Payment / Order ID</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C384E]/60 text-slate-200">
              {isLoadingTransactions ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                    Loading transactions ledger...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                    No matching transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#131B2A]/60 transition">
                    <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="p-3 font-semibold text-white whitespace-nowrap">
                      <div>
                        <span>{tx.user?.fullName || "User"}</span>
                        <span className="block text-[10px] text-slate-400 font-mono font-normal">
                          {tx.user?.email}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 text-slate-300 font-medium whitespace-nowrap">
                      {tx.user?.brandKit?.businessName || "—"}
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
                        {tx.plan}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                            tx.paymentGateway === "RAZORPAY"
                              ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                              : tx.paymentGateway === "STRIPE"
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                              : tx.paymentGateway === "UPI"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {tx.paymentGateway || "FREE"}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono font-bold">
                          {tx.currency || "INR"}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 font-mono font-bold text-emerald-400 text-xs">
                      {formatCurrency(tx.pricePaid, tx.currency)}
                    </td>

                    <td className="p-3 font-mono text-[10px] text-slate-400 whitespace-nowrap max-w-[160px] truncate">
                      {tx.paymentId || tx.orderId || "—"}
                    </td>

                    <td className="p-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                          tx.status === "COMPLETED"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : tx.status === "PENDING"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <Pagination
          meta={meta}
          currentPage={meta?.page || page}
          totalPages={meta?.totalPages || 1}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </Card>

      {/* Manual Transaction Logging Modal */}
      {isManualModalOpen &&
        createPortal(
          <div className="fixed inset-0 w-screen h-screen z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in font-sans">
            <div className="w-full max-w-lg bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-5 shadow-2xl my-auto text-slate-100">
              <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-white">
                      Log Manual Payment / Bonus Transaction
                    </h3>
                    <p className="text-xs text-slate-400">
                      Record offline payment, bank transfer, or custom plan top-up for a tenant.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsManualModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {manualError && <Alert variant="error" message={manualError} />}

              <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Target User ID or Email
                  </label>
                  <Input
                    value={manualData.userEmail}
                    onChange={(e) =>
                      setManualData({ ...manualData, userEmail: e.target.value, userId: e.target.value })
                    }
                    placeholder="Enter tenant user ID or user email..."
                    className="bg-[#0B0F17] border-[#2C384E] text-xs text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Select Plan</label>
                    <select
                      value={manualData.plan}
                      onChange={(e) => setManualData({ ...manualData, plan: e.target.value })}
                      className="w-full bg-[#0B0F17] border border-[#2C384E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="PRO">Pro Plan</option>
                      <option value="FREE">Free Plan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Payment Method</label>
                    <select
                      value={manualData.paymentGateway}
                      onChange={(e) =>
                        setManualData({ ...manualData, paymentGateway: e.target.value })
                      }
                      className="w-full bg-[#0B0F17] border border-[#2C384E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="ADMIN_MANUAL">Admin Manual</option>
                      <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                      <option value="UPI">UPI Direct</option>
                      <option value="CASH">Cash Payment</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Currency</label>
                    <select
                      value={manualData.currency}
                      onChange={(e) => setManualData({ ...manualData, currency: e.target.value })}
                      className="w-full bg-[#0B0F17] border border-[#2C384E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Amount Paid</label>
                    <Input
                      type="number"
                      value={manualData.pricePaid}
                      onChange={(e) => setManualData({ ...manualData, pricePaid: e.target.value })}
                      placeholder="e.g. 999"
                      className="bg-[#0B0F17] border-[#2C384E] text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Posts Credit</label>
                    <Input
                      type="number"
                      value={manualData.postCount}
                      onChange={(e) => setManualData({ ...manualData, postCount: e.target.value })}
                      placeholder="e.g. 100"
                      className="bg-[#0B0F17] border-[#2C384E] text-xs text-white"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#2C384E] flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setIsManualModalOpen(false)}
                    className="py-1.5 px-3 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    isLoading={recordManualMutation.isPending}
                    className="py-1.5 px-4 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950"
                  >
                    Confirm & Record Transaction
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default AdminFinanceTab;
