import { describe, it, expect } from 'vitest';
import { normalizeRequest } from '@/lib/network/normalize-request';
import get200Fixture from '../fixtures/har/get-200.json';
import post201Fixture from '../fixtures/har/post-json-201.json';
import postFormDataFixture from '../fixtures/har/post-formdata.json';
import postBinaryFixture from '../fixtures/har/post-binary-no-body.json';
import responseBase64Fixture from '../fixtures/har/response-base64.json';
import type { HarEntry } from '@/types/network';

describe('normalizeRequest', () => {
  it('correctly parses GET request and query params', () => {
    const record = normalizeRequest(get200Fixture as unknown as HarEntry);

    expect(record.method).toBe('GET');
    expect(record.url).toBe('https://api.example.com/v1/users?page=1&limit=20');
    expect(record.origin).toBe('https://api.example.com');
    expect(record.path).toBe('/v1/users');
    expect(record.query.page).toBe('1');
    expect(record.query.limit).toBe('20');
    expect(record.status).toBe(200);
    expect(record.duration).toBe(143);
    expect(record.timings?.wait).toBe(85.3);
    expect(record.isXhrOrFetch).toBe(true);
    expect(record.responseBody?.captured).toBe(true);
    expect(record.responseBody?.text).toContain('Alice');
  });

  it('correctly parses POST with JSON body and Set-Cookie header', () => {
    const record = normalizeRequest(post201Fixture as unknown as HarEntry);

    expect(record.method).toBe('POST');
    expect(record.status).toBe(201);
    expect(record.requestBody?.captured).toBe(true);
    expect(record.requestBody?.text).toContain('lion_dev');
    expect(record.responseHeaders['set-cookie']).toBeDefined();
  });

  it('correctly reconstructs urlencoded postData.params', () => {
    const record = normalizeRequest(postFormDataFixture as unknown as HarEntry);

    expect(record.method).toBe('POST');
    expect(record.requestBody?.captured).toBe(true);
    expect(record.requestBody?.text).toContain('grant_type=password');
    expect(record.requestBody?.text).toContain('client_secret=top_secret_key');
  });

  it('marks binary / uncaptured request body with captured: false', () => {
    const record = normalizeRequest(postBinaryFixture as unknown as HarEntry);

    expect(record.method).toBe('POST');
    expect(record.requestBody?.captured).toBe(false);
    expect(record.requestBody?.text).toBeUndefined();
  });

  it('detects base64 encoding for binary response', () => {
    const record = normalizeRequest(responseBase64Fixture as unknown as HarEntry);

    expect(record.responseBody?.encoding).toBe('base64');
    expect(record.responseBody?.captured).toBe(true);
    expect(record.responseBody?.size).toBe(68);
  });

  it('truncates oversized response text above maxResponseSize', () => {
    const giantText = 'a'.repeat(2000);
    const entry = {
      ...get200Fixture,
      response: {
        ...get200Fixture.response,
        content: {
          size: 2000,
          text: giantText,
        },
      },
    };

    const record = normalizeRequest(entry as unknown as HarEntry, { maxResponseSize: 500 });
    expect(record.responseBody?.isTruncated).toBe(true);
    expect(record.responseBody?.text?.length).toBe(500);
  });
});
