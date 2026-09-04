/**
 * Unified getContent promisify wrapper.
 * Handles:
 * 1. Chrome 151+: Returns Promise resolving to { content?: string, encoding?: string }
 * 2. Firefox: Returns Promise resolving to [content, mimeType]
 * 3. Older Chrome: Uses callback `(body: string, encoding: string) => void`
 * 4. Error tolerance: Gracefully resolves with empty fallback on error/rejection.
 */

export interface ContentResult {
  body: string;
  encoding?: string;
}

export type HarRequest = {
  getContent?: (
    callback?: (content: string, encoding: string) => void
  ) => Promise<unknown> | void;
};

export function getContent(req: HarRequest): Promise<ContentResult> {
  if (!req || typeof req.getContent !== 'function') {
    return Promise.resolve({ body: '' });
  }

  try {
    const result = (req as { getContent: (cb?: unknown) => unknown }).getContent();

    if (result && typeof (result as Promise<unknown>).then === 'function') {
      return (result as Promise<unknown>)
        .then((value: unknown): ContentResult => {
          // Firefox resolves to [content, mimeType]
          if (Array.isArray(value)) {
            return {
              body: typeof value[0] === 'string' ? value[0] : '',
              encoding: undefined,
            };
          }

          // Chrome 151+ resolves to { content?: string, encoding?: string }
          if (value && typeof value === 'object') {
            const v = value as { content?: string; encoding?: string; body?: string };
            return {
              body: v.content ?? v.body ?? '',
              encoding: v.encoding,
            };
          }

          // Fallback if resolved to a string directly
          if (typeof value === 'string') {
            return { body: value };
          }

          return { body: '' };
        })
        .catch(() => {
          return { body: '' };
        });
    }

    // Older Chrome: callback pattern
    return new Promise<ContentResult>((resolve) => {
      try {
        (req as { getContent: (cb: (b: string, e: string) => void) => void }).getContent(
          (body: string, encoding: string) => {
            resolve({
              body: body ?? '',
              encoding: encoding || undefined,
            });
          }
        );
      } catch {
        resolve({ body: '' });
      }
    });
  } catch {
    return Promise.resolve({ body: '' });
  }
}
