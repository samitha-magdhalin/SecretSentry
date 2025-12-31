
export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
  private: boolean;
  updated_at: string;
}

export interface GithubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string;
}

export enum Severity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface SecretFinding {
  id: string;
  file: string;
  line: number;
  type: string;
  snippet: string;
  severity: Severity;
  explanation: string;
  suggestion: string;
  // New enriched fields
  commitHash?: string;
  authorName?: string;
  commitDate?: string;
  daysExposed?: number;
  isHistoryOnly?: boolean;
  redactedSecret?: string;
}

export interface ScanResult {
  repoName: string;
  findings: SecretFinding[];
  timestamp: string;
  scannedFilesCount: number;
  durationMs: number;
  avgTimePerFile?: number;
  peakMemoryMB?: number;
}
