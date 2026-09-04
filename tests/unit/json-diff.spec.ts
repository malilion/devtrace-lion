import { describe, it, expect } from 'vitest';
import { computeJsonDiff } from '@/lib/diff/json-diff';

describe('computeJsonDiff', () => {
  it('correctly calculates added, removed, and changed properties', () => {
    const jsonA = JSON.stringify({
      id: 101,
      status: 'pending',
      items: ['apple'],
    });

    const jsonB = JSON.stringify({
      id: 101,
      status: 'completed',
      items: ['apple', 'orange'],
      extraField: true,
    });

    const diff = computeJsonDiff(jsonA, jsonB);
    expect(diff.isJson).toBe(true);
    expect(diff.summary.changed).toBe(1); // status: pending -> completed
    expect(diff.summary.added).toBe(2); // items.1 (orange) and extraField
    expect(diff.summary.removed).toBe(0);
    expect(diff.formattedDiffText).toContain('+ [extraField]: true');
    expect(diff.formattedDiffText).toContain('~ [status]:');
  });

  it('handles identical JSON gracefully', () => {
    const json = JSON.stringify({ status: 'ok', count: 5 });
    const diff = computeJsonDiff(json, json);

    expect(diff.isJson).toBe(true);
    expect(diff.summary.added).toBe(0);
    expect(diff.summary.removed).toBe(0);
    expect(diff.summary.changed).toBe(0);
    expect(diff.formattedDiffText).toContain('No differences found');
  });

  it('rejects invalid JSON with helpful message', () => {
    const diff = computeJsonDiff('<html>502 Bad Gateway</html>', '{"status":"ok"}');
    expect(diff.isJson).toBe(false);
    expect(diff.errorMessage).toContain('Base response is not valid JSON');
  });

  it('handles empty input gracefully', () => {
    const diff = computeJsonDiff('', '');
    expect(diff.isJson).toBe(false);
    expect(diff.errorMessage).toContain('missing content');
  });
});
