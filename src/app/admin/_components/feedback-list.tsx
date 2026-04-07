'use client';

import { useEffect } from 'react';
import { useFeedbackStore } from '@/store/feedback-store';
import FeedbackItem from './feedback-item';

export default function FeedbackList() {
  const feedbacks = useFeedbackStore((s) => s.feedbacks);
  const loading = useFeedbackStore((s) => s.loading);
  const error = useFeedbackStore((s) => s.error);
  const fetchFeedbacks = useFeedbackStore((s) => s.fetchFeedbacks);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-sm text-red-600 dark:text-red-400">
        加载失败：{error}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
        {loading && feedbacks.length === 0 ? (
          <li className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">加载中...</li>
        ) : feedbacks.length === 0 ? (
          <li className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">暂无反馈</li>
        ) : (
          feedbacks.map((feedback) => <FeedbackItem key={feedback.id} feedback={feedback} />)
        )}
      </ul>
    </div>
  );
}
