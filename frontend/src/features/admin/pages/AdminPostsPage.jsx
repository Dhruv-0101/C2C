import React, { useState, useEffect } from 'react';
import { useAdminPosts, useAdminPostAnalytics } from '@/features/admin/posts/hooks/useAdminPosts';
import { useCategories } from '@/features/admin/categories/hooks/useCategories';
import { useTemplateCategories } from '@/features/admin/template-categories/hooks/useTemplateCategories';
import { useFrames } from '@/features/admin/frames/hooks/useFrames';
import { useFestivals } from '@/features/calendar/hooks/useFestivals';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { AdminPostsTab } from '@/features/admin/posts/AdminPostsTab';

/**
 * AdminPostsPage Component
 * Dedicated route page for Generated Posts Audit (/admin/posts).
 */
export const AdminPostsPage = () => {
  const [postPage, setPostPage] = useState(1);
  const [postLimit, setPostLimit] = useState(10);
  const [postSearch, setPostSearch] = useState('');
  const debouncedPostSearch = useDebounce(postSearch, 300);

  const [categoryFilter, setCategoryFilter] = useState('');
  const [frameFilter, setFrameFilter] = useState('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('');
  const [festivalFilter, setFestivalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setPostPage(1);
  }, [
    debouncedPostSearch,
    categoryFilter,
    frameFilter,
    templateCategoryFilter,
    festivalFilter,
    statusFilter,
  ]);

  const {
    posts,
    meta: postMeta,
    isLoading: isLoadingPosts,
    error: postsFetchError,
  } = useAdminPosts({
    page: postPage,
    limit: postLimit,
    search: debouncedPostSearch,
    categoryId: categoryFilter,
    frameId: frameFilter,
    templateCategoryId: templateCategoryFilter,
    festivalId: festivalFilter,
    status: statusFilter,
  });

  const {
    analytics: postAnalytics,
    isLoading: isLoadingPostAnalytics,
  } = useAdminPostAnalytics();

  // Auxiliary lookup collections for filter fallbacks
  const { categories: allBusinessCategories } = useCategories({ limit: 20 });
  const { categories: allTemplateCategories } = useTemplateCategories({ limit: 20 });
  const { frames: allFrames } = useFrames({ limit: 20 });
  const { festivals: allFestivals } = useFestivals({ limit: 20 });

  return (
    <AdminPostsTab
      posts={posts}
      postMeta={postMeta}
      isLoadingPosts={isLoadingPosts}
      postsFetchError={postsFetchError}
      postPage={postPage}
      setPostPage={setPostPage}
      setPostLimit={setPostLimit}
      categoryFilter={categoryFilter}
      setCategoryFilter={setCategoryFilter}
      frameFilter={frameFilter}
      setFrameFilter={setFrameFilter}
      templateCategoryFilter={templateCategoryFilter}
      setTemplateCategoryFilter={setTemplateCategoryFilter}
      festivalFilter={festivalFilter}
      setFestivalFilter={setFestivalFilter}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      postSearch={postSearch}
      setPostSearch={setPostSearch}
      categoriesList={allBusinessCategories}
      framesList={allFrames}
      templateCategoriesList={allTemplateCategories}
      festivalsList={allFestivals}
      analytics={postAnalytics}
      isLoadingAnalytics={isLoadingPostAnalytics}
    />
  );
};

export default AdminPostsPage;
