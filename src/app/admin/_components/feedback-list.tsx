'use client';

import { useEffect } from 'react';
import { useFeedbackStore } from '@/store/feedback-store';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircleIcon } from 'lucide-react';
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
      <Alert variant="error">
        <AlertCircleIcon />
        <AlertTitle>加载失败</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
        {loading && feedbacks.length === 0 ? (
          <li className="px-6 py-12 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
            <Spinner />
            加载中...
          </li>
        ) : feedbacks.length === 0 ? (
          <li className="px-6 py-12">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>暂无反馈</EmptyTitle>
                <EmptyDescription>当前筛选条件下没有数据</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </li>
        ) : (
          feedbacks.map((feedback) => <FeedbackItem key={feedback.id} feedback={feedback} />)
        )}
      </ul>
    </div>
  );
}
