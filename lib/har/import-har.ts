import type { HarEntry, NetworkRecord } from '@/types/network';
import { normalizeRequest } from '@/lib/network/normalize-request';
import { redactSecrets } from '@/lib/security/redact-secrets';

export interface ImportHarResult {
  success: boolean;
  records: NetworkRecord[];
  error?: string;
}

/**
 * Parses raw HAR text or DevTrace debug bundle text into safe NetworkRecords.
 */
export function importHarContent(
  jsonText: string,
  customKeys: string[] = []
): ImportHarResult {
  try {
    const data = JSON.parse(jsonText);

    // Check if it's an existing DevTrace debug bundle
    if (data.manifest && Array.isArray(data.records)) {
      const records: NetworkRecord[] = [];
      for (const rec of data.records) {
        const { record: sanitized } = redactSecrets(rec, customKeys);
        records.push(sanitized);
      }
      return {
        success: true,
        records,
      };
    }

    // Check if standard HAR format
    const entries: HarEntry[] = data.log?.entries ?? (Array.isArray(data) ? data : []);

    if (!Array.isArray(entries) || entries.length === 0) {
      return {
        success: false,
        records: [],
        error: 'No valid HAR entries found in file.',
      };
    }

    const records: NetworkRecord[] = [];
    for (const entry of entries) {
      if (entry?.request?.url) {
        const normalized = normalizeRequest(entry);
        const { record: sanitized } = redactSecrets(normalized, customKeys);
        records.push(sanitized);
      }
    }

    return {
      success: true,
      records,
    };
  } catch (err) {
    return {
      success: false,
      records: [],
      error: err instanceof Error ? err.message : 'Invalid JSON file format.',
    };
  }
}
