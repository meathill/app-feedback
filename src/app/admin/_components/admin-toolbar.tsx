'use client';

import { useFeedbackStore } from '@/store/feedback-store';
import { FEEDBACK_TAGS, STATUS_CONFIG } from '@/constants';
import type { FeedbackStatus } from '@/types';
import { RefreshCwIcon } from 'lucide-react';

export default function AdminToolbar() {
  const apps = useFeedbackStore((s) => s.apps);
  const filterApp = useFeedbackStore((s) => s.filterApp);
  const filterStatus = useFeedbackStore((s) => s.filterStatus);
  const filterTag = useFeedbackStore((s) => s.filterTag);
  const setFilterApp = useFeedbackStore((s) => s.setFilterApp);
  const setFilterStatus = useFeedbackStore((s) => s.setFilterStatus);
  const setFilterTag = useFeedbackStore((s) => s.setFilterTag);
  const fetchFeedbacks = useFeedbackStore((s) => s.fetchFeedbacks);

  function handleRefresh() {
    // 重新加载时也刷新 apps 列表
    useFeedbackStore.setState({ apps: [] });
    fetchFeedbacks();
  }

  return (
    <div className="mb-6 flex flex-wrap gap-4 items-center">
      <select
        value={filterApp || ''}
        onChange={(e) => setFilterApp(e.target.value || null)}
        className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-700 dark:text-gray-200"
      >
        <option value="">全部应用</option>
        {apps.map((app) => (
          <option key={app} value={app}>
            {app}
          </option>
        ))}
      </select>

      <select
        value={filterStatus || ''}
        onChange={(e) => setFilterStatus((e.target.value as FeedbackStatus) || null)}
        className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-700 dark:text-gray-200"
      >
        <option value="">全部状态</option>
        {Object.entries(STATUS_CONFIG)
          .filter(([key]) => key !== 'deleted')
          .map(([key, cfg]) => (
            <option key={key} value={key}>
              {cfg.label}
            </option>
          ))}
      </select>

      <select
        value={filterTag || ''}
        onChange={(e) => setFilterTag(e.target.value || null)}
        className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-700 dark:text-gray-200"
      >
        <option value="">全部标签</option>
        {FEEDBACK_TAGS.map((tag) => (
          <option key={tag.value} value={tag.value}>
            {tag.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleRefresh}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
        title="刷新"
      >
        <RefreshCwIcon size={16} />
        刷新
      </button>
    </div>
  );
}
