import type { NetworkRecord } from '@/types/network';

/**
 * Generates a clean, copy-pasteable cURL command from a NetworkRecord.
 * Automatically handles headers, method, and payload.
 */
export function toCurl(record: NetworkRecord): string {
  const parts: string[] = [];

  parts.push(`curl '${record.url}'`);

  if (record.method && record.method.toUpperCase() !== 'GET') {
    parts.push(`  -X ${record.method.toUpperCase()}`);
  }

  // Add Headers (exclude pseudo headers)
  const ignoredHeaders = new Set([':method', ':path', ':authority', ':scheme']);
  for (const [key, value] of Object.entries(record.requestHeaders)) {
    if (!ignoredHeaders.has(key.toLowerCase())) {
      // Escape single quotes in header values
      const escapedVal = value.replace(/'/g, "'\\''");
      parts.push(`  -H '${key}: ${escapedVal}'`);
    }
  }

  // Add Request Body if present and captured
  if (record.requestBody?.captured && record.requestBody.text) {
    const escapedBody = record.requestBody.text.replace(/'/g, "'\\''");
    parts.push(`  --data-raw '${escapedBody}'`);
  }

  return parts.join(' \\\n');
}
