import type { NetworkRecord } from '@/types/network';

/**
 * Generates modern C# HttpClient snippet.
 */
export function toCSharp(record: NetworkRecord): string {
  const method = (record.method || 'GET').toUpperCase();
  const url = record.url;
  const lines: string[] = [
    'using System;',
    'using System.Net.Http;',
    'using System.Text;',
    'using System.Threading.Tasks;',
    '',
    'using var client = new HttpClient();',
  ];

  const headers = Object.entries(record.requestHeaders).filter(([k]) => !k.startsWith(':') && k.toLowerCase() !== 'content-type');
  const contentType = record.requestHeaders['content-type'] || 'application/json';
  const hasBody = record.requestBody?.captured && !!record.requestBody.text;

  // Simple GET with no custom headers
  if (method === 'GET' && headers.length === 0) {
    lines.push(`var response = await client.GetAsync("${url}");`);
    lines.push('var body = await response.Content.ReadAsStringAsync();');
    lines.push('Console.WriteLine(body);');
    return lines.join('\n');
  }

  // HttpRequestMessage pattern for full control
  lines.push(`using var request = new HttpRequestMessage(new HttpMethod("${method}"), "${url}");`);

  for (const [k, v] of headers) {
    const escapedV = v.replace(/"/g, '\\"');
    lines.push(`request.Headers.TryAddWithoutValidation("${k}", "${escapedV}");`);
  }

  if (hasBody && record.requestBody?.text) {
    const escapedBody = record.requestBody.text.replace(/"/g, '""');
    lines.push(`request.Content = new StringContent(@"${escapedBody}", Encoding.UTF8, "${contentType}");`);
  }

  lines.push('var response = await client.SendAsync(request);');
  lines.push('var body = await response.Content.ReadAsStringAsync();');
  lines.push('Console.WriteLine(body);');

  return lines.join('\n');
}
