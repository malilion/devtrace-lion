import { describe, it, expect } from 'vitest';
import { createSanitizedDebugBundle } from '@/lib/har/export-bundle';
import { importHarContent } from '@/lib/har/import-har';
import { normalizeRequest } from '@/lib/network/normalize-request';
import get401Fixture from '../fixtures/har/get-401-with-bearer.json';
import post201Fixture from '../fixtures/har/post-json-201.json';
import type { HarEntry } from '@/types/network';

describe('Sanitized Debug Bundle and HAR Import', () => {
  const rec1 = normalizeRequest(get401Fixture as unknown as HarEntry);
  const rec2 = normalizeRequest(post201Fixture as unknown as HarEntry);

  it('creates sanitized debug bundle with privacy manifest and redacts all secrets', () => {
    const bundle = createSanitizedDebugBundle([rec1, rec2]);

    expect(bundle.manifest.tool).toBe('DevTrace Lion');
    expect(bundle.manifest.recordCount).toBe(2);
    expect(bundle.manifest.allRedactedKeys).toContain('authorization');
    expect(bundle.manifest.allRedactedKeys).toContain('password');

    // Confirm that inside records, secrets are masked
    const authedRec = bundle.records.find((r) => r.url.includes('/profile/me'));
    expect(authedRec?.requestHeaders['authorization']).toContain('•••••••••••');
    expect(authedRec?.requestHeaders['authorization']).not.toContain('sensitive_payload');
  });

  it('imports raw HAR file and redacts sensitive data upon loading', () => {
    const harJson = JSON.stringify({
      log: {
        entries: [get401Fixture, post201Fixture],
      },
    });

    const result = importHarContent(harJson);
    expect(result.success).toBe(true);
    expect(result.records.length).toBe(2);

    const first = result.records[0];
    expect(first.requestHeaders['authorization']).toContain('•••••••••••');
    expect(first.redactedKeys).toContain('authorization');
  });

  it('imports existing debug bundle successfully', () => {
    const bundle = createSanitizedDebugBundle([rec1]);
    const jsonText = JSON.stringify(bundle);

    const result = importHarContent(jsonText);
    expect(result.success).toBe(true);
    expect(result.records.length).toBe(1);
    expect(result.records[0].path).toBe('/v1/profile/me');
  });

  it('rejects invalid JSON with helpful error message', () => {
    const result = importHarContent('{ not valid json }');
    expect(result.success).toBe(false);
    expect(result.records).toHaveLength(0);
    expect(result.error).toBeDefined();
  });
});
