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
 * High-confidence patterns for secrets that appear as VALUES (not keys).
 * Conservative by design: only masks values that are almost certainly
 * credentials, to avoid corrupting legitimate data. This complements the
 * key-based redaction — e.g. `{"data": "<JWT>"}` where the key is innocuous.
 */
const VALUE_SECRET_PATTERNS: RegExp[] = [
  // JWT: three base64url segments separated by dots
  /\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/,
  // Bearer/Basic/Token scheme followed by a credential
  /\b(?:Bearer|Basic|Token)\s+[A-Za-z0-9._~+/=-]{8,}/i,
  // Common provider key prefixes (Stripe, GitHub, OpenAI, Google, Slack, AWS)
  /\b(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{8,}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\bsk-[A-Za-z0-9]{20,}\b/,
  /\bAIza[0-9A-Za-z_-]{20,}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/,
  /\bAKIA[0-9A-Z]{12,}\b/,
];

/**
 * Returns true if a string value looks like a credential by shape alone.
 */
export function looksLikeSecretValue(value: string): boolean {
  if (typeof value !== 'string' || value.length < 8) return false;
  return VALUE_SECRET_PATTERNS.some((re) => re.test(value));
}

/**
 * Masks any secret-shaped substrings inside a free-form string, preserving
 * the surrounding non-sensitive text. Returns the original string if nothing
 * matched.
 */
export function maskSecretsInText(value: string): { text: string; matched: boolean } {
  if (typeof value !== 'string' || !value) return { text: value, matched: false };
  let matched = false;
  let out = value;
  for (const re of VALUE_SECRET_PATTERNS) {
    out = out.replace(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'), (m) => {
      matched = true;
      // Preserve a leading scheme word (Bearer/Basic/Token) if present.
      const scheme = m.match(/^(Bearer|Basic|Token)\s+/i);
      return scheme ? `${scheme[0]}${MASK_VALUE}` : MASK_VALUE;
    });
  }
  return { text: out, matched };
}

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
  // A secret header may carry multiple comma-joined values (the normalizer
  // merges duplicate headers, e.g. multiple Set-Cookie). Mask EACH segment so
  // no part can leak, while keeping the value count intact.
  const segments = value.split(/,\s*/);
  if (segments.length > 1) {
    return segments.map((seg) => redactHeaderValue(_key, seg)).join(', ');
  }
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
      } else if (typeof v === 'string' && looksLikeSecretValue(v)) {
        // Defense-in-depth: the key is innocuous but the VALUE is a credential
        // by shape (JWT, provider key, etc.). Mask the secret-shaped part.
        const { text: maskedVal } = maskSecretsInText(v);
        output[k] = maskedVal;
        foundKeys.add(k);
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

  // Try Form URL-Encoded (e.g. grant_type=password&client_secret=xyz)
  if (trimmed.includes('=') && !trimmed.includes('\n')) {
    try {
      const params = new URLSearchParams(text);
      const entries = Array.from(params.entries());
      const hasFormParam = entries.length > 0;

      if (hasFormParam) {
        for (const [key, val] of entries) {
          if (isSecretKey(key, customKeys)) {
            // Secret by key name.
            params.set(key, MASK_VALUE);
            foundKeys.add(key);
          } else if (looksLikeSecretValue(val)) {
            // Defense-in-depth: secret by value shape under an innocuous key.
            const { text: maskedVal } = maskSecretsInText(val);
            params.set(key, maskedVal);
            foundKeys.add(key);
          }
        }
        // Always return the parsed+reserialized form when it IS form data.
        // Not gated on a fragile "modified" flag: if nothing was secret the
        // output is equivalent, and the path stays robust to future edits.
        return {
          text: params.toString(),
          foundKeys,
        };
      }
    } catch {
      // Ignore
    }
  }

  // Fallback: free-form text (logs, XML, plain bodies). Mask any secret-shaped
  // substrings so credentials embedded in non-JSON/non-form bodies don't leak.
  const { text: maskedText, matched } = maskSecretsInText(text);
  if (matched) {
    // Surface a friendly marker in the protected-fields list without inventing
    // a fake header/JSON key name.
    foundKeys.add('(embedded token)');
    return { text: maskedText, foundKeys };
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
