import type { NetworkRecord } from '@/types/network';

/**
 * Generates idiomatic Python requests snippet.
 */
export function toPython(record: NetworkRecord): string {
  const method = (record.method || 'GET').toLowerCase();
  const url = record.url;
  const lines: string[] = ['import requests', ''];

  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(record.requestHeaders)) {
    if (!k.startsWith(':')) {
      headers[k] = v;
    }
  }

  const hasHeaders = Object.keys(headers).length > 0;
  if (hasHeaders) {
    lines.push(`headers = ${JSON.stringify(headers, null, 4)}`);
  }

  const hasBody = record.requestBody?.captured && !!record.requestBody.text;
  let bodyParam = '';

  if (hasBody && record.requestBody?.text) {
    const isJson = (record.requestBody.mimeType || headers['content-type'] || '').includes('json');
    if (isJson) {
      try {
        const parsed = JSON.parse(record.requestBody.text);
        lines.push(`payload = ${JSON.stringify(parsed, null, 4)}`);
        bodyParam = ', json=payload';
      } catch {
        lines.push(`data = ${JSON.stringify(record.requestBody.text)}`);
        bodyParam = ', data=data';
      }
    } else {
      lines.push(`data = ${JSON.stringify(record.requestBody.text)}`);
      bodyParam = ', data=data';
    }
  }

  const headerParam = hasHeaders ? ', headers=headers' : '';
  lines.push('');
  lines.push(`response = requests.${method}("${url}"${headerParam}${bodyParam})`);
  lines.push('print(response.status_code)');
  lines.push('print(response.text)');

  return lines.join('\n');
}
