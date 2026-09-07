import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFeedbackStore } from './feedback-store';

const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function jsonResponse(json: unknown, ok = true) {
  return { ok, json: async () => json } as Response;
}

const listPayload = {
  data: [{ id: 1, appId: 'com.example.app', content: 'hi', status: 'pending', tags: [], createdAt: 1700000000 }],
  total: 1,
  page: 1,
  totalPages: 1,
  apps: ['com.example.app'],
};

function resetStore() {
  useFeedbackStore.setState({
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
  });
}

describe('feedback-store 选择逻辑', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  it('toggleFeedbackSelected 增删互补', () => {
    const { toggleFeedbackSelected } = useFeedbackStore.getState();

    toggleFeedbackSelected(1);
    expect(useFeedbackStore.getState().selectedFeedbackIds).toEqual([1]);

    toggleFeedbackSelected(1);
    expect(useFeedbackStore.getState().selectedFeedbackIds).toEqual([]);
  });

  it('toggle 显式指定 selected 且与现状一致时不做变更', () => {
    useFeedbackStore.setState({ selectedFeedbackIds: [1] });
    const { toggleFeedbackSelected } = useFeedbackStore.getState();

    toggleFeedbackSelected(1, true);
    expect(useFeedbackStore.getState().selectedFeedbackIds).toEqual([1]);

    toggleFeedbackSelected(1, false);
    expect(useFeedbackStore.getState().selectedFeedbackIds).toEqual([]);
  });

  it('setCurrentPageSelected 只影响当页 id', () => {
    useFeedbackStore.setState({ selectedFeedbackIds: [9] });
    const { setCurrentPageSelected } = useFeedbackStore.getState();

    setCurrentPageSelected([1, 2], true);
    expect(useFeedbackStore.getState().selectedFeedbackIds).toEqual([9, 1, 2]);

    setCurrentPageSelected([1, 2], false);
    expect(useFeedbackStore.getState().selectedFeedbackIds).toEqual([9]);
  });

  it('clearSelectedFeedbacks 清空选择', () => {
    useFeedbackStore.setState({ selectedFeedbackIds: [1, 2] });

    useFeedbackStore.getState().clearSelectedFeedbacks();

    expect(useFeedbackStore.getState().selectedFeedbackIds).toEqual([]);
  });
});

describe('feedback-store 拉取与更新', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  it('fetchFeedbacks 按默认条件请求并写入 state', async () => {
    mockFetch.mockResolvedValue(jsonResponse(listPayload));

    await useFeedbackStore.getState().fetchFeedbacks();

    const url = String(mockFetch.mock.calls[0][0]);
    expect(url).toContain('page=1');
    expect(url).toContain('limit=20');
    expect(url).toContain('status=pending');

    const state = useFeedbackStore.getState();
    expect(state.feedbacks).toHaveLength(1);
    expect(state.total).toBe(1);
    expect(state.apps).toEqual(['com.example.app']);
    expect(state.loading).toBe(false);
  });

  it('fetchFeedbacks 携带筛选条件且失败时写入 error', async () => {
    useFeedbackStore.setState({ filterApp: 'com.example.app', filterTag: 'bug' });
    mockFetch.mockResolvedValue(jsonResponse(listPayload));

    await useFeedbackStore.getState().fetchFeedbacks();

    const url = String(mockFetch.mock.calls[0][0]);
    expect(url).toContain('app_id=com.example.app');
    expect(url).toContain('tag=bug');

    mockFetch.mockRejectedValueOnce(new Error('network down'));
    await useFeedbackStore.getState().fetchFeedbacks();
    expect(useFeedbackStore.getState().error).toBe('network down');
  });

  it('updateFeedbackStatus 先 PATCH 再刷新列表', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ success: true })).mockResolvedValueOnce(jsonResponse(listPayload));

    await useFeedbackStore.getState().updateFeedbackStatus(7, 'processed');

    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      '/api/feedbacks/7',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'processed' }),
      }),
    );
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(useFeedbackStore.getState().feedbacks).toHaveLength(1);
  });

  it('updateFeedbackStatus 失败时写入 error 且不刷新', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) } as Response);

    await useFeedbackStore.getState().updateFeedbackStatus(7, 'processed');

    expect(useFeedbackStore.getState().error).toBe('Failed to update status');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('batchUpdateFeedbackStatus 无选中时不发请求', async () => {
    await useFeedbackStore.getState().batchUpdateFeedbackStatus('archived');

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('translateFeedback 成功后局部更新译文', async () => {
    useFeedbackStore.setState({
      feedbacks: [{ id: 1, appId: 'a', content: '你好', status: 'pending', tags: [], createdAt: 1 }],
    });
    mockFetch.mockResolvedValue(jsonResponse({ id: 1, contentEn: 'Hello' }));

    await useFeedbackStore.getState().translateFeedback(1);

    expect(mockFetch).toHaveBeenCalledWith('/api/feedbacks/1/translate', { method: 'POST' });
    expect(useFeedbackStore.getState().feedbacks[0].contentEn).toBe('Hello');
  });
});
