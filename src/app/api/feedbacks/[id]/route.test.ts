import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, PATCH } from './route';

const mockRun = vi.fn();
const mockBind = vi.fn(() => ({ run: mockRun }));
const mockPrepare = vi.fn(() => ({ bind: mockBind }));

vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: vi.fn(() => ({
    env: {
      DB: {
        prepare: mockPrepare,
      },
    },
  })),
}));

function createRequest(body: unknown) {
  return new Request('http://localhost/api/feedbacks/1', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

function withParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('PATCH /api/feedbacks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRun.mockResolvedValue({ meta: { changes: 1 } });
  });

  it('id 非数字时返回 400', async () => {
    const response = await PATCH(createRequest({ status: 'processed' }), withParams('abc'));

    expect(response.status).toBe(400);
    expect(mockPrepare).not.toHaveBeenCalled();
  });

  it('status 非法时返回 400', async () => {
    const response = await PATCH(createRequest({ status: 'invalid' }), withParams('1'));

    expect(response.status).toBe(400);
    expect(mockPrepare).not.toHaveBeenCalled();
  });

  it('tags 非数组时返回 400', async () => {
    const response = await PATCH(createRequest({ tags: 'bug' }), withParams('1'));

    expect(response.status).toBe(400);
    expect(mockPrepare).not.toHaveBeenCalled();
  });

  it('无有效字段时返回 400', async () => {
    const response = await PATCH(createRequest({}), withParams('1'));

    expect(response.status).toBe(400);
    expect(mockPrepare).not.toHaveBeenCalled();
  });

  it('成功更新 status 与 notes', async () => {
    const response = await PATCH(createRequest({ status: 'processed', notes: '已跟进' }), withParams('7'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(mockPrepare).toHaveBeenCalledWith('UPDATE feedbacks SET status = ?, notes = ? WHERE id = ?');
    expect(mockBind).toHaveBeenCalledWith('processed', '已跟进', 7);
  });

  it('tags 按 JSON 字符串落库', async () => {
    const response = await PATCH(createRequest({ tags: ['bug', 'feature'] }), withParams('3'));

    expect(response.status).toBe(200);
    expect(mockBind).toHaveBeenCalledWith('["bug","feature"]', 3);
  });

  it('记录不存在时返回 404', async () => {
    mockRun.mockResolvedValue({ meta: { changes: 0 } });

    const response = await PATCH(createRequest({ status: 'archived' }), withParams('999'));

    expect(response.status).toBe(404);
  });
});

describe('DELETE /api/feedbacks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRun.mockResolvedValue({ meta: { changes: 1 } });
  });

  it('id 非数字时返回 400', async () => {
    const request = new Request('http://localhost/api/feedbacks/abc', { method: 'DELETE' });
    const response = await DELETE(request, withParams('abc'));

    expect(response.status).toBe(400);
  });

  it('软删除成功', async () => {
    const request = new Request('http://localhost/api/feedbacks/1', { method: 'DELETE' });
    const response = await DELETE(request, withParams('1'));

    expect(response.status).toBe(200);
    expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining("status = 'deleted'"));
    expect(mockBind).toHaveBeenCalledWith(1);
  });

  it('已删除或不存在时返回 404', async () => {
    mockRun.mockResolvedValue({ meta: { changes: 0 } });

    const request = new Request('http://localhost/api/feedbacks/999', { method: 'DELETE' });
    const response = await DELETE(request, withParams('999'));

    expect(response.status).toBe(404);
  });
});
