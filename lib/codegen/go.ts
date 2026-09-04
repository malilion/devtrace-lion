import type { NetworkRecord } from '@/types/network';

/**
 * Generates idiomatic Go net/http snippet.
 */
export function toGo(record: NetworkRecord): string {
  const method = (record.method || 'GET').toUpperCase();
  const url = record.url;
  const hasBody = record.requestBody?.captured && !!record.requestBody.text;

  const lines: string[] = [
    'package main',
    '',
    'import (',
    '    "fmt"',
    '    "io"',
    '    "net/http"',
  ];

  if (hasBody) {
    lines.push('    "strings"');
  }

  lines.push(')', '', 'func main() {');
  lines.push('    client := &http.Client{}');

  if (hasBody && record.requestBody?.text) {
    const escaped = record.requestBody.text.replace(/`/g, '` + "`" + `');
    lines.push(`    payload := strings.NewReader(\`${escaped}\`)`);
    lines.push(`    req, err := http.NewRequest("${method}", "${url}", payload)`);
  } else {
    lines.push(`    req, err := http.NewRequest("${method}", "${url}", nil)`);
  }

  lines.push('    if err != nil {');
  lines.push('        panic(err)');
  lines.push('    }');

  // Headers
  for (const [k, v] of Object.entries(record.requestHeaders)) {
    if (!k.startsWith(':')) {
      const escapedV = v.replace(/"/g, '\\"');
      lines.push(`    req.Header.Set("${k}", "${escapedV}")`);
    }
  }

  lines.push('');
  lines.push('    resp, err := client.Do(req)');
  lines.push('    if err != nil {');
  lines.push('        panic(err)');
  lines.push('    }');
  lines.push('    defer resp.Body.Close()');
  lines.push('');
  lines.push('    bodyText, err := io.ReadAll(resp.Body)');
  lines.push('    if err != nil {');
  lines.push('        panic(err)');
  lines.push('    }');
  lines.push('    fmt.Println(string(bodyText))');
  lines.push('}');

  return lines.join('\n');
}
