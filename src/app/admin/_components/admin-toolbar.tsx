'use client';

import { useFeedbackStore } from '@/store/feedback-store';
import { FEEDBACK_TAGS, STATUS_CONFIG } from '@/constants';
import type { FeedbackStatus } from '@/types';
import { RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from '@/components/ui/select';

const ALL = '__all__';

const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label]),
);
const TAG_LABEL: Record<string, string> = Object.fromEntries(FEEDBACK_TAGS.map((t) => [t.value, t.label]));

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
    <div className="mb-6 flex flex-wrap gap-4 items-end">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">应用</label>
        <Select value={filterApp ?? ALL} onValueChange={(v: string | null) => setFilterApp(v === ALL ? null : v)}>
          <SelectTrigger className="min-w-40">
            <SelectValue>{(value) => (value === ALL ? '全部应用' : (value as string))}</SelectValue>
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
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">状态</label>
        <Select
          value={filterStatus ?? ALL}
          onValueChange={(v: string | null) => setFilterStatus(v === ALL ? null : (v as FeedbackStatus))}
        >
          <SelectTrigger className="min-w-32">
            <SelectValue>{(value) => (value === ALL ? '全部状态' : STATUS_LABEL[value as string])}</SelectValue>
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
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">标签</label>
        <Select value={filterTag ?? ALL} onValueChange={(v: string | null) => setFilterTag(v === ALL ? null : v)}>
          <SelectTrigger className="min-w-32">
            <SelectValue>{(value) => (value === ALL ? '全部标签' : TAG_LABEL[value as string])}</SelectValue>
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
      </div>

      <Button variant="outline" size="sm" onClick={handleRefresh} title="刷新">
        <RefreshCwIcon />
        刷新
      </Button>
    </div>
  );
}
