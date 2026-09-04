export type InsightSeverity = 'info' | 'warning' | 'error';

export interface StatusInsight {
  code: number | string;
  title: string;
  message: string;
  severity: InsightSeverity;
  recommendations: string[];
}
