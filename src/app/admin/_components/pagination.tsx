'use client';

import { useFeedbackStore } from '@/store/feedback-store';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Pagination() {
  const page = useFeedbackStore((s) => s.page);
  const totalPages = useFeedbackStore((s) => s.totalPages);
  const setPage = useFeedbackStore((s) => s.setPage);

  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex justify-between items-center">
      <div>
        {page > 1 && (
          <Button variant="outline" onClick={() => setPage(page - 1)}>
            <ChevronLeftIcon />
            上一页
          </Button>
        )}
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300">
        第 {page} / {totalPages} 页
      </div>
      <div>
        {page < totalPages && (
          <Button variant="outline" onClick={() => setPage(page + 1)}>
            下一页
            <ChevronRightIcon />
          </Button>
        )}
      </div>
    </div>
  );
}
