import { describe, it, expect } from 'vitest';
import { redactSecrets, isSecretKey, MASK_VALUE, redactHeaderValue, redactBodyText, looksLikeSecretValue } from '@/lib/security/redact-secrets';
import { normalizeRequest } from '@/lib/network/normalize-request';
import get401Fixture from '../fixtures/har/get-401-with-bearer.json';
import post201Fixture from '../fixtures/har/post-json-201.json';
import postFormDataFixture from '../fixtures/har/post-formdata.json';
import type { HarEntry } from '@/types/network';

describe('redactSecrets', () => {
  it('identifies default secret keys regardless of case', () => {
    expect(isSecretKey('Authorization')).toBe(true);
    expect(isSecretKey('cookie')).toBe(true);
    expect(isSecretKey('X-Api-Key')).toBe(true);
    expect(isSecretKey('password')).toBe(true);
    expect(isSecretKey('content-type')).toBe(false);
  });

  it('redacts Authorization header preserving Bearer scheme', () => {
    const rawRecord = normalizeRequest(get401Fixture as unknown as HarEntry);
    expect(rawRecord.requestHeaders['authorization']).toContain('sensitive_payload');

    const { record, rawUnredacted } = redactSecrets(rawRecord);

    expect(record.requestHeaders['authorization']).toBe(`Bearer ${MASK_VALUE}`);
    expect(record.redactedKeys).toContain('authorization');

    // Verify raw is preserved separately in isolated structure for local view
    expect(rawUnredacted?.requestHeaders['authorization']).toContain('sensitive_payload');
  });

  it('redacts Set-Cookie header and JSON body secrets in POST request', () => {
    const rawRecord = normalizeRequest(post201Fixture as unknown as HarEntry);
    const { record } = redactSecrets(rawRecord);

    // Header redaction
    expect(record.responseHeaders['set-cookie']).toBe(MASK_VALUE);

    // Request body password redaction
    const reqBodyJson = JSON.parse(record.requestBody?.text || '{}');
    expect(reqBodyJson.password).toBe(MASK_VALUE);
    expect(reqBodyJson.username).toBe('lion_dev');

    // Response body token redactions
    const resBodyJson = JSON.parse(record.responseBody?.text || '{}');
    expect(resBodyJson.token).toBe(MASK_VALUE);
    expect(resBodyJson.access_token).toBe(MASK_VALUE);
    expect(resBodyJson.id).toBe('u_99');

    expect(record.redactedKeys).toContain('password');
    expect(record.redactedKeys).toContain('token');
    expect(record.redactedKeys).toContain('access_token');
    expect(record.redactedKeys).toContain('set-cookie');
  });

  it('redacts sensitive parameters in urlencoded form body', () => {
    const rawRecord = normalizeRequest(postFormDataFixture as unknown as HarEntry);
    const { record } = redactSecrets(rawRecord);

    expect(record.requestBody?.text).toBeDefined();
    expect(record.requestBody?.text).toContain(`client_secret=${encodeURIComponent(MASK_VALUE)}`);
    expect(record.requestBody?.text).not.toContain('top_secret_key');
    expect(record.redactedKeys).toContain('client_secret');
  });

  it('supports custom user-defined redaction keys', () => {
    const rawRecord = normalizeRequest(get401Fixture as unknown as HarEntry);
    rawRecord.requestHeaders['my-custom-internal-token'] = 'internal_xyz_999';

    const { record } = redactSecrets(rawRecord, ['my-custom-internal-token']);
    expect(record.requestHeaders['my-custom-internal-token']).toBe(MASK_VALUE);
    expect(record.redactedKeys).toContain('my-custom-internal-token');
  });

  it('redacts sensitive query parameters in URL and query object', () => {
    const rawRecord = normalizeRequest({
      startedDateTime: '2026-03-31T08:00:00.000Z',
      time: 50,
      request: {
        method: 'GET',
        url: 'https://api.example.com/v1/data?token=secret_query_val_123&page=2&apiKey=my_super_api_key',
        httpVersion: 'HTTP/1.1',
        headers: [],
        queryString: [
          { name: 'token', value: 'secret_query_val_123' },
          { name: 'page', value: '2' },
          { name: 'apiKey', value: 'my_super_api_key' },
        ],
        cookies: [],
        headersSize: 100,
        bodySize: 0,
      },
      response: {
        status: 200,
        statusText: 'OK',
        httpVersion: 'HTTP/1.1',
        headers: [],
        cookies: [],
        content: { size: 0, mimeType: 'application/json' },
        redirectURL: '',
        headersSize: 50,
        bodySize: 0,
      },
      cache: {},
      timings: { send: 1, wait: 40, receive: 9 },
    } as unknown as HarEntry);

    const { record, rawUnredacted } = redactSecrets(rawRecord);

    // Verify query object redaction
    expect(record.query.token).toBe(MASK_VALUE);
    expect(record.query.apiKey).toBe(MASK_VALUE);
    expect(record.query.page).toBe('2');

    // Verify URL redaction
    expect(record.url).toContain(`token=${encodeURIComponent(MASK_VALUE)}`);
    expect(record.url).toContain(`apiKey=${encodeURIComponent(MASK_VALUE)}`);
    expect(record.url).toContain('page=2');
    expect(record.url).not.toContain('secret_query_val_123');
    expect(record.url).not.toContain('my_super_api_key');

    // Verify raw unredacted copy preserved
    expect(rawUnredacted?.query.token).toBe('secret_query_val_123');
    expect(rawUnredacted?.url).toContain('secret_query_val_123');

    // Verify redactedKeys tracking
    expect(record.redactedKeys).toContain('token');
    expect(record.redactedKeys).toContain('apiKey');
  });
});

describe('redactSecrets — medium-risk hardening', () => {
  // #2: multi-value (comma-joined) secret headers must be fully masked per segment
  it('masks every segment of a comma-joined secret header', () => {
    const out = redactHeaderValue('set-cookie', 'sid=abc123, token=def456');
    expect(out).not.toContain('abc123');
    expect(out).not.toContain('def456');
    // Two segments preserved as two masked values
    expect(out.split(',').length).toBe(2);
    expect(out).toContain(MASK_VALUE);
  });

  it('masks a comma-joined Bearer/Token header keeping scheme prefixes', () => {
    const out = redactHeaderValue('authorization', 'Bearer aaaaaaaa, Token bbbbbbbb');
    expect(out).toContain(`Bearer ${MASK_VALUE}`);
    expect(out).toContain(`Token ${MASK_VALUE}`);
    expect(out).not.toContain('aaaaaaaa');
    expect(out).not.toContain('bbbbbbbb');
  });

  // #3: form redaction is robust and not gated on a fragile "modified" flag
  it('redacts secret keys in urlencoded form regardless of ordering', () => {
    const { text, foundKeys } = redactBodyText('username=bob&password=hunter2&remember=1');
    expect(text).toContain(`password=${encodeURIComponent(MASK_VALUE)}`);
    expect(text).toContain('username=bob');
    expect(text).toContain('remember=1');
    expect(text).not.toContain('hunter2');
    expect(foundKeys.has('password')).toBe(true);
  });

  it('returns form data unchanged (but round-tripped) when nothing is secret', () => {
    const { text, foundKeys } = redactBodyText('a=1&b=2');
    // No secrets found
    expect(Array.from(foundKeys).filter((k) => k !== '(embedded token)')).toHaveLength(0);
    // Values preserved
    const parsed = new URLSearchParams(text);
    expect(parsed.get('a')).toBe('1');
    expect(parsed.get('b')).toBe('2');
  });

  // #4: value-based detection — secrets under innocuous keys
  it('detects secret-shaped values by pattern', () => {
    expect(looksLikeSecretValue('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abcDEF123_-')).toBe(true);
    expect(looksLikeSecretValue('sk_live_abcdefgh12345678')).toBe(true);
    expect(looksLikeSecretValue('ghp_0123456789abcdefghijklmnopqrstuvwx')).toBe(true);
    expect(looksLikeSecretValue('hello world')).toBe(false);
    expect(looksLikeSecretValue('u_99')).toBe(false);
  });

  it('masks a JWT stored under an innocuous JSON key', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9.s3cr3t_Signature_val';
    const body = JSON.stringify({ note: 'ok', data: jwt, count: 3 });
    const { text } = redactBodyText(body);
    expect(text).toBeDefined();
    const parsed = JSON.parse(text as string);
    expect(parsed.data).not.toContain('s3cr3t_Signature_val');
    expect(parsed.data).toContain(MASK_VALUE);
    // Non-secret siblings untouched
    expect(parsed.note).toBe('ok');
    expect(parsed.count).toBe(3);
  });

  it('masks a provider key embedded in a free-form (non-JSON, non-form) body', () => {
    const body = 'Debug log: calling API with key sk_live_ABCDEFGH12345678 done.';
    const { text, foundKeys } = redactBodyText(body);
    expect(text).not.toContain('sk_live_ABCDEFGH12345678');
    expect(text).toContain(MASK_VALUE);
    expect(foundKeys.has('(embedded token)')).toBe(true);
  });

  it('leaves ordinary free-form text unchanged', () => {
    const body = 'This is just a plain log line with no credentials.';
    const { text, foundKeys } = redactBodyText(body);
    expect(text).toBe(body);
    expect(foundKeys.size).toBe(0);
  });
});
