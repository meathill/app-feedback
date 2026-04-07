'use client';

import { useFeedbackStore } from '@/store/feedback-store';

export default function AdminHeader() {
  const total = useFeedbackStore((s) => s.total);
  const loading = useFeedbackStore((s) => s.loading);

  return (
    <header className="mb-8 flex justify-between items-center">
      <div className="flex items-baseline gap-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">App Feedback</h1>
        <span className="text-xs text-gray-400">v{process.env.APP_VERSION}</span>
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{loading ? '加载中...' : `共 ${total} 条`}</div>
    </header>
  );
}
