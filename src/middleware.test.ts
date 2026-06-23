import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';

vi.mock('next-intl/middleware', () => ({
  default: vi.fn(() => vi.fn(() => new Response(null))),
}));

vi.mock('./i18n/routing', () => ({
  routing: {
    defaultLocale: 'zh',
    localePrefix: 'as-needed',
    locales: ['zh', 'en'],
  },
}));

function createRequest(method: string, path: string) {
  return new NextRequest(new Request(`http://localhost${path}`, { method }));
}

describe('CORS middleware', () => {
  it('should return 204 with CORS headers for OPTIONS preflight', () => {
    const response = middleware(createRequest('OPTIONS', '/api/feedbacks'));

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PATCH, DELETE, OPTIONS');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    expect(response.headers.get('Access-Control-Max-Age')).toBe('86400');
  });

  it('should add CORS headers to non-OPTIONS requests', () => {
    const response = middleware(createRequest('POST', '/api/feedbacks'));

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PATCH, DELETE, OPTIONS');
  });

  it('should add CORS headers to GET requests', () => {
    const response = middleware(createRequest('GET', '/api/feedbacks'));

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
});
