import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const mockAll = vi.fn();
const mockBind = vi.fn(() => ({ all: mockAll }));
// 注意：apps 查询是 prepare(...).all()，不经过 bind
const mockPrepare = vi.fn((_sql: string) => ({ bind: mockBind, all: mockAll }));

interface FeedbackListBody {
  data: { tags: string[] }[];
  total: number;
  page: number;
  totalPages: number;
  apps: string[];
}

vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: vi.fn(() => ({
    env: {
      DB: {
        prepare: mockPrepare,
      },
    },
  })),
}));

function createGetRequest(query = '') {
  return new NextRequest(new Request(`http://localhost/api/feedbacks${query}`, { method: 'GET' }));
}

function mockDb(total: number, rows: unknown[], apps: string[]) {
  mockAll
    .mockResolvedValueOnce({ results: [{ total }] })
    .mockResolvedValueOnce({ results: rows })
    .mockResolvedValueOnce({ results: apps.map((app_id) => ({ app_id })) });
}

const sampleRow = {
  id: 1,
  appId: 'com.example.app',
  version: '1.0.0',
  content: 'Great app!',
  contentEn: null,
  contact: 'user@example.com',
  deviceInfo: null,
  location: null,
  status: 'pending',
  notes: null,
  tags: '["bug"]',
  createdAt: 1700000000,
};

describe('GET /api/feedbacks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('默认返回第一页并解析 tags JSON', async () => {
    mockDb(1, [sampleRow], ['com.example.app']);

    const response = await GET(createGetRequest());
    expect(response.status).toBe(200);

    const body = (await response.json()) as FeedbackListBody;
    expect(body.total).toBe(1);
    expect(body.page).toBe(1);
    expect(body.totalPages).toBe(1);
    expect(body.apps).toEqual(['com.example.app']);
    expect(body.data[0].tags).toEqual(['bug']);

    // 默认 limit 为 PAGE_SIZE=20，offset 为 0
    expect(mockBind).toHaveBeenCalledWith(20, 0);
  });

  it('按 app_id、status、tag 过滤并拼条件', async () => {
    mockDb(0, [], []);

    const response = await GET(createGetRequest('?app_id=com.example.app&status=pending&tag=bug'));
    expect(response.status).toBe(200);

    const sql = mockPrepare.mock.calls[0][0];
    expect(sql).toContain('app_id = ?');
    expect(sql).toContain('status = ?');
    expect(sql).toContain('json_each(tags)');
    expect(mockBind).toHaveBeenCalledWith('com.example.app', 'pending', 'bug', 20, 0);
  });

  it('分页参数做钳制：page 最小为 1，limit 最大为 100', async () => {
    mockDb(250, [], []);

    const response = await GET(createGetRequest('?page=0&limit=500'));
    expect(response.status).toBe(200);

    const body = (await response.json()) as { page: number; totalPages: number };
    expect(body.page).toBe(1);
    expect(body.totalPages).toBe(3);
    expect(mockBind).toHaveBeenCalledWith(100, 0);
  });

  it('第二页 offset 计算正确', async () => {
    mockDb(45, [], []);

    await GET(createGetRequest('?page=2&limit=20'));
    expect(mockBind).toHaveBeenCalledWith(20, 20);
  });

  it('数据库异常时返回 500', async () => {
    mockAll.mockRejectedValueOnce(new Error('D1 down'));

    const response = await GET(createGetRequest());
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });
});
