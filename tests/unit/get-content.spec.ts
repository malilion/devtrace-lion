import { describe, it, expect } from 'vitest';
import { getContent, type HarRequest } from '@/lib/network/get-content';

describe('getContent Promisify Wrapper', () => {
  it('handles Chrome 151+ Promise returning { content, encoding }', async () => {
    const mockReq: HarRequest = {
      getContent: () =>
        Promise.resolve({
          content: '{"status":"ok"}',
          encoding: 'utf-8',
        }),
    };

    const res = await getContent(mockReq);
    expect(res.body).toBe('{"status":"ok"}');
    expect(res.encoding).toBe('utf-8');
  });

  it('handles Firefox Promise resolving to [content, mimeType]', async () => {
    const mockReq: HarRequest = {
      getContent: () => Promise.resolve(['{"firefox":"data"}', 'application/json']),
    };

    const res = await getContent(mockReq);
    expect(res.body).toBe('{"firefox":"data"}');
    expect(res.encoding).toBeUndefined();
  });

  it('handles older Chrome callback pattern', async () => {
    const mockReq: HarRequest = {
      getContent: (cb?: (body: string, encoding: string) => void) => {
        if (cb) {
          setTimeout(() => cb('{"legacy":"chrome"}', 'utf-8'), 5);
        }
      },
    };

    const res = await getContent(mockReq);
    expect(res.body).toBe('{"legacy":"chrome"}');
    expect(res.encoding).toBe('utf-8');
  });

  it('handles missing or throwing getContent gracefully', async () => {
    const mockBrokenReq: HarRequest = {
      getContent: () => {
        throw new Error('Network error');
      },
    };

    const res = await getContent(mockBrokenReq);
    expect(res.body).toBe('');
    expect(res.encoding).toBeUndefined();
  });

  it('handles undefined or null request', async () => {
    const res = await getContent(null as unknown as HarRequest);
    expect(res.body).toBe('');
  });
});
