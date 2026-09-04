export type DiffType = 'CREATE' | 'REMOVE' | 'CHANGE';

export interface DiffEntry {
  type: DiffType;
  path: Array<string | number>;
  pathString: string;
  oldValue?: unknown;
  value?: unknown;
}

export interface DiffSummary {
  added: number;
  removed: number;
  changed: number;
  entries: DiffEntry[];
}
