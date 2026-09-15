import React, { useState } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { AnalyticsView } from './components/AnalyticsView';

/**
 * AnalyticsPage
 * Container component handling data fetching and state management for the Analytics Dashboard.
 */
export const AnalyticsPage = () => {
  const [range, setRange] = useState('30d');
  const [platformFilter, setPlatformFilter] = useState('ALL');

  const {
    kpi,
    trends,
    platforms,
    topTemplates,
    isLoading,
    seedDemo,
    isSeeding,
  } = useAnalytics({ range, platform: platformFilter });

  const handleSeedDemo = async () => {
    try {
      await seedDemo();
    } catch (err) {
      console.error('Failed to seed demo analytics:', err);
    }
  };

  return (
    <AnalyticsView
      kpi={kpi}
      trends={trends}
      platforms={platforms}
      topTemplates={topTemplates}
      isLoading={isLoading}
      range={range}
      onRangeChange={setRange}
      platformFilter={platformFilter}
      onPlatformChange={setPlatformFilter}
      onSeedDemo={handleSeedDemo}
      isSeeding={isSeeding}
    />
  );
};

export default AnalyticsPage;
