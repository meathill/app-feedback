import { describe, it, expect } from 'vitest';
import { middleware } from './middleware';
import { NextRequest } from 'next/server';

function createRequest(method: string, path: string) {
  return new NextRequest(new Request(`http://localhost${path}`, { method }));
}

describe('CORS middleware', () => {
  it('should return 204 with CORS headers for OPTIONS preflight', () => {
    const response = middleware(createRequest('OPTIONS', '/api/feedbacks'));

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, OPTIONS');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    expect(response.headers.get('Access-Control-Max-Age')).toBe('86400');
  });

  it('should add CORS headers to non-OPTIONS requests', () => {
    const response = middleware(createRequest('POST', '/api/feedbacks'));

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, OPTIONS');
  });

  it('should add CORS headers to GET requests', () => {
    const response = middleware(createRequest('GET', '/api/feedbacks'));

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
});
