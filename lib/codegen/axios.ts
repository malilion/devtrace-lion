import type { NetworkRecord } from '@/types/network';

/**
 * Generates an Axios request snippet.
 */
export function toAxios(record: NetworkRecord): string {
  const method = (record.method || 'GET').toLowerCase();
  const headers: Record<string, string> = {};

  for (const [k, v] of Object.entries(record.requestHeaders)) {
    if (!k.startsWith(':')) {
      headers[k] = v;
    }
  }

  const hasHeaders = Object.keys(headers).length > 0;
  const hasBody = record.requestBody?.captured && !!record.requestBody.text;

  let bodyArg = 'null';
  if (hasBody && record.requestBody?.text) {
    try {
      const parsed = JSON.parse(record.requestBody.text);
      bodyArg = JSON.stringify(parsed, null, 2);
    } catch {
      bodyArg = JSON.stringify(record.requestBody.text);
    }
  }

  const configObj: Record<string, unknown> = {};
  if (hasHeaders) {
    configObj.headers = headers;
  }

  const configString = Object.keys(configObj).length > 0
    ? JSON.stringify(configObj, null, 2)
    : '';

  if (['get', 'delete', 'head', 'options'].includes(method)) {
    if (configString) {
      return `import axios from 'axios';\n\nconst response = await axios.${method}('${record.url}', ${configString});\nconsole.log(response.data);`;
    }
    return `import axios from 'axios';\n\nconst response = await axios.${method}('${record.url}');\nconsole.log(response.data);`;
  }

  // post, put, patch
  if (configString) {
    return `import axios from 'axios';\n\nconst response = await axios.${method}(\n  '${record.url}',\n  ${bodyArg},\n  ${configString}\n);\nconsole.log(response.data);`;
  }

  return `import axios from 'axios';\n\nconst response = await axios.${method}(\n  '${record.url}',\n  ${bodyArg}\n);\nconsole.log(response.data);`;
}
