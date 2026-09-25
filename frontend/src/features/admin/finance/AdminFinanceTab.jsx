import React, { useState, useMemo, useEffect } from 'react';
import { useAdminFinance } from '@/features/admin/finance/hooks/useAdminFinance';
import { useDebounce } from '../../../shared/hooks';
import { formatDate } from '@/shared/utils/date.util';
import { FinanceScopeBanner } from './components/FinanceScopeBanner';
import { FinanceCurrencyTabs } from './components/FinanceCurrencyTabs';
import { FinanceKpiCards } from './components/FinanceKpiCards';
import { FinanceGrowthChart } from './components/FinanceGrowthChart';
import { FinanceBreakdownCharts } from './components/FinanceBreakdownCharts';
import { FinanceLedgerFilters } from './components/FinanceLedgerFilters';
import { FinanceLedgerTable } from './components/FinanceLedgerTable';
import { ManualTransactionModal } from './components/ManualTransactionModal';

/**
 * Enterprise Admin Finance Tab - Refactored Canonical Domain Component
 * Clean architecture with micro-component decomposition and 100% feature fidelity.
 */
export const AdminFinanceTab = () => {
  // Search & Filter State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [status, setStatus] = useState('');
  const [paymentGateway, setPaymentGateway] = useState('');
  const [currency, setCurrency] = useState('');
  const [plan, setPlan] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Auto-reset page to 1 whenever any filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, paymentGateway, currency, plan, startDate, endDate]);

  // Modal State for Manual Transaction Logging
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualData, setManualData] = useState({
    userId: '',
    userEmail: '',
    plan: 'PRO',
    paymentGateway: 'ADMIN_MANUAL',
    pricePaid: '999',
    currency: 'INR',
    postCount: '100',
    paymentId: '',
    orderId: '',
    status: 'COMPLETED',
  });
  const [manualError, setManualError] = useState('');

  // Co-located API Query Hook
  const {
    overview,
    isLoadingOverview,
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

  // Manual payment submission handler
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualError('');

    if (!manualData.userId && !manualData.userEmail) {
      setManualError('Please provide User ID or User Email.');
      return;
    }

    try {
      await recordManualMutation.mutateAsync({
        userId: manualData.userId || manualData.userEmail,
        plan: manualData.plan,
        paymentGateway: manualData.paymentGateway,
        pricePaid: Number(manualData.pricePaid) || 0,
        currency: manualData.currency || 'INR',
        postCount: Number(manualData.postCount) || 100,
        paymentId: manualData.paymentId || `MANUAL_${Date.now()}`,
        orderId: manualData.orderId || `ORD_${Date.now()}`,
        status: manualData.status,
      });

      setIsManualModalOpen(false);
      setManualData({
        userId: '',
        userEmail: '',
        plan: 'PRO',
        paymentGateway: 'ADMIN_MANUAL',
        pricePaid: '999',
        currency: 'INR',
        postCount: '100',
        paymentId: '',
        orderId: '',
        status: 'COMPLETED',
      });
    } catch (err) {
      setManualError(err?.response?.data?.message || err?.message || 'Failed to record manual transaction.');
    }
  };

  // Determine active date horizon and duration
  const scopeInfo = useMemo(() => {
    const today = new Date();

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
      return {
        label: `${formatDate(start)} – ${formatDate(end)}`,
        daysText: `${diffDays} Day${diffDays > 1 ? 's' : ''}`,
        daysCount: diffDays,
        isFiltered: true,
        tag: `${diffDays} Days Data`,
      };
    }

    if (startDate && !endDate) {
      const start = new Date(startDate);
      const diffTime = Math.abs(today.getTime() - start.getTime());
      const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
      return {
        label: `Since ${formatDate(start)}`,
        daysText: `Past ${diffDays} Day${diffDays > 1 ? 's' : ''}`,
        daysCount: diffDays,
        isFiltered: true,
        tag: `Since Date (${diffDays} Days)`,
      };
    }

    if (!startDate && endDate) {
      const end = new Date(endDate);
      return {
        label: `Up to ${formatDate(end)}`,
        daysText: 'Filtered Range',
        daysCount: null,
        isFiltered: true,
        tag: `Filtered Until ${formatDate(end)}`,
      };
    }

    const totalDays = overview?.dataScope?.totalDaysSpan;
    const firstDate = overview?.dataScope?.firstTransactionDate
      ? formatDate(new Date(overview.dataScope.firstTransactionDate))
      : null;

    if (firstDate && totalDays !== undefined && totalDays !== null) {
      return {
        label: `All-Time Records (Since ${firstDate})`,
        daysText: `${totalDays} Day${totalDays > 1 ? 's' : ''} of Activity`,
        daysCount: totalDays,
        isFiltered: false,
        tag: `Lifetime (${totalDays} Days)`,
      };
    }

    return {
      label: 'All-Time Complete Records',
      daysText: 'Lifetime Data',
      daysCount: null,
      isFiltered: false,
      tag: 'All Time',
    };
  }, [startDate, endDate, overview]);

  // Preset calculation
  const handleApplyPreset = (presetKey) => {
    const now = new Date();
    const toYMD = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (presetKey === 'ALL') {
      setStartDate('');
      setEndDate('');
      setPage(1);
      return;
    }
    if (presetKey === 'TODAY') {
      const todayStr = toYMD(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
      setPage(1);
      return;
    }
    if (presetKey === '7_DAYS') {
      const past = new Date();
      past.setDate(past.getDate() - 6);
      setStartDate(toYMD(past));
      setEndDate(toYMD(now));
      setPage(1);
      return;
    }
    if (presetKey === '30_DAYS') {
      const past = new Date();
      past.setDate(past.getDate() - 29);
      setStartDate(toYMD(past));
      setEndDate(toYMD(now));
      setPage(1);
      return;
    }
    if (presetKey === '90_DAYS') {
      const past = new Date();
      past.setDate(past.getDate() - 89);
      setStartDate(toYMD(past));
      setEndDate(toYMD(now));
      setPage(1);
      return;
    }
    if (presetKey === 'YEAR') {
      const past = new Date();
      past.setFullYear(past.getFullYear() - 1);
      setStartDate(toYMD(past));
      setEndDate(toYMD(now));
      setPage(1);
      return;
    }
  };

  const activePreset = useMemo(() => {
    if (!startDate && !endDate) return 'ALL';
    const now = new Date();
    const toYMD = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const todayStr = toYMD(now);
    if (startDate === todayStr && endDate === todayStr) return 'TODAY';

    const d7 = new Date();
    d7.setDate(d7.getDate() - 6);
    if (startDate === toYMD(d7) && endDate === todayStr) return '7_DAYS';

    const d30 = new Date();
    d30.setDate(d30.getDate() - 29);
    if (startDate === toYMD(d30) && endDate === todayStr) return '30_DAYS';

    const d90 = new Date();
    d90.setDate(d90.getDate() - 89);
    if (startDate === toYMD(d90) && endDate === todayStr) return '90_DAYS';

    const dYear = new Date();
    dYear.setFullYear(dYear.getFullYear() - 1);
    if (startDate === toYMD(dYear) && endDate === todayStr) return 'YEAR';

    return 'CUSTOM';
  }, [startDate, endDate]);

  // Visual Chart Datasets
  const timelineChartData = useMemo(() => {
    if (transactions && transactions.length > 0) {
      const dateMap = {};
      const sortedTx = [...transactions].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      sortedTx.forEach((tx) => {
        const dateStr = new Date(tx.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });
        if (!dateMap[dateStr]) {
          dateMap[dateStr] = { date: dateStr, inr: 0, usd: 0, count: 0 };
        }
        const amt = Number(tx.pricePaid) || 0;
        if ((tx.currency || '').toUpperCase() === 'USD') {
          dateMap[dateStr].usd = Number((dateMap[dateStr].usd + amt).toFixed(2));
        } else {
          dateMap[dateStr].inr = Number((dateMap[dateStr].inr + amt).toFixed(2));
        }
        dateMap[dateStr].count += 1;
      });

      const result = Object.values(dateMap);
      if (result.length > 0) return result;
    }

    if (overview?.monthlyRevenueTrends && overview.monthlyRevenueTrends.length > 0) {
      return overview.monthlyRevenueTrends.map((m) => {
        const [year, month] = (m.month || '').split('-');
        let label = m.month;
        if (year && month) {
          const dateObj = new Date(Number(year), Number(month) - 1, 1);
          label = dateObj.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
        }
        return {
          date: label,
          inr: m.inr || 0,
          usd: m.usd || 0,
          count: m.count || 0,
        };
      });
    }

    return [
      { date: 'Day 1', inr: 0, usd: 0 },
      { date: 'Day 2', inr: (overview?.mrrINR || 540) * 0.3, usd: (overview?.mrrUSD || 29) * 0.2 },
      { date: 'Day 3', inr: (overview?.mrrINR || 540) * 0.6, usd: (overview?.mrrUSD || 29) * 0.5 },
      { date: 'Day 4', inr: overview?.mrrINR || 540, usd: overview?.mrrUSD || 29 },
    ];
  }, [transactions, overview]);

  const gatewayChartData = useMemo(() => {
    if (!overview?.gatewayBreakdown || overview.gatewayBreakdown.length === 0) return [];

    const colorPalette = {
      RAZORPAY: '#3B82F6',
      STRIPE: '#A855F7',
      UPI: '#10B981',
      ADMIN_MANUAL: '#F59E0B',
      FREE: '#64748B',
    };

    return overview.gatewayBreakdown
      .filter((g) => !currency || g.currency === currency)
      .map((g) => ({
        name: g.gateway,
        revenue: g.revenue,
        count: g.count,
        currency: g.currency,
        color: colorPalette[g.gateway] || '#38BDF8',
      }));
  }, [overview, currency]);

  const planChartData = useMemo(() => {
    if (!overview?.planBreakdown || overview.planBreakdown.length === 0) return [];

    const planMap = {};
    overview.planBreakdown
      .filter((p) => !currency || p.currency === currency)
      .forEach((p) => {
        if (!planMap[p.plan]) {
          planMap[p.plan] = { plan: p.plan, inr: 0, usd: 0, accounts: 0 };
        }
        if (p.currency === 'USD') {
          planMap[p.plan].usd += p.totalRevenue || 0;
        } else {
          planMap[p.plan].inr += p.totalRevenue || 0;
        }
        planMap[p.plan].accounts += p.userCount || 0;
      });

    return Object.values(planMap);
  }, [overview, currency]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full font-sans">
      {/* 1. Executive Header & Scope Presets Banner */}
      <FinanceScopeBanner
        scopeInfo={scopeInfo}
        activePreset={activePreset}
        onApplyPreset={handleApplyPreset}
        isExporting={isExporting}
        onExport={handleExportCsv}
        onOpenManual={() => setIsManualModalOpen(true)}
      />

      {/* 2. Dedicated Currency Sub-Tabs Navigator */}
      <FinanceCurrencyTabs
        currency={currency}
        onSelectCurrency={(c) => {
          setCurrency(c);
          setPage(1);
        }}
      />

      {/* 3. Financial Executive KPI Cards Grid */}
      <FinanceKpiCards
        currency={currency}
        overview={overview}
        isLoadingOverview={isLoadingOverview}
        scopeInfo={scopeInfo}
      />

      {/* 4. Revenue Growth Timeline Area Chart */}
      <FinanceGrowthChart
        timelineChartData={timelineChartData}
        currency={currency}
        scopeInfo={scopeInfo}
      />

      {/* 5. Visual Breakdown Charts: Gateway Donut & Plan Tier Breakdown */}
      <FinanceBreakdownCharts
        gatewayChartData={gatewayChartData}
        planChartData={planChartData}
        currency={currency}
      />

      {/* 7. Transactions Ledger with Integrated Filter Controls */}
      <FinanceLedgerTable
        transactions={transactions}
        isLoadingTransactions={isLoadingTransactions}
        meta={meta}
        page={page}
        setPage={setPage}
        setLimit={setLimit}
        onRefresh={() => refetchTransactions()}
        scopeInfo={scopeInfo}
      >
        <FinanceLedgerFilters
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          currency={currency}
          onCurrencyChange={(v) => {
            setCurrency(v);
            setPage(1);
          }}
          paymentGateway={paymentGateway}
          onPaymentGatewayChange={(v) => {
            setPaymentGateway(v);
            setPage(1);
          }}
          status={status}
          onStatusChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          plan={plan}
          onPlanChange={(v) => {
            setPlan(v);
            setPage(1);
          }}
          startDate={startDate}
          onStartDateChange={(v) => {
            setStartDate(v);
            setPage(1);
          }}
          endDate={endDate}
          onEndDateChange={(v) => {
            setEndDate(v);
            setPage(1);
          }}
          onClearDates={() => {
            setStartDate('');
            setEndDate('');
            setPage(1);
          }}
          scopeInfo={scopeInfo}
        />
      </FinanceLedgerTable>

      {/* 8. Manual Transaction Logging Modal */}
      <ManualTransactionModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        manualData={manualData}
        setManualData={setManualData}
        manualError={manualError}
        onSubmit={handleManualSubmit}
        isPending={recordManualMutation.isPending}
      />
    </div>
  );
};

export default AdminFinanceTab;
