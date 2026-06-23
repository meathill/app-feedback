'use client';

import { useEffect } from 'react';
import { useFeedbackStore } from '@/store/feedback-store';
import type { FeedbackStatus } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircleIcon, ArchiveIcon, CheckCircleIcon, Trash2Icon, UndoIcon, XIcon } from 'lucide-react';
import FeedbackItem from './feedback-item';
import { useTranslations } from 'next-intl';

export default function FeedbackList() {
  const feedbacks = useFeedbackStore((s) => s.feedbacks);
  const selectedFeedbackIds = useFeedbackStore((s) => s.selectedFeedbackIds);
  const loading = useFeedbackStore((s) => s.loading);
  const error = useFeedbackStore((s) => s.error);
  const fetchFeedbacks = useFeedbackStore((s) => s.fetchFeedbacks);
  const toggleFeedbackSelected = useFeedbackStore((s) => s.toggleFeedbackSelected);
  const setCurrentPageSelected = useFeedbackStore((s) => s.setCurrentPageSelected);
  const clearSelectedFeedbacks = useFeedbackStore((s) => s.clearSelectedFeedbacks);
  const batchUpdateFeedbackStatus = useFeedbackStore((s) => s.batchUpdateFeedbackStatus);

  const t = useTranslations('Admin.list');
  const tBulk = useTranslations('Admin.bulk');
  const tCommon = useTranslations('Admin');
  const currentPageIds = feedbacks.map((feedback) => feedback.id);
  const selectedCount = currentPageIds.filter((id) => selectedFeedbackIds.includes(id)).length;
  const hasFeedbacks = feedbacks.length > 0;
  const isAllCurrentPageSelected = hasFeedbacks && selectedCount === feedbacks.length;
  const isCurrentPagePartiallySelected = selectedCount > 0 && !isAllCurrentPageSelected;

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  function handleSelectCurrentPage(checked: boolean) {
    setCurrentPageSelected(currentPageIds, checked);
  }

  function handleBatchUpdate(status: FeedbackStatus) {
    batchUpdateFeedbackStatus(status);
  }

  if (error) {
    return (
      <Alert variant="error">
        <AlertCircleIcon />
        <AlertTitle>{t('loadFailed')}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
      {hasFeedbacks && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700 sm:px-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Checkbox
              aria-label={tBulk('selectCurrentPage')}
              checked={isAllCurrentPageSelected}
              indeterminate={isCurrentPagePartiallySelected}
              onCheckedChange={handleSelectCurrentPage}
            />
            <span>{tBulk('selectCurrentPage')}</span>
          </label>

          {selectedCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {tBulk('selectedCount', { count: selectedCount })}
              </span>
              <Button variant="outline" size="sm" disabled={loading} onClick={() => handleBatchUpdate('processed')}>
                <CheckCircleIcon />
                {tBulk('markProcessed')}
              </Button>
              <Button variant="outline" size="sm" disabled={loading} onClick={() => handleBatchUpdate('archived')}>
                <ArchiveIcon />
                {tBulk('archive')}
              </Button>
              <Button variant="outline" size="sm" disabled={loading} onClick={() => handleBatchUpdate('pending')}>
                <UndoIcon />
                {tBulk('restore')}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="destructive-outline" size="sm" disabled={loading} />}>
                  <Trash2Icon />
                  {tBulk('delete')}
                </AlertDialogTrigger>
                <AlertDialogPopup>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{tBulk('confirmDelete')}</AlertDialogTitle>
                    <AlertDialogDescription>{tBulk('deleteDesc', { count: selectedCount })}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogClose render={<Button variant="ghost" />}>{tBulk('cancel')}</AlertDialogClose>
                    <AlertDialogClose
                      render={<Button variant="destructive" onClick={() => handleBatchUpdate('deleted')} />}
                    >
                      {tBulk('btnDelete')}
                    </AlertDialogClose>
                  </AlertDialogFooter>
                </AlertDialogPopup>
              </AlertDialog>
              <Button variant="ghost" size="sm" disabled={loading} onClick={clearSelectedFeedbacks}>
                <XIcon />
                {tBulk('clearSelection')}
              </Button>
            </div>
          )}
        </div>
      )}
      <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
        {loading && feedbacks.length === 0 ? (
          <li className="px-6 py-12 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
            <Spinner />
            {tCommon('loading')}
          </li>
        ) : feedbacks.length === 0 ? (
          <li className="px-6 py-12">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>{t('noDataTitle')}</EmptyTitle>
                <EmptyDescription>{t('noDataDesc')}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </li>
        ) : (
          feedbacks.map((feedback) => (
            <FeedbackItem
              key={feedback.id}
              feedback={feedback}
              selected={selectedFeedbackIds.includes(feedback.id)}
              onSelectedChange={(selected) => toggleFeedbackSelected(feedback.id, selected)}
            />
          ))
        )}
      </ul>
    </div>
  );
}
