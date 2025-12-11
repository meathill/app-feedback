import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock getCloudflareContext
const mockRun = vi.fn();
const mockBind = vi.fn(() => ({ run: mockRun }));
const mockPrepare = vi.fn(() => ({ bind: mockBind }));

vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: vi.fn(() => ({
    env: {
      DB: {
        prepare: mockPrepare,
      },
      TELEGRAM_BOT_TOKEN: 'test-token',
      TELEGRAM_CHAT_ID: 'test-chat-id',
    },
  })),
}));

// Mock global fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  } as Response),
);

describe('POST /api/feedbacks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if appId or content is missing', async () => {
    const request = new Request('http://localhost/api/feedbacks', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  it('should save feedback and send telegram notification on success', async () => {
    const feedbackData = {
      appId: 'com.example.app',
      content: 'Great app!',
      version: '1.0.0',
      contact: 'user@example.com',
    };

    const request = new Request('http://localhost/api/feedbacks', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    // Verify DB insertion
    expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO feedbacks'));
    expect(mockBind).toHaveBeenCalledWith(
      'com.example.app',
      '1.0.0',
      'Great app!',
      'user@example.com',
      null, // deviceInfo
      null, // location
    );
    expect(mockRun).toHaveBeenCalled();

    // Verify Telegram notification
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bottest-token/sendMessage',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Great app!'),
      }),
    );
  });

  it('should handle optional fields correctly', async () => {
    const feedbackData = {
      appId: 'com.example.app',
      content: 'Bug report',
      // missing version, contact, etc.
    };

    const request = new Request('http://localhost/api/feedbacks', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });

    await POST(request);

    expect(mockBind).toHaveBeenCalledWith('com.example.app', null, 'Bug report', null, null, null);
  });
});
