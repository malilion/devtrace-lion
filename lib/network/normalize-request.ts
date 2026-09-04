import type { HarEntry, NetworkRecord, RequestBodyPayload, ResponseBodyPayload, TimingBreakdown } from '@/types/network';

export interface NormalizeOptions {
  maxResponseSize?: number;
  responseBodyContent?: {
    body: string;
    encoding?: string;
  };
}

let monotonicCounter = 0;

/**
 * Normalizes a HAR 1.2 entry into a clean, uniform NetworkRecord.
 * Handles missing fields, truncations, and URL parsing.
 */
export function normalizeRequest(
  entry: HarEntry,
  options: NormalizeOptions = {}
): NetworkRecord {
  const maxResponseSize = options.maxResponseSize ?? 1024 * 1024; // 1MB default
  monotonicCounter++;
  const id = `req_${Date.now()}_${monotonicCounter}_${Math.random().toString(36).slice(2, 7)}`;

  // Parse URL
  let origin = '';
  let path = '';
  const query: Record<string, string> = {};

  try {
    const parsedUrl = new URL(entry.request.url);
    origin = parsedUrl.origin;
    path = parsedUrl.pathname;
    parsedUrl.searchParams.forEach((val, key) => {
      query[key] = val;
    });
  } catch {
    // If URL parsing fails, extract best effort
    origin = '';
    path = entry.request.url;
  }

  // If HAR explicitly contains queryString array and query map was empty
  if (entry.request.queryString && Object.keys(query).length === 0) {
    for (const q of entry.request.queryString) {
      if (q.name) query[q.name] = q.value;
    }
  }

  // Parse Request Headers
  const requestHeaders: Record<string, string> = {};
  if (Array.isArray(entry.request.headers)) {
    for (const h of entry.request.headers) {
      if (h.name) {
        const key = h.name.toLowerCase();
        requestHeaders[key] = requestHeaders[key] ? `${requestHeaders[key]}, ${h.value}` : h.value;
      }
    }
  }

  // Parse Response Headers
  const responseHeaders: Record<string, string> = {};
  if (Array.isArray(entry.response.headers)) {
    for (const h of entry.response.headers) {
      if (h.name) {
        const key = h.name.toLowerCase();
        responseHeaders[key] = responseHeaders[key] ? `${responseHeaders[key]}, ${h.value}` : h.value;
      }
    }
  }

  // Parse Request Body
  let requestBody: RequestBodyPayload | undefined;
  const postData = entry.request.postData;
  const method = (entry.request.method || 'GET').toUpperCase();
  const hasPayloadMethod = ['POST', 'PUT', 'PATCH'].includes(method);

  if (postData) {
    if (typeof postData.text === 'string') {
      requestBody = {
        text: postData.text,
        mimeType: postData.mimeType,
        captured: true,
      };
    } else if (postData.params && postData.params.length > 0) {
      // Form-urlencoded reconstructed
      const paramsText = postData.params
        .map((p) => `${encodeURIComponent(p.name)}=${encodeURIComponent(p.value ?? '')}`)
        .join('&');
      requestBody = {
        text: paramsText,
        mimeType: postData.mimeType,
        captured: true,
      };
    } else {
      // postData exists but no text (streamed or binary without text)
      requestBody = {
        text: undefined,
        mimeType: postData.mimeType,
        captured: false,
      };
    }
  } else if (hasPayloadMethod) {
    // If it's a POST/PUT/PATCH with bodySize !== 0 or bodySize === -1, it was not captured
    requestBody = {
      text: undefined,
      mimeType: requestHeaders['content-type'],
      captured: false,
    };
  }

  // Parse Response Body
  let responseBody: ResponseBodyPayload | undefined;
  const content = entry.response.content;
  const passedContent = options.responseBodyContent;

  const rawText = passedContent?.body ?? content?.text;
  const rawEncoding = passedContent?.encoding ?? content?.encoding;
  const isBase64 = rawEncoding?.toLowerCase() === 'base64';

  if (rawText !== undefined && rawText !== null) {
    let text = rawText;
    let isTruncated = false;

    if (!isBase64 && text.length > maxResponseSize) {
      text = text.slice(0, maxResponseSize);
      isTruncated = true;
    }

    responseBody = {
      text,
      encoding: isBase64 ? 'base64' : undefined,
      size: content?.size ?? rawText.length,
      captured: true,
      isTruncated,
    };
  } else if (entry.response.bodySize !== undefined && entry.response.bodySize > 0) {
    // Content body was not captured by HAR or getContent
    responseBody = {
      captured: false,
      size: entry.response.bodySize,
    };
  } else {
    // Empty response or 204/304
    responseBody = {
      text: '',
      captured: true,
      size: 0,
    };
  }

  // Parse Timings safely checking undefined
  let timings: TimingBreakdown | undefined;
  if (entry.timings) {
    const t = entry.timings;
    timings = {
      blocked: t.blocked !== undefined && t.blocked >= 0 ? t.blocked : undefined,
      dns: t.dns !== undefined && t.dns >= 0 ? t.dns : undefined,
      connect: t.connect !== undefined && t.connect >= 0 ? t.connect : undefined,
      send: t.send !== undefined && t.send >= 0 ? t.send : undefined,
      wait: t.wait !== undefined && t.wait >= 0 ? t.wait : undefined,
      receive: t.receive !== undefined && t.receive >= 0 ? t.receive : undefined,
      ssl: t.ssl !== undefined && t.ssl >= 0 ? t.ssl : undefined,
    };
  }

  // Determine started timestamp
  let startedAt = Date.now();
  if (entry.startedDateTime) {
    const t = new Date(entry.startedDateTime).getTime();
    if (!Number.isNaN(t)) startedAt = t;
  }

  // Determine resource type (XHR / Fetch)
  const resourceType = entry._resourceType?.toLowerCase();
  const isXhrOrFetch =
    resourceType === 'xhr' ||
    resourceType === 'fetch' ||
    requestHeaders['x-requested-with']?.toLowerCase() === 'xmlhttprequest' ||
    requestHeaders['sec-fetch-mode']?.toLowerCase() === 'cors';

  // Extract mimeType
  const mimeType =
    content?.mimeType ||
    responseHeaders['content-type']?.split(';')[0]?.trim().toLowerCase();

  return {
    id,
    method,
    url: entry.request.url,
    origin,
    path,
    query,
    status: entry.response.status,
    statusText: entry.response.statusText,
    startedAt,
    duration: entry.time >= 0 ? Math.round(entry.time) : undefined,
    timings,
    requestHeaders,
    responseHeaders,
    requestBody,
    responseBody,
    mimeType,
    redactedKeys: [],
    isXhrOrFetch,
  };
}
