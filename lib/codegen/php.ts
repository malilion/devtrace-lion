import type { NetworkRecord } from '@/types/network';

/**
 * Generates idiomatic PHP cURL snippet.
 */
export function toPhp(record: NetworkRecord): string {
  const method = (record.method || 'GET').toUpperCase();
  const url = record.url;
  const lines: string[] = ['<?php', '', '$curl = curl_init();', ''];

  const curlOptions: string[] = [
    `    CURLOPT_URL => "${url}",`,
    '    CURLOPT_RETURNTRANSFER => true,',
    '    CURLOPT_ENCODING => "",',
    '    CURLOPT_MAXREDIRS => 10,',
    '    CURLOPT_TIMEOUT => 30,',
    '    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,',
    `    CURLOPT_CUSTOMREQUEST => "${method}",`,
  ];

  // Headers
  const headerList: string[] = [];
  for (const [k, v] of Object.entries(record.requestHeaders)) {
    if (!k.startsWith(':')) {
      const escapedV = v.replace(/"/g, '\\"');
      headerList.push(`        "${k}: ${escapedV}",`);
    }
  }

  if (headerList.length > 0) {
    curlOptions.push('    CURLOPT_HTTPHEADER => [');
    curlOptions.push(...headerList);
    curlOptions.push('    ],');
  }

  // Body
  if (record.requestBody?.captured && record.requestBody.text) {
    const escaped = record.requestBody.text.replace(/"/g, '\\"');
    curlOptions.push(`    CURLOPT_POSTFIELDS => "${escaped}",`);
  }

  lines.push('curl_setopt_array($curl, [');
  lines.push(...curlOptions);
  lines.push(']);');
  lines.push('');
  lines.push('$response = curl_exec($curl);');
  lines.push('$err = curl_error($curl);');
  lines.push('curl_close($curl);');
  lines.push('');
  lines.push('if ($err) {');
  lines.push('    echo "cURL Error #:" . $err;');
  lines.push('} else {');
  lines.push('    echo $response;');
  lines.push('}');

  return lines.join('\n');
}
