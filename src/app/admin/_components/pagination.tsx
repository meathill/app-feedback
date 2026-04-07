'use client';

import { useFeedbackStore } from '@/store/feedback-store';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

export default function Pagination() {
  const page = useFeedbackStore((s) => s.page);
  const totalPages = useFeedbackStore((s) => s.totalPages);
  const setPage = useFeedbackStore((s) => s.setPage);

  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex justify-between items-center">
      <div>
        {page > 1 && (
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            className="inline-flex items-center gap-1 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <ChevronLeftIcon size={16} />
            上一页
          </button>
        )}
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300">
        第 {page} / {totalPages} 页
      </div>
      <div>
        {page < totalPages && (
          <button
            type="button"
            onClick={() => setPage(page + 1)}
            className="inline-flex items-center gap-1 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            下一页
            <ChevronRightIcon size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
