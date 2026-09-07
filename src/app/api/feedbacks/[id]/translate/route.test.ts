import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const mockFirst = vi.fn();
const mockRun = vi.fn();
const mockTranslate = vi.fn();
const mockEnv: { DB: { prepare: (...args: unknown[]) => unknown }; GEMINI_API_KEY?: string } = {
  DB: { prepare: () => ({}) },
  GEMINI_API_KEY: 'test-key',
};

vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: vi.fn(() => ({ env: mockEnv })),
}));

vi.mock('@/lib/gemini', () => ({
  translateToEnglish: (...args: unknown[]) => (mockTranslate as (...a: unknown[]) => unknown)(...args),
}));

function withParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('POST /api/feedbacks/[id]/translate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.GEMINI_API_KEY = 'test-key';
    mockEnv.DB = {
      prepare: (sql: unknown) =>
        String(sql).trimStart().startsWith('SELECT')
          ? { bind: () => ({ first: mockFirst }) }
          : { bind: () => ({ run: mockRun }) },
    };
    mockFirst.mockResolvedValue({ content: '这个应用很好用' });
    mockTranslate.mockResolvedValue('This app is great');
    mockRun.mockResolvedValue({});
  });

  it('id 非数字时返回 400', async () => {
    const response = await POST(new Request('http://localhost/', { method: 'POST' }), withParams('abc'));

    expect(response.status).toBe(400);
    expect(mockTranslate).not.toHaveBeenCalled();
  });

  it('未配置 GEMINI_API_KEY 时返回 500', async () => {
    delete mockEnv.GEMINI_API_KEY;

    const response = await POST(new Request('http://localhost/', { method: 'POST' }), withParams('1'));

    expect(response.status).toBe(500);
    expect(mockTranslate).not.toHaveBeenCalled();
  });

  it('记录不存在时返回 404', async () => {
    mockFirst.mockResolvedValue(null);

    const response = await POST(new Request('http://localhost/', { method: 'POST' }), withParams('999'));

    expect(response.status).toBe(404);
    expect(mockTranslate).not.toHaveBeenCalled();
  });

  it('翻译成功后落库并返回译文', async () => {
    const response = await POST(new Request('http://localhost/', { method: 'POST' }), withParams('5'));

    expect(response.status).toBe(200);
    expect(mockTranslate).toHaveBeenCalledWith('这个应用很好用', 'test-key');
    expect(mockRun).toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ id: 5, contentEn: 'This app is great' });
  });

  it('翻译失败时返回 500 并透出错误信息', async () => {
    mockTranslate.mockRejectedValue(new Error('quota exceeded'));

    const response = await POST(new Request('http://localhost/', { method: 'POST' }), withParams('5'));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'quota exceeded' });
  });
});
