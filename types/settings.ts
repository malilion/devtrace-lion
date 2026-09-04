export interface UserSettings {
  /** Whether to preserve log across page navigation */
  preserveLog: boolean;
  /** Custom secret header / JSON keys to redact */
  customRedactedKeys: string[];
  /** Theme preference: 'system' | 'light' | 'dark' */
  theme: 'system' | 'light' | 'dark';
  /** Max response preview size before truncation (in bytes, default 1MB) */
  maxResponseSize: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  preserveLog: false,
  customRedactedKeys: [],
  theme: 'system',
  maxResponseSize: 1024 * 1024, // 1MB
};
