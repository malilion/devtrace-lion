import type { NetworkRecord } from '@/types/network';

export const DEFAULT_SECRET_KEYS: string[] = [
  'authorization',
  'proxy-authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'api-key',
  'apikey',
  'x-auth-token',
  'token',
  'access_token',
  'refresh_token',
  'id_token',
  'password',
  'passwd',
  'secret',
  'client_secret',
  'private_key',
  'session',
  'sessionid',
];

export const MASK_VALUE = '•••••••••••';

/**
 * Checks if a key matches any pattern in the secrets list (case-insensitive).
 */
export function isSecretKey(key: string, customKeys: string[] = []): boolean {
  const normalized = key.trim().toLowerCase();
  const allKeys = [...DEFAULT_SECRET_KEYS, ...customKeys.map((k) => k.toLowerCase())];
  return allKeys.includes(normalized);
}

/**
 * Redacts a secret header value.
 * Preserves scheme prefix if Bearer / Basic / Digest / Token is used.
 */
export function redactHeaderValue(_key: string, value: string): string {
  if (!value) return value;
  const match = value.match(/^((?:Bearer|Basic|Digest|Token)\s+)(.+)$/i);
  if (match) {
    return `${match[1]}${MASK_VALUE}`;
  }
  return MASK_VALUE;
}

/**
 * Recursively walks a JSON structure and masks sensitive fields.
 * Returns { result, foundKeys }
 */
export function redactJsonValue(
  value: unknown,
  customKeys: string[] = []
): { result: unknown; foundKeys: Set<string> } {
  const foundKeys = new Set<string>();

  function walk(val: unknown): unknown {
    if (val === null || typeof val !== 'object') {
      return val;
    }

    if (Array.isArray(val)) {
      return val.map((item) => walk(item));
    }

    const obj = val as Record<string, unknown>;
    const output: Record<string, unknown> = {};

    for (const [k, v] of Object.entries(obj)) {
      if (isSecretKey(k, customKeys)) {
        foundKeys.add(k);
        if (typeof v === 'string') {
          output[k] = redactHeaderValue(k, v);
        } else {
          output[k] = MASK_VALUE;
        }
      } else {
        output[k] = walk(v);
      }
    }

    return output;
  }

  const result = walk(value);
  return { result, foundKeys };
}

/**
 * Attempts to parse text as JSON, redacts any secret keys, and stringifies it back.
 * If text is URL-encoded form data (e.g. access_token=xyz&name=bob), redacts params.
 * Otherwise returns original text if not parseable.
 */
export function redactBodyText(
  text: string | undefined,
  customKeys: string[] = []
): { text: string | undefined; foundKeys: Set<string> } {
  const foundKeys = new Set<string>();
  if (!text || typeof text !== 'string') {
    return { text, foundKeys };
  }

  const trimmed = text.trim();

  // Try JSON
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      const parsed = JSON.parse(text);
      const { result, foundKeys: jsonKeys } = redactJsonValue(parsed, customKeys);
      jsonKeys.forEach((k) => foundKeys.add(k));
      return {
        text: JSON.stringify(result, null, 2),
        foundKeys,
      };
    } catch {
      // Fall through if invalid JSON
    }
  }

  // Try Form URL-Encoded (e.g. grant_type=password&client_secret=123)
  if (trimmed.includes('=') && !trimmed.includes('\n')) {
    try {
      const params = new URLSearchParams(text);
      let hasFormParam = false;
      let modified = false;

      for (const [key] of Array.from(params.entries())) {
        hasFormParam = true;
        if (isSecretKey(key, customKeys)) {
          params.set(key, MASK_VALUE);
          foundKeys.add(key);
          modified = true;
        }
      }

      if (hasFormParam && modified) {
        return {
          text: params.toString(),
          foundKeys,
        };
      }
    } catch {
      // Ignore
    }
  }

  return { text, foundKeys };
}

export interface RawUnredactedData {
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBodyText?: string;
  responseBodyText?: string;
  url: string;
  query: Record<string, string>;
}

export interface RedactResult {
  record: NetworkRecord;
  /** Preserved raw copy for "Reveal locally" in-memory view ONLY. Never exposed to copy/export */
  rawUnredacted?: RawUnredactedData;
}

/**
 * Sanitizes a NetworkRecord before it enters the store.
 * Redacts query params, request headers, response headers, request body, and response body.
 */
export function redactSecrets(
  record: NetworkRecord,
  customKeys: string[] = []
): RedactResult {
  const redactedKeys = new Set<string>();

  // Store raw copies in separate isolated structure
  const rawUnredacted: RawUnredactedData = {
    requestHeaders: { ...record.requestHeaders },
    responseHeaders: { ...record.responseHeaders },
    requestBodyText: record.requestBody?.text,
    responseBodyText: record.responseBody?.text,
    url: record.url,
    query: { ...record.query },
  };

  // Redact Query Parameters and URL
  let cleanUrl = record.url;
  const cleanQuery: Record<string, string> = {};
  let queryModified = false;

  for (const [param, val] of Object.entries(record.query)) {
    if (isSecretKey(param, customKeys)) {
      cleanQuery[param] = MASK_VALUE;
      redactedKeys.add(param);
      queryModified = true;
    } else {
      cleanQuery[param] = val;
    }
  }

  if (queryModified) {
    try {
      const u = new URL(record.url);
      for (const [k, v] of Object.entries(cleanQuery)) {
        u.searchParams.set(k, v);
      }
      cleanUrl = u.toString();
    } catch {
      // Keep original url if parsing fails
    }
  }

  // Redact Request Headers
  const cleanRequestHeaders: Record<string, string> = {};
  for (const [header, val] of Object.entries(record.requestHeaders)) {
    if (isSecretKey(header, customKeys)) {
      cleanRequestHeaders[header] = redactHeaderValue(header, val);
      redactedKeys.add(header);
    } else {
      cleanRequestHeaders[header] = val;
    }
  }

  // Redact Response Headers (e.g. Set-Cookie)
  const cleanResponseHeaders: Record<string, string> = {};
  for (const [header, val] of Object.entries(record.responseHeaders)) {
    if (isSecretKey(header, customKeys)) {
      cleanResponseHeaders[header] = redactHeaderValue(header, val);
      redactedKeys.add(header);
    } else {
      cleanResponseHeaders[header] = val;
    }
  }

  // Redact Request Body
  let cleanRequestBody = record.requestBody ? { ...record.requestBody } : undefined;
  if (cleanRequestBody?.text) {
    const { text: redactedReqText, foundKeys: reqBodyKeys } = redactBodyText(cleanRequestBody.text, customKeys);
    cleanRequestBody.text = redactedReqText;
    reqBodyKeys.forEach((k) => redactedKeys.add(k));
  }

  // Redact Response Body
  let cleanResponseBody = record.responseBody ? { ...record.responseBody } : undefined;
  if (cleanResponseBody?.text && !cleanResponseBody.encoding) {
    const { text: redactedResText, foundKeys: resBodyKeys } = redactBodyText(cleanResponseBody.text, customKeys);
    cleanResponseBody.text = redactedResText;
    resBodyKeys.forEach((k) => redactedKeys.add(k));
  }

  const redactedRecord: NetworkRecord = {
    ...record,
    url: cleanUrl,
    query: cleanQuery,
    requestHeaders: cleanRequestHeaders,
    responseHeaders: cleanResponseHeaders,
    requestBody: cleanRequestBody,
    responseBody: cleanResponseBody,
    redactedKeys: Array.from(redactedKeys),
  };

  return {
    record: redactedRecord,
    rawUnredacted,
  };
}
