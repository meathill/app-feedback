import type { FeedbackStatus } from '@/types';

export const FEEDBACK_TAGS = [
  { value: 'bug', label: 'Bug', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'feature', label: '需求', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'thanks', label: '感谢', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  {
    value: 'discussion',
    label: '讨论',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
] as const;

export const STATUS_CONFIG: Record<FeedbackStatus, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  processed: { label: '已处理', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  archived: { label: '已归档', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  deleted: { label: '已删除', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};

export const PAGE_SIZE = 20;
