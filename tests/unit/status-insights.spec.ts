import { describe, it, expect } from 'vitest';
import { getStatusInsight } from '@/lib/insights/status-insights';
import { normalizeRequest } from '@/lib/network/normalize-request';
import get200Fixture from '../fixtures/har/get-200.json';
import get401Fixture from '../fixtures/har/get-401-with-bearer.json';
import get429Fixture from '../fixtures/har/get-429-retry-after.json';
import type { HarEntry, NetworkRecord } from '@/types/network';

describe('getStatusInsight', () => {
  it('returns null for successful 200 request', () => {
    const record = normalizeRequest(get200Fixture as unknown as HarEntry);
    const insight = getStatusInsight(record);
    expect(insight).toBeNull();
  });

  it('detects 401 with existing auth header (expired token)', () => {
    const record = normalizeRequest(get401Fixture as unknown as HarEntry);
    const insight = getStatusInsight(record);

    expect(insight).not.toBeNull();
    expect(insight?.code).toBe(401);
    expect(insight?.title).toContain('Authentication Failed');
    expect(insight?.recommendations.some((r) => r.includes('Token Expiry'))).toBe(true);
  });

  it('detects 401 with missing auth header', () => {
    const record = normalizeRequest({
      ...get401Fixture,
      request: {
        ...get401Fixture.request,
        headers: [],
      },
    } as unknown as HarEntry);

    const insight = getStatusInsight(record);
    expect(insight?.title).toContain('Missing Authentication Header');
    expect(insight?.message).toContain('did not include any Authorization');
  });

  it('detects 429 with Retry-After header and reports seconds', () => {
    const record = normalizeRequest(get429Fixture as unknown as HarEntry);
    const insight = getStatusInsight(record);

    expect(insight?.code).toBe(429);
    expect(insight?.message).toContain('60 seconds');
  });

  it('detects 500 with HTML response page', () => {
    const dummy500: NetworkRecord = {
      id: 'test',
      method: 'GET',
      url: 'https://api.example.com/fail',
      origin: 'https://api.example.com',
      path: '/fail',
      query: {},
      status: 500,
      startedAt: Date.now(),
      requestHeaders: {},
      responseHeaders: { 'content-type': 'text/html; charset=utf-8' },
      mimeType: 'text/html',
      redactedKeys: [],
    };

    const insight = getStatusInsight(dummy500);
    expect(insight?.code).toBe(500);
    expect(insight?.recommendations.some((r) => r.includes('Response is HTML'))).toBe(true);
  });

  it('detects status 0 network/CORS error', () => {
    const dummyCORS: NetworkRecord = {
      id: 'test',
      method: 'POST',
      url: 'https://api.example.com/blocked',
      origin: 'https://api.example.com',
      path: '/blocked',
      query: {},
      status: 0,
      startedAt: Date.now(),
      requestHeaders: {},
      responseHeaders: {},
      redactedKeys: [],
    };

    const insight = getStatusInsight(dummyCORS);
    expect(insight?.title).toContain('Status 0');
    expect(insight?.recommendations.some((r) => r.includes('CORS Preflight Failure'))).toBe(true);
  });
});
