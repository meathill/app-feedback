import { create } from 'zustand';
import type { Feedback, FeedbackStatus } from '@/types';
import { PAGE_SIZE } from '@/constants';

interface FeedbackState {
  feedbacks: Feedback[];
  total: number;
  page: number;
  totalPages: number;
  apps: string[];
  selectedFeedbackIds: number[];

  filterApp: string | null;
  filterStatus: FeedbackStatus | null;
  filterTag: string | null;

  loading: boolean;
  error: string | null;

  fetchFeedbacks: () => Promise<void>;
  setPage: (page: number) => void;
  setFilterApp: (app: string | null) => void;
  setFilterStatus: (status: FeedbackStatus | null) => void;
  setFilterTag: (tag: string | null) => void;
  toggleFeedbackSelected: (id: number, selected?: boolean) => void;
  setCurrentPageSelected: (ids: number[], selected: boolean) => void;
  clearSelectedFeedbacks: () => void;
  updateFeedbackStatus: (id: number, status: FeedbackStatus) => Promise<void>;
  batchUpdateFeedbackStatus: (status: FeedbackStatus) => Promise<void>;
  deleteFeedback: (id: number) => Promise<void>;
  updateFeedbackNotes: (id: number, notes: string) => Promise<void>;
  updateFeedbackTags: (id: number, tags: string[]) => Promise<void>;
  translateFeedback: (id: number) => Promise<void>;
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  feedbacks: [],
  total: 0,
  page: 1,
  totalPages: 0,
  apps: [],
  selectedFeedbackIds: [],

  filterApp: null,
  filterStatus: 'pending',
  filterTag: null,

  loading: false,
  error: null,

  async fetchFeedbacks() {
    const { page, filterApp, filterStatus, filterTag } = get();
    set({ loading: true, error: null, selectedFeedbackIds: [] });

    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));
      if (filterApp) params.set('app_id', filterApp);
      if (filterStatus) params.set('status', filterStatus);
      if (filterTag) params.set('tag', filterTag);

      const res = await fetch(`/api/feedbacks?${params}`);
      if (!res.ok) throw new Error('Failed to fetch feedbacks');

      const json = (await res.json()) as {
        data: Feedback[];
        total: number;
        page: number;
        totalPages: number;
        apps: string[];
      };
      set({
        feedbacks: json.data,
        total: json.total,
        totalPages: json.totalPages,
        loading: false,
        // 只在 apps 为空时更新（首次加载），避免筛选时覆盖
        ...(get().apps.length === 0 ? { apps: json.apps } : {}),
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  setPage(page: number) {
    set({ page, selectedFeedbackIds: [] });
    get().fetchFeedbacks();
  },

  setFilterApp(app: string | null) {
    set({ filterApp: app, page: 1, selectedFeedbackIds: [] });
    get().fetchFeedbacks();
  },

  setFilterStatus(status: FeedbackStatus | null) {
    set({ filterStatus: status, page: 1, selectedFeedbackIds: [] });
    get().fetchFeedbacks();
  },

  setFilterTag(tag: string | null) {
    set({ filterTag: tag, page: 1, selectedFeedbackIds: [] });
    get().fetchFeedbacks();
  },

  toggleFeedbackSelected(id: number, selected?: boolean) {
    const selectedFeedbackIds = get().selectedFeedbackIds;
    const isSelected = selectedFeedbackIds.includes(id);
    const shouldSelect = selected ?? !isSelected;

    if (shouldSelect === isSelected) return;

    set({
      selectedFeedbackIds: shouldSelect
        ? [...selectedFeedbackIds, id]
        : selectedFeedbackIds.filter((selectedId) => selectedId !== id),
    });
  },

  setCurrentPageSelected(ids: number[], selected: boolean) {
    const currentIds = new Set(ids);
    const selectedFeedbackIds = get().selectedFeedbackIds.filter((id) => !currentIds.has(id));

    set({
      selectedFeedbackIds: selected ? [...selectedFeedbackIds, ...ids] : selectedFeedbackIds,
    });
  },

  clearSelectedFeedbacks() {
    set({ selectedFeedbackIds: [] });
  },

  async updateFeedbackStatus(id: number, status: FeedbackStatus) {
    try {
      const res = await fetch(`/api/feedbacks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      await get().fetchFeedbacks();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  async batchUpdateFeedbackStatus(status: FeedbackStatus) {
    const ids = get().selectedFeedbackIds;
    if (ids.length === 0) return;

    try {
      set({ loading: true, error: null });
      const res = await fetch('/api/feedbacks/batch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(json.error || 'Failed to batch update feedbacks');
      }
      await get().fetchFeedbacks();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  async deleteFeedback(id: number) {
    try {
      const res = await fetch(`/api/feedbacks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete feedback');
      await get().fetchFeedbacks();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  async updateFeedbackNotes(id: number, notes: string) {
    try {
      const res = await fetch(`/api/feedbacks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error('Failed to update notes');
      await get().fetchFeedbacks();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  async updateFeedbackTags(id: number, tags: string[]) {
    try {
      const res = await fetch(`/api/feedbacks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags }),
      });
      if (!res.ok) throw new Error('Failed to update tags');
      await get().fetchFeedbacks();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  async translateFeedback(id: number) {
    try {
      const res = await fetch(`/api/feedbacks/${id}/translate`, { method: 'POST' });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(json.error || 'Failed to translate feedback');
      }
      const json = (await res.json()) as { id: number; contentEn: string };
      set({
        feedbacks: get().feedbacks.map((f) => (f.id === id ? { ...f, contentEn: json.contentEn } : f)),
      });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
