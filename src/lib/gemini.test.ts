import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GoogleGenAI } from '@google/genai';
import { translateToEnglish } from './gemini';

const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => ({
  // 必须用 function（而非箭头函数），否则 new GoogleGenAI() 会报 is not a constructor
  GoogleGenAI: vi.fn(function () {
    return {
      models: {
        generateContent: (...args: unknown[]) => (mockGenerateContent as (...a: unknown[]) => unknown)(...args),
      },
    };
  }),
}));

describe('translateToEnglish', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('用 gemini-3-flash-preview 翻译并去掉首尾空白', async () => {
    mockGenerateContent.mockResolvedValue({ text: '  This app is great\n' });

    const result = await translateToEnglish('这个应用很好用', 'test-key');

    expect(result).toBe('This app is great');
    expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: 'test-key' });
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gemini-3-flash-preview',
        contents: expect.stringContaining('这个应用很好用'),
      }),
    );
  });

  it('返回空译文时抛错', async () => {
    mockGenerateContent.mockResolvedValue({ text: '   ' });

    await expect(translateToEnglish('你好', 'test-key')).rejects.toThrow('Gemini returned empty translation');
  });

  it('API 异常时直接透出', async () => {
    mockGenerateContent.mockRejectedValue(new Error('quota exceeded'));

    await expect(translateToEnglish('你好', 'test-key')).rejects.toThrow('quota exceeded');
  });
});
