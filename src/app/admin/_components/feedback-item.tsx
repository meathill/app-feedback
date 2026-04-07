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
} from 'lucide-react';

interface FeedbackItemProps {
  feedback: Feedback;
}

export default function FeedbackItem({ feedback }: FeedbackItemProps) {
  const updateFeedbackStatus = useFeedbackStore((s) => s.updateFeedbackStatus);
  const deleteFeedback = useFeedbackStore((s) => s.deleteFeedback);
  const updateFeedbackNotes = useFeedbackStore((s) => s.updateFeedbackNotes);
  const updateFeedbackTags = useFeedbackStore((s) => s.updateFeedbackTags);

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(feedback.notes || '');
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteFeedback(feedback.id);
    setConfirmDelete(false);
  }

  return (
    <li className="px-4 py-4 sm:px-6">
      {/* 顶部：应用名 + 状态 + 标签 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{feedback.appId}</span>
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

      {/* 备注 */}
      <div className="mt-3">
        {editingNotes ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              onKeyDown={handleNotesKeyDown}
              rows={3}
              className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="添加备注..."
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveNotes}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <SaveIcon size={12} />
                保存
              </button>
              <button
                type="button"
                onClick={() => {
                  setNotesValue(feedback.notes || '');
                  setEditingNotes(false);
                }}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <XIcon size={12} />
                取消
              </button>
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
            <span className="font-medium text-gray-500 dark:text-gray-400">备注：</span>
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
            <button
              type="button"
              onClick={() => {
                setNotesValue(feedback.notes || '');
                setEditingNotes(true);
              }}
              className="p-1.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              title={feedback.notes ? '编辑备注' : '添加备注'}
            >
              <MessageSquareIcon size={16} />
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTagPicker(!showTagPicker)}
              className="p-1.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              title="管理标签"
            >
              <TagIcon size={16} />
            </button>
            {showTagPicker && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg p-2 min-w-[120px]">
                {FEEDBACK_TAGS.map((tag) => {
                  const isActive = feedback.tags?.includes(tag.value);
                  return (
                    <button
                      key={tag.value}
                      type="button"
                      onClick={() => handleToggleTag(tag.value)}
                      className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive ? 'font-semibold' : ''}`}
                    >
                      {isActive ? '✓ ' : '  '}
                      {tag.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setShowTagPicker(false)}
                  className="w-full text-left px-2 py-1 text-xs text-gray-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700 mt-1 border-t border-gray-100 dark:border-gray-700 pt-1"
                >
                  关闭
                </button>
              </div>
            )}
          </div>

          {feedback.status === 'pending' && (
            <button
              type="button"
              onClick={() => updateFeedbackStatus(feedback.id, 'processed')}
              className="p-1.5 rounded text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
              title="标记已处理"
            >
              <CheckCircleIcon size={16} />
            </button>
          )}

          {feedback.status !== 'archived' && (
            <button
              type="button"
              onClick={() => updateFeedbackStatus(feedback.id, 'archived')}
              className="p-1.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              title="归档"
            >
              <ArchiveIcon size={16} />
            </button>
          )}

          {feedback.status === 'archived' && (
            <button
              type="button"
              onClick={() => updateFeedbackStatus(feedback.id, 'pending')}
              className="p-1.5 rounded text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              title="恢复"
            >
              <UndoIcon size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={handleDelete}
            onBlur={() => setConfirmDelete(false)}
            className={`p-1.5 rounded ${confirmDelete ? 'text-red-600 bg-red-50 dark:bg-red-900/30' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'}`}
            title={confirmDelete ? '确认删除？再点一次' : '删除'}
          >
            <Trash2Icon size={16} />
          </button>
        </div>
      </div>
    </li>
  );
}
