import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATCH } from './route';

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
  return new Request('http://localhost/api/feedbacks/batch', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

describe('PATCH /api/feedbacks/batch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRun.mockResolvedValue({ meta: { changes: 0 } });
  });

  it('should return 400 when ids is empty', async () => {
    const response = await PATCH(createRequest({ ids: [], status: 'processed' }));

    expect(response.status).toBe(400);
    expect(mockPrepare).not.toHaveBeenCalled();
  });

  it('should return 400 when status is invalid', async () => {
    const response = await PATCH(createRequest({ ids: [1], status: 'invalid' }));

    expect(response.status).toBe(400);
    expect(mockPrepare).not.toHaveBeenCalled();
  });

  it('should dedupe ids before updating feedbacks', async () => {
    mockRun.mockResolvedValue({ meta: { changes: 2 } });

    const response = await PATCH(createRequest({ ids: [1, 2, 1], status: 'archived' }));

    expect(response.status).toBe(200);
    expect(mockPrepare).toHaveBeenCalledWith('UPDATE feedbacks SET status = ? WHERE id IN (?, ?)');
    expect(mockBind).toHaveBeenCalledWith('archived', 1, 2);
  });

  it('should return updated count on success', async () => {
    mockRun.mockResolvedValue({ meta: { changes: 3 } });

    const response = await PATCH(createRequest({ ids: [1, 2, 3], status: 'deleted' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, updated: 3 });
  });
});
