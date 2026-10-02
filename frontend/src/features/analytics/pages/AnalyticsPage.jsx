import React, { useState } from 'react';
import { useAnalytics } from '@/features/analytics/hooks/useAnalytics';
import { AnalyticsView } from '../components/AnalyticsView';

/**
 * AnalyticsPage
 * Performance & Engagement Metrics Route Page (/analytics)
 */
export const AnalyticsPage = () => {
  const [range, setRange] = useState('30d');
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);

  const {
    kpi,
    trends,
    platforms,
    topTemplates,
    posts,
    postsMeta,
    isLoading,
    isPostsLoading,
    syncAnalytics,
    isSyncing,
    seedDemo,
    isSeeding,
  } = useAnalytics({
    range,
    platform: platformFilter,
    search: searchTerm,
    sortBy,
    sortOrder,
    page,
    limit,
  });

  const handleSync = async () => {
    try {
      await syncAnalytics();
    } catch (err) {
      console.error('Failed to sync live analytics:', err);
    }
  };

  const handleSeedDemo = async () => {
    try {
      await seedDemo();
    } catch (err) {
      console.error('Failed to seed demo analytics:', err);
    }
  };

  const handlePlatformChange = (newPlatform) => {
    setPlatformFilter(newPlatform);
    setPage(1);
  };

  const handleSearchChange = (newSearch) => {
    setSearchTerm(newSearch);
    setPage(1);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(1);
  };

  const handleSortOrderChange = (newOrder) => {
    setSortOrder(newOrder);
    setPage(1);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <AnalyticsView
      kpi={kpi}
      trends={trends}
      platforms={platforms}
      topTemplates={topTemplates}
      posts={posts}
      postsMeta={postsMeta}
      isLoading={isLoading}
      isPostsLoading={isPostsLoading}
      range={range}
      onRangeChange={setRange}
      platformFilter={platformFilter}
      onPlatformChange={handlePlatformChange}
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
      sortBy={sortBy}
      onSortChange={handleSortChange}
      sortOrder={sortOrder}
      onSortOrderChange={handleSortOrderChange}
      page={page}
      onPageChange={setPage}
      limit={limit}
      onLimitChange={handleLimitChange}
      onSync={handleSync}
      isSyncing={isSyncing}
      onSeedDemo={handleSeedDemo}
      isSeeding={isSeeding}
    />
  );
};

export default AnalyticsPage;
