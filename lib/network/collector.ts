import type { HarEntry } from '@/types/network';
import { getContent } from './get-content';
import { normalizeRequest } from './normalize-request';
import { redactSecrets, type RedactResult } from '@/lib/security/redact-secrets';

export type RequestCallback = (result: RedactResult) => void;
export type NavigationCallback = (url: string) => void;

export interface DevToolsCollector {
  start: () => void;
  stop: () => void;
  onRequest: (cb: RequestCallback) => void;
  onNavigate: (cb: NavigationCallback) => void;
}

/**
 * Creates a DevTools network collector connecting to chrome.devtools.network.
 */
export function createDevToolsCollector(options: {
  getCustomKeys?: () => string[];
  maxResponseSize?: number;
} = {}): DevToolsCollector {
  const requestCallbacks: Set<RequestCallback> = new Set();
  const navigationCallbacks: Set<NavigationCallback> = new Set();
  let listening = false;

  const handleRequestFinished = async (harEntry: unknown) => {
    const entry = harEntry as HarEntry;
    if (!entry?.request?.url) return;

    try {
      // 1. Fetch content using cross-platform wrapper
      const contentResult = await getContent(entry);

      // 2. Normalize HAR entry to standard NetworkRecord
      const normalized = normalizeRequest(entry, {
        maxResponseSize: options.maxResponseSize,
        responseBodyContent: contentResult,
      });

      // 3. Pre-store redaction: redact before entering store
      const customKeys = options.getCustomKeys ? options.getCustomKeys() : [];
      const redactResult = redactSecrets(normalized, customKeys);

      // 4. Notify listeners
      for (const cb of requestCallbacks) {
        cb(redactResult);
      }
    } catch (err) {
      console.error('[DevTrace] Failed processing finished request:', err);
    }
  };

  const handleNavigated = (url: string) => {
    for (const cb of navigationCallbacks) {
      cb(url);
    }
  };

  return {
    start() {
      if (listening) return;
      if (typeof chrome !== 'undefined' && chrome.devtools?.network) {
        chrome.devtools.network.onRequestFinished.addListener(handleRequestFinished);
        chrome.devtools.network.onNavigated.addListener(handleNavigated);
        listening = true;
      }
    },
    stop() {
      if (!listening) return;
      if (typeof chrome !== 'undefined' && chrome.devtools?.network) {
        chrome.devtools.network.onRequestFinished.removeListener(handleRequestFinished);
        chrome.devtools.network.onNavigated.removeListener(handleNavigated);
        listening = false;
      }
    },
    onRequest(cb: RequestCallback) {
      requestCallbacks.add(cb);
    },
    onNavigate(cb: NavigationCallback) {
      navigationCallbacks.add(cb);
    },
  };
}
