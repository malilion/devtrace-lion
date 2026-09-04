import type { NetworkRecord } from '@/types/network';

/**
 * Generates modern JavaScript / TypeScript fetch snippet.
 */
export function toFetch(record: NetworkRecord): string {
  const method = (record.method || 'GET').toUpperCase();
  const options: Record<string, unknown> = {
    method,
  };

  // Filter pseudo headers
  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(record.requestHeaders)) {
    if (!k.startsWith(':')) {
      headers[k] = v;
    }
  }

  if (Object.keys(headers).length > 0) {
    options.headers = headers;
  }

  // Handle body
  if (record.requestBody?.captured && record.requestBody.text) {
    const isJson = (record.requestBody.mimeType || headers['content-type'] || '').includes('json');
    if (isJson) {
      try {
        // If it's valid JSON, format as JSON.stringify object
        const parsed = JSON.parse(record.requestBody.text);
        options.body = `JSON.stringify(${JSON.stringify(parsed, null, 2)})`;
      } catch {
        options.body = JSON.stringify(record.requestBody.text);
      }
    } else {
      options.body = JSON.stringify(record.requestBody.text);
    }
  }

  // Format fetch call code
  let optionsString = '';
  if (Object.keys(options).length > 0) {
    // Custom serializer to handle JSON.stringify(...) without extra string quotes around it
    const bodyReplacementKey = '___BODY_REPLACEMENT___';
    let bodyRaw: string | undefined;

    if (options.body && typeof options.body === 'string' && options.body.startsWith('JSON.stringify(')) {
      bodyRaw = options.body;
      options.body = bodyReplacementKey;
    }

    let json = JSON.stringify(options, null, 2);
    if (bodyRaw) {
      json = json.replace(`"${bodyReplacementKey}"`, bodyRaw.split('\n').map((line, idx) => idx === 0 ? line : `  ${line}`).join('\n'));
    }
    optionsString = `, ${json}`;
  }

  return `const response = await fetch('${record.url}'${optionsString});\nconst data = await response.json();\nconsole.log(data);`;
}
