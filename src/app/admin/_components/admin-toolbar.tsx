'use client';

import { useFeedbackStore } from '@/store/feedback-store';
import { FEEDBACK_TAGS, STATUS_CONFIG } from '@/constants';
import type { FeedbackStatus } from '@/types';
import { RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from '@/components/ui/select';

const ALL = '__all__';

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
    useFeedbackStore.setState({ apps: [] });
    fetchFeedbacks();
  }

  return (
    <div className="mb-6 flex flex-wrap gap-4 items-center">
      <Select value={filterApp ?? ALL} onValueChange={(v: string | null) => setFilterApp(v === ALL ? null : v)}>
        <SelectTrigger className="min-w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectPopup>
          <SelectItem value={ALL}>全部应用</SelectItem>
          {apps.map((app) => (
            <SelectItem key={app} value={app}>
              {app}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>

      <Select
        value={filterStatus ?? ALL}
        onValueChange={(v: string | null) => setFilterStatus(v === ALL ? null : (v as FeedbackStatus))}
      >
        <SelectTrigger className="min-w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectPopup>
          <SelectItem value={ALL}>全部状态</SelectItem>
          {Object.entries(STATUS_CONFIG)
            .filter(([key]) => key !== 'deleted')
            .map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                {cfg.label}
              </SelectItem>
            ))}
        </SelectPopup>
      </Select>

      <Select value={filterTag ?? ALL} onValueChange={(v: string | null) => setFilterTag(v === ALL ? null : v)}>
        <SelectTrigger className="min-w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectPopup>
          <SelectItem value={ALL}>全部标签</SelectItem>
          {FEEDBACK_TAGS.map((tag) => (
            <SelectItem key={tag.value} value={tag.value}>
              {tag.label}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>

      <Button variant="outline" size="sm" onClick={handleRefresh} title="刷新">
        <RefreshCwIcon />
        刷新
      </Button>
    </div>
  );
}
