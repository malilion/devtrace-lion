import type { NetworkRecord } from '@/types/network';
import { redactSecrets } from '@/types/../lib/security/redact-secrets';

export interface DebugBundleManifest {
  tool: string;
  version: string;
  exportedAt: string;
  recordCount: number;
  allRedactedKeys: string[];
  privacyGuarantee: string;
}

export interface SanitizedDebugBundle {
  manifest: DebugBundleManifest;
  records: NetworkRecord[];
}

/**
 * Creates a sanitized, exportable debug bundle.
 * Ensures an extra pass of secret redaction so no sensitive tokens are ever exported.
 */
export function createSanitizedDebugBundle(
  records: NetworkRecord[],
  customKeys: string[] = []
): SanitizedDebugBundle {
  const allRedactedKeys = new Set<string>();
  const sanitizedRecords: NetworkRecord[] = [];

  for (const rec of records) {
    // Fail-safe second redaction pass before export
    const { record: safeRec } = redactSecrets(rec, customKeys);
    safeRec.redactedKeys.forEach((k) => allRedactedKeys.add(k));
    sanitizedRecords.push(safeRec);
  }

  const manifest: DebugBundleManifest = {
    tool: 'DevTrace Lion',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    recordCount: sanitizedRecords.length,
    allRedactedKeys: Array.from(allRedactedKeys),
    privacyGuarantee: 'All authorization credentials, cookies, API keys, and sensitive tokens have been redacted locally before export.',
  };

  return {
    manifest,
    records: sanitizedRecords,
  };
}

/**
 * Initiates browser download of sanitized JSON debug bundle.
 */
export function downloadDebugBundle(bundle: SanitizedDebugBundle, filename = 'devtrace-debug-bundle.json'): void {
  const jsonStr = JSON.stringify(bundle, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
