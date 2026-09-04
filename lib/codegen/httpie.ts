import type { NetworkRecord } from '@/types/network';

/**
 * Generates modern HTTPie CLI snippet.
 */
export function toHttpie(record: NetworkRecord): string {
  const method = (record.method || 'GET').toUpperCase();
  const parts: string[] = [`http ${method} '${record.url}'`];

  // Headers (HTTPie uses Name:Value format)
  for (const [k, v] of Object.entries(record.requestHeaders)) {
    if (!k.startsWith(':') && k.toLowerCase() !== 'content-length') {
      const escapedV = v.replace(/'/g, "'\\''");
      parts.push(`'${k}:${escapedV}'`);
    }
  }

  // Handle JSON body
  if (record.requestBody?.captured && record.requestBody.text) {
    try {
      const parsed = JSON.parse(record.requestBody.text);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        for (const [key, val] of Object.entries(parsed)) {
          if (typeof val === 'string') {
            parts.push(`${key}='${val.replace(/'/g, "'\\''")}'`);
          } else {
            parts.push(`${key}:=${JSON.stringify(val)}`);
          }
        }
      } else {
        parts.push(`<<< '${record.requestBody.text.replace(/'/g, "'\\''")}'`);
      }
    } catch {
      parts.push(`<<< '${record.requestBody.text.replace(/'/g, "'\\''")}'`);
    }
  }

  return parts.join(' \\\n  ');
}
