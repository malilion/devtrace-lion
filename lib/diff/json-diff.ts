import type { DiffEntry, DiffSummary, DiffType } from '@/types/diff';

export interface DiffResult {
  isJson: boolean;
  errorMessage?: string;
  summary: DiffSummary;
  formattedDiffText: string;
}

export interface RawDiffItem {
  type: DiffType;
  path: Array<string | number>;
  oldValue?: unknown;
  value?: unknown;
}

/**
 * Pure, zero-dependency recursive structural diff for JSON objects and arrays.
 * Compares two objects/arrays and generates list of CREATE, REMOVE, and CHANGE differences.
 */
export function diffJsonObjects(
  obj1: unknown,
  obj2: unknown,
  basePath: Array<string | number> = []
): RawDiffItem[] {
  const diffs: RawDiffItem[] = [];

  // Primitive identity or null check
  if (obj1 === obj2) {
    return diffs;
  }

  // Type mismatch or one is not an object
  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null ||
    Array.isArray(obj1) !== Array.isArray(obj2)
  ) {
    diffs.push({
      type: 'CHANGE',
      path: basePath,
      oldValue: obj1,
      value: obj2,
    });
    return diffs;
  }

  // Handle Array comparison
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    const maxLen = Math.max(obj1.length, obj2.length);
    for (let i = 0; i < maxLen; i++) {
      const currentPath = [...basePath, i];
      if (i >= obj1.length) {
        diffs.push({
          type: 'CREATE',
          path: currentPath,
          value: obj2[i],
        });
      } else if (i >= obj2.length) {
        diffs.push({
          type: 'REMOVE',
          path: currentPath,
          oldValue: obj1[i],
        });
      } else {
        diffs.push(...diffJsonObjects(obj1[i], obj2[i], currentPath));
      }
    }
    return diffs;
  }

  // Handle Object comparison
  const o1 = obj1 as Record<string, unknown>;
  const o2 = obj2 as Record<string, unknown>;
  const keys1 = Object.keys(o1);
  const keys2 = Object.keys(o2);
  const allKeys = Array.from(new Set([...keys1, ...keys2]));

  for (const key of allKeys) {
    const currentPath = [...basePath, key];
    const hasKey1 = Object.prototype.hasOwnProperty.call(o1, key);
    const hasKey2 = Object.prototype.hasOwnProperty.call(o2, key);

    if (!hasKey1 && hasKey2) {
      diffs.push({
        type: 'CREATE',
        path: currentPath,
        value: o2[key],
      });
    } else if (hasKey1 && !hasKey2) {
      diffs.push({
        type: 'REMOVE',
        path: currentPath,
        oldValue: o1[key],
      });
    } else {
      diffs.push(...diffJsonObjects(o1[key], o2[key], currentPath));
    }
  }

  return diffs;
}

/**
 * Compares two JSON response strings and produces a structured diff.
 */
export function computeJsonDiff(
  jsonTextA: string | undefined,
  jsonTextB: string | undefined
): DiffResult {
  if (!jsonTextA || !jsonTextB) {
    return {
      isJson: false,
      errorMessage: 'One or both responses are missing content.',
      summary: { added: 0, removed: 0, changed: 0, entries: [] },
      formattedDiffText: '',
    };
  }

  let objA: unknown;
  let objB: unknown;

  try {
    objA = JSON.parse(jsonTextA);
  } catch {
    return {
      isJson: false,
      errorMessage: 'Base response is not valid JSON.',
      summary: { added: 0, removed: 0, changed: 0, entries: [] },
      formattedDiffText: '',
    };
  }

  try {
    objB = JSON.parse(jsonTextB);
  } catch {
    return {
      isJson: false,
      errorMessage: 'Compared response is not valid JSON.',
      summary: { added: 0, removed: 0, changed: 0, entries: [] },
      formattedDiffText: '',
    };
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return {
      isJson: false,
      errorMessage: 'JSON diff requires JSON objects or arrays.',
      summary: { added: 0, removed: 0, changed: 0, entries: [] },
      formattedDiffText: '',
    };
  }

  // Compute differences
  const rawDiffs = diffJsonObjects(objA, objB);

  const entries: DiffEntry[] = [];
  let added = 0;
  let removed = 0;
  let changed = 0;
  const lines: string[] = [];

  for (const item of rawDiffs) {
    const pathString = item.path.join('.');

    if (item.type === 'CREATE') {
      added++;
      entries.push({
        type: 'CREATE',
        path: item.path,
        pathString,
        value: item.value,
      });
      lines.push(`+ [${pathString}]: ${JSON.stringify(item.value)}`);
    } else if (item.type === 'REMOVE') {
      removed++;
      entries.push({
        type: 'REMOVE',
        path: item.path,
        pathString,
        oldValue: item.oldValue,
      });
      lines.push(`- [${pathString}]: ${JSON.stringify(item.oldValue)}`);
    } else if (item.type === 'CHANGE') {
      changed++;
      entries.push({
        type: 'CHANGE',
        path: item.path,
        pathString,
        oldValue: item.oldValue,
        value: item.value,
      });
      lines.push(`~ [${pathString}]:`);
      lines.push(`  - ${JSON.stringify(item.oldValue)}`);
      lines.push(`  + ${JSON.stringify(item.value)}`);
    }
  }

  return {
    isJson: true,
    summary: {
      added,
      removed,
      changed,
      entries,
    },
    formattedDiffText: lines.length > 0 ? lines.join('\n') : 'No differences found. Responses are identical.',
  };
}
