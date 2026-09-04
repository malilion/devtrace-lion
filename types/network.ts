export interface TimingBreakdown {
  blocked?: number;
  dns?: number;
  connect?: number;
  send?: number;
  wait?: number; // TTFB (Time to First Byte)
  receive?: number;
  ssl?: number;
}

export interface RequestBodyPayload {
  text?: string;
  mimeType?: string;
  /** postData does not exist or is truncated/binary when captured is false */
  captured: boolean;
}

export interface ResponseBodyPayload {
  text?: string;
  encoding?: 'base64';
  size?: number;
  captured: boolean;
  isTruncated?: boolean;
}

export interface NetworkRecord {
  id: string;
  method: string;
  url: string;
  /** Parsed origin for display and filtering (e.g. https://api.example.com) */
  origin: string;
  /** Parsed path without query string (e.g. /v1/users) */
  path: string;
  /** Parsed query parameters */
  query: Record<string, string>;
  status?: number;
  statusText?: string;
  startedAt: number;
  duration?: number;
  timings?: TimingBreakdown;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody?: RequestBodyPayload;
  responseBody?: ResponseBodyPayload;
  mimeType?: string;
  /** Redacted keys list for UI notification e.g. "3 secrets redacted" */
  redactedKeys: string[];
  /** Whether the request is XHR or Fetch */
  isXhrOrFetch?: boolean;
}

export type HttpMethodFilter = 'ALL' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type HttpStatusClassFilter = 'ALL' | '2xx' | '3xx' | '4xx' | '5xx' | 'ERR';
export type ResourceTypeFilter = 'ALL' | 'FETCH_XHR';

export interface FilterState {
  searchQuery: string;
  method: HttpMethodFilter;
  statusClass: HttpStatusClassFilter;
  resourceType: ResourceTypeFilter;
}

/** Standard HAR 1.2 Entry interface subset used for ingestion */
export interface HarEntry {
  startedDateTime: string;
  time: number;
  request: {
    method: string;
    url: string;
    httpVersion?: string;
    headers: Array<{ name: string; value: string }>;
    queryString?: Array<{ name: string; value: string }>;
    postData?: {
      mimeType: string;
      text?: string;
      params?: Array<{ name: string; value?: string }>;
    };
    headersSize?: number;
    bodySize?: number;
  };
  response: {
    status: number;
    statusText: string;
    httpVersion?: string;
    headers: Array<{ name: string; value: string }>;
    content?: {
      size?: number;
      mimeType?: string;
      text?: string;
      encoding?: string;
    };
    headersSize?: number;
    bodySize?: number;
  };
  timings?: {
    blocked?: number;
    dns?: number;
    connect?: number;
    send?: number;
    wait?: number;
    receive?: number;
    ssl?: number;
  };
  _resourceType?: string;
  getContent?: (
    callback?: (content: string, encoding: string) => void
  ) => Promise<unknown> | void;
}
