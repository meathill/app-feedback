'use client';

import { useState } from 'react';
import type { Feedback } from '@/types';
import { FEEDBACK_TAGS, STATUS_CONFIG } from '@/constants';
import { useFeedbackStore } from '@/store/feedback-store';
import {
  CheckCircleIcon,
  ArchiveIcon,
  Trash2Icon,
  UndoIcon,
  MessageSquareIcon,
  TagIcon,
  XIcon,
  SaveIcon,
  LanguagesIcon,
  Loader2Icon,
} from 'lucide-react';
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
import { Menu, MenuCheckboxItem, MenuPopup, MenuTrigger } from '@/components/ui/menu';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface FeedbackItemProps {
  feedback: Feedback;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
}

export default function FeedbackItem({ feedback, selected, onSelectedChange }: FeedbackItemProps) {
  const updateFeedbackStatus = useFeedbackStore((s) => s.updateFeedbackStatus);
  const deleteFeedback = useFeedbackStore((s) => s.deleteFeedback);
  const updateFeedbackNotes = useFeedbackStore((s) => s.updateFeedbackNotes);
  const updateFeedbackTags = useFeedbackStore((s) => s.updateFeedbackTags);
  const translateFeedback = useFeedbackStore((s) => s.translateFeedback);

  const t = useTranslations('Admin.item');

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(feedback.notes || '');
  const [isTranslating, setIsTranslating] = useState(false);

  const statusCfg = STATUS_CONFIG[feedback.status];

  function handleSaveNotes() {
    updateFeedbackNotes(feedback.id, notesValue);
    setEditingNotes(false);
  }

  function handleNotesKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSaveNotes();
    }
    if (e.key === 'Escape') {
      setNotesValue(feedback.notes || '');
      setEditingNotes(false);
    }
  }

  function handleToggleTag(tagValue: string) {
    const current = feedback.tags || [];
    const next = current.includes(tagValue) ? current.filter((t) => t !== tagValue) : [...current, tagValue];
    updateFeedbackTags(feedback.id, next);
  }

  async function handleConfirmDelete() {
    await deleteFeedback(feedback.id);
  }

  async function handleTranslate() {
    if (isTranslating) return;
    setIsTranslating(true);
    try {
      await translateFeedback(feedback.id);
    } finally {
      setIsTranslating(false);
    }
  }

  return (
    <li className={cn('px-4 py-4 sm:px-6', selected && 'bg-indigo-50/60 dark:bg-indigo-950/20')}>
      <div className="flex gap-3">
        <div className="pt-0.5">
          <Checkbox
            aria-label={t('selectFeedback', { id: feedback.id })}
            checked={selected}
            onCheckedChange={(checked) => onSelectedChange(checked === true)}
          />
        </div>
        <div className="min-w-0 flex-1">
          {/* 顶部：应用名 + 状态 + 标签 */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                {feedback.appId}
              </span>
              {feedback.version && <span className="text-sm text-gray-500">v{feedback.version}</span>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Tags */}
              {feedback.tags?.map((tagValue) => {
                const tagDef = FEEDBACK_TAGS.find((t) => t.value === tagValue);
                if (!tagDef) return null;
                return (
                  <span
                    key={tagValue}
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tagDef.color}`}
                  >
                    {tagDef.label}
                  </span>
                );
              })}
              {/* Status */}
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
            </div>
          </div>

          {/* 内容 */}
          <div className="mt-2 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{feedback.content}</div>
          {feedback.contentEn && (
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 whitespace-pre-wrap border-l-2 border-gray-200 dark:border-gray-700 pl-3">
              {feedback.contentEn}
            </div>
          )}

          {/* 备注 */}
          <div className="mt-3">
            {editingNotes ? (
              <div className="flex flex-col gap-2">
                <Textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  onKeyDown={handleNotesKeyDown}
                  rows={3}
                  placeholder={t('addNote')}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="xs" onClick={handleSaveNotes}>
                    <SaveIcon />
                    {t('save')}
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      setNotesValue(feedback.notes || '');
                      setEditingNotes(false);
                    }}
                  >
                    <XIcon />
                    {t('cancel')}
                  </Button>
                </div>
              </div>
            ) : feedback.notes ? (
              <div
                onClick={() => {
                  setNotesValue(feedback.notes || '');
                  setEditingNotes(true);
                }}
                className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="font-medium text-gray-500 dark:text-gray-400">{t('notes')}</span>
                {feedback.notes}
              </div>
            ) : null}
          </div>

          {/* 底部：联系方式 + 时间 + 操作 */}
          <div className="mt-3 flex flex-wrap justify-between items-center gap-2">
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              {feedback.contact && <span>📧 {feedback.contact}</span>}
              <span>📅 {new Date(feedback.createdAt * 1000).toLocaleString()}</span>
              <span className="text-xs text-gray-400">ID: {feedback.id}</span>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-1">
              {!editingNotes && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setNotesValue(feedback.notes || '');
                    setEditingNotes(true);
                  }}
                  title={feedback.notes ? t('editNoteTip') : t('addNoteTip')}
                >
                  <MessageSquareIcon />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleTranslate}
                disabled={isTranslating}
                className={feedback.contentEn ? 'text-gray-400 hover:text-gray-600' : ''}
                title={feedback.contentEn ? t('reTranslateTip') : t('translateTip')}
              >
                {isTranslating ? <Loader2Icon className="animate-spin" /> : <LanguagesIcon />}
              </Button>

              <Menu>
                <MenuTrigger render={<Button variant="ghost" size="icon-sm" title={t('manageTagsTip')} />}>
                  <TagIcon />
                </MenuTrigger>
                <MenuPopup align="end" className="min-w-[140px]">
                  {FEEDBACK_TAGS.map((tag) => (
                    <MenuCheckboxItem
                      key={tag.value}
                      checked={feedback.tags?.includes(tag.value) ?? false}
                      onCheckedChange={() => handleToggleTag(tag.value)}
                    >
                      {tag.label}
                    </MenuCheckboxItem>
                  ))}
                </MenuPopup>
              </Menu>

              {feedback.status === 'pending' && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => updateFeedbackStatus(feedback.id, 'processed')}
                  className="text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                  title={t('markProcessedTip')}
                >
                  <CheckCircleIcon />
                </Button>
              )}

              {feedback.status !== 'archived' && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => updateFeedbackStatus(feedback.id, 'archived')}
                  title={t('archiveTip')}
                >
                  <ArchiveIcon />
                </Button>
              )}

              {feedback.status === 'archived' && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => updateFeedbackStatus(feedback.id, 'pending')}
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  title={t('restoreTip')}
                >
                  <UndoIcon />
                </Button>
              )}

              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title={t('deleteTip')}
                    />
                  }
                >
                  <Trash2Icon />
                </AlertDialogTrigger>
                <AlertDialogPopup>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('deleteDesc')}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogClose render={<Button variant="ghost" />}>{t('cancel')}</AlertDialogClose>
                    <AlertDialogClose render={<Button variant="destructive" onClick={handleConfirmDelete} />}>
                      {t('btnDelete')}
                    </AlertDialogClose>
                  </AlertDialogFooter>
                </AlertDialogPopup>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
